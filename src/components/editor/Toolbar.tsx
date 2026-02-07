'use client';

import {
  MousePointer2,
  Pencil,
  Type,
  Eraser,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import type { ActiveTool } from '@/types';
import { cn } from '@/lib/utils';

const tools: { id: ActiveTool; icon: typeof MousePointer2; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Selectionner (V)' },
  { id: 'draw_route', icon: Pencil, label: 'Dessiner parcours (P)' },
  { id: 'text', icon: Type, label: 'Texte (T)' },
  { id: 'eraser', icon: Eraser, label: 'Effacer (E)' },
];

export function Toolbar() {
  const { activeTool, setActiveTool, zoom, setZoom, setPan, undo, redo, historyIndex, history } =
    useEditorStore();

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-sm">
      {/* Outils */}
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
            className={cn(
              'p-2 rounded-md transition-colors',
              activeTool === tool.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Icon size={18} />
          </button>
        );
      })}

      {/* Separateur */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Undo / Redo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Annuler (Ctrl+Z)"
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Undo2 size={18} />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Retablir (Ctrl+Shift+Z)"
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Redo2 size={18} />
      </button>

      {/* Separateur */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Zoom */}
      <button
        onClick={() => setZoom(zoom / 1.2)}
        title="Dezoomer"
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
      >
        <ZoomOut size={18} />
      </button>
      <span className="text-xs font-medium text-gray-600 w-12 text-center select-none">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={() => setZoom(zoom * 1.2)}
        title="Zoomer"
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
      >
        <ZoomIn size={18} />
      </button>
      <button
        onClick={() => {
          setZoom(1);
          setPan(0, 0);
        }}
        title="Recentrer"
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
      >
        <Maximize2 size={18} />
      </button>
    </div>
  );
}
