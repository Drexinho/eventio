'use client'

import { useEffect, useState } from 'react'
import { Event } from '@/types/database'
import { ParticipantsPanel } from '@/components/ParticipantsPanel'
import { TransportPanel } from '@/components/TransportPanel'
import { InventoryPanel } from '@/components/InventoryPanel'
import { AuditLog } from '@/components/AuditLog'
import { EditEventForm } from '@/components/EditEventForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EventPageProps {
  params: Promise<{ token: string }>
}

export default function EventPage({ params }: EventPageProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [eventToken, setEventToken] = useState<string>('')
  
  // Filtr pro zobrazování sekcí
  const [visibleSections, setVisibleSections] = useState({
    participants: true,
    transport: true,
    inventory: true,
    audit: false // Historie změn je skrytá podle požadavku
  })

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const { token } = await params
        setEventToken(token)
        
        const response = await fetch(`/api/events/${token}`)
        if (!response.ok) {
          throw new Error('Událost nebyla nalezena')
        }
        
        const eventData = await response.json()
        setEvent(eventData)
      } catch (error) {
        console.error('Chyba při načítání události:', error)
        alert('Nepodařilo se načíst událost')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [params])

  const handleEditSuccess = () => {
    setIsEditing(false)
    // Znovu načíst událost
    const loadEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventToken}`)
        if (response.ok) {
          const eventData = await response.json()
          setEvent(eventData)
        }
      } catch (error) {
        console.error('Chyba při načítání události:', error)
      }
    }
    loadEvent()
  }

  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const showAll = () => {
    setVisibleSections({
      participants: true,
      transport: true,
      inventory: true,
      audit: false
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Načítám událost...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-900/20 border border-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Událost nebyla nalezena</h2>
          <p className="text-slate-400">Zkontrolujte prosím odkaz nebo token události.</p>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(false)}
            className="mb-6 bg-slate-900/50 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all duration-300"
          >
            ← Zpět na událost
          </Button>
          <EditEventForm 
            event={event} 
            eventToken={eventToken} 
            onSuccess={handleEditSuccess}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        {/* Hero Card */}
        <Card className="mb-8 border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {event.name}
                </CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  📅 {new Date(event.start_date).toLocaleDateString('cs-CZ')} - {new Date(event.end_date).toLocaleDateString('cs-CZ')}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
              >
                ✏️ Upravit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Levý sloupec - informace */}
              <div className="space-y-6">
                {event.description && (
                  <p className="text-slate-300 text-lg leading-relaxed">{event.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
                    <p className="text-sm text-slate-400 mb-1">Maximální počet účastníků</p>
                    <p className="text-2xl font-bold text-cyan-400">{event.max_participants}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
                    <p className="text-sm text-slate-400 mb-1">Cena celkem</p>
                    <p className="text-2xl font-bold text-blue-400">{event.price} Kč</p>
                  </div>
                </div>

                <div className="text-center p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
                  <p className="text-sm text-slate-400 mb-1">Cena na jednoho</p>
                  <p className="text-2xl font-bold text-purple-400">{Math.ceil(event.price / Math.max(event.max_participants, 1))} Kč</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {event.map_link && (
                    <Button asChild variant="outline" className="bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:scale-105">
                      <a href={event.map_link} target="_blank" rel="noopener noreferrer">
                        🗺️ Mapa
                      </a>
                    </Button>
                  )}
                  
                  {event.booking_link && (
                    <Button asChild variant="outline" className="bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:scale-105">
                      <a href={event.booking_link} target="_blank" rel="noopener noreferrer">
                        🏰 Odkaz na ubytování
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Pravý sloupec - obrázek */}
              {event.image_url && (
                <div className="flex justify-center lg:justify-end">
                  <div className="relative group">
                    <img 
                      src={event.image_url} 
                      alt={event.name}
                      className="w-full max-w-2xl h-auto rounded-2xl shadow-2xl group-hover:shadow-cyan-500/25 transition-all duration-500 transform group-hover:scale-105"
                      style={{ width: '100%' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filtr sekcí */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant={visibleSections.participants && visibleSections.transport && visibleSections.inventory ? "default" : "outline"}
              size="sm"
              onClick={showAll}
              className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 py-4 ${(visibleSections.participants && visibleSections.transport && visibleSections.inventory) ? 'border-b-4 border-gradient-to-r from-cyan-500 to-blue-500' : ''}`}
            >
              Všechno
            </Button>
            <Button
              variant={visibleSections.participants ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSection('participants')}
              className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 py-4 ${visibleSections.participants ? 'border-b-4 border-gradient-to-r from-blue-500 to-purple-500' : ''}`}
            >
              👥 Účastníci
            </Button>
            <Button
              variant={visibleSections.transport ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSection('transport')}
              className={`w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 py-4 ${visibleSections.transport ? 'border-b-4 border-gradient-to-r from-purple-500 to-cyan-500' : ''}`}
            >
              🚗 Doprava
            </Button>
            <Button
              variant={visibleSections.inventory ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSection('inventory')}
              className={`w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white border-0 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 py-4 ${visibleSections.inventory ? 'border-b-4 border-gradient-to-r from-cyan-500 to-green-500' : ''}`}
            >
              📦 Inventář
            </Button>
          </div>
        </div>

        {/* Sekce - zobrazují se podle filtru */}
        {(visibleSections.participants || visibleSections.transport || visibleSections.inventory) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {visibleSections.participants && (
              <div className="transform hover:scale-[1.02] transition-all duration-300 bg-slate-900/20 rounded-2xl p-4">
                <ParticipantsPanel eventToken={eventToken} />
              </div>
            )}
            {visibleSections.transport && (
              <div className="transform hover:scale-[1.02] transition-all duration-300 bg-slate-900/20 rounded-2xl p-4">
                <TransportPanel eventToken={eventToken} />
              </div>
            )}
            {visibleSections.inventory && (
              <div className="transform hover:scale-[1.02] transition-all duration-300 bg-slate-900/20 rounded-2xl p-4">
                <InventoryPanel eventToken={eventToken} />
              </div>
            )}
          </div>
        )}

        {/* Zobrazení když není nic vybrané */}
        {!visibleSections.participants && !visibleSections.transport && !visibleSections.inventory && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Vyberte sekci</h3>
            <p className="text-slate-400">Vyberte alespoň jednu sekci pro zobrazení</p>
          </div>
        )}
      </div>
    </div>
  )
} 