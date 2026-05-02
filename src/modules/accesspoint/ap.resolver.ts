
import { prisma } from "../../services/prisma/prisma.client.js";

export const resolveAccessPoint = async (ssidIndex?: number, routerKey = "default") => {
  if (!ssidIndex) return null;

  const ap = await prisma.accessPoint.findUnique({
    where: {
      routerKey_ssidIndex: {
        routerKey,
        ssidIndex,
      },
    },
  });

  return ap?.id ?? null;
};
