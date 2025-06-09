import React, { useState, useCallback } from 'react';
import './App.css';
import Board from './components/Board';
import Toolbar from './components/Toolbar';
import { Tool } from './components/Tool';

// Define a type for a single stroke/path
export interface Stroke {
  id: string; // Unique ID for each stroke, useful for network and React keys
  tool: Tool | 'pen'; // Could be 'pen' or 'eraser' (though eraser modifies paths array)
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

const App: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<Tool>('pen');
  const [pages, setPages] = useState<Stroke[][]>([[]]); // Array of pages, each page is an array of strokes
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // Default Pen settings
  const [penColor, setPenColor] = useState<string>('#000000');
  const [penWidth, setPenWidth] = useState<number>(5);

  // Eraser settings
  const [eraserWidth, setEraserWidth] = useState<number>(20);


  const handleToolChange = useCallback((tool: Tool) => {
    setSelectedTool(tool);
  }, []);

  const handleClearBoard = useCallback(() => {
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[currentPageIndex] = [];
      return newPages;
    });
  }, [currentPageIndex]);

  // Callback for when a new path is completed by CanvasPage
  const handleAddPath = useCallback((newPath: Stroke) => {
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[currentPageIndex] = [...newPages[currentPageIndex], newPath];
      return newPages;
    });
  }, [currentPageIndex]);

  // Callback for when paths are modified by the eraser
  const handleEraseStrokes = useCallback((updatedPaths: Stroke[]) => {
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[currentPageIndex] = updatedPaths;
      return newPages;
    });
  }, [currentPageIndex]);

  const handleAddPage = () => {
    setPages(prevPages => [...prevPages, []]);
    setCurrentPageIndex(pages.length);
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>GrooveBoard</h1>
      </header>
      <div className="App-body">
        <Toolbar
          selectedTool={selectedTool}
          onToolChange={handleToolChange}
          onClearBoard={handleClearBoard}
          penColor={penColor}
          onPenColorChange={setPenColor}
          penWidth={penWidth}
          onPenWidthChange={setPenWidth}
          eraserWidth={eraserWidth}
          onEraserWidthChange={setEraserWidth}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onNewPage={handleAddPage}
          currentPage={currentPageIndex}
          totalPages={pages.length}
        />
        <main className="App-main-content">
          <Board
            selectedTool={selectedTool}
            paths={pages[currentPageIndex]} // Pass current page's paths
            onAddPath={handleAddPath} // Callback to add new path
            onEraseStrokes={handleEraseStrokes} // Callback to update paths after erase
            penColor={penColor}
            penWidth={penWidth}
            eraserWidth={eraserWidth}
          />
        </main>
      </div>
    </div>
  );
}

export default App;