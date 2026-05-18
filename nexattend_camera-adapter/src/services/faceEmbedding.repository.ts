import type { Collection } from "mongodb";
import type { AppConfig } from "../config/app.config.js";
import { getMongoCollection } from "../config/mongodb.config.js";
import { logger } from "../utils/logger.js";

export type FaceEmbeddingRecord = {
  studentId: string;
  userId?: string | null;
  embedding: number[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export class FaceEmbeddingRepository {
  private readonly mongodbConfig: AppConfig["mongodb"];
  private readonly mongodbCollection: string;
  private collection: Collection<FaceEmbeddingRecord> | null = null;

  constructor(
    embeddingConfig: AppConfig["embeddings"],
    mongodbConfig: AppConfig["mongodb"],
  ) {
    this.mongodbConfig = mongodbConfig;
    this.mongodbCollection = embeddingConfig.mongodbCollection;
  }

  async upsert(
    record: Omit<FaceEmbeddingRecord, "createdAt" | "updatedAt">,
  ): Promise<FaceEmbeddingRecord> {
    const collection = await this.getMongoCollection();
    const now = new Date().toISOString();
    const existing = await collection.findOne(
      { studentId: record.studentId },
      { projection: { _id: 0, createdAt: 1 } },
    );
    const next: FaceEmbeddingRecord = {
      ...record,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await collection.updateOne(
      { studentId: record.studentId },
      { $set: next },
      { upsert: true },
    );

    return next;
  }

  async findAll(): Promise<FaceEmbeddingRecord[]> {
    const collection = await this.getMongoCollection();
    return collection.find({}, { projection: { _id: 0 } }).toArray();
  }

  async findByStudentId(studentId: string): Promise<FaceEmbeddingRecord | null> {
    const collection = await this.getMongoCollection();
    return collection.findOne({ studentId }, { projection: { _id: 0 } });
  }

  async count(): Promise<number> {
    const collection = await this.getMongoCollection();
    return collection.countDocuments();
  }

  private async getMongoCollection(): Promise<Collection<FaceEmbeddingRecord>> {
    if (this.collection) return this.collection;

    this.collection = await getMongoCollection<FaceEmbeddingRecord>(
      this.mongodbConfig,
      this.mongodbCollection,
    );
    await this.collection.createIndex({ studentId: 1 }, { unique: true });

    logger.info("MongoDB face embedding repository ready", {
      context: "FaceEmbeddingRepository",
      database: this.mongodbConfig.database,
      collection: this.mongodbCollection,
    });

    return this.collection;
  }
}
