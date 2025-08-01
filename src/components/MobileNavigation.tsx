'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MobileNavigationProps {
  eventId?: string
}

export default function MobileNavigation({ eventId }: MobileNavigationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkMobile = () => {
      setIsVisible(window.innerWidth <= 767)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isVisible) return null

  const navItems = eventId ? [
    {
      href: `/event/${eventId}`,
      icon: '📋',
      label: 'Přehled',
      active: pathname === `/event/${eventId}`
    },
    {
      href: `/event/${eventId}/participants`,
      icon: '👥',
      label: 'Účastníci',
      active: pathname.includes('/participants')
    },
    {
      href: `/event/${eventId}/transport`,
      icon: '🚗',
      label: 'Doprava',
      active: pathname.includes('/transport')
    },
    {
      href: `/event/${eventId}/inventory`,
      icon: '📦',
      label: 'Inventář',
      active: pathname.includes('/inventory')
    }
  ] : [
    {
      href: '/',
      icon: '🏠',
      label: 'Domů',
      active: pathname === '/'
    },
    {
      href: '/create',
      icon: '➕',
      label: 'Vytvořit',
      active: pathname === '/create'
    },
    {
      href: '/connect',
      icon: '🔗',
      label: 'Připojit',
      active: pathname === '/connect'
    }
  ]

  return (
    <nav className="mobile-nav mobile-safe-area">
      <div className="mobile-nav-content">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${item.active ? 'active' : ''}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
} 