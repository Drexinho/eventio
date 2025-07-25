'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getEventByToken, setAccessToken, getAccessToken, clearAccessToken } from '@/lib/database'
import { isValidPIN } from '@/lib/utils'
import type { Event } from '@/types/database'

interface UseEventAccessReturn {
  event: Event | null
  isLoading: boolean
  error: string | null
  hasAccess: boolean
  validateAccess: (token: string) => Promise<boolean>
  logout: () => void
}

export function useEventAccess(token: string): UseEventAccessReturn {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()

  // Validace přístupu
  const validateAccess = async (accessToken: string): Promise<boolean> => {
    try {
      // Ověření formátu tokenu
      if (accessToken.length === 9 && !isValidPIN(accessToken)) {
        throw new Error('Neplatný formát PIN kódu')
      }

      // Načtení události z databáze
      const eventData = await getEventByToken(accessToken)
      
      if (!eventData) {
        throw new Error('Událost nebyla nalezena')
      }

      // Uložení tokenu do localStorage
      setAccessToken(accessToken)
      
      setEvent(eventData)
      setHasAccess(true)
      setError(null)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nepodařilo se ověřit přístup'
      setError(errorMessage)
      setHasAccess(false)
      setEvent(null)
      return false
    }
  }

  // Odhlášení
  const logout = () => {
    clearAccessToken()
    setEvent(null)
    setHasAccess(false)
    setError(null)
    router.push('/')
  }

  // Kontrola přístupu při načtení komponenty
  useEffect(() => {
    const checkAccess = async () => {
      if (!token) {
        setError('Chybí token pro přístup')
        setIsLoading(false)
        return
      }

      // Kontrola, zda máme uložený token
      const savedToken = getAccessToken()
      
      if (savedToken === token) {
        // Token je uložený, ověřit přístup
        await validateAccess(token)
      } else {
        // Nový token, ověřit a uložit
        await validateAccess(token)
      }
      
      setIsLoading(false)
    }

    checkAccess()
  }, [token])

  return {
    event,
    isLoading,
    error,
    hasAccess,
    validateAccess,
    logout
  }
} 