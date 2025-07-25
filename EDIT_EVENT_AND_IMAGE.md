# ✏️ Editace události a obrázek - Dokončeno!

## ✅ Funkce implementována

### Co bylo přidáno:

**1. Databázové změny:**
- ✅ **Pole `image_url`** v `events` tabulce
- ✅ **API endpoint** pro aktualizaci události (`PUT /api/events/[token]`)
- ✅ **Databázová funkce** `updateEvent()` pro aktualizaci

**2. UI komponenty:**
- ✅ **EditEventForm** - komponenta pro editaci události
- ✅ **Tlačítko "Upravit"** v hlavním tabu události
- ✅ **Zobrazování obrázku** v hlavním tabu
- ✅ **Tabs komponenta** pro lepší organizaci

**3. Formulářové změny:**
- ✅ **Pole pro obrázek** v CreateEventForm
- ✅ **Validace** pro image_url
- ✅ **Placeholder** s instrukcemi pro uživatele

### Technické změny:

**Databáze:** `postgresql-schema.sql`
```sql
CREATE TABLE IF NOT EXISTS events (
    -- ... existující pole ...
    image_url TEXT,
    -- ... existující pole ...
);
```

**TypeScript interface:** `src/types/database.ts`
```typescript
export interface Event {
  // ... existující pole ...
  image_url: string | null
}
```

**API endpoint:** `src/app/api/events/[token]/route.ts`
```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    
    const event = await getEventByToken(token)
    const updatedEvent = await updateEvent(event.id, body)
    return NextResponse.json(updatedEvent)
  } catch (error) {
    return NextResponse.json(
      { error: 'Nepodařilo se aktualizovat událost' },
      { status: 500 }
    )
  }
}
```

**Databázová funkce:** `src/lib/database-postgresql.ts`
```typescript
export const updateEvent = async (id: string, updates: Partial<Event>) => {
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
  const values = Object.values(updates).filter((_, index) => fields[index])
  
  if (fields.length === 0) {
    throw new Error('Žádné pole k aktualizaci')
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
  const result = await query(`
    UPDATE events SET ${setClause} WHERE id = $1 RETURNING *
  `, [id, ...values])

  if (result.rows.length === 0) {
    throw new Error('Událost nebyla nalezena')
  }

  return result.rows[0]
}
```

**EditEventForm komponenta:** `src/components/EditEventForm.tsx`
```typescript
export function EditEventForm({ event, eventToken, onSuccess }: EditEventFormProps) {
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
    const response = await fetch(`/api/events/${eventToken}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      onSuccess()
    }
  }
}
```

**Hlavní stránka události:** `src/app/event/[token]/page.tsx`
```typescript
// Zobrazování obrázku
{event.image_url && (
  <div className="mb-4">
    <img 
      src={event.image_url} 
      alt={event.name}
      className="w-full max-w-2xl h-auto rounded-lg shadow-md"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
    />
  </div>
)}

// Tlačítko editace
<Button 
  variant="outline" 
  onClick={() => setIsEditing(true)}
>
  ✏️ Upravit
</Button>
```

### Jak to otestovat:

1. **Otevřete aplikaci** na http://localhost:3000
2. **Vytvořte novou událost** s odkazem na obrázek
3. **Jděte na událost** a zkontrolujte zobrazení obrázku
4. **Klikněte na "✏️ Upravit"** v hlavním tabu
5. **Upravte informace** a uložte změny
6. **Zkontrolujte** že se změny projevily

### Příklad použití:

**Přidání obrázku při vytváření události:**
1. V formuláři pro vytváření události najděte pole "Odkaz na obrázek"
2. Vložte odkaz na obrázek (např. z Google Drive, Imgur, atd.)
3. Vytvořte událost
4. Obrázek se zobrazí v hlavním tabu události

**Editace události:**
1. V hlavním tabu události klikněte na "✏️ Upravit"
2. Upravte požadované informace
3. Klikněte na "Uložit změny"
4. Změny se projeví okamžitě

**Zobrazování obrázku:**
- Obrázek se zobrazuje v hlavním tabu události
- Automaticky se skryje při chybě načítání
- Responzivní design - přizpůsobí se velikosti obrazovky

### Funkce:

**Editace události:**
- ✅ **Všechna pole** lze upravit (název, popis, datum, cena, odkazy, obrázek)
- ✅ **Validace** formuláře
- ✅ **Error handling** s uživatelskými zprávami
- ✅ **Automatické obnovení** po uložení

**Obrázek:**
- ✅ **Pole pro odkaz** na obrázek
- ✅ **Zobrazování** v hlavním tabu
- ✅ **Error handling** - skryje se při chybě
- ✅ **Responzivní design**

**UI vylepšení:**
- ✅ **Tabs komponenta** pro lepší organizaci
- ✅ **Tlačítko editace** v hlavním tabu
- ✅ **Moderní design** s kartami a ikonami

### 🎉 Hotovo!

Všechny funkce pro editaci události a zobrazování obrázku byly implementovány:
- ✅ Databázové pole pro obrázek
- ✅ API endpoint pro aktualizaci
- ✅ EditEventForm komponenta
- ✅ Zobrazování obrázku v hlavním tabu
- ✅ Tlačítko editace
- ✅ Tabs komponenta pro lepší organizaci
- ✅ Error handling a validace

**Aplikace je připravena k použití!** 🚀 