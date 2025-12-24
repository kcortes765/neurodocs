import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  // En producción (Vercel) usa Turso
  const url = process.env.DATABASE_URL || ''

  if (url.startsWith('libsql://') || url.startsWith('https://')) {
    // Extraer URL y token
    const urlObj = new URL(url)
    const authToken = urlObj.searchParams.get('authToken') || ''
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`

    const libsql = createClient({
      url: baseUrl,
      authToken: authToken,
    })
    const adapter = new PrismaLibSQL(libsql)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ adapter } as any)
  }

  // En desarrollo usa SQLite local
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
