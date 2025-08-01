# Mobilní Responzivní Design - EventPlanner

## Přehled

Tento dokument popisuje implementaci mobilního responzivního designu pro EventPlanner aplikaci. Mobilní design je implementován jako **samostatná vrstva**, která **neovlivňuje původní desktop verzi**.

## Architektura

### 1. CSS Media Queries
- **Breakpoint**: `@media (max-width: 767px)`
- **Umístění**: `src/app/globals.css` - sekce "MOBILNÍ RESPONZIVNÍ DESIGN"
- **Princip**: Všechny mobilní styly jsou v samostatné sekci s `!important` pravidly

### 2. Komponenty

#### MobileNavigation.tsx
- **Účel**: Spodní navigace pro mobilní zařízení
- **Funkce**: 
  - Automatická detekce mobilního zařízení
  - Kontextová navigace (domů vs. event)
  - Aktivní stav indikátor

#### MobileWrapper.tsx
- **Účel**: Wrapper komponenty pro přidání mobilních tříd
- **Typy**:
  - `MobileCardWrapper`
  - `MobileButtonWrapper`
  - `MobileFormWrapper`
  - `MobilePanelWrapper`

#### MobileEventLayout.tsx
- **Účel**: Layout pro event stránky na mobilu
- **Funkce**:
  - Sticky header
  - Scrollable content
  - Bottom navigation

### 3. Hooks

#### useMobile.ts
```typescript
const { isMobile, isLandscape, isMobileOrLandscape } = useMobile()
```

#### useMobileTouch.ts
```typescript
const { isTouching, touchHandlers } = useMobileTouch()
```

#### useMobileScroll.ts
```typescript
const { scrollY, isScrolled } = useMobileScroll()
```

### 4. Utility Funkce

#### mobileUtils.ts
- `isMobileDevice()` - Detekce mobilního zařízení
- `isTouchDevice()` - Detekce touch zařízení
- `vibrate()` - Haptic feedback
- `scrollToTop()` - Scroll na začátek
- `preventZoomOnFocus()` - Zabránění zoomu při focus

## CSS Třídy

### Základní Mobilní Třídy

```css
.mobile-container     /* Hlavní kontejner */
.mobile-hero         /* Hero sekce */
.mobile-buttons      /* Tlačítka */
.mobile-button       /* Jednotlivé tlačítko */
.mobile-card         /* Karty */
.mobile-card-grid    /* Grid karet */
.mobile-nav          /* Navigace */
.mobile-form         /* Formuláře */
.mobile-panel        /* Panely */
.mobile-list         /* Seznamy */
.mobile-modal        /* Modaly */
```

### Text a Spacing

```css
.mobile-text-sm      /* Malý text */
.mobile-text-base    /* Základní text */
.mobile-text-lg      /* Velký text */
.mobile-text-xl      /* Extra velký text */
.mobile-spacing      /* Spacing */
.mobile-padding      /* Padding */
```

### Layout

```css
.mobile-grid-1       /* 1 sloupec */
.mobile-grid-2       /* 2 sloupce */
.mobile-flex-col     /* Flexbox column */
.mobile-flex-row     /* Flexbox row */
.mobile-sticky       /* Sticky pozicování */
```

### Animace

```css
.mobile-slide-up     /* Slide up animace */
.mobile-fade-in      /* Fade in animace */
```

## Použití

### 1. Přidání Mobilních Tříd

```tsx
// Původní komponenta
<Button className="bg-blue-500">Tlačítko</Button>

// S mobilními třídami
<Button className="bg-blue-500 mobile-button">Tlačítko</Button>
```

### 2. Použití Mobile Wrapper

```tsx
import { MobileCardWrapper } from '@/components/MobileWrapper'

<MobileCardWrapper>
  <Card>
    <CardContent>Obsah karty</CardContent>
  </Card>
</MobileCardWrapper>
```

### 3. Použití Mobile Layout

```tsx
import MobileEventLayout from '@/components/MobileEventLayout'

<MobileEventLayout eventId="123">
  <div>Obsah event stránky</div>
</MobileEventLayout>
```

### 4. Použití Hooks

```tsx
import { useMobile } from '@/hooks/useMobile'

function MyComponent() {
  const { isMobile } = useMobile()
  
  return (
    <div className={isMobile ? 'mobile-container' : 'container'}>
      Obsah
    </div>
  )
}
```

## Funkce

### ✅ Implementované

1. **Responsive Breakpoints** - 767px breakpoint
2. **Mobile Navigation** - Spodní navigace
3. **Touch Optimized** - Touch-friendly tlačítka
4. **Safe Area Support** - iPhone safe area
5. **Landscape Support** - Landscape orientace
6. **Haptic Feedback** - Vibrate API
7. **Scroll Optimization** - Smooth scroll
8. **Keyboard Handling** - Zoom prevention
9. **Orientation Change** - Orientation detection

### 🔄 Plánované

1. **Swipe Gestures** - Swipe navigace
2. **Pull to Refresh** - Refresh gesto
3. **Offline Support** - Service worker
4. **PWA Features** - Install prompt
5. **Deep Linking** - URL handling

## Testování

### Desktop Testování
```bash
# Otevřít DevTools
# Nastavit viewport na mobilní rozměry
# Testovat všechny breakpointy
```

### Mobilní Testování
```bash
# Testovat na skutečných zařízeních
# Testovat různé orientace
# Testovat touch interakce
```

## Best Practices

### 1. Desktop First
- Všechny komponenty jsou primárně pro desktop
- Mobilní styly jsou přidány jako dodatečná vrstva

### 2. Progressive Enhancement
- Základní funkcionalita funguje všude
- Mobilní funkce jsou přidány postupně

### 3. Performance
- Mobilní styly jsou optimalizované
- Minimální JavaScript na mobilu
- Lazy loading komponent

### 4. Accessibility
- Touch targets minimálně 44px
- Proper contrast ratios
- Screen reader support

## Troubleshooting

### Problém: Mobilní styly se neaplikují
**Řešení**: Zkontrolujte, že CSS třídy jsou správně přidány

### Problém: Desktop styly jsou přepsány
**Řešení**: Používejte pouze `mobile-` prefixed třídy

### Problém: Touch nefunguje
**Řešení**: Zkontrolujte `useMobileTouch` hook

### Problém: Orientace se nerozpoznává
**Řešení**: Zkontrolujte `onOrientationChange` handler

## Kontakt

Pro otázky ohledně mobilního designu kontaktujte vývojový tým. 