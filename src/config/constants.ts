export const NODE_ENVS = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export const PRISMA_LOG_LEVELS = ["query", "warn", "error"] as const;

export const DEFAULT_DB_ERROR_MESSAGE = "Database operation failed.";

export const DB_CONNECTION_MESSAGES = {
  CONNECTING: "Connecting to database...",
  CONNECTED: "Database connected successfully.",
  DISCONNECTED: "Database disconnected successfully.",
  CONNECTION_FAILED: "Failed to connect to database.",
} as const;

export const SHUTDOWN_SIGNALS = ["SIGINT", "SIGTERM"] as const;

export const CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
] as const;
