'use client';

import { useState } from 'react';
import { Download, FileImage, FileText } from 'lucide-react';
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Download size={20} />
          Exporter le plan
        </h2>

        {/* Format */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">Format</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFormat('png')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                format === 'png'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileImage size={20} />
              <div className="text-left">
                <div className="font-medium text-sm">PNG</div>
                <div className="text-xs opacity-70">Image haute qualite</div>
              </div>
            </button>
            <button
              onClick={() => setFormat('pdf')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                format === 'pdf'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText size={20} />
              <div className="text-left">
                <div className="font-medium text-sm">PDF</div>
                <div className="text-xs opacity-70">A4 paysage</div>
              </div>
            </button>
          </div>
        </div>

        {/* Qualite */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Qualite: {pixelRatio}x
          </label>
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={pixelRatio}
            onChange={(e) => setPixelRatio(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Rapide</span>
            <span>Haute qualite</span>
          </div>
        </div>

        {/* Options */}
        <div className="mb-6 space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={includeTitle}
              onChange={(e) => setIncludeTitle(e.target.checked)}
              className="rounded"
            />
            Inclure le titre
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={includeLegend}
              onChange={(e) => setIncludeLegend(e.target.checked)}
              className="rounded"
            />
            Inclure la legende des stations
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          </button>
        </div>
      </div>
    </div>
  );
}
