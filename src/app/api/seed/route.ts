import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generatePatient, DIAGNOSTICOS, TRATAMIENTOS } from '@/lib/synthetic-data'

const EQUIPO_BASE = [
  { nombre: 'Dr. Tomas Rojas', rut: '11111111-1', rol: 'cirujano' },
  { nombre: 'Dra. Camila Perez', rut: '22222222-2', rol: 'anestesista' },
  { nombre: 'Maria Gonzalez', rut: '33333333-3', rol: 'arsenalera' },
  { nombre: 'Dr. Javier Soto', rut: '44444444-4', rol: 'ayudante' },
  { nombre: 'Dra. Lucia Diaz', rut: '55555555-5', rol: 'ayudante' },
]

const PROCEDIMIENTOS_BASE = [
  { codigoFonasa: '100101', descripcion: 'Laminectomia lumbar', tipo: 'columna' },
  { codigoFonasa: '100201', descripcion: 'Microdiscectomia', tipo: 'columna' },
  { codigoFonasa: '100301', descripcion: 'Craneotomia por tumor', tipo: 'neurocirugia' },
  { codigoFonasa: '100401', descripcion: 'Derivacion ventriculo-peritoneal', tipo: 'neurocirugia' },
  { codigoFonasa: '100501', descripcion: 'Artrodesis cervical', tipo: 'columna' },
]

// POST: Genera datos sinteticos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pacientes = 20, atencionesPorPaciente = 2 } = body

    // Crear clinicas si no existen
    let clinicas = await prisma.clinica.findMany()

    if (clinicas.length === 0) {
      await prisma.clinica.createMany({
        data: [
          { nombre: 'Clinica Antofagasta', direccion: 'Av. Angamos 900, Antofagasta' },
          { nombre: 'Hospital Regional Dr. Leonardo Guzman', direccion: 'Av. Argentina 1962, Antofagasta' },
          { nombre: 'Centro Medico Costa Norte', direccion: 'Av. Edmundo Perez Zujovic 4300, Antofagasta' },
        ],
      })
      clinicas = await prisma.clinica.findMany()
    }

    const plantillasExistentes = await prisma.plantilla.findMany()
    if (plantillasExistentes.length === 0) {
      const pamTemplates = [
        {
          nombre: 'PAM Fonasa',
          tipo: 'PAM',
          pdfUrl: 'Informe_medico_tratante (1).pdf',
          mapeoCampos: '{}',
          previsionNombre: 'FONASA',
        },
        {
          nombre: 'PAM Banmedica',
          tipo: 'PAM',
          pdfUrl: 'Programa-atencion-medica-BM.pdf',
          mapeoCampos: '{}',
          previsionNombre: 'Banmedica',
        },
        {
          nombre: 'PAM Colmena',
          tipo: 'PAM',
          pdfUrl: 'Informe_medico_tratante (1).pdf',
          mapeoCampos: '{}',
          previsionNombre: 'Colmena',
        },
        {
          nombre: 'PAM Consalud',
          tipo: 'PAM',
          pdfUrl: 'Programa_Atencion_Salud_2019.pdf',
          mapeoCampos: '{}',
          previsionNombre: 'Consalud',
        },
        {
          nombre: 'PAM Cruz Blanca',
          tipo: 'PAM',
          pdfUrl: 'Informe_medico_tratante (1).pdf',
          mapeoCampos: '{}',
          previsionNombre: 'Cruz Blanca',
        },
        {
          nombre: 'PAM Nueva Masvida',
          tipo: 'PAM',
          pdfUrl: 'Informe_medico_tratante (1).pdf',
          mapeoCampos: '{}',
          previsionNombre: 'Nueva Masvida',
        },
        {
          nombre: 'PAM Vida Tres',
          tipo: 'PAM',
          pdfUrl: 'PAM-VT.pdf',
          mapeoCampos: '{}',
          previsionNombre: 'Vida Tres',
        },
      ]

      const clinicTemplates = clinicas.flatMap((clinica) => [
        {
          nombre: `Pabellon ${clinica.nombre}`,
          tipo: 'PABELLON',
          pdfUrl: 'solicitud_de_pabellon__2_.pdf',
          mapeoCampos: '{}',
          clinicaId: clinica.id,
        },
        {
          nombre: `Consentimiento ${clinica.nombre}`,
          tipo: 'CONSENTIMIENTO',
          pdfUrl: 'cba_consentimiento_general.pdf',
          mapeoCampos: '{}',
          clinicaId: clinica.id,
        },
      ])

      await prisma.plantilla.createMany({
        data: [...pamTemplates, ...clinicTemplates],
      })
    }

    const pacientesCreados = []

    let equipoMedico = await prisma.equipoMedico.findMany()
    if (equipoMedico.length === 0) {
      await prisma.equipoMedico.createMany({ data: EQUIPO_BASE })
      equipoMedico = await prisma.equipoMedico.findMany()
    }

    let procedimientos = await prisma.procedimiento.findMany()
    if (procedimientos.length === 0) {
      await prisma.procedimiento.createMany({ data: PROCEDIMIENTOS_BASE })
      procedimientos = await prisma.procedimiento.findMany()
    }

    for (let i = 0; i < pacientes; i++) {
      const data = generatePatient()

      const existe = await prisma.paciente.findUnique({
        where: { rut: data.rut }
      })

      if (existe) continue

      const paciente = await prisma.paciente.create({
        data: {
          rut: data.rut,
          nombreCompleto: data.nombreCompleto,
          fechaNac: new Date(data.fechaNacimiento),
          prevision: data.prevision.includes('FONASA') ? 'FONASA' :
                     data.prevision.includes('Isapre') ? 'ISAPRE' : 'PARTICULAR',
          isapreNombre: data.prevision.includes('Isapre') ? data.prevision.replace('Isapre ', '') : null,
          antecedentes: data.patologiaPrincipal,
        }
      })

      for (let j = 0; j < atencionesPorPaciente; j++) {
        const clinica = clinicas[Math.floor(Math.random() * clinicas.length)]
        const diagnostico = DIAGNOSTICOS[Math.floor(Math.random() * DIAGNOSTICOS.length)]
        const tratamiento = TRATAMIENTOS.slice(0, Math.floor(Math.random() * 3) + 1).join(', ')

        await prisma.atencion.create({
          data: {
            pacienteId: paciente.id,
            clinicaId: clinica.id,
            diagnostico,
            tratamiento,
            indicaciones: 'Control en 2 semanas. Reposo relativo.',
            fecha: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          }
        })
      }

      if (procedimientos.length > 0) {
        const clinica = clinicas[Math.floor(Math.random() * clinicas.length)]
        const procedimiento =
          procedimientos[Math.floor(Math.random() * procedimientos.length)]
        const cirujano = equipoMedico.find((m) => m.rol === 'cirujano') || null
        const anestesista = equipoMedico.find((m) => m.rol === 'anestesista') || null
        const arsenalera = equipoMedico.find((m) => m.rol === 'arsenalera') || null
        const ayudantes = equipoMedico.filter((m) => m.rol === 'ayudante')
        const diagnosticoEvento = DIAGNOSTICOS[Math.floor(Math.random() * DIAGNOSTICOS.length)]

        await prisma.eventoQuirurgico.create({
          data: {
            pacienteId: paciente.id,
            clinicaId: clinica.id,
            fechaCirugia: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
            diagnostico: diagnosticoEvento,
            codigoCie10: 'G44.1',
            procedimientoId: procedimiento.id,
            lateralidad: ['izquierda', 'derecha', 'bilateral'][
              Math.floor(Math.random() * 3)
            ],
            alergiaLatex: Math.random() < 0.2,
            requiereBiopsia: Math.random() < 0.3,
            requiereRayos: Math.random() < 0.4,
            cirujanoId: cirujano?.id,
            anestesistaId: anestesista?.id,
            arsenaleraId: arsenalera?.id,
            ayudante1Id: ayudantes[0]?.id,
            ayudante2Id: ayudantes[1]?.id,
            riesgosDescripcion:
              'Riesgos asociados al procedimiento incluyen infeccion, sangrado y necesidad de reintervencion.',
          },
        })
      }

      pacientesCreados.push(paciente)
    }

    return NextResponse.json({
      data: {
        message: 'Datos sinteticos generados',
        pacientesCreados: pacientesCreados.length,
        atencionesCreadas: pacientesCreados.length * atencionesPorPaciente,
        clinicas: clinicas.length,
        equipoMedico: equipoMedico.length,
        procedimientos: procedimientos.length,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error generando datos:', error)
    return NextResponse.json(
      { error: 'Error generando datos sinteticos' },
      { status: 500 }
    )
  }
}
