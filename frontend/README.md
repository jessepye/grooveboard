# frontend

GrooveBoard's web client — Vite 5 + React 18 + TypeScript. Milestone 1 is a
real-time collaborative whiteboard: anonymous users on the same board id draw on
each other's canvas through the [collaboration service](../collab-service).

## Layout

```
src/
  drawing/      pure, React-free model + logic (unit-tested in isolation)
    types.ts      Point / Stroke / Tool / Paths
    geometry.ts   distToSegment, eraseStrokesAt
    stroke.ts     createStroke
  collab/
    useCollab.ts  Socket.IO client hook — sends/receives draw|erase|clear
  components/
    DrawCanvas.tsx  the drawing surface (pointer events -> strokes)
    Toolbar.tsx     pen / eraser / color / size / clear
    Whiteboard.tsx  lifted state; bridges canvas+toolbar to the relay
  board/
    boardId.ts    resolve/mint the board id from the URL (?board=<uuid>)
```

The prototype's `window.X` globals are gone — everything is ES modules. State is
lifted into `Whiteboard` (the prototype's "dumb children" pattern), strokes are
stored in logical page coordinates, and local edits are both applied and
broadcast; remote events are applied without re-broadcasting.

## Commands

```bash
npm install
npm run dev          # dev server (http://localhost:5173)
npm test             # vitest (watch)
npm test -- --run    # vitest single run
npm run build        # tsc -b && vite build
npm run lint
```

## Connecting to the relay

The Socket.IO client points at `VITE_COLLAB_URL` (default
`http://localhost:3001`). To run the full stack locally, start the
[collab-service](../collab-service) on `:3001`, then open two browser tabs at the
same `?board=<id>` URL.

```bash
# point at a deployed relay instead of localhost
echo 'VITE_COLLAB_URL=https://collab.example.com' > .env.local
```

## Not yet ported (see `docs/todo.md`)

Highlighter, sticky notes, multiple pages, zoom controls, themes, share modal,
undo/redo, and live collaborator cursors. The relay only carries
`draw`/`erase`/`clear`; cursor presence would be a new event.
