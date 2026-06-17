import { useMemo } from 'react'
import Whiteboard from './components/Whiteboard'
import { resolveBoardId } from './board/boardId'
import './App.css'

function App() {
  // Resolve the board once. A freshly minted id is written back to the URL so
  // it can be shared/refreshed.
  const boardId = useMemo(() => {
    const { boardId, created } = resolveBoardId(window.location.search)
    if (created) {
      const url = new URL(window.location.href)
      url.searchParams.set('board', boardId)
      window.history.replaceState(null, '', url)
    }
    return boardId
  }, [])

  return <Whiteboard boardId={boardId} />
}

export default App
