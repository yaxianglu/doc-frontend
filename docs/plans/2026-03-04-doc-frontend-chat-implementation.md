# Doc Frontend GPT-like Chat Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a React + TypeScript frontend in `doc-frontend` that provides GPT-like chat UX on top of `doc-ai-agent /chat`, including session list, local persistence, simulated streaming output, and evidence panel.

**Architecture:** Use Vite React TS as the app shell. State is centralized with Zustand and persisted with localStorage. UI is split into sidebar/chat/composer/evidence panels. API calls are wrapped in a service with timeout and response mapping, then rendered through a stream-simulation writer for assistant messages.

**Tech Stack:** React 18, TypeScript, Vite, Zustand, Vitest, React Testing Library

---

### Task 1: Scaffold Frontend Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/vite-env.d.ts`

**Step 1: Create Vite React TS app files**

Create the minimum Vite React TypeScript project with npm scripts:
- `dev`, `build`, `preview`, `test`

**Step 2: Add Vite proxy for local backend**

In `vite.config.ts`, proxy `/api` -> `http://127.0.0.1:8000` and rewrite `/api/chat` to `/chat`.

**Step 3: Run install**

Run: `npm install`
Expected: dependencies installed without errors.

**Step 4: Start app smoke check**

Run: `npm run dev`
Expected: Vite starts and serves the app.

**Step 5: Commit**

```bash
git add package.json tsconfig.json vite.config.ts index.html src

git commit -m "chore: scaffold react ts frontend with vite proxy"
```

### Task 2: Define Core Types And API Contract

**Files:**
- Create: `src/types/chat.ts`
- Create: `src/services/chatApi.ts`
- Test: `src/services/chatApi.test.ts`

**Step 1: Write failing API mapping test**

Add tests for:
- request body `{ question: string }`
- response mapping for `answer`, `mode`, `data`, `evidence`
- timeout rejection path

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/services/chatApi.test.ts`
Expected: FAIL due to missing implementation.

**Step 3: Write minimal API implementation**

Implement `sendChat(question, signal?)` using `fetch('/api/chat')` and strict runtime checks.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/services/chatApi.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/types/chat.ts src/services/chatApi.ts src/services/chatApi.test.ts

git commit -m "feat: add typed chat api client with timeout/error mapping"
```

### Task 3: Build Zustand Chat Store With Persistence

**Files:**
- Create: `src/store/chatStore.ts`
- Test: `src/store/chatStore.test.ts`

**Step 1: Write failing store tests**

Cover:
- create/switch session
- append user message
- insert/update assistant streaming message
- mark error and retry setup
- localStorage persistence/hydration

**Step 2: Run tests to verify they fail**

Run: `npm run test -- src/store/chatStore.test.ts`
Expected: FAIL due to missing store.

**Step 3: Implement minimal Zustand store**

Implement typed state/actions and persistence via `zustand/middleware` persist.

**Step 4: Re-run tests**

Run: `npm run test -- src/store/chatStore.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/store/chatStore.ts src/store/chatStore.test.ts

git commit -m "feat: implement chat session store with persistence"
```

### Task 4: Implement Streaming Simulation Service

**Files:**
- Create: `src/services/streamWriter.ts`
- Test: `src/services/streamWriter.test.ts`

**Step 1: Write failing tests**

Test chunking behavior:
- writes content in increments
- supports cancel/abort
- calls completion callback

**Step 2: Run tests to verify failure**

Run: `npm run test -- src/services/streamWriter.test.ts`
Expected: FAIL.

**Step 3: Implement minimal stream writer**

Implement `simulateStream(text, onChunk, onDone, options)` with interval and chunk size.

**Step 4: Re-run tests**

Run: `npm run test -- src/services/streamWriter.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/services/streamWriter.ts src/services/streamWriter.test.ts

git commit -m "feat: add assistant text stream simulation utility"
```

### Task 5: Build GPT-like UI Components

**Files:**
- Create: `src/components/SessionSidebar.tsx`
- Create: `src/components/ChatPanel.tsx`
- Create: `src/components/Composer.tsx`
- Create: `src/components/EvidencePanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/components/ChatUI.test.tsx`

**Step 1: Write failing component tests**

Cover:
- input + send flow
- disabled send while pending
- evidence panel display after response
- keyboard behavior Enter / Shift+Enter

**Step 2: Run tests and confirm fail**

Run: `npm run test -- src/components/ChatUI.test.tsx`
Expected: FAIL.

**Step 3: Implement components and compose in App**

Wire components to store actions/selectors. Ensure responsive layout for desktop/mobile.

**Step 4: Re-run component tests**

Run: `npm run test -- src/components/ChatUI.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components src/App.tsx src/styles.css src/components/ChatUI.test.tsx

git commit -m "feat: add gpt-like chat ui with evidence panel"
```

### Task 6: Integrate End-to-End Send Flow

**Files:**
- Create: `src/hooks/useChatActions.ts`
- Modify: `src/App.tsx`
- Test: `src/hooks/useChatActions.test.ts`

**Step 1: Write failing integration tests**

Cover:
- submit question -> user msg + assistant placeholder
- API success -> streamed assistant completion + metadata
- API failure -> assistant error message + retry callback

**Step 2: Run tests to verify failure**

Run: `npm run test -- src/hooks/useChatActions.test.ts`
Expected: FAIL.

**Step 3: Implement orchestration hook**

Implement async action orchestration with timeout, stream simulation, and retry support.

**Step 4: Re-run tests**

Run: `npm run test -- src/hooks/useChatActions.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/useChatActions.ts src/hooks/useChatActions.test.ts src/App.tsx

git commit -m "feat: integrate chat request lifecycle and retry flow"
```

### Task 7: Verification And Developer Docs

**Files:**
- Create: `README.md`
- Modify: `package.json`

**Step 1: Add scripts and test coverage script**

Ensure scripts include:
- `dev`, `build`, `preview`, `test`, `test:run`

**Step 2: Run full verification**

Run:
- `npm run test:run`
- `npm run build`

Expected:
- all tests pass
- production build succeeds

**Step 3: Write usage docs**

Document:
- local startup
- backend startup dependency (`doc-ai-agent`)
- proxy behavior
- future production deployment note (CORS/reverse proxy)

**Step 4: Commit**

```bash
git add README.md package.json

git commit -m "docs: add frontend runbook and integration notes"
```
