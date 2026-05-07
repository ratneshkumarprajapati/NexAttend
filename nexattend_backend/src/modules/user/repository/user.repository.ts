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

  findById: (id: string) =>
    prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: { profile: true },
    }),

  findAll: () =>
    prisma.user.findMany({
      where: { deletedAt: null },
      include: { profile: true },
    }),

  update: async (id: string, data: any) => {
    const user = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!user) {
      return null;
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    const deletedAt = new Date();
    const result = await prisma.user.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: { deletedAt },
    });

    if (result.count === 0) {
      return null;
    }

    return { id, deletedAt };
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
