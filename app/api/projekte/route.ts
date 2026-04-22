import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { projektSchema } from '@/lib/validations/projekt.schema'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const projekte = await prisma.projekt.findMany({
      where: { created_by: user.id },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(projekte)

  } catch (error) {
    console.error('GET /api/projekte error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const validation = projektSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validierungsfehler', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const projekt = await prisma.projekt.create({
      data: {
        ...validation.data,
        created_by: user.id,
      },
    })

    return NextResponse.json(projekt, { status: 201 })

  } catch (error) {
    console.error('POST /api/projekte error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}