import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { kalkulationSchema } from '@/lib/validations/kalkulation.schema'

// GET — tek bir kalkulationu getir (pozisyonlarıyla birlikte)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const { id } = await params

    const kalkulation = await prisma.kalkulation.findFirst({
      where: { id, created_by: user.id },
      include: {
        positionen: {
          orderBy: { sort_order: 'asc' },
          include: {
            unterpositionen: {
              orderBy: { sort_order: 'asc' },
              include: {
                werkstoffe: {
                  orderBy: { sort_order: 'asc' },
                },
              },
            },
          },
        },
      },
    })

    if (!kalkulation) {
      return NextResponse.json(
        { error: 'Kalkulation nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(kalkulation)

  } catch (error) {
    console.error('GET /api/kalkulationen/[id] error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// PUT — kalkulationu güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const validation = kalkulationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validierungsfehler', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const kalkulation = await prisma.kalkulation.updateMany({
      where: { id, created_by: user.id },
      data: {
        ...validation.data,
        datum: new Date(validation.data.datum),
      },
    })

    if (kalkulation.count === 0) {
      return NextResponse.json(
        { error: 'Kalkulation nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('PUT /api/kalkulationen/[id] error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// DELETE — kalkulationu sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const { id } = await params

    const deleted = await prisma.kalkulation.deleteMany({
      where: { id, created_by: user.id },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Kalkulation nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('DELETE /api/kalkulationen/[id] error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}