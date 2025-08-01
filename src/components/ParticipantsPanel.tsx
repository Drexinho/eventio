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

const participantSchema = z.object({
  name: z.string().min(1, 'Jméno je povinné'),
  staying_full_time: z.boolean(),
  notes: z.string().optional()
})

type ParticipantFormData = z.infer<typeof participantSchema>

interface ParticipantsPanelProps {
  eventToken: string
  isReadOnly?: boolean
}

export function ParticipantsPanel({ eventToken, isReadOnly = false }: ParticipantsPanelProps) {
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
    formState: { errors }
  } = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
    defaultValues: {
      name: '',
      staying_full_time: true,
      notes: ''
    }
  })

  const loadData = async () => {
    try {
      const response = await fetch(`/api/events/${eventToken}/participants`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data)
      }
    } catch (error) {
      console.error('Chyba při načítání účastníků:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [eventToken])

  // Automatické aktualizování dat
  useEffect(() => {
    if (!eventToken) return

    const interval = setInterval(() => {
      loadData()
    }, 3000) // Kontrola každých 3 sekund

    return () => clearInterval(interval)
  }, [eventToken])

  const onSubmit = async (data: ParticipantFormData) => {
    setIsAdding(true)
    try {
      const response = await fetch(`/api/events/${eventToken}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          staying_full_time: data.staying_full_time,
          notes: data.notes || null
        }),
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se přidat účastníka')
      }

      await loadData()
      reset()
      setIsFormOpen(false)
    } catch (error) {
      console.error('Chyba při přidávání účastníka:', error)
      alert('Nepodařilo se přidat účastníka')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (participantId: string) => {
    if (!confirm('Opravdu chcete smazat tohoto účastníka?')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventToken}/participants/${participantId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat účastníka')
      }

      await loadData()
    } catch (error) {
      console.error('Chyba při mazání účastníka:', error)
      alert('Nepodařilo se smazat účastníka')
    }
  }

  const handleEdit = (participant: any) => {
    setEditingId(participant.id)
    setValue('name', participant.name)
    setValue('staying_full_time', participant.staying_full_time)
    setValue('notes', participant.notes || '')
  }

  const handleSaveEdit = async (data: ParticipantFormData) => {
    if (!editingId) return

    try {
      const response = await fetch(`/api/events/${eventToken}/participants/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          staying_full_time: data.staying_full_time,
          notes: data.notes || null
        }),
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se aktualizovat účastníka')
      }

      await loadData()
      setEditingId(null)
      reset()
    } catch (error) {
      console.error('Chyba při aktualizaci účastníka:', error)
      alert('Nepodařilo se aktualizovat účastníka')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    reset()
  }

  if (isLoading) {
    return <div>Načítám účastníky...</div>
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/30 via-slate-700/40 to-slate-900/50 backdrop-blur-md border border-slate-600/30 shadow-2xl">
      <CardHeader className="border-b border-slate-600/40 py-1 px-2">
        <div className="flex justify-between items-center pl-3">
          <div>
            <CardTitle className="text-slate-100 flex items-center gap-2 text-lg font-semibold">
              <div className="p-1.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                👥
              </div>
              Účastníci
            </CardTitle>
            <CardDescription className="text-slate-300 mt-0.5 text-sm">
              Správa účastníků události
            </CardDescription>
          </div>
          {!isReadOnly && (
            <Button className="border border-slate-500/30 text-slate-100 bg-slate-700/50 hover:bg-slate-600/50 hover:text-slate-100 hover:border-slate-400/50 transition-all duration-300 shadow-lg mr-6"
              variant="outline"
              size="sm"
              onClick={() => { setIsFormOpen(!isFormOpen); if (!isFormOpen) { reset(); setEditingId(null); } }}
            >
              {isFormOpen ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-6 space-y-6">
        {/* Formulář pro přidávání */}
        {isFormOpen && !isReadOnly && (
          <div className="mb-6 p-6 border border-slate-600/30 rounded-xl bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-800/30 backdrop-blur-sm shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-100">Jméno *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Jméno účastníka"
                  className="bg-slate-800/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                />
                {errors.name && (
                  <p className="text-sm text-slate-100">{errors.name.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="staying_full_time"
                  {...register('staying_full_time')}
                  className="rounded bg-slate-800/50 border-slate-600 focus:ring-cyan-400/20"
                />
                <Label htmlFor="staying_full_time" className="text-slate-100">Budu na celou dobu?</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-100">Poznámky</Label>
                <Input
                  id="notes"
                  {...register('notes')}
                  placeholder="Dodatečné informace o účastníkovi..."
                  className="bg-slate-800/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                />
              </div>

              <Button type="submit" disabled={isAdding} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0 hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg">
                {isAdding ? 'Přidávám...' : 'Přidat účastníka'}
              </Button>
            </form>
          </div>
        )}

        {/* Seznam účastníků */}
        <div className="space-y-4">
          {participants.map((participant) => (
            <div key={participant.id}>
              {/* Účastník */}
              <div className="flex justify-between items-center py-3 px-6 border border-slate-600/30 rounded-xl bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-800/30 backdrop-blur-sm shadow-xl hover:shadow-slate-500/25 transition-all duration-300">
                <div className="flex-1">
                  <p className="font-medium text-slate-100">{participant.name}</p>
                  <p className="text-sm text-slate-100">
                    {participant.staying_full_time ? '🏠 Zůstává celý čas' : '🏃 Zůstává jen část času'}
                  </p>
                  {participant.notes && (
                    <p className="text-sm text-slate-100">
                      📝 {participant.notes}
                    </p>
                  )}
                </div>
                {!isReadOnly && (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editingId === participant.id ? handleCancelEdit() : handleEdit(participant)}
                      className={editingId === participant.id ? "border-red-400 text-red-300 bg-slate-700/50 hover:bg-red-600/50 hover:text-white hover:border-red-400 transform hover:scale-105 transition-all duration-300 shadow-md" : "border-cyan-400 text-cyan-300 bg-slate-700/50 hover:bg-cyan-600/50 hover:text-white hover:border-cyan-400 transform hover:scale-105 transition-all duration-300 shadow-md"}
                    >
                      {editingId === participant.id ? "❌" : "✏️"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(participant.id)}
                      className="border-red-400 text-red-300 bg-slate-700/50 hover:bg-red-600/50 hover:text-white hover:border-red-400 transition-all duration-300 shadow-md"
                    >
                      🗑️
                    </Button>
                  </div>
                )}
              </div>

              {/* Editační formulář inline */}
              {editingId === participant.id && (
                <div className="mt-4 p-6 border border-slate-600/30 rounded-xl bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-800/30 backdrop-blur-sm shadow-xl">
                  <h3 className="font-medium mb-4 text-slate-100">Upravit účastníka</h3>
                  <form onSubmit={handleSubmit(handleSaveEdit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_name" className="text-slate-100">Jméno *</Label>
                      <Input
                        id="edit_name"
                        {...register('name')}
                        placeholder="Jméno účastníka"
                        className="bg-slate-800/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                      />
                      {errors.name && (
                        <p className="text-sm text-slate-100">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit_staying_full_time"
                        {...register('staying_full_time')}
                        className="rounded bg-slate-800/50 border-slate-600 focus:ring-cyan-400/20"
                      />
                      <Label htmlFor="edit_staying_full_time" className="text-slate-100">Budu na celou dobu?</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit_notes" className="text-slate-100">Poznámky</Label>
                      <Input
                        id="edit_notes"
                        {...register('notes')}
                        placeholder="Dodatečné informace o účastníkovi..."
                        className="bg-slate-800/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                      />
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
          ))}

          {participants.length === 0 && (
            <p className="text-center text-slate-500 py-4">
              Zatím nejsou žádní účastníci
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 