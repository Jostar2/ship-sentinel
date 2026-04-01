# Run Snapshots

## Purpose

Archive file-backed audit runs into timestamped snapshots that can be restored later. This enables quick rollback to a prior audit state or branch-style comparisons during QA.

## Layout

- `ship-sentinel/data/runs/<audit-id>.json` — current file-backed run used by the app.
- `ship-sentinel/data/snapshots/<audit-id>/<YYYYMMDD-HHMMSS>/run.json` — archived snapshot of the run payload.
- `ship-sentinel/data/snapshots/<audit-id>/<YYYYMMDD-HHMMSS>/metadata.json` — restore and provenance metadata.
- `ship-sentinel/data/snapshot-index.json` — quick lookup of snapshots per audit.

## Commands

- Archive current run JSON (from app export or runs):

```powershell
python ship-sentinel/scripts/run_snapshot_archive.py archive ship-sentinel/data/runs/audit-2026-04-01-acme.json --label pre-fix
```

- Restore the latest snapshot back into `data/runs/<audit-id>.json` and refresh the UI library:

```powershell
python ship-sentinel/scripts/run_snapshot_archive.py restore audit-2026-04-01-acme
```

- Restore a specific snapshot id:

```powershell
python ship-sentinel/scripts/run_snapshot_archive.py restore audit-2026-04-01-acme --snapshot 20260401-142335
```

## App Integration

- `refresh_run_library.py` now enriches each run entry with:
  - `snapshots_count`
  - `latest_snapshot_at`
  - `latest_snapshot_id`
- The app already supports loading the current file-backed run via the Run Library and Command Palette. Restoring a snapshot updates that current file so operators can use the existing UI to continue from the restored state.

## Notes

- No external network or secrets are involved.
- Snapshots are append-only; restores do not delete past snapshots.
