import bcrypt from "bcrypt";
import { userRepository } from "./user.repository.js";
import type { CreateUserInput, UpdateUserInput } from "./user.types.js";
import { env } from "../../config/env.js";
import logger from "../../utils/logger.js";

const SALT_ROUNDS = Number(env.SECURITY.HASH_SALT) || 10;

export const userService = {
    async createUser(data: CreateUserInput) {
        logger.info(`Creating user with email: ${data.email}`);
        const existing = await userRepository.findByEmail(data.email);

        if (existing) {
            logger.warn(`User creation blocked because email already exists: ${data.email}`);
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

        const user = await userRepository.create({
            ...data,
            password: hashedPassword,
        });

        logger.info(`User created successfully with publicId: ${user.publicId}`);

        return user;
    },

    async getUser(publicId: string) {
        logger.info(`Fetching user with publicId: ${publicId}`);
        const user = await userRepository.findByPublicId(publicId);

        if (!user) {
            logger.warn(`User not found for publicId: ${publicId}`);
            throw new Error("User not found");
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
            throw new Error("User not found");
        }

        logger.info(`User updated successfully with publicId: ${publicId}`);
        return user;
    },

    async deleteUser(publicId: string) {
        logger.info(`Soft deleting user with publicId: ${publicId}`);
        const deletedUser = await userRepository.delete(publicId);

        if (!deletedUser) {
            logger.warn(`User delete failed because user was not found: ${publicId}`);
            throw new Error("User not found");
        }

        logger.info(`User soft deleted successfully with publicId: ${publicId}`);
        return deletedUser;
    },
};
