
import { prisma } from "../../services/prisma/prisma.client.js";

export const resolveAccessPoint = async (ssidIndex?: number) => {
  if (!ssidIndex) return null;

  const ap = await prisma.accessPoint.findUnique({
    where: {
      ssidIndex 
    },
  });

  return ap?.id ?? null;
};