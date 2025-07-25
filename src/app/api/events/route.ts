import { NextRequest, NextResponse } from 'next/server'
import { createEvent } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('API: Vytvářím událost s daty:', body)
    
    const event = await createEvent(body)
    
    return NextResponse.json(event)
  } catch (error) {
    console.error('API: Chyba při vytváření události:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit událost' },
      { status: 500 }
    )
  }
} 