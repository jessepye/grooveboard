# Todo: GrooveBoard

**Vision:** real-time collaborative whiteboard, ultra-simple UI, scalable backend. See `roadmap.md` for the long-term backlog.

**Current goal:** finish Milestone 1 — two anonymous users can draw on the same board in real-time, with the backend deployed remotely.

---

## Now

- [x] Update `CLAUDE.md` and `docs/todo.md` to reflect actual repo state

---

## Next

### Frontend foundation
- [x] Decide build tooling: Vite + TypeScript (CRA is deprecated)
- [x] Scaffold a real `frontend/` directory (Vite 5 + React 18 + TS)
- [x] Set up Vitest + React Testing Library (switched from Jest — native Vite integration)
- [x] Port the design prototype's `Whiteboard` + `DrawCanvas` + `Toolbar` into typed React components (`frontend/src/drawing/`). Tool set scoped to pen/highlighter/eraser; select/sticky/text/shape/laser, stickies, live cursors, page nav still deferred
- [x] Write tests for pen/eraser/clear before porting drawing logic (TDD)
- [x] Replace `window.X` globals with proper ES module imports (ported `frontend/` code is all ES modules; remaining globals are in the prototype design artifact only)

### Backend (Collaboration Service)
- [ ] Pick stack (Node + Socket.IO is the path of least resistance, matches the frontend)
- [ ] Implement WebSocket server: connect, broadcast `draw`/`erase`/`clear` to peers on the same board
- [ ] Decide data serialization (JSON for now; revisit if perf becomes an issue)
- [ ] Dockerfile for the service
- [ ] Run frontend + backend together locally; two browser tabs drawing on each other's boards

### Deployment
- [ ] Pick hosting (single EC2 vs. ECS Fargate — start with whichever is simpler)
- [ ] Deploy containerized service
- [ ] Host static frontend (S3 + CloudFront, or Netlify/Vercel as an interim option)
- [ ] Verify two users at the deployed URL can collaborate

---

## Risks & Mitigations (before going live)

### AWS bill surprises
- [ ] Set AWS Budget alerts at $5 / $20 / $50 with email notifications
- [ ] Set CloudWatch Logs retention to 7 days (default is "never expire")
- [ ] Tag all resources (`project=grooveboard`) so cost explorer can attribute spend
- [ ] Avoid NAT Gateway (~$32/mo idle) and idle ALBs in early phases — start with a single small EC2
- [ ] Mentally commit a hard kill threshold (e.g. "if bill > $X, tear it all down")

### Abuse of an open anonymous real-time service
- [ ] Rate-limit per WebSocket connection (messages/sec and bytes/sec)
- [ ] Cap stroke payload size and points-per-stroke server-side
- [ ] Cap concurrent connections per IP
- [ ] Use unguessable board IDs (UUIDs, not sequential)
- [ ] Don't expose a public list of boards
- [ ] Add a feature flag / env var kill switch to disable new connections fast
- [ ] Keep boards ephemeral in Phase 1 — no persistence shrinks abuse and legal surface

### Credential leaks
- [x] Never commit `.env`; add to `.gitignore` from day one
- [ ] Prefer IAM roles on EC2/ECS over long-lived access keys
- [x] Confirm GitHub secret scanning is on for the repo

### DDoS / network exposure
- [ ] Front static assets with CloudFront (or use Vercel/Netlify) for free Shield Standard
- [ ] Put the WebSocket service behind an ALB or CloudFront

### Hosting split to shrink AWS surface
- [ ] Consider deploying the frontend on Vercel/Netlify (free tier) and only the WebSocket service on AWS

---

## Someday / Maybe

### Persistence & boards
- Unique shareable board URLs (anonymous, persistent)
- Board state save/load (DynamoDB or RDS)
- Board metadata (title, last-edited timestamp)

### Infrastructure
- Migrate to EKS once one service feels comfortable
- Horizontal Pod Autoscaling
- CDN for static assets (CloudFront)
- Infrastructure as Code (Terraform)
- CI/CD pipeline

### User accounts
- Auth (consider Clerk/Auth0/Supabase before rolling own)
- User dashboard of saved boards
- User-specific defaults (pen color, etc.)

### Monetization
- AdSense integration
- Stripe subscription for ad-free tier
- Conditional ad display logic

### Observability
- Structured logging (replace `console.log`)
- OpenTelemetry SDK in frontend + backend
- Prometheus metrics
- OTel Collector
- ClickHouse for behavioral analytics
- OpenSearch for log aggregation

### Drawing features (deferred from prototype)
- Highlighter tool
- Shape tool
- Sticky notes (already in prototype, needs porting)
- Undo/redo (already in prototype as snapshot stack)
- Multiple page sizes / themes (already in prototype via tweaks panel)

### Production hardening
- Security audit, dependency scanning
- WAF
- Cost review
- Service mesh (Istio/Linkerd) — only if complexity warrants

---

## Done

- Initial design prototype committed (`grooveboard-claude-design/`, May 2026)
- Project roadmap drafted (`docs/roadmap.md`)
- Observability stack plan documented (`CLAUDE.md`)
