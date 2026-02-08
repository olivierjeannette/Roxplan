'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, LayoutGrid } from 'lucide-react';
import { PlanList } from '@/components/plans/PlanList';
import type { Plan } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    try {
      const stored = localStorage.getItem('roxplan_plans');
      if (stored) {
        setPlans(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
    setIsLoading(false);
  };

  const handleNewPlan = () => {
    const id = crypto.randomUUID();
    const newPlan: Plan = {
      id,
      userId: 'local',
      name: 'Sans titre',
      eventType: 'hyrox',
      canvasWidth: 1200,
      canvasHeight: 800,
      backgroundType: 'grid',
      backgroundOpacity: 100,
      elements: [],
      routes: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPlans = [newPlan, ...plans];
    localStorage.setItem('roxplan_plans', JSON.stringify(updatedPlans));
    router.push(`/editor/${id}`);
  };

  const handleOpenPlan = (id: string) => {
    router.push(`/editor/${id}`);
  };

  const handleDuplicate = (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    const newPlan: Plan = {
      ...plan,
      id: crypto.randomUUID(),
      name: `${plan.name} (copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedPlans = [newPlan, ...plans];
    setPlans(updatedPlans);
    localStorage.setItem('roxplan_plans', JSON.stringify(updatedPlans));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Supprimer ce plan ?')) return;
    const updatedPlans = plans.filter((p) => p.id !== id);
    setPlans(updatedPlans);
    localStorage.setItem('roxplan_plans', JSON.stringify(updatedPlans));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="glass-solid sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-gradient">
              <LayoutGrid size={18} className="text-white" />
            </div>
            <h1
              className="text-xl font-bold"
              style={{
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              RoxPlan
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNewPlan}
            className="btn-gradient flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl"
          >
            <Plus size={16} />
            Nouveau plan
          </motion.button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Mes plans
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Creez et gerez vos plans de parcours fitness.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video" style={{ background: 'var(--bg-secondary)' }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded-lg w-3/4" style={{ background: 'var(--bg-secondary)' }} />
                  <div className="h-3 rounded-lg w-1/2" style={{ background: 'var(--bg-secondary)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <PlanList
            plans={plans}
            onOpen={handleOpenPlan}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
