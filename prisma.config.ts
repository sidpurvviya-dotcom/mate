import 'dotenv/config'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    // Local dev: file:./prisma/mate.db
    // Production: libsql://... (Turso) — set DATABASE_URL in env
    url: process.env.DATABASE_URL ?? `file:${path.resolve('prisma', 'mate.db')}`,
  },
})
