# Doc Frontend Chat Design

**Date:** 2026-03-04
**Scope:** Build a GPT-like React frontend for `doc-ai-agent` chat capability, local-first development with future online deployment.

## 1. Architecture

- Frontend stack: `React + Vite + TypeScript + Zustand`.
- Local integration: frontend sends `/api/chat`; Vite dev server proxies to `http://127.0.0.1:8000/chat`.
- Layering:
  - `ui`: session sidebar, chat panel, composer, evidence panel
  - `state`: global session/message state via Zustand
  - `services`: API client, request timeout handling, typing-style stream simulation
- Future online release path:
  - Keep UI/state stable
  - swap API base via env and/or reverse proxy
  - add backend CORS later if browser direct calls are needed

## 2. Components And Data Flow

### 2.1 Layout

- Left: `SessionSidebar` (new session, session list, session switch)
- Center: `ChatPanel` (render messages in GPT-like style)
- Bottom: `Composer` (multi-line input, send action)
- Right: `EvidencePanel` (render `mode`, `data`, `evidence` from assistant responses)

### 2.2 State Model

- `sessions`: `Session[]`
- `activeSessionId`: current session id
- `ui`: `isSending`, `error`, `showEvidence`

`Session`:
- `id`, `title`, `createdAt`, `updatedAt`, `messages`

`Message`:
- `id`, `role` (`user | assistant`), `content`, `status` (`pending | streaming | done | error`), `meta` (`mode`, `data`, `evidence`)

### 2.3 Send Flow

1. User sends prompt.
2. Append one `user` message.
3. Insert placeholder `assistant` message with `streaming` status.
4. Request `/api/chat` with `{ question }`.
5. Receive full answer and progressively append text chunks for streaming-like UX.
6. Finalize assistant message with `done` status and attach `mode/data/evidence`.

### 2.4 Persistence

- Use `localStorage` to persist `sessions` and `activeSessionId`.
- Restore on app start.

## 3. Error Handling

- Empty input blocked before submit.
- In-flight request disables submit to avoid message ordering issues.
- Timeout (e.g., 30s) shows explicit timeout message.
- Network/HTTP failures mark current assistant message as `error` and provide retry action.

## 4. UX Details

- `Enter` to send, `Shift+Enter` for newline.
- Auto-scroll to bottom unless user is actively reviewing older messages.
- Session title auto-derived from first user message (trimmed).

## 5. Testing Strategy

- Unit tests (`Vitest`) for store and reducers-like state operations.
- Component tests (`React Testing Library`) for:
  - send flow
  - error flow
  - evidence panel rendering
- Local integration verification against live `doc-ai-agent` `/chat` endpoint.

## 6. Non-goals (Current Iteration)

- No authentication/authorization.
- No multi-user cloud sync.
- No real token streaming from backend (simulated streaming only).
