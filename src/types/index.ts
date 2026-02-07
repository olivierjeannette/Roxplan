// ==================== PLAN ELEMENT TYPES ====================

export type ElementType = 'station' | 'zone' | 'marker' | 'text' | 'arrow';

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

export type ElementCategory = 'station' | 'zone' | 'equipment' | 'marker';

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

export type ActiveTool = 'select' | 'draw_route' | 'add_element' | 'text' | 'eraser';
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
}

export interface ElementGroup {
  name: string;
  category: ElementCategory;
  elements: ElementDefinition[];
}
