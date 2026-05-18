import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";
import axios from "axios";
import type { AppConfig } from "../config/app.config.js";
import { logger } from "../utils/logger.js";
import { decodeImageFrame, type ImageFrame } from "./faceDetection.service.js";
import type { EnrolledStudent, StudentEnrollmentService } from "./studentEnrollment.service.js";

type MobileNetModel = Awaited<ReturnType<typeof mobilenet.load>>;

type StudentEmbedding = {
  student: EnrolledStudent;
  embedding: Float32Array;
};

export type FaceMatchResult = {
  studentId: string;
  studentName: string;
  confidence: number;
  photoUrl: string;
};

export class FaceMatchService {
  private model: Promise<MobileNetModel> | null = null;
  private gallery: StudentEmbedding[] = [];
  private lastRefreshAt = 0;

  constructor(
    private readonly config: AppConfig["faceMatch"],
    private readonly enrollmentConfig: AppConfig["enrollment"],
    private readonly enrollmentService: StudentEnrollmentService,
  ) {}

  async match(frame: ImageFrame): Promise<FaceMatchResult | null> {
    if (!this.config.enabled) return null;

    await this.refreshIfNeeded();

    if (this.gallery.length === 0) {
      logger.warn("No enrolled student photos available for face matching", {
        context: "FaceMatchService",
      });
      return null;
    }

    const probe = await this.embedFrame(frame);
    let best: { item: StudentEmbedding; similarity: number } | null = null;

    for (const item of this.gallery) {
      const similarity = cosineSimilarity(probe, item.embedding);
      if (!best || similarity > best.similarity) {
        best = { item, similarity };
      }
    }

    if (!best || best.similarity < this.config.minSimilarity) {
      logger.info("No enrolled student matched current frame", {
        context: "FaceMatchService",
        bestSimilarity: best?.similarity ?? 0,
      });
      return null;
    }

    return {
      studentId: best.item.student.id,
      studentName: best.item.student.name,
      confidence: Number(best.similarity.toFixed(4)),
      photoUrl: best.item.student.photoUrl,
    };
  }

  async refreshGallery(): Promise<number> {
    const students = await this.enrollmentService.fetchStudents();
    const nextGallery: StudentEmbedding[] = [];

    for (const student of students) {
      try {
        const frame = await this.downloadStudentPhoto(student.photoUrl);
        nextGallery.push({
          student,
          embedding: await this.embedFrame(frame),
        });
      } catch (error) {
        logger.warn("Failed to index student photo", {
          context: "FaceMatchService",
          studentId: student.id,
          photoUrl: student.photoUrl,
          error,
        });
      }
    }

    this.gallery = nextGallery;
    this.lastRefreshAt = Date.now();

    logger.info("Student face gallery refreshed", {
      context: "FaceMatchService",
      count: this.gallery.length,
    });

    return this.gallery.length;
  }

  private async refreshIfNeeded(): Promise<void> {
    const expired =
      Date.now() - this.lastRefreshAt >= this.enrollmentConfig.refreshIntervalMs;

    if (this.gallery.length === 0 || expired) {
      await this.refreshGallery();
    }
  }

  private async embedFrame(frame: ImageFrame): Promise<Float32Array> {
    const image = decodeImageFrame(frame);
    const model = await this.loadModel();
    const input = tf.tensor3d(image.data, [image.height, image.width, 3], "int32");

    try {
      const embedding = model.infer(input, true);
      const data = await embedding.data();
      embedding.dispose();
      return Float32Array.from(data);
    } finally {
      input.dispose();
    }
  }

  private async downloadStudentPhoto(photoUrl: string): Promise<ImageFrame> {
    const { data, headers } = await axios.get<ArrayBuffer>(photoUrl, {
      responseType: "arraybuffer",
      headers: this.enrollmentConfig.apiToken
        ? { authorization: `Bearer ${this.enrollmentConfig.apiToken}` }
        : undefined,
    });
    const contentType = String(headers["content-type"] ?? "image/jpeg");
    const imageBase64 = Buffer.from(data).toString("base64");

    return {
      imageDataUrl: `data:${contentType};base64,${imageBase64}`,
    };
  }

  private loadModel(): Promise<MobileNetModel> {
    this.model ??= mobilenet.load({ version: 2, alpha: 1.0 });
    return this.model;
  }
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;

  for (let index = 0; index < a.length; index += 1) {
    const left = a[index] ?? 0;
    const right = b[index] ?? 0;
    dot += left * right;
    aMagnitude += left * left;
    bMagnitude += right * right;
  }

  const denominator = Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude);
  return denominator === 0 ? 0 : dot / denominator;
}
