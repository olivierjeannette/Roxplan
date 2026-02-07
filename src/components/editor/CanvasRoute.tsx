'use client';

import { memo, useMemo } from 'react';
import { Group, Line, RegularPolygon, Text } from 'react-konva';
import type { Route, RoutePoint } from '@/types';

interface CanvasRouteProps {
  route: Route;
  isSelected: boolean;
  onSelect: () => void;
}

function getTotalLength(points: RoutePoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

function getPointAtDistance(
  points: RoutePoint[],
  targetDist: number
): { point: RoutePoint; angle: number } {
  let accumulated = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const segLen = Math.sqrt(dx * dx + dy * dy);

    if (accumulated + segLen >= targetDist) {
      const ratio = (targetDist - accumulated) / segLen;
      return {
        point: {
          x: points[i - 1].x + dx * ratio,
          y: points[i - 1].y + dy * ratio,
        },
        angle: (Math.atan2(dy, dx) * 180) / Math.PI,
      };
    }
    accumulated += segLen;
  }

  const lastIdx = points.length - 1;
  const dx = points[lastIdx].x - points[lastIdx - 1].x;
  const dy = points[lastIdx].y - points[lastIdx - 1].y;
  return {
    point: points[lastIdx],
    angle: (Math.atan2(dy, dx) * 180) / Math.PI,
  };
}

export const CanvasRoute = memo(function CanvasRoute({
  route,
  isSelected,
  onSelect,
}: CanvasRouteProps) {
  // Memoize expensive computations
  const { flatPoints, arrows, midPoint, totalLength } = useMemo(() => {
    if (route.points.length < 2) return { flatPoints: [], arrows: [], midPoint: null, totalLength: 0 };

    const flat = route.points.flatMap((p) => [p.x, p.y]);
    const len = getTotalLength(route.points);

    const arrowList: { x: number; y: number; rotation: number }[] = [];
    if (route.showArrows && route.arrowSpacing > 0) {
      for (let dist = route.arrowSpacing; dist < len; dist += route.arrowSpacing) {
        const { point, angle } = getPointAtDistance(route.points, dist);
        arrowList.push({ x: point.x, y: point.y, rotation: angle + 90 });
      }
    }

    const mid = getPointAtDistance(route.points, len / 2);

    return { flatPoints: flat, arrows: arrowList, midPoint: mid, totalLength: len };
  }, [route.points, route.showArrows, route.arrowSpacing]);

  if (route.points.length < 2) return null;

  return (
    <Group onClick={onSelect} onTap={onSelect}>
      {/* Ligne principale */}
      <Line
        points={flatPoints}
        stroke={isSelected ? '#3B82F6' : route.color}
        strokeWidth={route.strokeWidth}
        dash={route.dashPattern}
        lineCap="round"
        lineJoin="round"
        hitStrokeWidth={12}
      />

      {/* Fleches de direction */}
      {arrows.map((arrow, i) => (
        <RegularPolygon
          key={i}
          x={arrow.x}
          y={arrow.y}
          sides={3}
          radius={8}
          rotation={arrow.rotation}
          fill={route.color}
          opacity={0.8}
          listening={false}
        />
      ))}

      {/* Label de la route */}
      {route.label && midPoint && (
        <Text
          x={midPoint.point.x - 40}
          y={midPoint.point.y - 20}
          text={route.label}
          fontSize={12}
          fontFamily="Inter, sans-serif"
          fontStyle="bold"
          fill={route.color}
          padding={4}
          listening={false}
        />
      )}

      {/* Points de controle quand selectionne */}
      {isSelected &&
        route.points.map((point, i) => (
          <RegularPolygon
            key={i}
            x={point.x}
            y={point.y}
            sides={4}
            radius={5}
            rotation={45}
            fill="#3B82F6"
            stroke="#FFFFFF"
            strokeWidth={1}
            draggable
          />
        ))}
    </Group>
  );
});
