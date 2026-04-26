import type { Request, Response } from "express";
import { sendSuccessResponse } from "../../utils/apiResponse.js";
import { authService } from "./auth.service.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import { handleError } from "../../utils/errorHandler.js";

export const authController={
    async register(req:Request,res:Response){
        try {
            const {email,password,role,firstName,lastName,phoneNo}=req.body;
            const parseData={email,password,role,firstName,lastName,phoneNo}
            const parsedData=registerSchema.parse(parseData);
            const result = await authService.register(parsedData);
            return sendSuccessResponse(res, 201, "User registered successfully", result);
        } catch (error) {
            return handleError(res, error);
        }
    },

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const parsedData = loginSchema.parse({ email, password });
            const result = await authService.login(parsedData);
            return sendSuccessResponse(res, 200, "User logged in successfully", result);
        } catch (error) {
            return handleError(res, error);
        }
    }
}
