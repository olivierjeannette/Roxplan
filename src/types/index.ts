// ==================== PLAN ELEMENT TYPES ====================

export type ElementType = 'station' | 'zone' | 'marker' | 'text' | 'arrow' | 'barrier' | 'shape';

export type ExerciseType =
  | 'skierg'
  | 'sled_push'
  | 'sled_pull'
  | 'burpee_broad_jump'
  | 'rowing'
  | 'farmers_carry'
  | 'lunges'
  | 'wall_balls'
  | 'custom';

export type ElementCategory = 'station' | 'zone' | 'equipment' | 'marker' | 'structure';
export type FillStyle = 'solid' | 'transparent' | 'none';
export type ShapeForm = 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'triangle' | 'custom';

export interface PlanElement {
  id: string;
  type: ElementType;

  // Position & dimensions
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;

  // Apparence
  label: string;
  stationNumber?: number;
  icon: string;
  color: string;
  opacity: number;
  fontSize?: number;
  fillStyle?: FillStyle;       // solid = fond plein, transparent = semi-transparent, none = pas de fond
  fillOpacity?: number;        // opacite du fond (0-1)
  strokeWidth?: number;        // epaisseur du contour / de la ligne (barriers)
  dashPattern?: number[];      // pattern pointille [trait, espace] (barriers)
  showIcon?: boolean;          // afficher ou cacher l'icone
  shapeForm?: ShapeForm;       // forme visuelle: rectangle, circle, diamond, hexagon, triangle, custom
  customPoints?: RoutePoint[]; // points du polygone libre (relatifs a x,y)

  // Métadonnées station
  exerciseType?: ExerciseType;
  reps?: string;
  equipment?: string[];

  // État
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

// ==================== ROUTE TYPES ====================

export interface RoutePoint {
  x: number;
  y: number;
}

export interface Route {
  id: string;
  points: RoutePoint[];
  color: string;
  strokeWidth: number;
  dashPattern?: number[];
  showArrows: boolean;
  arrowSpacing: number;
  label?: string;
}

// ==================== EDITOR TYPES ====================

export type ActiveTool = 'select' | 'draw_route' | 'draw_shape' | 'add_element' | 'text' | 'eraser';
export type BackgroundType = 'grid' | 'image' | 'blank';
export type EventType = 'hyrox' | 'crossfit' | 'custom';

export interface HistoryEntry {
  elements: PlanElement[];
  routes: Route[];
  timestamp: number;
}

// ==================== PLAN TYPES ====================

export interface Plan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  eventType: EventType;
  canvasWidth: number;
  canvasHeight: number;
  backgroundType: BackgroundType;
  backgroundImageUrl?: string;
  backgroundOpacity: number;
  elements: PlanElement[];
  routes: Route[];
  isPublic: boolean;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== ELEMENT LIBRARY TYPES ====================

export interface ElementDefinition {
  id: string;
  name: string;
  type: ElementType;
  category: ElementCategory;
  icon: string;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
  exerciseType?: ExerciseType;
  fillStyle?: FillStyle;
  fillOpacity?: number;
  strokeWidth?: number;
  dashPattern?: number[];
  showIcon?: boolean;
  shapeForm?: ShapeForm;
}

export interface ElementGroup {
  name: string;
  category: ElementCategory;
  elements: ElementDefinition[];
}
