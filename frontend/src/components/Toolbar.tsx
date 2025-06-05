import React from 'react';
import { Tool } from './Tool'; // Assuming type is defined or moved

interface ToolbarProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  onClearBoard: () => void;
  penColor: string;
  onPenColorChange: (color: string) => void;
  penWidth: number;
  onPenWidthChange: (width: number) => void;
  eraserWidth: number;
  onEraserWidthChange: (width: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolChange,
  onClearBoard,
  penColor,
  onPenColorChange,
  penWidth,
  onPenWidthChange,
  eraserWidth,
  onEraserWidthChange,
}) => {
  return (
    <div className="App-toolbar bg-gray-50 p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Tool</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onToolChange('pen')}
            className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors
                        ${selectedTool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            Pen
          </button>
          <button
            onClick={() => onToolChange('eraser')}
            className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors
                        ${selectedTool === 'eraser' ? 'bg-pink-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            Eraser
          </button>
        </div>
      </div>

      {selectedTool === 'pen' && (
        <div className="pen-settings space-y-4">
          <div>
            <label htmlFor="penColor" className="block text-sm font-medium text-gray-600 mb-1">Pen Color:</label>
            <input
              type="color"
              id="penColor"
              value={penColor}
              onChange={(e) => onPenColorChange(e.target.value)}
              className="w-full h-10 p-1 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="penWidth" className="block text-sm font-medium text-gray-600 mb-1">
              Pen Width: {penWidth}px
            </label>
            <input
              type="range"
              id="penWidth"
              min="1"
              max="50"
              value={penWidth}
              onChange={(e) => onPenWidthChange(parseInt(e.target.value, 10))}
              className="w-full h-6 accent-blue-500"
            />
          </div>
        </div>
      )}

      {selectedTool === 'eraser' && (
        <div className="eraser-settings space-y-4">
          <div>
            <label htmlFor="eraserWidth" className="block text-sm font-medium text-gray-600 mb-1">
              Eraser Size: {eraserWidth}px
            </label>
            <input
              type="range"
              id="eraserWidth"
              min="2"
              max="100"
              value={eraserWidth}
              onChange={(e) => onEraserWidthChange(parseInt(e.target.value, 10))}
              className="w-full h-6 accent-pink-500"
            />
          </div>
        </div>
      )}

      <div className="actions">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Actions</h3>
        <button
          onClick={onClearBoard}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default Toolbar;