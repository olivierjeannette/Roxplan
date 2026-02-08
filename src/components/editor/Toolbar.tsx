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
import { motion } from 'framer-motion';
import { useEditorStore } from '@/stores/editorStore';
import type { ActiveTool } from '@/types';

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
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="glass-solid flex items-center gap-1 rounded-2xl px-2 py-1.5"
      style={{ boxShadow: 'var(--shadow-lg)' }}
    >
      {/* Outils */}
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <motion.button
            key={tool.id}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
            aria-label={tool.label}
            className="relative p-2.5 rounded-xl transition-colors"
            style={{
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-light)' : 'transparent',
            }}
          >
            <Icon size={18} />
            {isActive && (
              <motion.div
                layoutId="toolbar-indicator"
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                style={{ background: 'var(--accent)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}

      {/* Separateur */}
      <div className="w-px h-6 mx-1" style={{ background: 'var(--border-subtle)' }} />

      {/* Undo / Redo */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={undo}
        disabled={!canUndo}
        title="Annuler (Ctrl+Z)"
        aria-label="Annuler"
        className="p-2.5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Undo2 size={18} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={redo}
        disabled={!canRedo}
        title="Retablir (Ctrl+Shift+Z)"
        aria-label="Retablir"
        className="p-2.5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Redo2 size={18} />
      </motion.button>

      {/* Separateur */}
      <div className="w-px h-6 mx-1" style={{ background: 'var(--border-subtle)' }} />

      {/* Zoom */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setZoom(zoom / 1.2)}
        title="Dezoomer"
        aria-label="Dezoomer"
        className="p-2.5 rounded-xl"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ZoomOut size={18} />
      </motion.button>
      <span
        className="text-xs font-semibold w-12 text-center select-none tabular-nums"
        style={{ color: 'var(--text-secondary)' }}
      >
        {Math.round(zoom * 100)}%
      </span>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setZoom(zoom * 1.2)}
        title="Zoomer"
        aria-label="Zoomer"
        className="p-2.5 rounded-xl"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ZoomIn size={18} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          setZoom(1);
          setPan(0, 0);
        }}
        title="Recentrer"
        aria-label="Recentrer"
        className="p-2.5 rounded-xl"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Maximize2 size={18} />
      </motion.button>
    </motion.div>
  );
}
