'use client';

import { motion } from 'framer-motion';
import { useEditorStore } from '@/stores/editorStore';
import { Trash2, Copy, Lock, Unlock, Eye, EyeOff, MousePointer } from 'lucide-react';
import { StationNumbering } from './StationNumbering';

export function PropertyPanel() {
  const {
    selectedElementId,
    selectedRouteId,
    elements,
    routes,
    updateElement,
    removeElement,
    duplicateElement,
    updateRoute,
    removeRoute,
  } = useEditorStore();

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  // Nothing selected
  if (!selectedElement && !selectedRoute) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <MousePointer size={20} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Selectionnez un element pour voir ses proprietes
          </p>
        </div>

        {/* Station legend */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <StationNumbering />
        </div>
      </div>
    );
  }

  // Element properties
  if (selectedElement) {
    return (
      <div className="flex flex-col h-full">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4"
        >
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedElement.color }}
            />
            <span
              className="text-[11px] font-semibold uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              {selectedElement.type}
            </span>
          </div>

          {/* Label */}
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Nom
            </label>
            <input
              type="text"
              value={selectedElement.label}
              onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm rounded-xl focus-ring"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Couleur
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedElement.color}
                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer"
                style={{ border: '1px solid var(--border-subtle)' }}
              />
              <input
                type="text"
                value={selectedElement.color}
                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                className="flex-1 px-2.5 py-1.5 text-sm font-mono rounded-xl focus-ring"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>X</label>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-sm rounded-xl focus-ring tabular-nums"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Y</label>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-sm rounded-xl focus-ring tabular-nums"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Largeur</label>
              <input
                type="number"
                value={selectedElement.width}
                onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-sm rounded-xl focus-ring tabular-nums"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Hauteur</label>
              <input
                type="number"
                value={selectedElement.height}
                onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-sm rounded-xl focus-ring tabular-nums"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Rotation */}
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Rotation: {selectedElement.rotation}°
            </label>
            <input
              type="range"
              min={0}
              max={360}
              value={selectedElement.rotation}
              onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
            />
          </div>

          {/* Opacity */}
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Opacite: {Math.round(selectedElement.opacity * 100)}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={selectedElement.opacity * 100}
              onChange={(e) =>
                updateElement(selectedElement.id, { opacity: Number(e.target.value) / 100 })
              }
            />
          </div>

          {/* Fill style (zones, shapes, stations) */}
          {selectedElement.type !== 'barrier' && (
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Style de fond
              </label>
              <div className="flex gap-1">
                {[
                  { value: 'solid', label: 'Plein' },
                  { value: 'transparent', label: 'Semi' },
                  { value: 'none', label: 'Contour' },
                ].map((opt) => {
                  const isActive = (selectedElement.fillStyle || 'transparent') === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        updateElement(selectedElement.id, {
                          fillStyle: opt.value as 'solid' | 'transparent' | 'none',
                        })
                      }
                      className="flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-colors"
                      style={{
                        background: isActive ? 'var(--accent-light)' : 'var(--bg-secondary)',
                        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fill opacity */}
          {selectedElement.type !== 'barrier' && selectedElement.fillStyle === 'solid' && (
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Opacite fond: {Math.round((selectedElement.fillOpacity ?? 0.4) * 100)}%
              </label>
              <input
                type="range"
                min={5}
                max={100}
                value={(selectedElement.fillOpacity ?? 0.4) * 100}
                onChange={(e) =>
                  updateElement(selectedElement.id, { fillOpacity: Number(e.target.value) / 100 })
                }
              />
            </div>
          )}

          {/* Stroke width */}
          {(selectedElement.type === 'barrier' || selectedElement.fillStyle === 'none') && (
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Epaisseur: {selectedElement.strokeWidth || (selectedElement.type === 'barrier' ? 6 : 1)}px
              </label>
              <input
                type="range"
                min={1}
                max={selectedElement.type === 'barrier' ? 20 : 10}
                value={selectedElement.strokeWidth || (selectedElement.type === 'barrier' ? 6 : 1)}
                onChange={(e) =>
                  updateElement(selectedElement.id, { strokeWidth: Number(e.target.value) })
                }
              />
            </div>
          )}

          {/* Show/hide icon */}
          {selectedElement.icon && selectedElement.type !== 'barrier' && (
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Afficher icone
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={selectedElement.showIcon !== false}
                onClick={() =>
                  updateElement(selectedElement.id, { showIcon: !(selectedElement.showIcon !== false) })
                }
                className="relative w-9 h-5 rounded-full transition-colors"
                style={{ background: selectedElement.showIcon !== false ? 'var(--accent)' : '#CBD5E1' }}
              >
                <motion.div
                  animate={{ x: selectedElement.showIcon !== false ? 18 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-[2px] w-4 h-4 rounded-full bg-white"
                  style={{ boxShadow: 'var(--shadow-xs)' }}
                />
              </button>
            </div>
          )}

          {/* Font size */}
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Taille texte: {selectedElement.fontSize || 11}px
            </label>
            <input
              type="range"
              min={8}
              max={32}
              value={selectedElement.fontSize || 11}
              onChange={(e) =>
                updateElement(selectedElement.id, { fontSize: Number(e.target.value) })
              }
            />
          </div>

          {/* Reps (stations) */}
          {selectedElement.type === 'station' && (
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Reps / Distance
              </label>
              <input
                type="text"
                value={selectedElement.reps || ''}
                placeholder="Ex: 1000m, 50m, 100 reps"
                onChange={(e) => updateElement(selectedElement.id, { reps: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm rounded-xl focus-ring"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          )}

          {/* Station number */}
          {selectedElement.type === 'station' && (
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Numero de station
              </label>
              <input
                type="number"
                value={selectedElement.stationNumber ?? ''}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    stationNumber: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-2.5 py-1.5 text-sm rounded-xl focus-ring tabular-nums"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <div className="p-3 flex gap-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => duplicateElement(selectedElement.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
            }}
          >
            <Copy size={13} />
            Dupliquer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() =>
              updateElement(selectedElement.id, { locked: !selectedElement.locked })
            }
            className="p-2 rounded-xl transition-colors"
            style={{
              background: 'var(--bg-secondary)',
              color: selectedElement.locked ? 'var(--warning)' : 'var(--text-muted)',
            }}
            title={selectedElement.locked ? 'Deverrouiller' : 'Verrouiller'}
          >
            {selectedElement.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() =>
              updateElement(selectedElement.id, { visible: !selectedElement.visible })
            }
            className="p-2 rounded-xl transition-colors"
            style={{
              background: 'var(--bg-secondary)',
              color: selectedElement.visible ? 'var(--text-muted)' : 'var(--warning)',
            }}
            title={selectedElement.visible ? 'Masquer' : 'Afficher'}
          >
            {selectedElement.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => removeElement(selectedElement.id)}
            className="p-2 rounded-xl transition-colors"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              color: 'var(--danger)',
            }}
            title="Supprimer"
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>
    );
  }

  // Route properties
  if (selectedRoute) {
    return (
      <div className="flex flex-col h-full">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4"
        >
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedRoute.color }}
            />
            <span
              className="text-[11px] font-semibold uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Route
            </span>
            <span
              className="text-[10px] ml-auto px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
            >
              {selectedRoute.points.length} pts
            </span>
          </div>

          {/* Label */}
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Label
            </label>
            <input
              type="text"
              value={selectedRoute.label || ''}
              placeholder="Ex: Course 1km"
              onChange={(e) => updateRoute(selectedRoute.id, { label: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm rounded-xl focus-ring"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Couleur
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedRoute.color}
                onChange={(e) => updateRoute(selectedRoute.id, { color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer"
                style={{ border: '1px solid var(--border-subtle)' }}
              />
            </div>
          </div>

          {/* Stroke width */}
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Epaisseur: {selectedRoute.strokeWidth}px
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={selectedRoute.strokeWidth}
              onChange={(e) =>
                updateRoute(selectedRoute.id, { strokeWidth: Number(e.target.value) })
              }
            />
          </div>

          {/* Arrows toggle */}
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Fleches
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={selectedRoute.showArrows}
              onClick={() =>
                updateRoute(selectedRoute.id, { showArrows: !selectedRoute.showArrows })
              }
              className="relative w-9 h-5 rounded-full transition-colors"
              style={{ background: selectedRoute.showArrows ? 'var(--accent)' : '#CBD5E1' }}
            >
              <motion.div
                animate={{ x: selectedRoute.showArrows ? 18 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-[2px] w-4 h-4 rounded-full bg-white"
                style={{ boxShadow: 'var(--shadow-xs)' }}
              />
            </button>
          </div>

          {selectedRoute.showArrows && (
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Espacement fleches: {selectedRoute.arrowSpacing}px
              </label>
              <input
                type="range"
                min={30}
                max={200}
                value={selectedRoute.arrowSpacing}
                onChange={(e) =>
                  updateRoute(selectedRoute.id, { arrowSpacing: Number(e.target.value) })
                }
              />
            </div>
          )}

          {/* Line style */}
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Style
            </label>
            <div className="flex gap-1">
              {[
                { value: 'solid', label: 'Plein' },
                { value: 'dashed', label: 'Pointille' },
              ].map((opt) => {
                const current = selectedRoute.dashPattern ? 'dashed' : 'solid';
                const isActive = current === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      updateRoute(selectedRoute.id, {
                        dashPattern: opt.value === 'dashed' ? [10, 5] : undefined,
                      })
                    }
                    className="flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-colors"
                    style={{
                      background: isActive ? 'var(--accent-light)' : 'var(--bg-secondary)',
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => removeRoute(selectedRoute.id)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              color: 'var(--danger)',
            }}
          >
            <Trash2 size={13} />
            Supprimer la route
          </motion.button>
        </div>
      </div>
    );
  }

  return null;
}
