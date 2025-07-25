# 🧪 Rychlé testování EventPlanner

## 1. Spuštění aplikace
```bash
cd /home/drexinho/Documents/EventPlanner/event-planner
npm run dev
```

Aplikace běží na: **http://localhost:3000**

## 2. Základní testy

### Test 1: Vytvoření události
1. Otevřete **http://localhost:3000**
2. Klikněte na **"Vytvořit novou událost"**
3. Vyplňte formulář:
   - Název: "Testovací výlet"
   - Popis: "Testovací událost pro ověření funkcí"
   - Datum začátku: dnešní datum
   - Datum konce: zítřejší datum
   - Počet lidí: 5
   - Cena: 1000
   - Typ přístupu: **Odkaz**
4. Klikněte **"Vytvořit událost"**
5. ✅ Měli byste být přesměrováni na detail události

### Test 2: Přidání účastníků
1. V detailu události najděte sekci **"Účastníci"**
2. Přidejte účastníka:
   - Jméno: "Jan Novák"
   - Odkud: "Praha"
   - Telefon: "123456789"
3. Klikněte **"Přidat účastníka"**
4. ✅ Účastník se zobrazí v seznamu

### Test 3: Přidání dopravy
1. Najděte sekci **"Doprava"**
2. Přidejte dopravu:
   - Název: "Auto"
   - Počet míst: 4
3. Klikněte **"Přidat dopravu"**
4. ✅ Doprava se zobrazí v seznamu

### Test 4: Přiřazení účastníka k dopravě
1. V sekci dopravy klikněte na **"Přiřadit účastníka"**
2. Vyberte "Jan Novák" z dropdown menu
3. Klikněte **"Přiřadit"**
4. ✅ Účastník se zobrazí u dopravy

### Test 5: Přidání inventáře
1. Najděte sekci **"Inventář"**
2. Přidejte položku:
   - Název: "Stan"
   - Množství: 1
   - Kdo bere: "Jan Novák"
3. Klikněte **"Přidat položku"**
4. ✅ Položka se zobrazí v seznamu

### Test 6: Sdílení události
1. Zkopírujte URL z adresního řádku
2. Otevřete nové okno prohlížeče
3. Vložte URL
4. ✅ Měli byste vidět stejnou událost

### Test 7: Připojení přes PIN
1. Jděte na **http://localhost:3000/create**
2. Vytvořte novou událost s typem **"PIN kód"**
3. Zkopírujte vygenerovaný PIN
4. Jděte na **http://localhost:3000/join**
5. Vložte PIN kód
6. Klikněte **"Připojit se"**
7. ✅ Měli byste být přesměrováni na událost

### Test 8: Audit log
1. Proveďte nějakou změnu (přidejte účastníka, dopravu, atd.)
2. Scrollujte dolů na sekci **"Historie změn"**
3. ✅ Změna by se měla zobrazit v audit logu

## 3. Automatické testy
Jděte na **http://localhost:3000/test** a spusťte automatické testy.

## 4. Očekávané výsledky
- ✅ Všechny formuláře fungují
- ✅ Data se ukládají do databáze
- ✅ Sdílení odkazu funguje
- ✅ PIN kódy fungují
- ✅ Audit log sleduje změny
- ✅ Aplikace je responsivní

## 5. Řešení problémů

### Aplikace se nespustí
```bash
# Zkontrolujte, že jste ve správné složce
pwd
# Mělo by být: /home/drexinho/Documents/EventPlanner/event-planner

# Zkontrolujte, že máte .env.local
ls -la .env.local

# Pokud ne, vytvořte ho
echo "NEXT_PUBLIC_SUPABASE_URL=https://lajbbdpvjfwcfultmbps.supabase.co" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhamJiZHB2amZ3Y2Z1bHRtYnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODYwMjgsImV4cCI6MjA2ODk2MjAyOH0.J4VHPj_RRQDLR2aTWtEusHY6KowhCCyBIoyxmtIGyR8" >> .env.local
```

### Chyby v konzoli
- Zkontrolujte, že Supabase projekt je aktivní
- Ověřte environment proměnné
- Restartujte vývojový server

## Hotovo! 🎉
Pokud všechny testy projdou, aplikace funguje správně! 