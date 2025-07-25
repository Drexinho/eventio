import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Kontrola přístupu k událostem
  if (request.nextUrl.pathname.startsWith('/event/')) {
    const token = request.nextUrl.pathname.split('/')[2]
    
    // Pokud je token prázdný, přesměrovat na join stránku
    if (!token) {
      return NextResponse.redirect(new URL('/join', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/event/:path*',
    '/join'
  ]
} 