'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDBPage() {
  const [status, setStatus] = useState<string>('Testuji...')
  const [error, setError] = useState<string | null>(null)
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    async function testDatabase() {
      try {
        setStatus('Testuji připojení k databázi...')
        
        // Test 1: Základní připojení
        const { data, error: connectionError } = await supabase
          .from('events')
          .select('count')
          .limit(1)
        
        if (connectionError) {
          console.error('Connection error:', connectionError)
          throw new Error(`Chyba připojení: ${connectionError.message} (${connectionError.code})`)
        }
        
        setStatus('Připojení OK. Testuji vytvoření události...')
        
        // Test 2: Vytvoření testovací události
        const testEventData = {
          name: 'Testovací událost',
          description: 'Test pro ověření databáze',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          max_participants: 5,
          price: 1000,
          access_token: 'test-' + Date.now(),
          access_type: 'link' as const
        }
        
        const { data: insertData, error: insertError } = await supabase
          .from('events')
          .insert(testEventData)
          .select()
          .single()
        
        if (insertError) {
          console.error('Insert error:', insertError)
          throw new Error(`Chyba při vytváření: ${insertError.message} (${insertError.code})`)
        }
        
        setStatus('✅ Databáze funguje správně!')
        setDetails({
          connection: 'OK',
          insert: 'OK',
          createdEvent: insertData
        })
        
        // Smazat testovací událost
        await supabase
          .from('events')
          .delete()
          .eq('id', insertData.id)
        
      } catch (err) {
        console.error('Test error:', err)
        setError(err instanceof Error ? err.message : 'Neznámá chyba')
        setStatus('❌ Test selhal')
        setDetails({
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }
    
    testDatabase()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Test databáze</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">Status:</h2>
        <p className="text-lg">{status}</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h3 className="font-semibold">Chyba:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {details && (
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Detaily:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6">
        <a 
          href="/create" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Zkusit vytvořit událost
        </a>
      </div>
    </div>
  )
} 