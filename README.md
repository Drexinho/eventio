# EventPlanner - Soukromý plánovač událostí

Moderní webová aplikace pro soukromé plánování událostí s podporou více skupin a bezpečným přístupem přes unikátní odkazy nebo PIN kódy.

## 🚀 Funkce

- **Soukromé události** - Každá událost má unikátní odkaz nebo PIN kód
- **Spolupráce v reálném čase** - Všichni s přístupem mohou editovat
- **Správa účastníků** - Přidávání, editace a mazání účastníků
- **Plánování dopravy** - Přiřazování účastníků k dopravě
- **Inventář** - Seznam věcí, které si účastníci vezmou s sebou
- **Audit log** - Historie všech změn
- **Responsivní design** - Funguje na všech zařízeních

## 🛠️ Technologie

- **Frontend**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Formuláře**: React Hook Form + Zod validace
- **Databáze**: Supabase (PostgreSQL)
- **Bezpečnost**: Row Level Security (RLS)
- **Deployment**: Vercel

## 📦 Instalace

```bash
# Klonování repository
git clone <repository-url>
cd event-planner

# Instalace závislostí
npm install

# Nastavení environment proměnných
cp .env.local.example .env.local
# Upravte .env.local s vašimi Supabase údaji

# Spuštění vývojového serveru
npm run dev
```

## 🔧 Konfigurace

### Environment proměnné

Vytvořte soubor `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase nastavení

1. Vytvořte projekt na [supabase.com](https://supabase.com)
2. Spusťte SQL skript `supabase-schema.sql`
3. Zkopírujte URL a API klíče do `.env.local`

## 🚀 Deployment

### Vercel (doporučeno)

1. Pushněte kód do GitHub repository
2. Importujte projekt do Vercel
3. Nastavte environment proměnné
4. Deploy!

Více informací v [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📱 Použití

### Vytvoření události
1. Jděte na `/create`
2. Vyplňte informace o události
3. Vyberte typ přístupu (odkaz nebo PIN)
4. Získejte unikátní odkaz pro sdílení

### Připojení k události
1. Jděte na `/join`
2. Zadejte odkaz nebo PIN kód
3. Začněte spolupracovat!

### Správa události
- **Účastníci**: Přidávejte a spravujte seznam účastníků
- **Doprava**: Plánujte dopravu a přiřazujte účastníky
- **Inventář**: Spravujte seznam věcí
- **Historie**: Sledujte všechny změny

## 🔒 Bezpečnost

- **Row Level Security** - Každá událost je izolovaná
- **Token validace** - Ověření přístupu na každém požadavku
- **Audit log** - Sledování všech změn
- **Anonymní přístup** - Bez registrace, pouze přes token

## 🧪 Testování

Po deploymentu můžete otestovat funkce na `/test`

## 📄 Licence

MIT License

## 🤝 Přispívání

1. Fork repository
2. Vytvořte feature branch
3. Commit změny
4. Push do branch
5. Otevřete Pull Request

## 📞 Support

Pro podporu nebo dotazy:
- Vytvořte Issue v GitHub repository
- Kontaktujte autora projektu

---

Vytvořeno s ❤️ pro lepší plánování událostí
