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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>📦 Inventář</CardTitle>
            <CardDescription>
              Správa věcí a vybavení
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
                  <Label htmlFor="name">Název položky *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Stan, spacák, jídlo..."
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Množství *</Label>
                  <Input
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
                <Label htmlFor="assigned_to">Přiřadit účastníkovi</Label>
                <select
                  id="assigned_to"
                  {...register('assigned_to')}
                  className="w-full px-3 py-2 border rounded-md"
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
                <Label htmlFor="notes">Poznámky</Label>
                <Input
                  id="notes"
                  {...register('notes')}
                  placeholder="Dodatečné informace o položce..."
                />
              </div>

              <Button type="submit" disabled={isAdding}>
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
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Množství: {item.quantity}
                    {item.assigned_participant_name && (
                      <span className="ml-2">• Beru: {item.assigned_participant_name}</span>
                    )}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground">
                      📝 {item.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </Button>
                </div>
              </div>

              {/* Editační formulář inline */}
              {editingId === item.id && (
                <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-4">Upravit položku</h3>
                  <form onSubmit={handleSubmit(handleSaveEdit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit_name">Název položky *</Label>
                        <Input
                          id="edit_name"
                          {...register('name')}
                          placeholder="Stan, spacák, jídlo..."
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit_quantity">Množství *</Label>
                        <Input
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
                      <Label htmlFor="edit_assigned_to">Přiřadit účastníkovi</Label>
                      <select
                        id="edit_assigned_to"
                        {...register('assigned_to')}
                        className="w-full px-3 py-2 border rounded-md"
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
                      <Label htmlFor="edit_notes">Poznámky</Label>
                      <Input
                        id="edit_notes"
                        {...register('notes')}
                        placeholder="Dodatečné informace o položce..."
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

          {inventory.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Zatím nejsou žádné položky v inventáři
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 