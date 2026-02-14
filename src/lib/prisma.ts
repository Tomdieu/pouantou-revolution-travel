import { PrismaClient } from "@prisma/client";
import { getAdapter } from "../../prisma.config";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const adapter = getAdapter();
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
