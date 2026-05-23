# collab-service

GrooveBoard's real-time **Collaboration Service** (Phase 1). A stateless
WebSocket relay built on [Socket.IO](https://socket.io/): clients connect with a
board id and the server broadcasts their drawing events to every other client on
that same board. No persistence — boards are ephemeral.

## Protocol

Connect with the board id in the handshake query:

```
ws://<host>/?board=<boardId>
```

A connection with no board id is rejected (nowhere to route it).

Relayed events (broadcast to peers on the same board, sender excluded):

| Event   | Payload (example)                          | Meaning                          |
| ------- | ------------------------------------------ | -------------------------------- |
| `draw`  | `{ page, stroke }`                         | A new stroke was drawn           |
| `erase` | `{ page, strokes }`                        | Updated strokes after an erasure |
| `clear` | `{ page }`                                 | Clear a page                     |

Payloads are opaque JSON to the relay (Socket.IO's default encoding); their
shape is owned by the frontend's drawing model.

## Commands

```bash
npm install
npm run dev        # tsx watch (hot reload)
npm test           # vitest (watch)
npm run test:run   # vitest single run
npm run typecheck  # tsc --noEmit
npm run build      # tsc -> dist/
npm start          # node dist/index.js
```

`PORT` env var sets the listen port (default `3001`). `GET /health` returns
`{"status":"ok"}`.

## Not yet done

- Dockerfile
- Abuse mitigations: per-connection rate limits, stroke payload/size caps,
  per-IP connection caps (see `docs/todo.md` → Risks)
