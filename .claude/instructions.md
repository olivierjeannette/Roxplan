# RoxPlan — Instructions pour Agents IA

## Contexte Projet
RoxPlan est un editeur 2D drag-and-drop specialise fitness permettant aux coachs/organisateurs de creer des plans de parcours visuels (HYROX, CrossFit, Spartan) avec export PDF/PNG.

## Architecture
- **Frontend:** Next.js 14 App Router + TypeScript + Tailwind CSS
- **Canvas 2D:** Konva.js via react-konva (import dynamique, pas de SSR)
- **State:** Zustand (`/src/stores/editorStore.ts`)
- **DB:** Neon PostgreSQL + Drizzle ORM (`/src/lib/schema.ts`)
- **Storage:** Vercel Blob (images de fond)
- **Deploy:** Vercel

## Regles de Dev

### Composants
- Toujours `'use client'` pour les composants interactifs
- Konva doit etre importe dynamiquement (`dynamic(() => import(...), { ssr: false })`)
- Utiliser `cn()` de `@/lib/utils` pour les classes conditionnelles

### State Management
- Store principal: `useEditorStore` dans `/src/stores/editorStore.ts`
- Toute modification d'element doit passer par le store (pas de state local pour les donnees du canvas)
- `pushHistory()` avant chaque modification pour le undo/redo

### API
- Route Handlers dans `/src/app/api/`
- Utiliser `NextRequest` / `NextResponse`
- Schema Drizzle dans `/src/lib/schema.ts`

### Export
- PNG: `stage.toDataURL({ pixelRatio: 2 })` cote client
- PDF: `jsPDF` avec image du canvas
- Fonctions dans `/src/lib/export.ts`

### Auto-save
- Debounce 2 secondes
- localStorage pour MVP
- Future: PUT `/api/plans/:id`

## Fichiers Cles
```
src/stores/editorStore.ts    — Store Zustand principal
src/lib/schema.ts            — Schema Drizzle (users, plans, customElements)
src/lib/elements.ts          — Bibliotheque d'elements fitness
src/lib/export.ts            — Fonctions export PNG/PDF
src/types/index.ts           — Types TypeScript
src/components/editor/       — Composants editeur (Canvas, Toolbar, etc.)
src/app/editor/[planId]/     — Page editeur
src/app/page.tsx             — Dashboard / liste des plans
```

## Conventions
- Pas d'accents dans le code (commentaires OK)
- Tailwind CSS uniquement, pas de CSS-in-JS
- Imports avec `@/` prefix
- Fonctions utilitaires dans `/src/lib/`
