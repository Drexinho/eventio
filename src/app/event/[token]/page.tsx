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

  if (isLoading) {
    return <div className="container mx-auto p-4">Načítám událost...</div>
  }

  if (!event) {
    return <div className="container mx-auto p-4">Událost nebyla nalezena</div>
  }

  if (isEditing) {
    return (
      <div className="container mx-auto p-4">
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(false)}
          className="mb-4"
        >
          ← Zpět na událost
        </Button>
        <EditEventForm 
          event={event} 
          eventToken={eventToken} 
          onSuccess={handleEditSuccess}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{event.name}</CardTitle>
              <CardDescription>
                {new Date(event.start_date).toLocaleDateString('cs-CZ')} - {new Date(event.end_date).toLocaleDateString('cs-CZ')}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
            >
              ✏️ Upravit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Levý sloupec - informace */}
            <div className="space-y-4">
              {event.description && (
                <p className="text-muted-foreground">{event.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Maximální počet účastníků</p>
                  <p className="text-xl font-bold">{event.max_participants}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Cena celkem</p>
                  <p className="text-xl font-bold">{event.price} Kč</p>
                </div>
              </div>

              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Cena na jednoho</p>
                <p className="text-xl font-bold">{Math.ceil(event.price / Math.max(event.max_participants, 1))} Kč</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {event.map_link && (
                  <Button asChild variant="outline">
                    <a href={event.map_link} target="_blank" rel="noopener noreferrer">
                      🗺️ Mapa
                    </a>
                  </Button>
                )}
                
                {event.booking_link && (
                  <Button asChild variant="outline">
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
                <img 
                  src={event.image_url} 
                  alt={event.name}
                  className="w-full max-w-md h-auto rounded-lg shadow-md"
                  style={{ width: '60%' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Účastníci a Doprava */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <ParticipantsPanel eventToken={eventToken} />
        </div>
        <div>
          <TransportPanel eventToken={eventToken} />
        </div>
      </div>

      {/* Inventář a Historie změn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <InventoryPanel eventToken={eventToken} />
        </div>
        <div>
          <AuditLog eventToken={eventToken} />
        </div>
      </div>
    </div>
  )
} 