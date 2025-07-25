# 🚨 Rychlá oprava - EventPlanner

## Problém
Aplikace neumí vytvářet události - zobrazuje se chyba "Nepodařilo se vytvořit událost".

## Řešení (5 minut)

### Krok 1: Otevřete Supabase Dashboard
1. Jděte na: https://supabase.com/dashboard/project/lajbbdpvjfwcfultmbps/
2. Klikněte na **"SQL Editor"** v levém menu

### Krok 2: Spusťte tento SQL kód
Zkopírujte a vložte tento kód do SQL Editoru:

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

### Krok 3: Klikněte na "Run"
Spusťte SQL kód tlačítkem "Run".

### Krok 4: Otestujte aplikaci
1. Otevřete http://localhost:3000
2. Klikněte na "Vytvořit novou událost"
3. Vyplňte formulář a klikněte "Vytvořit událost"
4. ✅ Mělo by to fungovat!

## Hotovo! 🎉
Po spuštění SQL kódu by měla aplikace fungovat správně.

## Pokud to stále nefunguje
Zkuste restartovat vývojový server:
```bash
# Zastavte server (Ctrl+C)
# Pak spusťte znovu:
npm run dev
``` 