import React, { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
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
  // State for the WebSocket connection
  const [socket, setSocket] = useState<Socket | null>(null);

  // Drawing and tool state
  const [selectedTool, setSelectedTool] = useState<Tool>('pen');
  const [pages, setPages] = useState<Stroke[][]>([[]]); // Array of pages, each page is an array of strokes
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // Default Pen settings
  const [penColor, setPenColor] = useState<string>('#000000');
  const [penWidth, setPenWidth] = useState<number>(5);

  // Eraser settings
  const [eraserWidth, setEraserWidth] = useState<number>(20);

  // This useEffect handles setting up and tearing down the WebSocket connection.
  // It runs only once when the component mounts.
  useEffect(() => {
    // Connect to the server (replace with your actual server URL in the future)
    const newSocket = io('http://localhost:3001'); // Assuming your backend runs on port 3001
    setSocket(newSocket);

    // Clean up the connection when the component unmounts
    return () => {
      newSocket.close();
    };
  }, [setSocket]); // The dependency array is important for controlling when the effect runs.

  // This useEffect handles listening for incoming WebSocket events.
  useEffect(() => {
    if (!socket) return; // Don't run if the socket is not connected yet

    const handleNewDrawing = (newPath: Stroke) => {
      // NOTE: This is a simplified implementation. In a real-world scenario,
      // you would likely want to add a check to prevent adding a path that
      // this client just sent. This can be done by comparing a unique ID
      // from the socket or the path itself.
      setPages(prevPages => {
        const newPages = [...prevPages];
        // For now, we assume the action applies to the currently active page.
        // A more robust solution might include the page index in the event data.
        newPages[currentPageIndex] = [...newPages[currentPageIndex], newPath];
        return newPages;
      });
    };

    const handleEraseEvent = (updatedPaths: Stroke[]) => {
      setPages(prevPages => {
        const newPages = [...prevPages];
        newPages[currentPageIndex] = updatedPaths;
        return newPages;
      });
    };

    const handleClearEvent = () => {
      setPages(prevPages => {
        const newPages = [...prevPages];
        newPages[currentPageIndex] = [];
        return newPages;
      });
    };

    // Set up listeners for events from the server
    socket.on('draw', handleNewDrawing);
    socket.on('erase', handleEraseEvent);
    socket.on('clear', handleClearEvent);

    // Clean up listeners when the component unmounts or dependencies change
    return () => {
      socket.off('draw', handleNewDrawing);
      socket.off('erase', handleEraseEvent);
      socket.off('clear', handleClearEvent);
    };
  }, [socket, currentPageIndex]); // Re-run if the socket connection or the current page changes

  // --- Callback handlers for user actions ---

  const handleToolChange = useCallback((tool: Tool) => {
    setSelectedTool(tool);
  }, []);

  const handleClearBoard = useCallback(() => {
    // Update local state immediately for a responsive feel
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[currentPageIndex] = [];
      return newPages;
    });
    // Send the clear event to the server
    if (socket) {
      socket.emit('clear');
    }
  }, [currentPageIndex, socket]);

  const handleAddPath = useCallback((newPath: Stroke) => {
    // Update local state immediately
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[currentPageIndex] = [...newPages[currentPageIndex], newPath];
      return newPages;
    });
    // Send the new path data to the server
    if (socket) {
      socket.emit('draw', newPath);
    }
  }, [currentPageIndex, socket]);

  const handleEraseStrokes = useCallback((updatedPaths: Stroke[]) => {
    // Update local state immediately
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[currentPageIndex] = updatedPaths;
      return newPages;
    });
    // Send the updated paths to the server
    if (socket) {
      socket.emit('erase', updatedPaths);
    }
  }, [currentPageIndex, socket]);

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
