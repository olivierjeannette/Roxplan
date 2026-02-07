'use client';

import { useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Group, Text } from 'react-konva';
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

export function Canvas({ width, height, stageRef: externalStageRef }: CanvasProps) {
  const internalRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef || internalRef;

  const {
    zoom,
    panX,
    panY,
    activeTool,
    selectedElementId,
    elements,
    routes,
    backgroundType,
    backgroundOpacity,
    canvasWidth,
    canvasHeight,
    setZoom,
    setPan,
    selectElement,
    selectRoute,
    updateElement,
    addRoute,
  } = useEditorStore();

  // Points temporaires pour le dessin de route
  const drawingPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Zoom avec la molette
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const scaleBy = 1.08;
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = zoom;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      setZoom(newScale);

      const mousePointTo = {
        x: (pointer.x - panX) / oldScale,
        y: (pointer.y - panY) / oldScale,
      };
      setPan(pointer.x - mousePointTo.x * newScale, pointer.y - mousePointTo.y * newScale);
    },
    [zoom, panX, panY, setZoom, setPan, stageRef]
  );

  // Click sur le stage (deselection ou dessin de route)
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        if (activeTool === 'select') {
          selectElement(null);
          selectRoute(null);
        }
      }

      if (activeTool === 'draw_route') {
        const stage = stageRef.current;
        if (!stage) return;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;
        const point = {
          x: (pointer.x - panX) / zoom,
          y: (pointer.y - panY) / zoom,
        };
        drawingPointsRef.current.push(point);
      }
    },
    [activeTool, selectElement, selectRoute, stageRef, panX, panY, zoom]
  );

  // Double-click pour finir le dessin de route
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
    }
  }, [activeTool, addRoute]);

  // Drag d'un element
  const handleElementDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      updateElement(id, { x, y });
    },
    [updateElement]
  );

  // Grille de fond
  const renderGrid = useCallback(() => {
    if (backgroundType !== 'grid') return null;
    const lines = [];
    // Lignes verticales
    for (let x = 0; x <= canvasWidth; x += GRID_SIZE) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, canvasHeight]}
          stroke={GRID_COLOR}
          strokeWidth={0.5}
          opacity={backgroundOpacity / 100}
        />
      );
    }
    // Lignes horizontales
    for (let y = 0; y <= canvasHeight; y += GRID_SIZE) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, canvasWidth, y]}
          stroke={GRID_COLOR}
          strokeWidth={0.5}
          opacity={backgroundOpacity / 100}
        />
      );
    }
    return lines;
  }, [backgroundType, backgroundOpacity, canvasWidth, canvasHeight]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      <Layer>
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="#FFFFFF" />
        {renderGrid()}
      </Layer>

      {/* Layer 2: Routes / Parcours */}
      <Layer>
        {routes.map((route) => (
          <CanvasRoute
            key={route.id}
            route={route}
            isSelected={useEditorStore.getState().selectedRouteId === route.id}
            onSelect={() => selectRoute(route.id)}
          />
        ))}
      </Layer>

      {/* Layer 3: Elements */}
      <Layer>
        {[...elements]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              isSelected={selectedElementId === element.id}
              onSelect={() => selectElement(element.id)}
              onDragEnd={(x, y) => handleElementDragEnd(element.id, x, y)}
            />
          ))}
      </Layer>
    </Stage>
  );
}
