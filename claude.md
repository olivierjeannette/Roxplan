# CLAUDE.md - RoxPlan

> Planificateur 2D d'evenements fitness (HYROX, CrossFit, Spartan, custom)
> Canvas drag-and-drop pour creer des plans de course professionnels

---

## PROJET

**RoxPlan** = outil web pour creer des plans d'evenements fitness en 2D.
L'utilisateur place des stations, zones, barrieres, routes sur un canvas et exporte en PNG/PDF.

**Stack** : Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + Konva.js + Zustand + Framer Motion
**DB** : localStorage (MVP), Neon PostgreSQL + Drizzle ORM (futur)
**Deploy** : Vercel

---

## DESIGN SYSTEM - "Glass Sport"

Direction artistique : **glassmorphism clair** avec energie sportive.
Inspirations : Linear, Raycast, Arc Browser, Strava.

### Palette de couleurs

```
--bg-primary: #F8FAFC          (fond principal, gris tres clair)
--bg-secondary: #F1F5F9        (fond secondaire, gris clair)
--bg-canvas: #FFFFFF            (fond du canvas)

--glass-bg: rgba(255,255,255,0.72)
--glass-border: rgba(255,255,255,0.18)
--glass-shadow: 0 8px 32px rgba(0,0,0,0.08)
--glass-blur: blur(16px)

--accent-primary: #6366F1       (indigo-500, action principale)
--accent-primary-hover: #4F46E5 (indigo-600)
--accent-gradient: linear-gradient(135deg, #6366F1, #8B5CF6)
--accent-glow: 0 0 20px rgba(99,102,241,0.3)

--text-primary: #0F172A         (slate-900)
--text-secondary: #475569       (slate-600)
--text-muted: #94A3B8           (slate-400)

--border-subtle: #E2E8F0        (slate-200)
--border-hover: #CBD5E1         (slate-300)

--success: #10B981              (emerald-500)
--warning: #F59E0B              (amber-500)
--danger: #EF4444               (red-500)

--sport-red: #EF4444            (stations HYROX)
--sport-purple: #8B5CF6         (equipements CrossFit)
--sport-green: #22C55E          (zones depart/arrivee)
--sport-amber: #F59E0B          (zones echauffement)
--sport-blue: #3B82F6           (zones eau/ravitaillement)
--sport-gray: #6B7280           (structures/barrieres)
```

### Typographie

```
Font principale : "Inter" (variable, Google Fonts)
Font mono (optionnel) : "JetBrains Mono" pour les valeurs numeriques

Tailles :
  - xs: 11px (labels, badges)
  - sm: 13px (corps, inputs)
  - base: 14px (corps principal)
  - lg: 16px (sous-titres)
  - xl: 20px (titres)
  - 2xl: 28px (hero)

Poids :
  - 400: corps
  - 500: labels, boutons
  - 600: sous-titres, elements actifs
  - 700: titres
```

### Composants Glass

Tous les panels, cartes, toolbars et popovers utilisent cet effet :

```css
.glass {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
```

Variantes :
- `.glass-subtle` : opacity 0.5, blur 8px (overlays legers)
- `.glass-solid` : opacity 0.9, blur 20px (panels principaux)
- `.glass-dark` : rgba(15,23,42,0.8) blur 16px (tooltips, menus contextuels)

### Bordures et rayons

```
Rayons :
  - sm: 8px (inputs, petits boutons)
  - md: 12px (cartes, panels)
  - lg: 16px (modals, grandes cartes)
  - xl: 20px (conteneurs principaux)
  - full: 9999px (badges, avatars, pills)

Bordures :
  - Defaut : 1px solid var(--border-subtle)
  - Hover : 1px solid var(--border-hover)
  - Active/Focus : 2px solid var(--accent-primary) + ring
  - Glass : 1px solid rgba(255,255,255,0.18)
```

### Ombres

```
--shadow-xs: 0 1px 2px rgba(0,0,0,0.04)
--shadow-sm: 0 2px 8px rgba(0,0,0,0.06)
--shadow-md: 0 4px 16px rgba(0,0,0,0.08)
--shadow-lg: 0 8px 32px rgba(0,0,0,0.10)
--shadow-xl: 0 16px 48px rgba(0,0,0,0.12)
--shadow-glow: 0 0 20px rgba(99,102,241,0.3)
```

### Animations (Framer Motion)

Toutes les transitions utilisent `framer-motion`. Pas de `transition-colors` Tailwind basique.

```
Durees :
  - fast: 150ms (hovers, toggles)
  - normal: 250ms (ouverture panels, apparition)
  - slow: 400ms (modals, page transitions)

Easing :
  - default: [0.25, 0.1, 0.25, 1] (ease-out)
  - spring: { type: "spring", stiffness: 400, damping: 30 }
  - bounce: { type: "spring", stiffness: 300, damping: 20 }

Patterns obligatoires :
  - Sidebars : slide-in depuis le bord + fade (x: -20 -> 0, opacity: 0 -> 1)
  - Modals : scale(0.95) -> scale(1) + fade + backdrop blur progressif
  - Cartes : fade-in + leger translateY (y: 8 -> 0)
  - Boutons hover : scale(1.02) + shadow-glow
  - Toolbar : spring + scale
  - Tooltips : fade + translateY(4 -> 0), delay 300ms
  - Liste items : stagger 50ms entre chaque element
  - Panel toggle : animatePresence + height auto
```

### Boutons

```
Primary :
  bg: var(--accent-gradient)
  text: white
  hover: scale(1.02) + shadow-glow
  active: scale(0.98)
  radius: 10px
  padding: 8px 16px
  font-weight: 500

Secondary :
  bg: glass
  text: var(--text-primary)
  border: var(--border-subtle)
  hover: border-color var(--border-hover) + bg slightly darker
  radius: 10px

Ghost :
  bg: transparent
  text: var(--text-secondary)
  hover: bg rgba(0,0,0,0.04)
  radius: 8px

Danger :
  bg: #FEE2E2
  text: #DC2626
  hover: bg #FECACA
  radius: 10px

Icon button :
  size: 36px x 36px
  radius: 10px
  bg: transparent
  hover: glass + scale(1.05)
```

### Inputs

```
bg: white
border: 1px solid var(--border-subtle)
radius: 10px
padding: 8px 12px
font-size: 13px
focus: border-color var(--accent-primary) + ring 3px rgba(99,102,241,0.15)
transition: border-color 150ms, box-shadow 150ms

Sliders :
  track: #E2E8F0 (h: 4px, radius full)
  thumb: white, border 2px var(--accent-primary), shadow-sm
  active-track: var(--accent-gradient)

Selects :
  style identique aux inputs
  chevron: var(--text-muted)
  dropdown: glass + shadow-lg

Checkboxes / Toggles :
  Preferez les toggles switch au lieu des checkboxes classiques
  Track off: #CBD5E1
  Track on: var(--accent-primary)
  Thumb: white, shadow-xs
  Animation: spring
```

---

## LAYOUT EDITOR

Layout moderne avec panels retractables et toolbar flottante.

```
+------------------------------------------------------------------+
|  [Header bar - glass, h:48px]                                     |
|  Logo | Nom du plan (editable) | undo/redo | zoom | save | export |
+------------------------------------------------------------------+
|        |                                           |              |
| [Lib]  |              [Canvas]                     | [Props]      |
| glass  |              white bg                     | glass        |
| w:240  |              flex-1                       | w:280        |
| slide  |                                           | slide        |
| retract|           [Floating toolbar]              | retract      |
| able   |           center-bottom                   | able         |
|        |           glass + shadow                  |              |
+------------------------------------------------------------------+
```

### Header bar
- Glass effect, hauteur 48px
- Logo RoxPlan a gauche (icone + texte, gradient accent)
- Nom du plan : input transparent, editable inline
- Centre : undo/redo (icon buttons), separateur, zoom controls
- Droite : indicateur de sauvegarde (animated), bouton sauvegarder, bouton exporter (gradient primary)

### Sidebar gauche - Bibliotheque
- Glass background, largeur 240px
- Bouton toggle pour retract (icone chevron, en haut)
- Quand retracte : icone-only mini bar (w:48px) avec tooltip au hover
- Recherche : input avec icone loupe, glass background
- Groupes : accordeons avec animation height, icone + titre + count badge
- Elements : grille 2 colonnes, cartes avec hover scale(1.03) + shadow
- Preview element : icone SVG centre, fond teinte, radius 10px

### Toolbar flottante
- Position : center-bottom du canvas, 16px du bord
- Glass + shadow-lg + radius 16px
- Outils : Select, Draw Route, Text, Eraser (icon buttons, 40x40)
- Separateur vertical glass
- Outil actif : bg accent-primary/10, text accent-primary, border-bottom 2px accent
- Apparition : spring animation depuis le bas

### Sidebar droite - Proprietes
- Glass background, largeur 280px
- Bouton toggle pour retract
- Etat vide : illustration + texte "Selectionnez un element"
- Sections avec titres separateurs
- Inputs, sliders, color pickers avec le style du design system
- Boutons d'action en bas : Dupliquer, Lock, Visibilite, Supprimer

### Canvas
- Fond blanc pur
- Grille : lignes subtiles (#E2E8F0, 0.3px), espacement 20px
- Scroll infini avec zoom (molette)
- Selection : contour bleu accent + handles arrondis
- Curseur : crosshair en mode dessin, grab/grabbing en mode select

---

## DASHBOARD

Page d'accueil avec liste des plans sauvegardes.

```
+------------------------------------------------------------------+
|  [Header - glass]                                                 |
|  Logo RoxPlan | "Mes plans" | [+ Nouveau plan] gradient button    |
+------------------------------------------------------------------+
|                                                                    |
|  [Grille de cartes plans]                                         |
|  Responsive : 1 col mobile, 2 tablet, 3-4 desktop                |
|                                                                    |
|  Chaque carte :                                                   |
|  - Glass card, radius 16px, hover scale(1.02) + shadow-md        |
|  - Thumbnail (aspect 16:9, placeholder gradient si vide)         |
|  - Badge type event (pill, colored)                               |
|  - Nom du plan (font-semibold)                                    |
|  - Date + nb stations (text-muted)                                |
|  - Menu 3 dots (duplicate, delete) au hover                      |
|                                                                    |
|  Etat vide :                                                      |
|  - Illustration minimaliste (SVG)                                 |
|  - "Aucun plan pour le moment"                                    |
|  - Bouton CTA "Creer mon premier plan" (gradient)                |
+------------------------------------------------------------------+
```

---

## REGLES DE CODE

### General
- TypeScript strict, pas de `any`
- Composants fonctionnels React avec hooks
- Nommage : PascalCase composants, camelCase fonctions/variables
- Fichiers : kebab-case ou PascalCase selon convention Next.js

### Performance
- `React.memo()` sur les composants Konva (CanvasElement, CanvasRoute)
- `useMemo` / `useCallback` pour les calculs et handlers
- Zustand : selectors individuels `useStore((s) => s.value)`, jamais de destructuring complet
- Konva : `listening={false}` sur les elements decoratifs
- Grille canvas : rendu natif `sceneFunc` (pas de composants React individuels)
- Historique : debounce 300ms sur les snapshots

### Structure fichiers
```
src/
  app/                     # Routes Next.js (App Router)
    page.tsx               # Dashboard
    editor/[planId]/       # Editeur
    api/                   # API routes (futur)
  components/
    editor/                # Composants editeur (Canvas, Toolbar, etc.)
    ui/                    # Composants UI reutilisables (Button, Input, etc.)
    dashboard/             # Composants dashboard
  stores/                  # Zustand stores
  lib/                     # Utilitaires, elements library, icons
  types/                   # Types TypeScript
```

### Animations
- Utiliser `framer-motion` pour TOUTES les animations UI
- Pas de `transition-*` Tailwind pour les animations complexes
- `AnimatePresence` pour les elements qui entrent/sortent du DOM
- Layout animations pour les changements de taille

### Accessibilite
- ARIA labels sur les boutons icones
- Focus ring visible (accent-primary)
- Keyboard navigation (Tab, Escape pour fermer)
- Pas d'emoji dans le rendu (utiliser des icones Lucide)
