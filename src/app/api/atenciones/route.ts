import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST: Crea nueva atencion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pacienteId, clinicaId, diagnostico, tratamiento, indicaciones } = body

    if (!pacienteId || !clinicaId || !diagnostico) {
      return NextResponse.json(
        { error: 'pacienteId, clinicaId y diagnostico son requeridos' },
        { status: 400 }
      )
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
    })

    if (!paciente) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    const clinica = await prisma.clinica.findUnique({
      where: { id: clinicaId },
    })

    if (!clinica) {
      return NextResponse.json(
        { error: 'Clinica no encontrada' },
        { status: 404 }
      )
    }

    const atencion = await prisma.atencion.create({
      data: {
        pacienteId,
        clinicaId,
        diagnostico,
        tratamiento,
        indicaciones,
      },
      include: {
        paciente: true,
        clinica: true,
      },
    })

    return NextResponse.json({ data: atencion }, { status: 201 })
  } catch (error) {
    console.error('Error al crear atencion:', error)
    return NextResponse.json(
      { error: 'Error al crear atencion' },
      { status: 500 }
    )
  }
}
