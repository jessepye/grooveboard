# Project Roadmap: GrooveBoard

**Vision:** An extremely simple, instant-access, real-time collaborative whiteboard: open a link and draw together, no accounts. Simple enough that a child could figure it out without help; intended for ages 13 and up. Later: optional accounts, saved boards, and a way to pay for it. Built cloud-native on AWS.

How this file works: the current milestone is planned in detail, the rest of the current phase is listed, and later phases are only sketched. Task-level tracking lives in `todo.md`.

---

## Phase 1: Real-time anonymous collaboration

### Milestone 1 — two people draw together on a deployed board (in progress)

**Done when:** two anonymous users on different networks open the same board URL and see each other's strokes and erasures live, and the board survives a refresh. The backend runs as a container on AWS.

Built (see `CLAUDE.md` for the details):
- `frontend/`: typed React drawing surface: pen, highlighter, pixel and whole-stroke eraser, clear, and the prototype's floating toolbar
- `collab-service/`: validating Socket.IO relay with abuse limits, and server-held board state replayed on join
- Board persistence behind the `BoardStore` interface (in memory for now). It was moved forward from Phase 2 because a student refreshing mid-lesson must not lose the board.

Remaining, all deployment (tracked in `todo.md`):
- AWS identity and cost guardrails (account and domain `grooveboard.online` exist)
- Relay on one `t4g.small` EC2 instance in `us-east-1`: Docker Compose with Caddy terminating TLS at `relay.grooveboard.online`
- Frontend on Netlify at `grooveboard.online`
- Deploy #1 keeps the in-memory board store; boards survive refreshes, not relay restarts

### Decided (Oct 2026)

- **Sync model: Yjs.** `erase` currently sends a page's full surviving stroke list, so simultaneous edits are last-write-wins, and snapshot undo would undo other people's work. Yjs (a CRDT) handles merging, per-user undo, and presence. Order: deploy #1 on the current protocol, then move to Yjs, then write the DynamoDB adapter once for the Yjs format.
- **Audience: 13 and up.** Not directed at under-13s, which keeps COPPA out of scope. No ads before accounts exist.
- **Board retention: 30 days** after the last edit (DynamoDB TTL).

### Milestone 2 — durable, conflict-free boards

- Yjs-based sync: one shared document per board, per-user undo, live cursors via presence
- DynamoDB `BoardStore` adapter storing the Yjs document, 30-day TTL
- Deploys through GitHub Actions → AWS with OIDC (no stored secrets)

### Rest of Phase 1 (after Milestone 2)

- Multiple pages per board
- Zoom presets only: fit to page, 100%, 200%
- Text, sticky notes, laser pointer (strokes that fade after a few seconds)

---

## Later phases (sketch)

- **Phase 2: Scale and durability.** Memorable board URLs. Move the relay to Kubernetes (EKS) once one service is comfortable, and split out a persistence service only if scale warrants it. Initial monetization (no ads before accounts; see the audience decision above).
- **Phase 3: Accounts and a paid tier.** Optional sign-in (Cognito or a hosted provider), saved boards, a dashboard, and a subscription (Stripe or Paddle).
- **Phase 4: Production readiness.** Observability (structured logs, metrics, OpenTelemetry tracing), performance work, CDN, WAF, security audits, cost review, autoscaling, CI/CD, infrastructure as code.
