interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000 // 10 minut
  const maxAttempts = 5

  const entry = rateLimitStore.get(ip)
  
  if (!entry || now > entry.resetTime) {
    // Nové okno nebo vypršel čas
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs
    })
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTime: now + windowMs
    }
  }

  if (entry.count >= maxAttempts) {
    // Překročen limit
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }

  // Zvýšit počet pokusů
  entry.count++
  rateLimitStore.set(ip, entry)

  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetTime: entry.resetTime
  }
}

// Funkce pro reset rate-limit systému
export function resetRateLimit(): void {
  rateLimitStore.clear()
}

// Čištění starých záznamů každých 10 minut
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip)
    }
  }
}, 10 * 60 * 1000) 