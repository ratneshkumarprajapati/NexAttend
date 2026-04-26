import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";

const optionalTrimmedString = z
  .string()
  .trim()
  .min(1, "Value cannot be empty");



export const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive("userId must be a positive integer"),
});
export const createProfileSchema = z.object({
  userId: z.number().int().positive("userId must be a positive integer"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  phoneNo: optionalTrimmedString.optional(),
  avatarUrl: optionalTrimmedString.optional(),
  department: optionalTrimmedString.optional(),
  enrolmentNo: optionalTrimmedString.optional(),
  year: z.number().int().positive("year must be a positive integer").optional(),
  preprationGoal: z.custom<Prisma.InputJsonValue>().optional(),
});

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").optional(),
    lastName: z.string().trim().min(1, "Last name is required").optional(),
    phoneNo: optionalTrimmedString.optional(),
    avatarUrl: optionalTrimmedString.optional(),
    department: optionalTrimmedString.optional(),
    enrolmentNo: optionalTrimmedString.optional(),
    year: z.number().int().positive("year must be a positive integer").optional(),
    preprationGoal: z.custom<Prisma.InputJsonValue>().optional(),
  })
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.phoneNo !== undefined ||
      data.avatarUrl !== undefined ||
      data.department !== undefined ||
      data.enrolmentNo !== undefined ||
      data.year !== undefined ||
      data.preprationGoal !== undefined,
    {
      message: "At least one field is required to update the profile",
    }
  );
