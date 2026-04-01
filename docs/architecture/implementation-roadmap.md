# Implementation Roadmap

## Current status

- Phase 1 complete
- Phase 2 started with a real interactive app shell under `ship-sentinel/app`
- current working surfaces: intake, overview, QA session, maintenance, deliverables
- current working interactions: screen selection, scenario selection, scenario status updates, capture inbox selection, quick bug creation, change request creation, package confirmation, JSON export
- browser persistence added: `localStorage` autosave, JSON import, reset-to-demo
- helper bridge mock added: `window.postMessage`, `CustomEvent`, and `paste` ingress hooks create evidence and inbox items in the active session
- session context upgraded: selected evidence preview, screen-level QA notes, helper endpoint and bind-to-screen controls
- note-first flow added: screen note can be promoted into bug or change-request drafts
- localhost helper handshake added: `health` and `session-bind` flow with mock server scaffold
- local autonomy loop added: backlog, state, and next-slice brief generation for unattended continuation prep
- intake can now create a fresh audit run and write a local run JSON file
- helper localhost queue flow added: simulate push, pending claim, and app-side auto polling
- export pipeline now accepts live app state, file-backed run JSON, and demo-state.js as inputs
- file-backed store now separates demo seed, run files, and generated run library index
- note board added as a dedicated support surface with filters and screen jump actions
- saved run payload manifest now lets the app switch audits from local generated data
- export package metadata and evidence bundle manifest added for deterministic delivery packaging
- helper event log and receipt board added for ingestion trust and operator visibility
- local autonomous executor scaffold added for deterministic recipe execution and receipt logging
- keyboard-first QA action layer added for screen/scenario/capture navigation and quick registration
- autonomy cycle runner added to chain claim, execution, codex dispatch, and cycle receipts without chat input
- watch launcher and Windows scheduled-task scaffold added for unattended local continuation
- app-side autonomy control center added to expose heartbeat, slice state, and recent receipts
- current-user Startup launcher installed for logon-time autonomy watch start

## Phase 1. Operational prototype

- static landing
- static workspace
- spreadsheet export
- product and UX docs

## Phase 2. Real audit workspace

- audit creation UI
- screen and scenario CRUD
- issue and evidence CRUD
- export from real app data

## Phase 3. Windows helper MVP

- clipboard watcher
- screenshot folder watcher
- upload to active audit
- local retry queue

## Phase 4. Reference linkage

- screen ID mapping
- PDF parser
- Figma link mapping
- reference version history

## Phase 5. Current-state maintenance

- change request board
- revised artifact upload
- package rebundling

## Phase 6. Automation assist

- scenario draft assist
- severity suggestions
- spec drift hinting
- selective regression support
