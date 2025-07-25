# 🎉 EventPlanner v1.0 - Stable Version

## 📋 Přehled

EventPlanner je kompletní aplikace pro správu událostí s možností sdílení přes token. Aplikace umožňuje správu účastníků, dopravy, inventáře a audit logů všech změn.

## ✨ Funkce

### 🎯 Hlavní funkce
- ✅ **Vytváření událostí** s tokenem pro sdílení
- ✅ **Správa účastníků** (přidávání, editace, mazání)
- ✅ **Správa dopravy** (přidávání, editace, mazání, přiřazování účastníků)
- ✅ **Správa inventáře** (přidávání, editace, mazání, přiřazování účastníků)
- ✅ **Audit logy** všech změn
- ✅ **Editace hlavních informací** události
- ✅ **Responsivní design** pro všechny zařízení

### 🎨 UI/UX Funkce
- ✅ **Single-page design** - vše na jedné stránce
- ✅ **Grid layout** 2x2 pro hlavní sekce
- ✅ **Dropdown formuláře** pro přidávání
- ✅ **Inline editace** přímo pod položkami
- ✅ **Adaptivní velikost tlačítek** podle délky textu
- ✅ **Ikony** pro lepší orientaci
- ✅ **Barevné indikátory** stavu (přiřazeno/nepřiřazeno)

## 🚀 Rychlé spuštění

### Požadavky
- Node.js 18+
- PostgreSQL 13+

### 1. Instalace
```bash
# Klonování repozitáře
git clone git@github.com:Drexinho/eventio.git
cd eventio

# Instalace závislostí
npm install
```

### 2. Databáze
```bash
# Spuštění PostgreSQL
sudo systemctl start postgresql

# Vytvoření databáze a uživatele
sudo -u postgres psql -c "CREATE USER eventplanner WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE eventplanner_db OWNER eventplanner;"

# Spuštění schématu
psql -U eventplanner -d eventplanner_db -f postgresql-schema.sql
```

### 3. Konfigurace
```bash
# Vytvoření .env.local
cat > .env.local << EOF
DATABASE_URL=postgresql://eventplanner:your_password@localhost:5432/eventplanner_db
EOF
```

### 4. Spuštění
```bash
# Development mode
npm run dev

# Testování
curl http://localhost:3000/api/test-db
```

## 📊 Databázová struktura

### Tabulky
- **`events`** - Události (název, popis, datum, cena, token)
- **`participants`** - Účastníci (jméno, poznámky, zůstává celý čas)
- **`transport`** - Doprava (typ, místa, čas, kapacita, cena, mezizastávky)
- **`transport_assignments`** - Přiřazení účastníků k dopravě
- **`inventory_items`** - Inventář (název, množství, přiřazení)
- **`audit_logs`** - Audit logy všech změn

## 🔧 API Endpoints

### Události
- `GET /api/events/[token]` - Získat událost
- `PUT /api/events/[token]` - Upravit událost

### Účastníci
- `GET /api/events/[token]/participants` - Seznam účastníků
- `POST /api/events/[token]/participants` - Přidat účastníka
- `PUT /api/events/[token]/participants/[id]` - Upravit účastníka
- `DELETE /api/events/[token]/participants/[id]` - Smazat účastníka

### Doprava
- `GET /api/events/[token]/transport` - Seznam dopravy
- `POST /api/events/[token]/transport` - Přidat dopravu
- `PUT /api/events/[token]/transport/[id]` - Upravit dopravu
- `DELETE /api/events/[token]/transport/[id]` - Smazat dopravu
- `POST /api/events/[token]/transport/assign` - Přiřadit účastníka
- `DELETE /api/events/[token]/transport/assign` - Odebrat účastníka

### Inventář
- `GET /api/events/[token]/inventory` - Seznam inventáře
- `POST /api/events/[token]/inventory` - Přidat položku
- `PUT /api/events/[token]/inventory/[id]` - Upravit položku
- `DELETE /api/events/[token]/inventory/[id]` - Smazat položku

### Audit logy
- `GET /api/events/[token]/audit-logs` - Seznam audit logů

## 🎯 Klíčové funkce

### 1. Správa účastníků
- ✅ **Přidávání** účastníků s jménem a poznámkami
- ✅ **Editace** existujících účastníků
- ✅ **Mazání** účastníků
- ✅ **Indikace** zda zůstává celý čas
- ✅ **Poznámky** pro každého účastníka

### 2. Správa dopravy
- ✅ **Přidávání** dopravy s detaily (typ, místa, čas, kapacita, cena)
- ✅ **Editace** existující dopravy
- ✅ **Mazání** dopravy
- ✅ **Přiřazování/odebírání** účastníků
- ✅ **Mezizastávky** s časem a poznámkami
- ✅ **Výpočet ceny** na jednoho účastníka
- ✅ **Poznámky** pro dopravu

### 3. Správa inventáře
- ✅ **Přidávání** položek s množstvím
- ✅ **Editace** existujících položek
- ✅ **Mazání** položek
- ✅ **Přiřazování** účastníků k položkám
- ✅ **Poznámky** pro položky

### 4. Audit systém
- ✅ **Logování** všech změn (INSERT, UPDATE, DELETE)
- ✅ **Historie** s detaily změn
- ✅ **Předchozí a nové hodnoty** v JSON formátu

## 🎨 UI Komponenty

### Layout
- ✅ **Single-page design** - vše na jedné stránce
- ✅ **Grid layout** 2x2 pro sekce (Participants+Transport, Inventory+Audit)
- ✅ **Obrázek události** vpravo (60% velikost)
- ✅ **Základní informace** vlevo (název, datum, popis, cena)

### Formuláře
- ✅ **Dropdown design** - skryté do kliknutí na +
- ✅ **Inline editace** - formulář pod položkou
- ✅ **Validace** s chybovými zprávami
- ✅ **Automatické zavírání** po úspěšném přidání

### Tlačítka a interakce
- ✅ **Adaptivní velikost** podle délky textu
- ✅ **Barevné indikátory** stavu (přiřazeno/nepřiřazeno)
- ✅ **Ikony** pro lepší UX
- ✅ **Potvrzovací dialogy** pro mazání

## 🔧 Technické detaily

### Frontend
- ✅ **Next.js 15** s App Router
- ✅ **TypeScript** pro typovou bezpečnost
- ✅ **Tailwind CSS** pro styling
- ✅ **React Hook Form** pro formuláře
- ✅ **Zod** pro validaci

### Backend
- ✅ **PostgreSQL** databáze
- ✅ **pg** Node.js klient
- ✅ **Next.js API Routes**
- ✅ **Audit triggers** v databázi

### Deployment
- ✅ **Lokální PostgreSQL** instance
- ✅ **Environment variables** pro konfiguraci
- ✅ **Error handling** na všech úrovních

## 🚀 Deployment

### Lokální spuštění
```bash
npm run dev
```

### Produkční nasazení
```bash
# Build aplikace
npm run build

# Spuštění s PM2
npm install -g pm2
pm2 start npm --name "eventplanner" -- start
pm2 startup
pm2 save
```

### Nginx konfigurace (volitelně)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🎯 Výhody této verze

### 1. Robustnost
- ✅ **Kompletní CRUD** operace pro všechny entity
- ✅ **Audit logging** všech změn
- ✅ **Error handling** s uživatelskými zprávami
- ✅ **Type safety** TypeScript

### 2. UX/UI
- ✅ **Intuitivní design** s ikonami
- ✅ **Responsivní layout** pro všechna zařízení
- ✅ **Adaptivní tlačítka** podle obsahu
- ✅ **Vizuální feedback** pro všechny akce

### 3. Funkčnost
- ✅ **Kompletní workflow** pro správu událostí
- ✅ **Flexibilní přiřazování** účastníků
- ✅ **Detailní audit** všech změn
- ✅ **Poznámky** pro všechny entity

## 📝 Poznámky

### ✅ Stabilní funkce
- Všechny CRUD operace fungují
- Audit logging je kompletní
- UI je responsivní a intuitivní
- Error handling je robustní

### 🔄 Možná vylepšení pro v2.0
- Notifikace pro uživatele
- Export dat do PDF/Excel
- Kalendářní view
- Offline funkcionalita
- Multi-language podpora

## 🎉 Závěr

**EventPlanner v1.0** je kompletní, stabilní aplikace pro správu událostí s:
- ✅ **Kompletní funkcionalitou** pro správu účastníků, dopravy a inventáře
- ✅ **Intuitivním UI** s adaptivními tlačítky a vizuálními indikátory
- ✅ **Robustním backendem** s PostgreSQL a audit loggingem
- ✅ **Responsivním designem** pro všechna zařízení

**Aplikace je připravena k produkčnímu nasazení!** 🚀

---

## 📞 Podpora

Pro problémy nebo dotazy vytvořte issue v GitHub repozitáři: https://github.com/Drexinho/eventio
