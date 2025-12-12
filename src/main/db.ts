import { PrismaClient, Prisma } from '@prisma/client'
import { app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

// In production, use userData. In dev, use local file.
// Note: In a real production app, you need to ensure the DB file is created/migrated.
// For now, we point to the file location.
const dbUrl = is.dev
  ? process.env.DATABASE_URL || 'file:./dev.db'
  : `file:${join(app.getPath('userData'), 'dash-archive.db')}`

const logLevels: Prisma.LogLevel[] = is.dev ? ['query', 'info', 'warn', 'error'] : ['error']

export const prisma = new PrismaClient({
  datasourceUrl: dbUrl,
  log: logLevels
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any)
