import React from 'react';
import CanvasPage from './CanvasPage';   // Assuming CanvasPage.tsx is in the same directory
import { Tool } from './Toolbar';

interface BoardProps {
  selectedTool: Tool;
  clearCounter: number; // To trigger clear effect in CanvasPage
  // These might be removed if App directly passes to CanvasPage or uses context
  onToolChange: (tool: Tool) => void;
  onClearBoard: () => void;
}

const Board: React.FC<BoardProps> = ({ selectedTool, clearCounter, onClearBoard }) => {
  // Toolbar is now rendered in App.tsx
  // Board is primarily responsible for the canvas area

  return (
    <div>
      {/*
        The Toolbar component is now rendered by App.tsx,
        so we remove it from here.
        Board will just render the CanvasPage(s).
      */}
      <CanvasPage
        selectedTool={selectedTool}
        clearCounter={clearCounter} // Pass the counter
        // onClearBoard is now handled by App, which updates clearCounter
      />
      {/* Later, this could map over an array of pages:
        pages.map(page => <CanvasPage key={page.id} ... />)
      */}
    </div>
  );
};

export default Board;