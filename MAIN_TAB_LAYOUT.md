# 🎨 Úprava hlavního tabu - Dokončeno!

## ✅ Změna implementována

### Co bylo změněno:

**1. Nové rozložení hlavního tabu:**
- ✅ **Dvoukolonkové rozložení** - informace vlevo, obrázek vpravo
- ✅ **Obrázek menší** - 60% původní velikosti
- ✅ **Zjednodušené informace** - jen základní údaje

**2. Levý sloupec - informace:**
- ✅ **Název události** a datum
- ✅ **Popis** události (pokud existuje)
- ✅ **Maximální počet účastníků**
- ✅ **Cena celkem**
- ✅ **Cena na jednoho** (vypočítaná)
- ✅ **Odkazy** na mapu a ubytování

**3. Pravý sloupec - obrázek:**
- ✅ **Obrázek menší** - 60% velikosti
- ✅ **Zarovnání vpravo** na větších obrazovkách
- ✅ **Centrování** na menších obrazovkách
- ✅ **Error handling** - skryje se při chybě

### Technické změny:

**Hlavní stránka události:** `src/app/event/[token]/page.tsx`
```typescript
// Nové rozložení s grid:
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Levý sloupec - informace */}
  <div className="space-y-4">
    {event.description && (
      <p className="text-muted-foreground">{event.description}</p>
    )}

    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-3 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">Maximální počet účastníků</p>
        <p className="text-xl font-bold">{event.max_participants}</p>
      </div>
      <div className="text-center p-3 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">Cena celkem</p>
        <p className="text-xl font-bold">{event.price} Kč</p>
      </div>
    </div>

    <div className="text-center p-3 bg-muted rounded-lg">
      <p className="text-sm text-muted-foreground">Cena na jednoho</p>
      <p className="text-xl font-bold">
        {Math.ceil(event.price / Math.max(event.max_participants, 1))} Kč
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      {event.map_link && (
        <Button asChild variant="outline">
          <a href={event.map_link} target="_blank" rel="noopener noreferrer">
            🗺️ Mapa
          </a>
        </Button>
      )}
      
      {event.booking_link && (
        <Button asChild variant="outline">
          <a href={event.booking_link} target="_blank" rel="noopener noreferrer">
            🏰 Odkaz na ubytování
          </a>
        </Button>
      )}
    </div>
  </div>

  {/* Pravý sloupec - obrázek */}
  {event.image_url && (
    <div className="flex justify-center lg:justify-end">
      <img 
        src={event.image_url} 
        alt={event.name}
        className="w-full max-w-md h-auto rounded-lg shadow-md"
        style={{ width: '60%' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )}
</div>
```

### Jak to vypadá:

**Desktop (lg a větší):**
- **Levý sloupec (50%)**: Informace o události
- **Pravý sloupec (50%)**: Obrázek (60% velikosti, zarovnaný vpravo)

**Mobilní zařízení:**
- **Jedna kolona**: Informace nahoře, obrázek dole
- **Obrázek**: Centrovaný, 60% velikosti

### Informace v levém sloupci:

**1. Základní informace:**
- ✅ **Název události** (v hlavičce)
- ✅ **Datum** (v hlavičce)
- ✅ **Popis** (pokud existuje)

**2. Statistiky:**
- ✅ **Maximální počet účastníků**
- ✅ **Cena celkem**
- ✅ **Cena na jednoho** (automaticky vypočítaná)

**3. Odkazy:**
- ✅ **🗺️ Mapa** (pokud existuje)
- ✅ **🏰 Odkaz na ubytování** (pokud existuje)

### Obrázek v pravém sloupci:

**Vlastnosti:**
- ✅ **60% velikosti** původní velikosti
- ✅ **Responzivní** - přizpůsobí se obrazovce
- ✅ **Error handling** - skryje se při chybě
- ✅ **Zarovnání** - vpravo na desktopu, centrovaný na mobilu

### Výhody nového rozložení:

**1. Lepší využití prostoru:**
- ✅ **Informace a obrázek** vedle sebe
- ✅ **Menší obrázek** nezabírá tolik místa
- ✅ **Čitelnější** informace

**2. Responzivní design:**
- ✅ **Desktop**: Dvoukolonkové rozložení
- ✅ **Mobil**: Jednokolonkové rozložení
- ✅ **Automatické přizpůsobení**

**3. Zjednodušené informace:**
- ✅ **Jen základní údaje** - žádné zbytečné informace
- ✅ **Přehledné** statistiky
- ✅ **Důležité odkazy** na jednom místě

### 🎉 Hotovo!

Hlavní tab byl úspěšně upraven:
- ✅ Dvoukolonkové rozložení
- ✅ Obrázek menší (60%)
- ✅ Zjednodušené informace
- ✅ Responzivní design
- ✅ Lepší UX

**Aplikace je připravena k použití!** 🚀 