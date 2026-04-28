import type { Request, Response } from "express";
import { register } from "node:module";
import { registerDeviceSchema } from "./device.validation.js";
import type { AuthenticatedRequest } from "./device.types.js";
import { deviceService } from "./device.service.js";



export const deviceController={
    async register(req:Request,res:Response){
        try {
            const parsed = registerDeviceSchema.parse(req.body);
            const { userId } = (req as AuthenticatedRequest).user ?? {};
            const device=await deviceService.registerDevice(userId,parsed)
        } catch (error) {
            
        }
    }
}