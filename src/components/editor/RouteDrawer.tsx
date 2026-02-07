'use client';

import { Pencil, X } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

export function RouteDrawer() {
  const { activeTool, setActiveTool } = useEditorStore();
  const isDrawing = activeTool === 'draw_route';

  if (!isDrawing) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white border border-blue-200 rounded-lg shadow-lg px-4 py-2.5 flex items-center gap-3 z-10">
      <Pencil size={16} className="text-blue-600" />
      <span className="text-sm text-gray-700">
        <strong>Mode parcours</strong> — Cliquez pour ajouter des points.
        Double-cliquez pour terminer.
      </span>
      <button
        onClick={() => setActiveTool('select')}
        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}
