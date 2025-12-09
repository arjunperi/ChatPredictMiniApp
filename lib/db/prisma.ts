import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
})

// Cache Prisma client in serverless environments to prevent connection pool exhaustion
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

