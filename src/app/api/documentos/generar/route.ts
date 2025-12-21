import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createSamplePdf, pdfToBase64 } from '@/lib/pdf-generator'

// POST: Genera PDFs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { atencionId, tipos } = body

    if (!atencionId) {
      return NextResponse.json(
        { error: 'atencionId es requerido' },
        { status: 400 }
      )
    }

    const atencion = await prisma.atencion.findUnique({
      where: { id: atencionId },
      include: {
        paciente: true,
        clinica: true,
      },
    })

    if (!atencion) {
      return NextResponse.json(
        { error: 'Atencion no encontrada' },
        { status: 404 }
      )
    }

    // Generar PDF de ejemplo
    const pdfBytes = await createSamplePdf()
    const pdfBase64 = pdfToBase64(pdfBytes)

    return NextResponse.json({
      pdf: pdfBase64,
      paciente: atencion.paciente.nombreCompleto,
      fecha: atencion.fecha.toISOString(),
      tipos: tipos || ['RECETA'],
    })

  } catch (error) {
    console.error('Error generando PDF:', error)
    return NextResponse.json(
      { error: 'Error generando documento' },
      { status: 500 }
    )
  }
}
