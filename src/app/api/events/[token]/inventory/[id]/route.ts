import { NextRequest, NextResponse } from 'next/server'
import { updateInventoryItem, deleteInventoryItem } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const item = await updateInventoryItem(id, body)
    return NextResponse.json(item)
  } catch (error) {
    console.error('API: Chyba při aktualizaci položky:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se aktualizovat položku' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  try {
    const { id } = await params
    await deleteInventoryItem(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API: Chyba při mazání položky:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se smazat položku' },
      { status: 500 }
    )
  }
} 