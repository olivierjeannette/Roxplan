'use client';

import { useEditorStore } from '@/stores/editorStore';
import { Trash2, Copy, Lock, Unlock, Eye, EyeOff } from 'lucide-react';

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
    autoNumberStations,
  } = useEditorStore();

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  // Si rien n'est selectionne
  if (!selectedElement && !selectedRoute) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Proprietes</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-gray-400 text-center">
            Selectionnez un element pour voir ses proprietes
          </p>
        </div>

        {/* Legende des stations */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase">Legende</h4>
            <button
              onClick={autoNumberStations}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Re-numeroter
            </button>
          </div>
          <div className="space-y-1">
            {elements
              .filter((el) => el.type === 'station')
              .sort((a, b) => (a.stationNumber ?? 0) - (b.stationNumber ?? 0))
              .map((station) => (
                <div
                  key={station.id}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                    style={{ backgroundColor: station.color }}
                  >
                    {station.stationNumber}
                  </span>
                  <span className="truncate">{station.label}</span>
                  {station.reps && (
                    <span className="text-gray-400 ml-auto flex-shrink-0">{station.reps}</span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Proprietes d'un element
  if (selectedElement) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Proprietes</h3>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">{selectedElement.type}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Nom / Label */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Nom</label>
            <input
              type="text"
              value={selectedElement.label}
              onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Couleur */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Couleur</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedElement.color}
                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={selectedElement.color}
                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md font-mono"
              />
            </div>
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">X</label>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Y</label>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Largeur</label>
              <input
                type="number"
                value={selectedElement.width}
                onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Hauteur</label>
              <input
                type="number"
                value={selectedElement.height}
                onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
              />
            </div>
          </div>

          {/* Rotation */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Rotation: {selectedElement.rotation}deg
            </label>
            <input
              type="range"
              min={0}
              max={360}
              value={selectedElement.rotation}
              onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Opacite */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
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
              className="w-full"
            />
          </div>

          {/* Style de fond (zones, shapes, stations) */}
          {selectedElement.type !== 'barrier' && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Style de fond</label>
              <select
                value={selectedElement.fillStyle || 'transparent'}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    fillStyle: e.target.value as 'solid' | 'transparent' | 'none',
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
              >
                <option value="solid">Plein</option>
                <option value="transparent">Semi-transparent</option>
                <option value="none">Contour seul</option>
              </select>
            </div>
          )}

          {/* Opacite du fond */}
          {selectedElement.type !== 'barrier' && selectedElement.fillStyle === 'solid' && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
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
                className="w-full"
              />
            </div>
          )}

          {/* Epaisseur du contour / ligne */}
          {(selectedElement.type === 'barrier' || selectedElement.fillStyle === 'none') && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
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
                className="w-full"
              />
            </div>
          )}

          {/* Afficher/masquer l'icone */}
          {selectedElement.icon && selectedElement.type !== 'barrier' && (
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500">Afficher icone</label>
              <input
                type="checkbox"
                checked={selectedElement.showIcon !== false}
                onChange={(e) =>
                  updateElement(selectedElement.id, { showIcon: e.target.checked })
                }
                className="rounded"
              />
            </div>
          )}

          {/* Taille du texte */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
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
              className="w-full"
            />
          </div>

          {/* Reps (pour stations) */}
          {selectedElement.type === 'station' && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Reps / Distance
              </label>
              <input
                type="text"
                value={selectedElement.reps || ''}
                placeholder="Ex: 1000m, 50m, 100 reps"
                onChange={(e) => updateElement(selectedElement.id, { reps: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
              />
            </div>
          )}

          {/* Numero de station */}
          {selectedElement.type === 'station' && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
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
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-3 flex gap-2">
          <button
            onClick={() => duplicateElement(selectedElement.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Copy size={14} />
            Dupliquer
          </button>
          <button
            onClick={() =>
              updateElement(selectedElement.id, { locked: !selectedElement.locked })
            }
            className="p-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            title={selectedElement.locked ? 'Deverrouiller' : 'Verrouiller'}
          >
            {selectedElement.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          <button
            onClick={() =>
              updateElement(selectedElement.id, { visible: !selectedElement.visible })
            }
            className="p-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            title={selectedElement.visible ? 'Masquer' : 'Afficher'}
          >
            {selectedElement.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={() => removeElement(selectedElement.id)}
            className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Proprietes d'une route
  if (selectedRoute) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Proprietes Route</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Label */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Label</label>
            <input
              type="text"
              value={selectedRoute.label || ''}
              placeholder="Ex: Course 1km"
              onChange={(e) => updateRoute(selectedRoute.id, { label: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Couleur */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Couleur</label>
            <input
              type="color"
              value={selectedRoute.color}
              onChange={(e) => updateRoute(selectedRoute.id, { color: e.target.value })}
              className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
            />
          </div>

          {/* Epaisseur */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
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
              className="w-full"
            />
          </div>

          {/* Fleches */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500">Fleches</label>
            <input
              type="checkbox"
              checked={selectedRoute.showArrows}
              onChange={(e) =>
                updateRoute(selectedRoute.id, { showArrows: e.target.checked })
              }
              className="rounded"
            />
          </div>

          {selectedRoute.showArrows && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
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
                className="w-full"
              />
            </div>
          )}

          {/* Style */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Style</label>
            <select
              value={selectedRoute.dashPattern ? 'dashed' : 'solid'}
              onChange={(e) =>
                updateRoute(selectedRoute.id, {
                  dashPattern: e.target.value === 'dashed' ? [10, 5] : undefined,
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
            >
              <option value="solid">Plein</option>
              <option value="dashed">Pointille</option>
            </select>
          </div>

          {/* Points */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Points: {selectedRoute.points.length}
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={() => removeRoute(selectedRoute.id)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100"
          >
            <Trash2 size={14} />
            Supprimer la route
          </button>
        </div>
      </div>
    );
  }

  return null;
}
