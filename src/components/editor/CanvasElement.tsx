'use client';

import { useRef, useEffect, useState, useCallback, memo } from 'react';
import { Group, Rect, Text, Image as KonvaImage, Circle, Line, RegularPolygon, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { PlanElement, ShapeForm } from '@/types';
import { getCachedIcon } from '@/lib/icons';

interface CanvasElementProps {
  element: PlanElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}

/** Convert hex color + opacity (0-1) to rgba string */
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function ShapeBody({
  shapeForm,
  width,
  height,
  fill,
  fillOpacity,
  stroke,
  strokeWidth,
  cornerRadius,
  customPoints,
}: {
  shapeForm: ShapeForm;
  width: number;
  height: number;
  fill: string | undefined;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
  customPoints?: { x: number; y: number }[];
}) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2;

  // Apply fillOpacity via rgba color instead of Konva opacity
  // so that stroke remains fully visible
  const resolvedFill = fill ? hexToRgba(fill, fillOpacity) : undefined;

  switch (shapeForm) {
    case 'custom': {
      if (!customPoints?.length) {
        return (
          <Rect
            width={width}
            height={height}
            fill={resolvedFill}
            cornerRadius={cornerRadius}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      }
      const flatPoints = customPoints.flatMap((p) => [p.x, p.y]);
      return (
        <Line
          points={flatPoints}
          closed={true}
          fill={resolvedFill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
    case 'circle':
      return (
        <Circle
          x={cx}
          y={cy}
          radius={radius}
          fill={resolvedFill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case 'diamond':
      return (
        <RegularPolygon
          x={cx}
          y={cy}
          sides={4}
          radius={radius}
          fill={resolvedFill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case 'hexagon':
      return (
        <RegularPolygon
          x={cx}
          y={cy}
          sides={6}
          radius={radius}
          rotation={30}
          fill={resolvedFill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case 'triangle':
      return (
        <RegularPolygon
          x={cx}
          y={cy}
          sides={3}
          radius={radius}
          fill={resolvedFill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    default:
      return (
        <Rect
          width={width}
          height={height}
          fill={resolvedFill}
          cornerRadius={cornerRadius}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
  }
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

  const showIcon = element.showIcon !== false && !!element.icon;

  useEffect(() => {
    if (showIcon) {
      getCachedIcon(element.icon).then(setIconImage).catch(() => setIconImage(null));
    } else {
      setIconImage(null);
    }
  }, [element.icon, showIcon]);

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

  const isBarrier = element.type === 'barrier';
  const isShape = element.type === 'shape';
  const fillStyle = element.fillStyle || 'transparent';
  const resolvedShape: ShapeForm = element.shapeForm || 'rectangle';
  const badgeSize = 22;
  const showBadge = element.type === 'station' && element.stationNumber !== undefined;
  const iconSize = Math.min(element.width, element.height) * 0.6;

  let rectFill: string | undefined;
  let rectFillOpacity: number;
  let rectStroke: string;
  let rectStrokeWidth: number;

  // Combine element.opacity with fillOpacity so that
  // fillOpacity=1 truly blocks what's behind the shape
  const globalOpacity = element.opacity;

  if (fillStyle === 'solid') {
    rectFill = element.color;
    rectFillOpacity = (element.fillOpacity ?? 0.4) * globalOpacity;
    rectStroke = isSelected ? '#3B82F6' : element.color;
    rectStrokeWidth = isSelected ? 2 : (element.strokeWidth || 1);
  } else if (fillStyle === 'none') {
    rectFill = undefined;
    rectFillOpacity = 0;
    rectStroke = isSelected ? '#3B82F6' : element.color;
    rectStrokeWidth = element.strokeWidth || 3;
  } else {
    rectFill = element.color;
    rectFillOpacity = 0.15 * globalOpacity;
    rectStroke = isSelected ? '#3B82F6' : element.color;
    rectStrokeWidth = isSelected ? 2 : 1;
  }

  const transformerAnchors = isBarrier
    ? ['middle-left', 'middle-right'] as string[]
    : ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center'];

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
      >
        {isBarrier ? (
          <>
            <Line
              points={[0, element.height / 2, element.width, element.height / 2]}
              stroke={isSelected ? '#3B82F6' : element.color}
              strokeWidth={element.strokeWidth || 6}
              lineCap="round"
              dash={element.dashPattern}
              hitStrokeWidth={Math.max(12, (element.strokeWidth || 6) + 8)}
              opacity={globalOpacity}
            />
            <Rect
              width={element.width}
              height={Math.max(element.height, 14)}
              y={element.height / 2 - Math.max(element.height, 14) / 2}
              fill="transparent"
            />
          </>
        ) : (
          <>
            {/* Hit area for non-rectangular shapes */}
            {resolvedShape !== 'rectangle' && (
              <Rect
                width={element.width}
                height={element.height}
                fill="transparent"
              />
            )}

            {/* Shape body */}
            <ShapeBody
              shapeForm={resolvedShape}
              width={element.width}
              height={element.height}
              fill={rectFill}
              fillOpacity={rectFillOpacity}
              stroke={rectStroke}
              strokeWidth={rectStrokeWidth}
              cornerRadius={element.type === 'zone' || isShape ? 8 : 4}
              customPoints={element.customPoints}
            />
          </>
        )}

        {/* Icon */}
        {iconImage && showIcon && (
          <KonvaImage
            image={iconImage}
            x={element.width / 2 - iconSize / 2}
            y={element.height / 2 - iconSize / 2}
            width={iconSize}
            height={iconSize}
            opacity={globalOpacity}
            listening={false}
          />
        )}

        {/* Label */}
        <Text
          text={element.label}
          x={0}
          y={isBarrier ? element.height / 2 + (element.strokeWidth || 6) / 2 + 4 : element.height + 4}
          width={element.width}
          fontSize={element.fontSize || 11}
          fontFamily="Inter, sans-serif"
          fill="#374151"
          align="center"
          opacity={globalOpacity}
          listening={false}
        />

        {/* Station number badge */}
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

        {/* Lock indicator */}
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

      {/* Transformer */}
      {isSelected && !element.locked && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={transformerAnchors}
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (isBarrier) {
              if (newBox.width < 20) return oldBox;
              return { ...newBox, height: oldBox.height };
            }
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
});
