import type { Request, Response } from "express";
import { accessPointService } from "../service/accesspoint.service.js";
import {
  accessPointIdParamSchema,
  createAccessPointSchema,
  updateAccessPointSchema,
} from "../validation/accesspoint.validation.js";
import { sendSuccessResponse } from "../../../utils/apiResponse.js";
import { handleError } from "../../../utils/errorHandler.js";


export const accessPointController = {
  create: async (req: Request, res: Response) => {
    try {
      const parsed = createAccessPointSchema.parse(req.body);
      const ap = await accessPointService.createAccessPoint(parsed);

      return sendSuccessResponse(
        res,
        201,
        "Access point created successfully",
        ap,
      );
    } catch (error) {
      return handleError(res, error);
    }
  },

  getAll: async (_: Request, res: Response) => {
    try {
      const aps = await accessPointService.getAllAccessPoints();

      return sendSuccessResponse(
        res,
        200,
        "Access points fetched successfully",
        aps,
      );
    } catch (error) {
      return handleError(res, error);
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const { id } = accessPointIdParamSchema.parse(req.params);
      const ap = await accessPointService.getAccessPointById(id);

      return sendSuccessResponse(
        res,
        200,
        "Access point fetched successfully",
        ap,
      );
    } catch (error) {
      return handleError(res, error);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = accessPointIdParamSchema.parse(req.params);
      const parsed = updateAccessPointSchema.parse(req.body);
      const ap = await accessPointService.updateAccessPoint(id, parsed);

      return sendSuccessResponse(
        res,
        200,
        "Access point updated successfully",
        ap,
      );
    } catch (error) {
      return handleError(res, error);
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = accessPointIdParamSchema.parse(req.params);
      await accessPointService.deleteAccessPoint(id);

      return sendSuccessResponse(res, 200, "Access point deleted successfully");
    } catch (error) {
      return handleError(res, error);
    }
  },
};
