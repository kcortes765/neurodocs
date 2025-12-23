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
