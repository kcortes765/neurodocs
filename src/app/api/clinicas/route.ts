import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Lista todas las clinicas
export async function GET() {
  try {
    const clinicas = await prisma.clinica.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({ data: clinicas })
  } catch (error) {
    console.error('Error al obtener clinicas:', error)
    return NextResponse.json(
      { error: 'Error al obtener clinicas' },
      { status: 500 }
    )
  }
}

// POST: Crea clinica nueva
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, direccion, logoUrl } = body

    if (!nombre || !direccion) {
      return NextResponse.json(
        { error: 'Nombre y direccion son requeridos' },
        { status: 400 }
      )
    }

    const clinica = await prisma.clinica.create({
      data: {
        nombre,
        direccion,
        logoUrl,
      },
    })

    return NextResponse.json({ data: clinica }, { status: 201 })
  } catch (error) {
    console.error('Error al crear clinica:', error)
    return NextResponse.json(
      { error: 'Error al crear clinica' },
      { status: 500 }
    )
  }
}
