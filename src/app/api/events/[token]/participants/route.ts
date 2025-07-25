import { NextRequest, NextResponse } from 'next/server'
import { getParticipants, addParticipant, deleteParticipant } from '@/lib/database'
import { getEventByToken } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const event = await getEventByToken(token)
    const participants = await getParticipants(event.id)
    return NextResponse.json(participants)
  } catch (error) {
    console.error('API: Chyba při získávání účastníků:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se získat účastníky' },
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
    
    const participant = await addParticipant(event.id, body)
    
    return NextResponse.json(participant)
  } catch (error) {
    console.error('API: Chyba při přidávání účastníka:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se přidat účastníka' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('id')
    
    if (!participantId) {
      return NextResponse.json(
        { error: 'Chybí ID účastníka' },
        { status: 400 }
      )
    }
    
    await deleteParticipant(participantId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API: Chyba při mazání účastníka:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se smazat účastníka' },
      { status: 500 }
    )
  }
} 