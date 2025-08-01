import { NextRequest, NextResponse } from 'next/server'
import { resetRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    resetRateLimit()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Rate limit byl resetován' 
    })
  } catch (error) {
    console.error('Chyba při resetování rate limit:', error)
    return NextResponse.json(
      { error: 'Chyba při resetování rate limit' },
      { status: 500 }
    )
  }
} 