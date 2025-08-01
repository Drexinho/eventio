'use client'

import { ReactNode } from 'react'

interface MobileWrapperProps {
  children: ReactNode
  className?: string
  mobileClassName?: string
}

export default function MobileWrapper({ 
  children, 
  className = '', 
  mobileClassName = '' 
}: MobileWrapperProps) {
  return (
    <div className={`${className} ${mobileClassName}`}>
      {children}
    </div>
  )
}

// Speciální mobilní wrapper pro různé typy komponent
export function MobileCardWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-card">
      {children}
    </div>
  )
}

export function MobileButtonWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-button">
      {children}
    </div>
  )
}

export function MobileFormWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-form">
      {children}
    </div>
  )
}

export function MobilePanelWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-panel">
      {children}
    </div>
  )
}

export function MobileListWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-list">
      {children}
    </div>
  )
}

export function MobileContainerWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-container">
      {children}
    </div>
  )
} 