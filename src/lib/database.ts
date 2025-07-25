// Nahrazení Supabase za PostgreSQL
export * from './database-postgresql'

// Utility funkce pro nastavení access tokenu (zachováno pro kompatibilitu)
export const setAccessToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('event_access_token', token)
  }
}

export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('event_access_token')
  }
  return null
}

export const clearAccessToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('event_access_token')
  }
} 