import bcrypt from "bcrypt";
import { Prisma } from "../../../generated/prisma/client.js";
import { userRepository } from "../repository/user.repository.js";
import type { BulkCreateStudentsInput, BulkStudentInput, CreateUserInput, UpdateUserInput } from "../types/user.types.js";
import { env } from "../../../config/env.js";
import { withActiveSpan } from "../../../instrumentation/otel.js";
import { createModuleLogger } from "../../../utils/logger.js";
import { AppError } from "../../../utils/appError.js";
import { hashMac } from "../../../utils/hash.util.js";

const logger = createModuleLogger("UserService");
const SALT_ROUNDS = Number(env.SECURITY.HASH_SALT) || 10;

const isPrismaKnownError = (
    error: unknown
): error is Prisma.PrismaClientKnownRequestError =>
    error instanceof Prisma.PrismaClientKnownRequestError;

const assertUniqueValues = (values: string[], label: string) => {
    const seen = new Set<string>();

    for (const value of values) {
        const key = value.toLowerCase();

        if (seen.has(key)) {
            throw new AppError(`Duplicate ${label} in bulk payload: ${value}`, 400);
        }

        seen.add(key);
    }
};

const getStudentDevices = (student: BulkStudentInput) => {
    const devices = [...(student.devices ?? [])];

    if (student.macAddress) {
        devices.unshift({
            deviceName: student.deviceName,
            macAddress: student.macAddress,
        });
    }

    return devices
        .filter((device) => device.macAddress || device.phoneNo)
        .map((device) => ({
            deviceName: device.deviceName?.trim() || null,
            hashedMac: device.macAddress ? hashMac(device.macAddress.trim()) : null,
            phoneNo: device.phoneNo?.trim() || student.phoneNo?.trim() || null,
        }));
};

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

                    logger.info(`User created successfully with id: ${user.id}`);

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

    async getUser(id: string) {
        logger.info(`Fetching user with id: ${id}`);
        const user = await userRepository.findById(id);

        if (!user) {
            logger.warn(`User not found for id: ${id}`);
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

    async updateUser(id: string, data: UpdateUserInput) {
        logger.info(`Updating user with id: ${id}`);
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

        const user = await userRepository.update(id, updateData);

        if (!user) {
            logger.warn(`User update failed because user was not found: ${id}`);
            throw new AppError("User not found", 404);
        }

        logger.info(`User updated successfully with id: ${id}`);
        return user;
    },

    async deleteUser(id: string) {
        logger.info(`Soft deleting user with id: ${id}`);
        const deletedUser = await userRepository.delete(id);

        if (!deletedUser) {
            logger.warn(`User delete failed because user was not found: ${id}`);
            throw new AppError("User not found", 404);
        }

        logger.info(`User soft deleted successfully with id: ${id}`);
        return deletedUser;
    },

    async createBulkStudents(data: BulkCreateStudentsInput) {
        return withActiveSpan(
            "user.bulk_create_students",
            {
                "user.bulk_count": data.students.length,
            },
            async () => {
                logger.info(`Creating ${data.students.length} students in bulk`);

                assertUniqueValues(
                    data.students.map((student) => student.email),
                    "email"
                );

                assertUniqueValues(
                    data.students
                        .map((student) => student.enrolmentNo)
                        .filter((value): value is string => Boolean(value)),
                    "enrolment number"
                );

                const studentsWithHashedPasswords = await Promise.all(
                    data.students.map(async (student) => {
                        const devices = getStudentDevices(student);

                        assertUniqueValues(
                            devices
                                .map((device) => device.hashedMac)
                                .filter((value): value is string => Boolean(value)),
                            "device MAC for student"
                        );

                        const profile: {
                            firstName: string;
                            lastName: string;
                            phoneNo: string | null;
                            department: string | null;
                            enrolmentNo: string | null;
                            year: number | null;
                            preprationGoal?: Prisma.InputJsonValue;
                        } = {
                            firstName: student.firstName.trim(),
                            lastName: student.lastName.trim(),
                            phoneNo: student.phoneNo?.trim() || null,
                            department: student.department?.trim() || null,
                            enrolmentNo: student.enrolmentNo?.trim() || null,
                            year: student.year ?? null,
                        };

                        if (student.preprationGoal !== undefined) {
                            profile.preprationGoal = student.preprationGoal as Prisma.InputJsonValue;
                        }

                        return {
                            email: student.email.trim().toLowerCase(),
                            password: await bcrypt.hash(student.password, SALT_ROUNDS),
                            profile,
                            devices,
                        };
                    })
                );

                assertUniqueValues(
                    studentsWithHashedPasswords.flatMap((student) =>
                        student.devices.map((device) => device.hashedMac)
                            .filter((value): value is string => Boolean(value))
                    ),
                    "device MAC"
                );

                try {
                    const users = await userRepository.createBulkStudents(
                        studentsWithHashedPasswords
                    );

                    logger.info(`Created ${users.length} students in bulk`);
                    return users;
                } catch (error) {
                    if (isPrismaKnownError(error) && error.code === "P2002") {
                        throw new AppError(
                            "Bulk student creation failed because email, enrolment number, or device already exists",
                            409
                        );
                    }

                    throw error;
                }
            }
        );
    },
};
