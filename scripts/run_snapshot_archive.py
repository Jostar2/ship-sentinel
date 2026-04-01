from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime
from pathlib import Path

from refresh_run_library import refresh_run_library

ROOT = Path(__file__).resolve().parents[1]
RUNS_DIR = ROOT / "data" / "runs"
SNAPSHOTS_DIR = ROOT / "data" / "snapshots"
INDEX_PATH = ROOT / "data" / "snapshot-index.json"


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def _ts_slug(dt: datetime | None = None) -> str:
    dt = dt or datetime.now()
    return dt.strftime("%Y%m%d-%H%M%S")


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _load_index() -> dict:
    if not INDEX_PATH.exists():
        return {"audits": {}}
    return _read_json(INDEX_PATH)


def _save_index(index: dict) -> None:
    _write_json(INDEX_PATH, index)


def archive_snapshot(src_json: Path, label: str | None = None) -> Path:
    payload = _read_json(src_json)
    audit_id = payload.get("meta", {}).get("audit_id") or src_json.stem
    ts = _ts_slug()
    base_dir = SNAPSHOTS_DIR / audit_id / ts
    base_dir.mkdir(parents=True, exist_ok=True)

    # Write snapshot run.json
    run_path = base_dir / "run.json"
    _write_json(run_path, payload)

    # Metadata for restore and provenance
    meta = {
        "audit_id": audit_id,
        "snapshot_id": ts,
        "label": label or payload.get("memo", {}).get("decision") or "snapshot",
        "archived_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "source_file": str(src_json.relative_to(ROOT)).replace("\\", "/") if src_json.is_relative_to(ROOT) else str(src_json),
        "source_hash": _sha256(src_json) if src_json.exists() else _sha256(run_path),
        "restore_target": str((RUNS_DIR / f"{audit_id}.json").relative_to(ROOT)).replace("\\", "/"),
    }
    _write_json(base_dir / "metadata.json", meta)

    # Update index
    index = _load_index()
    audits = index.setdefault("audits", {})
    entry = audits.setdefault(audit_id, {"snapshots": []})
    entry["last_archived_at"] = meta["archived_at"]
    entry["snapshots"].append(meta)
    # Keep most recent first
    entry["snapshots"].sort(key=lambda m: m["archived_at"], reverse=True)
    _save_index(index)

    return base_dir


def restore_snapshot(audit_id: str, snapshot_id: str | None = None, path: Path | None = None) -> Path:
    if path is None:
        # discover from index
        index = _load_index()
        info = index.get("audits", {}).get(audit_id)
        if not info or not info.get("snapshots"):
            raise SystemExit(f"No snapshots found for audit {audit_id}")
        if snapshot_id:
            snap = next((m for m in info["snapshots"] if m.get("snapshot_id") == snapshot_id), None)
            if not snap:
                raise SystemExit(f"Snapshot {snapshot_id} not found for audit {audit_id}")
        else:
            snap = info["snapshots"][0]
        path = SNAPSHOTS_DIR / audit_id / snap["snapshot_id"] / "run.json"

    payload = _read_json(path)
    target = RUNS_DIR / f"{audit_id}.json"
    _write_json(target, payload)

    # refresh app data
    refresh_run_library()
    return target


def main() -> None:
    parser = argparse.ArgumentParser(description="Archive or restore Ship Sentinel run snapshots")
    sub = parser.add_subparsers(dest="command", required=True)

    p_arch = sub.add_parser("archive", help="Archive a run JSON into timestamped snapshot")
    p_arch.add_argument("src", help="Path to run JSON (app export or data/runs/*.json)")
    p_arch.add_argument("--label", help="Optional label for snapshot (e.g., 'pre-fix', 'post-release')")

    p_res = sub.add_parser("restore", help="Restore a snapshot back into data/runs/<audit_id>.json and refresh library")
    p_res.add_argument("audit_id", help="Audit id to restore")
    p_res.add_argument("--snapshot", help="Snapshot id (YYYYMMDD-HHMMSS). Defaults to latest")
    p_res.add_argument("--from-path", help="Restore from explicit snapshot run.json path")

    args = parser.parse_args()
    if args.command == "archive":
        src = Path(args.src)
        if not src.is_absolute():
            src = (Path.cwd() / src).resolve()
        out_dir = archive_snapshot(src, args.label)
        print(str(out_dir))
    else:
        snap_path = Path(args.from_path) if getattr(args, "from_path", None) else None
        target = restore_snapshot(args.audit_id, getattr(args, "snapshot", None), snap_path)
        print(str(target))


if __name__ == "__main__":
    main()
