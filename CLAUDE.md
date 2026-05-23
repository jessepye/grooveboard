# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GrooveBoard is a planned simple, real-time collaborative whiteboard application designed for ease of use (even for younger users). It is currently in **early Phase 1**: the visual UI exists as a prototype, but no real build pipeline, no backend, and no tests have been wired up yet. The full vision is a React/TypeScript frontend with a microservice backend on AWS — see `docs/roadmap.md`.

## Current Repo State

The repo contains:

- `grooveboard-claude-design/` — a **runnable design prototype** of the UI. Open `GrooveBoard.html` directly in a browser; no build step. It uses React 18 (UMD bundles from a CDN) plus `@babel/standalone` to compile JSX in the browser at page load. This is suitable for design iteration but **not** for production.
- `docs/` — roadmap, todos, llm-guidelines.
- `frontend/` — Vite 5 + React 18 + TypeScript scaffold. Tests via Vitest + React Testing Library (jsdom). Pinned to Vite/Vitest versions compatible with Node 18. No prototype code has been ported in yet.
- No backend code yet.

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

## Development Guidelines

### Test-Driven Development
When real (non-prototype) code is added, follow TDD: write tests before implementation. Per `docs/llm-guidelines.md`, this is a hard project rule.

### Code Style (for the real frontend, when built)
- TypeScript with strict mode
- React functional components with hooks
- Props interfaces for all components
- camelCase for variables/functions, PascalCase for components

### Patterns visible in the prototype (worth preserving in the rewrite)

1. **Lifted state** — editor state centralized in `Whiteboard`; children are dumb.
2. **Logical vs screen coordinates** — strokes stored in scale-independent page space.
3. **Snapshot-based undo/redo** — `history` array of `{paths, stickies}` + `histIdx` pointer.
4. **`useLayoutEffect` for layout reads** — fit-zoom is computed sync, before paint, to avoid one-frame flashes.
5. **CSS-variable theming** — `data-theme="x"` on `<html>` swaps the whole palette.

## Roadmap (see `docs/roadmap.md` for details)

- **Phase 1 (current):** real-time anonymous drawing. WebSocket service, containerized, on AWS.
- **Phase 2:** EKS, persistence service, ads.
- **Phase 3:** user auth, paid ad-free tier.
- **Phase 4:** observability, performance, security hardening.

### Planned WebSocket events (Phase 1)
- `draw` — broadcast new stroke
- `erase` — broadcast updated paths after erasure
- `clear` — clear current page

## Observability Stack (planned, Phase 4)

Industry-standard stack to be integrated:

- **Prometheus + M3DB** — metrics collection and long-term storage (drawing operations, sessions, WebSocket connections).
- **OpenTelemetry** — distributed tracing across frontend and future services.
- **OpenSearch** — centralized structured logging (migration target from Elastic + Splunk).
- **ClickHouse** — analytics datastore for usage and behavior queries.

Implementation order, when we get to it:
1. OpenTelemetry SDK in the frontend
2. Instrument drawing pipeline and WebSocket events
3. Replace `console.log` with structured logging
4. Prometheus metrics collection
5. OTel Collector for aggregation
6. ClickHouse schema design
