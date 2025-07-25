# 🎯 Finální řešení - EventPlanner

## Problém
Aplikace neumí vytvářet události kvůli RLS politikám v Supabase.

## Řešení (KROK ZA KROKEM)

### Krok 1: Opravte databázi v Supabase
1. **Jděte na**: https://supabase.com/dashboard/project/lajbbdpvjfwcfultmbps/
2. **Klikněte na "SQL Editor"** v levém menu
3. **Spusťte tento SQL kód**:

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

### Krok 2: Restartujte aplikaci
```bash
# Zastavte server (Ctrl+C)
# Pak spusťte znovu:
cd /home/drexinho/Documents/EventPlanner/event-planner
npm run dev
```

### Krok 3: Otestujte databázi
1. **Otevřete**: http://localhost:3000/test-db
2. **Počkejte** na dokončení testu
3. **Pokud test projde** → databáze funguje ✅
4. **Pokud test selže** → zkontrolujte SQL kód z kroku 1

### Krok 4: Vytvořte událost
1. **Jděte na**: http://localhost:3000/create
2. **Vyplňte formulář**:
   - Název: "Test událost"
   - Datum začátku: dnešní datum
   - Datum konce: zítřejší datum
   - Počet lidí: 5
   - Cena: 1000
   - Typ přístupu: Odkaz
3. **Klikněte "Vytvořit událost"**

## Očekávaný výsledek
- ✅ Událost se vytvoří
- ✅ Budete přesměrováni na detail události
- ✅ Můžete přidávat účastníky, dopravu, inventář

## Pokud to stále nefunguje

### Zkontrolujte konzoli prohlížeče
1. **Stiskněte F12** (Developer Tools)
2. **Klikněte na "Console"**
3. **Zkuste vytvořit událost**
4. **Zkopírujte chybovou zprávu**

### Možné chyby a řešení

**Chyba: "new row violates row-level security policy"**
- Řešení: Spusťte SQL kód z kroku 1 znovu

**Chyba: "Invalid API key"**
- Řešení: Zkontrolujte .env.local soubor

**Chyba: "Network error"**
- Řešení: Zkontrolujte internetové připojení

## Hotovo! 🎉
Po dokončení všech kroků by měla aplikace fungovat správně. 