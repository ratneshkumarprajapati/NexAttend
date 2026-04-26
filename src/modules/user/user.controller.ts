import type { Request, Response } from "express";
import { createUserSchema, updateUserSchema } from "./user.validation.js";
import { toUserResponseDto, toUserResponseDtoList } from "./user.dto.js";
import { userService } from "./user.service.js";
import {
    sendErrorResponse,
    sendSuccessResponse,
} from "../../utils/apiResponse.js";
import { handleError } from "../../utils/errorHandler.js";

export const userController = {
    async create(req: Request, res: Response) {
        try {
            const parsed = createUserSchema.parse(req.body);
            const user = await userService.createUser(parsed);
            return sendSuccessResponse(
                res,
                201,
                "User created successfully",
                toUserResponseDto(user)
            );
        } catch (error) {
            return handleError(res, error);
        }
    },

    async getAll(req: Request, res: Response) {
        try {
            const users = await userService.getUsers();
            return sendSuccessResponse(
                res,
                200,
                "Users fetched successfully",
                toUserResponseDtoList(users)
            );
        } catch (error) {
            return handleError(res, error);
        }
    },
    async getOne(req: Request, res: Response) {
        try {
            const publicId = req.params.id as string;

            if (!publicId) {
                return sendErrorResponse(res, 400, "publicId is required");
            }

            const user = await userService.getUser(publicId);

            return sendSuccessResponse(
                res,
                200,
                "User fetched successfully",
                toUserResponseDto(user)
            );
        } catch (error) {
            return handleError(res, error);
        }

    },
    async update(req: Request, res: Response) {
        try {
            const publicId = req.params.id as string;

            if (!publicId) {
                return sendErrorResponse(res, 400, "publicId is required");
            }

            const parsed = updateUserSchema.parse(req.body);

            const user = await userService.updateUser(publicId, parsed);

            return sendSuccessResponse(
                res,
                200,
                "User updated successfully",
                toUserResponseDto(user)
            );
        } catch (error) {
            return handleError(res, error);
        }
    },

    async delete(req: Request, res: Response) {
        try {
            const publicId = req.params.id as string;

            if (!publicId) {
                return sendErrorResponse(res, 400, "publicId is required");
            }

            await userService.deleteUser(publicId);

            return sendSuccessResponse(res, 200, "User deleted successfully");
        } catch (error) {
            return handleError(res, error);
        }
    },

}
