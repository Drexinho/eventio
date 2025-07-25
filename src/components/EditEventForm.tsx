'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Event } from '@/types/database'

const editEventSchema = z.object({
  name: z.string().min(1, 'Název události je povinný'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Datum začátku je povinné'),
  end_date: z.string().min(1, 'Datum konce je povinné'),
  max_participants: z.number().min(1, 'Maximální počet účastníků musí být alespoň 1'),
  price: z.number().min(0, 'Cena nemůže být záporná'),
  map_link: z.string().optional(),
  booking_link: z.string().optional(),
  image_url: z.string().optional()
})

type EditEventFormData = z.infer<typeof editEventSchema>

interface EditEventFormProps {
  event: Event
  eventToken: string
  onSuccess: () => void
}

export function EditEventForm({ event, eventToken, onSuccess }: EditEventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      name: event.name,
      description: event.description || '',
      start_date: event.start_date,
      end_date: event.end_date,
      max_participants: event.max_participants,
      price: event.price,
      map_link: event.map_link || '',
      booking_link: event.booking_link || '',
      image_url: event.image_url || ''
    }
  })

  const onSubmit = async (data: EditEventFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/events/${eventToken}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          start_date: data.start_date,
          end_date: data.end_date,
          max_participants: data.max_participants,
          price: data.price,
          map_link: data.map_link || null,
          booking_link: data.booking_link || null,
          image_url: data.image_url || null
        }),
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se aktualizovat událost')
      }

      onSuccess()
    } catch (error) {
      console.error('Chyba při aktualizaci události:', error)
      alert('Nepodařilo se aktualizovat událost')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>✏️ Upravit událost</CardTitle>
        <CardDescription>
          Upravte informace o události
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Název události *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Název události"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Popis</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Popis události..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Datum začátku *</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">Datum konce *</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_participants">Maximální počet účastníků *</Label>
              <Input
                id="max_participants"
                type="number"
                min="1"
                {...register('max_participants', { valueAsNumber: true })}
                placeholder="50"
              />
              {errors.max_participants && (
                <p className="text-sm text-red-500">{errors.max_participants.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Cena (Kč)</Label>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="map_link">Odkaz na mapu</Label>
              <Input
                id="map_link"
                {...register('map_link')}
                placeholder="https://maps.google.com/..."
              />
              {errors.map_link && (
                <p className="text-sm text-red-500">{errors.map_link.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="booking_link">Odkaz na ubytování</Label>
              <Input
                id="booking_link"
                {...register('booking_link')}
                placeholder="https://booking.com/..."
              />
              {errors.booking_link && (
                <p className="text-sm text-red-500">{errors.booking_link.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Odkaz na obrázek</Label>
            <Input
              id="image_url"
              {...register('image_url')}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-sm text-muted-foreground">
              Vložte odkaz na obrázek (např. z Google Drive, Imgur, atd.)
            </p>
            {errors.image_url && (
              <p className="text-sm text-red-500">{errors.image_url.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ukládám...' : 'Uložit změny'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 