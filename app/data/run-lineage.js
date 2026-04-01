window.SHIP_SENTINEL_RUN_LINEAGE = {
  "audit-2026-04-01-acme": {
    "audit_id": "audit-2026-04-01-acme",
    "branch": "main",
    "nodes": [
      {
        "id": "snapshot:20260401-183222",
        "type": "snapshot",
        "label": "initial",
        "timestamp": "2026-04-01 18:32:22"
      },
      {
        "id": "run:audit-2026-04-01-acme",
        "type": "run",
        "label": "audit-2026-04-01-acme.json",
        "timestamp": "2026-04-01"
      }
    ],
    "edges": [
      {
        "from": "snapshot:20260401-183222",
        "to": "run:audit-2026-04-01-acme",
        "relation": "baseline_of"
      }
    ],
    "branch_notes": "Lineage for audit-2026-04-01-acme: 1 snapshot(s), 1 run(s). Latest vs snapshot — screens: 0, scenarios: 0, bugs: 0, notes Δ: 0.",
    "merge_candidates": []
  }
};
