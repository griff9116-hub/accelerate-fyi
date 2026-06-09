# Accelerate.fyi — Design System

This project uses **Tailwind v4** (CSS-first config). No `tailwind.config.js` exists — all
theme tokens live in `src/app/globals.css` inside the `@theme {}` block. Always use Tailwind
utility classes directly; reference the tokens below when choosing colours and spacing.

---

## Colours

### Background hierarchy (dark-only site)
| Layer | Class | Hex |
|-------|-------|-----|
| Page background | `bg-zinc-950` | `#09090b` |
| Cards, panels | `bg-zinc-900` | `#18181b` |
| Elevated / hover | `bg-zinc-800` or `bg-zinc-800/50` | `#27272a` |
| Input fields | `bg-zinc-800` or `bg-zinc-900` | — |

### Borders
| Use | Class |
|-----|-------|
| Default | `border-zinc-800` |
| Hover / active | `border-zinc-700` or `border-zinc-600` |
| Accent (featured) | `border-indigo-500/40` |
| Subtle dividers | `border-zinc-800` |

### Text
| Use | Class |
|-----|-------|
| Primary heading | `text-white` or `text-zinc-100` |
| Body | `text-zinc-400` |
| Muted / caption | `text-zinc-500` or `text-zinc-600` |
| Placeholder | `placeholder-zinc-500` or `placeholder-zinc-600` |

### Accent — indigo
| Use | Class |
|-----|-------|
| Primary button bg | `bg-indigo-600` hover `bg-indigo-500` |
| Active filter/pill | `bg-indigo-600/20 text-indigo-400 border-indigo-500` |
| Links, highlights | `text-indigo-400` hover `text-indigo-300` |
| Focus ring | `focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500` |

### Semantic colours
| Meaning | Classes |
|---------|---------|
| Success / SEIS / EIS | `bg-green-500/10 text-green-400 border-green-500/20` |
| Warning / urgent deadline | `bg-amber-500/10 text-amber-400 border-amber-500/20` |
| Error | `bg-red-500/10 text-red-400 border-red-500/30` |
| Featured badge | `bg-amber-500/10 text-amber-400 border-amber-500/20` |
| Sponsored badge | `bg-indigo-600/20 text-indigo-400` |

---

## Typography

Font stack is Geist Sans (headings + body) and Geist Mono (code), loaded via `next/font/google`
in `src/app/layout.tsx`.

| Element | Classes |
|---------|---------|
| Page H1 | `text-3xl font-bold text-white` |
| Section H2 | `text-xl font-bold text-white` |
| Card heading | `font-semibold text-zinc-100` |
| Body text | `text-sm text-zinc-400` |
| Caption / label | `text-xs text-zinc-500` |
| Filter section label | `text-xs font-semibold uppercase tracking-wider text-zinc-500` |

---

## Spacing & Layout

- Page wrapper: `mx-auto max-w-7xl px-4 py-8 sm:px-6`
- Section gap: `mb-8` between sections, `mt-6` between blocks
- Card padding: `p-5` (cards), `p-6 sm:p-8` (detail page header)
- Grid: `grid gap-4 sm:grid-cols-2 xl:grid-cols-3` for programme grids

---

## Component Patterns

### Cards
```tsx
<div className="group relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/50">
```
- Sponsored variant: `border-indigo-500/40`
- Always `rounded-xl` (never `rounded-lg` for cards)

### Buttons (use the `<Button>` component in `src/components/ui/Button.tsx`)
| Variant | Usage |
|---------|-------|
| `primary` | Main CTA — `bg-indigo-600 hover:bg-indigo-500` |
| `secondary` | Secondary action — `bg-zinc-800 border border-zinc-700` |
| `ghost` | Tertiary / destructive — `text-zinc-400 hover:bg-zinc-800` |
| `outline` | Nav-style buttons — `border-zinc-700 hover:border-indigo-500` |

Sizes: `sm` (h-8), `md` (h-10, default), `lg` (h-12).

### Badges (use `<Badge>` in `src/components/ui/Badge.tsx`)
Variants: `default` | `green` | `amber` | `red` | `accent`
```tsx
<Badge variant="green">SEIS</Badge>
<Badge variant="amber">⏱ 3 days left</Badge>
<Badge variant="accent">Pre-seed</Badge>
```

### Inputs
```tsx
<input className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
```

### Selects
```tsx
<select className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-300 focus:border-indigo-500 focus:outline-none" />
```

### Toggle switches (used in FilterBar)
```tsx
<div className={`relative h-5 w-9 rounded-full transition-colors ${active ? "bg-indigo-600" : "bg-zinc-700"}`}>
  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`} />
</div>
```

### Filter pills (active/inactive)
```tsx
// Active
"border-indigo-500 bg-indigo-600/20 text-indigo-400"
// Inactive
"border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
```

### Section headers in sidebar
```tsx
<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Label</p>
```

---

## Tailwind v4 Notes

- Config is CSS-only: `src/app/globals.css` contains the `@theme {}` block with CSS custom properties
- No `tailwind.config.js` or `tailwind.config.ts` — do not create one
- Import syntax: `@import "tailwindcss"` at top of globals.css
- Custom properties defined in `@theme`: `--color-ink`, `--color-accent`, `--color-surface`, etc.
- All standard Tailwind utilities (zinc, indigo, etc.) work exactly as before
- Typography plugin: `@plugin "@tailwindcss/typography"` in globals.css

---

## Icons

Uses **Lucide React** (`lucide-react`). Import specific icons:
```tsx
import { MapPin, Clock, Sparkles, Bell, ArrowRight } from "lucide-react";
```
Standard sizes: `h-4 w-4` (nav), `h-3.5 w-3.5` (inline), `h-3 w-3` (badge suffix).

---

## Animation

One custom animation defined in globals.css:
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fade-up 0.4s ease both; }
```
Use `animate-fade-up` for page-entry animations. Use `transition-colors` and `transition-all duration-200` for hover states.

---

## Scrollbar

Custom dark scrollbar styled in globals.css (6px, zinc track). No action needed — applies globally.
