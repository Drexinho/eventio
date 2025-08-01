import { NextRequest, NextResponse } from 'next/server'
import { getWantedItems, addWantedItem, updateWantedItem, deleteWantedItem } from '@/lib/database-postgresql'
import { getEventByToken } from '@/lib/database-postgresql'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    // Ověřit, že událost existuje
    await getEventByToken(token)
    
    const wantedItems = await getWantedItems(token)
    return NextResponse.json(wantedItems)
  } catch (error) {
    console.error('Chyba při načítání wanted položek:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se načíst wanted položky' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const body = await request.json()
    const { token } = await params
    
    // Ověřit, že událost existuje
    await getEventByToken(token)
    
    const wantedItem = await addWantedItem(token, {
      name: body.name,
      note: body.note || null
    })
    
    return NextResponse.json(wantedItem)
  } catch (error) {
    console.error('Chyba při přidávání wanted položky:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se přidat wanted položku' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const body = await request.json()
    const { token } = await params
    
    // Ověřit, že událost existuje
    await getEventByToken(token)
    
    const wantedItem = await updateWantedItem(body.id, {
      name: body.name,
      note: body.note || null
    })
    
    return NextResponse.json(wantedItem)
  } catch (error) {
    console.error('Chyba při aktualizaci wanted položky:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se aktualizovat wanted položku' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const { token } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID položky je povinné' },
        { status: 400 }
      )
    }
    
    // Ověřit, že událost existuje
    await getEventByToken(token)
    
    const wantedItem = await deleteWantedItem(id)
    
    return NextResponse.json(wantedItem)
  } catch (error) {
    console.error('Chyba při mazání wanted položky:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se smazat wanted položku' },
      { status: 500 }
    )
  }
} 