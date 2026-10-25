# Todo: GrooveBoard

Task tracking for the current milestone. The plan behind it (phases, open decisions) is in `roadmap.md`.

**Current goal:** Milestone 1. Two anonymous users on different networks draw on the same board in real time, with the backend deployed on AWS.

---

## Now

The deploy decisions, in order. Each one gates part of Deployment below.

- [ ] AWS account and identity: root-user hygiene; IAM Identity Center or access keys for daily CLI use
- [ ] Cost guardrails, set up the same day as the account: budget alert amounts, log retention, resource tags, a tear-it-all-down threshold
- [ ] Where the relay runs: EC2 or ECS Fargate
- [ ] Where the frontend lives: S3 + CloudFront, or Vercel/Netlify
- [ ] TLS for `wss://`: what terminates it (follows from the relay hosting choice)
- [ ] Board retention: how long an untouched board lives before expiring
- [ ] Deploy credentials: manual deploys first, or GitHub Actions → AWS via OIDC now

---

## Next

### Deployment
- [ ] Build the collab-service Docker image locally (never built yet)
- [ ] Deploy the relay with TLS
- [ ] Host the frontend; point `VITE_COLLAB_URL` at the relay
- [ ] DynamoDB `BoardStore` adapter, TDD: one item per page (400 KB item limit), TTL attribute for expiry, debounced saves
- [ ] Verify two people on different networks can collaborate at the deployed URL

### Decide before building much more (see `roadmap.md` → Open decisions)
- [ ] Sync model: per-stroke operations, or a CRDT (Yjs)? Spike before the DynamoDB adapter
- [ ] Audience and monetization: under-13 users (COPPA), ads, and board safety features

---

## Risks & Mitigations (before going live)

### AWS bill surprises
- [ ] Set AWS Budget alerts at $5 / $20 / $50 with email notifications
- [ ] Set CloudWatch Logs retention to 7 days (default is "never expire")
- [ ] Tag all resources (`project=grooveboard`) so cost explorer can attribute spend
- [ ] Avoid NAT Gateway (~$32/mo idle) and idle ALBs in early phases — start with a single small EC2
- [ ] Mentally commit a hard kill threshold (e.g. "if bill > $X, tear it all down")

### Abuse of an open anonymous real-time service
- [x] Rate-limit per WebSocket connection (token bucket: 40 msg/s, burst 120; excess dropped)
- [x] Cap stroke payload size and points-per-stroke server-side (512 KB/message, 4000 points/stroke, full shape validation)
- [x] Cap concurrent connections per IP (20)
- [x] Use unguessable board IDs (UUIDs, not sequential) — server rejects non-UUID board ids at handshake
- [x] Don't expose a public list of boards (no endpoint lists boards; the store is keyed by unguessable UUIDs)
- [x] Add a feature flag / env var kill switch to disable new connections fast (`COLLAB_DISABLED=1`)
- [ ] Boards expire after a period of no edits (see the retention decision in Now)

### Credential leaks
- [x] Never commit `.env`; add to `.gitignore` from day one
- [ ] Prefer IAM roles on EC2/ECS over long-lived access keys
- [x] Confirm GitHub secret scanning is on for the repo

### DDoS / network exposure
- [ ] Front static assets with CloudFront (or use Vercel/Netlify) for free Shield Standard
- [ ] Decide what fronts the WebSocket service (direct with TLS on the instance, ALB, or CloudFront); a single instance may not need an ALB yet

---

## Someday / Maybe

### Persistence & boards
- Memorable board URLs (instead of raw UUIDs)
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
- Shape tool
- Multiple page sizes / themes (already in prototype via tweaks panel)

### Production hardening
- Security audit, dependency scanning
- WAF
- Cost review
- Service mesh (Istio/Linkerd) — only if complexity warrants

---

## Done

- Initial design prototype committed (`grooveboard-claude-design/`, May 2026)
- Roadmap drafted; reorganized to plan one milestone in detail (Oct 2026)
- Frontend: Vite + React + TypeScript with Vitest + React Testing Library, now React 19 / Vite 8 / TS 6 on Node 26; prototype's drawing surface and floating toolbar ported test-first (pen, highlighter, pixel and whole-stroke eraser, clear, color/size and eraser-mode popovers); Socket.IO client wired up (Jun–Oct 2026)
- Collab service: validating Socket.IO relay, test-first, with rate limiting, payload/point/connection caps, UUID-only board ids, `COLLAB_DISABLED` kill switch, multi-stage Dockerfile (Jul 2026)
- Persistence pulled into Phase 1: server-held board state with replay on join and reconnect, `BoardStore` seam with an in-memory LRU implementation, 4000-strokes-per-page cap (Jul 2026)
- Two browser tabs collaborating live, verified locally (Jul 2026)
- `.gitignore`, GitHub secret scanning
- Branches consolidated into `main`; superseded PRs closed (Oct 2026)
