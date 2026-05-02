import prisma from "../../../services/prisma/prisma.client.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import type {
  CreateAccessPointInput,
  UpdateAccessPointInput,
} from "../types/accesspoint.types.js";

const toCreateData = (
  data: CreateAccessPointInput,
): Prisma.AccessPointUncheckedCreateInput => ({
  name: data.name,
  ...(data.location !== undefined ? { location: data.location } : {}),
  ...(data.ssidIndex !== undefined ? { ssidIndex: data.ssidIndex } : {}),
  ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
});

const toUpdateData = (
  data: UpdateAccessPointInput,
): Prisma.AccessPointUncheckedUpdateInput => ({
  ...(data.name !== undefined ? { name: data.name } : {}),
  ...(data.location !== undefined ? { location: data.location } : {}),
  ...(data.ssidIndex !== undefined ? { ssidIndex: data.ssidIndex } : {}),
  ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
});

export const accessPointRepository = {
  create: (data: CreateAccessPointInput) =>
    prisma.accessPoint.create({ data: toCreateData(data) }),

  upsertBySsidIndex: (ssidIndex: number, data: CreateAccessPointInput) =>
    prisma.accessPoint.upsert({
      where: { ssidIndex },
      create: toCreateData({
        ...data,
        ssidIndex,
      }),
      update: {
        isActive: true,
      },
    }),

  findAll: () =>
    prisma.accessPoint.findMany({
      orderBy: { createdAt: "desc" },
    }),

  findById: (id: number) =>
    prisma.accessPoint.findUnique({
      where: { id },
    }),

  update: (id: number, data: UpdateAccessPointInput) =>
    prisma.accessPoint.update({
      where: { id },
      data: toUpdateData(data),
    }),

  delete: (id: number) =>
    prisma.accessPoint.delete({
      where: { id },
    }),
};
