import type { Response } from "express";

export interface ApiResponseDto<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export const sendSuccessResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
) => {
  const response: ApiResponseDto<T> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
) => {
  const response: ApiResponseDto = {
    success: false,
    message,
  };

  return res.status(statusCode).json(response);
};
