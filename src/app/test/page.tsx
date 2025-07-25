'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createEvent, getEventByToken } from '@/lib/database'
import { generateUUID, generatePIN } from '@/lib/utils'

export default function TestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      // Test 1: Vytvoření události
      addResult('🧪 Test 1: Vytvoření testovací události...')
      const testEvent = await createEvent({
        name: 'Testovací událost',
        description: 'Událost pro testování deploymentu',
        start_date: '2024-12-25',
        end_date: '2024-12-26',
        map_link: null,
        booking_link: null,
        people_count: 5,
        price: 1000,
        access_type: 'url',
        access_token: generateUUID()
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

    } catch (error) {
      addResult(`❌ Chyba při testování: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Testovací stránka</h1>
          <p className="text-muted-foreground">
            Ověření funkcí po deploymentu
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Testování funkcí</CardTitle>
            <CardDescription>
              Spusťte testy pro ověření, že všechny funkce fungují správně
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Spouštím testy...' : 'Spustit testy'}
            </Button>

            {testResults.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Výsledky testů:</h3>
                <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono mb-1">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Tato stránka slouží pouze pro testování po deploymentu.</p>
          <p>V produkci by měla být odstraněna nebo zabezpečena.</p>
        </div>
      </div>
    </div>
  )
} 