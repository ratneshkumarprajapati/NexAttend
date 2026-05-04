import { z } from "zod";

export const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/;

const createUserProfileSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    phoneNo: z.string().trim().min(1, "Phone number is required").optional(),
});

const bulkStudentDeviceSchema = z.object({
    deviceName: z.string().trim().min(1, "Device name is required").optional(),
    macAddress: z.string().trim().min(1, "MAC address is required"),
});

const bulkStudentSchema = z
    .object({
        email: z.email().transform((email) => email.toLowerCase()),
        password: z
            .string()
            .regex(
                passwordRegex,
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            ),
        firstName: z.string().trim().min(1, "First name is required"),
        lastName: z.string().trim().min(1, "Last name is required"),
        phoneNo: z.string().trim().min(1, "Phone number is required").optional(),
        department: z.string().trim().min(1, "Department is required").optional(),
        enrolmentNo: z.string().trim().min(1, "Enrolment number is required").optional(),
        year: z.number().int().positive().optional(),
        preprationGoal: z.unknown().optional(),
        deviceName: z.string().trim().min(1, "Device name is required").optional(),
        macAddress: z.string().trim().min(1, "MAC address is required").optional(),
        devices: z.array(bulkStudentDeviceSchema).min(1).max(5).optional(),
    })
    .refine((data) => data.macAddress || data.devices?.length, {
        message: "At least one device is required",
        path: ["devices"],
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

export const bulkCreateStudentsSchema = z.object({
    students: z.array(bulkStudentSchema).min(1).max(500),
});
