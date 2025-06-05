import React from 'react';

export type Tool = 'pen' | 'eraser';

interface ToolbarProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  onClearBoard: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ selectedTool, onToolChange, onClearBoard }) => {
  return (
    // The main styling for positioning will be in App.css for the .App-toolbar class
    // Removed inline style for borderBottom, can be added as borderRight in App.css
    <div style={{ padding: '10px' /* Removed borderBottom, add borderRight in App.css if needed */ }}>
      <h3>Toolbar</h3>
      <div>
        <button
          onClick={() => onToolChange('pen')}
          style={{ fontWeight: selectedTool === 'pen' ? 'bold' : 'normal', marginRight: '5px', display: 'block', marginBottom: '5px' }}
        >
          Pen
        </button>
        <button
          onClick={() => onToolChange('eraser')}
          style={{ fontWeight: selectedTool === 'eraser' ? 'bold' : 'normal', marginRight: '10px', display: 'block', marginBottom: '5px' }}
        >
          Eraser
        </button>
        <button onClick={onClearBoard} style={{ display: 'block', marginTop: '10px' }}>
          Clear Board
        </button>
      </div>
      <p>Selected Tool: {selectedTool}</p>
    </div>
  );
};

export default Toolbar;