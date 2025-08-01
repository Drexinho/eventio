import { NextRequest, NextResponse } from 'next/server'
import { getEventByPin } from '../../../../lib/database-postgresql'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Získat IP adresu
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Kontrola rate limitu
    const rateLimit = checkRateLimit(ip)
    
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetTime).toISOString()
      return NextResponse.json(
        { 
          message: 'Příliš mnoho pokusů. Zkuste to znovu později.',
          resetTime: resetTime
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': resetTime
          }
        }
      )
    }

    const { pin, eventToken } = await request.json()

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { message: 'PIN je povinný' },
        { status: 400 }
      )
    }

    if (pin.length !== 4) {
      return NextResponse.json(
        { message: 'PIN musí mít přesně 4 znaky' },
        { status: 400 }
      )
    }

    if (!eventToken || typeof eventToken !== 'string') {
      return NextResponse.json(
        { message: 'Token události je povinný' },
        { status: 400 }
      )
    }

    // Najít událost podle PINu
    const event = await getEventByPin(pin)

    // Ověřit, že PIN patří k správné události
    if (event.access_token !== eventToken) {
      return NextResponse.json(
        { message: 'PIN nepatří k této události' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      access_token: event.access_token,
      name: event.name
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
      }
    })

  } catch (error) {
    console.error('Chyba při ověřování PINu:', error)
    
    if (error instanceof Error && error.message === 'Událost nebyla nalezena') {
      return NextResponse.json(
        { message: 'Událost s tímto PINem nebyla nalezena' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Nepodařilo se ověřit PIN' },
      { status: 500 }
    )
  }
} 