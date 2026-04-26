import type { Request, Response } from "express";
import { sendSuccessResponse } from "../../utils/apiResponse.js";
import { handleError } from "../../utils/errorHandler.js";
import { profileService } from "./profile.service.js";
import { createProfileSchema, updateProfileSchema, userIdParamSchema } from "./profile.validation.js";

export const profileController = {
  async create(req: Request, res: Response) {
    try {
      const parsed = createProfileSchema.parse(req.body);
      const profile = await profileService.createProfile(parsed);

      return sendSuccessResponse(
        res,
        201,
        "Profile created successfully",
        profile
      );
    } catch (error: unknown) {
      return handleError(res, error);
    }
  },

  async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = userIdParamSchema.parse(req.params);
      const profile = await profileService.getProfile(userId);

      return sendSuccessResponse(
        res,
        200,
        "Profile fetched successfully",
        profile
      );
    } catch (error: unknown) {
      return handleError(res, error);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { userId } = userIdParamSchema.parse(req.params);
      const parsed = updateProfileSchema.parse(req.body);
      const profile = await profileService.updateProfile(userId, parsed);

      return sendSuccessResponse(
        res,
        200,
        "Profile updated successfully",
        profile
      );
    } catch (error: unknown) {
      return handleError(res, error);
    }
  },
};
