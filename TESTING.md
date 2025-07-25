# 🧪 Testování EventPlanner

## Testovací scénáře

### 1. Vytvoření události
- [ ] Jděte na `/create`
- [ ] Vyplňte všechny povinné pole
- [ ] Vyberte "Odkaz" jako typ přístupu
- [ ] Klikněte na "Vytvořit událost"
- [ ] Ověřte, že jste přesměrováni na detail události

### 2. Vytvoření události s PIN kódem
- [ ] Jděte na `/create`
- [ ] Vyplňte všechny povinné pole
- [ ] Vyberte "PIN kód" jako typ přístupu
- [ ] Klikněte na "Vytvořit událost"
- [ ] Zkopírujte vygenerovaný PIN kód

### 3. Připojení k události přes odkaz
- [ ] Jděte na `/join`
- [ ] Vložte celý URL odkaz události
- [ ] Klikněte na "Připojit se"
- [ ] Ověřte, že jste přesměrováni na detail události

### 4. Připojení k události přes PIN
- [ ] Jděte na `/join`
- [ ] Vložte 9-místný PIN kód
- [ ] Klikněte na "Připojit se"
- [ ] Ověřte, že jste přesměrováni na detail události

### 5. Správa účastníků
- [ ] V detailu události najděte sekci "Účastníci"
- [ ] Přidejte nového účastníka (jméno, odkud, telefon)
- [ ] Ověřte, že se účastník zobrazí v seznamu
- [ ] Smažte účastníka
- [ ] Ověřte, že se účastník odstraní ze seznamu

### 6. Správa dopravy
- [ ] V detailu události najděte sekci "Doprava"
- [ ] Přidejte novou dopravu (název, kapacita)
- [ ] Přiřaďte účastníka k dopravě
- [ ] Ověřte, že se přiřazení zobrazí
- [ ] Odeberte účastníka z dopravy

### 7. Správa inventáře
- [ ] V detailu události najděte sekci "Inventář"
- [ ] Přidejte novou položku (název, množství, kdo bere)
- [ ] Ověřte, že se položka zobrazí v seznamu
- [ ] Upravte položku
- [ ] Smažte položku

### 8. Audit log
- [ ] Proveďte nějakou změnu (přidání účastníka, dopravy, atd.)
- [ ] Zkontrolujte sekci "Historie změn"
- [ ] Ověřte, že se změna zobrazí v audit logu

### 9. Responsivní design
- [ ] Otevřete aplikaci na mobilním zařízení
- [ ] Ověřte, že se všechny komponenty správně zobrazují
- [ ] Otestujte všechny funkce na mobilu

### 10. Sdílení mezi zařízeními
- [ ] Vytvořte událost na jednom zařízení
- [ ] Zkopírujte odkaz nebo PIN
- [ ] Otevřete na jiném zařízení
- [ ] Ověřte, že můžete editovat stejnou událost

## Automatické testy
Spusťte automatické testy na `/test` stránce po deploymentu.

## Očekávané chování
- ✅ Všechny formuláře validují vstupy
- ✅ Změny se ukládají do databáze
- ✅ Audit log sleduje všechny změny
- ✅ RLS politiky chrání data
- ✅ Aplikace funguje na všech zařízeních
- ✅ PIN kódy jsou 9-místné čísla
- ✅ UUID jsou validní formát
- ✅ Ceny se správně formátují
- ✅ Data se správně formátují 