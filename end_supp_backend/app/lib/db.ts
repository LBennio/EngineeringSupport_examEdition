import { PrismaClient } from '@prisma/client';

/**
 * Prisma singleton
 * - In dev, Next.js hot-reloads can create multiple PrismaClient instances and
 *   exhaust DB connections.
 * - This pattern keeps exactly one instance per Node process.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        await prisma.$queryRaw`Select 1`;

        return true;
    } catch (error) {
        console.error('Database connection failed: ', error)
        return false;
    }
}