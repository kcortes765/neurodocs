import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Obtiene paciente por ID con sus atenciones
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: {
        atenciones: {
          include: {
            clinica: true,
          },
          orderBy: { fecha: 'desc' },
        },
      },
    })

    if (!paciente) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: paciente })
  } catch (error) {
    console.error('Error al obtener paciente:', error)
    return NextResponse.json(
      { error: 'Error al obtener paciente' },
      { status: 500 }
    )
  }
}

// PUT: Actualiza paciente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { nombreCompleto, fechaNac, prevision, isapreNombre, antecedentes } = body

    const existente = await prisma.paciente.findUnique({
      where: { id },
    })

    if (!existente) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    const paciente = await prisma.paciente.update({
      where: { id },
      data: {
        nombreCompleto,
        fechaNac: fechaNac ? new Date(fechaNac) : undefined,
        prevision,
        isapreNombre,
        antecedentes,
      },
    })

    return NextResponse.json({ data: paciente })
  } catch (error) {
    console.error('Error al actualizar paciente:', error)
    return NextResponse.json(
      { error: 'Error al actualizar paciente' },
      { status: 500 }
    )
  }
}
