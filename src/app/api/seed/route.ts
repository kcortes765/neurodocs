import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generatePatient, DIAGNOSTICOS, TRATAMIENTOS } from '@/lib/synthetic-data'

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

    const pacientesCreados = []

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

      pacientesCreados.push(paciente)
    }

    return NextResponse.json({
      data: {
        message: 'Datos sinteticos generados',
        pacientesCreados: pacientesCreados.length,
        atencionesCreadas: pacientesCreados.length * atencionesPorPaciente,
        clinicas: clinicas.length,
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
