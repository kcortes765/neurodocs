import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Lista miembros del equipo medico (opcional: rol, activo)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const rol = searchParams.get('rol') || undefined
    const activo = searchParams.get('activo')

    const where: { rol?: string; activo?: boolean } = {}
    if (rol) where.rol = rol
    if (activo === 'true') where.activo = true
    if (activo === 'false') where.activo = false

    const miembros = await prisma.equipoMedico.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({ data: miembros })
  } catch (error) {
    console.error('Error listando equipo medico:', error)
    return NextResponse.json(
      { error: 'Error listando equipo medico' },
      { status: 500 }
    )
  }
}

// POST: Crea miembro del equipo medico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, rut, rol, activo } = body

    if (!nombre || !rut || !rol) {
      return NextResponse.json(
        { error: 'nombre, rut y rol son requeridos' },
        { status: 400 }
      )
    }

    const miembro = await prisma.equipoMedico.create({
      data: {
        nombre,
        rut,
        rol,
        activo: typeof activo === 'boolean' ? activo : true,
      },
    })

    return NextResponse.json({ data: miembro }, { status: 201 })
  } catch (error) {
    console.error('Error creando equipo medico:', error)
    return NextResponse.json(
      { error: 'Error creando equipo medico' },
      { status: 500 }
    )
  }
}
