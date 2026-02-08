'use client';

import { useRef, useCallback, useEffect, useState, useMemo, memo } from 'react';
import { Stage, Layer, Rect, Line, Circle, Image as KonvaImage, Shape } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore } from '@/stores/editorStore';
import { CanvasElement } from './CanvasElement';
import { CanvasRoute } from './CanvasRoute';

const GRID_SIZE = 20;
const GRID_COLOR = '#E5E7EB';

interface CanvasProps {
  width: number;
  height: number;
  stageRef?: React.RefObject<Konva.Stage | null>;
}

// Grid rendered as a single native Konva shape for performance
const GridShape = memo(function GridShape({
  canvasWidth,
  canvasHeight,
  opacity,
}: {
  canvasWidth: number;
  canvasHeight: number;
  opacity: number;
}) {
  return (
    <Shape
      sceneFunc={(context) => {
        context.beginPath();
        context.strokeStyle = GRID_COLOR;
        context.lineWidth = 0.5;
        context.globalAlpha = opacity;
        for (let x = 0; x <= canvasWidth; x += GRID_SIZE) {
          context.moveTo(x, 0);
          context.lineTo(x, canvasHeight);
        }
        for (let y = 0; y <= canvasHeight; y += GRID_SIZE) {
          context.moveTo(0, y);
          context.lineTo(canvasWidth, y);
        }
        context.stroke();
      }}
    />
  );
});

export function Canvas({ width, height, stageRef: externalStageRef }: CanvasProps) {
  const internalRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef || internalRef;

  // Subscribe to store slices individually to avoid full re-renders
  const zoom = useEditorStore((s) => s.zoom);
  const panX = useEditorStore((s) => s.panX);
  const panY = useEditorStore((s) => s.panY);
  const activeTool = useEditorStore((s) => s.activeTool);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const elements = useEditorStore((s) => s.elements);
  const routes = useEditorStore((s) => s.routes);
  const backgroundType = useEditorStore((s) => s.backgroundType);
  const backgroundImageUrl = useEditorStore((s) => s.backgroundImageUrl);
  const backgroundOpacity = useEditorStore((s) => s.backgroundOpacity);
  const canvasWidth = useEditorStore((s) => s.canvasWidth);
  const canvasHeight = useEditorStore((s) => s.canvasHeight);
  const selectedRouteId = useEditorStore((s) => s.selectedRouteId);

  const setZoom = useEditorStore((s) => s.setZoom);
  const setPan = useEditorStore((s) => s.setPan);
  const selectElement = useEditorStore((s) => s.selectElement);
  const selectRoute = useEditorStore((s) => s.selectRoute);
  const updateElement = useEditorStore((s) => s.updateElement);
  const addRoute = useEditorStore((s) => s.addRoute);
  const addElement = useEditorStore((s) => s.addElement);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);

  // Background image loading
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (backgroundType === 'image' && backgroundImageUrl) {
      const img = new window.Image();
      img.src = backgroundImageUrl;
      img.onload = () => setBgImage(img);
    } else {
      setBgImage(null);
    }
  }, [backgroundType, backgroundImageUrl]);

  // Points temporaires pour le dessin de route / forme
  const drawingPointsRef = useRef<{ x: number; y: number }[]>([]);
  const drawingShapePointsRef = useRef<{ x: number; y: number }[]>([]);
  // Visual state for drawing previews
  const [drawingRoutePoints, setDrawingRoutePoints] = useState<{ x: number; y: number }[]>([]);
  const [drawingShapePoints, setDrawingShapePoints] = useState<{ x: number; y: number }[]>([]);

  // Zoom avec la molette
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const scaleBy = 1.08;
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.1, Math.min(5, newScale));
      setZoom(clampedScale);

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      setPan(pointer.x - mousePointTo.x * clampedScale, pointer.y - mousePointTo.y * clampedScale);
    },
    [setZoom, setPan, stageRef]
  );

  // Reset drawing state when tool changes
  useEffect(() => {
    if (activeTool !== 'draw_route') {
      drawingPointsRef.current = [];
      setDrawingRoutePoints([]);
    }
    if (activeTool !== 'draw_shape') {
      drawingShapePointsRef.current = [];
      setDrawingShapePoints([]);
    }
  }, [activeTool]);

  // Helper to get canvas-space coords from pointer
  const getCanvasPoint = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    const scale = stage.scaleX();
    return {
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale,
    };
  }, [stageRef]);

  // Click sur le stage (deselection ou dessin de route)
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Ignore double-click events (they also fire click)
      if (e.evt.detail >= 2) return;

      if (e.target === e.target.getStage()) {
        if (activeTool === 'select') {
          selectElement(null);
          selectRoute(null);
        }
      }

      if (activeTool === 'draw_route' || activeTool === 'draw_shape') {
        const point = getCanvasPoint();
        if (!point) return;
        if (activeTool === 'draw_route') {
          drawingPointsRef.current.push(point);
          setDrawingRoutePoints([...drawingPointsRef.current]);
        } else {
          drawingShapePointsRef.current.push(point);
          setDrawingShapePoints([...drawingShapePointsRef.current]);
        }
      }
    },
    [activeTool, selectElement, selectRoute, getCanvasPoint]
  );

  // Double-click pour finir le dessin de route ou de forme
  const handleStageDblClick = useCallback(() => {
    if (activeTool === 'draw_route' && drawingPointsRef.current.length >= 2) {
      addRoute({
        points: [...drawingPointsRef.current],
        color: '#000000',
        strokeWidth: 3,
        showArrows: true,
        arrowSpacing: 80,
      });
      drawingPointsRef.current = [];
      setDrawingRoutePoints([]);
    }

    if (activeTool === 'draw_shape' && drawingShapePointsRef.current.length >= 3) {
      const points = drawingShapePointsRef.current;
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      const w = Math.max(maxX - minX, 10);
      const h = Math.max(maxY - minY, 10);

      // Normalize points relative to bounding box origin
      const customPoints = points.map((p) => ({
        x: p.x - minX,
        y: p.y - minY,
      }));

      addElement({
        type: 'shape',
        x: minX,
        y: minY,
        width: w,
        height: h,
        rotation: 0,
        label: 'Forme libre',
        icon: '',
        color: '#6366F1',
        opacity: 1,
        fillStyle: 'solid',
        fillOpacity: 0.3,
        strokeWidth: 2,
        showIcon: false,
        shapeForm: 'custom',
        customPoints,
        locked: false,
        visible: true,
      });

      drawingShapePointsRef.current = [];
      setDrawingShapePoints([]);
      setActiveTool('select');
    }
  }, [activeTool, addRoute, addElement, setActiveTool]);

  // Drag d'un element
  const handleElementDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      updateElement(id, { x, y });
    },
    [updateElement]
  );

  // Sorted elements (memoized)
  const sortedElements = useMemo(
    () => [...elements].sort((a, b) => a.zIndex - b.zIndex),
    [elements]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Escape') {
        const state = useEditorStore.getState();
        if (state.activeTool !== 'select') {
          state.setActiveTool('select');
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const state = useEditorStore.getState();
        if (state.selectedElementId) {
          state.removeElement(state.selectedElementId);
        } else if (state.selectedRouteId) {
          state.removeRoute(state.selectedRouteId);
        }
      }
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useEditorStore.getState().undo();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        useEditorStore.getState().redo();
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        const state = useEditorStore.getState();
        if (state.selectedElementId) {
          state.duplicateElement(state.selectedElementId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={zoom}
      scaleY={zoom}
      x={panX}
      y={panY}
      draggable={activeTool === 'select'}
      onWheel={handleWheel}
      onClick={handleStageClick}
      onDblClick={handleStageDblClick}
      style={{ backgroundColor: backgroundType === 'blank' ? '#FFFFFF' : '#F9FAFB' }}
    >
      {/* Layer 1: Background */}
      <Layer listening={false}>
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="#FFFFFF" />
        {backgroundType === 'image' && bgImage && (
          <KonvaImage
            image={bgImage}
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            opacity={backgroundOpacity / 100}
          />
        )}
        {backgroundType === 'grid' && (
          <GridShape
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            opacity={backgroundOpacity / 100}
          />
        )}
      </Layer>

      {/* Layer 2: Routes / Parcours */}
      <Layer>
        {routes.map((route) => (
          <CanvasRoute
            key={route.id}
            route={route}
            isSelected={selectedRouteId === route.id}
            onSelect={() => selectRoute(route.id)}
          />
        ))}
      </Layer>

      {/* Layer 3: Elements */}
      <Layer>
        {sortedElements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElementId === element.id}
            onSelect={() => selectElement(element.id)}
            onDragEnd={(x, y) => handleElementDragEnd(element.id, x, y)}
          />
        ))}
      </Layer>

      {/* Layer 4: Drawing preview */}
      {(drawingRoutePoints.length > 0 || drawingShapePoints.length > 0) && (
        <Layer listening={false}>
          {/* Route drawing preview */}
          {drawingRoutePoints.length > 0 && (
            <>
              <Line
                points={drawingRoutePoints.flatMap((p) => [p.x, p.y])}
                stroke="#000000"
                strokeWidth={3}
                dash={[8, 4]}
                opacity={0.6}
              />
              {drawingRoutePoints.map((p, i) => (
                <Circle key={i} x={p.x} y={p.y} radius={4} fill="#000000" opacity={0.7} />
              ))}
            </>
          )}
          {/* Shape drawing preview */}
          {drawingShapePoints.length > 0 && (
            <>
              <Line
                points={drawingShapePoints.flatMap((p) => [p.x, p.y])}
                stroke="#6366F1"
                strokeWidth={2}
                dash={[6, 3]}
                closed={drawingShapePoints.length >= 3}
                fill={drawingShapePoints.length >= 3 ? 'rgba(99,102,241,0.1)' : undefined}
              />
              {drawingShapePoints.map((p, i) => (
                <Circle key={i} x={p.x} y={p.y} radius={5} fill="#6366F1" stroke="#FFFFFF" strokeWidth={2} />
              ))}
            </>
          )}
        </Layer>
      )}
    </Stage>
  );
}
