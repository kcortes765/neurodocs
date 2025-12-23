import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Validar formato de RUT chileno
function validarRUT(rut: string): boolean {
  const rutLimpio = rut.replace(/[.-]/g, '')

  if (!/^\d{7,8}[\dkK]$/.test(rutLimpio)) {
    return false
  }

  const cuerpo = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1).toLowerCase()

  let suma = 0
  let multiplicador = 2

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  const dvCalculado = 11 - (suma % 11)
  const dvEsperado = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'k' : dvCalculado.toString()

  return dv === dvEsperado
}

// GET: Lista pacientes con busqueda opcional
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const limit = searchParams.get('limit')
    const clinicaId = searchParams.get('clinicaId')

    const filters: Array<Record<string, unknown>> = []

    if (query) {
      filters.push({
        OR: [
          { nombreCompleto: { contains: query, mode: 'insensitive' } },
          { rut: { contains: query, mode: 'insensitive' } },
        ],
      })
    }

    if (clinicaId) {
      filters.push({
        OR: [
          { atenciones: { some: { clinicaId } } },
          { eventosQuirurgicos: { some: { clinicaId } } },
        ],
      })
    }

    const pacientes = await prisma.paciente.findMany({
      where: filters.length ? { AND: filters } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      include: {
        _count: {
          select: { atenciones: true },
        },
      },
    })

    return NextResponse.json({ data: pacientes })
  } catch (error) {
    console.error('Error al obtener pacientes:', error)
    return NextResponse.json(
      { error: 'Error al obtener pacientes' },
      { status: 500 }
    )
  }
}

// POST: Crea paciente nuevo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rut, nombreCompleto, fechaNac, prevision, isapreNombre, antecedentes } = body

    // Validaciones
    if (!rut || !nombreCompleto) {
      return NextResponse.json(
        { error: 'RUT y nombre completo son requeridos' },
        { status: 400 }
      )
    }

    if (!validarRUT(rut)) {
      return NextResponse.json(
        { error: 'RUT invalido' },
        { status: 400 }
      )
    }

    // Verificar si el RUT ya existe
    const existente = await prisma.paciente.findUnique({
      where: { rut: rut.replace(/[.-]/g, '').toUpperCase() },
    })

    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe un paciente con este RUT' },
        { status: 409 }
      )
    }

    const paciente = await prisma.paciente.create({
      data: {
        rut: rut.replace(/[.-]/g, '').toUpperCase(),
        nombreCompleto,
        fechaNac: fechaNac ? new Date(fechaNac) : null,
        prevision: prevision || 'FONASA',
        isapreNombre,
        antecedentes,
      },
    })

    return NextResponse.json({ data: paciente }, { status: 201 })
  } catch (error) {
    console.error('Error al crear paciente:', error)
    return NextResponse.json(
      { error: 'Error al crear paciente' },
      { status: 500 }
    )
  }
}
