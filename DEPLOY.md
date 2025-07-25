# 🚀 Rychlý Deployment na Vercel

## Krok 1: Instalace Vercel CLI
```bash
npm i -g vercel
```

## Krok 2: Login do Vercel
```bash
vercel login
```

## Krok 3: Deployment
```bash
vercel --prod
```

## Krok 4: Nastavení Environment Proměnných
Po deploymentu v Vercel dashboardu nastavte:

```
NEXT_PUBLIC_SUPABASE_URL=https://lajbbdpvjfwcfultmbps.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhamJiZHB2amZ3Y2Z1bHRtYnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODYwMjgsImV4cCI6MjA2ODk2MjAyOH0.J4VHPj_RRQDLR2aTWtEusHY6KowhCCyBIoyxmtIGyR8
```

## Krok 5: Ověření
1. Otevřete nasazenou URL
2. Jděte na `/test` pro ověření funkcí
3. Vytvořte testovací událost
4. Otestujte sdílení odkazu

## Hotovo! 🎉
Vaše aplikace je nyní dostupná na Vercel! 