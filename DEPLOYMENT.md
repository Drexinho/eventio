# Deployment na Vercel

## 1. Příprava projektu

### Nastavení environment proměnných
Před deploymentem je potřeba nastavit environment proměnné v Vercel:

1. Jděte na [vercel.com](https://vercel.com)
2. Přihlaste se nebo vytvořte účet
3. Klikněte na "New Project"
4. Importujte GitHub repository nebo nahrajte kód

### Environment proměnné v Vercel
V nastavení projektu v Vercel přidejte tyto environment proměnné:

```
NEXT_PUBLIC_SUPABASE_URL=https://lajbbdpvjfwcfultmbps.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhamJiZHB2amZ3Y2Z1bHRtYnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODYwMjgsImV4cCI6MjA2ODk2MjAyOH0.J4VHPj_RRQDLR2aTWtEusHY6KowhCCyBIoyxmtIGyR8
```

## 2. Deployment

### Automatický deployment (GitHub)
1. Pushněte kód do GitHub repository
2. V Vercel propojte s GitHub repository
3. Vercel automaticky nasadí při každém push

### Manuální deployment
```bash
# Instalace Vercel CLI
npm i -g vercel

# Login do Vercel
vercel login

# Deployment
vercel --prod
```

## 3. Nastavení domény

Po deploymentu získáte URL ve formátu:
`https://event-planner-xxx.vercel.app`

### Vlastní doména (volitelné)
1. V nastavení projektu v Vercel
2. Sekce "Domains"
3. Přidejte vlastní doménu

## 4. Ověření deploymentu

### Testování funkcí
1. **Vytvoření události**: `https://your-domain.com/create`
2. **Připojení k události**: `https://your-domain.com/join`
3. **Sdílení odkazu**: Zkopírujte vygenerovaný odkaz
4. **Testování PIN kódu**: Zkuste přístup přes PIN

### Kontrola logů
V Vercel dashboardu můžete sledovat:
- Build logy
- Function logy
- Error tracking

## 5. Monitoring a analytics

### Vercel Analytics
1. V nastavení projektu povolte Analytics
2. Sledujte návštěvnost a performance

### Error tracking
1. Integrujte Sentry nebo podobný nástroj
2. Sledujte chyby v produkci

## 6. Backup a recovery

### Databáze
- Supabase automaticky zálohuje data
- Můžete exportovat data přes Supabase dashboard

### Kód
- GitHub repository slouží jako backup
- Vercel automaticky nasadí z posledního commitu

## 7. Troubleshooting

### Časté problémy

**Build failed**
- Zkontrolujte environment proměnné
- Ověřte, že všechny závislosti jsou v package.json

**Database connection error**
- Ověřte Supabase URL a API klíče
- Zkontrolujte RLS politiky

**CORS error**
- Ověřte nastavení v Supabase
- Zkontrolujte allowed origins

### Support
- Vercel dokumentace: https://vercel.com/docs
- Supabase dokumentace: https://supabase.com/docs
- Next.js dokumentace: https://nextjs.org/docs 