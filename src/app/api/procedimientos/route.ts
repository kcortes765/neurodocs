import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Lista procedimientos (filtro opcional por tipo o busqueda)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get('tipo') || undefined
    const q = searchParams.get('q') || undefined

    const where: {
      tipo?: string
      OR?: Array<{ codigoFonasa?: { contains: string; mode: 'insensitive' }; descripcion?: { contains: string; mode: 'insensitive' } }>
    } = {}

    if (tipo) where.tipo = tipo
    if (q) {
      where.OR = [
        { codigoFonasa: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
      ]
    }

    const procedimientos = await prisma.procedimiento.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { codigoFonasa: 'asc' },
    })

    return NextResponse.json({ data: procedimientos })
  } catch (error) {
    console.error('Error listando procedimientos:', error)
    return NextResponse.json(
      { error: 'Error listando procedimientos' },
      { status: 500 }
    )
  }
}

// POST: Crea procedimiento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codigoFonasa, descripcion, tipo, activo } = body

    if (!codigoFonasa || !descripcion) {
      return NextResponse.json(
        { error: 'codigoFonasa y descripcion son requeridos' },
        { status: 400 }
      )
    }

    const procedimiento = await prisma.procedimiento.create({
      data: {
        codigoFonasa,
        descripcion,
        tipo,
        activo: typeof activo === 'boolean' ? activo : true,
      },
    })

    return NextResponse.json({ data: procedimiento }, { status: 201 })
  } catch (error) {
    console.error('Error creando procedimiento:', error)
    return NextResponse.json(
      { error: 'Error creando procedimiento' },
      { status: 500 }
    )
  }
}
