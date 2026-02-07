import { create } from 'zustand';
import type { PlanElement, Route, ActiveTool, BackgroundType, HistoryEntry } from '@/types';
import { generateId } from '@/lib/utils';

const MAX_HISTORY = 50;
const HISTORY_DEBOUNCE_MS = 300;

// Debounce timer for history snapshots
let historyTimer: ReturnType<typeof setTimeout> | null = null;

interface EditorState {
  // Plan metadata
  planId: string | null;
  planName: string;
  eventType: 'hyrox' | 'crossfit' | 'custom';

  // Canvas
  zoom: number;
  panX: number;
  panY: number;
  canvasWidth: number;
  canvasHeight: number;

  // Tools
  activeTool: ActiveTool;

  // Selection
  selectedElementId: string | null;
  selectedRouteId: string | null;

  // Elements & Routes
  elements: PlanElement[];
  routes: Route[];

  // Background
  backgroundType: BackgroundType;
  backgroundImageUrl: string | null;
  backgroundOpacity: number;

  // History (Undo/Redo)
  history: HistoryEntry[];
  historyIndex: number;

  // Save status
  isSaving: boolean;
  lastSavedAt: number | null;
  isDirty: boolean;

  // Actions — Canvas
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setCanvasSize: (width: number, height: number) => void;

  // Actions — Selection
  selectElement: (id: string | null) => void;
  selectRoute: (id: string | null) => void;

  // Actions — Elements
  addElement: (element: Omit<PlanElement, 'id' | 'zIndex'>) => void;
  updateElement: (id: string, updates: Partial<PlanElement>) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;

  // Actions — Routes
  addRoute: (route: Omit<Route, 'id'>) => void;
  updateRoute: (id: string, updates: Partial<Route>) => void;
  removeRoute: (id: string) => void;

  // Actions — Background
  setBackgroundType: (type: BackgroundType) => void;
  setBackgroundImage: (url: string | null) => void;
  setBackgroundOpacity: (opacity: number) => void;

  // Actions — History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Actions — Auto numbering
  autoNumberStations: () => void;

  // Actions — Plan
  setPlanId: (id: string | null) => void;
  setPlanName: (name: string) => void;
  setEventType: (type: 'hyrox' | 'crossfit' | 'custom') => void;
  setSaveStatus: (saving: boolean) => void;
  markDirty: () => void;
  markClean: () => void;

  // Actions — Load
  loadPlan: (data: {
    id: string;
    name: string;
    eventType: string;
    canvasWidth: number;
    canvasHeight: number;
    backgroundType: string;
    backgroundImageUrl?: string;
    backgroundOpacity: number;
    elements: PlanElement[];
    routes: Route[];
  }) => void;

  // Actions — Reset
  resetEditor: () => void;
}

const initialState = {
  planId: null,
  planName: 'Sans titre',
  eventType: 'hyrox' as const,
  zoom: 1,
  panX: 0,
  panY: 0,
  canvasWidth: 1200,
  canvasHeight: 800,
  activeTool: 'select' as ActiveTool,
  selectedElementId: null,
  selectedRouteId: null,
  elements: [] as PlanElement[],
  routes: [] as Route[],
  backgroundType: 'grid' as BackgroundType,
  backgroundImageUrl: null,
  backgroundOpacity: 100,
  history: [] as HistoryEntry[],
  historyIndex: -1,
  isSaving: false,
  lastSavedAt: null,
  isDirty: false,
};

/**
 * Debounced history snapshot: captures state BEFORE a series of rapid changes.
 * Only saves a snapshot if no other snapshot was saved in the last HISTORY_DEBOUNCE_MS.
 */
function snapshotHistoryImmediate(get: () => EditorState, set: (partial: Partial<EditorState>) => void) {
  const state = get();
  const entry: HistoryEntry = {
    elements: JSON.parse(JSON.stringify(state.elements)),
    routes: JSON.parse(JSON.stringify(state.routes)),
    timestamp: Date.now(),
  };
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(entry);
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  set({ history: newHistory, historyIndex: newHistory.length - 1 });
}

function debouncedSnapshot(get: () => EditorState, set: (partial: Partial<EditorState>) => void) {
  if (historyTimer) return; // Already scheduled — a snapshot was recently taken
  // Take snapshot of current state BEFORE the change
  snapshotHistoryImmediate(get, set);
  // Block further snapshots for HISTORY_DEBOUNCE_MS
  historyTimer = setTimeout(() => {
    historyTimer = null;
  }, HISTORY_DEBOUNCE_MS);
}

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  // Canvas
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setPan: (panX, panY) => set({ panX, panY }),
  setActiveTool: (activeTool) => set({ activeTool, selectedElementId: null, selectedRouteId: null }),
  setCanvasSize: (canvasWidth, canvasHeight) => set({ canvasWidth, canvasHeight }),

  // Selection
  selectElement: (id) => set({ selectedElementId: id, selectedRouteId: null }),
  selectRoute: (id) => set({ selectedRouteId: id, selectedElementId: null }),

  // Elements
  addElement: (element) => {
    snapshotHistoryImmediate(get, set);
    const state = get();
    const maxZ = state.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
    const newElement: PlanElement = {
      ...element,
      id: generateId(),
      zIndex: maxZ + 1,
    };
    set({
      elements: [...state.elements, newElement],
      selectedElementId: newElement.id,
      isDirty: true,
    });
  },

  updateElement: (id, updates) => {
    debouncedSnapshot(get, set);
    set({
      elements: get().elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
      isDirty: true,
    });
  },

  removeElement: (id) => {
    snapshotHistoryImmediate(get, set);
    const state = get();
    set({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      isDirty: true,
    });
  },

  duplicateElement: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    if (!element) return;
    snapshotHistoryImmediate(get, set);
    const maxZ = state.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
    const newElement: PlanElement = {
      ...element,
      id: generateId(),
      x: element.x + 20,
      y: element.y + 20,
      zIndex: maxZ + 1,
    };
    set({
      elements: [...get().elements, newElement],
      selectedElementId: newElement.id,
      isDirty: true,
    });
  },

  // Routes
  addRoute: (route) => {
    snapshotHistoryImmediate(get, set);
    const newRoute: Route = { ...route, id: generateId() };
    set({
      routes: [...get().routes, newRoute],
      selectedRouteId: newRoute.id,
      isDirty: true,
    });
  },

  updateRoute: (id, updates) => {
    debouncedSnapshot(get, set);
    set({
      routes: get().routes.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
      isDirty: true,
    });
  },

  removeRoute: (id) => {
    snapshotHistoryImmediate(get, set);
    const state = get();
    set({
      routes: state.routes.filter((r) => r.id !== id),
      selectedRouteId: state.selectedRouteId === id ? null : state.selectedRouteId,
      isDirty: true,
    });
  },

  // Background
  setBackgroundType: (backgroundType) => set({ backgroundType, isDirty: true }),
  setBackgroundImage: (backgroundImageUrl) => set({ backgroundImageUrl, isDirty: true }),
  setBackgroundOpacity: (backgroundOpacity) => set({ backgroundOpacity, isDirty: true }),

  // History
  pushHistory: () => snapshotHistoryImmediate(get, set),

  undo: () => {
    const state = get();
    if (state.historyIndex < 0) return;
    const entry = state.history[state.historyIndex];
    set({
      elements: entry.elements,
      routes: entry.routes,
      historyIndex: state.historyIndex - 1,
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const entry = state.history[state.historyIndex + 1];
    set({
      elements: entry.elements,
      routes: entry.routes,
      historyIndex: state.historyIndex + 1,
      isDirty: true,
    });
  },

  // Auto numbering
  autoNumberStations: () => {
    snapshotHistoryImmediate(get, set);
    const state = get();
    const stations = state.elements
      .filter((el) => el.type === 'station')
      .sort((a, b) => a.y - b.y || a.x - b.x);

    const stationIds = new Set(stations.map((s) => s.id));
    let num = 1;
    const updatedElements = state.elements.map((el) => {
      if (stationIds.has(el.id)) {
        return { ...el, stationNumber: num++ };
      }
      return el;
    });
    set({ elements: updatedElements, isDirty: true });
  },

  // Plan
  setPlanId: (planId) => set({ planId }),
  setPlanName: (planName) => set({ planName, isDirty: true }),
  setEventType: (eventType) => set({ eventType, isDirty: true }),
  setSaveStatus: (isSaving) =>
    set({ isSaving, lastSavedAt: isSaving ? get().lastSavedAt : Date.now() }),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),

  // Load
  loadPlan: (data) =>
    set({
      planId: data.id,
      planName: data.name,
      eventType: (data.eventType as 'hyrox' | 'crossfit' | 'custom') || 'hyrox',
      canvasWidth: data.canvasWidth,
      canvasHeight: data.canvasHeight,
      backgroundType: (data.backgroundType as BackgroundType) || 'grid',
      backgroundImageUrl: data.backgroundImageUrl || null,
      backgroundOpacity: data.backgroundOpacity,
      elements: data.elements,
      routes: data.routes,
      history: [],
      historyIndex: -1,
      isDirty: false,
      selectedElementId: null,
      selectedRouteId: null,
    }),

  // Reset
  resetEditor: () => set(initialState),
}));
