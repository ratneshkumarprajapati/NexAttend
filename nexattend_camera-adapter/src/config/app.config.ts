import { z } from "zod";
import { loadEnv } from "./env.config.js";

loadEnv();

const QueueConfigSchema = z.object({
  enabled: z.boolean().default(true),
  url: z.string().default(""),
  exchange: z.string().default("nexattend.camera-sync"),
  recognitionRoutingKey: z.string().default("face.matched"),
  reconnectDelayMs: z.number().int().positive().default(5000),
});

export const AppConfigSchema = z.object({
  port: z.number().int().positive().default(5100),
  logLevel: z.string().default("info"),
  camera: z.object({
    id: z.string().min(1).default("default-camera"),
    name: z.string().min(1).default("Default Camera"),
    location: z.string().optional(),
    pollEnabled: z.boolean().default(false),
    pollIntervalMs: z.number().int().min(1000).default(5000),
  }),
  recognizer: z.object({
    url: z.string().default(""),
    timeoutMs: z.number().int().positive().default(5000),
    minConfidence: z.number().min(0).max(1).default(0.75),
  }),
  enrollment: z.object({
    backendBaseUrl: z.string().default("http://localhost:4000"),
    studentsPath: z.string().default("/api/v1/users"),
    apiToken: z.string().default(""),
    refreshIntervalMs: z.number().int().positive().default(300000),
  }),
  faceMatch: z.object({
    enabled: z.boolean().default(true),
    minSimilarity: z.number().min(0).max(1).default(0.82),
  }),
  mongodb: z.object({
    uri: z
      .string({
        required_error: "MONGODB_URI or FACE_MONGODB_URI is required",
        invalid_type_error: "MONGODB_URI or FACE_MONGODB_URI is required",
      })
      .min(1, "MONGODB_URI or FACE_MONGODB_URI is required"),
    database: z.string().default("nexattend_face_intelligence"),
  }),
  embeddings: z.object({
    minSimilarity: z.number().min(0).max(1).default(0.82),
    mongodbCollection: z.string().default("face_embeddings"),
  }),
  faceDetection: z.object({
    enabled: z.boolean().default(true),
    minProbability: z.number().min(0).max(1).default(0.85),
    maxFaces: z.number().int().positive().default(5),
  }),
  queue: QueueConfigSchema.default({}),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export function loadConfig(): AppConfig {
  loadEnv();
  const mongodbUri = process.env.MONGODB_URI || process.env.FACE_MONGODB_URI;

  return AppConfigSchema.parse({
    port: Number(process.env.PORT ?? 5100),
    logLevel: process.env.LOG_LEVEL ?? "info",
    camera: {
      id: process.env.CAMERA_ID ?? "default-camera",
      name: process.env.CAMERA_NAME ?? "Default Camera",
      location: process.env.CAMERA_LOCATION || undefined,
      pollEnabled: process.env.CAMERA_POLL_ENABLED === "true",
      pollIntervalMs: Number(process.env.CAMERA_POLL_INTERVAL_MS ?? 5000),
    },
    recognizer: {
      url: process.env.FACE_RECOGNITION_URL ?? "",
      timeoutMs: Number(process.env.FACE_RECOGNITION_TIMEOUT_MS ?? 5000),
      minConfidence: Number(process.env.FACE_RECOGNITION_MIN_CONFIDENCE ?? 0.75),
    },
    enrollment: {
      backendBaseUrl: process.env.BACKEND_BASE_URL ?? "http://localhost:4000",
      studentsPath: process.env.BACKEND_STUDENTS_PATH ?? "/api/v1/users",
      apiToken: process.env.BACKEND_API_TOKEN ?? "",
      refreshIntervalMs: Number(process.env.ENROLLMENT_REFRESH_INTERVAL_MS ?? 300000),
    },
    faceMatch: {
      enabled: process.env.FACE_MATCH_ENABLED !== "false",
      minSimilarity: Number(process.env.FACE_MATCH_MIN_SIMILARITY ?? 0.82),
    },
    mongodb: {
      uri: mongodbUri,
      database:
        process.env.MONGODB_DATABASE ||
        process.env.FACE_MONGODB_DATABASE ||
        "nexattend_face_intelligence",
    },
    embeddings: {
      minSimilarity: Number(process.env.FACE_EMBEDDING_MIN_SIMILARITY ?? 0.82),
      mongodbCollection:
        process.env.FACE_EMBEDDING_COLLECTION || "face_embeddings",
    },
    faceDetection: {
      enabled: process.env.FACE_DETECTION_ENABLED !== "false",
      minProbability: Number(process.env.FACE_DETECTION_MIN_PROBABILITY ?? 0.85),
      maxFaces: Number(process.env.FACE_DETECTION_MAX_FACES ?? 5),
    },
    queue: {
      enabled: process.env.CAMERA_SYNC_PUBLISH_ENABLED !== "false",
      url: process.env.CLOUDAMQP_URL || process.env.AMQP_URL || "",
      exchange: process.env.CAMERA_SYNC_EXCHANGE || "nexattend.camera-sync",
      recognitionRoutingKey:
        process.env.CAMERA_SYNC_RECOGNITION_ROUTING_KEY || "face.matched",
      reconnectDelayMs: Number(process.env.AMQP_RECONNECT_DELAY_MS ?? 5000),
    },
  });
}
