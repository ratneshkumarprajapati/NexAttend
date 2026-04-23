import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { NODE_ENVS, PRISMA_LOG_LEVELS } from "../../config/constants.js";
import { env } from "../../config/env.js";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg(env.DATABASE_URL),
    log: [...PRISMA_LOG_LEVELS],
  });

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV === NODE_ENVS.DEVELOPMENT) {
  globalForPrisma.prisma = prisma;
}

export { prisma as db };
export default prisma;
