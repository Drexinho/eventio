# 📦 Dependencies - Eventio

Kompletní seznam všech závislostí a jejich účelu v Eventio aplikaci.

## 🎯 Hlavní závislosti

### Next.js 15
```json
"next": "^15.4.3"
```
- **Účel**: React framework pro full-stack aplikace
- **Funkce**: Server-side rendering, API routes, routing
- **Verze**: Nejnovější stabilní verze s Turbopack

### React 18
```json
"react": "^18.3.1",
"react-dom": "^18.3.1"
```
- **Účel**: UI knihovna pro frontend
- **Funkce**: Komponenty, hooks, state management
- **Verze**: Nejnovější stabilní verze

### TypeScript
```json
"typescript": "^5.7.2"
```
- **Účel**: Typová bezpečnost pro JavaScript
- **Funkce**: Statická analýza, lepší IDE podpora
- **Verze**: Nejnovější stabilní verze

## 🎨 Styling a UI

### Tailwind CSS
```json
"tailwindcss": "^3.4.17"
```
- **Účel**: Utility-first CSS framework
- **Funkce**: Rychlé styling, responsivní design
- **Konfigurace**: `tailwind.config.js`

### PostCSS
```json
"postcss": "^8.4.38"
```
- **Účel**: CSS post-processor
- **Funkce**: Optimalizace CSS, autoprefixer

### Autoprefixer
```json
"autoprefixer": "^10.4.19"
```
- **Účel**: Automatické CSS prefixy
- **Funkce**: Kompatibilita s různými prohlížeči

## 📝 Formuláře a validace

### React Hook Form
```json
"react-hook-form": "^7.51.0"
```
- **Účel**: Performance-optimalizované formuláře
- **Funkce**: Form state management, validace
- **Výhody**: Minimální re-rendery

### Zod
```json
"zod": "^3.23.8"
```
- **Účel**: TypeScript-first schema validation
- **Funkce**: Runtime validace, type inference
- **Integrace**: S React Hook Form

## 🗄️ Databáze

### pg (PostgreSQL)
```json
"pg": "^8.11.3"
```
- **Účel**: PostgreSQL klient pro Node.js
- **Funkce**: Databázové připojení, dotazy
- **Konfigurace**: `DATABASE_URL` environment variable

### @types/pg
```json
"@types/pg": "^8.11.10"
```
- **Účel**: TypeScript definice pro pg
- **Funkce**: Typová bezpečnost pro databázové operace

## 🛠️ Development tools

### ESLint
```json
"eslint": "^8.57.0",
"eslint-config-next": "^15.4.3"
```
- **Účel**: JavaScript/TypeScript linting
- **Funkce**: Code quality, konzistence
- **Konfigurace**: `.eslintrc.json`

### Prettier
```json
"prettier": "^3.3.3"
```
- **Účel**: Code formatter
- **Funkce**: Automatické formátování kódu
- **Konfigurace**: `.prettierrc`

## 📦 Build tools

### Turbopack
```json
"@next/turbopack": "^15.4.3"
```
- **Účel**: Rychlý bundler pro Next.js
- **Funkce**: Development server, hot reload
- **Výhody**: Mnohem rychlejší než Webpack

## 🔧 Utility knihovny

### clsx
```json
"clsx": "^2.1.1"
```
- **Účel**: Utility pro CSS třídy
- **Funkce**: Podmíněné CSS třídy
- **Použití**: `clsx()` pro dynamické styling

### class-variance-authority
```json
"class-variance-authority": "^0.7.0"
```
- **Účel**: Type-safe CSS varianty
- **Funkce**: Komponentové varianty
- **Použití**: UI komponenty s variantami

## 🎨 UI komponenty

### Lucide React
```json
"lucide-react": "^0.468.0"
```
- **Účel**: Moderní ikony
- **Funkce**: SVG ikony pro UI
- **Výhody**: Tree-shakable, TypeScript podpora

## 📊 Monitoring a debugging

### Built-in Next.js logging
- **Účel**: Request/response logging
- **Funkce**: API endpoint monitoring
- **Konfigurace**: Automatické v development módu

## 🔒 Bezpečnostní závislosti

### Rate limiting
- **Implementace**: Vlastní implementace v `src/lib/rate-limit.ts`
- **Funkce**: Ochrana proti brute force útokům
- **Konfigurace**: 5 pokusů na 10 minut

### Input validation
- **Zod**: Runtime validace všech vstupů
- **SQL injection**: Parametrizované dotazy přes pg
- **XSS**: Next.js built-in ochrana

## 📦 Production dependencies

### Core runtime
```json
{
  "next": "^15.4.3",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "pg": "^8.11.3",
  "react-hook-form": "^7.51.0",
  "zod": "^3.23.8",
  "clsx": "^2.1.1",
  "class-variance-authority": "^0.7.0",
  "lucide-react": "^0.468.0"
}
```

### Development dependencies
```json
{
  "typescript": "^5.7.2",
  "@types/node": "^20.14.10",
  "@types/react": "^18.3.12",
  "@types/react-dom": "^18.3.1",
  "@types/pg": "^8.11.10",
  "eslint": "^8.57.0",
  "eslint-config-next": "^15.4.3",
  "prettier": "^3.3.3",
  "tailwindcss": "^3.4.17",
  "postcss": "^8.4.38",
  "autoprefixer": "^10.4.19"
}
```

## 🔄 Aktualizace závislostí

### Kontrola zastaralých balíčků
```bash
npm outdated
```

### Aktualizace na nejnovější verze
```bash
npm update
```

### Bezpečnostní audit
```bash
npm audit
npm audit fix
```

## 📋 Verzování

### Semver (Semantic Versioning)
- **Major**: Breaking changes
- **Minor**: Nové funkce, backward compatible
- **Patch**: Bug fixes, backward compatible

### Lock file
- **package-lock.json**: Zajišťuje konzistentní instalace
- **Commit**: Vždy commitovat lock file

## 🚀 Optimalizace

### Bundle size
- **Tree shaking**: Automatické v Next.js
- **Code splitting**: Automatické na route úrovni
- **Image optimization**: Next.js Image komponenta

### Performance
- **Turbopack**: Rychlý development server
- **SSR**: Server-side rendering pro SEO
- **Caching**: Next.js built-in caching

## 📞 Support

Pro problémy se závislostmi:
1. Zkontrolujte `npm audit`
2. Aktualizujte na nejnovější verze
3. Ověřte kompatibilitu s Node.js verzí
4. Zkontrolujte GitHub issues pro dané balíčky

---

**Eventio** - Optimalizované závislosti pro maximální výkon 