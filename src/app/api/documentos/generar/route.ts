import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  createSamplePdf,
  pdfToBase64,
} from '@/lib/pdf-generator'

// GET: Lista plantillas disponibles
export async function GET() {
  try {
    const plantillas = await prisma.plantilla.findMany({
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({ data: plantillas })
  } catch (error) {
    console.error('Error listando plantillas:', error)
    return NextResponse.json(
      { error: 'Error listando plantillas' },
      { status: 500 }
    )
  }
}

// POST: Genera PDFs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { atencionId, eventoQuirurgicoId, tipos } = body

    if (!atencionId && !eventoQuirurgicoId) {
      return NextResponse.json(
        { error: 'atencionId o eventoQuirurgicoId es requerido' },
        { status: 400 }
      )
    }

    if (eventoQuirurgicoId) {
      const evento = await prisma.eventoQuirurgico.findUnique({
        where: { id: eventoQuirurgicoId },
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

      if (!evento) {
        return NextResponse.json(
          { error: 'Evento quirurgico no encontrado' },
          { status: 404 }
        )
      }

      const tiposSolicitados =
        Array.isArray(tipos) && tipos.length > 0
          ? tipos
          : ['PAM', 'PABELLON', 'CONSENTIMIENTO']

      const documentos: { tipo: string; plantillaId: string | null; plantillaNombre: string; pdf: string }[] = []

      // Generar PDFs genéricos por ahora (plantillas se configurarán después)
      for (const tipo of tiposSolicitados) {
        const pdfBytes = await createSamplePdf()
        const pdfBase64 = pdfToBase64(pdfBytes)

        documentos.push({
          tipo,
          plantillaId: null,
          plantillaNombre: `Documento ${tipo}`,
          pdf: pdfBase64,
        })
      }

      return NextResponse.json({
        data: {
          eventoId: evento.id,
          paciente: {
            nombreCompleto: evento.paciente.nombreCompleto,
            rut: evento.paciente.rut,
          },
          documentos,
        },
      })
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
