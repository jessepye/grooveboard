# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GrooveBoard is a planned simple, real-time collaborative whiteboard application designed for ease of use (even for younger users). It is in **Phase 1**: a typed, tested React frontend and a Socket.IO collaboration service run together locally; nothing is deployed yet. The full vision is a React/TypeScript frontend with a microservice backend on AWS — see `docs/roadmap.md`.

## Current Repo State

The repo contains:

- `grooveboard-claude-design/` — a **runnable design prototype** of the UI. Open `GrooveBoard.html` directly in a browser; no build step. It uses React 18 (UMD bundles from a CDN) plus `@babel/standalone` to compile JSX in the browser at page load. This is suitable for design iteration but **not** for production.
- `docs/` — roadmap, todos, llm-guidelines.
- `deploy/` — `compose.yaml` + `Caddyfile`: how the relay runs on the EC2 instance (Caddy terminates TLS and proxies to the relay container).
- `frontend/` — Vite 8 + React 19 + TypeScript 6. Tests via Vitest 4 + React Testing Library (jsdom). Targets Node 26 (root `.nvmrc`; `engines` + `engine-strict` in `frontend/.npmrc`). The prototype's core drawing (pen, highlighter, pixel and whole-stroke eraser, clear) and its floating toolbar (per-tool color/size popover, eraser-mode popover, dock positions, SVG icons) have been ported into typed components (`src/components/`) with pure, tested logic in `src/drawing/` and the real-time relay client in `src/collab/`. Stickies, pages, zoom, themes, and live cursors are not yet ported (see `docs/todo.md`).
- `collab-service/` — the Phase 1 backend: a validating Node + Socket.IO relay with board state (TypeScript, Vitest). One room per board (UUID required at handshake); validates events, applies them to the room's server-held state, then broadcasts `draw`/`erase`/`clear` to peers, sender excluded. Joining clients get the board's current state as a `state` event (replay), so refreshes and late joins don't start blank. Persistence sits behind the `BoardStore` seam (`src/store.ts`): in-memory (LRU-capped) now, DynamoDB planned at deploy. Abuse limits built in: payload/point caps, strokes-per-page cap, per-connection token-bucket rate limiting, per-IP connection cap, `COLLAB_DISABLED=1` kill switch. `GET /healthz` for load balancers. Multi-stage Dockerfile.

### Prototype files (`grooveboard-claude-design/`)

- `GrooveBoard.html` — entry point; loads React, Babel, and the JSX files
- `GrooveBoard - Variants.html` — gallery rendering multiple states side-by-side
- `styles.css` — design tokens via CSS custom properties (`--gb-paper`, `--gb-ink`, etc.)
- `whiteboard.jsx` — main editor screen (state lives here: tool, color, paths, stickies, page, history)
- `whiteboard-parts.jsx` — `DrawCanvas`, `Sticky`, `LiveCursor`, `Toolbar`
- `home.jsx` — board picker / home screen
- `boards-drawer.jsx` — side drawer for saved boards
- `tweaks-panel.jsx` — live design-tweaks UI (theme, toolbar position, page size, etc.)
- `icons.jsx` — inline SVG icons
- `design-canvas.jsx` — scaffolding used **only** by `GrooveBoard - Variants.html`; not part of the runtime app

### Prototype caveats

- No imports/exports — files share state by attaching to `window.X` globals.
- No TypeScript — plain JSX.
- No tests — this is a design artifact.
- "Collaborators" are fake cursors animated by `setInterval`. No WebSocket connection.
- State is local React state; nothing persists.

## Data Model (in the prototype)

A page's strokes live in `paths[pageIndex]`, an array of:

```js
{
  id: string,
  tool: 'pen' | 'highlighter' | 'shape',
  points: { x: number, y: number }[],   // page-logical coords, not screen coords
  color: string,
  size: number,
}
```

Stickies are stored separately: `stickies[pageIndex]` is an array of `{ id, x, y, color, rot, text }`.

Coordinates are **logical page coordinates** (page is 1100×850 logical px for letter); the page DOM is `transform: scale(activeScale)` to fit the viewport. Click handlers divide by `activeScale` to recover logical coords.

## Development Commands

Prototype (no build step):
```bash
open grooveboard-claude-design/GrooveBoard.html
# or: cd grooveboard-claude-design && python3 -m http.server 8000
```

Frontend (Vite + TS):
```bash
cd frontend
npm install
npm run dev      # dev server
npm test         # vitest (watch)
npm test -- --run  # vitest single run
npm run build    # tsc -b && vite build
```

Collaboration service (Node + Socket.IO relay):
```bash
cd collab-service
npm install
npm run dev       # tsx watch (port 3001; frontend's default VITE_COLLAB_URL)
npm run test:run  # vitest single run
npm run build && npm start   # compile + run
docker build -t grooveboard-collab .   # container image
```

Production relay (collab-service behind Caddy, which terminates TLS):
```bash
cd deploy
docker compose up -d --build                        # serves relay.grooveboard.online
RELAY_DOMAIN=localhost docker compose up -d --build # local try-out, self-signed cert
docker compose logs -f relay
docker compose down                                  # keeps the certificate volume; never add -v on the server
```

## Development Guidelines

### Test-Driven Development
When real (non-prototype) code is added, follow TDD: write tests before implementation. Per `docs/llm-guidelines.md`, this is a hard project rule.

### Code Style
- TypeScript with strict mode
- React functional components with hooks
- Props interfaces for all components
- camelCase for variables/functions, PascalCase for components

### Patterns visible in the prototype (worth preserving in the rewrite)

1. **Lifted state** — editor state centralized in `Whiteboard`; children are dumb.
2. **Logical vs screen coordinates** — strokes stored in scale-independent page space.
3. **Snapshot-based undo/redo** — `history` array of `{paths, stickies}` + `histIdx` pointer. Single-user only: with collaborators it would undo other people's work, so multiplayer undo waits on the sync-model decision in `docs/roadmap.md`.
4. **`useLayoutEffect` for layout reads** — fit-zoom is computed sync, before paint, to avoid one-frame flashes.
5. **CSS-variable theming** — `data-theme="x"` on `<html>` swaps the whole palette.

## Planning docs

- `docs/roadmap.md`: vision, the current milestone in detail, open decisions, later phases sketched
- `docs/todo.md`: the task list (Now / Next / Risks / Someday / Done)

Don't copy plan content into this file; point to those instead.

## Wire protocol

WebSocket events, implemented in `collab-service/src/protocol.ts`:
- `draw` `{ page, stroke }` — broadcast new stroke (pixel-eraser rubs are strokes too, with `tool: 'eraser'`)
- `erase` `{ page, strokes }` — broadcast the page's surviving strokes after erasure
- `clear` `{ page }` — clear current page
- `state` `{ paths }` — server→client only, sent once on join: the board's current strokes (replay for refreshes/late joiners)
