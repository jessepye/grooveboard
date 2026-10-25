// The editor screen: lifted state for the whole board, composing the toolbar and
// canvas and bridging them to the real-time relay (useCollab).
//
// Follows the prototype's "lifted state, dumb children" pattern. Milestone 1 is
// a single page; the data model and relay payloads keep a `page` index so multi-
// page support can drop in later without a protocol change.

import { useCallback, useState } from 'react'
import { useCollab } from '../collab/useCollab'
import DrawCanvas from './DrawCanvas'
import Toolbar from './Toolbar'
import type { Paths, Stroke, Tool } from '../drawing/types'

const PAGE = 0
const PAGE_W = 1100
const PAGE_H = 850

export interface WhiteboardProps {
  boardId: string
}

export default function Whiteboard({ boardId }: WhiteboardProps) {
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#2A2118')
  const [size, setSize] = useState(4)
  const [paths, setPaths] = useState<Paths>({})

  // Functional updaters so the relay's callbacks never read stale state.
  const addStroke = useCallback((page: number, stroke: Stroke) => {
    setPaths(prev => ({ ...prev, [page]: [...(prev[page] ?? []), stroke] }))
  }, [])
  const setPageStrokes = useCallback((page: number, strokes: Stroke[]) => {
    setPaths(prev => ({ ...prev, [page]: strokes }))
  }, [])

  // Remote events from peers update local state but must NOT be re-broadcast.
  // `state` is the on-join replay: the server's copy replaces ours wholesale
  // (it also fires on reconnect, resyncing us after a dropped connection).
  const collab = useCollab(boardId, {
    onDraw: ({ page, stroke }) => addStroke(page, stroke),
    onErase: ({ page, strokes }) => setPageStrokes(page, strokes),
    onClear: ({ page }) => setPageStrokes(page, []),
    onState: ({ paths: replayed }) => setPaths(replayed),
  })

  // Local actions: update state AND broadcast.
  const commitStroke = (stroke: Stroke) => {
    addStroke(PAGE, stroke)
    collab.sendDraw({ page: PAGE, stroke })
  }
  const handleErase = (strokes: Stroke[]) => {
    setPageStrokes(PAGE, strokes)
    collab.sendErase({ page: PAGE, strokes })
  }
  const clearPage = () => {
    setPageStrokes(PAGE, [])
    collab.sendClear({ page: PAGE })
  }

  return (
    <div className="gb-board">
      <header className="gb-board-bar">
        <span className="gb-logo-mark" aria-hidden />
        <span className="gb-board-title">GrooveBoard</span>
        <span
          className="gb-conn"
          data-online={collab.connected}
          title={collab.connected ? 'Connected' : 'Offline'}
        >
          {collab.connected ? 'Live' : 'Offline'}
        </span>
      </header>

      <div className="gb-canvas-wrap">
        <div
          className="gb-page"
          style={{ width: PAGE_W, height: PAGE_H }}
        >
          <DrawCanvas
            tool={tool}
            color={color}
            size={size}
            strokes={paths[PAGE] ?? []}
            scale={1}
            width={PAGE_W}
            height={PAGE_H}
            onCommitStroke={commitStroke}
            onErase={handleErase}
          />
        </div>
      </div>

      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        onClearPage={clearPage}
      />
    </div>
  )
}
