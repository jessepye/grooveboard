# Todo: GrooveBoard

Task tracking for the current milestone. The plan behind it (phases, decisions) is in `roadmap.md`.

**Current goal:** Milestone 1. Two anonymous users on different networks draw on the same board in real time, with the backend deployed on AWS.

---

## Now

AWS setup. Decisions are made (see `roadmap.md`); these are the steps.

- [ ] Identity: permission set (AdministratorAccess), account assignment, first portal sign-in, `aws configure sso` (root is already locked down)
- [ ] Cost guardrails, the same day: monthly budgets with email alerts at $10 / $25 / $50; free-tier usage alerts on; `project=grooveboard` tag activated for cost allocation. Kill threshold: $50 in a month means tear it all down

---

## Next

### Deploy #1 (Milestone 1)
- [ ] Bump the collab-service `Dockerfile` base image from `node:20-alpine` (EOL April 2026) to `node:26-alpine`
- [ ] Add a `docker-compose.yml`: the relay plus Caddy, with Caddy terminating TLS for `relay.grooveboard.online` and proxying to port 3001; Docker log files capped
- [ ] Build and run the image locally once (it has never been built)
- [ ] EC2: one `t4g.small` (Amazon Linux 2023, arm64) in `us-east-1`, default VPC, Elastic IP, security group open on 80 and 443 only, instance role with `AmazonSSMManagedInstanceCore`, everything tagged `project=grooveboard`
- [ ] Route 53: `relay.grooveboard.online` A record → the Elastic IP
- [ ] On the instance, via Session Manager: install Docker, clone the repo, `docker compose up -d --build` with `CORS_ORIGIN=https://grooveboard.online`
- [ ] Netlify: connect the repo, base directory `frontend/`, `VITE_COLLAB_URL=https://relay.grooveboard.online`, custom domain `grooveboard.online` (records in Route 53)
- [ ] Verify two people on different networks can collaborate at `grooveboard.online`

### Milestone 2
- [ ] Yjs spike: one `Y.Doc` per board, two tabs syncing; answer how the server still enforces size and rate limits
- [ ] Move drawing state to Yjs, test-first; per-user undo via `Y.UndoManager`
- [ ] DynamoDB `BoardStore` adapter for the Yjs document, test-first; TTL 30 days after the last edit (400 KB item limit)
- [ ] GitHub Actions → AWS deploys via OIDC

---

## Risks & Mitigations (before going live)

### AWS bill surprises
- [ ] Set AWS Budget alerts at $10 / $25 / $50 with email notifications (expected spend is about $17/month)
- [ ] Cap Docker log files on the instance; if CloudWatch Logs is added later, set retention to 7 days (default is "never expire")
- [ ] Tag all resources (`project=grooveboard`) so cost explorer can attribute spend
- [x] Avoid NAT Gateway (~$32/mo idle) and idle ALBs in early phases — decided: one EC2 in a public subnet, no ALB
- [x] Commit to a hard kill threshold: $50 in a month means tear it all down

### Abuse of an open anonymous real-time service
- [x] Rate-limit per WebSocket connection (token bucket: 40 msg/s, burst 120; excess dropped)
- [x] Cap stroke payload size and points-per-stroke server-side (512 KB/message, 4000 points/stroke, full shape validation)
- [x] Cap concurrent connections per IP (20)
- [x] Use unguessable board IDs (UUIDs, not sequential) — server rejects non-UUID board ids at handshake
- [x] Don't expose a public list of boards (no endpoint lists boards; the store is keyed by unguessable UUIDs)
- [x] Add a feature flag / env var kill switch to disable new connections fast (`COLLAB_DISABLED=1`)
- [ ] Boards expire 30 days after the last edit (Milestone 2, with the DynamoDB adapter)

### Credential leaks
- [x] Never commit `.env`; add to `.gitignore` from day one
- [ ] Use an instance role on EC2, never access keys; humans sign in through Identity Center (no access keys exist)
- [x] Confirm GitHub secret scanning is on for the repo

### DDoS / network exposure
- [ ] Frontend on Netlify, whose CDN absorbs traffic spikes and DDoS for free
- [x] Decide what fronts the WebSocket service: Caddy on the instance terminates TLS; no ALB for a single instance

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
