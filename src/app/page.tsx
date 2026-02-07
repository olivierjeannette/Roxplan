'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    // MVP: chargement depuis localStorage
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutGrid size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">RoxPlan</h1>
          </div>
          <button
            onClick={handleNewPlan}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Nouveau plan
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Mes plans</h2>
          <p className="text-sm text-gray-500 mt-1">
            Creez et gerez vos plans de parcours fitness.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
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
