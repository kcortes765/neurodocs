import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || ''
  const isVercel = Boolean(process.env.VERCEL)

  if (isVercel && databaseUrl.startsWith('file:')) {
    throw new Error(
      '[DB] SQLite file URLs are not supported on Vercel. Use libsql:// (Turso) or another hosted DB.'
    )
  }

  // Si es URL de Turso (libsql://)
  if (databaseUrl.includes('turso.io') || databaseUrl.startsWith('libsql://')) {
    // Extraer URL base y token
    const [baseUrl, queryString] = databaseUrl.split('?')
    let authToken = ''

    if (queryString) {
      const params = queryString.split('&')
      for (const param of params) {
        if (param.startsWith('authToken=')) {
          authToken = param.substring(10)
          break
        }
      }
    }

    if (!authToken) {
      authToken =
        process.env.DATABASE_AUTH_TOKEN ||
        process.env.TURSO_AUTH_TOKEN ||
        ''
    }

    if (!authToken) {
      console.warn('[DB] Missing libsql auth token. Set DATABASE_AUTH_TOKEN or add ?authToken= to DATABASE_URL.')
    }

    console.log('[DB] Usando Turso:', baseUrl)

    const libsql = createClient({
      url: baseUrl,
      authToken: authToken,
    })
    const adapter = new PrismaLibSQL(libsql)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ adapter } as any)
  }

  // SQLite local
  console.log('[DB] Usando SQLite local')
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
