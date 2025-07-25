import { NextRequest, NextResponse } from 'next/server'
import { assignParticipantToTransport, removeParticipantFromTransport } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { transportId, participantId } = await request.json()
    
    const assignment = await assignParticipantToTransport(transportId, participantId)
    return NextResponse.json(assignment)
  } catch (error) {
    console.error('API: Chyba při přiřazování účastníka:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se přiřadit účastníka' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { transportId, participantId } = await request.json()
    
    await removeParticipantFromTransport(transportId, participantId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API: Chyba při odebírání účastníka:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se odebrat účastníka' },
      { status: 500 }
    )
  }
} 