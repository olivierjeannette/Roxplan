'use client';

import { useRef, useEffect, useState, useCallback, memo } from 'react';
import { Group, Rect, Text, Image as KonvaImage, Circle, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { PlanElement } from '@/types';
import { getCachedIcon } from '@/lib/icons';

interface CanvasElementProps {
  element: PlanElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}

export const CanvasElement = memo(function CanvasElement({
  element,
  isSelected,
  onSelect,
  onDragEnd,
}: CanvasElementProps) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [iconImage, setIconImage] = useState<HTMLImageElement | null>(null);

  // Charger l'icone SVG
  useEffect(() => {
    if (element.icon) {
      getCachedIcon(element.icon).then(setIconImage).catch(() => setIconImage(null));
    }
  }, [element.icon]);

  // Attacher le transformer quand selectionne
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (element.locked) return;
      onDragEnd(e.target.x(), e.target.y());
    },
    [element.locked, onDragEnd]
  );

  if (!element.visible) return null;

  const badgeSize = 22;
  const showBadge = element.type === 'station' && element.stationNumber !== undefined;
  const iconSize = Math.min(element.width, element.height) * 0.6;

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        draggable={!element.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        opacity={element.opacity}
      >
        {/* Fond de l'element */}
        <Rect
          width={element.width}
          height={element.height}
          fill={element.color}
          cornerRadius={element.type === 'zone' ? 8 : 4}
          opacity={0.15}
          stroke={isSelected ? '#3B82F6' : element.color}
          strokeWidth={isSelected ? 2 : 1}
        />

        {/* Icone SVG */}
        {iconImage && (
          <KonvaImage
            image={iconImage}
            x={element.width / 2 - iconSize / 2}
            y={element.height / 2 - iconSize / 2}
            width={iconSize}
            height={iconSize}
            listening={false}
          />
        )}

        {/* Label */}
        <Text
          text={element.label}
          x={0}
          y={element.height + 4}
          width={element.width}
          fontSize={element.fontSize || 11}
          fontFamily="Inter, sans-serif"
          fill="#374151"
          align="center"
          listening={false}
        />

        {/* Badge numero de station */}
        {showBadge && (
          <>
            <Circle
              x={element.width - 2}
              y={-2}
              radius={badgeSize / 2}
              fill={element.color}
              listening={false}
            />
            <Text
              text={String(element.stationNumber)}
              x={element.width - 2 - badgeSize / 2}
              y={-2 - badgeSize / 2 + 2}
              width={badgeSize}
              height={badgeSize}
              fontSize={12}
              fontStyle="bold"
              fontFamily="Inter, sans-serif"
              fill="#FFFFFF"
              align="center"
              verticalAlign="middle"
              listening={false}
            />
          </>
        )}

        {/* Indicateur verrouille */}
        {element.locked && (
          <Text
            text="🔒"
            x={-4}
            y={-16}
            fontSize={12}
            listening={false}
          />
        )}
      </Group>

      {/* Transformer (redimensionnement + rotation) */}
      {isSelected && !element.locked && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={[
            'top-left', 'top-right', 'bottom-left', 'bottom-right',
            'middle-left', 'middle-right', 'top-center', 'bottom-center',
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
});
