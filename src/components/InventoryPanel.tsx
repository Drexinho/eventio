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
}

export function InventoryPanel({ eventToken }: InventoryPanelProps) {
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
    <Card className="bg-transparent border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-slate-200">📦 Inventář</CardTitle>
            <CardDescription className="text-slate-400">
              Správa věcí a vybavení
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="border-0 text-slate-100 bg-slate-800/50 hover:bg-slate-700 hover:text-slate-100 hover:border-0"
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
                  <Label htmlFor="name" className="text-slate-100">Název položky *</Label>
                  <Input className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                    id="name"
                    {...register('name')}
                    placeholder="Stan, spacák, jídlo..."
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-slate-100">Množství *</Label>
                  <Input className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                    id="quantity"
                    type="number"
                    min="1"
                    {...register('quantity', { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-500">{errors.quantity.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to" className="text-slate-100">Přiřadit účastníkovi</Label>
                <select
                  id="assigned_to"
                  {...register('assigned_to')}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
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
                <Input className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                  id="notes"
                  {...register('notes')}
                  placeholder="Dodatečné informace o položce..."
                />
              </div>

              <Button type="submit" disabled={isAdding} className="border-0 text-slate-100 bg-slate-800/50 hover:bg-slate-700 hover:text-slate-100 hover:border-0 transition-all duration-300">
                {isAdding ? 'Přidávám...' : 'Přidat položku'}
              </Button>
            </form>
          </div>
        )}

        {/* Seznam inventáře */}
        <div className="space-y-2">
          {inventory.map((item) => (
            <div key={item.id}>
              {/* Položka */}
              <div className="flex justify-between items-center p-3 border-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm shadow-lg hover:shadow-slate-500/25 transition-all duration-300">
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editingId === item.id ? handleCancelEdit() : handleEdit(item)}
                    className={editingId === item.id ? "border-red-500 text-red-400 bg-slate-800 hover:bg-red-600 hover:text-white hover:border-red-600 transform hover:scale-110 transition-all duration-300" : "border-cyan-500 text-cyan-400 bg-slate-800 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transform hover:scale-110 transition-all duration-300"}
                  >
                    {editingId === item.id ? "❌" : "✏️"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="border-red-500 text-red-400 bg-slate-800 hover:bg-red-600 hover:border-red-600 transform hover:scale-110 transition-all duration-300"
                  >
                    🗑️
                  </Button>
                </div>
              </div>

              {/* Editační formulář inline */}
              {editingId === item.id && (
                <div className="mt-2 p-4 border-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm shadow-lg">
                  <h3 className="font-medium text-slate-100 mb-4">Upravit položku</h3>
                  <form onSubmit={handleSubmit(handleSaveEdit)} className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit_name" className="text-slate-100">Název položky *</Label>
                        <Input className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                          id="edit_name"
                          {...register('name')}
                          placeholder="Stan, spacák, jídlo..."
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit_quantity" className="text-slate-100">Množství *</Label>
                        <Input className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                          id="edit_quantity"
                          type="number"
                          min="1"
                          {...register('quantity', { valueAsNumber: true })}
                          placeholder="1"
                        />
                        {errors.quantity && (
                          <p className="text-sm text-red-500">{errors.quantity.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit_assigned_to" className="text-slate-100">Přiřadit účastníkovi</Label>
                      <select
                        id="edit_assigned_to"
                        {...register('assigned_to')}
                        className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
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
                      <Input className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                        id="edit_notes"
                        {...register('notes')}
                        placeholder="Dodatečné informace o položce..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="border-0 text-slate-100 bg-slate-800/50 hover:bg-slate-700 hover:text-slate-100 hover:border-0 transition-all duration-300">
                        Uložit změny
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancelEdit} className="border-0 text-slate-100 bg-slate-800/50 hover:bg-slate-700 hover:text-slate-100 hover:border-0">
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