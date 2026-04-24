import { z } from "zod";

export const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/;

export const createUserSchema = z.object({
    email: z.email(),
    password: z
        .string()
        .regex(
            passwordRegex,
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        ),
    role: z.enum(["STUDENT", "ADMIN"]).default("STUDENT"),
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
