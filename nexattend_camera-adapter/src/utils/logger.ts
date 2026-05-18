import type { NextFunction, Request, Response } from "express";
import winston from "winston";
import { loadEnv } from "../config/env.config.js";

loadEnv();

type LogMeta = Record<string, unknown> & {
  context?: string;
};

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
      const timestamp = String(info.timestamp);
      const level = String(info.level);
      const message = String(info.message);
      const data = normalizeLogData(info.data);
      const context = typeof data.context === "string" ? data.context : undefined;
      delete data.context;

      const contextPart = context ? ` [${context}]` : "";
      const dataPart = Object.keys(data).length > 0 ? ` ${JSON.stringify(data)}` : "";

      return `${timestamp} [${level}]${contextPart} ${message}${dataPart}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

export const logger = {
  info(message: string, meta?: LogMeta): void {
    winstonLogger.info(toLogEntry(message, meta));
  },

  warn(message: string, meta?: LogMeta): void {
    winstonLogger.warn(toLogEntry(message, meta));
  },

  error(message: string, meta?: LogMeta): void {
    winstonLogger.error(toLogEntry(message, meta));
  },

  debug(message: string, meta?: LogMeta): void {
    winstonLogger.debug(toLogEntry(message, meta));
  },
};

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = performance.now();

  res.on("finish", () => {
    logger.info("HTTP request completed", {
      context: "HTTP",
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: Math.round(performance.now() - startedAt),
      remoteAddress: req.ip,
    });
  });

  next();
}

function toLogEntry(message: string, meta?: LogMeta): LogMeta & { message: string } {
  return {
    message,
    data: meta ?? {},
  };
}

function normalizeLogData(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return serializeLogData(value) as Record<string, unknown>;
}

function serializeLogData(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.map(serializeLogData);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, serializeLogData(nestedValue)]),
    );
  }

  return value;
}
