# Nastavení Supabase pro EventPlanner

## 1. Vytvoření Supabase projektu

1. Jděte na [supabase.com](https://supabase.com)
2. Přihlaste se nebo vytvořte účet
3. Klikněte na "New Project"
4. Vyplňte:
   - **Name**: EventPlanner
   - **Database Password**: (vyberte silné heslo)
   - **Region**: (vyberte nejbližší region)
5. Klikněte na "Create new project"

## 2. Získání API klíčů

1. Po vytvoření projektu jděte do **Settings** → **API**
2. Zkopírujte:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** klíč (NEXT_PUBLIC_SUPABASE_ANON_KEY)

## 3. Nastavení environment proměnných

Vytvořte soubor `.env.local` v kořenové složce projektu:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 4. Vytvoření databázových tabulek

1. Jděte do **SQL Editor** v Supabase dashboardu
2. Zkopírujte obsah souboru `supabase-schema.sql`
3. Spusťte SQL skript

## 5. Ověření nastavení

Po dokončení by měla aplikace fungovat s databází.

## Struktura tabulek

- **events** - hlavní tabulka událostí
- **participants** - účastníci událostí
- **transport** - doprava
- **transport_assignments** - přiřazení účastníků k dopravě
- **inventory_items** - inventář věcí
- **audit_logs** - audit log změn

Všechny tabulky mají Row Level Security (RLS) aktivované pro bezpečnost. 