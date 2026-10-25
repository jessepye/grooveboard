# Project Roadmap: GrooveBoard

**Vision:** An extremely simple, instant-access, real-time collaborative whiteboard, usable by an 11-year-old: open a link and draw together, no accounts. Later: optional accounts, saved boards, and a way to pay for it. Built cloud-native on AWS.

How this file works: the current milestone is planned in detail, the rest of the current phase is listed, and later phases are only sketched. Task-level tracking lives in `todo.md`.

---

## Phase 1: Real-time anonymous collaboration

### Milestone 1 — two people draw together on a deployed board (in progress)

**Done when:** two anonymous users on different networks open the same board URL and see each other's strokes and erasures live, and the board survives a refresh. The backend runs as a container on AWS.

Built (see `CLAUDE.md` for the details):
- `frontend/`: typed React drawing surface: pen, highlighter, pixel and whole-stroke eraser, clear, and the prototype's floating toolbar
- `collab-service/`: validating Socket.IO relay with abuse limits, and server-held board state replayed on join
- Board persistence behind the `BoardStore` interface (in memory for now). It was moved forward from Phase 2 because a student refreshing mid-lesson must not lose the board.

Remaining, all deployment (tracked in `todo.md` → Deployment):
- AWS account, identity, and cost guardrails
- Relay hosting (EC2 or ECS Fargate) with TLS (`wss://`)
- Frontend hosting (S3 + CloudFront, or Vercel/Netlify)
- DynamoDB `BoardStore` adapter with TTL-based expiry

### Open decisions (settle before building much more)

- **Sync model.** `erase` sends a page's full surviving stroke list, so simultaneous edits are last-write-wins, and snapshot undo would undo other people's work. Options: per-stroke operations (`deleteStroke(id)`), or a CRDT such as Yjs, which handles merging, per-user undo, and presence. Decide before the DynamoDB adapter, because it changes what gets stored.
- **Audience and monetization.** If children under 13 are the audience, COPPA restricts ads aimed at them, and anonymous shared boards need safety features (expiry, owner lock/kick, reporting). This affects Phase 2's ads plan.

### Rest of Phase 1 (after Milestone 1)

- Multiple pages per board
- Zoom presets only: fit to page, 100%, 200%
- Text, sticky notes, laser pointer (strokes that fade after a few seconds)
- Undo/redo (shape depends on the sync-model decision)
- Live collaborator cursors (a new presence event)

---

## Later phases (sketch)

- **Phase 2: Scale and durability.** Memorable board URLs. Move the relay to Kubernetes (EKS) once one service is comfortable, and split out a persistence service only if scale warrants it. Initial monetization, subject to the audience decision above.
- **Phase 3: Accounts and a paid tier.** Optional sign-in (Cognito or a hosted provider), saved boards, a dashboard, and a subscription (Stripe or Paddle).
- **Phase 4: Production readiness.** Observability (structured logs, metrics, OpenTelemetry tracing), performance work, CDN, WAF, security audits, cost review, autoscaling, CI/CD, infrastructure as code.
