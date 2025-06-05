import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Tool } from './Toolbar'; // Assuming Toolbar.tsx is in the same directory or src/

interface CanvasPageProps {
  width?: number;
  height?: number;
  selectedTool: Tool;
  clearCounter: number;
}

const DEFAULT_PEN_COLOR = 'black';
const DEFAULT_PEN_THICKNESS = 2;
const DEFAULT_ERASER_THICKNESS = 10; // Eraser can be thicker

const CanvasPage: React.FC<CanvasPageProps> = ({
  width = 800,
  height = 600,
  selectedTool,
  clearCounter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false); // Used for both pen and eraser
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        console.log('Canvas cleared');
      }
    }
  }, [canvasRef]);

  // Effect for initial setup and clearing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        // Default styles, will be overridden by tool-specific logic
        context.lineCap = 'round';
        context.lineJoin = 'round';
        clearCanvas();
      }
    }
  }, [width, height, clearCanvas]);

  // Effect for handling clearCounter prop
  useEffect(() => {
    if (clearCounter > 0) {
      clearCanvas();
    }
  }, [clearCounter, clearCanvas]);

  // Effect for tool-specific cursor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (selectedTool === 'pen') {
        canvas.style.cursor = 'crosshair';
      } else if (selectedTool === 'eraser') {
        // You might want a more specific eraser cursor later
        canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${DEFAULT_ERASER_THICKNESS}" height="${DEFAULT_ERASER_THICKNESS}" viewport="0 0 100 100" style="fill:black;stroke:black;stroke-width:1px;"><circle cx="${DEFAULT_ERASER_THICKNESS/2}" cy="${DEFAULT_ERASER_THICKNESS/2}" r="${DEFAULT_ERASER_THICKNESS/2-1}" fill="white" stroke="black" stroke-width="1"/></svg>') ${DEFAULT_ERASER_THICKNESS/2} ${DEFAULT_ERASER_THICKNESS/2}, auto`;
      } else {
        canvas.style.cursor = 'default';
      }
    }
  }, [selectedTool]);

  const getMousePosition = (event: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startAction = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePosition(event);
    if (!pos) return;

    setIsDrawing(true);
    setLastPosition(pos);

    const context = canvasRef.current?.getContext('2d');
    if (context) {
      context.beginPath();
      context.moveTo(pos.x, pos.y);

      // Apply tool-specific settings
      if (selectedTool === 'pen') {
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = DEFAULT_PEN_COLOR;
        context.lineWidth = DEFAULT_PEN_THICKNESS;
        // Draw a dot for pen on mousedown
        context.lineTo(pos.x, pos.y);
        context.stroke();
      } else if (selectedTool === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
        context.lineWidth = DEFAULT_ERASER_THICKNESS;
        // Erase a small circle on mousedown for eraser
        context.arc(pos.x, pos.y, DEFAULT_ERASER_THICKNESS / 2, 0, Math.PI * 2, false);
        context.fill();
      }
    }
  };

  const performAction = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getMousePosition(event);
    if (!pos || !lastPosition) return;

    const context = canvasRef.current?.getContext('2d');
    if (context) {
      context.beginPath(); // Important to begin a new path for each segment
      context.moveTo(lastPosition.x, lastPosition.y);
      context.lineTo(pos.x, pos.y);

      if (selectedTool === 'pen') {
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = DEFAULT_PEN_COLOR;
        context.lineWidth = DEFAULT_PEN_THICKNESS;
        context.stroke();
      } else if (selectedTool === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
        context.lineWidth = DEFAULT_ERASER_THICKNESS;
        context.stroke(); // Erase along the path
      }
      setLastPosition(pos);
    }
  };

  const stopAction = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPosition(null);
    const context = canvasRef.current?.getContext('2d');
    if (context) {
      context.closePath();
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: '1px solid black', touchAction: 'none' }}
        onMouseDown={startAction}  // Renamed from startDrawing
        onMouseMove={performAction} // Renamed from draw
        onMouseUp={stopAction}    // Renamed from stopDrawing
        onMouseLeave={stopAction}  // Renamed from stopDrawing
      >
        Your browser does not support the HTML5 canvas tag.
      </canvas>
    </div>
  );
};

export default CanvasPage;