import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/database'

export async function GET() {
  try {
    const result = await testConnection()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Databáze funguje správně',
        time: result.time
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('API: Chyba při testování databáze:', error)
    return NextResponse.json(
      { success: false, error: 'Nepodařilo se otestovat databázi' },
      { status: 500 }
    )
  }
} 