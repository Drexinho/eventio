import { NextRequest, NextResponse } from 'next/server'
import { updateTransport, deleteTransport } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updatedTransport = await updateTransport(id, body)
    return NextResponse.json(updatedTransport)
  } catch (error) {
    console.error('API: Chyba při aktualizaci dopravy:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se aktualizovat dopravu' },
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
    
    await deleteTransport(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API: Chyba při mazání dopravy:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se smazat dopravu' },
      { status: 500 }
    )
  }
} 