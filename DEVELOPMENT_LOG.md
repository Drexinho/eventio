# Event Planner - Development Log

## 📋 Shrnutí vývoje

### **Hlavní funkce implementované:**
- ✅ **Kompletní CRUD operace** pro události, účastníky, dopravu, inventář
- ✅ **PostgreSQL databáze** s audit logem
- ✅ **Next.js API routes** pro backend
- ✅ **React komponenty** s inline editováním
- ✅ **Futuristický design** s gradienty a blur efekty
- ✅ **Filtrování sekcí** (Všechno, Účastníci, Doprava, Inventář)
- ✅ **Responsive design** pro mobilní zařízení

### **Technický stack:**
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, custom animations
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL s connection pooling
- **Forms**: React Hook Form + Zod validation
- **UI**: shadcn/ui komponenty

### **Klíčové soubory:**
- `src/app/event/[token]/page.tsx` - hlavní stránka události
- `src/components/ParticipantsPanel.tsx` - správa účastníků
- `src/components/TransportPanel.tsx` - správa dopravy
- `src/components/InventoryPanel.tsx` - správa inventáře
- `src/lib/database-postgresql.ts` - databázové funkce
- `postgresql-schema.sql` - databázové schéma

### **Design změny:**
- 🌙 **Tmavé pozadí** s gradientem pro Card komponenty
- ✨ **Světle modrá políčka** účastníků s gradientem
- 🎨 **Futuristický vzhled** s blur efekty
- 📱 **Responsive design** pro všechny zařízení

### **API Endpoints:**
- `GET/POST /api/events/[token]/participants`
- `GET/PUT/DELETE /api/events/[token]/participants/[id]`
- `GET/POST /api/events/[token]/transport`
- `GET/PUT/DELETE /api/events/[token]/transport/[id]`
- `GET/POST /api/events/[token]/inventory`
- `GET/PUT/DELETE /api/events/[token]/inventory/[id]`
- `POST /api/events/[token]/transport/assign`

### **Databázové tabulky:**
- `events` - hlavní události
- `participants` - účastníci (jméno, celý čas, poznámky)
- `transport` - doprava (typ, lokace, čas, cena, mezizastávky)
- `transport_assignments` - přiřazení účastníků k dopravě
- `inventory_items` - inventář (název, množství, přiřazení)
- `audit_logs` - historie změn

### **Poslední změny:**
- Změna pozadí Card komponenty na tmavé s gradientem
- Úprava textových barev pro lepší kontrast
- Zachování světle modrých políček účastníků

### **Pro pokračování na jiném zařízení:**
1. `git clone git@github.com:Drexinho/eventio.git`
2. `npm install`
3. Nastavit PostgreSQL databázi
4. Spustit `postgresql-schema.sql`
5. Vytvořit `.env.local` s databázovými údaji
6. `npm run dev`

### **Možnosti pro mobilní aplikaci:**
- **PWA** (1-2 dny) - nejrychlejší
- **React Native** (2-3 týdny) - cross-platform
- **Flutter** (3-4 týdny) - nejlepší performance

### **Git repozitář:**
- **URL**: `git@github.com:Drexinho/eventio.git`
- **Poslední commit**: `1c28300` - Update ParticipantsPanel styling
- **Status**: Všechny dependencies v `package.json`

---
*Poslední aktualizace: 25. července 2024* 