# Delivery Audit Trail

## Purpose

Record a rolling history of exported audit packages per audit id so clients and operators can see what changed between deliveries and build handoff confidence.

## Files

- `ship-sentinel/output/<target>/delivery-history.json` — machine-readable history entries
- `ship-sentinel/output/<target>/delivery-history.md` — compact Markdown summary for handoffs
- `ship-sentinel/output/<target>/package-metadata.json` — generated file list + SHA-256 hashes per package
- `ship-sentinel/output/<target>/package-diff.json` — package-to-package diff summary (when a previous package exists)

## Entry Structure

Each `delivery-history.json` entry contains:
- `audit_id` — stable audit identifier
- `generated_at` — ISO timestamp of export
- `package_version` — monotonically increasing version string
- `counts` — `{ scenarios, executions, bugs, evidence, passed, failed }`
- `decision` — release memo decision at the time
- `delta` — counts-delta versus the previous entry

## Lifecycle

- `export_audit_pack.py` writes `package-metadata.json` and computes a diff against the previous run using file hashes and the normalized payload snapshot.
- The script appends to `delivery-history.json` and regenerates `delivery-history.md` from the last N entries.
- `client-summary.md` surfaces the deltas, blockers/warnings, and next actions for a quick executive read.

## Notes

- Append-only within the output folder; reruns create new entries rather than mutating prior history.
- No external network or secrets involved.
