'use client';

import { Pencil, Pentagon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/stores/editorStore';

export function RouteDrawer() {
  const { activeTool, setActiveTool } = useEditorStore();
  const isDrawingRoute = activeTool === 'draw_route';
  const isDrawingShape = activeTool === 'draw_shape';
  const isActive = isDrawingRoute || isDrawingShape;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 glass-solid rounded-xl px-4 py-2.5 flex items-center gap-3 z-10"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-light)' }}
          >
            {isDrawingRoute ? (
              <Pencil size={14} style={{ color: 'var(--accent)' }} />
            ) : (
              <Pentagon size={14} style={{ color: 'var(--accent)' }} />
            )}
          </div>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isDrawingRoute ? (
              <>
                <strong style={{ color: 'var(--text-primary)' }}>Mode parcours</strong> — Cliquez pour ajouter des points.
                Double-cliquez pour terminer.
              </>
            ) : (
              <>
                <strong style={{ color: 'var(--text-primary)' }}>Forme libre</strong> — Cliquez pour ajouter des sommets.
                Double-cliquez pour fermer.
              </>
            )}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveTool('select')}
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Fermer"
          >
            <X size={16} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
