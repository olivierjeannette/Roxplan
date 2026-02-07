'use client';

import { MoreHorizontal, Copy, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { Plan } from '@/types';

interface PlanCardProps {
  plan: Plan;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PlanCard({ plan, onOpen, onDuplicate, onDelete }: PlanCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formattedDate = new Date(plan.updatedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const stationCount = plan.elements.filter((el) => el.type === 'station').length;

  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all">
      {/* Thumbnail */}
      <div
        className="aspect-video bg-gray-50 relative cursor-pointer"
        onClick={() => onOpen(plan.id)}
      >
        {plan.thumbnail ? (
          <img
            src={plan.thumbnail}
            alt={plan.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                <ExternalLink size={20} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-400">Aucun apercu</p>
            </div>
          </div>
        )}

        {/* Badge type */}
        <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium uppercase rounded-full bg-white/90 text-gray-600 backdrop-blur-sm">
          {plan.eventType}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
              onClick={() => onOpen(plan.id)}
            >
              {plan.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {stationCount} stations &middot; {formattedDate}
            </p>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal size={16} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36">
                  <button
                    onClick={() => {
                      onDuplicate(plan.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Copy size={14} />
                    Dupliquer
                  </button>
                  <button
                    onClick={() => {
                      onDelete(plan.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
