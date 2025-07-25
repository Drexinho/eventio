'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'

const transportSchema = z.object({
  type: z.string().min(1, 'Typ dopravy je povinný'),
  departure_location: z.string().optional(),
  departure_time: z.string().optional(),
  arrival_location: z.string().optional(),
  intermediate_stops: z.array(z.object({
    location: z.string(),
    time: z.string().optional(),
    notes: z.string().optional()
  })),
  capacity: z.number().min(0, 'Kapacita nemůže být záporná'),
  price: z.number().min(0, 'Cena nemůže být záporná'),
  notes: z.string().optional()
})

type TransportFormData = z.infer<typeof transportSchema>

interface TransportPanelProps {
  eventToken: string
}

export function TransportPanel({ eventToken }: TransportPanelProps) {
  const [transport, setTransport] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TransportFormData>({
    resolver: zodResolver(transportSchema),
    defaultValues: {
      type: '',
      departure_location: '',
      departure_time: '',
      arrival_location: '',
      intermediate_stops: [],
      capacity: 0,
      price: 0,
      notes: ''
    }
  })

  const loadData = async () => {
    try {
      const [transportResponse, participantsResponse] = await Promise.all([
        fetch(`/api/events/${eventToken}/transport`),
        fetch(`/api/events/${eventToken}/participants`)
      ])

      if (transportResponse.ok) {
        const transportData = await transportResponse.json()
        setTransport(transportData)
      }

      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json()
        setParticipants(participantsData)
      }
    } catch (error) {
      console.error('Chyba při načítání dat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [eventToken])

  const onSubmit = async (data: TransportFormData) => {
    setIsAdding(true)
    try {
      const response = await fetch(`/api/events/${eventToken}/transport`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: data.type,
          departure_location: data.departure_location || null,
          departure_time: data.departure_time || null,
          arrival_location: data.arrival_location || null,
          intermediate_stops: data.intermediate_stops,
          capacity: data.capacity,
          price: data.price,
          notes: data.notes || null
        }),
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se přidat dopravu')
      }

      await loadData()
      reset()
      setIsFormOpen(false)
    } catch (error) {
      console.error('Chyba při přidávání dopravy:', error)
      alert('Nepodařilo se přidat dopravu')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (transportId: string) => {
    if (!confirm('Opravdu chcete smazat tuto dopravu?')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventToken}/transport/${transportId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat dopravu')
      }

      await loadData()
    } catch (error) {
      console.error('Chyba při mazání dopravy:', error)
      alert('Nepodařilo se smazat dopravu')
    }
  }

  const handleEdit = (transportItem: any) => {
    setEditingId(transportItem.id)
    setValue('type', transportItem.type)
    setValue('departure_location', transportItem.departure_location || '')
    setValue('departure_time', transportItem.departure_time || '')
    setValue('arrival_location', transportItem.arrival_location || '')
    setValue('intermediate_stops', transportItem.intermediate_stops?.map((stop: any) => ({
      location: stop.location,
      time: stop.time || undefined,
      notes: stop.notes || undefined
    })) || [])
    setValue('capacity', transportItem.capacity)
    setValue('price', transportItem.price)
    setValue('notes', transportItem.notes || '')
  }

  const handleSaveEdit = async (data: TransportFormData) => {
    if (!editingId) return

    try {
      const response = await fetch(`/api/events/${eventToken}/transport/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: data.type,
          departure_location: data.departure_location || null,
          departure_time: data.departure_time || null,
          arrival_location: data.arrival_location || null,
          intermediate_stops: data.intermediate_stops,
          capacity: data.capacity,
          price: data.price,
          notes: data.notes || null
        }),
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se aktualizovat dopravu')
      }

      await loadData()
      setEditingId(null)
      reset()
    } catch (error) {
      console.error('Chyba při aktualizaci dopravy:', error)
      alert('Nepodařilo se aktualizovat dopravu')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    reset()
  }

  const assignParticipant = async (transportId: string, participantId: string) => {
    try {
      const response = await fetch(`/api/events/${eventToken}/transport/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transportId, participantId }),
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se přiřadit účastníka')
      }

      await loadData()
    } catch (error) {
      console.error('Chyba při přiřazování účastníka:', error)
      alert('Nepodařilo se přiřadit účastníka')
    }
  }

  const removeParticipant = async (transportId: string, participantId: string) => {
    try {
      const response = await fetch(`/api/events/${eventToken}/transport/assign`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transportId, participantId }),
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se odebrat účastníka')
      }

      await loadData()
    } catch (error) {
      console.error('Chyba při odebírání účastníka:', error)
      alert('Nepodařilo se odebrat účastníka')
    }
  }

  if (isLoading) {
    return <div>Načítám dopravu...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>🚗 Doprava</CardTitle>
            <CardDescription>
              Správa dopravních možností
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            {isFormOpen ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Formulář pro přidávání */}
        {isFormOpen && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Typ dopravy *</Label>
                  <Input
                    id="type"
                    {...register('type')}
                    placeholder="Auto, vlak, autobus..."
                  />
                  {errors.type && (
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Kapacita</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    {...register('capacity', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.capacity && (
                    <p className="text-sm text-red-500">{errors.capacity.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure_location">Místo odjezdu</Label>
                  <Input
                    id="departure_location"
                    {...register('departure_location')}
                    placeholder="Praha, Hlavní nádraží"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departure_time">Čas odjezdu</Label>
                  <Input
                    id="departure_time"
                    type="time"
                    {...register('departure_time')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrival_location">Místo příjezdu</Label>
                <Input
                  id="arrival_location"
                  {...register('arrival_location')}
                  placeholder="Brno, Hlavní nádraží"
                />
              </div>

              {/* Mezizastávky */}
              <div className="space-y-4">
                <Label>Mezizastávky</Label>
                <div className="space-y-2">
                  {watch('intermediate_stops').map((stop, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border rounded">
                      <Input
                        placeholder="Lokalita"
                        value={stop.location}
                        onChange={(e) => {
                          const newStops = [...watch('intermediate_stops')]
                          newStops[index].location = e.target.value
                          setValue('intermediate_stops', newStops)
                        }}
                      />
                      <Input
                        type="time"
                        placeholder="Čas"
                        value={stop.time || ''}
                        onChange={(e) => {
                          const newStops = [...watch('intermediate_stops')]
                          newStops[index].time = e.target.value || undefined
                          setValue('intermediate_stops', newStops)
                        }}
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Poznámky"
                          value={stop.notes || ''}
                          onChange={(e) => {
                            const newStops = [...watch('intermediate_stops')]
                            newStops[index].notes = e.target.value || undefined
                            setValue('intermediate_stops', newStops)
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newStops = watch('intermediate_stops').filter((_, i) => i !== index)
                            setValue('intermediate_stops', newStops)
                          }}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newStops = [...watch('intermediate_stops'), { location: '', time: undefined, notes: undefined }]
                      setValue('intermediate_stops', newStops)
                    }}
                  >
                    + Přidat mezizastávku
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Cena celkem (Kč)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Poznámky</Label>
                  <Input
                    id="notes"
                    {...register('notes')}
                    placeholder="Dodatečné informace"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isAdding}>
                {isAdding ? 'Přidávám...' : 'Přidat dopravu'}
              </Button>
            </form>
          </div>
        )}

        {/* Seznam dopravy */}
        <div className="space-y-4">
          {transport.map((transportItem) => {
            const assignedCount = transportItem.transport_assignments?.length || 0
            const pricePerPerson = Math.ceil(transportItem.price / Math.max(assignedCount, 1))

            return (
              <div key={transportItem.id}>
                {/* Doprava */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{transportItem.type}</h3>
                      {transportItem.departure_location && (
                        <p className="text-sm text-muted-foreground">
                          🚪 Odjezd: {transportItem.departure_location}
                        </p>
                      )}
                      {transportItem.arrival_location && (
                        <p className="text-sm text-muted-foreground">
                          🎯 Příjezd: {transportItem.arrival_location}
                        </p>
                      )}
                      {transportItem.departure_time && (
                        <p className="text-sm text-muted-foreground">
                          🕐 Čas odjezdu: {transportItem.departure_time}
                        </p>
                      )}
                      {transportItem.intermediate_stops && transportItem.intermediate_stops.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium">Mezizastávky:</p>
                          {transportItem.intermediate_stops.map((stop: any, index: number) => (
                            <div key={index} className="ml-2">
                              <p>📍 {stop.location}</p>
                              {stop.time && <p className="ml-4">🕐 {stop.time}</p>}
                              {stop.notes && <p className="ml-4">📝 {stop.notes}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                      {transportItem.notes && (
                        <p className="text-sm text-muted-foreground">
                          📝 {transportItem.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(transportItem)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(transportItem.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Kapacita</p>
                      <p className="font-semibold">{transportItem.capacity}</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Přiřazeno</p>
                      <p className="font-semibold">{assignedCount}</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Cena celkem</p>
                      <p className="font-semibold">{transportItem.price} Kč</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Cena na jednoho</p>
                      <p className="font-semibold">{pricePerPerson} Kč</p>
                    </div>
                  </div>

                  {/* Přiřazení účastníků */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Přiřadit účastníky:</h4>
                    <div className="flex flex-wrap gap-2">
                      {participants.map((participant) => {
                        const isAssigned = transportItem.transport_assignments?.some(
                          (assignment: any) => assignment.participant_id === participant.id
                        )

                        return (
                          <Button
                            key={participant.id}
                            variant={isAssigned ? "default" : "outline"}
                            size="sm"
                            className="h-auto px-3 py-1 text-sm whitespace-nowrap"
                            onClick={() => {
                              if (isAssigned) {
                                removeParticipant(transportItem.id, participant.id)
                              } else {
                                assignParticipant(transportItem.id, participant.id)
                              }
                            }}
                          >
                            {participant.name}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Editační formulář inline */}
                {editingId === transportItem.id && (
                  <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-medium mb-4">Upravit dopravu</h3>
                    <form onSubmit={handleSubmit(handleSaveEdit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_type">Typ dopravy *</Label>
                          <Input
                            id="edit_type"
                            {...register('type')}
                            placeholder="Auto, vlak, autobus..."
                          />
                          {errors.type && (
                            <p className="text-sm text-red-500">{errors.type.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit_capacity">Kapacita</Label>
                          <Input
                            id="edit_capacity"
                            type="number"
                            min="0"
                            {...register('capacity', { valueAsNumber: true })}
                            placeholder="0"
                          />
                          {errors.capacity && (
                            <p className="text-sm text-red-500">{errors.capacity.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_departure_location">Místo odjezdu</Label>
                          <Input
                            id="edit_departure_location"
                            {...register('departure_location')}
                            placeholder="Praha, Hlavní nádraží"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit_departure_time">Čas odjezdu</Label>
                          <Input
                            id="edit_departure_time"
                            type="time"
                            {...register('departure_time')}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit_arrival_location">Místo příjezdu</Label>
                        <Input
                          id="edit_arrival_location"
                          {...register('arrival_location')}
                          placeholder="Brno, Hlavní nádraží"
                        />
                      </div>

                      {/* Mezizastávky pro editaci */}
                      <div className="space-y-4">
                        <Label>Mezizastávky</Label>
                        <div className="space-y-2">
                          {watch('intermediate_stops').map((stop, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border rounded">
                              <Input
                                placeholder="Lokalita"
                                value={stop.location}
                                onChange={(e) => {
                                  const newStops = [...watch('intermediate_stops')]
                                  newStops[index].location = e.target.value
                                  setValue('intermediate_stops', newStops)
                                }}
                              />
                              <Input
                                type="time"
                                placeholder="Čas"
                                value={stop.time || ''}
                                onChange={(e) => {
                                  const newStops = [...watch('intermediate_stops')]
                                  newStops[index].time = e.target.value || undefined
                                  setValue('intermediate_stops', newStops)
                                }}
                              />
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Poznámky"
                                  value={stop.notes || ''}
                                  onChange={(e) => {
                                    const newStops = [...watch('intermediate_stops')]
                                    newStops[index].notes = e.target.value || undefined
                                    setValue('intermediate_stops', newStops)
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newStops = watch('intermediate_stops').filter((_, i) => i !== index)
                                    setValue('intermediate_stops', newStops)
                                  }}
                                >
                                  🗑️
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const newStops = [...watch('intermediate_stops'), { location: '', time: undefined, notes: undefined }]
                              setValue('intermediate_stops', newStops)
                            }}
                          >
                            + Přidat mezizastávku
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_price">Cena celkem (Kč)</Label>
                          <Input
                            id="edit_price"
                            type="number"
                            min="0"
                            {...register('price', { valueAsNumber: true })}
                            placeholder="0"
                          />
                          {errors.price && (
                            <p className="text-sm text-red-500">{errors.price.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit_notes">Poznámky</Label>
                          <Input
                            id="edit_notes"
                            {...register('notes')}
                            placeholder="Dodatečné informace"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit">
                          Uložit změny
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancelEdit}>
                          Zrušit
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )
          })}

          {transport.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Zatím není přidána žádná doprava
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 