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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>👥 Účastníci</CardTitle>
            <CardDescription>
              Správa účastníků události
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
              <div className="space-y-2">
                <Label htmlFor="name">Jméno *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Jméno účastníka"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="staying_full_time"
                  {...register('staying_full_time')}
                  className="rounded"
                />
                <Label htmlFor="staying_full_time">Budu na celou dobu?</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Poznámky</Label>
                <Input
                  id="notes"
                  {...register('notes')}
                  placeholder="Dodatečné informace o účastníkovi..."
                />
              </div>

              <Button type="submit" disabled={isAdding}>
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
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{participant.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {participant.staying_full_time ? '🏠 Zůstává celý čas' : '🏃 Zůstává jen část času'}
                  </p>
                  {participant.notes && (
                    <p className="text-sm text-muted-foreground">
                      📝 {participant.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(participant)}
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(participant.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </Button>
                </div>
              </div>

              {/* Editační formulář inline */}
              {editingId === participant.id && (
                <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-4">Upravit účastníka</h3>
                  <form onSubmit={handleSubmit(handleSaveEdit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_name">Jméno *</Label>
                      <Input
                        id="edit_name"
                        {...register('name')}
                        placeholder="Jméno účastníka"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit_staying_full_time"
                        {...register('staying_full_time')}
                        className="rounded"
                      />
                      <Label htmlFor="edit_staying_full_time">Budu na celou dobu?</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit_notes">Poznámky</Label>
                      <Input
                        id="edit_notes"
                        {...register('notes')}
                        placeholder="Dodatečné informace o účastníkovi..."
                      />
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
          ))}

          {participants.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Zatím nejsou žádní účastníci
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 