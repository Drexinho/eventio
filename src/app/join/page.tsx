'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isValidPIN } from '@/lib/utils'

export default function JoinEventPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!token.trim()) {
      setError('Zadejte odkaz nebo PIN kód')
      setIsLoading(false)
      return
    }

    // Pokud je to PIN, ověřit formát
    if (token.length === 9 && !isValidPIN(token)) {
      setError('PIN kód musí obsahovat 9 číslic')
      setIsLoading(false)
      return
    }

    try {
      // Přesměrování na detail události
      router.push(`/event/${token}`)
    } catch {
      setError('Nepodařilo se připojit k události')
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Připojit se k události</h1>
          <p className="text-muted-foreground">
            Zadejte odkaz nebo PIN kód události
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Přístup k události</CardTitle>
            <CardDescription>
              Vložte odkaz nebo 9-místný PIN kód, který jste obdrželi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Odkaz nebo PIN kód</Label>
                <Input
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="https://... nebo 123456789"
                  className="font-mono"
                />
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Připojuji...' : 'Připojit se'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Nemáte odkaz nebo PIN? Požádejte organizátora události.</p>
        </div>
      </div>
    </div>
  )
} 