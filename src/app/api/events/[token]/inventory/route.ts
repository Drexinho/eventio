import { NextRequest, NextResponse } from 'next/server'
import { getInventoryItems, addInventoryItem } from '@/lib/database'
import { getEventByToken } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const event = await getEventByToken(token)
    const inventory = await getInventoryItems(event.id)
    return NextResponse.json(inventory)
  } catch (error) {
    console.error('API: Chyba při získávání inventáře:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se získat inventář' },
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
    
    const item = await addInventoryItem(event.id, body)
    
    return NextResponse.json(item)
  } catch (error) {
    console.error('API: Chyba při přidávání položky:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se přidat položku' },
      { status: 500 }
    )
  }
} 