import { NextRequest, NextResponse } from 'next/server'
import { getTransport, addTransport } from '@/lib/database'
import { getEventByToken } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const event = await getEventByToken(token)
    const transport = await getTransport(event.id)
    return NextResponse.json(transport)
  } catch (error) {
    console.error('API: Chyba při získávání dopravy:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se získat dopravu' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const event = await getEventByToken(token)
    const body = await request.json()
    
    const transport = await addTransport(event.id, body)
    
    return NextResponse.json(transport)
  } catch (error) {
    console.error('API: Chyba při přidávání dopravy:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se přidat dopravu' },
      { status: 500 }
    )
  }
} 