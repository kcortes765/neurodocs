import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Obtiene atención con paciente y clínica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const atencion = await prisma.atencion.findUnique({
      where: { id: params.id },
      include: {
        paciente: true,
        clinica: true,
      },
    })

    if (!atencion) {
      return NextResponse.json(
        { error: 'Atención no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: atencion })
  } catch (error) {
    console.error('Error al obtener atención:', error)
    return NextResponse.json(
      { error: 'Error al obtener atención' },
      { status: 500 }
    )
  }
}

// PUT: Actualiza atención
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { fecha, diagnostico, tratamiento, indicaciones } = body

    // Verificar si la atención existe
    const existente = await prisma.atencion.findUnique({
      where: { id: params.id },
    })

    if (!existente) {
      return NextResponse.json(
        { error: 'Atención no encontrada' },
        { status: 404 }
      )
    }

    const atencion = await prisma.atencion.update({
      where: { id: params.id },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        diagnostico,
        tratamiento,
        indicaciones,
      },
      include: {
        paciente: true,
        clinica: true,
      },
    })

    return NextResponse.json({ data: atencion })
  } catch (error) {
    console.error('Error al actualizar atención:', error)
    return NextResponse.json(
      { error: 'Error al actualizar atención' },
      { status: 500 }
    )
  }
}

// DELETE: Elimina atención
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si la atención existe
    const existente = await prisma.atencion.findUnique({
      where: { id: params.id },
    })

    if (!existente) {
      return NextResponse.json(
        { error: 'Atención no encontrada' },
        { status: 404 }
      )
    }

    await prisma.atencion.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ data: { message: 'Atención eliminada exitosamente' } })
  } catch (error) {
    console.error('Error al eliminar atención:', error)
    return NextResponse.json(
      { error: 'Error al eliminar atención' },
      { status: 500 }
    )
  }
}
