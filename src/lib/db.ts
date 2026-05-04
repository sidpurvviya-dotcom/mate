import { PrismaClient } from '@prisma/client'
import path from 'node:path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  // Production: use Turso hosted libsql
  // In Prisma 7, PrismaLibSql is a factory — pass config object directly (not a libsql client)
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require('@prisma/adapter-libsql')
    const factory = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    return new PrismaClient({ adapter: factory } as any)
  }

  // Development: use local SQLite file with absolute path
  const dbPath = path.resolve(process.cwd(), 'prisma', 'mate.db')
  return new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } },
  } as any)
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

