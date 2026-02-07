# HYROX EVENT PLANNER — Architecture & Système Complet

**Nom de code :** RoxPlan
**Stack :** Next.js 14 (App Router) + Neon (PostgreSQL) + Vercel
**Version :** 1.0 MVP
**Auteur :** Olivier Jeannette
**Date :** Février 2026

---

## 1. VISION PRODUIT

### Le problème
Aucun outil ne permet aux coachs/organisateurs d'events fitness (HYROX, CrossFit, Spartan, etc.) de créer rapidement des **plans de parcours visuels** avec :
- Placement des stations d'exercice
- Sens de course fléché
- Numérotation des postes
- Export pro (PDF/PNG) partageable aux athlètes

Les solutions actuelles (Canva, Floorplanner, RoomSketcher) sont :
- Génériques (pas d'éléments fitness)
- Lentes à configurer
- Sans bibliothèque de stations HYROX/CrossFit

### La solution
Un éditeur 2D drag-and-drop spécialisé fitness avec :
1. Import de fond (Google Maps screenshot, photo, ou grille vide)
2. Bibliothèque d'éléments fitness préconfigurés
3. Système de parcours avec flèches directionnelles et numérotation
4. Export PNG/PDF haute qualité

---

## 2. USER STORIES MVP

| # | En tant que... | Je veux... | Pour... |
|---|---------------|-----------|---------|
| 1 | Coach/Organisateur | Importer une image de fond (satellite, photo, fond vide) | Travailler sur le vrai terrain |
| 2 | Coach/Organisateur | Glisser-déposer des éléments fitness sur le plan | Placer les stations rapidement |
| 3 | Coach/Organisateur | Tracer le sens de course avec des flèches | Que les athlètes comprennent le parcours |
| 4 | Coach/Organisateur | Numéroter automatiquement les stations | Clarifier l'ordre des exercices |
| 5 | Coach/Organisateur | Exporter en PNG/PDF | Partager sur WhatsApp/Instagram/imprimer |
| 6 | Coach/Organisateur | Sauvegarder mes plans | Les réutiliser et modifier plus tard |
| 7 | Coach/Organisateur | Dupliquer un plan existant | Créer des variantes rapidement |
| 8 | Coach/Organisateur | Personnaliser les couleurs/tailles des éléments | Adapter au branding de l'event |

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 Stack Détaillé

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  Next.js 14 (App Router) + TypeScript               │
│  ├── React 18                                       │
│  ├── Konva.js (react-konva) — Canvas 2D             │
│  ├── Tailwind CSS — UI                              │
│  ├── Zustand — State management                     │
│  ├── Lucide React — Icônes UI                       │
│  └── html-to-image / jsPDF — Export                 │
├─────────────────────────────────────────────────────┤
│                      API                             │
│  Next.js Route Handlers (App Router)                │
│  ├── /api/plans — CRUD plans                        │
│  ├── /api/upload — Upload images de fond            │
│  └── /api/export — Génération export serveur        │
├─────────────────────────────────────────────────────┤
│                    DATABASE                          │
│  Neon (PostgreSQL serverless)                       │
│  ├── Drizzle ORM                                    │
│  └── Connection pooling via Neon serverless driver  │
├─────────────────────────────────────────────────────┤
│                    STORAGE                           │
│  Vercel Blob — Images de fond uploadées             │
├─────────────────────────────────────────────────────┤
│                    DEPLOY                            │
│  Vercel — Auto-deploy from GitHub                   │
└─────────────────────────────────────────────────────┘
```

### 3.2 Pourquoi ces choix

| Choix | Raison |
|-------|--------|
| **Konva.js** | Lib Canvas 2D la plus mature pour React. Drag-and-drop natif, export image intégré, performant sur mobile. Alternatives (Fabric.js) moins bien intégrées React. |
| **Zustand** | State management léger, parfait pour l'état du canvas (éléments, positions, sélection). Pas besoin de Redux. |
| **Drizzle ORM** | Type-safe, léger, parfait avec Neon. Pas l'overhead de Prisma. |
| **Neon** | PostgreSQL serverless, cold start rapide, branching DB pour dev. Gratuit pour le MVP. |
| **Vercel Blob** | Storage fichiers intégré Vercel, simple, pas besoin de S3. |
| **jsPDF + html-to-image** | Export côté client = pas de charge serveur. |

---

## 4. MODÈLE DE DONNÉES (Neon/PostgreSQL)

### 4.1 Schéma Drizzle

```typescript
// schema.ts
import { pgTable, uuid, text, timestamp, jsonb, integer, boolean } from 'drizzle-orm/pg-core';

// ==================== USERS ====================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== PLANS ====================
export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  // Métadonnées
  name: text('name').notNull().default('Sans titre'),
  description: text('description'),
  eventType: text('event_type').default('hyrox'), // hyrox | crossfit | custom
  
  // Canvas
  canvasWidth: integer('canvas_width').notNull().default(1200),
  canvasHeight: integer('canvas_height').notNull().default(800),
  backgroundType: text('background_type').default('grid'), // grid | image | blank
  backgroundImageUrl: text('background_image_url'), // URL Vercel Blob
  backgroundOpacity: integer('background_opacity').default(100), // 0-100
  
  // Éléments du plan (JSONB = flexibilité max)
  elements: jsonb('elements').notNull().default('[]'),
  // Structure: voir Section 5 - Format des éléments
  
  // Parcours / Flèches
  routes: jsonb('routes').notNull().default('[]'),
  // Structure: voir Section 5 - Format des routes
  
  // Métadonnées plan
  isPublic: boolean('is_public').default(false),
  thumbnail: text('thumbnail'), // Data URL ou Blob URL du preview
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== ELEMENT TEMPLATES ====================
// Templates custom créés par l'utilisateur
export const customElements = pgTable('custom_elements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // station | zone | equipment | marker
  icon: text('icon').notNull(), // nom de l'icône SVG
  color: text('color').notNull().default('#3B82F6'),
  defaultWidth: integer('default_width').default(100),
  defaultHeight: integer('default_height').default(100),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### 4.2 Format JSONB — Elements

```typescript
// Types pour les éléments sur le canvas
interface PlanElement {
  id: string;                    // UUID unique
  type: 'station' | 'zone' | 'marker' | 'text' | 'arrow';
  
  // Position & dimensions
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;              // degrés
  
  // Apparence
  label: string;                 // Ex: "SkiErg", "Sled Push"
  stationNumber?: number;        // Numéro auto ou manuel
  icon: string;                  // Référence icône SVG
  color: string;                 // Hex color
  opacity: number;               // 0-1
  fontSize?: number;
  
  // Métadonnées station
  exerciseType?: string;         // skierg | sled_push | sled_pull | burpee_broad_jump | rowing | farmers_carry | lunges | wall_balls | custom
  reps?: string;                 // "1000m", "50m", "100 reps"
  equipment?: string[];          // ["SkiErg Concept2", "Timer"]
  
  // État
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

// Types pour les routes/parcours
interface Route {
  id: string;
  points: { x: number; y: number }[];  // Points du chemin
  color: string;
  strokeWidth: number;
  dashPattern?: number[];               // Pour lignes pointillées
  showArrows: boolean;                  // Flèches de direction
  arrowSpacing: number;                 // Espace entre flèches
  label?: string;                       // "Course 1km", "Transition"
}
```

---

## 5. BIBLIOTHÈQUE D'ÉLÉMENTS FITNESS

### 5.1 Éléments HYROX Standard

| Catégorie | Éléments | Icône | Couleur par défaut |
|-----------|----------|-------|--------------------|
| **Stations** | SkiErg | 🎿 pictogramme | `#EF4444` (rouge) |
| | Sled Push | 🔴 pictogramme | `#EF4444` |
| | Sled Pull | 🔴 pictogramme | `#EF4444` |
| | Burpee Broad Jump | 🔴 pictogramme | `#EF4444` |
| | Rowing | 🚣 pictogramme | `#EF4444` |
| | Farmers Carry | 🔴 pictogramme | `#EF4444` |
| | Sandbag Lunges | 🔴 pictogramme | `#EF4444` |
| | Wall Balls | 🔴 pictogramme | `#EF4444` |
| **Zones** | Départ | 🟢 | `#22C55E` (vert) |
| | Arrivée | 🏁 | `#22C55E` |
| | Zone spectateurs | 👥 | `#A855F7` (violet) |
| | Zone échauffement | 🔥 | `#F59E0B` (orange) |
| | Ravitaillement / Eau | 💧 | `#3B82F6` (bleu) |
| | Parking | 🅿️ | `#6B7280` (gris) |
| | Toilettes | 🚻 | `#6B7280` |
| | Podium / Scène | 🎤 | `#F59E0B` |
| **Parcours** | Ligne de course | → | `#000000` |
| | Flèche direction | ➤ | `#000000` |
| | Barrière / Délimitation | ▬ | `#9CA3AF` |
| | Cône | 🔺 | `#F97316` |
| **Marqueurs** | Numéro de station | #1 | `#FFFFFF` sur fond couleur |
| | Distance | 1km | `#000000` |
| | Texte libre | Abc | `#000000` |

### 5.2 Éléments CrossFit / Custom

| Éléments additionnels | Icône |
|----------------------|-------|
| Pull-up Bar / Rig | pictogramme |
| Box Jump | pictogramme |
| Kettlebell | pictogramme |
| Barbell / Rack | pictogramme |
| Assault Bike | pictogramme |
| Corde à grimper | pictogramme |
| Dumbbell | pictogramme |
| Medicine Ball | pictogramme |
| GHD | pictogramme |

### 5.3 Format SVG des icônes

Chaque élément a une icône SVG stockée dans `/public/icons/elements/` :

```
/public/icons/elements/
├── stations/
│   ├── skierg.svg
│   ├── sled-push.svg
│   ├── sled-pull.svg
│   ├── burpee-broad-jump.svg
│   ├── rowing.svg
│   ├── farmers-carry.svg
│   ├── lunges.svg
│   └── wall-balls.svg
├── zones/
│   ├── start.svg
│   ├── finish.svg
│   ├── spectators.svg
│   ├── warmup.svg
│   ├── water.svg
│   └── parking.svg
├── markers/
│   ├── cone.svg
│   ├── barrier.svg
│   └── distance.svg
└── crossfit/
    ├── pullup-bar.svg
    ├── box-jump.svg
    ├── kettlebell.svg
    └── ...
```

---

## 6. ARCHITECTURE FRONTEND

### 6.1 Structure des dossiers

```
/app
├── layout.tsx                    # Layout global
├── page.tsx                      # Landing / Dashboard
├── /editor/[planId]/
│   └── page.tsx                  # Éditeur principal
├── /plans/
│   └── page.tsx                  # Liste des plans sauvegardés
├── /api/
│   ├── /plans/
│   │   ├── route.ts              # GET (list), POST (create)
│   │   └── /[id]/
│   │       └── route.ts          # GET, PUT, DELETE
│   ├── /upload/
│   │   └── route.ts              # POST — upload image fond
│   └── /export/
│       └── route.ts              # POST — export serveur (optionnel)

/components/
├── /editor/
│   ├── Canvas.tsx                # Composant Konva principal
│   ├── CanvasElement.tsx         # Élément individuel sur le canvas
│   ├── CanvasRoute.tsx           # Ligne de parcours avec flèches
│   ├── Toolbar.tsx               # Barre d'outils (select, draw, etc.)
│   ├── ElementLibrary.tsx        # Panneau bibliothèque drag-and-drop
│   ├── PropertyPanel.tsx         # Panneau propriétés élément sélectionné
│   ├── BackgroundManager.tsx     # Gestion du fond (import, opacité)
│   ├── ExportDialog.tsx          # Modal d'export PNG/PDF
│   ├── StationNumbering.tsx      # Gestion numérotation auto
│   └── RouteDrawer.tsx           # Outil de dessin de parcours
├── /ui/
│   ├── Button.tsx
│   ├── Dialog.tsx
│   ├── Sidebar.tsx
│   └── ...
├── /plans/
│   ├── PlanCard.tsx              # Card preview d'un plan
│   └── PlanList.tsx              # Liste des plans

/stores/
├── editorStore.ts                # Zustand — état de l'éditeur
├── elementsStore.ts              # Zustand — éléments sur le canvas
└── routeStore.ts                 # Zustand — routes/parcours

/lib/
├── db.ts                         # Connexion Drizzle + Neon
├── schema.ts                     # Schéma Drizzle
├── export.ts                     # Fonctions d'export PNG/PDF
├── elements.ts                   # Définitions éléments par défaut
├── icons.ts                      # Mapping icônes SVG
└── utils.ts                      # Helpers

/public/
├── /icons/elements/              # SVGs des éléments (voir section 5.3)
└── /templates/                   # Templates de plans pré-faits
```

### 6.2 State Management (Zustand)

```typescript
// stores/editorStore.ts
interface EditorState {
  // Canvas
  zoom: number;
  panX: number;
  panY: number;
  
  // Outils
  activeTool: 'select' | 'draw_route' | 'add_element' | 'text' | 'eraser';
  
  // Sélection
  selectedElementId: string | null;
  selectedRouteId: string | null;
  
  // Éléments
  elements: PlanElement[];
  routes: Route[];
  
  // Background
  backgroundType: 'grid' | 'image' | 'blank';
  backgroundImageUrl: string | null;
  backgroundOpacity: number;
  
  // Historique (Undo/Redo)
  history: HistoryEntry[];
  historyIndex: number;
  
  // Actions
  addElement: (element: PlanElement) => void;
  updateElement: (id: string, updates: Partial<PlanElement>) => void;
  removeElement: (id: string) => void;
  addRoute: (route: Route) => void;
  updateRoute: (id: string, updates: Partial<Route>) => void;
  undo: () => void;
  redo: () => void;
  autoNumberStations: () => void;
}
```

### 6.3 Composant Canvas Principal

```typescript
// components/editor/Canvas.tsx — Structure conceptuelle
import { Stage, Layer, Image, Group } from 'react-konva';

export function Canvas() {
  return (
    <Stage
      width={canvasWidth}
      height={canvasHeight}
      draggable={activeTool === 'select'}
      onWheel={handleZoom}
    >
      {/* Layer 1: Background */}
      <Layer>
        <BackgroundGrid /> {/* ou Image de fond */}
      </Layer>
      
      {/* Layer 2: Routes / Parcours */}
      <Layer>
        {routes.map(route => (
          <CanvasRoute key={route.id} route={route} />
        ))}
      </Layer>
      
      {/* Layer 3: Éléments */}
      <Layer>
        {elements.map(element => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElementId === element.id}
            onDragEnd={handleElementDrag}
            onSelect={handleElementSelect}
          />
        ))}
      </Layer>
      
      {/* Layer 4: UI Overlay (sélection, guides) */}
      <Layer>
        <SelectionBox />
        <AlignmentGuides />
      </Layer>
    </Stage>
  );
}
```

---

## 7. FONCTIONNALITÉS DÉTAILLÉES

### 7.1 Import de fond

```
FLOW:
1. User clique "Fond du plan"
2. Choix:
   a) Grille (défaut) — Grille grise légère, dimensions configurables
   b) Import image — Upload JPG/PNG (photo satellite, photo terrain)
   c) Fond vide — Blanc pur
3. Si image → upload vers Vercel Blob → URL stockée en DB
4. Slider opacité pour régler la transparence du fond (30-100%)
5. Possibilité de redimensionner/repositionner le fond
```

**Astuce Google Maps :**
- L'utilisateur screenshot sa cour/terrain depuis Google Maps
- Upload dans l'app
- Baisse l'opacité à ~40%
- Place les éléments par-dessus

### 7.2 Système de parcours (Routes)

```
FLOW:
1. User active l'outil "Dessiner parcours"
2. Click-to-add des points sur le canvas
3. Ligne se trace entre les points
4. Flèches de direction apparaissent automatiquement le long de la ligne
5. Double-click pour terminer le tracé
6. Propriétés éditables:
   - Couleur
   - Épaisseur
   - Style (plein, pointillé)
   - Fréquence des flèches
   - Label ("Course 1km", "Transition")
```

**Rendu Konva des flèches :**
```typescript
// On calcule les points de flèche le long de la ligne
// à intervalles réguliers, orientés dans le sens du parcours
function drawRouteArrows(points: Point[], spacing: number) {
  const arrows = [];
  for (let dist = spacing; dist < totalLength; dist += spacing) {
    const { point, angle } = getPointAtDistance(points, dist);
    arrows.push({ x: point.x, y: point.y, rotation: angle });
  }
  return arrows;
}
```

### 7.3 Numérotation automatique des stations

```
LOGIQUE:
1. Toutes les stations (type === 'station') sont collectées
2. Triées par position Y (haut → bas), puis X (gauche → droite)
   OU par ordre de placement (chronologique)
3. Numéros assignés: 1, 2, 3, ...
4. Badge numéroté affiché sur chaque station
5. Re-numérotation auto quand on ajoute/supprime/réordonne

OPTIONS:
- Numérotation auto (par position ou par ordre d'ajout)
- Numérotation manuelle (drag-to-reorder dans le panneau latéral)
- Affichage: numéro seul, numéro + nom, nom seul
```

### 7.4 Export

```
EXPORT PNG:
1. Konva stage.toDataURL({ pixelRatio: 2 }) pour haute résolution
2. Fond blanc ajouté derrière si transparent
3. Optionnel: titre + légende ajoutés en bas
4. Téléchargement direct

EXPORT PDF:
1. Stage → image via toDataURL
2. jsPDF crée un PDF
3. Image insérée pleine page
4. En-tête optionnel: nom event, date, logo
5. Légende des stations en bas de page
6. Téléchargement direct

DIMENSIONS EXPORT:
- A4 paysage (défaut pour plans de parcours)
- A3 pour impression grand format
- Custom (px)
```

### 7.5 Templates pré-faits

```
TEMPLATES INCLUS:
1. HYROX Standard — 8 stations + parcours course type
2. HYROX Doubles — Variante doubles
3. CrossFit WOD — Layout classique box
4. Circuit outdoor — Format cour extérieure
5. Vierge avec grille — Départ from scratch

Chaque template = JSON pré-rempli avec elements[] et routes[]
User peut le charger, modifier, sauvegarder comme nouveau plan
```

---

## 8. UX / INTERFACE

### 8.1 Layout de l'éditeur

```
┌──────────────────────────────────────────────────────────────┐
│  🏠 RoxPlan    [Mes plans]  [Nom du plan ✏️]     [Exporter] │
├────────────┬─────────────────────────────────┬───────────────┤
│            │                                 │               │
│ BIBLIOTHÈQUE│         CANVAS                 │  PROPRIÉTÉS   │
│            │                                 │               │
│ 🔍 Chercher │    ┌─────────────────────┐     │  Élément:     │
│            │    │                     │     │  Station #3   │
│ ▾ Stations │    │   [Plan de          │     │               │
│  SkiErg    │    │    parcours ici]    │     │  Nom: SkiErg  │
│  Sled Push │    │                     │     │  Couleur: 🔴  │
│  Sled Pull │    │                     │     │  Reps: 1000m  │
│  Rowing    │    │                     │     │  Taille: 100  │
│  ...       │    │                     │     │  Rotation: 0° │
│            │    └─────────────────────┘     │  Verrouillé:☐ │
│ ▾ Zones    │                                 │               │
│  Départ    │  ──────────────────────────     │  ─────────    │
│  Arrivée   │  🔧 Select │ ✏️ Route │ T Text │  Légende:     │
│  Spectateurs│  🔍 Zoom: 100%  │ ↩️ Undo    │  1. SkiErg    │
│  ...       │                                 │  2. Sled Push │
│            │                                 │  3. ...       │
│ ▾ Marqueurs │                                │               │
│  Cône      │                                 │               │
│  Barrière  │                                 │               │
│  Texte     │                                 │               │
│            │                                 │               │
└────────────┴─────────────────────────────────┴───────────────┘
```

### 8.2 Interactions clés

| Action | Interaction |
|--------|------------|
| Ajouter élément | Drag from bibliothèque → drop sur canvas |
| Déplacer élément | Drag sur le canvas |
| Redimensionner | Handles aux coins quand sélectionné |
| Rotation | Handle circulaire au-dessus de l'élément |
| Supprimer | Sélection + Delete/Backspace |
| Dessiner parcours | Click outil route → click points → double-click fin |
| Zoom | Scroll molette ou pinch mobile |
| Pan | Click-drag sur fond (outil select) ou middle-click |
| Undo/Redo | Ctrl+Z / Ctrl+Shift+Z |
| Dupliquer | Ctrl+D |
| Multi-sélection | Shift+Click ou rectangle de sélection |
| Aligner | Guides magnétiques (snap to grid, snap to element) |

### 8.3 Mobile / Tablette

- Canvas responsive avec touch events
- Bibliothèque en bottom sheet (swipe up)
- Propriétés en bottom sheet aussi
- Pinch-to-zoom natif Konva
- Toolbar simplifiée en bas

---

## 9. API ROUTES

### 9.1 Plans CRUD

```typescript
// app/api/plans/route.ts

// GET /api/plans — Liste des plans de l'utilisateur
// Query params: ?page=1&limit=20&sort=updatedAt
// Response: { plans: Plan[], total: number }

// POST /api/plans — Créer un nouveau plan
// Body: { name, eventType, canvasWidth, canvasHeight, backgroundType, elements?, routes? }
// Response: { plan: Plan }

// app/api/plans/[id]/route.ts

// GET /api/plans/:id — Récupérer un plan
// Response: { plan: Plan }

// PUT /api/plans/:id — Mettre à jour un plan
// Body: Partial<Plan> (typiquement { elements, routes } pour l'auto-save)
// Response: { plan: Plan }

// DELETE /api/plans/:id — Supprimer un plan
// Response: { success: true }
```

### 9.2 Upload

```typescript
// app/api/upload/route.ts

// POST /api/upload — Upload image de fond
// Body: FormData avec fichier image
// Stockage: Vercel Blob
// Response: { url: string, width: number, height: number }
// Limite: 10MB max, JPG/PNG/WebP uniquement
```

### 9.3 Auto-save

```
STRATÉGIE AUTO-SAVE:
1. Debounce de 2 secondes après chaque modification
2. PUT /api/plans/:id avec le state complet (elements + routes)
3. Indicateur visuel: "Sauvegardé ✓" / "Sauvegarde en cours..."
4. Fallback: localStorage en cas d'erreur réseau
5. Sync au retour de connexion
```

---

## 10. AUTH (MVP simple)

### Option A : Sans auth (MVP ultra rapide)
- Plans stockés en localStorage
- Pas de compte, pas de DB users
- Export uniquement
- **⏱️ Gain : 1-2 jours de dev**

### Option B : Auth légère (recommandé)
- NextAuth.js avec Google OAuth uniquement
- 1 click pour se connecter
- Plans sauvegardés en DB liés au user
- Partage par lien public

### Option C : Auth complète (post-MVP)
- Email + password
- Magic link
- Multi-providers

**Reco MVP : Option A pour le proto, Option B dès que ça marche.**

---

## 11. PERFORMANCE

| Aspect | Stratégie |
|--------|-----------|
| Canvas FPS | Konva gère le requestAnimationFrame. Limiter à 200 éléments max par plan. |
| Auto-save | Debounce 2s + diff pour n'envoyer que les changements |
| Images de fond | Compression côté client avant upload (max 2000px de large) |
| Export | Côté client (pas de charge serveur) |
| DB queries | Index sur `user_id` + `updated_at` pour le listing |
| Bundle size | Dynamic import de Konva (pas dans le SSR) |

### Konva SSR Fix (Next.js)

```typescript
// Konva ne supporte pas le SSR — import dynamique obligatoire
import dynamic from 'next/dynamic';

const EditorCanvas = dynamic(
  () => import('@/components/editor/Canvas'),
  { ssr: false, loading: () => <CanvasSkeleton /> }
);
```

---

## 12. PLAN DE DÉVELOPPEMENT

### Phase 1 : Skeleton (Jour 1)
- [ ] Init Next.js 14 + TypeScript + Tailwind
- [ ] Setup Neon + Drizzle + schema
- [ ] Layout éditeur (3 colonnes)
- [ ] Canvas Konva basique avec grille de fond
- [ ] Drag-and-drop d'un rectangle test

### Phase 2 : Core Editor (Jours 2-3)
- [ ] Bibliothèque d'éléments avec icônes SVG
- [ ] Drag from bibliothèque → canvas
- [ ] Sélection, déplacement, redimensionnement, rotation
- [ ] Panneau propriétés (couleur, label, taille)
- [ ] Numérotation auto des stations
- [ ] Undo/Redo (historique)

### Phase 3 : Routes & Parcours (Jour 4)
- [ ] Outil dessin de route (click-to-add points)
- [ ] Rendu flèches directionnelles
- [ ] Labels sur les routes
- [ ] Édition des routes (move points, delete)

### Phase 4 : Background & Export (Jour 5)
- [ ] Import image de fond + opacité
- [ ] Grille configurable
- [ ] Export PNG haute résolution
- [ ] Export PDF avec légende
- [ ] Auto-save localStorage

### Phase 5 : Persistence & Polish (Jours 6-7)
- [ ] API CRUD plans
- [ ] Sauvegarde DB (Neon)
- [ ] Liste des plans + dashboard
- [ ] Templates pré-faits (HYROX standard)
- [ ] Dupliquer un plan
- [ ] Responsive / mobile basique

### Phase 6 : Post-MVP (optionnel)
- [ ] Auth Google (NextAuth)
- [ ] Partage par lien public
- [ ] Éléments custom (créer ses propres stations)
- [ ] Snap-to-grid intelligent
- [ ] Layers / groupes d'éléments
- [ ] Mode collaboration temps réel
- [ ] Cotations / mesures de distance
- [ ] Vue 3D isométrique (Three.js — futur)

---

## 13. VARIABLES D'ENVIRONNEMENT

```env
# .env.local

# Neon Database
DATABASE_URL=postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/roxplan?sslmode=require

# Vercel Blob (pour upload images)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx

# NextAuth (Phase 5+)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

---

## 14. COMMANDES DE DEV

```bash
# Setup initial
npx create-next-app@latest roxplan --typescript --tailwind --app --src-dir
cd roxplan

# Dépendances core
npm install react-konva konva zustand drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Dépendances export
npm install html-to-image jspdf

# Dépendances UI
npm install lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Dépendances upload (si Vercel Blob)
npm install @vercel/blob

# Dépendances auth (Phase 5+)
npm install next-auth @auth/drizzle-adapter

# DB
npx drizzle-kit generate
npx drizzle-kit push

# Dev
npm run dev
```

---

## 15. RISQUES & MITIGATIONS

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Konva perf sur mobile | Lag avec beaucoup d'éléments | Limiter à 200 éléments, virtualiser si besoin |
| Perte de données (pas d'auto-save) | User perd son travail | localStorage fallback + auto-save agressif |
| Icônes SVG lourdes | Bundle size explose | SVG sprites ou dynamic import |
| Export qualité basse | Plan flou en impression | pixelRatio: 3 sur l'export |
| Scope creep (features infinies) | Jamais terminé | Strict MVP — Phase 1-5 uniquement |

---

## 16. MÉTRIQUES DE SUCCÈS MVP

| Métrique | Objectif |
|----------|----------|
| Temps création plan | < 10 minutes pour un parcours HYROX complet |
| Export utilisable | PNG lisible sur WhatsApp + imprimable A4 |
| Feedback Olivier | "Ça remplace ce que je faisais à la main" |
| Stabilité | Pas de crash, auto-save fiable |

---

## 17. ÉVOLUTIONS POST-MVP (SI PRODUIT)

Si le MVP est validé et qu'il y a un marché :

| Feature | Valeur | Effort |
|---------|--------|--------|
| Mode SaaS (comptes, plans illimités, collab) | Monétisation | Moyen |
| Marketplace de templates | Communauté | Moyen |
| Intégration HYROX officielle | Crédibilité | Faible (partenariat) |
| Vue 3D isométrique | Wow factor | Élevé |
| Mode présentation (slideshow du parcours) | Events | Moyen |
| API pour intégrer dans d'autres apps | B2B | Moyen |
| White-label pour box affiliées | B2B | Élevé |

---

**FIN DU DOCUMENT — v1.0**
*Stack: Next.js 14 + Neon + Konva.js + Vercel*
*Estimation MVP: 5-7 jours de dev intensif*
