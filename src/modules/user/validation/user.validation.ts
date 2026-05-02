import { z } from "zod";

export const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/;

const createUserProfileSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    phoneNo: z.string().trim().min(1, "Phone number is required").optional(),
});

export const createUserSchema = z.object({
    email: z.email(),
    password: z
        .string()
        .regex(
            passwordRegex,
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        ),
    role: z.enum(["STUDENT", "ADMIN"]).default("STUDENT"),
    profile: createUserProfileSchema.optional(),
});

export const updateUserSchema = z
    .object({
        email: z.email().optional(),
        password: z
            .string()
            .regex(
                passwordRegex,
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            )
            .optional(),
        role: z.enum(["STUDENT", "ADMIN"]).optional(),
    })
    .refine(
        (data) =>
            data.email !== undefined ||
            data.password !== undefined ||
            data.role !== undefined,
        {
            message: "At least one field is required to update the user",
        }
    );
