# Eventio - Event Planning Application

Moderní aplikace pro plánování událostí s pokročilými funkcemi pro správu účastníků, dopravy, inventáře a WANTED sekcí.

## 🚀 Funkce

- **Správa událostí**: Vytváření a editace událostí s detaily
- **Účastníci**: Přidávání a správa účastníků události
- **Doprava**: Plánování dopravních možností a přiřazování účastníků
- **Inventář**: Sledování předmětů a jejich přiřazení
- **WANTED sekce**: Seznam předmětů, které je potřeba sehnat
- **PIN ochrana**: Bezpečnostní systém s PIN kódy pro editaci
- **Read-only režim**: Prohlížení bez možnosti editace
- **Rate limiting**: Ochrana proti brute force útokům

## 🛠️ Technologie

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Databáze**: PostgreSQL
- **Formuláře**: React Hook Form + Zod
- **Deployment**: Vercel (doporučeno)

## 📋 Požadavky

- Node.js 18+ 
- PostgreSQL 12+
- npm nebo yarn

## 🚀 Instalace a Deployment

### 1. Klonování repozitáře
```bash
git clone https://github.com/Drexinho/Eventio.git
cd Eventio
```

### 2. Instalace závislostí
```bash
npm install
```

### 3. Nastavení databáze

#### PostgreSQL instalace (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Vytvoření databáze a uživatele
```bash
sudo -u postgres psql
```

```sql
CREATE USER eventplanner WITH PASSWORD 'your_password';
CREATE DATABASE eventplanner OWNER eventplanner;
GRANT ALL PRIVILEGES ON DATABASE eventplanner TO eventplanner;
\q
```

#### Import schématu
```bash
sudo -u postgres psql -d eventplanner -f postgresql-schema.sql
```

### 4. Konfigurace prostředí

Vytvořte soubor `.env.local`:
```env
DATABASE_URL=postgresql://eventplanner:your_password@localhost:5432/eventplanner
```

### 5. Spuštění aplikace

#### Vývojový režim
```bash
npm run dev
```
Aplikace bude dostupná na `http://localhost:3000`

#### Produkční build
```bash
npm run build
npm start
```

## 🔧 Konfigurace

### Databázové schéma
Schéma je definováno v `postgresql-schema.sql` a obsahuje:
- Tabulky pro události, účastníky, dopravu, inventář
- WANTED sekci pro předměty k sehnání
- Audit logy pro sledování změn
- Indexy pro optimalizaci výkonu

### Bezpečnostní funkce
- **PIN systém**: 4-místné PIN kódy pro editaci událostí
- **Rate limiting**: 5 pokusů na 10 minut pro PIN ověření
- **Read-only režim**: Prohlížení bez možnosti editace
- **Hash-based přístup**: 20-znakové hashe pro URL

## 📱 Použití

### Vytvoření události
1. Přejděte na hlavní stránku
2. Klikněte na "Vytvořit událost"
3. Vyplňte údaje a vygenerujte odkaz + PIN
4. Sdílejte odkaz s účastníky

### Připojení k události
- **Přes odkaz**: Automaticky read-only režim
- **Přes PIN**: Možnost editace po zadání PIN kódu

### WANTED sekce
- Přidávání předmětů k sehnání
- Označení "Mám" a přesun do inventáře
- Editace a mazání položek

## 🔒 Bezpečnost

- Všechny API endpointy jsou chráněny
- Rate limiting na PIN ověření
- Validace vstupů pomocí Zod
- SQL injection ochrana přes parametrizované dotazy

## 🚀 Deployment na Vercel

### 1. Připravte aplikaci
```bash
npm run build
```

### 2. Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

### 3. Environment variables na Vercel
Nastavte `DATABASE_URL` v Vercel dashboardu.

### 4. Databáze pro produkci
Doporučujeme použít:
- **Vercel Postgres** (integrované řešení)
- **Neon** (serverless PostgreSQL)
- **Supabase** (open source alternativa)

## 📊 Monitoring

Aplikace loguje:
- Databázové dotazy s časováním
- API požadavky
- Chyby a výjimky
- Rate limiting události

## 🐛 Řešení problémů

### Databáze se nepřipojuje
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
```

### Port 3000 je obsazený
```bash
lsof -i :3000
kill -9 <PID>
```

### Build chyby
```bash
rm -rf .next
npm run build
```

## 📝 License

MIT License - viz LICENSE soubor

## 🤝 Contributing

1. Fork repozitáře
2. Vytvořte feature branch
3. Commit změny
4. Push do branch
5. Otevřete Pull Request

## 📞 Support

Pro podporu kontaktujte autora nebo otevřete issue na GitHubu.

---

**Eventio** - Moderní řešení pro plánování událostí
