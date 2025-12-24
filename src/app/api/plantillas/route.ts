import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Lista todas las plantillas
export async function GET() {
  try {
    const plantillas = await prisma.plantilla.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json({ data: plantillas })
  } catch (error) {
    console.error('Error obteniendo plantillas:', error)
    return NextResponse.json({ error: 'Error obteniendo plantillas' }, { status: 500 })
  }
}

// PUT: Resetea las plantillas con las clinicas actuales de Antofagasta
export async function PUT() {
  try {
    // Desactivar plantillas existentes
    await prisma.plantilla.updateMany({
      data: { activa: false }
    })

    // Obtener clinicas activas
    const clinicas = await prisma.clinica.findMany({ where: { activa: true } })

    if (clinicas.length === 0) {
      return NextResponse.json({ error: 'No hay clinicas activas' }, { status: 400 })
    }

    // Plantillas PAM por prevision (no ligadas a clinica)
    const pamTemplates = [
      { nombre: 'PAM FONASA', tipo: 'PAM', pdfUrl: 'Programa_Atencion_Salud_2019.pdf', previsionNombre: 'FONASA' },
      { nombre: 'PAM Banmedica', tipo: 'PAM', pdfUrl: 'Programa-atencion-medica-BM.pdf', previsionNombre: 'Banmedica' },
      { nombre: 'PAM Vida Tres', tipo: 'PAM', pdfUrl: 'PAM-VT.pdf', previsionNombre: 'Vida Tres' },
      { nombre: 'PAM Consalud', tipo: 'PAM', pdfUrl: 'Programa_Atencion_Salud_2019.pdf', previsionNombre: 'Consalud' },
      { nombre: 'PAM Colmena', tipo: 'PAM', pdfUrl: 'Informe_medico_tratante (1).pdf', previsionNombre: 'Colmena' },
      { nombre: 'PAM Cruz Blanca', tipo: 'PAM', pdfUrl: 'Informe_medico_tratante (1).pdf', previsionNombre: 'Cruz Blanca' },
      { nombre: 'PAM Nueva Masvida', tipo: 'PAM', pdfUrl: 'Informe_medico_tratante (1).pdf', previsionNombre: 'Nueva Masvida' },
      { nombre: 'PAM ISAPRE Generico', tipo: 'PAM', pdfUrl: 'Informe_medico_tratante (1).pdf', previsionNombre: 'ISAPRE' },
    ]

    const createdPlantillas = []

    // Crear plantillas PAM
    for (const pam of pamTemplates) {
      const plantilla = await prisma.plantilla.create({
        data: {
          nombre: pam.nombre,
          tipo: pam.tipo,
          pdfUrl: pam.pdfUrl,
          mapeoCampos: '{}',
          previsionNombre: pam.previsionNombre,
          activa: true,
        }
      })
      createdPlantillas.push(plantilla)
    }

    // Crear plantillas de PABELLON y CONSENTIMIENTO para cada clinica
    for (const clinica of clinicas) {
      const pabellon = await prisma.plantilla.create({
        data: {
          nombre: `Solicitud Pabellon - ${clinica.nombre}`,
          tipo: 'PABELLON',
          pdfUrl: 'solicitud_de_pabellon__2_.pdf',
          mapeoCampos: '{}',
          clinicaId: clinica.id,
          activa: true,
        }
      })
      createdPlantillas.push(pabellon)

      const consentimiento = await prisma.plantilla.create({
        data: {
          nombre: `Consentimiento - ${clinica.nombre}`,
          tipo: 'CONSENTIMIENTO',
          pdfUrl: 'cba_consentimiento_general.pdf',
          mapeoCampos: '{}',
          clinicaId: clinica.id,
          activa: true,
        }
      })
      createdPlantillas.push(consentimiento)
    }

    return NextResponse.json({
      data: createdPlantillas,
      message: `Creadas ${createdPlantillas.length} plantillas`
    })
  } catch (error) {
    console.error('Error reseteando plantillas:', error)
    return NextResponse.json({ error: 'Error reseteando plantillas' }, { status: 500 })
  }
}
