import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Lista todas las clinicas
export async function GET() {
  try {
    const clinicas = await prisma.clinica.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({ data: clinicas })
  } catch (error) {
    console.error('Error al obtener clinicas:', error)
    return NextResponse.json(
      { error: 'Error al obtener clinicas' },
      { status: 500 }
    )
  }
}

// PUT: Reemplaza todas las clinicas con las de Antofagasta (no requiere auth)
export async function PUT() {
  try {
    // Desactivar clinicas existentes
    await prisma.clinica.updateMany({
      data: { activa: false }
    })

    const clinicasAntofagasta = [
      { nombre: 'Clinica Antofagasta', direccion: 'Av. Angamos 900, Antofagasta' },
      { nombre: 'Hospital Regional Dr. Leonardo Guzman', direccion: 'Av. Argentina 1962, Antofagasta' },
      { nombre: 'Clinica del Norte', direccion: 'Av. Balmaceda 2550, Antofagasta' },
    ]

    const createdClinicas = []
    for (const c of clinicasAntofagasta) {
      const existe = await prisma.clinica.findFirst({ where: { nombre: c.nombre } })
      if (existe) {
        const updated = await prisma.clinica.update({
          where: { id: existe.id },
          data: { direccion: c.direccion, activa: true },
        })
        createdClinicas.push(updated)
      } else {
        const created = await prisma.clinica.create({
          data: { nombre: c.nombre, direccion: c.direccion, activa: true },
        })
        createdClinicas.push(created)
      }
    }

    return NextResponse.json({ data: createdClinicas, message: 'Clinicas actualizadas a Antofagasta' })
  } catch (error) {
    console.error('Error actualizando clinicas:', error)
    return NextResponse.json({ error: 'Error actualizando clinicas' }, { status: 500 })
  }
}

// POST: Crea clinica nueva
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, direccion, logoUrl } = body

    if (!nombre || !direccion) {
      return NextResponse.json(
        { error: 'Nombre y direccion son requeridos' },
        { status: 400 }
      )
    }

    const clinica = await prisma.clinica.create({
      data: {
        nombre,
        direccion,
        logoUrl,
      },
    })

    return NextResponse.json({ data: clinica }, { status: 201 })
  } catch (error) {
    console.error('Error al crear clinica:', error)
    return NextResponse.json(
      { error: 'Error al crear clinica' },
      { status: 500 }
    )
  }
}
