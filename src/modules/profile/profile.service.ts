import { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../utils/appError.js";
import { profileRepository } from "./profile.repository.js";
import type { ICreateProfileInput, IUpdateInput } from "./profile.types.js";

const isPrismaKnownError = (
  error: unknown
): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError;

export const profileService = {
  async createProfile(data: ICreateProfileInput) {
    try {
      return await profileRepository.create(data);
    } catch (error: unknown) {
      if (isPrismaKnownError(error)) {
        if (error.code === "P2002") {
          throw new AppError("Profile already exists for this user", 409);
        }
        if (error.code === "P2003") {
          throw new AppError("User not found", 404);
        }
      }

      throw error;
    }
  },

  async getProfile(userId: number) {
    const profile = await profileRepository.findByUserId(userId);

    if (!profile) {
      throw new AppError("Profile not found", 404);
    }

    return profile;
  },

  async updateProfile(userId: number, data: IUpdateInput) {
    try {
      return await profileRepository.update(userId, data);
    } catch (error: unknown) {
      if (isPrismaKnownError(error) && error.code === "P2025") {
        throw new AppError("Profile not found", 404);
      }
      throw error;
    }
  },
};
