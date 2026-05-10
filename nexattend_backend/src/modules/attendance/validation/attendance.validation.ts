import { z } from "zod";

const optionalText = z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().optional(),
);

const optionalPositiveInt = (defaultValue: number, maxValue?: number) =>
    z.preprocess(
        (value) => (value === undefined || value === "" ? undefined : Number(value)),
        z
            .number()
            .int()
            .positive()
            .max(maxValue ?? Number.MAX_SAFE_INTEGER)
            .default(defaultValue),
    );

export const adminStudentAttendanceQuerySchema = z.object({
    date: z.iso.date().optional(),
    department: optionalText,
    search: optionalText,
    year: z.preprocess(
        (value) => (value === undefined || value === "" ? undefined : Number(value)),
        z.number().int().positive().optional(),
    ),
    status: z.enum(["ALL", "PRESENT", "ABSENT"]).default("ALL"),
    page: optionalPositiveInt(1),
    limit: optionalPositiveInt(25, 100),
});

export const studentAttendanceCalendarParamsSchema = z.object({
    studentId: z.string().min(1),
});

export const studentAttendanceCalendarQuerySchema = z.object({
    year: z.preprocess(
        (value) => Number(value),
        z.number().int().min(2000).max(2100),
    ),
    month: z.preprocess(
        (value) => Number(value),
        z.number().int().min(1).max(12),
    ),
});
