import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Singleton pattern to prevent connection exhaustion in serverless
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
