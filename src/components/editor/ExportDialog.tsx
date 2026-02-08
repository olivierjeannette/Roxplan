'use client';

import { useState } from 'react';
import { Download, FileImage, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/stores/editorStore';
import type Konva from 'konva';

interface ExportDialogProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ stageRef, isOpen, onClose }: ExportDialogProps) {
  const { planName, elements } = useEditorStore();
  const [format, setFormat] = useState<'png' | 'pdf'>('png');
  const [pixelRatio, setPixelRatio] = useState(2);
  const [includeTitle, setIncludeTitle] = useState(true);
  const [includeLegend, setIncludeLegend] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const stage = stageRef.current;
    if (!stage) return;

    setIsExporting(true);

    try {
      if (format === 'png') {
        const { exportCanvasPng } = await import('@/lib/export');
        await exportCanvasPng(stage, {
          format: 'png',
          pixelRatio,
          fileName: planName || 'plan',
          includeTitle,
          title: planName,
          includeLegend,
          elements,
        });
      } else {
        const { exportCanvasPdf } = await import('@/lib/export');
        await exportCanvasPdf(stage, {
          format: 'pdf',
          pixelRatio,
          fileName: planName || 'plan',
          includeTitle,
          title: planName,
          includeLegend,
          elements,
          pageSize: 'a4',
        });
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Erreur lors de l\'export.');
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative glass-solid rounded-2xl w-full max-w-md p-6 mx-4"
            style={{ boxShadow: 'var(--shadow-xl)' }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}
              >
                <Download size={16} style={{ color: 'var(--accent)' }} />
              </div>
              Exporter le plan
            </h2>

            {/* Format */}
            <div className="mb-5">
              <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                Format
              </label>
              <div className="flex gap-2.5">
                {[
                  { id: 'png' as const, icon: FileImage, label: 'PNG', desc: 'Image haute qualite' },
                  { id: 'pdf' as const, icon: FileText, label: 'PDF', desc: 'A4 paysage' },
                ].map((f) => {
                  const Icon = f.icon;
                  const isActive = format === f.id;
                  return (
                    <motion.button
                      key={f.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormat(f.id)}
                      className="flex-1 flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-colors"
                      style={{
                        borderColor: isActive ? 'var(--accent)' : 'var(--border-subtle)',
                        background: isActive ? 'var(--accent-light)' : 'transparent',
                        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                    >
                      <Icon size={20} />
                      <div className="text-left">
                        <div className="font-semibold text-sm">{f.label}</div>
                        <div className="text-[11px] opacity-70">{f.desc}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Qualite */}
            <div className="mb-5">
              <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                Qualite: {pixelRatio}x
              </label>
              <input
                type="range"
                min={1}
                max={4}
                step={1}
                value={pixelRatio}
                onChange={(e) => setPixelRatio(Number(e.target.value))}
              />
              <div className="flex justify-between text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                <span>Rapide</span>
                <span>Haute qualite</span>
              </div>
            </div>

            {/* Options — Toggle switches */}
            <div className="mb-6 space-y-3">
              {[
                { label: 'Inclure le titre', checked: includeTitle, onChange: setIncludeTitle },
                { label: 'Inclure la legende', checked: includeLegend, onChange: setIncludeLegend },
              ].map((opt) => (
                <label key={opt.label} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{opt.label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={opt.checked}
                    onClick={() => opt.onChange(!opt.checked)}
                    className="relative w-10 h-[22px] rounded-full transition-colors"
                    style={{ background: opt.checked ? 'var(--accent)' : '#CBD5E1' }}
                  >
                    <motion.div
                      animate={{ x: opt.checked ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white"
                      style={{ boxShadow: 'var(--shadow-xs)' }}
                    />
                  </button>
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 btn-gradient px-4 py-2.5 text-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Export...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Exporter
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
