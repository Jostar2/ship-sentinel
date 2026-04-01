# Run Lineage

Purpose: visualize rerun ancestry for saved runs and surface branch notes and merge candidates across QA work.

## Data outputs

- `ship-sentinel/data/run-lineage.json` — lineage graph per `audit_id`.
- `ship-sentinel/app/data/run-lineage.js` — same payload exposed to the app as `window.SHIP_SENTINEL_RUN_LINEAGE`.

## Graph shape

Per audit id:
- `nodes`: snapshots (`type: snapshot`) and runs (`type: run`). Multiple saved runs are supported; each run node id is `run:<file-stem>`.
- `edges`:
  - `snapshot:X → snapshot:Y (next)` — time-ordered snapshot chain.
  - `snapshot:latest → run:<first> (baseline_of)` — earliest run on the branch uses latest snapshot as baseline when present.
  - `run:<prev> → run:<next> (rerun_of)` — consecutive saved runs for the same audit id.
- `branch_notes`: shallow diff summaries:
  - Latest vs latest snapshot (screens/status/note count/bugs).
  - Latest vs previous run when at least two runs exist.
- `merge_candidates`:
  - Suggest `snapshot:latest → run:<latest>` when divergence vs snapshot exists.
  - Suggest `run:<prev> → run:<latest>` when divergence between consecutive runs exists.

## Generation

`refresh_run_library.py` emits lineage files when building the run library. It groups all `data/runs/*.json` by `meta.audit_id`, orders them by `ui.lastSavedAt` (or `meta.delivery_date`), and emits snapshot + run nodes and edges. Diffs are shallow and count-based for now.

## UI

- Autonomy view includes a 'Run Lineage' panel injected into the shell.
- Shows one panel per audit with nodes, edges, branch notes, and merge candidates.
- File-backed only (no external services).

## Notes

- Branch is a fixed `main` placeholder until branch metadata is introduced.
- Diff depth can be extended later to field-level changes and richer ancestry.
