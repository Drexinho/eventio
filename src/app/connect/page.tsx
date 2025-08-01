'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ConnectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Získat hash z URL parametru
    const hash = searchParams.get('hash')
    
    if (hash) {
      // Přesměrovat na join stránku s hashem
      router.push(`/join?hash=${hash}`)
    } else {
      // Pokud není hash, přesměrovat na join stránku
      router.push('/join')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300 text-lg">Připojuji...</p>
      </div>
    </div>
  )
} 