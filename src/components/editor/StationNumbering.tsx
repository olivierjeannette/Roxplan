'use client';

import { Hash, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/stores/editorStore';

export function StationNumbering() {
  const { elements, autoNumberStations } = useEditorStore();

  const stations = elements
    .filter((el) => el.type === 'station')
    .sort((a, b) => (a.stationNumber ?? 999) - (b.stationNumber ?? 999));

  if (stations.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-semibold uppercase flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <Hash size={12} />
          Stations ({stations.length})
        </h4>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={autoNumberStations}
          className="flex items-center gap-1 text-[11px] font-medium"
          style={{ color: 'var(--accent)' }}
          title="Re-numeroter par position"
        >
          <ArrowUpDown size={11} />
          Auto
        </motion.button>
      </div>

      <div className="space-y-0.5">
        {stations.map((station, index) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/[0.02] transition-colors text-xs"
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: station.color }}
            >
              {station.stationNumber ?? '?'}
            </span>
            <span className="flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
              {station.label}
            </span>
            {station.reps && (
              <span className="flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                {station.reps}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
