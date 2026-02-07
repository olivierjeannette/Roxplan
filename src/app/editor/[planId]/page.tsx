'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type Konva from 'konva';
import { ArrowLeft, Download, Save, Check, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { ElementLibrary } from '@/components/editor/ElementLibrary';
import { PropertyPanel } from '@/components/editor/PropertyPanel';
import { Toolbar } from '@/components/editor/Toolbar';
import { BackgroundManager } from '@/components/editor/BackgroundManager';
import { StationNumbering } from '@/components/editor/StationNumbering';
import { RouteDrawer } from '@/components/editor/RouteDrawer';
import { ExportDialog } from '@/components/editor/ExportDialog';
import type { Plan } from '@/types';

// Konva ne supporte pas le SSR — import dynamique obligatoire
const Canvas = dynamic(
  () => import('@/components/editor/Canvas').then((mod) => ({ default: mod.Canvas })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Chargement de l&apos;editeur...</p>
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

  // Subscribe to individual store slices to avoid full re-renders
  const planName = useEditorStore((s) => s.planName);
  const setPlanName = useEditorStore((s) => s.setPlanName);
  const loadPlan = useEditorStore((s) => s.loadPlan);
  const isDirty = useEditorStore((s) => s.isDirty);
  const markClean = useEditorStore((s) => s.markClean);
  const isSaving = useEditorStore((s) => s.isSaving);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);

  // Charger le plan depuis localStorage
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

  // Auto-save with debounce — only depends on isDirty flag, reads state at save time
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

  // Resize canvas
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
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top bar */}
      <header className="h-12 bg-white border-b border-gray-200 flex items-center px-3 gap-3 flex-shrink-0">
        {/* Back */}
        <button
          onClick={() => router.push('/')}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Retour au dashboard"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Logo */}
        <span className="text-sm font-bold text-blue-600">RoxPlan</span>

        {/* Separator */}
        <div className="w-px h-5 bg-gray-200" />

        {/* Plan name */}
        <input
          type="text"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 px-1 py-0.5 hover:bg-gray-50 rounded min-w-[120px]"
          placeholder="Nom du plan"
        />

        {/* Save status */}
        <div className="ml-auto flex items-center gap-2">
          {isSaving ? (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" />
              Sauvegarde...
            </span>
          ) : isDirty ? (
            <span className="text-xs text-amber-500">Non sauvegarde</span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Check size={12} />
              Sauvegarde
            </span>
          )}

          <button
            onClick={savePlan}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            title="Sauvegarder (Ctrl+S)"
          >
            <Save size={16} />
          </button>

          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download size={14} />
            Exporter
          </button>
        </div>
      </header>

      {/* Main editor area — 3 columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — Element Library */}
        <aside className="w-56 bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-gray-200">
            <h2 className="text-xs font-semibold text-gray-500 uppercase">Bibliotheque</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ElementLibrary />
          </div>
          <div className="border-t border-gray-200 p-3">
            <BackgroundManager />
          </div>
        </aside>

        {/* Center — Canvas */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Toolbar */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
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
        <aside className="w-64 bg-white border-l border-gray-200 flex-shrink-0 overflow-hidden flex flex-col">
          <PropertyPanel />
        </aside>
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
