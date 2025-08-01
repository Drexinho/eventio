'use client'

import { ReactNode } from 'react'
import MobileNavigation from './MobileNavigation'

interface MobileEventLayoutProps {
  children: ReactNode
  eventId: string
}

export default function MobileEventLayout({ children, eventId }: MobileEventLayoutProps) {
  return (
    <div className="min-h-screen text-white mobile-container">
      {/* Mobilní header */}
      <div className="mobile-sticky mobile-panel-header">
        <div className="flex items-center justify-between">
          <h1 className="mobile-text-xl font-bold">EventPlanner</h1>
          <div className="flex gap-2">
            <button className="mobile-icon-button bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Hlavní obsah */}
      <div className="mobile-padding mobile-overflow-auto">
        {children}
      </div>

      {/* Mobilní navigace */}
      <MobileNavigation eventId={eventId} />
    </div>
  )
}

// Mobilní wrapper pro různé sekce
export function MobileEventSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="mobile-panel">
      <div className="mobile-panel-header">
        <h2 className="mobile-text-lg font-semibold">{title}</h2>
      </div>
      <div className="mobile-panel-content">
        {children}
      </div>
    </div>
  )
}

export function MobileEventCard({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-list-item">
      {children}
    </div>
  )
}

export function MobileEventButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="mobile-button bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold"
    >
      {children}
    </button>
  )
} 