// Mobilní utility funkce

// Detekce mobilního zařízení
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
         window.innerWidth <= 767
}

// Detekce touch zařízení
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Detekce landscape orientace
export function isLandscape(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth > window.innerHeight
}

// Safe area insets pro iPhone
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 }
  
  const style = getComputedStyle(document.documentElement)
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0')
  }
}

// Mobilní viewport height (bez adresního řádku)
export function getMobileViewportHeight(): number {
  if (typeof window === 'undefined') return 0
  return window.innerHeight
}

// Mobilní viewport width
export function getMobileViewportWidth(): number {
  if (typeof window === 'undefined') return 0
  return window.innerWidth
}

// Vibrate API pro haptic feedback
export function vibrate(pattern: number | number[] = 50): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

// Mobilní scroll to top
export function scrollToTop(smooth: boolean = true): void {
  if (typeof window === 'undefined') return
  
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

// Mobilní scroll to element
export function scrollToElement(elementId: string, offset: number = 0): void {
  if (typeof window === 'undefined') return
  
  const element = document.getElementById(elementId)
  if (element) {
    const rect = element.getBoundingClientRect()
    const scrollTop = window.pageYOffset + rect.top - offset
    
    window.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    })
  }
}

// Mobilní keyboard detection
export function isKeyboardOpen(): boolean {
  if (typeof window === 'undefined') return false
  
  const visualViewport = (window as any).visualViewport
  if (visualViewport) {
    return visualViewport.height < window.innerHeight * 0.8
  }
  
  return false
}

// Mobilní orientation change handler
export function onOrientationChange(callback: (isLandscape: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  
  const handleOrientationChange = () => {
    callback(isLandscape())
  }
  
  window.addEventListener('orientationchange', handleOrientationChange)
  window.addEventListener('resize', handleOrientationChange)
  
  return () => {
    window.removeEventListener('orientationchange', handleOrientationChange)
    window.removeEventListener('resize', handleOrientationChange)
  }
}

// Mobilní prevent zoom on input focus
export function preventZoomOnFocus(): void {
  if (typeof document === 'undefined') return
  
  const inputs = document.querySelectorAll('input, textarea, select')
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      }
    })
    
    input.addEventListener('blur', () => {
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1')
      }
    })
  })
}

// Mobilní CSS třídy helper
export function getMobileClasses(baseClasses: string, mobileClasses: string): string {
  return `${baseClasses} ${mobileClasses}`
}

// Mobilní breakpoint helper
export function getBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  
  if (width <= 767) return 'mobile'
  if (width <= 1023) return 'tablet'
  return 'desktop'
} 