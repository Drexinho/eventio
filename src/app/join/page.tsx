'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function JoinEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hash, setHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Načíst hash z URL parametru
  useEffect(() => {
    const urlHash = searchParams.get('hash')
    if (urlHash) {
      setHash(urlHash)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hash.trim()) {
      setError('Zadejte hash události')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/events/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash: hash.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/event/${data.access_token}`)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Nepodařilo se připojit k události')
      }
    } catch (error) {
      setError('Nepodařilo se připojit k události')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-4 shadow-xl">
              <span className="text-2xl">🔗</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Připojit se k události
            </CardTitle>
            <CardDescription className="text-slate-300">
              Zadejte odkaz nebo hash události
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="hash" className="block text-sm font-medium text-slate-300 mb-2">
                  Odkaz nebo hash
                </label>
                <Input
                  id="hash"
                  type="text"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="t1e2s3t4i5n6g7o8n9e0"
                  className="w-full bg-slate-800/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !hash.trim()}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 hover:shadow-lg transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Připojování...
                  </div>
                ) : (
                  <>
                    <span className="mr-2">🔗</span>
                    Připojit se
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300"
              >
                ← Zpět na hlavní stránku
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 