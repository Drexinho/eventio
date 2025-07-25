# 🔍 Debugování problému s vytvářením událostí

## Krok 1: Ověřte, zda jste spustili SQL kód
1. Jděte na: https://supabase.com/dashboard/project/lajbbdpvjfwcfultmbps/
2. Klikněte na **"SQL Editor"**
3. Spusťte tento kód:

```sql
-- Zkontrolujte, jaké RLS politiky existují
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Krok 2: Pokud nejsou správné politiky, spusťte opravu
```sql
-- Smazat staré RLS politiky
DROP POLICY IF EXISTS "Allow access by token" ON events;
DROP POLICY IF EXISTS "Allow access by event token" ON participants;
DROP POLICY IF EXISTS "Allow access by event token" ON transport;
DROP POLICY IF EXISTS "Allow access by event token" ON transport_assignments;
DROP POLICY IF EXISTS "Allow access by event token" ON inventory_items;
DROP POLICY IF EXISTS "Allow read by event token" ON audit_logs;

-- Vytvořit nové zjednodušené RLS politiky
CREATE POLICY "Allow all events" ON events
  FOR ALL USING (true);

CREATE POLICY "Allow all participants" ON participants
  FOR ALL USING (true);

CREATE POLICY "Allow all transport" ON transport
  FOR ALL USING (true);

CREATE POLICY "Allow all transport_assignments" ON transport_assignments
  FOR ALL USING (true);

CREATE POLICY "Allow all inventory_items" ON inventory_items
  FOR ALL USING (true);

CREATE POLICY "Allow all audit_logs" ON audit_logs
  FOR ALL USING (true);
```

## Krok 3: Otevřete konzoli prohlížeče
1. Otevřete http://localhost:3000/create
2. Stiskněte **F12** (Developer Tools)
3. Klikněte na **"Console"** tab
4. Zkuste vytvořit událost
5. Zkopírujte chybovou zprávu

## Krok 4: Zkontrolujte environment proměnné
```bash
# V terminálu spusťte:
cat .env.local
```

Mělo by zobrazit:
```
NEXT_PUBLIC_SUPABASE_URL=https://lajbbdpvjfwcfultmbps.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhamJiZHB2amZ3Y2Z1bHRtYnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODYwMjgsImV4cCI6MjA2ODk2MjAyOH0.J4VHPj_RRQDLR2aTWtEusHY6KowhCCyBIoyxmtIGyR8
```

## Krok 5: Restartujte server
```bash
# Zastavte server (Ctrl+C)
# Pak spusťte znovu:
npm run dev
```

## Krok 6: Testujte s jednoduchými daty
Zkuste vytvořit událost s těmito daty:
- Název: "Test"
- Datum začátku: dnešní datum
- Datum konce: zítřejší datum
- Počet lidí: 5
- Cena: 1000
- Typ přístupu: Odkaz

## Krok 7: Pokud stále nefunguje
Zkopírujte chybovou zprávu z konzole a pošlete mi ji. 