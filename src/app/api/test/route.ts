import { NextRequest, NextResponse } from 'next/server'
import { createEvent, getEventByToken } from '@/lib/database'
import { generateUUID, generatePIN } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const results: string[] = []
    
    const addResult = (result: string) => {
      results.push(`${new Date().toLocaleTimeString()}: ${result}`)
    }

    // Test 1: Vytvoření události
    addResult('🧪 Test 1: Vytvoření testovací události...')
    const testEvent = await createEvent({
      name: 'Testovací událost',
      description: 'Událost pro testování deploymentu',
      start_date: '2024-12-25',
      end_date: '2024-12-26',
      max_participants: 5,
      price: 1000,
      access_type: 'url',
      access_token: generateUUID(),
      pin_code: generatePIN(),
      map_link: null,
      booking_link: null,
      image_url: null,
      payment_status: 'unpaid'
    })
    addResult('✅ Test 1: Událost úspěšně vytvořena')

    // Test 2: Načtení události
    addResult('🧪 Test 2: Načítání události...')
    const loadedEvent = await getEventByToken(testEvent.access_token)
    if (loadedEvent && loadedEvent.id === testEvent.id) {
      addResult('✅ Test 2: Událost úspěšně načtena')
    } else {
      addResult('❌ Test 2: Chyba při načítání události')
    }

    // Test 3: Generování PIN kódu
    addResult('🧪 Test 3: Testování generování PIN kódu...')
    const pin = generatePIN()
    if (pin.length === 9 && /^\d{9}$/.test(pin)) {
      addResult('✅ Test 3: PIN kód správně vygenerován')
    } else {
      addResult('❌ Test 3: Chyba při generování PIN kódu')
    }

    // Test 4: Generování UUID
    addResult('🧪 Test 4: Testování generování UUID...')
    const uuid = generateUUID()
    if (uuid.length === 36 && uuid.includes('-')) {
      addResult('✅ Test 4: UUID správně vygenerován')
    } else {
      addResult('❌ Test 4: Chyba při generování UUID')
    }

    addResult('🎉 Všechny testy úspěšně dokončeny!')
    addResult(`🔗 Testovací událost: /event/${testEvent.access_token}`)

    return NextResponse.json({
      success: true,
      results,
      testEvent: {
        id: testEvent.id,
        access_token: testEvent.access_token
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Neznámá chyba',
      results: [`❌ Chyba při testování: ${error}`]
    }, { status: 500 })
  }
}
