'use client';

import { useState, useCallback } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { elementLibrary } from '@/lib/elements';
import { useEditorStore } from '@/stores/editorStore';
import type { ElementDefinition, PlanElement } from '@/types';

export function ElementLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(elementLibrary.map((g) => g.name))
  );

  const { addElement } = useEditorStore();

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleAddElement = useCallback(
    (def: ElementDefinition) => {
      const newElement: Omit<PlanElement, 'id' | 'zIndex'> = {
        type: def.type,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        width: def.defaultWidth,
        height: def.defaultHeight,
        rotation: 0,
        label: def.name,
        icon: def.icon,
        color: def.color,
        opacity: 1,
        exerciseType: def.exerciseType,
        fillStyle: def.fillStyle,
        fillOpacity: def.fillOpacity,
        strokeWidth: def.strokeWidth,
        dashPattern: def.dashPattern,
        showIcon: def.showIcon,
        locked: false,
        visible: true,
      };
      addElement(newElement);
    },
    [addElement]
  );

  // Filtrer par recherche
  const filteredLibrary = elementLibrary
    .map((group) => ({
      ...group,
      elements: group.elements.filter((el) =>
        el.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.elements.length > 0);

  return (
    <div className="flex flex-col h-full">
      {/* Barre de recherche */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Chercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Groupes d'elements */}
      <div className="flex-1 overflow-y-auto">
        {filteredLibrary.map((group) => {
          const isExpanded = expandedGroups.has(group.name);
          return (
            <div key={group.name} className="border-b border-gray-100">
              {/* Header du groupe */}
              <button
                onClick={() => toggleGroup(group.name)}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="ml-1.5">{group.name}</span>
                <span className="ml-auto text-xs text-gray-400">{group.elements.length}</span>
              </button>

              {/* Elements du groupe */}
              {isExpanded && (
                <div className="px-2 pb-2 grid grid-cols-2 gap-1">
                  {group.elements.map((element) => (
                    <button
                      key={element.id}
                      onClick={() => handleAddElement(element)}
                      className="flex flex-col items-center p-2 rounded-md border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing"
                      title={element.name}
                    >
                      {/* Preview */}
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center mb-1"
                        style={{ backgroundColor: `${element.color}15` }}
                      >
                        {element.type === 'barrier' ? (
                          <div
                            className="rounded-full"
                            style={{
                              width: '80%',
                              height: Math.max(3, element.strokeWidth || 4),
                              backgroundColor: element.color,
                            }}
                          />
                        ) : element.type === 'shape' ? (
                          <div
                            className="rounded-sm"
                            style={{
                              width: '70%',
                              height: '60%',
                              backgroundColor: element.fillStyle === 'none' ? 'transparent' : element.color,
                              opacity: element.fillOpacity ?? 0.4,
                              border: `2px solid ${element.color}`,
                            }}
                          />
                        ) : element.icon ? (
                          <img
                            src={`/icons/elements/${element.icon}.svg`}
                            alt={element.name}
                            className="w-6 h-6"
                            draggable={false}
                          />
                        ) : (
                          <div
                            className="w-5 h-5 rounded-sm"
                            style={{ backgroundColor: element.color }}
                          />
                        )}
                      </div>
                      {/* Nom */}
                      <span className="text-[10px] text-gray-600 text-center leading-tight line-clamp-2">
                        {element.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
