import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { kalkulationSchema } from '@/lib/validations/kalkulation.schema'

// GET — belirli bir projenin kalkulationlarını getir
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    // URL'den projekt_id parametresini al
    // Örnek: /api/kalkulationen?projekt_id=xxx
    const { searchParams } = new URL(request.url)
    const projekt_id = searchParams.get('projekt_id')

    if (!projekt_id) {
      return NextResponse.json(
        { error: 'projekt_id ist erforderlich' },
        { status: 400 }
      )
    }

    const kalkulationen = await prisma.kalkulation.findMany({
      where: {
        projekt_id,
        created_by: user.id,
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(kalkulationen)

  } catch (error) {
    console.error('GET /api/kalkulationen error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// POST — yeni kalkulation oluştur
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

    const validation = kalkulationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validierungsfehler', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Projenin bu kullanıcıya ait olduğunu doğrula
    const projekt = await prisma.projekt.findFirst({
      where: {
        id: validation.data.projekt_id,
        created_by: user.id,
      },
    })

    if (!projekt) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      )
    }

    const kalkulation = await prisma.kalkulation.create({
      data: {
        ...validation.data,
        datum: new Date(validation.data.datum),
        created_by: user.id,
      },
    })

    return NextResponse.json(kalkulation, { status: 201 })

  } catch (error) {
    console.error('POST /api/kalkulationen error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}