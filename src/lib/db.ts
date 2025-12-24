import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || ''

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
