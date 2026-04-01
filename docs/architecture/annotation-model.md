# Annotation Model (APP-006)

State
- Stored as `state.notes` entries with a `geometry` object; no new top-level array.
- Shape:
  - `note_id`: `NOTE-###`
  - `screen_id`: target screen
  - `scenario_id`: optional, current selection
  - `note_type`: `qa`
  - `body`: human-readable tag text
  - `linked_evidence_ids`: live-pane tags link the selected evidence
  - `promote_to_bug`: bool (default false)
  - `promote_to_change_request`: bool (default false)
  - `reference_version`: current screen reference version
  - `geometry`: `{ pane: 'reference'|'live', x_pct: number, y_pct: number }`
  - `created_at`, `updated_at`: timestamps

Rendering
- `renderAnnotationSurface(pane, screen, capture)` wraps each compare pane and draws `annot-dot`s from `getScreenAnnotations()` filtered by `geometry.pane`.

Events
- `bindAll('[data-annot-surface]', 'click', ...)` computes relative coordinates and appends a new note with `geometry`.
- `bindAll` was upgraded to pass the DOM event to handlers; existing handlers ignore the extra arg.

Migration
- `ensureStateShape` already maintains `notes: []`. Geometry presence marks an item as an annotation.

APP-006 additions
- UI selection: `ui.selectedNoteId` tracks the currently selected annotation for editing.
- Edit/remove: clicking an `annot-dot` selects it; actions are handled via `data-action="annot-save|annot-delete|annot-close"`.
- Filtering: `ui.noteFilters.geometry` adds `all|with|without` to filter notes by geometry presence.

## APP-006 Additions
- Inline actions on markers: edit body, delete note.
- Notes filtering: geometry filter flag in ui.noteFilters (all|with|without).
- A note is considered geometric when it has a geometry object with a pane.

## APP-007 Additions
- Detail drawer: `ui.selectedNoteId` drives a contextual editor rendered by `renderAnnotationActionsPanel()`.
- Evidence linking: the drawer surfaces screen-scoped evidence with checkboxes; updates persist to `linked_evidence_ids`.
- Quick promote: drawer exposes `annot-promote-bug` / `annot-promote-change` toggles; optional quick-create buttons call existing `createBug()` and `createChangeRequest()` with annotation context.
- Menu fallback: the tiny `annot-menu` remains unused once the drawer is present; selection highlights the dot and shows the drawer instead.

## APP-008: Mismatch Clusters
Computation
- Derived at render time; no new state persisted.
- Group key: `screen_id` + 10%-grid bucket of `(x_pct, y_pct)` from `geometry`.
- Panes are merged; a cluster may be 레퍼런스, 라이브, or 양면 depending on member notes.

Actions
- Batch toggle: set/unset `promote_to_bug` or `promote_to_change_request` for all notes belonging to a cluster.
- Batch create: one consolidated Bug or Change Request referencing the cluster coordinates and note count; uses existing `createBug()` / `createChangeRequest()` with a temporary screen selection.

UI
- Renders as cards under the Notes view with counts and quick actions; sorted by note count.

## APP-009: Issue-Aware Clusters
- `computeMismatchClusters()` remains note-geometry based; a derived `augmentMismatchClustersWithIssues()` overlays related Bugs and Change Requests using `screen_id`.
- UI badges show `연결 버그` and `연결 현행화` counts per cluster.
- Batch triage handlers delegate via root click delegation and call `commit()` after status cycles to persist and re-render.

## APP-011: Cluster Board Finalization
- No new persisted state; clusters remain derived at render time (computeMismatchClusters()).
- Batch triage is implemented via click delegation and in-memory mutation followed by commit().
- UI is available under the shell’s Clusters view; badges summarize pane coverage, note counts, and related issue counts.
- Matches APP-008/009 behavior; this slice integrates and stabilizes it in the lightweight app shell.
- Verification: 
ode --check ship-sentinel\app\app.js.

## APP-012: Board + Batch Actions Stabilized
- Finalized the mismatch cluster board within the lightweight shell and ensured batch actions (candidate toggles, bundled create, linked issue status cycles) match APP-008/009 behavior.
- No schema changes; clusters remain derived at render time from state.notes.geometry with 10% bucketing, merged panes, and screen-level issue overlays.
- Navigation: accessible under the shell’s "불일치 클러스터" nav item.
- Verification: 
ode --check ship-sentinel\\app\\app.js.

## APP-021: Session App Validation & Stabilization
- Validated mismatch cluster board behavior in the session-centered app: cluster grouping (screen + 10% buckets), merged panes, issue overlays by `screen_id`.
- Ensured parity between per‑cluster actions and board toolbar; selection pruning and clearing on navigation confirmed.
- No schema changes; selection remains ephemeral UI state (`selectedClusters`).
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-02).

## APP-022: Final Polish — Mismatch Cluster Board & Batch Actions
- Aligned labels, disabled-state logic, and selection count display between toolbar and per‑card actions; documentation synced with session-centered integration.
- No new persisted state or APIs; clusters remain derived at render time; selection is UI-only.
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-02).

## APP-013: Board + Batch Actions (Shell)
- Final pass validated computeMismatchClusters() + issue overlays in the lightweight shell.
- No new persisted state; all actions mutate in-memory demo state and re-render via commit().
- Sorted-by-density cards ease batch triage and reduce repeated handoffs.
- Verification: 
ode --check ship-sentinel\\app\\app.js (OK on 2026-04-01).
## APP-015: Board-Level Selection UX
- No schema changes; selection remains ephemeral UI state (`selectedClusters`).
- Cluster cards now render a checkbox bound to `data-action="cluster-select"`; board toolbar operates across this selection.
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-01).

## APP-016: Mismatch Cluster Board + Batch Actions
- Unified semantics between per-cluster actions and the board-level toolbar.
- Board toolbar operates over the current selection (`selectedClusters`) with the same verbs as per-card actions:
  - 후보 토글(버그/현행화)
  - 묶음 생성(버그/현행화)
  - 연결 이슈 상태 순환(버그/현행화)
- Selection is ephemeral UI state only; clusters remain derived at render time.
- Toolbar shows “선택 N / 총 M” and provides 전체 선택/선택 해제 controls.
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-01).


## APP-017: Cluster Board Consistency
- No schema changes; mismatch clusters remain derived (screen_id + 10% buckets of geometry.x_pct/y_pct) and are not persisted.
- UI hygiene: board-level selection is cleared when leaving the Clusters view; hidden toolbar buttons are disabled when nothing is selected; selection is pruned when clusters change.
- Purpose: keep batch triage consistent with board semantics and reduce repeated handoff friction.

## APP-020: Mismatch Cluster Board + Batch Actions (Final)
- Session-centered app integration complete: cluster board renders under Notes view via DOM injection after main render.
- One-time delegated handlers (egisterClusterBoardHandlers) wire both per-cluster (cluster-*) and board-level (oard-*) actions.
- Board-level multi-select maintained in ephemeral UI (selectedClusters); selection pruned on re-render and cleared when leaving Notes.
- No schema changes: clusters remain derived at render from state.notes geometry using 10% buckets; panes merged; related issue counts overlay by screen_id.
- Verification: 
ode --check ship-sentinel\\app\\app.js.

## APP-024: Mismatch Cluster Board — Alignment & Final Checks
- End-to-end verification in the session-centered app (Notes view): per‑card actions and board‑level multi‑select execute identical batch verbs (candidate toggles, bundled create, linked issue status cycles).
- Selection hygiene reconfirmed: prunes to visible clusters, clears on leaving Notes; toolbar buttons disable with 0 selected.
- No schema/API changes; clusters remain derived at render from state.notes.geometry using 10% buckets; selection is ephemeral UI state (selectedClusters).
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-02).
## APP-033: Board-Level Handler Alignment
- Consolidated mismatch cluster board event handling: a single delegated listener now routes all board-level actions (select/clear, candidate toggles, batch create, status cycles) ahead of cluster-specific handlers.
- Prevents unreachable duplicates and keeps toolbar state updates consistent with selection hygiene (prune on re-render, clear on view change, disabled when empty).
- No schema or API changes; clusters remain derived at render from state.notes.geometry with 10% bucketing.
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-02).
