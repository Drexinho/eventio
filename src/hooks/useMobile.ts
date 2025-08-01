'use client'

import { useState, useEffect } from 'react'

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setIsMobile(width <= 767)
      setIsLandscape(width > height && height < 500)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])

  return {
    isMobile,
    isLandscape,
    isMobileOrLandscape: isMobile || isLandscape
  }
}

// Hook pro mobilní touch události
export function useMobileTouch() {
  const [isTouching, setIsTouching] = useState(false)

  const handleTouchStart = () => setIsTouching(true)
  const handleTouchEnd = () => setIsTouching(false)

  return {
    isTouching,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd
    }
  }
}

// Hook pro mobilní scroll
export function useMobileScroll() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return {
    scrollY,
    isScrolled: scrollY > 50
  }
} 