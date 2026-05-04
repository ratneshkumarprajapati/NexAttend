import {
  DB_CONNECTION_MESSAGES,
  SHUTDOWN_SIGNALS,
} from "./constants.js";
import prisma from "../services/prisma/prisma.client.js";
import type { PrismaClient } from "../generated/prisma/client.js";
import logger from "../utils/logger.js";

const globalForPrisma = globalThis as typeof globalThis & {
  prismaConnectionPromise: Promise<PrismaClient> | undefined;
  prismaShutdownHandlersRegistered?: boolean;
};

export const connectDB = async (): Promise<PrismaClient> => {
  if (globalForPrisma.prismaConnectionPromise) {
    return globalForPrisma.prismaConnectionPromise;
  }

  logger.info(DB_CONNECTION_MESSAGES.CONNECTING);

  globalForPrisma.prismaConnectionPromise = prisma
    .$connect()
    .then(() => {
      logger.info(DB_CONNECTION_MESSAGES.CONNECTED);
      return prisma;
    })
    .catch((error: unknown) => {
      globalForPrisma.prismaConnectionPromise = undefined;
      logger.error(DB_CONNECTION_MESSAGES.CONNECTION_FAILED, error);
      throw error;
    });

  return globalForPrisma.prismaConnectionPromise;
};

export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
  globalForPrisma.prismaConnectionPromise = undefined;
  logger.info(DB_CONNECTION_MESSAGES.DISCONNECTED);
};

export const registerDBShutdownHandlers = (): void => {
  if (globalForPrisma.prismaShutdownHandlersRegistered) {
    return;
  }

  for (const signal of SHUTDOWN_SIGNALS) {
    process.once(signal, async () => {
      await disconnectDB();
      process.exit(0);
    });
  }

  globalForPrisma.prismaShutdownHandlersRegistered = true;
};

// export { prisma as db };
// export default prisma;
