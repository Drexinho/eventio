'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createEvent } from '@/lib/database'
import { generateUUID, generatePIN } from '@/lib/utils'

const createEventSchema = z.object({
  name: z.string().min(1, 'Název události je povinný'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Datum začátku je povinné'),
  end_date: z.string().min(1, 'Datum konce je povinné'),
  max_participants: z.number().min(1, 'Maximální počet účastníků musí být alespoň 1'),
  price: z.number().min(0, 'Cena nemůže být záporná'),
  access_type: z.enum(['link', 'pin']),
  map_link: z.string().optional(),
  booking_link: z.string().optional(),
  image_url: z.string().optional()
})

type CreateEventFormData = z.infer<typeof createEventSchema>

export function CreateEventForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [generatedToken, setGeneratedToken] = useState<string>('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      access_type: 'link'
    }
  })

  const accessType = watch('access_type')

  const generateToken = () => {
    const token = accessType === 'link' ? generateUUID() : generatePIN()
    setGeneratedToken(token)
    return token
  }

  const onSubmit = async (data: CreateEventFormData) => {
    setIsLoading(true)
    
    try {
      const token = generatedToken || generateToken()
      
      const eventData = {
        name: data.name,
        description: data.description || null,
        start_date: data.start_date,
        end_date: data.end_date,
        max_participants: data.max_participants,
        price: data.price,
        access_type: data.access_type,
        access_token: token,
        map_link: data.map_link || null,
        booking_link: data.booking_link || null,
        image_url: data.image_url || null
      }

      console.log('Odesílám data na API:', eventData)

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Nepodařilo se vytvořit událost')
      }

      const event = await response.json()
      
      console.log('Událost úspěšně vytvořena:', event)
      
      // Přesměrování na detail události
      router.push(`/event/${event.access_token}`)
    } catch (error) {
      console.error('Chyba při vytváření události:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      alert('Nepodařilo se vytvořit událost. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informace o události</CardTitle>
        <CardDescription>
          Vyplňte základní informace o vaší události
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Název události */}
          <div className="space-y-2">
            <Label htmlFor="name">Název události *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Např. Výlet do hor"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Popis */}
          <div className="space-y-2">
            <Label htmlFor="description">Popis</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Krátký popis události..."
              rows={3}
            />
          </div>

          {/* Datumy */}
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

          {/* Odkazy */}
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

          {/* Počet lidí a cena */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_participants">Počet lidí *</Label>
              <Input
                id="max_participants"
                type="number"
                min="1"
                {...register('max_participants', { valueAsNumber: true })}
                placeholder="10"
              />
              {errors.max_participants && (
                <p className="text-sm text-red-500">{errors.max_participants.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Celková cena (Kč) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="5000"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
          </div>

          {/* Typ přístupu */}
          <div className="space-y-2">
            <Label htmlFor="access_type">Typ přístupu *</Label>
            <Select
              value={accessType}
              onValueChange={(value: 'link' | 'pin') => {
                setValue('access_type', value)
                setGeneratedToken('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte typ přístupu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="link">Unikátní odkaz (URL)</SelectItem>
                <SelectItem value="pin">9-místný PIN kód</SelectItem>
              </SelectContent>
            </Select>
            {errors.access_type && (
              <p className="text-sm text-red-500">{errors.access_type.message}</p>
            )}
          </div>

          {/* Vygenerovaný token */}
          {generatedToken && (
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Vygenerovaný {accessType === 'link' ? 'odkaz' : 'PIN'}:</Label>
              <p className="text-lg font-mono bg-background p-2 rounded mt-1 break-all">
                {accessType === 'link' ? `${window.location.origin}/event/${generatedToken}` : generatedToken}
              </p>
            </div>
          )}

          {/* Tlačítka */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const token = generateToken()
                setGeneratedToken(token)
              }}
              disabled={isLoading}
            >
              Vygenerovat {accessType === 'link' ? 'odkaz' : 'PIN'}
            </Button>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Vytvářím...' : 'Vytvořit událost'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 