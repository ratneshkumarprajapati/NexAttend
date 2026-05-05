import { mkdirSync } from "node:fs";
import path from "node:path";
import winston from "winston";
import { env } from "../config/env.js";
import { NODE_ENVS } from "../config/constants.js";

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: time, stack, module }) => {
  const moduleLabel = typeof module === "string" ? ` [${module}]` : "";

  return stack
    ? `${time} [${level}]${moduleLabel} ${message}\n${stack}`
    : `${time} [${level}]${moduleLabel} ${message}`;
});

const pad2 = (value: number) => value.toString().padStart(2, "0");

export const formatSystemLogDate = (date = new Date()) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const systemLogPathForDate = (date = new Date()) =>
  path.join(env.SYSTEM_LOG.DIRECTORY, `system-log-${formatSystemLogDate(date)}.log`);

const logger = winston.createLogger({
  level: env.NODE_ENV === NODE_ENVS.PRODUCTION ? "info" : "debug",
  defaultMeta: { service: env.APP_NAME },
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new winston.transports.Console({
      format:
        env.NODE_ENV === NODE_ENVS.PRODUCTION
          ? combine(timestamp(), errors({ stack: true }), json())
          : combine(
              colorize(),
              timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
              errors({ stack: true }),
              consoleFormat,
            ),
    }),
  ],
});

let systemLogTransport: winston.transport | null = null;

const createSystemLogTransport = (date = new Date()) => {
  mkdirSync(env.SYSTEM_LOG.DIRECTORY, { recursive: true });

  return new winston.transports.File({
    filename: systemLogPathForDate(date),
    format: combine(timestamp(), errors({ stack: true }), json()),
  });
};

export const rotateSystemLogFile = (date = new Date()) => {
  if (!env.SYSTEM_LOG.ENABLED) return;

  if (systemLogTransport) {
    logger.remove(systemLogTransport);
    systemLogTransport.close?.();
  }

  systemLogTransport = createSystemLogTransport(date);
  logger.add(systemLogTransport);
};

rotateSystemLogFile();

export const createModuleLogger = (moduleName: string) =>
  logger.child({ module: moduleName });

export default logger;
