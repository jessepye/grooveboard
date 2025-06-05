import React from 'react';
import CanvasPage from './CanvasPage';
import { Stroke } from '../App'; // Assuming types are exported from App.tsx or a types file
import { Tool } from './Tool'; // Assuming Toolbar.tsx is in src/ or components/

interface BoardProps {
  selectedTool: Tool;
  paths: Stroke[];
  onAddPath: (newPath: Stroke) => void;
  onEraseStrokes: (updatedPaths: Stroke[]) => void;
  penColor: string;
  penWidth: number;
  eraserWidth: number;
}

const Board: React.FC<BoardProps> = ({
  selectedTool,
  paths,
  onAddPath,
  onEraseStrokes,
  penColor,
  penWidth,
  eraserWidth,
}) => {
  return (
    <div>
      <CanvasPage
        selectedTool={selectedTool}
        paths={paths}
        onAddPath={onAddPath}
        onEraseStrokes={onEraseStrokes}
        penColor={penColor}
        penWidth={penWidth}
        eraserWidth={eraserWidth}
        // clearCounter is now handled by paths being an empty array
      />
    </div>
  );
};

export default Board;