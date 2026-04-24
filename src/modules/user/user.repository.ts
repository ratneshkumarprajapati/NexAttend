import { prisma } from "../../services/prisma/prisma.client.js";

export const userRepository = {
  create: (data: any) =>
    prisma.user.create({ data }),

  findByEmail: (email: string) =>
    prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
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
};
