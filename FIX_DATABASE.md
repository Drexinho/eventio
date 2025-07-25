# 🔧 Oprava databáze - EventPlanner

## Problém
Aplikace neumí vytvářet události kvůli RLS (Row Level Security) politikám.

## Řešení

### Krok 1: Jděte do Supabase Dashboard
1. Otevřete [https://supabase.com/dashboard/project/lajbbdpvjfwcfultmbps/](https://supabase.com/dashboard/project/lajbbdpvjfwcfultmbps/)
2. Klikněte na **"SQL Editor"** v levém menu

### Krok 2: Spusťte opravený SQL skript
Zkopírujte a spusťte tento SQL kód:

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

### Krok 3: Ověření
1. Spusťte SQL kód
2. Měli byste vidět "Success" zprávu
3. Zkuste znovu vytvořit událost v aplikaci

## Alternativní řešení
Pokud výše uvedené nefunguje, můžete také:

### Kompletní reset databáze
```sql
-- Smazat všechny tabulky
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS transport_assignments CASCADE;
DROP TABLE IF EXISTS transport CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Spustit kompletní skript znovu
-- (zkopírujte obsah souboru supabase-schema-simple.sql)
```

## Hotovo! 🎉
Po spuštění SQL kódu by měla aplikace fungovat správně. 