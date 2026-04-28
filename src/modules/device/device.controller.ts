import type { Request, Response } from "express";
import { register } from "node:module";
import { registerDeviceSchema } from "./device.validation.js";
import type { AuthenticatedRequest } from "./device.types.js";
import { deviceService } from "./device.service.js";
import { sendSuccessResponse } from "../../utils/apiResponse.js";
import { handleError } from "../../utils/errorHandler.js";
import { success } from "zod";



export const deviceController = {
    async register(req: Request, res: Response) {
        try {
            const parsed = registerDeviceSchema.parse(req.body);
            const { userId } = (req as AuthenticatedRequest).user ?? {};
            const deviceRes = await deviceService.registerDevice(userId, parsed);
            return sendSuccessResponse(res, 201, "device added successfully", deviceRes);


        } catch (error) {
            return handleError(res, error)
        }
    },

    async getMyDevice(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(400).json({
                success: false,
                message: "something went wrong"
            })
            const device = await deviceService.getUserDevice(userId);
            return sendSuccessResponse(res, 200, "device found", device);

        } catch (error) {
            return handleError(res, error);
        }
    }
}