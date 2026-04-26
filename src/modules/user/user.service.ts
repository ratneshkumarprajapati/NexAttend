import bcrypt from "bcrypt";
import { Prisma } from "../../generated/prisma/client.js";
import { userRepository } from "./user.repository.js";
import type { CreateUserInput, UpdateUserInput } from "./user.types.js";
import { env } from "../../config/env.js";
import { withActiveSpan } from "../../instrumentation/otel.js";
import logger from "../../utils/logger.js";
import { AppError } from "../../utils/appError.js";

const SALT_ROUNDS = Number(env.SECURITY.HASH_SALT) || 10;

const isPrismaKnownError = (
    error: unknown
): error is Prisma.PrismaClientKnownRequestError =>
    error instanceof Prisma.PrismaClientKnownRequestError;

export const userService = {
    async createUser(data: CreateUserInput) {
        return withActiveSpan(
            "user.create",
            {
                "user.email": data.email,
                "user.role": data.role,
                "user.has_profile": Boolean(data.profile),
            },
            async () => {
                logger.info(`Creating user with email: ${data.email}`);

                const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
                try {
                    const user = await userRepository.create({
                        email: data.email,
                        password: hashedPassword,
                        role: data.role,
                        profile: data.profile
                            ? {
                                create: {
                                    firstName: data.profile.firstName.trim(),
                                    lastName: data.profile.lastName.trim(),
                                    phoneNo: data.profile.phoneNo?.trim() || null,
                                },
                            }
                            : undefined,
                    });

                    logger.info(`User created successfully with publicId: ${user.publicId}`);

                    return user;
                } catch (error) {
                    if (isPrismaKnownError(error) && error.code === "P2002") {
                        logger.warn(`User creation blocked because email already exists: ${data.email}`);
                        throw new AppError("User already exists", 409);
                    }

                    throw error;
                }
            }
        );
    },
    async getUserByEmail(email: string) {
        logger.info(`Fetching user with email: ${email}`);
        const user = await userRepository.findByEmail(email);

        if (!user) {
            logger.warn(`User not found for email: ${email}`);
            throw new AppError("User not found", 404);
        }

        return user;
    },

    async getUser(publicId: string) {
        logger.info(`Fetching user with publicId: ${publicId}`);
        const user = await userRepository.findByPublicId(publicId);

        if (!user) {
            logger.warn(`User not found for publicId: ${publicId}`);
            throw new AppError("User not found", 404);
        }

        return user;
    },

    async getUsers() {
        logger.info("Fetching all active users");
        const users = await userRepository.findAll();
        logger.info(`Fetched ${users.length} active users`);
        return users;
    },

    async updateUser(publicId: string, data: UpdateUserInput) {
        logger.info(`Updating user with publicId: ${publicId}`);
        const updateData: UpdateUserInput = {};

        if (data.email !== undefined) {
            updateData.email = data.email;
        }

        if (data.password !== undefined) {
            updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
        }

        if (data.role !== undefined) {
            updateData.role = data.role;
        }

        const user = await userRepository.update(publicId, updateData);

        if (!user) {
            logger.warn(`User update failed because user was not found: ${publicId}`);
            throw new AppError("User not found", 404);
        }

        logger.info(`User updated successfully with publicId: ${publicId}`);
        return user;
    },

    async deleteUser(publicId: string) {
        logger.info(`Soft deleting user with publicId: ${publicId}`);
        const deletedUser = await userRepository.delete(publicId);

        if (!deletedUser) {
            logger.warn(`User delete failed because user was not found: ${publicId}`);
            throw new AppError("User not found", 404);
        }

        logger.info(`User soft deleted successfully with publicId: ${publicId}`);
        return deletedUser;
    },
};
