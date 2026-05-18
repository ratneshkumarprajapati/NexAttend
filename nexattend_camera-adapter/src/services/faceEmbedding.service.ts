import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";
import type { AppConfig } from "../config/app.config.js";
import type { FaceDetectionService, ImageFrame } from "./faceDetection.service.js";
import { decodeImageFrame } from "./faceDetection.service.js";
import type { FaceEmbeddingRecord, FaceEmbeddingRepository } from "./faceEmbedding.repository.js";

type MobileNetModel = Awaited<ReturnType<typeof mobilenet.load>>;

export type FaceRegistrationInput = ImageFrame & {
  studentId: string;
  userId?: string | null;
  metadata?: Record<string, unknown>;
};

export type FaceSearchResult = {
  studentId: string;
  userId?: string | null;
  confidence: number;
  metadata?: Record<string, unknown>;
};

export class FaceEmbeddingService {
  private model: Promise<MobileNetModel> | null = null;

  constructor(
    private readonly config: AppConfig["embeddings"],
    private readonly faceDetector: FaceDetectionService,
    private readonly repository: FaceEmbeddingRepository,
  ) {}

  async registerFace(input: FaceRegistrationInput): Promise<{
    record: FaceEmbeddingRecord;
    facesDetected: number;
  }> {
    const faces = await this.faceDetector.detect(input);

    if (faces.length === 0) {
      throw new Error("No face detected in registration image");
    }

    const embedding = await this.generateEmbedding(input);
    const record = await this.repository.upsert({
      studentId: input.studentId,
      userId: input.userId ?? input.studentId,
      embedding: Array.from(embedding),
      metadata: input.metadata,
    });

    return { record, facesDetected: faces.length };
  }

  async search(frame: ImageFrame): Promise<FaceSearchResult | null> {
    const records = await this.repository.findAll();
    if (records.length === 0) return null;

    const probe = await this.generateEmbedding(frame);
    let best: { record: FaceEmbeddingRecord; similarity: number } | null = null;

    for (const record of records) {
      const similarity = cosineSimilarity(probe, Float32Array.from(record.embedding));
      if (!best || similarity > best.similarity) {
        best = { record, similarity };
      }
    }

    if (!best || best.similarity < this.config.minSimilarity) return null;

    return {
      studentId: best.record.studentId,
      userId: best.record.userId,
      confidence: Number(best.similarity.toFixed(4)),
      metadata: best.record.metadata,
    };
  }

  async findByStudentId(studentId: string): Promise<FaceEmbeddingRecord | null> {
    return this.repository.findByStudentId(studentId);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  private async generateEmbedding(frame: ImageFrame): Promise<Float32Array> {
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

  private loadModel(): Promise<MobileNetModel> {
    this.model ??= mobilenet.load({ version: 2, alpha: 1.0 });
    return this.model;
  }
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;
  const length = Math.min(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const left = a[index] ?? 0;
    const right = b[index] ?? 0;
    dot += left * right;
    aMagnitude += left * left;
    bMagnitude += right * right;
  }

  const denominator = Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude);
  return denominator === 0 ? 0 : dot / denominator;
}
