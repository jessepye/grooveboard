# Project Roadmap: GrooveBoard

**Vision:** An extremely simple, instant-access, real-time collaborative whiteboard, built on a scalable and fault-tolerant cloud-native architecture, with options for user accounts and a premium ad-free experience. Designed for ease of use, even for younger users, by maintaining a single, non-zoomable page interface.

---

## Phase 1: Core Drawing & Real-time Anonymous Collaboration Foundation

**Goal:** Two anonymous users open a unique board URL and see each other's strokes and erasures in real-time. Backend service is containerized and running on AWS.

### Frontend (ultra-simple)

- canvas with multiple pages.
- Only zoomable to a few simple preset values: fit to page, 100%, 200%
- Pen tool: freehand lines (default color/thickness).
- Eraser tool. (Stroke and pixel)
- Text
- Sticky Notes
- Laser pointer (similar to pen but disappears after a few seconds)
- Clear board.
- Web client connects to the WebSocket service and renders incoming drawings.
- Stack: React + TypeScript.

### Backend & infrastructure

- **Collaboration Service** (microservice 1): WebSocket service that broadcasts drawing data (coordinates, tool actions) to clients on the same board. Containerized via Docker.
- **AWS:** basic VPC, EC2 (or ECS for the service initially; Kubernetes deferred to Phase 2), security groups.
- **Frontend hosting:** static assets on S3.

### User experience

- Visiting the site puts you instantly on a new, unique, shareable whiteboard.
- No accounts.

---

## Phase 2: Scalability, Board Persistence & Basic Ad Integration

**Goal:** Run on Kubernetes. Anonymous users get semi-persistent boards via unique IDs. Ads displayed.

### Persistence

- Memorable, unique URL per board (still anonymous).
- **Persistence Service** (microservice 2): saves/loads board state to a database (DynamoDB or RDS). Containerized.

### Kubernetes (EKS)

- Set up an EKS cluster.
- Deploy Collaboration Service and Persistence Service to EKS.
- Standard primitives: deployments, services, ingress.

### Monetization (initial)

- Integrate an ad network (e.g., Google AdSense) on the whiteboard page for all users.

---

## Phase 3: User Accounts & Premium Features

**Goal:** Optional accounts with saved boards. Paid tier removes ads.

### Authentication

- **Auth Service** (microservice 3): registration and login (AWS Cognito or a hosted provider; rolling our own only if there's a clear reason).
- Containerized and deployed to EKS.

### Account features

- Registered users save boards to their account.
- Dashboard listing saved boards.
- Optional user-specific settings (default pen color, etc.).

### Subscriptions

- **Subscription Service** (microservice 4) or third-party integration (Stripe, Paddle).
- Manage ad-free subscriptions.
- Conditional ad display: hide ads for active subscribers.

---

## Phase 4: Production Readiness

**Goal:** Monitored, optimized, secure, resilient.

### Observability

- Centralized logging (CloudWatch Logs, OpenSearch, or equivalent).
- Metrics and alerting (CloudWatch, Prometheus/Grafana).
- Distributed tracing (OpenTelemetry).

### Performance

- Identify and address bottlenecks in frontend and backend.
- Database query optimization.
- CDN for static assets (CloudFront).

### Cost & security

- Review and optimize AWS resource usage.
- Regular security audits and dependency scanning.
- WAF (e.g., AWS WAF).

### Kubernetes maturity

- Horizontal Pod Autoscaling.
- Service mesh only if complexity warrants (Istio/Linkerd).

### Delivery

- Mature CI/CD pipelines.
- Infrastructure as Code (Terraform or CloudFormation).
