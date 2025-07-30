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
}

export function ParticipantsPanel({ eventToken }: ParticipantsPanelProps) {
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
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-slate-200">👥 Účastníci</CardTitle>
            <CardDescription className="text-slate-400">
              Správa účastníků události
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setIsFormOpen(!isFormOpen); if (!isFormOpen) { reset(); setEditingId(null); } }}
            className="border-slate-600 text-slate-300 bg-slate-800/50 hover:bg-slate-700 hover:text-slate-100 hover:border-slate-500 hover:text-slate-100"
          >
            {isFormOpen ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Formulář pro přidávání */}
        {isFormOpen && (
          <div className="mb-6 p-4 border border-slate-700 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Jméno *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Jméno účastníka"
                  className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
                />
                {errors.name && (
                  <p className="text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="staying_full_time"
                  {...register('staying_full_time')}
                  className="rounded bg-slate-700/50 border-slate-600 focus:ring-purple-500/20"
                />
                <Label htmlFor="staying_full_time" className="text-slate-300">Budu na celou dobu?</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-300">Poznámky</Label>
                <Input
                  id="notes"
                  {...register('notes')}
                  placeholder="Dodatečné informace o účastníkovi..."
                  className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <Button type="submit" disabled={isAdding} className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                {isAdding ? 'Přidávám...' : 'Přidat účastníka'}
              </Button>
            </form>
          </div>
        )}

        {/* Seznam účastníků */}
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={participant.id}>
              {/* Účastník */}
              <div className="flex justify-between items-center p-3 border border-slate-700 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm shadow-lg hover:shadow-slate-500/25 transition-all duration-300">
                <div className="flex-1">
                  <p className="font-medium text-slate-100">{participant.name}</p>
                  <p className="text-sm text-slate-300">
                    {participant.staying_full_time ? '🏠 Zůstává celý čas' : '🏃 Zůstává jen část času'}
                  </p>
                  {participant.notes && (
                    <p className="text-sm text-slate-300">
                      📝 {participant.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editingId === participant.id ? handleCancelEdit() : handleEdit(participant)}
                    className={editingId === participant.id ? "border-red-500 text-red-400 bg-slate-800/50 hover:bg-red-600 hover:text-white hover:border-red-600 transform hover:scale-110 transition-all duration-300" : "border-cyan-500 text-cyan-400 bg-slate-800/50 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transform hover:scale-110 transition-all duration-300"}
                  >
                    {editingId === participant.id ? "❌" : "✏️"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(participant.id)}
                    className="border-red-500 text-red-400 bg-slate-800/50 hover:bg-red-600 hover:text-white hover:border-red-600 transform hover:scale-110 transition-all duration-300"
                  >
                    🗑️
                  </Button>
                </div>
              </div>

              {/* Editační formulář inline */}
              {editingId === participant.id && (
                <div className="mt-2 p-4 border border-slate-700 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm shadow-lg">
                  <h3 className="font-medium mb-4 text-slate-100">Upravit účastníka</h3>
                  <form onSubmit={handleSubmit(handleSaveEdit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_name" className="text-slate-300">Jméno *</Label>
                      <Input
                        id="edit_name"
                        {...register('name')}
                        placeholder="Jméno účastníka"
                        className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-400">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit_staying_full_time"
                        {...register('staying_full_time')}
                        className="rounded bg-slate-700/50 border-slate-600 focus:ring-cyan-500/20"
                      />
                      <Label htmlFor="edit_staying_full_time" className="text-slate-300">Budu na celou dobu?</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit_notes" className="text-slate-300">Poznámky</Label>
                      <Input
                        id="edit_notes"
                        {...register('notes')}
                        placeholder="Dodatečné informace o účastníkovi..."
                        className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 shadow-lg hover:shadow-slate-500/25 transition-all duration-300 transform hover:scale-105">
                        Uložit změny
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancelEdit} className="border-slate-600 text-slate-300 bg-slate-800/50 hover:bg-slate-700 hover:text-slate-100 hover:border-slate-500">
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