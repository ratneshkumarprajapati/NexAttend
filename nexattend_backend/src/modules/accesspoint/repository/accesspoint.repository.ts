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
  ...(data.routerKey !== undefined ? { routerKey: data.routerKey } : {}),
  ...(data.routerName !== undefined ? { routerName: data.routerName } : {}),
  ...(data.routerProvider !== undefined ? { routerProvider: data.routerProvider } : {}),
  ...(data.location !== undefined ? { location: data.location } : {}),
  ...(data.ssidIndex !== undefined ? { ssidIndex: data.ssidIndex } : {}),
  ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
});

const toUpdateData = (
  data: UpdateAccessPointInput,
): Prisma.AccessPointUncheckedUpdateInput => ({
  ...(data.name !== undefined ? { name: data.name } : {}),
  ...(data.routerKey !== undefined ? { routerKey: data.routerKey } : {}),
  ...(data.routerName !== undefined ? { routerName: data.routerName } : {}),
  ...(data.routerProvider !== undefined ? { routerProvider: data.routerProvider } : {}),
  ...(data.location !== undefined ? { location: data.location } : {}),
  ...(data.ssidIndex !== undefined ? { ssidIndex: data.ssidIndex } : {}),
  ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
});

export const accessPointRepository = {
  create: (data: CreateAccessPointInput) =>
    prisma.accessPoint.create({ data: toCreateData(data) }),

  upsertByRouterAndSsidIndex: (
    routerKey: string,
    ssidIndex: number,
    data: CreateAccessPointInput,
  ) =>
    prisma.accessPoint.upsert({
      where: {
        routerKey_ssidIndex: {
          routerKey,
          ssidIndex,
        },
      },
      create: toCreateData({
        ...data,
        routerKey,
        ssidIndex,
      }),
      update: {
        isActive: true,
        ...(data.routerName !== undefined ? { routerName: data.routerName } : {}),
        ...(data.routerProvider !== undefined ? { routerProvider: data.routerProvider } : {}),
      },
    }),

  findAll: () =>
    prisma.accessPoint.findMany({
      orderBy: { createdAt: "desc" },
    }),

  findById: (id: string) =>
    prisma.accessPoint.findUnique({
      where: { id },
    }),

  update: (id: string, data: UpdateAccessPointInput) =>
    prisma.accessPoint.update({
      where: { id },
      data: toUpdateData(data),
    }),

  delete: (id: string) =>
    prisma.accessPoint.delete({
      where: { id },
    }),
};
