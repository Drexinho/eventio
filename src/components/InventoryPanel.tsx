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

const inventorySchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  quantity: z.number().min(1, 'Množství musí být alespoň 1'),
  assigned_to: z.string().optional(),
  notes: z.string().optional()
})

type InventoryFormData = z.infer<typeof inventorySchema>

interface InventoryPanelProps {
  eventToken: string
  isReadOnly?: boolean
}

export function InventoryPanel({ eventToken, isReadOnly = false }: InventoryPanelProps) {
  const [inventory, setInventory] = useState<any[]>([])
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
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: '',
      quantity: 1,
      assigned_to: '',
      notes: ''
    }
  })

  const loadData = async () => {
    try {
      const [inventoryResponse, participantsResponse] = await Promise.all([
        fetch(`/api/events/${eventToken}/inventory`),
        fetch(`/api/events/${eventToken}/participants`)
      ])

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json()
        setInventory(inventoryData)
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

  // Automatické aktualizování dat
  useEffect(() => {
    if (!eventToken) return

    const interval = setInterval(() => {
      loadData()
    }, 3000) // Kontrola každých 3 sekund

    return () => clearInterval(interval)
  }, [eventToken])

  const onSubmit = async (data: InventoryFormData) => {
    setIsAdding(true)
    try {
      const response = await fetch(`/api/events/${eventToken}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          quantity: data.quantity,
          assigned_to: data.assigned_to || null,
          notes: data.notes || null
        }),
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se přidat položku')
      }

      await loadData()
      reset()
      setIsFormOpen(false)
    } catch (error) {
      console.error('Chyba při přidávání položky:', error)
      alert('Nepodařilo se přidat položku')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Opravdu chcete smazat tuto položku?')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventToken}/inventory/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat položku')
      }

      await loadData()
    } catch (error) {
      console.error('Chyba při mazání položky:', error)
      alert('Nepodařilo se smazat položku')
    }
  }

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setValue('name', item.name)
    setValue('quantity', item.quantity)
    setValue('assigned_to', item.assigned_to || '')
    setValue('notes', item.notes || '')
  }

  const handleSaveEdit = async (data: InventoryFormData) => {
    if (!editingId) return

    try {
      const response = await fetch(`/api/events/${eventToken}/inventory/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          quantity: data.quantity,
          assigned_to: data.assigned_to || null,
          notes: data.notes || null
        }),
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se aktualizovat položku')
      }

      await loadData()
      setEditingId(null)
      reset()
    } catch (error) {
      console.error('Chyba při aktualizaci položky:', error)
      alert('Nepodařilo se aktualizovat položku')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    reset()
  }

  if (isLoading) {
    return <div>Načítám inventář...</div>
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/30 via-slate-700/40 to-slate-900/50 backdrop-blur-md border border-slate-600/30 shadow-2xl">
      <CardHeader className="border-b border-slate-600/40 py-1 px-2">
        <div className="flex justify-between items-center pl-3">
          <div>
            <CardTitle className="text-slate-100 flex items-center gap-2 text-lg font-semibold">
              <div className="p-1.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                📦
              </div>
              Inventář
            </CardTitle>
            <CardDescription className="text-slate-300 mt-0.5 text-sm">
              Správa věcí a vybavení
            </CardDescription>
          </div>
          {!isReadOnly && (
            <Button className="border border-slate-500/30 text-slate-100 bg-slate-700/50 hover:bg-slate-600/50 hover:text-slate-100 hover:border-slate-400/50 transition-all duration-300 shadow-lg mr-6"
              variant="outline"
              size="sm"
              onClick={() => setIsFormOpen(!isFormOpen)}
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-100">Název položky *</Label>
                  <Input className="bg-slate-800/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                    id="name"
                    {...register('name')}
                    placeholder="Stan, spacák, jídlo..."
                  />
                  {errors.name && (
                    <p className="text-sm text-slate-100">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-slate-100">Množství *</Label>
                  <Input className="bg-slate-800/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                    id="quantity"
                    type="number"
                    min="1"
                    {...register('quantity', { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {errors.quantity && (
                    <p className="text-sm text-slate-100">{errors.quantity.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to" className="text-slate-100">Přiřadit účastníkovi</Label>
                <select
                  id="assigned_to"
                  {...register('assigned_to')}
                  className="w-full px-3 py-2 border border-slate-600/50 rounded-md bg-slate-800/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                >
                  <option value="">Nikdo (volná položka)</option>
                  {participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-100">Poznámky</Label>
                <Input className="bg-slate-800/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                  id="notes"
                  {...register('notes')}
                  placeholder="Dodatečné informace o položce..."
                />
              </div>

              <Button type="submit" disabled={isAdding} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0 hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg">
                {isAdding ? 'Přidávám...' : 'Přidat položku'}
              </Button>
            </form>
          </div>
        )}

        {/* Seznam inventáře */}
        <div className="space-y-4">
          {inventory.map((item) => (
            <div key={item.id}>
              {/* Položka */}
              <div className="flex justify-between items-center py-2 px-6 border border-slate-600/30 rounded-xl bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-800/30 backdrop-blur-sm shadow-xl hover:shadow-slate-500/25 transition-all duration-300">
                <div className="flex-1">
                  <p className="font-medium text-slate-100">{item.name}</p>
                  <p className="text-sm text-slate-100">
                    Množství: {item.quantity}
                    {item.assigned_participant_name && (
                      <span className="ml-2">• Beru: {item.assigned_participant_name}</span>
                    )}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-slate-100">
                      📝 {item.notes}
                    </p>
                  )}
                </div>
                {!isReadOnly && (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editingId === item.id ? handleCancelEdit() : handleEdit(item)}
                      className={editingId === item.id ? "border-red-400 text-red-300 bg-slate-700/50 hover:bg-red-600/50 hover:text-white hover:border-red-400 transform hover:scale-105 transition-all duration-300 shadow-md" : "border-cyan-400 text-cyan-300 bg-slate-700/50 hover:bg-cyan-600/50 hover:text-white hover:border-cyan-400 transform hover:scale-105 transition-all duration-300 shadow-md"}
                    >
                      {editingId === item.id ? "❌" : "✏️"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="border-red-400 text-red-300 bg-slate-700/50 hover:bg-red-600/50 hover:text-white hover:border-red-400 transition-all duration-300 shadow-md"
                    >
                      🗑️
                    </Button>
                  </div>
                )}
              </div>

              {/* Editační formulář inline */}
              {editingId === item.id && (
                <div className="mt-4 p-6 border border-slate-600/30 rounded-xl bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-800/30 backdrop-blur-sm shadow-xl">
                  <h3 className="font-medium text-slate-100 mb-4">Upravit položku</h3>
                  <form onSubmit={handleSubmit(handleSaveEdit)} className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit_name" className="text-slate-100">Název položky *</Label>
                        <Input className="bg-slate-800/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                          id="edit_name"
                          {...register('name')}
                          placeholder="Stan, spacák, jídlo..."
                        />
                        {errors.name && (
                          <p className="text-sm text-slate-100">{errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit_quantity" className="text-slate-100">Množství *</Label>
                        <Input className="bg-slate-800/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                          id="edit_quantity"
                          type="number"
                          min="1"
                          {...register('quantity', { valueAsNumber: true })}
                          placeholder="1"
                        />
                        {errors.quantity && (
                          <p className="text-sm text-slate-100">{errors.quantity.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit_assigned_to" className="text-slate-100">Přiřadit účastníkovi</Label>
                      <select
                        id="edit_assigned_to"
                        {...register('assigned_to')}
                        className="w-full px-3 py-2 border border-slate-600/50 rounded-md bg-slate-800/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                      >
                        <option value="">Nikdo (volná položka)</option>
                        {participants.map((participant) => (
                          <option key={participant.id} value={participant.id}>
                            {participant.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit_notes" className="text-slate-100">Poznámky</Label>
                      <Input className="bg-slate-800/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                        id="edit_notes"
                        {...register('notes')}
                        placeholder="Dodatečné informace o položce..."
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

          {inventory.length === 0 && (
            <p className="text-center text-slate-100 py-4">
              Zatím nejsou žádné položky v inventáři
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 