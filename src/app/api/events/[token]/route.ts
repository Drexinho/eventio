import { NextRequest, NextResponse } from 'next/server'
import { getEventByToken, updateEvent } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const event = await getEventByToken(token)
    return NextResponse.json(event)
  } catch (error) {
    console.error('API: Chyba při získávání události:', error)
    return NextResponse.json(
      { error: 'Událost nebyla nalezena' },
      { status: 404 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    
    // Nejprve získáme událost podle tokenu
    const event = await getEventByToken(token)
    
    // Pak aktualizujeme událost podle ID
    const updatedEvent = await updateEvent(event.id, body)
    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('API: Chyba při aktualizaci události:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se aktualizovat událost' },
      { status: 500 }
    )
  }
} 