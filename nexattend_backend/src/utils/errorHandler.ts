import type { Response } from "express";
import { z } from "zod";
import { AppError } from "./appError.js";
import logger from "./logger.js";
import { sendErrorResponse } from "./apiResponse.js";

interface HandleErrorOptions {
  defaultMessage?: string;
  fallbackStatusCode?: number;
  logError?: boolean;
}

export const handleError = (
  res: Response,
  error: unknown,
  options: HandleErrorOptions = {}
) => {
  const {
    defaultMessage = "Something went wrong",
    fallbackStatusCode = 400,
    logError = true,
  } = options;

  if (logError) {
    logger.error(error);
  }

  if (error instanceof AppError) {
    return sendErrorResponse(res, error.statusCode, error.message);
  }

  if (error instanceof z.ZodError) {
    return sendErrorResponse(
      res,
      400,
      error.issues[0]?.message ?? "Invalid request"
    );
  }

  return sendErrorResponse(res, fallbackStatusCode, defaultMessage);
};
