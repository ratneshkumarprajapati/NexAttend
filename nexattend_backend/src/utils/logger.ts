import winston from "winston";
import { env } from "../config/env.js";
import { NODE_ENVS } from "../config/constants.js";

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: time, stack }) => {
  return stack
    ? `${time} [${level}] ${message}\n${stack}`
    : `${time} [${level}] ${message}`;
});

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

export default logger;

