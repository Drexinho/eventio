import { NextRequest, NextResponse } from 'next/server'
import { getAuditLogs } from '@/lib/database'
import { getEventByToken } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const event = await getEventByToken(token)
    const auditLogs = await getAuditLogs(event.id)
    return NextResponse.json(auditLogs)
  } catch (error) {
    console.error('API: Chyba při získávání audit logů:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se získat audit logy' },
      { status: 500 }
    )
  }
} 