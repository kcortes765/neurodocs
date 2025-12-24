import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  loadPdfTemplate,
  injectText,
  pdfToBase64,
  FieldMapping,
  createGenericDocument,
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

// Helper: Formatear fecha chilena
function formatDateCL(date: Date): string {
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Helper: Formatear RUT con puntos y guion
function formatRut(rut: string): string {
  const clean = rut.replace(/[.-]/g, '')
  if (clean.length < 2) return rut
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

// Helper: Buscar plantilla por tipo y prevision/clinica
async function findPlantilla(tipo: string, prevision?: string, clinicaId?: string) {
  // Para PAM, buscar por prevision del paciente
  if (tipo === 'PAM' && prevision) {
    const plantilla = await prisma.plantilla.findFirst({
      where: {
        tipo: 'PAM',
        activa: true,
        previsionNombre: prevision,
      },
    })
    if (plantilla) return plantilla

    // Fallback: buscar FONASA si es FONASA o generico
    return await prisma.plantilla.findFirst({
      where: { tipo: 'PAM', activa: true },
    })
  }

  // Para PABELLON o CONSENTIMIENTO, buscar por clinica
  if (clinicaId) {
    const plantilla = await prisma.plantilla.findFirst({
      where: {
        tipo,
        activa: true,
        clinicaId,
      },
    })
    if (plantilla) return plantilla
  }

  // Fallback: cualquier plantilla del tipo
  return await prisma.plantilla.findFirst({
    where: { tipo, activa: true },
  })
}

// POST: Genera PDFs usando plantillas reales
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

      // Determinar prevision del paciente
      const prevision = evento.paciente.isapreNombre || evento.paciente.prevision

      const documentos: { tipo: string; plantillaId: string | null; plantillaNombre: string; pdf: string }[] = []

      // Preparar datos comunes para todos los documentos
      const data: Record<string, string> = {
        nombreCompleto: evento.paciente.nombreCompleto,
        rut: formatRut(evento.paciente.rut),
        fechaNac: evento.paciente.fechaNac ? formatDateCL(new Date(evento.paciente.fechaNac)) : '',
        prevision: evento.paciente.prevision,
        isapre: evento.paciente.isapreNombre || '',
        diagnostico: evento.diagnostico,
        codigoCie10: evento.codigoCie10 || '',
        procedimiento: evento.procedimiento?.descripcion || '',
        codigoFonasa: evento.procedimiento?.codigoFonasa || '',
        fechaCirugia: formatDateCL(new Date(evento.fechaCirugia)),
        lateralidad: evento.lateralidad || '',
        clinica: evento.clinica.nombre,
        direccionClinica: evento.clinica.direccion,
        cirujano: evento.cirujano?.nombre || '',
        rutCirujano: evento.cirujano?.rut || '',
        anestesista: evento.anestesista?.nombre || '',
        arsenalera: evento.arsenalera?.nombre || '',
        ayudante1: evento.ayudante1?.nombre || '',
        ayudante2: evento.ayudante2?.nombre || '',
        riesgos: evento.riesgosDescripcion || '',
        alergiaLatex: evento.alergiaLatex ? 'Si' : 'No',
        requiereBiopsia: evento.requiereBiopsia ? 'Si' : 'No',
        requiereRayos: evento.requiereRayos ? 'Si' : 'No',
        fechaActual: formatDateCL(new Date()),
      }

      for (const tipo of tiposSolicitados) {
        try {
          // Siempre generar documento genérico con todos los datos
          const pdfBytes = await createGenericDocument(tipo, data)
          const pdfBase64 = pdfToBase64(pdfBytes)

          // Buscar si hay plantilla específica
          const plantilla = await findPlantilla(tipo, prevision, evento.clinicaId)
          let plantillaNombre = `Documento Genérico - ${tipo}`

          // Si hay plantilla con mapeo, intentar usar también
          if (plantilla && plantilla.mapeoCampos && plantilla.mapeoCampos !== '{}') {
            try {
              const parsed = JSON.parse(plantilla.mapeoCampos)
              if (parsed.text && parsed.text.length > 0) {
                // Hay mapeo, generar también con template
                const pdfDoc = await loadPdfTemplate(plantilla.pdfUrl)
                await injectText(pdfDoc, parsed.text as FieldMapping[], data)
                const templatePdfBytes = await pdfDoc.save()
                const templatePdfBase64 = pdfToBase64(templatePdfBytes)

                // Agregar el documento con plantilla
                documentos.push({
                  tipo: `${tipo} (Plantilla)`,
                  plantillaId: plantilla.id,
                  plantillaNombre: plantilla.nombre,
                  pdf: templatePdfBase64,
                })
              }
              plantillaNombre = plantilla.nombre
            } catch {
              // Error con plantilla, continuar con genérico
            }
          }

          documentos.push({
            tipo,
            plantillaId: null,
            plantillaNombre,
            pdf: pdfBase64,
          })
        } catch (pdfError) {
          console.error(`Error generando PDF ${tipo}:`, pdfError)
        }
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

    // Para atenciones (no eventos quirurgicos)
    const atencion = await prisma.atencion.findUnique({
      where: { id: atencionId },
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

    const data: Record<string, string> = {
      nombreCompleto: atencion.paciente.nombreCompleto,
      rut: formatRut(atencion.paciente.rut),
      fechaNac: atencion.paciente.fechaNac ? formatDateCL(new Date(atencion.paciente.fechaNac)) : '',
      prevision: atencion.paciente.prevision,
      isapre: atencion.paciente.isapreNombre || '',
      diagnostico: atencion.diagnostico,
      tratamiento: atencion.tratamiento || '',
      indicaciones: atencion.indicaciones || '',
      clinica: atencion.clinica.nombre,
      direccionClinica: atencion.clinica.direccion,
      fechaActual: formatDateCL(new Date()),
    }

    // Siempre generar documento genérico con todos los datos
    const pdfBytes = await createGenericDocument('ATENCIÓN MÉDICA', data)
    const pdfBase64 = pdfToBase64(pdfBytes)

    return NextResponse.json({
      data: {
        atencionId: atencion.id,
        paciente: {
          nombreCompleto: atencion.paciente.nombreCompleto,
          rut: atencion.paciente.rut,
        },
        documentos: [{
          tipo: 'ATENCIÓN MÉDICA',
          plantillaId: null,
          plantillaNombre: 'Documento Genérico',
          pdf: pdfBase64,
        }],
      },
    })
  } catch (error) {
    console.error('Error generando PDF:', error)
    return NextResponse.json(
      { error: 'Error generando documento' },
      { status: 500 }
    )
  }
}
