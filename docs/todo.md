# Todo: GrooveBoard - Milestone 1

**Goal:** Establish the simplest possible drawing functionality shared in real-time between anonymous users, with an initial focus on backend architecture.

---

## Currently Working On

* [x] Define initial frontend structure (React/TypeScript).
* [x] Create placeholder files for core frontend components (`App.tsx`, `Toolbar.tsx`, `Board.tsx`, `CanvasPage.tsx`) and basic CSS.
* [x] **Implement Basic Frontend Component UI & State:**
    * Lay out the basic UI for `Toolbar`, `Board`, and `CanvasPage`.
    * Set up initial state management (e.g., selected tool) within components or using React Context.

---

## Immediate Next Steps

### Frontend (Ultra Simple)

* **Canvas & Drawing Logic:**
    * [x] Implement the non-zoomable HTML5 canvas in `CanvasPage.tsx`.
    * [x] **Pen Tool:** Implement freehand line drawing on the canvas (with default color/thickness).
    * [x] **Eraser Tool:** Implement basic erasing functionality on the canvas.
    * [x] **Clear Board Button:** Implement functionality for the "Clear Board" button in `Toolbar.tsx` to clear the canvas.
    * *Note: Remember to apply Test-Driven Development (TDD) principles when implementing these features.*
* **Multi-page Canvas (Conceptual/Basic Setup):**
    * [x] implement basic state/logic for handling multiple pages/canvases per board (even if only one is visible at a time initially).
* **WebSocket Integration (Frontend Side):**
    * [x] Install `socket.io-client`.
    * [ ] Implement logic to connect to the backend WebSocket Collaboration Service.
    * [ ] Send drawing/erasing/clearing actions to the backend via WebSocket.
    * [ ] Receive drawing/erasing/clearing actions from the backend and render them on the canvas.

### Backend (Collaboration Service & AWS)

* **AWS Setup (Initial):**
    * [ ] Set up basic VPC, EC2 instance(s), and necessary security groups.
    * [ ] Plan for S3 bucket for static frontend hosting.
* **Microservice 1: Collaboration Service (WebSocket):**
    * [ ] Develop the WebSocket service (e.g., using Node.js with Socket.IO).
    * [ ] Implement logic to handle client connections.
    * [ ] Implement real-time broadcasting of drawing data (coordinates, tool actions, clear events) to connected clients on the same "board" or session.
    * [ ] Define data serialization format for drawing data.
* **Containerization & Deployment (Initial):**
    * [ ] Create a Dockerfile for the Collaboration Service.
    * [ ] Containerize the Collaboration Service using Docker.
    * [ ] Deploy the containerized Collaboration Service to AWS (e.g., initially on a single EC2 instance or ECS).

### User Experience Focus

* [ ] Ensure users visiting the site are instantly on a new, unique, shareable whiteboard.
* [ ] Ensure no accounts are needed for this phase.

---

**Outcome for Milestone 1:** Two anonymous users can open a unique board URL and see each other's simple drawings and erasures in real-time. The backend service is containerized and running on AWS.
