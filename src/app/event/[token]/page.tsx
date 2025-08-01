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
  const [participantsCount, setParticipantsCount] = useState<number>(0)
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>(event?.payment_status || 'unpaid')
  
  // Filtr pro zobrazování sekcí
  const [visibleSections, setVisibleSections] = useState({
    participants: true,
    transport: true,
    inventory: true,
    audit: false // Historie změn je skrytá podle požadavku
  })

  // Funkce pro načítání počtu účastníků
  const loadParticipantsCount = async (token: string) => {
    try {
      const response = await fetch(`/api/events/${token}/participants`)
      if (response.ok) {
        const participants = await response.json()
        setParticipantsCount(participants.length)
      }
    } catch (error) {
      console.error('Chyba při načítání počtu účastníků:', error)
    }
  }

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
        setPaymentStatus(eventData.payment_status || 'unpaid')
        
        // Načíst počet účastníků
        await loadParticipantsCount(token)
      } catch (error) {
        console.error('Chyba při načítání události:', error)
        alert('Nepodařilo se načíst událost')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [params])

  // Automatické aktualizování počtu účastníků
  useEffect(() => {
    if (!eventToken) return

    const interval = setInterval(() => {
      loadParticipantsCount(eventToken)
    }, 5000) // Kontrola každých 5 sekund

    return () => clearInterval(interval)
  }, [eventToken])

  const handleEditSuccess = () => {
    setIsEditing(false)
    // Znovu načíst událost
    const loadEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventToken}`)
        if (response.ok) {
          const eventData = await response.json()
          setEvent(eventData)
          setPaymentStatus(eventData.payment_status || 'unpaid')
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
                className="bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                ✏️ Upravit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Levý sloupec - informace */}
              <div className="space-y-6 flex flex-col h-full">
                {event.description && (
                  <p className="text-slate-300 text-lg leading-relaxed">{event.description}</p>
                )}

                <div className="text-center p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col items-center justify-end mt-auto relative overflow-hidden">
                  <p className="text-sm text-slate-200 mb-1 relative z-10">Maximální počet účastníků</p>
                  <p className="text-2xl font-bold text-cyan-400 relative z-10">{event.max_participants}</p>
                  <p className="text-xs text-slate-300 mt-1 relative z-10">Aktuálně: {participantsCount}</p>
                  
                  {/* Fill effect */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-cyan-400/8 transition-all duration-1000 ease-out"
                    style={{ 
                      height: `${Math.min((participantsCount / event.max_participants) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Pravý sloupec - obrázek */}
              {event.image_url && (
                <div className="flex justify-center lg:justify-end">
                  <div className="w-full max-w-2xl flex flex-col h-full">
                    <div className="relative group">
                      <div className="w-full aspect-[16/12] rounded-2xl shadow-2xl overflow-hidden bg-slate-800/20">
                        <img 
                          src={event.image_url} 
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:shadow-cyan-500/25 transition-all duration-500 transform group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                    
                    {/* Pevná mezera pod obrázkem */}
                    <div className="h-8"></div>
                    
                    {/* Tlačítka a ceny od spodu */}
                    <div className="mt-auto space-y-6 mt-8">
                      {/* Tlačítka */}
                      <div className="flex flex-row gap-3">
                        {event.booking_link && (
                          <Button asChild variant="outline" className="flex-1 bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg py-3">
                            <a href={event.booking_link} target="_blank" rel="noopener noreferrer">
                              🏰 Odkaz na ubytování
                            </a>
                          </Button>
                        )}
                        
                        {event.map_link && (
                          <Button asChild variant="outline" className="flex-1 bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg py-3">
                            <a href={event.map_link} target="_blank" rel="noopener noreferrer">
                              🗺️ Lokace ubytování
                            </a>
                          </Button>
                        )}
                      </div>

                      {/* Ceny */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col items-center justify-end">
                          <p className="text-sm text-slate-200 mb-1">Cena na jednoho při naplnění kapacity</p>
                          <p className="text-2xl font-bold text-purple-400">{Math.round(event.price / Math.max(event.max_participants, 1))} Kč</p>
                          <p className="text-sm text-slate-200 mt-1">Aktuálně: {participantsCount > 0 ? Math.round(event.price / participantsCount) : 0} Kč</p>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col items-center justify-end">
                          <p className="text-sm text-slate-200 mb-1">Cena celkem</p>
                          <p className="text-2xl font-bold text-blue-400">{Math.round(event.price)} Kč</p>
                          <p className="text-sm text-slate-200 mt-1">
                            Stav: {paymentStatus === 'paid' ? 
                              <span className="text-green-400">✓ Zaplaceno</span> : 
                              <span className="text-red-400">✗ Nezaplaceno</span>
                            }
                          </p>
                        </div>
                      </div>
                    </div>
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
              className={`w-full bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg py-4 ${(visibleSections.participants && visibleSections.transport && visibleSections.inventory) ? 'border-b-4 border-cyan-400' : ''}`}
            >
              Všechno
            </Button>
            <Button
              variant={visibleSections.participants ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSection('participants')}
              className={`w-full bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg py-4 ${visibleSections.participants ? 'border-b-4 border-cyan-400' : ''}`}
            >
              👥 Účastníci
            </Button>
            <Button
              variant={visibleSections.transport ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSection('transport')}
              className={`w-full bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg py-4 ${visibleSections.transport ? 'border-b-4 border-cyan-400' : ''}`}
            >
              🚗 Doprava
            </Button>
            <Button
              variant={visibleSections.inventory ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSection('inventory')}
              className={`w-full bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg py-4 ${visibleSections.inventory ? 'border-b-4 border-cyan-400' : ''}`}
            >
              📦 Inventář
            </Button>
          </div>
        </div>

        {/* Sekce - zobrazují se podle filtru */}
        {(visibleSections.participants || visibleSections.transport || visibleSections.inventory) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 items-start auto-rows-min [&>*:nth-child(odd)]:mb-0 [&>*:nth-child(even)]:mb-0 [&>*:nth-child(3)]:lg:col-start-1">
            {visibleSections.participants && (
              <div className="transform hover:scale-[1.02] transition-all duration-300">
                <ParticipantsPanel eventToken={eventToken} />
              </div>
            )}
            {visibleSections.transport && (
              <div className="transform hover:scale-[1.02] transition-all duration-300">
                <TransportPanel eventToken={eventToken} />
              </div>
            )}
            {visibleSections.inventory && (
              <div className="transform hover:scale-[1.02] transition-all duration-300">
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