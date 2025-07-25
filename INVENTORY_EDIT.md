# ✏️ Editace inventáře - Dokončeno!

## ✅ Změna implementována

### Co bylo změněno:

**1. Přidána možnost editace položek:**
- ✅ **Tlačítko "✏️"** u každé položky v inventáři
- ✅ **Formulář pro editaci** s předvyplněnými hodnotami
- ✅ **PUT endpoint** pro aktualizaci položek
- ✅ **Konzistentní design** s ostatními komponenty

**2. Funkcionalita editace:**
- ✅ **Kliknutí na "✏️"** otevře editační formulář
- ✅ **Předvyplnění hodnot** z existující položky
- ✅ **Validace** stejná jako u přidávání
- ✅ **Tlačítka "Uložit změny" a "Zrušit"**

### Technické změny:

**InventoryPanel:** `src/components/InventoryPanel.tsx`
```typescript
// Nový stav pro editaci
const [editingId, setEditingId] = useState<string | null>(null)

// Funkce pro editaci
const handleEdit = (item: any) => {
  setEditingId(item.id)
  setValue('name', item.name)
  setValue('quantity', item.quantity)
  setValue('assigned_to', item.assigned_to || '')
}

// Funkce pro uložení editace
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
        assigned_to: data.assigned_to || null
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

// Funkce pro zrušení editace
const handleCancelEdit = () => {
  setEditingId(null)
  reset()
}
```

**UI změny:**
```tsx
// Tlačítka u každé položky
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

// Editační formulář
{editingId && (
  <div className="mt-6 p-4 border rounded-lg bg-muted/50">
    <h3 className="font-medium mb-4">Upravit položku</h3>
    <form onSubmit={handleSubmit(handleSaveEdit)} className="space-y-4">
      {/* Formulář s předvyplněnými hodnotami */}
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
```

### Jak to funguje:

**1. Kliknutí na "✏️":**
- ✅ Otevře se editační formulář
- ✅ Formulář se předvyplní hodnotami z položky
- ✅ Zobrazí se tlačítka "Uložit změny" a "Zrušit"

**2. Editace hodnot:**
- ✅ **Název položky** - povinné pole
- ✅ **Množství** - povinné pole (min. 1)
- ✅ **Přiřazení účastníkovi** - volitelné pole

**3. Uložení změn:**
- ✅ **PUT request** na `/api/events/${eventToken}/inventory/${id}`
- ✅ **Validace** všech polí
- ✅ **Aktualizace** seznamu po úspěchu
- ✅ **Zavření** editačního formuláře

**4. Zrušení editace:**
- ✅ **Reset formuláře** na původní hodnoty
- ✅ **Zavření** editačního formuláře
- ✅ **Zrušení** všech změn

### API endpoint:

**PUT `/api/events/[token]/inventory/[id]`**
```typescript
// Request body
{
  name: string,
  quantity: number,
  assigned_to: string | null
}

// Response
{
  id: string,
  name: string,
  quantity: number,
  assigned_to: string | null,
  assigned_participant_name: string | null,
  created_at: string,
  updated_at: string
}
```

### Výhody nové funkcionality:

**1. Kompletní CRUD operace:**
- ✅ **Create** - přidávání nových položek
- ✅ **Read** - zobrazení seznamu položek
- ✅ **Update** - editace existujících položek
- ✅ **Delete** - mazání položek

**2. Konzistentní UX:**
- ✅ **Stejné chování** jako u účastníků a dopravy
- ✅ **Jednotný design** formulářů
- ✅ **Intuitivní ovládání** s ikonami

**3. Robustní validace:**
- ✅ **Zod schéma** pro validaci
- ✅ **Error handling** pro chyby
- ✅ **Loading stavy** během operací

**4. Responzivní design:**
- ✅ **Grid layout** pro formulář
- ✅ **Flexbox** pro tlačítka
- ✅ **Mobile-friendly** design

### 🎯 Jak to vypadá:

**Seznam položek s tlačítky:**
```
┌─────────────────────────────────────────────────────────┐
│ 📦 Inventář [+]                                        │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Stan                    Množství: 2 • Beru: Jan   │ │
│ │                                    [✏️] [🗑️]      │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Spacák                   Množství: 1              │ │
│ │                                    [✏️] [🗑️]      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Editační formulář:**
```
┌─────────────────────────────────────────────────────────┐
│ 📦 Inventář [+]                                        │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Upravit položku                                    │ │
│ │ ┌─────────────────┐ ┌─────────────────┐           │ │
│ │ │ Název položky   │ │ Množství        │           │ │
│ │ │ [Stan]          │ │ [2]             │           │ │
│ │ └─────────────────┘ └─────────────────┘           │ │
│ │ Přiřadit účastníkovi                              │ │
│ │ [Jan ▼]                                           │ │
│ │ [Uložit změny] [Zrušit]                          │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Funkce zůstávají stejné:

**Všechny existující funkce:**
- ✅ **Přidávání** nových položek
- ✅ **Mazání** položek
- ✅ **Přiřazování** účastníků
- ✅ **Dropdown formuláře**
- ✅ **Validace** a error handling

**Nové funkce:**
- ✅ **Editace** existujících položek
- ✅ **Předvyplnění** formuláře
- ✅ **PUT endpoint** pro aktualizace
- ✅ **Konzistentní UX** s ostatními komponenty

### 🎉 Hotovo!

Editace inventáře byla úspěšně implementována:
- ✅ Tlačítko "✏️" u každé položky
- ✅ Editační formulář s předvyplněnými hodnotami
- ✅ PUT endpoint pro aktualizace
- ✅ Konzistentní design s ostatními komponenty
- ✅ Všechny existující funkce zachovány

**Aplikace je připravena k použití!** 🚀 