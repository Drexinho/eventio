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
    <Card className="bg-gradient-to-br from-slate-800/30 via-slate-700/40 to-slate-900/50 backdrop-blur-md border border-slate-600/30 shadow-2xl">
      <CardHeader className="border-b border-slate-600/40 py-1 px-2">
        <div className="flex justify-between items-center pl-3">
          <div>
            <CardTitle className="text-slate-100 flex items-center gap-2 text-lg font-semibold">
              <div className="p-1.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                🚗
              </div>
              Doprava
            </CardTitle>
            <CardDescription className="text-slate-300 mt-0.5 text-sm">
              Organizace dopravy
            </CardDescription>
          </div>
          <Button className="border border-slate-500/30 text-slate-100 bg-slate-700/50 hover:bg-slate-600/50 hover:text-slate-100 hover:border-slate-400/50 transition-all duration-300 shadow-lg mr-6"
            variant="outline"
            size="sm"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            {isFormOpen ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-6 space-y-6">
        {/* Formulář pro přidávání */}
        {isFormOpen && (
          <div className="mb-6 p-6 border border-slate-600/30 rounded-xl bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-800/30 backdrop-blur-sm shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-100" htmlFor="type">Typ dopravy *</Label>
                  <Input className="bg-slate-800/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
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

              <Button type="submit" disabled={isAdding} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0 hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg">
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
                  <div className="border border-slate-600/30 rounded-xl p-6 bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-800/30 backdrop-blur-sm shadow-xl hover:shadow-slate-500/25 transition-all duration-300 relative">
                    {/* Razítko "NAPLNĚNO" když je kapacita naplněna */}
                    {assignedCount >= transportItem.capacity && transportItem.capacity > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="bg-green-600/95 text-white font-bold text-2xl px-8 py-4 rounded-lg transform -rotate-12 shadow-2xl border-4 border-white/80 relative overflow-hidden">
                          {/* Texturovaný efekt gumového razítka */}
                          <div className="absolute inset-0 bg-gradient-to-br from-green-700/50 to-green-500/50 opacity-60"></div>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(0,0,0,0.1)_0%,transparent_50%)]"></div>
                          {/* Hlavní text s efektem */}
                          <div className="relative z-10 font-mono tracking-wider text-shadow-sm">
                            NAPLNĚNO
                          </div>
                        </div>
                      </div>
                    )}
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
                        className={editingId === transportItem.id ? "border-red-400 text-red-300 bg-slate-700/50 hover:bg-red-600/50 hover:text-white hover:border-red-400 transform hover:scale-105 transition-all duration-300 shadow-md" : "border-cyan-400 text-cyan-300 bg-slate-700/50 hover:bg-cyan-600/50 hover:text-white hover:border-cyan-400 transform hover:scale-105 transition-all duration-300 shadow-md"}
                      >
                        {editingId === transportItem.id ? "❌" : "✏️"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(transportItem.id)}
                        className="border-red-400 text-red-300 bg-slate-700/50 hover:bg-red-600/50 hover:text-white hover:border-red-400 transition-all duration-300 shadow-md"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-center p-4 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex flex-col items-center justify-center group">
                      <p className="text-xs text-cyan-300 mb-2 font-medium">Kapacita</p>
                      <p className="font-bold text-cyan-100 text-xl group-hover:text-cyan-50 transition-colors">{transportItem.capacity}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-xl border border-green-500/20 backdrop-blur-sm shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex flex-col items-center justify-center group">
                      <p className="text-xs text-green-300 mb-2 font-medium">Přiřazeno</p>
                      <p className="font-bold text-green-100 text-xl group-hover:text-green-50 transition-colors">{assignedCount}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-yellow-500/10 rounded-xl border border-orange-500/20 backdrop-blur-sm shadow-lg hover:shadow-orange-500/25 transition-all duration-300 flex flex-col items-center justify-center group">
                      <p className="text-xs text-orange-300 mb-2 font-medium">Cena celkem</p>
                      <p className="font-bold text-orange-100 text-xl group-hover:text-orange-50 transition-colors">{Math.round(transportItem.price)} Kč</p>
                    </div>
                    <div className={`text-center p-4 rounded-xl backdrop-blur-sm shadow-lg transition-all duration-500 flex flex-col items-center justify-center group ${
                      assignedCount >= transportItem.capacity && transportItem.capacity > 0
                        ? "bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 border border-green-400/40 shadow-green-500/30 hover:shadow-green-400/40 animate-pulse"
                        : "bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-500/20 hover:shadow-purple-500/25"
                    }`}>
                      <p className={`text-xs mb-2 font-medium ${
                        assignedCount >= transportItem.capacity && transportItem.capacity > 0
                          ? "text-green-300"
                          : "text-purple-300"
                      }`}>Na jednoho</p>
                      <p className={`font-bold text-xl transition-colors ${
                        assignedCount >= transportItem.capacity && transportItem.capacity > 0
                          ? "text-green-100 group-hover:text-green-50"
                          : "text-purple-100 group-hover:text-purple-50"
                      }`}>
                        {pricePerPerson} Kč
                      </p>
                    </div>
                  </div>

                  {/* Přiřazení účastníků */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-100">Přiřadit účastníky:</h4>
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
                            className={`h-auto px-2 py-1 text-sm whitespace-nowrap transition-all duration-300 ${
                              isAssigned 
                                ? "bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white border-2 border-emerald-400/60 rounded-full shadow-lg hover:shadow-emerald-500/25 hover:scale-105" 
                                : "bg-gradient-to-r from-slate-600/50 to-slate-700/50 text-slate-200 border-2 border-slate-500/40 rounded-full shadow-md hover:shadow-slate-500/25 hover:scale-105 hover:text-white"
                            }`}
                            onClick={() => {
                              if (isAssigned) {
                                removeParticipant(transportItem.id, participant.id)
                              } else {
                                assignParticipant(transportItem.id, participant.id)
                              }
                            }}
                          >
                            {isAssigned && <span className="mr-1">✓</span>}
                            {participant.name}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Editační formulář inline */}
                {editingId === transportItem.id && (
                  <div className="mt-4 p-6 border border-slate-600/30 rounded-xl bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-800/30 backdrop-blur-sm shadow-xl">
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

                      <div className="flex gap-3">
                        <Button type="submit" className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0 hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg">
                          Uložit změny
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancelEdit} className="border border-slate-500/50 text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 hover:text-slate-100 hover:border-slate-400/50 transition-all duration-300 shadow-md">
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