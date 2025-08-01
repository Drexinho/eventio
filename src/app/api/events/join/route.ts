import { NextRequest, NextResponse } from 'next/server'
import { getEventByToken } from '@/lib/database-postgresql'

export async function POST(request: NextRequest) {
  try {
    const { hash } = await request.json()

    if (!hash || typeof hash !== 'string') {
      return NextResponse.json(
        { message: 'Hash je povinný' },
        { status: 400 }
      )
    }

    if (hash.length !== 20) {
      return NextResponse.json(
        { message: 'Hash musí mít přesně 20 znaků' },
        { status: 400 }
      )
    }

    // Najít událost podle hashe (access_token)
    const event = await getEventByToken(hash)

    return NextResponse.json({
      access_token: event.access_token,
      name: event.name
    })

  } catch (error) {
    console.error('Chyba při připojování k události:', error)
    
    if (error instanceof Error && error.message === 'Událost nebyla nalezena') {
      return NextResponse.json(
        { message: 'Událost s tímto hashem nebyla nalezena' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Nepodařilo se připojit k události' },
      { status: 500 }
    )
  }
} 