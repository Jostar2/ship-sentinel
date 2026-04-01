# Export Workflow

## Purpose

Turn the operator workspace JSON into final client-facing files.

## Input

- workspace JSON exported from `web/workspace.html`
- app state JSON exported from `app/index.html`
- `app/data/demo-state.js`
- file-backed run JSON under `data/runs/`

## Output

- `test-scenarios.xlsx`
- `execution-results.xlsx`
- `bug-register.xlsx`
- `evidence-index.xlsx`
- `release-memo-inputs.xlsx`
- `release-memo.md`
- `evidence-bundle-manifest.json`
- `package-metadata.json`
- `package-diff.json` and `package-diff.md` (if a prior package exists for the same audit)
- `delivery-history.json` and `delivery-history.md`
- `client-summary.md`
- The normalized input used for export is snapshotted to `normalized-payload.json` for accurate comparisons.

## Command

```powershell
python ship-sentinel/scripts/export_audit_pack.py ship-sentinel/data/demo-workspace.json
```

```powershell
python ship-sentinel/scripts/export_audit_pack.py ship-sentinel/app/data/demo-state.js --output-dir ship-sentinel/output/from-app-demo-state
```

```powershell
python ship-sentinel/scripts/export_audit_pack.py ship-sentinel/data/runs/audit-2026-04-01-acme.json --output-dir ship-sentinel/output/from-app-run-json
```

## Output location

- `ship-sentinel/output/<audit-id>/`

## Recommended delivery bundle

- exported spreadsheets
- screenshot or evidence folder
- final release memo
- client summary (`client-summary.md`)
- delivery trail (`delivery-history.md`)

## Reruns and Diff

- Re-running the export in the same output folder computes a package-to-package diff against the previous run.
- Summary is saved to `package-diff.json` and `package-diff.md` and includes:
  - counts delta (scenarios, executions, bugs, evidence, pass/fail)
  - scenario status changes and added/removed scenarios
  - added/resolved bug ids
  - memo decision change and blockers/warnings deltas
  - deliverable file changes detected via SHA-256 hashes
- A rolling delivery history for the audit is saved to `delivery-history.json` and `delivery-history.md`.
