# Compare Annotations (APP-006)

Goal: Let operators tag mismatches inline on the reference/live panes in the Session view before promoting to issues or change requests.

Interaction
- Click anywhere on a compare pane to drop a numbered marker.
- Markers render per-pane (Reference vs Live) and persist in the workspace state.
- Notes board shows these as normal QA notes; promotion flows remain unchanged.

UI
- Two panes now wrap a clickable `annotation-surface` overlay with an `annotation-layer` for markers.
- Markers use compact circular badges; click on empty area to create, click on marker is ignored (no-op for now).

Verification
- Syntax check: `node --check ship-sentinel\\app\\app.js`

Out of scope
- Image diff, crop previews, and inline promote actions will land in later slices.

Updates in APP-006
- Click a marker to select it; an inline "비교 주석 편집" panel appears below the compare grid.
- Edit the note text and press 저장, or remove the marker with 주석 삭제.
- Notes board adds a 지오메트리 filter (all/with/without) to isolate geometric compare notes at scale.

## Editing & Removal (APP-006)
- Click a numbered marker to open a tiny menu near the dot.
- Choose '메모 편집' to update its body (inline prompt).
- Choose '삭제' to remove the annotation note.
- Removing an annotation only deletes that specific geometric note; it does not affect non-geometric notes or promotions already created.

## APP-007: Detail Drawer & Quick Promote
- Selecting a marker now opens a detail drawer below the compare grid.
- Edit the note text inline and press 저장 or close with 닫기.
- Link or unlink evidence captured for the same screen using checkboxes; links update `linked_evidence_ids`.
- One-click promote: toggle 버그 후보/현행화 후보 directly from the drawer. Use 버그 생성/현행화 생성 to open full issue/change records from this note.
- Keyboard/shortcuts unchanged; drawer actions are mouse-first for now.

## APP-008: Mismatch Clusters & Batch Actions
- Cluster board appears in the Notes view as "불일치 클러스터 보드".
- Clustering heuristic: group geometric notes by screen and ~10% grid of `(x_pct, y_pct)`; panes are merged so reference/live tags coalesce.
- Each cluster card shows: screen, approx coordinates, note count, pane coverage (레퍼런스/라이브/양면), and counts of bug/change candidates.
- Batch actions:
  - "버그 후보 토글(모두)": toggles `promote_to_bug` for all notes in the cluster.
  - "현행화 후보 토글(모두)": toggles `promote_to_change_request` for all notes in the cluster.
  - "버그 생성(묶음)": creates a single bug summarizing the cluster at the selected screen.
  - "현행화 생성(묶음)": creates a single change request summarizing the cluster at the selected screen.
- Verification: `node --check ship-sentinel\\app\\app.js`.

## APP-009: Issue-Aware Clusters & Batch Triage
- Cluster board now also surfaces counts of existing Bugs and Change Requests on the same screen as each geometry cluster.
- New batch actions:
  - "연결 버그 상태 순환": cycles status of related bugs (열림 → 진행중 → 닫힘 → 열림).
  - "연결 현행화 상태 순환": cycles status of related change requests (열림 → 진행중 → 닫힘 → 열림).
- Purpose: reduce repeated handoff by letting operators clear or advance groups without opening each record.
- Verification: `node --check ship-sentinel\app\app.js`.

## APP-011: Cluster Board + Batch Actions (Lightweight Shell)
- Board and batch actions are now wired into the lightweight app shell navigation ("불일치 클러스터").
- Actions use root-level click delegation (data-action="cluster-*") and operate on computed clusters without persisting extra state.
- Batch toggle and bundled create mirror APP-008; status cycle actions mirror APP-009.
- Flow mode compatible: in Flow mode, the cluster board remains accessible via nav toggle or Alt+F when needed.
- Verification: 
ode --check ship-sentinel\app\app.js (syntax OK on 2026-04-01).

## APP-012: Cluster Board in Lightweight Shell
- Location: In the lightweight app shell, the mismatch cluster board is available via the "불일치 클러스터" top nav (not nested under the Notes view).
- Actions: Batch toggle candidates, bundled create (bug/change), and related issue status cycle all operate via delegated data-action="cluster-*" handlers.
- Persistence: No new persisted state; mutations are in-memory for demo purposes and reflected immediately via re-render.
- Verification: 
ode --check ship-sentinel\\app\\app.js.

## APP-013: Mismatch Cluster Board + Batch Triage
- Confirmed cluster grouping (screen + 10% grid of x/y) merges reference/live panes; shows note counts, pane coverage, and screen-level linked issue counts.
- Batch actions available per cluster: toggle all bug/change candidates, create bundled bug/change, cycle statuses of related bugs/changes.
- Integrated in lightweight shell under "불일치 클러스터"; compatible with Flow Mode.
- Verification: 
ode --check ship-sentinel\\app\\app.js (OK on 2026-04-01).

## APP-021: Cluster Board Validation & Stabilization (Session App)
- Validated board semantics end-to-end in the session-centered app. Confirmed cluster grouping (screen + 10% geometry buckets) with merged panes.
- Ensured batch triage parity between per‑cluster and board‑level actions: 후보 토글(버그/현행화), 묶음 생성(버그/현행화), 연결 이슈 상태 순환(버그/현행화).
- Selection hygiene: prunes selection to visible clusters on re-render and clears when leaving Notes; toolbar disables with 0 selected.
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-02).

## APP-022: Mismatch Cluster Board and Batch Actions (Polish)
- Final polish pass to align labels, disabled states, and selection count display on the board toolbar with per‑card actions.
- No schema changes; clusters remain derived at render time from `state.notes.geometry` using 10% buckets; selection is UI-only.
- Documentation aligned with session-centered integration; no new code paths required beyond APP‑021.
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-02).
## APP-014: Board-Level Multi-Select for Cluster Triage
- Added board-level selection toolbar to the lightweight shell cluster board.
- Operators can select multiple clusters and run batch actions across them:
  - 전체 선택 / 선택 해제
  - 버그 후보 토글(선택) / 현행화 후보 토글(선택)
  - 버그 생성(선택 묶음) / 현행화 생성(선택 묶음)
  - 연결 버그 상태 순환(선택) / 연결 현행화 상태 순환(선택)
- Selection is ephemeral UI state (`selectedClusters`) and does not persist.
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-01).

## APP-015: Board-Level Selection UX
- Each cluster card now includes a checkbox to select it for board-level batch actions.
- Selected clusters gain a subtle highlight; selection lives only in UI state (selectedClusters).
- Toolbar actions operate on the current selection: candidate toggles, bundled create, and related issue status cycles.
- Verification: node --check ship-sentinel\\app\\app.js.


## APP-016: Cluster Board + Batch Actions Consistency
- Per-card and board-level actions now align: the top toolbar runs the same actions across all selected clusters.
- Visuals: selected cards are highlighted; toolbar displays selection count and offers 전체 선택/선택 해제.
- No persistence changes; selection is UI-only and resets on reload.
- Verified with `node --check ship-sentinel\\app\\app.js` (2026-04-01).


## APP-017: Board Selection Hygiene & Disabled Toolbar
- Toolbar actions (candidate toggles, bundled create, status cycles) are disabled when no clusters are selected, reducing accidental no-ops.
- Selection is pruned against the currently rendered clusters so IDs that disappear (due to filtering or data changes) are removed automatically.
- Navigating away from the Clusters view clears selection to avoid stale context when returning later.
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-01).

## APP-018: Notes View Integration and Batch Actions (Session App)
- Integrated the mismatch Cluster Board directly into the full session-centered app under the 메모 보드 (Notes) view via DOM injection after renders.
- Preserves board-level selection hygiene from APP-017: selection prunes to visible clusters and clears when navigating away; toolbar actions are disabled when selection is empty.
- Batch actions available: 후보 토글(선택/모두), 묶음 생성(버그/현행화), 연결 이슈 상태 순환(버그/현행화).
- No schema changes; operates on in-memory state for demo.
- Verification: node --check ship-sentinel\\app\\app.js (OK, 2026-04-01).

## APP-019: Mismatch Cluster Board — Wiring Fixes and Batch Cycle Actions
- Registered cluster board event delegation once per session (egisterClusterBoardHandlers).
- Added per-cluster status cycle actions: cluster-cycle-bug-status and cluster-cycle-change-status mapped to screen-linked issue status rotation (열림 → 진행중 → 닫힘).
- Board-level toolbar unchanged; selection hygiene preserved and pruned on re-render; selection clears when leaving Notes view.
- Verification: 
ode --check ship-sentinel\\app\\app.js (OK on 2026-04-01).

## APP-020: Mismatch Cluster Board and Batch Actions (Session App — Final)
- Finalizes mismatch cluster board in the session-centered app (Notes view).
- Clustering heuristic remains: screen_id + 10% grid of (x_pct, y_pct), panes merged (레퍼런스/라이브/양면).
- Per-cluster actions: 후보 토글(버그/현행화), 묶음 생성(버그/현행화), 연결 이슈 상태 순환(버그/현행화).
- Board toolbar: 멀티 선택, 전체 선택/선택 해제, 선택 대상에 동일 배치 액션 실행.
- Selection hygiene: selection pruned to visible clusters; cleared when navigating away from Notes; toolbar disables with 0 selected.
- Event delegation: one-time registration (egisterClusterBoardHandlers) binds data-action="cluster-*" | "board-*" across re-renders.
- Verification: 
ode --check ship-sentinel\\app\\app.js (OK on 2026-04-01).
## APP-023: Mismatch Cluster Board and Batch Actions — Final Check
- Confirmed cluster grouping and board-level batch triage are wired in the session-centered app (Notes view) and mirror per-card actions.
- Verified selection hygiene (prune on re-render, clear on view change) and disabled toolbar states.
- No schema or API changes; clusters are derived at render time from `state.notes.geometry` using 10% buckets; selection is UI-only.
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-02).

## APP-024: Final QA — Mismatch Cluster Board
- Board and per‑card batch actions remain in full parity; selection summary and disabled states align with toolbar controls.
- Notes view integration stable; selection prunes/clears as expected when clusters change or the view changes.
- No persistence changes; behavior is UI‑only over derived clusters.
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-02).

## APP-026: Mismatch Cluster Board — Selection + Batch Actions (Notes View)
- Adds board-level selection and batch actions to the Notes view cluster board via DOM augmentation so it stays resilient to re-renders.
- Toolbar provides: 전체 선택/선택 해제, 후보 토글(버그/현행화), 묶음 생성(버그/현행화), 연결 이슈 상태 순환(버그/현행화).
- Selection is UI-only (state.ui.selectedClusters), pruned to visible clusters and cleared when leaving Notes.
- Per-card checkboxes and cluster-selected highlight indicate current selection.
- Verification: 
ode --check ship-sentinel\app\app.js (OK on 2026-04-02).

## APP-027: Mismatch Cluster Board — Batch Actions Parity (Notes View)
- Ensured per‑cluster status cycle actions are wired (cluster-cycle-bug-status / cluster-cycle-change-status) alongside toolbar batch actions.
- Board selection remains UI‑only (state.ui.selectedClusters) with prune/clear hygiene on re‑render and view change.
- No persistence or API changes; actions operate directly on the in‑memory demo state.
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-02).
## APP-033: Mismatch Cluster Board — Handlers Alignment
- Deduplicated board-level event handling in the Notes view cluster board; a single delegated handler now processes all "board-*" actions before cluster-specific paths, preventing mismatches or no-ops.
- No behavior change to batch verbs: 후보 토글(버그/현행화), 묶음 생성(버그/현행화), 연결 이슈 상태 순환(버그/현행화).
- Selection hygiene remains: prune on re-render, clear when leaving Notes; toolbar disables when selection is empty.
- Verification: node --check ship-sentinel\\app\\app.js (OK on 2026-04-02).
