import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  createSamplePdf,
  generateDocumentFromMapping,
  pdfToBase64,
  TemplateMapping,
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

      const plantillas = await prisma.plantilla.findMany({
        where: {
          tipo: { in: tiposSolicitados },
          activa: true,
        },
      })

      const normalize = (value?: string | null) =>
        (value || '').trim().toLowerCase()

      const previsionNombre =
        evento.paciente.prevision === 'ISAPRE'
          ? evento.paciente.isapreNombre
          : evento.paciente.prevision

      const documentos = []
      const missing: string[] = []

      for (const tipo of tiposSolicitados) {
        let plantilla = null

        if (tipo === 'PAM') {
          const target = normalize(previsionNombre)
          plantilla =
            plantillas.find(
              (item) =>
                item.tipo === 'PAM' &&
                normalize(item.previsionNombre) === target
            ) || plantillas.find((item) => item.tipo === 'PAM')
        } else {
          plantilla =
            plantillas.find(
              (item) => item.tipo === tipo && item.clinicaId === evento.clinicaId
            ) || null
        }

        if (!plantilla) {
          missing.push(tipo)
          continue
        }

        let pdfBase64 = ''
        let warning = ''
        try {
          const mappingRaw = plantilla.mapeoCampos || ''
          let mapping: TemplateMapping = {}

          if (mappingRaw) {
            const parsed = JSON.parse(mappingRaw)
            if (Array.isArray(parsed)) {
              mapping = { text: parsed }
            } else if (parsed && typeof parsed === 'object') {
              mapping = parsed
            }
          }

          const textData = {
            nombreCompleto: evento.paciente.nombreCompleto,
            rut: evento.paciente.rut,
            fechaNac: evento.paciente.fechaNac
              ? evento.paciente.fechaNac.toISOString().split('T')[0]
              : '',
            prevision: evento.paciente.prevision,
            isapreNombre: evento.paciente.isapreNombre || '',
            clinicaNombre: evento.clinica.nombre,
            clinicaDireccion: evento.clinica.direccion,
            fechaCirugia: evento.fechaCirugia.toISOString().split('T')[0],
            diagnostico: evento.diagnostico,
            codigoCie10: evento.codigoCie10 || '',
            procedimientoCodigo: evento.procedimiento?.codigoFonasa || '',
            procedimientoDescripcion: evento.procedimiento?.descripcion || '',
            lateralidad: evento.lateralidad || '',
            cirujanoNombre: evento.cirujano?.nombre || '',
            cirujanoRut: evento.cirujano?.rut || '',
            anestesistaNombre: evento.anestesista?.nombre || '',
            anestesistaRut: evento.anestesista?.rut || '',
            arsenaleraNombre: evento.arsenalera?.nombre || '',
            arsenaleraRut: evento.arsenalera?.rut || '',
            ayudante1Nombre: evento.ayudante1?.nombre || '',
            ayudante1Rut: evento.ayudante1?.rut || '',
            ayudante2Nombre: evento.ayudante2?.nombre || '',
            ayudante2Rut: evento.ayudante2?.rut || '',
            riesgosDescripcion: evento.riesgosDescripcion || '',
          }

          const checkboxData = {
            alergiaLatex: evento.alergiaLatex,
            requiereBiopsia: evento.requiereBiopsia,
            requiereRayos: evento.requiereRayos,
            lateralidad: evento.lateralidad || '',
          }

          const pdfBytes = await generateDocumentFromMapping(
            plantilla.pdfUrl,
            mapping,
            textData,
            checkboxData
          )
          pdfBase64 = pdfToBase64(pdfBytes)
        } catch {
          const fallback = await createSamplePdf()
          pdfBase64 = pdfToBase64(fallback)
          warning = 'No se pudo aplicar plantilla, se genero PDF de ejemplo'
        }

        documentos.push({
          tipo,
          plantillaId: plantilla.id,
          plantillaNombre: plantilla.nombre,
          pdf: pdfBase64,
          warning: warning || undefined,
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
          missing,
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
