import type { Request, Response } from "express";
import { registerDeviceSchema } from "../validation/device.validation.js";
import { deviceService } from "../service/device.service.js";
import { sendSuccessResponse } from "../../../utils/apiResponse.js";
import { handleError } from "../../../utils/errorHandler.js";



export const deviceController = {
    async register(req: Request, res: Response) {
        try {
            const parsed = registerDeviceSchema.parse(req.body);
            const  userId  = req.user?.userId as string;
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
