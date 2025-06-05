import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stroke } from '../App'; // Assuming types are exported from App or a types file
import { Tool } from './Tool'; // Assuming Toolbar.tsx is in src/ or components/

interface CanvasPageProps {
  width?: number;
  height?: number;
  selectedTool: Tool;
  paths: Stroke[];
  onAddPath: (newPath: Stroke) => void;
  onEraseStrokes: (updatedPaths: Stroke[]) => void;
  penColor: string;
  penWidth: number;
  eraserWidth: number;
}

const CanvasPage: React.FC<CanvasPageProps> = ({
  width = 800,
  height = 600,
  selectedTool,
  paths,
  onAddPath,
  onEraseStrokes,
  penColor,
  penWidth,
  eraserWidth,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);


  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Draw all committed paths
    paths.forEach(stroke => {
      if (stroke.points.length < 2) return;
      context.beginPath();
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.width;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        context.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      context.stroke();
    });

    // Draw the current path being drawn (live preview for pen)
    if (isDrawing && selectedTool === 'pen' && currentPoints.length > 1) {
      context.beginPath();
      context.strokeStyle = penColor;
      context.lineWidth = penWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.moveTo(currentPoints[0].x, currentPoints[0].y);
      for (let i = 1; i < currentPoints.length; i++) {
        context.lineTo(currentPoints[i].x, currentPoints[i].y);
      }
      context.stroke();
    }

    // Draw eraser cursor preview
    if (selectedTool === 'eraser' && mousePosition && canvas.style.cursor !== 'crosshair' /* Only if not actively drawing */) {
        context.save();
        context.beginPath();
        context.arc(mousePosition.x, mousePosition.y, eraserWidth / 2, 0, Math.PI * 2, false);
        context.strokeStyle = isDrawing ? 'rgba(220, 38, 38, 0.7)' : 'rgba(107, 114, 128, 0.7)';
        context.lineWidth = 1;
        if (!isDrawing) {
            context.setLineDash([4, 2]);
        }
        context.stroke();
        context.restore();
    }

  }, [paths, isDrawing, currentPoints, selectedTool, penColor, penWidth, eraserWidth, mousePosition]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]); // Redraw whenever paths or drawing state changes

  // Canvas Resize Handler
   useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
        // Preserve drawing state across resizes might be complex if scaling content.
        // For now, we'll just clear and set dimensions.
        // A more advanced solution would re-scale paths.
        const currentPaths = JSON.parse(JSON.stringify(paths)); // Simple deep copy

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        // After resizing, call redrawCanvas to re-render paths
        // This will be automatically handled by the main redrawCanvas effect
        // if paths is a dependency or if we trigger a state update.
        // Forcing a redraw explicitly can also work.
        redrawCanvas();
    };

    resizeCanvas(); // Initial size
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [width, height, redrawCanvas, paths]); // Added paths to ensure redraw on resize after content changes


  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (selectedTool === 'pen') {
        canvas.style.cursor = 'crosshair';
      } else if (selectedTool === 'eraser') {
        canvas.style.cursor = 'default'; // Using drawn cursor
      } else {
        canvas.style.cursor = 'default';
      }
    }
  }, [selectedTool]);

  const getPointerPosition = (event: React.MouseEvent | React.TouchEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) { // Touch event
        if (event.touches.length === 0) return null; // Should not happen in start/move
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else { // Mouse event
        clientX = event.clientX;
        clientY = event.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Stroke Eraser Logic (simplified point-near-segment check)
  const isPointNearSegment = (p: {x:number, y:number}, a: {x:number, y:number}, b: {x:number, y:number}, detectionRadius: number) => {
    const pa_x = p.x - a.x;
    const pa_y = p.y - a.y;
    const ba_x = b.x - a.x;
    const ba_y = b.y - a.y;
    const dot_pa_ba = pa_x * ba_x + pa_y * ba_y;
    const dot_ba_ba = ba_x * ba_x + ba_y * ba_y;
    let t = 0;
    if (dot_ba_ba > 0) {
        t = Math.max(0, Math.min(1, dot_pa_ba / dot_ba_ba));
    }
    const closestX = a.x + t * ba_x;
    const closestY = a.y + t * ba_y;
    const dx = p.x - closestX;
    const dy = p.y - closestY;
    return (dx * dx + dy * dy) < (detectionRadius * detectionRadius);
  };

  const eraseStrokesNearPoint = (eraserPos: { x: number; y: number }) => {
    const detectionRadius = eraserWidth / 2;
    const newPaths = paths.filter(stroke => {
      if (stroke.tool !== 'pen') return true; // Keep non-pen strokes (if any planned)
      for (let j = 0; j < stroke.points.length - 1; j++) {
        const p1 = stroke.points[j];
        const p2 = stroke.points[j + 1];
        if (isPointNearSegment(eraserPos, p1, p2, detectionRadius + stroke.width / 2)) {
          return false; // This stroke should be removed
        }
      }
      return true; // Keep this stroke
    });

    if (newPaths.length !== paths.length) {
      onEraseStrokes(newPaths);
    }
  };


  const handleStartAction = (event: React.MouseEvent | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const pos = getPointerPosition(event);
    if (!pos) return;

    setIsDrawing(true);
    if (selectedTool === 'pen') {
      setCurrentPoints([pos]);
    } else if (selectedTool === 'eraser') {
      // For stroke eraser, erase on down action as well
      eraseStrokesNearPoint(pos);
      // No currentPoints needed for stroke eraser as it acts on existing paths object
    }
  };

  const handlePerformAction = (event: React.MouseEvent | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const pos = getPointerPosition(event);
    setMousePosition(pos); // For eraser cursor preview

    if (!isDrawing || !pos) return;

    if (selectedTool === 'pen') {
      setCurrentPoints(prevPoints => [...prevPoints, pos]);
    } else if (selectedTool === 'eraser') {
      eraseStrokesNearPoint(pos);
    }
    // Redraw will be triggered by state updates (currentPoints or paths)
  };

  const handleStopAction = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (selectedTool === 'pen' && currentPoints.length > 1) {
      onAddPath({
        id: Date.now().toString() + Math.random().toString(36).substring(2), // Simple unique ID
        tool: 'pen',
        points: [...currentPoints],
        color: penColor,
        width: penWidth,
      });
    }
    setCurrentPoints([]);
    // setMousePosition(null); // Optionally hide eraser cursor when not actively moving after drawing
  };


  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: '1px solid #ccc', borderRadius: '0.5rem', touchAction: 'none' }}
        onMouseDown={handleStartAction}
        onMouseMove={handlePerformAction}
        onMouseUp={handleStopAction}
        onMouseLeave={handleStopAction}
        onTouchStart={handleStartAction}
        onTouchMove={handlePerformAction}
        onTouchEnd={handleStopAction}
        onMouseEnter={(e) => setMousePosition(getPointerPosition(e))}
        onMouseOut={() => setMousePosition(null)}

      >
        Your browser does not support the HTML5 canvas tag.
      </canvas>
    </div>
  );
};

export default CanvasPage;