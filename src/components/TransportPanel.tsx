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
    <Card className="bg-transparent border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-slate-100">🚗 Doprava</CardTitle>
            <CardDescription className="text-slate-100">
              Správa dopravních možností
            </CardDescription>
          </div>
          <Button className="border-0 text-slate-100 bg-slate-800/50 hover:bg-slate-700 hover:text-slate-100 hover:border-0"
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
          <div className="mb-6 p-4 border-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-100" htmlFor="type">Typ dopravy *</Label>
                  <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                    id="type"
                    {...register('type')}
                    placeholder="Auto, vlak, autobus..."
                  />
                  {errors.type && (
                    <p className="text-sm text-slate-100">{errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-100" htmlFor="capacity">Kapacita</Label>
                  <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                    id="capacity"
                    type="number"
                    min="0"
                    {...register('capacity', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.capacity && (
                    <p className="text-sm text-slate-100">{errors.capacity.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-100" htmlFor="departure_location">Místo odjezdu</Label>
                  <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                    id="departure_location"
                    {...register('departure_location')}
                    placeholder="Praha, Hlavní nádraží"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-100" htmlFor="departure_time">Čas odjezdu</Label>
                  <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                    id="departure_time"
                    type="time"
                    {...register('departure_time')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-100" htmlFor="arrival_location">Místo příjezdu</Label>
                <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                  id="arrival_location"
                  {...register('arrival_location')}
                  placeholder="Brno, Hlavní nádraží"
                />
              </div>

              {/* Mezizastávky */}
              <div className="space-y-4">
                <Label className="text-slate-100">Mezizastávky</Label>
                <div className="space-y-2">
                  {watch('intermediate_stops').map((stop, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border-0 rounded">
                      <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                        placeholder="Lokalita"
                        value={stop.location}
                        onChange={(e) => {
                          const newStops = [...watch('intermediate_stops')]
                          newStops[index].location = e.target.value
                          setValue('intermediate_stops', newStops)
                        }}
                      />
                      <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
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
                        <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                          placeholder="Poznámky"
                          value={stop.notes || ''}
                          onChange={(e) => {
                            const newStops = [...watch('intermediate_stops')]
                            newStops[index].notes = e.target.value || undefined
                            setValue('intermediate_stops', newStops)
                          }}
                        />
                        <Button className="bg-slate-800 text-slate-100 border-red-500 hover:bg-red-600 hover:text-slate-100 hover:border-red-600 transition-all duration-300"
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
                    className="bg-slate-800 text-slate-100 border-0 hover:bg-slate-700 hover:text-slate-100 hover:border-0 transition-all duration-300"
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-100" htmlFor="price">Cena celkem (Kč)</Label>
                  <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                    id="price"
                    type="number"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.price && (
                    <p className="text-sm text-slate-100">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-100" htmlFor="notes">Poznámky</Label>
                  <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                    id="notes"
                    {...register('notes')}
                    placeholder="Dodatečné informace"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isAdding} className="bg-slate-800 text-slate-100 border-red-500 hover:bg-red-600 hover:text-slate-100 hover:border-red-600 transition-all duration-300">
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
                <div className="border-0 rounded-lg p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm shadow-lg hover:shadow-slate-500/25 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-100">{transportItem.type}</h3>
                      {transportItem.departure_location && (
                        <p className="text-sm text-slate-100">
                          🚪 Odjezd: {transportItem.departure_location}
                        </p>
                      )}
                      {transportItem.arrival_location && (
                        <p className="text-sm text-slate-100">
                          🎯 Příjezd: {transportItem.arrival_location}
                        </p>
                      )}
                      {transportItem.departure_time && (
                        <p className="text-sm text-slate-100">
                          🕐 Čas odjezdu: {transportItem.departure_time}
                        </p>
                      )}
                      {transportItem.intermediate_stops && transportItem.intermediate_stops.length > 0 && (
                        <div className="text-sm text-slate-100">
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
                        <p className="text-sm text-slate-100">
                          📝 {transportItem.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editingId === transportItem.id ? handleCancelEdit() : handleEdit(transportItem)}
                        className={editingId === transportItem.id ? "border-red-500 text-red-400 bg-slate-800/50 hover:bg-red-600 hover:text-white hover:border-red-600 transform hover:scale-110 transition-all duration-300" : "border-cyan-500 text-cyan-400 bg-slate-800/50 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transform hover:scale-110 transition-all duration-300"}
                      >
                        {editingId === transportItem.id ? "❌" : "✏️"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(transportItem.id)}
                        className="bg-slate-800 text-slate-100 border-red-500 hover:bg-red-600 hover:text-slate-100 hover:border-red-600 transition-all duration-300"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center p-2 bg-slate-800 rounded">
                      <p className="text-xs text-slate-100">Kapacita</p>
                      <p className="font-medium text-slate-100">{transportItem.capacity}</p>
                    </div>
                    <div className="text-center p-2 bg-slate-800 rounded">
                      <p className="text-xs text-slate-100">Přiřazeno</p>
                      <p className="font-medium text-slate-100">{assignedCount}</p>
                    </div>
                    <div className="text-center p-2 bg-slate-800 rounded">
                      <p className="text-xs text-slate-100">Cena celkem</p>
                      <p className="font-medium text-slate-100">{transportItem.price} Kč</p>
                    </div>
                    <div className="text-center p-2 bg-slate-800 rounded">
                      <p className="text-xs text-slate-100">Cena na jednoho</p>
                      <p className="font-medium text-slate-100">{pricePerPerson} Kč</p>
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
                            className="h-auto px-3 py-1 text-sm whitespace-nowrap bg-slate-700/50 border-0 text-slate-100 hover:bg-slate-600 hover:text-slate-100 hover:border-0 transition-all duration-300"
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
                  <div className="mt-2 p-4 border-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm shadow-lg">
                    <h3 className="font-medium mb-4 text-slate-100">Upravit dopravu</h3>
                    <form onSubmit={handleSubmit(handleSaveEdit)} className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-100" htmlFor="edit_type">Typ dopravy *</Label>
                          <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                            id="edit_type"
                            {...register('type')}
                            placeholder="Auto, vlak, autobus..."
                          />
                          {errors.type && (
                            <p className="text-sm text-slate-100">{errors.type.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-100" htmlFor="edit_capacity">Kapacita</Label>
                          <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                            id="edit_capacity"
                            type="number"
                            min="0"
                            {...register('capacity', { valueAsNumber: true })}
                            placeholder="0"
                          />
                          {errors.capacity && (
                            <p className="text-sm text-slate-100">{errors.capacity.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-100" htmlFor="edit_departure_location">Místo odjezdu</Label>
                          <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                            id="edit_departure_location"
                            {...register('departure_location')}
                            placeholder="Praha, Hlavní nádraží"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-100" htmlFor="edit_departure_time">Čas odjezdu</Label>
                          <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                            id="edit_departure_time"
                            type="time"
                            {...register('departure_time')}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-100" htmlFor="edit_arrival_location">Místo příjezdu</Label>
                        <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                          id="edit_arrival_location"
                          {...register('arrival_location')}
                          placeholder="Brno, Hlavní nádraží"
                        />
                      </div>

                      {/* Mezizastávky pro editaci */}
                      <div className="space-y-4">
                        <Label className="text-slate-100">Mezizastávky</Label>
                        <div className="space-y-2">
                          {watch('intermediate_stops').map((stop, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border-0 rounded">
                              <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                                placeholder="Lokalita"
                                value={stop.location}
                                onChange={(e) => {
                                  const newStops = [...watch('intermediate_stops')]
                                  newStops[index].location = e.target.value
                                  setValue('intermediate_stops', newStops)
                                }}
                              />
                              <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
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
                                <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                                  placeholder="Poznámky"
                                  value={stop.notes || ''}
                                  onChange={(e) => {
                                    const newStops = [...watch('intermediate_stops')]
                                    newStops[index].notes = e.target.value || undefined
                                    setValue('intermediate_stops', newStops)
                                  }}
                                />
                                <Button className="bg-slate-800 text-slate-100 border-red-500 hover:bg-red-600 hover:text-slate-100 hover:border-red-600 transition-all duration-300"
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
                            type="button" className="bg-slate-800 text-slate-100 border-0 hover:bg-slate-700 hover:text-slate-100 hover:border-0 transition-all duration-300"
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

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-100" htmlFor="edit_price">Cena celkem (Kč)</Label>
                          <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                            id="edit_price"
                            type="number"
                            min="0"
                            {...register('price', { valueAsNumber: true })}
                            placeholder="0"
                          />
                          {errors.price && (
                            <p className="text-sm text-slate-100">{errors.price.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-100" htmlFor="edit_notes">Poznámky</Label>
                          <Input className="bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                            id="edit_notes"
                            {...register('notes')}
                            placeholder="Dodatečné informace"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="bg-slate-800 text-slate-100 border-0 hover:bg-slate-700 hover:text-slate-100 hover:border-0 transition-all duration-300">
                          Uložit změny
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancelEdit} className="bg-slate-800 text-slate-100 border-0 hover:bg-slate-700 hover:text-slate-100 hover:border-0 transition-all duration-300">
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
            <p className="text-center text-slate-100 py-4">
              Zatím není přidána žádná doprava
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 