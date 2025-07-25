# 🐘 PostgreSQL Setup - EventPlanner

## ✅ Úspěšně nahrazeno Supabase za PostgreSQL!

### Co bylo uděláno:

1. **Nainstalován PostgreSQL** - lokální databázový server
2. **Vytvořena databáze** - `eventplanner` s uživatelem `eventplanner`
3. **Vytvořeno schéma** - kompletní tabulky, indexy, triggery a funkce
4. **Nahrazen Supabase** - PostgreSQL klient a API routes
5. **Aktualizovány typy** - TypeScript typy pro PostgreSQL schéma
6. **Vytvořeny API routes** - pro bezpečné volání databáze

### Databázové informace:

- **Host:** localhost
- **Port:** 5432
- **Database:** eventplanner
- **User:** eventplanner
- **Password:** eventplanner123

### Vytvořené tabulky:

- `events` - události
- `participants` - účastníci
- `transport` - doprava
- `transport_assignments` - přiřazení dopravy
- `inventory_items` - inventář
- `audit_logs` - audit logy

### API Endpoints:

- `GET /api/test-db` - test připojení k databázi
- `POST /api/events` - vytvoření události

### Testovací stránky:

- `http://localhost:3000/test-postgresql` - test PostgreSQL
- `http://localhost:3000/create` - vytvoření události

### Jak to otestovat:

1. **Otevřete prohlížeč** na http://localhost:3000/test-postgresql
2. **Počkejte** na dokončení testu
3. **Pokud test projde** → PostgreSQL funguje ✅
4. **Jděte na** http://localhost:3000/create pro vytvoření události

### Výhody PostgreSQL oproti Supabase:

- ✅ **Žádné RLS problémy** - plná kontrola nad databází
- ✅ **Lokální vývoj** - rychlejší a spolehlivější
- ✅ **Žádné API limity** - neomezené volání
- ✅ **Lepší debugging** - přímý přístup k databázi
- ✅ **Offline funkčnost** - nezávislost na internetu

### Soubory pro správu:

- `postgresql-schema.sql` - kompletní databázové schéma
- `src/lib/postgresql.ts` - PostgreSQL klient
- `src/lib/database-postgresql.ts` - databázové funkce
- `src/app/api/events/route.ts` - API pro události
- `src/app/api/test-db/route.ts` - API pro testování

### Příkazy pro správu databáze:

```bash
# Připojení k databázi
PGPASSWORD=eventplanner123 psql -U eventplanner -d eventplanner

# Spuštění SQL skriptu
PGPASSWORD=eventplanner123 psql -U eventplanner -d eventplanner -f postgresql-schema.sql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Stav PostgreSQL
sudo systemctl status postgresql
```

### Hotovo! 🎉

PostgreSQL je nyní plně funkční a nahradil Supabase. Aplikace by měla fungovat bez problémů s vytvářením událostí. 