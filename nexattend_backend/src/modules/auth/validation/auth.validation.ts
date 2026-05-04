import { z } from "zod";

export const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/;

export const registerSchema = z.object({
    email: z.email(),
    password: z
        .string()
        .regex(
            passwordRegex,
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        ),
    role: z.enum(["STUDENT", "ADMIN"]).default("STUDENT"),
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    phoneNo: z.string().trim().min(1, "Phone number is required"),
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1, "Password is required"),
});
