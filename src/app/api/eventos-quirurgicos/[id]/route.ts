import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Obtiene un evento quirurgico por ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const evento = await prisma.eventoQuirurgico.findUnique({
      where: { id: params.id },
      include: {
        paciente: true,
        clinica: true,
        procedimiento: true,
        cirujano: true,
        anestesista: true,
        arsenalera: true,
        ayudante1: true,
        ayudante2: true,
        documentos: true,
      },
    })

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento quirurgico no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: evento })
  } catch (error) {
    console.error('Error obteniendo evento quirurgico:', error)
    return NextResponse.json(
      { error: 'Error obteniendo evento quirurgico' },
      { status: 500 }
    )
  }
}

// PUT: Actualiza un evento quirurgico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const {
      fechaCirugia,
      diagnostico,
      codigoCie10,
      procedimientoId,
      lateralidad,
      alergiaLatex,
      requiereBiopsia,
      requiereRayos,
      cirujanoId,
      anestesistaId,
      arsenaleraId,
      ayudante1Id,
      ayudante2Id,
      riesgosDescripcion,
      clinicaId,
    } = body

    // Verificar que existe
    const existente = await prisma.eventoQuirurgico.findUnique({
      where: { id: params.id },
    })

    if (!existente) {
      return NextResponse.json(
        { error: 'Evento quirurgico no encontrado' },
        { status: 404 }
      )
    }

    const evento = await prisma.eventoQuirurgico.update({
      where: { id: params.id },
      data: {
        fechaCirugia: fechaCirugia ? new Date(fechaCirugia) : undefined,
        diagnostico,
        codigoCie10,
        procedimientoId,
        lateralidad,
        alergiaLatex,
        requiereBiopsia,
        requiereRayos,
        cirujanoId,
        anestesistaId,
        arsenaleraId,
        ayudante1Id,
        ayudante2Id,
        riesgosDescripcion,
        clinicaId,
      },
      include: {
        paciente: true,
        clinica: true,
        procedimiento: true,
        cirujano: true,
        anestesista: true,
        arsenalera: true,
        ayudante1: true,
        ayudante2: true,
      },
    })

    return NextResponse.json({ data: evento })
  } catch (error) {
    console.error('Error actualizando evento quirurgico:', error)
    return NextResponse.json(
      { error: 'Error actualizando evento quirurgico' },
      { status: 500 }
    )
  }
}

// DELETE: Elimina un evento quirurgico
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existente = await prisma.eventoQuirurgico.findUnique({
      where: { id: params.id },
    })

    if (!existente) {
      return NextResponse.json(
        { error: 'Evento quirurgico no encontrado' },
        { status: 404 }
      )
    }

    await prisma.eventoQuirurgico.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ data: { deleted: true } })
  } catch (error) {
    console.error('Error eliminando evento quirurgico:', error)
    return NextResponse.json(
      { error: 'Error eliminando evento quirurgico' },
      { status: 500 }
    )
  }
}
