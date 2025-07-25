import { NextRequest, NextResponse } from 'next/server'
import { updateParticipant } from '@/lib/database'
import { deleteParticipant } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const participant = await updateParticipant(id, body)
    return NextResponse.json(participant)
  } catch (error) {
    console.error('API: Chyba při aktualizaci účastníka:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se aktualizovat účastníka' },
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
    
    await deleteParticipant(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API: Chyba při mazání účastníka:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se smazat účastníka' },
      { status: 500 }
    )
  }
} 