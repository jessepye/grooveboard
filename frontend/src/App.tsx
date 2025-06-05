import React from 'react';
import './App.css';
import Board from './components/Board'; // Assuming Board.tsx is in the components directory
import Toolbar, { Tool } from './components/Toolbar'; // Assuming Toolbar.tsx is in the components directory
// If you are managing state in Board.tsx for the toolbar, you'll need to lift it here
// or use Context as previously discussed.
// For this example, let's assume Board.tsx still internally manages the toolbar state
// or that we will pass props down from App.tsx if state is lifted here.

// For simplicity in this step, let's assume Board handles its own Toolbar interaction
// or we'll pass down props from a state defined here.
// Let's manage the selectedTool and clearBoard at App level for this example.

const App: React.FC = () => {
  const [selectedTool, setSelectedTool] = React.useState<Tool>('pen');
  const [clearCounter, setClearCounter] = React.useState(0); // To trigger clear

  const handleToolChange = (tool: Tool) => {
    setSelectedTool(tool);
  };

  const handleClearBoard = () => {
    console.log('App: Clear action triggered');
    setClearCounter(prev => prev + 1); // Change this to trigger re-render/effect in CanvasPage
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
        />
        <main className="App-main-content">
          <Board
            selectedTool={selectedTool}
            clearCounter={clearCounter} // Pass this down
            onToolChange={handleToolChange} // Board might not need this if CanvasPage gets tool from prop
            onClearBoard={handleClearBoard} // Board might not need this if CanvasPage gets clear from prop
          />
        </main>
      </div>
    </div>
  );
}

export default App;