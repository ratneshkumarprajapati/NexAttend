import { prisma } from "../../../services/prisma/prisma.client.js";
import type { Prisma } from "../../../generated/prisma/client.js";

type BulkStudentCreateData = {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    phoneNo?: string | null;
    department?: string | null;
    enrolmentNo?: string | null;
    year?: number | null;
    preprationGoal?: Prisma.InputJsonValue;
  };
  devices: Array<{
    deviceName?: string | null;
    hashedMac: string;
  }>;
};

export const userRepository = {
  create: (data: any) =>
    prisma.user.create({
      data,
      include: { profile: true },
    }),

  findByEmail: (email: string) =>
    prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: { profile: true },
    }),

  findByPublicId: (publicId: string) =>
    prisma.user.findFirst({
      where: {
        publicId,
        deletedAt: null,
      },
      include: { profile: true },
    }),

  findAll: () =>
    prisma.user.findMany({
      where: { deletedAt: null },
      include: { profile: true },
    }),

  update: async (publicId: string, data: any) => {
    const user = await prisma.user.findFirst({
      where: {
        publicId,
        deletedAt: null,
      },
      select: { publicId: true },
    });

    if (!user) {
      return null;
    }

    return prisma.user.update({
      where: { publicId },
      data,
    });
  },

  delete: async (publicId: string) => {
    const deletedAt = new Date();
    const result = await prisma.user.updateMany({
      where: {
        publicId,
        deletedAt: null,
      },
      data: { deletedAt },
    });

    if (result.count === 0) {
      return null;
    }

    return { publicId, deletedAt };
  },

  createBulkStudents: async (students: BulkStudentCreateData[]) =>
    prisma.$transaction(
      async (tx) => {
        const createdUsers = [];

        for (const student of students) {
          const createdUser = await tx.user.create({
            data: {
              email: student.email,
              password: student.password,
              role: "STUDENT",
              profile: {
                create: student.profile,
              },
              devices: {
                create: student.devices,
              },
            },
            include: {
              profile: true,
              devices: true,
            },
          });

          createdUsers.push(createdUser);
        }

        return createdUsers;
      },
      {
        maxWait: 15_000,
        timeout: 30_000,
      }
    ),
};
