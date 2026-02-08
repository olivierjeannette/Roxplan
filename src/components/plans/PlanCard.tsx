'use client';

import { MoreHorizontal, Copy, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Plan } from '@/types';

interface PlanCardProps {
  plan: Plan;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

const eventColors: Record<string, string> = {
  hyrox: '#EF4444',
  crossfit: '#8B5CF6',
  custom: '#6366F1',
};

export function PlanCard({ plan, onOpen, onDuplicate, onDelete }: PlanCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formattedDate = new Date(plan.updatedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const stationCount = plan.elements.filter((el) => el.type === 'station').length;
  const color = eventColors[plan.eventType] || eventColors.custom;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group glass rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Thumbnail */}
      <div
        className="aspect-video relative"
        onClick={() => onOpen(plan.id)}
        style={{ background: `linear-gradient(135deg, ${color}08, ${color}15)` }}
      >
        {plan.thumbnail ? (
          <img src={plan.thumbnail} alt={plan.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div
                className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center"
                style={{ background: `${color}15` }}
              >
                <ExternalLink size={20} style={{ color }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucun apercu</p>
            </div>
          </div>
        )}

        <span
          className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-semibold uppercase rounded-full glass"
          style={{ color }}
        >
          {plan.eventType}
        </span>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => onOpen(plan.id)}
            >
              {plan.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {stationCount} stations &middot; {formattedDate}
            </p>
          </div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              <MoreHorizontal size={16} />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-8 z-20 glass-solid rounded-xl py-1.5 w-40"
                    style={{ boxShadow: 'var(--shadow-lg)' }}
                  >
                    <button
                      onClick={() => { onDuplicate(plan.id); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-black/[0.03] transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Copy size={14} />
                      Dupliquer
                    </button>
                    <button
                      onClick={() => { onDelete(plan.id); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-red-50 transition-colors"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
