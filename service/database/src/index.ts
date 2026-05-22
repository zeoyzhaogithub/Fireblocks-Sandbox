import { Prisma, PrismaClient } from "../prisma/generated/client.js";

export { Prisma, PrismaClient };

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.PRISMA_LOG_QUERY === "true" ? ["query", "warn", "error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma;
