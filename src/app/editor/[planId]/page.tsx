'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import type Konva from 'konva';
import {
  ArrowLeft,
  Download,
  Save,
  Check,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  LayoutGrid,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { ElementLibrary } from '@/components/editor/ElementLibrary';
import { PropertyPanel } from '@/components/editor/PropertyPanel';
import { Toolbar } from '@/components/editor/Toolbar';
import { BackgroundManager } from '@/components/editor/BackgroundManager';
import { StationNumbering } from '@/components/editor/StationNumbering';
import { RouteDrawer } from '@/components/editor/RouteDrawer';
import { ExportDialog } from '@/components/editor/ExportDialog';
import type { Plan } from '@/types';

const Canvas = dynamic(
  () => import('@/components/editor/Canvas').then((mod) => ({ default: mod.Canvas })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement de l&apos;editeur...</p>
        </div>
      </div>
    ),
  }
);

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;
  const stageRef = useRef<Konva.Stage>(null);

  const [showExport, setShowExport] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const planName = useEditorStore((s) => s.planName);
  const setPlanName = useEditorStore((s) => s.setPlanName);
  const loadPlan = useEditorStore((s) => s.loadPlan);
  const isDirty = useEditorStore((s) => s.isDirty);
  const markClean = useEditorStore((s) => s.markClean);
  const isSaving = useEditorStore((s) => s.isSaving);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('roxplan_plans');
      if (stored) {
        const plans: Plan[] = JSON.parse(stored);
        const plan = plans.find((p) => p.id === planId);
        if (plan) {
          loadPlan({
            id: plan.id,
            name: plan.name,
            eventType: plan.eventType,
            canvasWidth: plan.canvasWidth,
            canvasHeight: plan.canvasHeight,
            backgroundType: plan.backgroundType,
            backgroundImageUrl: plan.backgroundImageUrl,
            backgroundOpacity: plan.backgroundOpacity,
            elements: plan.elements,
            routes: plan.routes,
          });
        }
      }
    } catch {
      // Ignore
    }
  }, [planId, loadPlan]);

  useEffect(() => {
    if (!isDirty) return;
    const timeout = setTimeout(() => {
      savePlan();
    }, 2000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  const savePlan = useCallback(() => {
    const state = useEditorStore.getState();
    setSaveStatus(true);
    try {
      const stored = localStorage.getItem('roxplan_plans');
      const plans: Plan[] = stored ? JSON.parse(stored) : [];
      const idx = plans.findIndex((p) => p.id === planId);

      const updatedPlan: Plan = {
        id: planId,
        userId: 'local',
        name: state.planName,
        eventType: state.eventType,
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        backgroundType: state.backgroundType,
        backgroundImageUrl: state.backgroundImageUrl ?? undefined,
        backgroundOpacity: state.backgroundOpacity,
        elements: state.elements,
        routes: state.routes,
        isPublic: false,
        createdAt: idx >= 0 ? plans[idx].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (idx >= 0) {
        plans[idx] = updatedPlan;
      } else {
        plans.unshift(updatedPlan);
      }

      localStorage.setItem('roxplan_plans', JSON.stringify(plans));
      markClean();
    } catch {
      // Ignore
    }
    setSaveStatus(false);
  }, [planId, markClean, setSaveStatus]);

  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setCanvasSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Top bar */}
      <header
        className="h-12 glass-solid flex items-center px-3 gap-3 flex-shrink-0 z-20"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {/* Back */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => router.push('/')}
          className="p-1.5 rounded-lg"
          style={{ color: 'var(--text-muted)' }}
          title="Retour au dashboard"
          aria-label="Retour"
        >
          <ArrowLeft size={18} />
        </motion.button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center btn-gradient">
            <LayoutGrid size={12} className="text-white" />
          </div>
          <span
            className="text-sm font-bold hidden sm:inline"
            style={{
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            RoxPlan
          </span>
        </div>

        {/* Separator */}
        <div className="w-px h-5" style={{ background: 'var(--border-subtle)' }} />

        {/* Plan name */}
        <input
          type="text"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="text-sm font-medium bg-transparent border-none focus:outline-none px-1.5 py-0.5 rounded-lg min-w-[120px] focus-ring"
          style={{ color: 'var(--text-primary)' }}
          placeholder="Nom du plan"
        />

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Save status */}
          {isSaving ? (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Loader2 size={12} className="animate-spin" />
              Sauvegarde...
            </span>
          ) : isDirty ? (
            <span className="text-xs font-medium" style={{ color: 'var(--warning)' }}>Non sauvegarde</span>
          ) : (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--success)' }}>
              <Check size={12} />
              Sauvegarde
            </span>
          )}

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={savePlan}
            className="p-1.5 rounded-lg"
            style={{ color: 'var(--text-muted)' }}
            title="Sauvegarder (Ctrl+S)"
            aria-label="Sauvegarder"
          >
            <Save size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowExport(true)}
            className="btn-gradient flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg"
          >
            <Download size={14} />
            Exporter
          </motion.button>
        </div>
      </header>

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — Element Library */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="glass-solid flex-shrink-0 overflow-hidden flex flex-col z-10"
              style={{ borderRight: '1px solid var(--border-subtle)' }}
            >
              <div className="px-3 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                  Bibliotheque
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setLeftOpen(false)}
                  className="p-1 rounded-md"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Fermer le panneau"
                >
                  <PanelLeftClose size={14} />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <ElementLibrary />
              </div>
              <div className="p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <BackgroundManager />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Left toggle (when collapsed) */}
        {!leftOpen && (
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLeftOpen(true)}
            className="absolute left-2 top-16 z-20 glass-solid p-2 rounded-xl"
            style={{ boxShadow: 'var(--shadow-md)', color: 'var(--text-muted)' }}
            aria-label="Ouvrir la bibliotheque"
          >
            <PanelLeftOpen size={16} />
          </motion.button>
        )}

        {/* Center — Canvas */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Toolbar — floating bottom center */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <Toolbar />
          </div>

          {/* Canvas */}
          <div id="canvas-container" className="flex-1">
            <Canvas
              width={canvasSize.width}
              height={canvasSize.height}
              stageRef={stageRef}
            />
          </div>

          {/* Route drawer hint */}
          <RouteDrawer />
        </main>

        {/* Right sidebar — Property Panel */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="glass-solid flex-shrink-0 overflow-hidden flex flex-col z-10"
              style={{ borderLeft: '1px solid var(--border-subtle)' }}
            >
              <div className="px-3 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                  Proprietes
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRightOpen(false)}
                  className="p-1 rounded-md"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Fermer le panneau"
                >
                  <PanelRightClose size={14} />
                </motion.button>
              </div>
              <PropertyPanel />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Right toggle (when collapsed) */}
        {!rightOpen && (
          <motion.button
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRightOpen(true)}
            className="absolute right-2 top-16 z-20 glass-solid p-2 rounded-xl"
            style={{ boxShadow: 'var(--shadow-md)', color: 'var(--text-muted)' }}
            aria-label="Ouvrir les proprietes"
          >
            <PanelRightOpen size={16} />
          </motion.button>
        )}
      </div>

      {/* Export Dialog */}
      <ExportDialog
        stageRef={stageRef}
        isOpen={showExport}
        onClose={() => setShowExport(false)}
      />
    </div>
  );
}
