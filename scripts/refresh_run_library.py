from __future__ import annotations

import json
from pathlib import Path

from refresh_autonomy_status import refresh_autonomy_status


ROOT = Path(__file__).resolve().parents[1]
RUNS_DIR = ROOT / "data" / "runs"
SNAPSHOTS_DIR = ROOT / "data" / "snapshots"
JSON_OUTPUT = ROOT / "data" / "run-library.json"
JS_OUTPUT = ROOT / "app" / "data" / "run-library.js"
PAYLOAD_JS_OUTPUT = ROOT / "app" / "data" / "run-payloads.js"
LINEAGE_JSON_OUTPUT = ROOT / "data" / "run-lineage.json"
LINEAGE_JS_OUTPUT = ROOT / "app" / "data" / "run-lineage.js"


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def summarize_run(path: Path) -> dict:
    payload = _read_json(path)
    meta = payload.get("meta", {})
    memo = payload.get("memo", {})
    ui = payload.get("ui", {})
    audit_id = meta.get("audit_id", path.stem)

    # Snapshot info
    snap_dir = SNAPSHOTS_DIR / audit_id
    snap_count = 0
    latest_snap_at = ""
    latest_snap_id = ""
    if snap_dir.exists():
        # snapshots/<audit>/*/metadata.json sorted by archived_at desc
        metas = sorted((snap_dir.glob("*/metadata.json")), key=lambda p: _read_json(p).get("archived_at", ""), reverse=True)
        snap_count = len(metas)
        if metas:
            latest_meta = _read_json(metas[0])
            latest_snap_at = latest_meta.get("archived_at", "")
            latest_snap_id = latest_meta.get("snapshot_id", "")

    return {
        "audit_id": audit_id,
        "title": f"{meta.get('client_name', 'Unknown Client')} / {meta.get('service_name', 'Unknown Service')}",
        "saved_at": ui.get("lastSavedAt") or meta.get("delivery_date", ""),
        "status": memo.get("decision", "saved"),
        "file_name": path.name,
        "snapshots_count": snap_count,
        "latest_snapshot_at": latest_snap_at,
        "latest_snapshot_id": latest_snap_id,
    }


def refresh_run_library() -> list[dict]:
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    run_paths = sorted(RUNS_DIR.glob("*.json"))
    entries = [summarize_run(path) for path in run_paths]
    # Prefer latest saved_at; fallback to latest snapshot time
    def sort_key(item: dict) -> str:
        return str(item.get("saved_at") or item.get("latest_snapshot_at") or "")
    entries.sort(key=sort_key, reverse=True)

    # Payloads keyed by audit_id for quick app import
    payloads = {
        _read_json(path).get("meta", {}).get("audit_id", path.stem): _read_json(path)
        for path in run_paths
    }

    # Build lineage graphs grouped by audit_id, supporting multiple saved runs (reruns)
    lineage: dict[str, dict] = {}

    # Group run files by audit_id with timestamps for ordering
    runs_by_audit: dict[str, list[dict]] = {}
    for path in run_paths:
        payload = _read_json(path)
        meta = payload.get("meta", {})
        ui = payload.get("ui", {})
        aid = meta.get("audit_id", path.stem)
        saved_ts = str(ui.get("lastSavedAt") or meta.get("delivery_date", ""))
        runs_by_audit.setdefault(aid, []).append({
            "path": path,
            "payload": payload,
            "saved_at": saved_ts,
            "id": f"run:{path.stem}",
            "label": path.name,
        })

    for audit_id, run_infos in runs_by_audit.items():
        # snapshots for this audit
        snap_dir = SNAPSHOTS_DIR / audit_id
        snaps: list[dict] = []
        if snap_dir.exists():
            for meta_path in snap_dir.glob("*/metadata.json"):
                try:
                    meta = _read_json(meta_path)
                    snaps.append({
                        "snapshot_id": meta.get("snapshot_id", meta_path.parent.name),
                        "archived_at": meta.get("archived_at", ""),
                        "label": meta.get("label", ""),
                        "metadata_path": str(meta_path.as_posix()),
                        "run_path": str((meta_path.parent / "run.json").as_posix()),
                    })
                except Exception:
                    continue
        snaps.sort(key=lambda s: s.get("archived_at") or "")

        # order runs by saved_at; fallback to filename if missing
        run_infos.sort(key=lambda r: (r.get("saved_at") or "", r["label"]))

        # Nodes: snapshots + all runs
        nodes = [
            {
                "id": f"snapshot:{s['snapshot_id']}",
                "type": "snapshot",
                "label": s.get("label") or s["snapshot_id"],
                "timestamp": s.get("archived_at", ""),
            }
            for s in snaps
        ]
        for r in run_infos:
            nodes.append({
                "id": r["id"],
                "type": "run",
                "label": r["label"],
                "timestamp": r.get("saved_at", ""),
            })

        # Edges: chain snapshots; connect latest snapshot -> first run; then run[i-1] -> run[i] as rerun_of
        edges: list[dict] = []
        for i in range(len(snaps) - 1):
            a = snaps[i]
            b = snaps[i + 1]
            edges.append({
                "from": f"snapshot:{a['snapshot_id']}",
                "to": f"snapshot:{b['snapshot_id']}",
                "relation": "next",
            })
        if snaps and run_infos:
            edges.append({
                "from": f"snapshot:{snaps[-1]['snapshot_id']}",
                "to": run_infos[0]["id"],
                "relation": "baseline_of",
            })
        for i in range(1, len(run_infos)):
            prev = run_infos[i - 1]
            cur = run_infos[i]
            edges.append({
                "from": prev["id"],
                "to": cur["id"],
                "relation": "rerun_of",
            })

        # Diff helpers (shallow)
        def compute_diff(a_payload: dict, b_payload: dict) -> dict:
            d = {
                "screens_changed": 0,
                "scenarios_status_changed": 0,
                "bugs_changed": 0,
                "notes_changed": 0,
            }
            # Screens diff by screen_id + status or qa_note fields
            a_screens = {s.get("screen_id"): s for s in a_payload.get("screens", [])}
            b_screens = {s.get("screen_id"): s for s in b_payload.get("screens", [])}
            all_screen_ids = set(a_screens) | set(b_screens)
            sc_changed = 0
            for sid in all_screen_ids:
                a = a_screens.get(sid, {})
                b = b_screens.get(sid, {})
                if (a.get("current_state_status") != b.get("current_state_status")) or (a.get("qa_note") != b.get("qa_note")):
                    sc_changed += 1
            d["screens_changed"] = sc_changed

            # Scenario status diffs
            a_scen = {s.get("scenario_id"): s for s in a_payload.get("scenarios", [])}
            b_scen = {s.get("scenario_id"): s for s in b_payload.get("scenarios", [])}
            all_scn_ids = set(a_scen) | set(b_scen)
            scen_changed = 0
            for sid in all_scn_ids:
                a = a_scen.get(sid, {})
                b = b_scen.get(sid, {})
                if a.get("status") != b.get("status"):
                    scen_changed += 1
            d["scenarios_status_changed"] = scen_changed

            # Bugs compare
            a_bugs = {b.get("bug_id"): b for b in a_payload.get("bugs", [])}
            b_bugs = {b.get("bug_id"): b for b in b_payload.get("bugs", [])}
            all_bug_ids = set(a_bugs) | set(b_bugs)
            bug_changed = 0
            for bid in all_bug_ids:
                aa = a_bugs.get(bid, {})
                bb = b_bugs.get(bid, {})
                if (bool(aa) != bool(bb)) or (aa.get("status") != bb.get("status")):
                    bug_changed += 1
            d["bugs_changed"] = bug_changed

            # Notes count delta
            d["notes_changed"] = abs(len(b_payload.get("notes", [])) - len(a_payload.get("notes", [])))
            return d

        latest_run_payload = (run_infos[-1]["payload"] if run_infos else {})
        prev_run_payload = (run_infos[-2]["payload"] if len(run_infos) >= 2 else None)

        snap_diff = {"screens_changed": 0, "scenarios_status_changed": 0, "bugs_changed": 0, "notes_changed": 0}
        if snaps:
            try:
                latest_snapshot_path = Path(snaps[-1]["run_path"]).resolve()
                if latest_snapshot_path.exists():
                    snap_payload = _read_json(latest_snapshot_path)
                    snap_diff = compute_diff(snap_payload, latest_run_payload)
            except Exception:
                pass

        rerun_diff = None
        if prev_run_payload is not None:
            try:
                rerun_diff = compute_diff(prev_run_payload, latest_run_payload)
            except Exception:
                rerun_diff = None

        branch = "main"
        parts = [
            f"Lineage for {audit_id}: {len(snaps)} snapshot(s), {len(run_infos)} run(s).",
            f"Latest vs snapshot — screens: {snap_diff['screens_changed']}, scenarios: {snap_diff['scenarios_status_changed']}, bugs: {snap_diff['bugs_changed']}, notes Δ: {snap_diff['notes_changed']}.",
        ]
        if rerun_diff is not None:
            parts.append(
                f"Latest vs prev run — screens: {rerun_diff['screens_changed']}, scenarios: {rerun_diff['scenarios_status_changed']}, bugs: {rerun_diff['bugs_changed']}, notes Δ: {rerun_diff['notes_changed']}."
            )
        branch_notes = " ".join(parts)

        merge_candidates = []
        # Candidate: snapshot -> latest run
        if any(v > 0 for v in snap_diff.values()) and snaps and run_infos:
            merge_candidates.append({
                "from": f"snapshot:{snaps[-1]['snapshot_id']}",
                "to": run_infos[-1]["id"],
                "reason": "Divergence detected between latest snapshot and latest run",
                "summary": branch_notes,
            })
        # Candidate: prev run -> latest run
        if rerun_diff and any(v > 0 for v in rerun_diff.values()) and len(run_infos) >= 2:
            merge_candidates.append({
                "from": run_infos[-2]["id"],
                "to": run_infos[-1]["id"],
                "reason": "Rerun divergence detected between consecutive runs",
                "summary": branch_notes,
            })

        lineage[audit_id] = {
            "audit_id": audit_id,
            "branch": branch,
            "nodes": nodes,
            "edges": edges,
            "branch_notes": branch_notes,
            "merge_candidates": merge_candidates,
        }

    JSON_OUTPUT.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    JS_OUTPUT.write_text(
        "window.SHIP_SENTINEL_RUN_LIBRARY = " + json.dumps(entries, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    PAYLOAD_JS_OUTPUT.write_text(
        "window.SHIP_SENTINEL_SAVED_RUNS = " + json.dumps(payloads, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )

    LINEAGE_JSON_OUTPUT.write_text(json.dumps(lineage, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    LINEAGE_JS_OUTPUT.write_text(
        "window.SHIP_SENTINEL_RUN_LINEAGE = " + json.dumps(lineage, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )

    return entries


if __name__ == "__main__":
    data = refresh_run_library()
    refresh_autonomy_status()
    print(f"Refreshed run library with {len(data)} entries")
