'use client';

import { Hash, ArrowUpDown } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

export function StationNumbering() {
  const { elements, autoNumberStations, updateElement } = useEditorStore();

  const stations = elements
    .filter((el) => el.type === 'station')
    .sort((a, b) => (a.stationNumber ?? 999) - (b.stationNumber ?? 999));

  if (stations.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
          <Hash size={12} />
          Stations ({stations.length})
        </h4>
        <button
          onClick={autoNumberStations}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          title="Re-numeroter par position (haut-bas, gauche-droite)"
        >
          <ArrowUpDown size={12} />
          Auto
        </button>
      </div>

      <div className="space-y-1">
        {stations.map((station) => (
          <div
            key={station.id}
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-50 text-xs"
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: station.color }}
            >
              {station.stationNumber ?? '?'}
            </span>
            <span className="flex-1 truncate text-gray-700">{station.label}</span>
            {station.reps && (
              <span className="text-gray-400 flex-shrink-0">{station.reps}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
