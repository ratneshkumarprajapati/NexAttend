import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { AuthTokenPayload } from "./auth.types.js";
import { handleError } from "../../utils/errorHandler.js";


export const authMiddleware = (req:Request, res: Response, next: NextFunction) => {
    try {
        const token =
            req.headers.authorization?.split(" ")[1] ??
            req.cookies?.token ??
            req.body?.token;

        // No token found
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Token missing",
            })
        }

        const decodedToken = jwt.verify(token, env.SECURITY.JWT_SECRET) as AuthTokenPayload;
        req.user=decodedToken
        next();



    } catch (error) {
        return handleError(res,error)
    }
}