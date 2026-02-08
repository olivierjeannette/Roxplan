'use client';

import { useState, useCallback } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        shapeForm: def.shapeForm,
        locked: false,
        visible: true,
      };
      addElement(newElement);
    },
    [addElement]
  );

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
      {/* Search */}
      <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Chercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-xl focus-ring"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredLibrary.map((group) => {
          const isExpanded = expandedGroups.has(group.name);
          return (
            <div key={group.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.name)}
                className="flex items-center w-full px-3 py-2 text-[11px] font-semibold uppercase transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <motion.span
                  animate={{ rotate: isExpanded ? 0 : -90 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronDown size={13} />
                </motion.span>
                <span className="ml-1.5">{group.name}</span>
                <span
                  className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                >
                  {group.elements.length}
                </span>
              </button>

              {/* Group elements */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-2 pb-2 grid grid-cols-2 gap-1">
                      {group.elements.map((element, idx) => (
                        <motion.button
                          key={element.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15, delay: idx * 0.02 }}
                          whileHover={{ scale: 1.04, y: -1 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleAddElement(element)}
                          className="flex flex-col items-center p-2 rounded-xl transition-colors cursor-grab active:cursor-grabbing"
                          style={{ border: '1px solid transparent' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.background = 'var(--bg-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.background = 'transparent';
                          }}
                          title={element.name}
                        >
                          {/* Preview */}
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center mb-1"
                            style={{ backgroundColor: `${element.color}12` }}
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
                              <svg width="28" height="24" viewBox="0 0 28 24">
                                {element.shapeForm === 'circle' ? (
                                  <circle
                                    cx="14" cy="12" r="10"
                                    fill={element.fillStyle === 'none' ? 'none' : element.color}
                                    fillOpacity={element.fillOpacity ?? 0.4}
                                    stroke={element.color}
                                    strokeWidth="2"
                                  />
                                ) : element.shapeForm === 'diamond' ? (
                                  <polygon
                                    points="14,1 26,12 14,23 2,12"
                                    fill={element.fillStyle === 'none' ? 'none' : element.color}
                                    fillOpacity={element.fillOpacity ?? 0.4}
                                    stroke={element.color}
                                    strokeWidth="2"
                                  />
                                ) : element.shapeForm === 'hexagon' ? (
                                  <polygon
                                    points="7,1 21,1 27,12 21,23 7,23 1,12"
                                    fill={element.fillStyle === 'none' ? 'none' : element.color}
                                    fillOpacity={element.fillOpacity ?? 0.4}
                                    stroke={element.color}
                                    strokeWidth="2"
                                  />
                                ) : element.shapeForm === 'triangle' ? (
                                  <polygon
                                    points="14,1 27,23 1,23"
                                    fill={element.fillStyle === 'none' ? 'none' : element.color}
                                    fillOpacity={element.fillOpacity ?? 0.4}
                                    stroke={element.color}
                                    strokeWidth="2"
                                  />
                                ) : (
                                  <rect
                                    x="1" y="1" width="26" height="22" rx="3"
                                    fill={element.fillStyle === 'none' ? 'none' : element.color}
                                    fillOpacity={element.fillOpacity ?? 0.4}
                                    stroke={element.color}
                                    strokeWidth="2"
                                  />
                                )}
                              </svg>
                            ) : element.icon ? (
                              <img
                                src={`/icons/elements/${element.icon}.svg`}
                                alt={element.name}
                                className="w-6 h-6"
                                draggable={false}
                              />
                            ) : (
                              <div
                                className="w-5 h-5 rounded-md"
                                style={{ backgroundColor: element.color }}
                              />
                            )}
                          </div>
                          {/* Name */}
                          <span
                            className="text-[10px] text-center leading-tight line-clamp-2 font-medium"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {element.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
