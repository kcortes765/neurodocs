import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Lista eventos quirurgicos con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pacienteId = searchParams.get('pacienteId')
    const clinicaId = searchParams.get('clinicaId')

    const where: { pacienteId?: string; clinicaId?: string } = {}
    if (pacienteId) where.pacienteId = pacienteId
    if (clinicaId) where.clinicaId = clinicaId

    const eventos = await prisma.eventoQuirurgico.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { fechaCirugia: 'desc' },
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

    return NextResponse.json({ data: eventos })
  } catch (error) {
    console.error('Error listando eventos quirurgicos:', error)
    return NextResponse.json(
      { error: 'Error listando eventos quirurgicos' },
      { status: 500 }
    )
  }
}

// POST: Crea evento quirurgico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      pacienteId,
      clinicaId,
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
    } = body

    if (!pacienteId || !clinicaId || !fechaCirugia || !diagnostico) {
      return NextResponse.json(
        { error: 'pacienteId, clinicaId, fechaCirugia y diagnostico son requeridos' },
        { status: 400 }
      )
    }

    const fecha = new Date(fechaCirugia)
    if (Number.isNaN(fecha.getTime())) {
      return NextResponse.json(
        { error: 'fechaCirugia invalida' },
        { status: 400 }
      )
    }

    const [paciente, clinica] = await Promise.all([
      prisma.paciente.findUnique({ where: { id: pacienteId } }),
      prisma.clinica.findUnique({ where: { id: clinicaId } }),
    ])

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })
    }
    if (!clinica) {
      return NextResponse.json({ error: 'Clinica no encontrada' }, { status: 404 })
    }

    if (procedimientoId) {
      const procedimiento = await prisma.procedimiento.findUnique({
        where: { id: procedimientoId },
      })
      if (!procedimiento) {
        return NextResponse.json(
          { error: 'Procedimiento no encontrado' },
          { status: 404 }
        )
      }
    }

    const teamIds = [cirujanoId, anestesistaId, arsenaleraId, ayudante1Id, ayudante2Id]
      .filter((id): id is string => Boolean(id))
    if (teamIds.length > 0) {
      const miembros = await prisma.equipoMedico.findMany({
        where: { id: { in: teamIds } },
        select: { id: true },
      })
      const uniqueIds = Array.from(new Set(teamIds))
      if (miembros.length !== uniqueIds.length) {
        return NextResponse.json(
          { error: 'Equipo medico no encontrado' },
          { status: 404 }
        )
      }
    }

    const evento = await prisma.eventoQuirurgico.create({
      data: {
        pacienteId,
        clinicaId,
        fechaCirugia: fecha,
        diagnostico,
        codigoCie10,
        procedimientoId,
        lateralidad,
        alergiaLatex: Boolean(alergiaLatex),
        requiereBiopsia: Boolean(requiereBiopsia),
        requiereRayos: Boolean(requiereRayos),
        cirujanoId,
        anestesistaId,
        arsenaleraId,
        ayudante1Id,
        ayudante2Id,
        riesgosDescripcion,
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

    return NextResponse.json({ data: evento }, { status: 201 })
  } catch (error) {
    console.error('Error creando evento quirurgico:', error)
    return NextResponse.json(
      { error: 'Error creando evento quirurgico' },
      { status: 500 }
    )
  }
}
