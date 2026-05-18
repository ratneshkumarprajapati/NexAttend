import type { AppConfig } from "../config/app.config.js";
import type { CameraRecognitionPublisher } from "../queue/cameraSync/cameraSync.types.js";
import { logger } from "../utils/logger.js";
import type { FaceDetectionService, ImageFrame } from "./faceDetection.service.js";
import type { FaceEmbeddingService, FaceRegistrationInput } from "./faceEmbedding.service.js";
import type { FaceMatchService } from "./faceMatch.service.js";
import type { FaceRecognitionService } from "./faceRecognition.service.js";

export class CameraService {
  private pollTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: AppConfig["camera"],
    private readonly faceDetector: FaceDetectionService,
    private readonly faceEmbeddings: FaceEmbeddingService,
    private readonly faceMatcher: FaceMatchService,
    private readonly recognizer: FaceRecognitionService,
    private readonly publisher: CameraRecognitionPublisher,
  ) {}

  start(): void {
    if (!this.config.pollEnabled) return;

    this.pollTimer = setInterval(() => {
      void this.captureAndPublish().catch((error) => {
        logger.error("Camera poll failed", { context: "CameraService", error });
      });
    }, this.config.pollIntervalMs);
  }

  stop(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  async detectFaces(frame: ImageFrame) {
    return this.faceDetector.detect(frame);
  }

  async refreshFaceGallery(): Promise<number> {
    return this.faceMatcher.refreshGallery();
  }

  async registerFace(input: FaceRegistrationInput) {
    const result = await this.faceEmbeddings.registerFace(input);

    return {
      studentId: result.record.studentId,
      userId: result.record.userId,
      facesDetected: result.facesDetected,
      embeddingsStored: await this.faceEmbeddings.count(),
      updatedAt: result.record.updatedAt,
    };
  }

  async recognizeFrame(frame: ImageFrame, publish = false): Promise<{
    facesDetected: number;
    match: {
      studentId: string;
      confidence: number;
    } | null;
    recognitionsPublished: number;
  }> {
    const faces = await this.faceDetector.detect(frame);
    if (faces.length === 0) {
      return { facesDetected: 0, match: null, recognitionsPublished: 0 };
    }

    const match = await this.faceEmbeddings.search(frame);
    if (!match) {
      return { facesDetected: faces.length, match: null, recognitionsPublished: 0 };
    }

    if (publish) {
      await this.publisher.publishRecognition({
        studentId: match.studentId,
        confidence: match.confidence,
        externalFaceId: "local-embedding-store",
        capturedAt: new Date().toISOString(),
      });
    }

    return {
      facesDetected: faces.length,
      match: {
        studentId: match.studentId,
        confidence: match.confidence,
      },
      recognitionsPublished: publish ? 1 : 0,
    };
  }

  async getRegisteredFace(studentId: string) {
    const record = await this.faceEmbeddings.findByStudentId(studentId);
    if (!record) return null;

    return {
      studentId: record.studentId,
      userId: record.userId,
      metadata: record.metadata,
      embeddingDimensions: record.embedding.length,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async captureAndPublish(frame: ImageFrame = {}): Promise<{
    facesDetected: number;
    recognitionsPublished: number;
    matchedStudentId?: string;
  }> {
    const faces = await this.faceDetector.detect(frame);

    if (faces.length === 0) {
      logger.info("No face detected in frame", { context: "CameraService" });
      return {
        facesDetected: 0,
        recognitionsPublished: 0,
      };
    }

    const storedMatch = await this.faceEmbeddings.search(frame);
    const localMatch = storedMatch ? null : await this.faceMatcher.match(frame);
    const recognitions = storedMatch
      ? [{
          studentId: storedMatch.studentId,
          confidence: storedMatch.confidence,
          externalFaceId: "local-embedding-store",
          capturedAt: new Date().toISOString(),
        }]
      : localMatch
      ? [{
          studentId: localMatch.studentId,
          confidence: localMatch.confidence,
          externalFaceId: localMatch.photoUrl,
          capturedAt: new Date().toISOString(),
        }]
      : await this.recognizer.recognize(frame);

    for (const recognition of recognitions) {
      await this.publisher.publishRecognition(recognition);
    }

    return {
      facesDetected: faces.length,
      recognitionsPublished: recognitions.length,
      matchedStudentId: storedMatch?.studentId ?? localMatch?.studentId,
    };
  }

  async publishManualRecognition(input: {
    studentId: string;
    confidence: number;
    externalFaceId?: string | null;
    frameId?: string | null;
    capturedAt?: string;
  }): Promise<void> {
    await this.publisher.publishRecognition({
      studentId: input.studentId,
      confidence: input.confidence,
      externalFaceId: input.externalFaceId ?? null,
      frameId: input.frameId ?? null,
      capturedAt: input.capturedAt ?? new Date().toISOString(),
    });
  }
}
