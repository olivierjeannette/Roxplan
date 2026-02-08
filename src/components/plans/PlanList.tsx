'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { PlanCard } from './PlanCard';
import type { Plan } from '@/types';

interface PlanListProps {
  plans: Plan[];
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PlanList({ plans, onOpen, onDuplicate, onDelete }: PlanListProps) {
  if (plans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center py-20"
      >
        <div
          className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--accent-light)' }}
        >
          <Plus size={32} style={{ color: 'var(--accent)' }} />
        </div>
        <h3 className="text-lg font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Aucun plan
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Creez votre premier plan de parcours pour commencer.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {plans.map((plan, index) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <PlanCard plan={plan} onOpen={onOpen} onDuplicate={onDuplicate} onDelete={onDelete} />
        </motion.div>
      ))}
    </div>
  );
}
