from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path

from refresh_autonomy_status import refresh_autonomy_status


ROOT = Path(__file__).resolve().parents[1]
OPS_DIR = ROOT / "ops" / "autonomy"
BACKLOG_PATH = OPS_DIR / "backlog.json"
STATE_PATH = OPS_DIR / "state.json"
NEXT_SLICE_PATH = OPS_DIR / "NEXT_SLICE.md"

AUTONOMY_SEED_SLICES = [
    {
        "id": "APP-007",
        "title": "Annotation detail drawer and quick promote",
        "status": "pending",
        "priority": 200,
        "depends_on": ["APP-006"],
        "summary": "Add annotation detail drawer with edit metadata, evidence links, and one-click promote to bug or change request.",
        "write_scope": [
            "ship-sentinel/app/**",
            "ship-sentinel/docs/ux/**",
            "ship-sentinel/docs/architecture/**",
        ],
        "verification": [
            "node --check ship-sentinel\\app\\app.js"
        ],
    },
    {
        "id": "HELPER-004",
        "title": "Helper duplicate detection and stale queue cleanup",
        "status": "pending",
        "priority": 210,
        "depends_on": ["HELPER-003"],
        "summary": "Detect duplicate helper captures, mark stale queue items, and surface cleanup actions before inbox pollution grows.",
        "write_scope": [
            "ship-sentinel/app/**",
            "ship-sentinel/helper/**",
            "ship-sentinel/docs/architecture/**",
        ],
        "verification": [
            "node --check ship-sentinel\\app\\app.js",
            "python -m py_compile ship-sentinel\\helper\\mock_helper_server.py",
        ],
    },
    {
        "id": "EXPORT-004",
        "title": "Package diff report and rerun comparison",
        "status": "pending",
        "priority": 220,
        "depends_on": ["EXPORT-003"],
        "summary": "Generate a package-to-package diff summary so reruns can show what changed between audit outputs.",
        "write_scope": [
            "ship-sentinel/scripts/**",
            "ship-sentinel/output/**",
            "ship-sentinel/docs/product/**",
            "ship-sentinel/docs/architecture/**",
        ],
        "verification": [
            "python ship-sentinel\\scripts\\export_audit_pack.py ship-sentinel\\app\\data\\demo-state.js --output-dir ship-sentinel\\output\\from-app-demo-state"
        ],
    },
    {
        "id": "DATA-003",
        "title": "Run snapshot archive and restore flow",
        "status": "pending",
        "priority": 230,
        "depends_on": ["DATA-002"],
        "summary": "Archive run snapshots with restore metadata so operators can roll back to a prior audit state or compare branches of QA work.",
        "write_scope": [
            "ship-sentinel/app/**",
            "ship-sentinel/data/**",
            "ship-sentinel/scripts/**",
            "ship-sentinel/docs/architecture/**",
        ],
        "verification": [
            "python -m py_compile ship-sentinel\\scripts\\refresh_run_library.py",
            "node --check ship-sentinel\\app\\app.js",
        ],
    },
]

DISCOVERY_TEMPLATES = [
    {
        "track": "APP",
        "title": "Mismatch cluster board and batch actions",
        "summary": "Group related annotations and issues into mismatch clusters so operators can batch triage and reduce repeated handoff work.",
        "write_scope": [
            "ship-sentinel/app/**",
            "ship-sentinel/docs/ux/**",
            "ship-sentinel/docs/architecture/**",
        ],
        "verification": [
            "node --check ship-sentinel\\app\\app.js"
        ],
    },
    {
        "track": "HELPER",
        "title": "Helper inbox aging and retry policy",
        "summary": "Track helper inbox age, retry stale deliveries, and surface aging queues before evidence ingestion silently degrades.",
        "write_scope": [
            "ship-sentinel/app/**",
            "ship-sentinel/helper/**",
            "ship-sentinel/docs/architecture/**",
        ],
        "verification": [
            "node --check ship-sentinel\\app\\app.js",
            "python -m py_compile ship-sentinel\\helper\\mock_helper_server.py",
        ],
    },
    {
        "track": "EXPORT",
        "title": "Delivery audit trail and client summary bundle",
        "summary": "Create a client-facing delivery trail with package history, summary deltas, and a compact audit narrative for handoff confidence.",
        "write_scope": [
            "ship-sentinel/scripts/**",
            "ship-sentinel/output/**",
            "ship-sentinel/docs/product/**",
            "ship-sentinel/docs/architecture/**",
        ],
        "verification": [
            "python ship-sentinel\\scripts\\export_audit_pack.py ship-sentinel\\app\\data\\demo-state.js --output-dir ship-sentinel\\output\\from-app-demo-state"
        ],
    },
    {
        "track": "DATA",
        "title": "Run lineage graph and branch merge notes",
        "summary": "Model lineage between saved runs so operators can see rerun ancestry, branch notes, and merge candidates across QA work.",
        "write_scope": [
            "ship-sentinel/app/**",
            "ship-sentinel/data/**",
            "ship-sentinel/scripts/**",
            "ship-sentinel/docs/architecture/**",
        ],
        "verification": [
            "python -m py_compile ship-sentinel\\scripts\\refresh_run_library.py",
            "node --check ship-sentinel\\app\\app.js",
        ],
    },
    {
        "track": "UX",
        "title": "Flow mode and distraction-free execution",
        "summary": "Add a focused flow mode that hides secondary chrome so operators can move through scenarios with less context switching.",
        "write_scope": [
            "ship-sentinel/app/**",
            "ship-sentinel/docs/ux/**",
        ],
        "verification": [
            "node --check ship-sentinel\\app\\app.js"
        ],
    },
]


def now_stamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def slices_by_id(backlog: dict) -> dict[str, dict]:
    return {item["id"]: item for item in backlog["slices"]}


def completed_ids(backlog: dict) -> set[str]:
    return {item["id"] for item in backlog["slices"] if item["status"] == "completed"}


def current_slice(backlog: dict, state: dict) -> dict | None:
    current_id = state.get("current_slice_id")
    if not current_id:
      return None
    return slices_by_id(backlog).get(current_id)


def next_ready_slice(backlog: dict, state: dict) -> dict | None:
    current = current_slice(backlog, state)
    if current and current.get("status") == "in_progress":
        return current

    done = completed_ids(backlog)
    ready = []
    for item in backlog["slices"]:
        if item["status"] != "pending":
            continue
        if all(dep in done for dep in item.get("depends_on", [])):
            ready.append(item)
    ready.sort(key=lambda item: (item.get("priority", 9999), item["id"]))
    return ready[0] if ready else None


def any_pending_slice(backlog: dict) -> bool:
    return any(item.get("status") == "pending" for item in backlog["slices"])


def replenish_backlog(backlog: dict) -> list[dict]:
    existing_ids = {item["id"] for item in backlog["slices"]}
    additions = [dict(item) for item in AUTONOMY_SEED_SLICES if item["id"] not in existing_ids]
    if additions:
        backlog["slices"].extend(additions)
    return additions


def highest_numeric_suffix(backlog: dict, prefix: str) -> int:
    max_value = 0
    for item in backlog["slices"]:
        slice_id = item.get("id", "")
        if not slice_id.startswith(f"{prefix}-"):
            continue
        try:
            max_value = max(max_value, int(slice_id.split("-")[1]))
        except (IndexError, ValueError):
            continue
    return max_value


def latest_completed_id(backlog: dict, prefix: str) -> str | None:
    completed = [item["id"] for item in backlog["slices"] if item.get("status") == "completed" and item.get("id", "").startswith(f"{prefix}-")]
    if not completed:
        return None
    return completed[-1]


def dynamic_wave(backlog: dict) -> list[dict]:
    existing_ids = {item["id"] for item in backlog["slices"]}
    additions = []
    for index, template in enumerate(DISCOVERY_TEMPLATES, start=1):
        prefix = template["track"]
        next_number = highest_numeric_suffix(backlog, prefix) + 1
        slice_id = f"{prefix}-{next_number:03d}"
        if slice_id in existing_ids:
            continue
        depends = []
        latest_same_track = latest_completed_id(backlog, prefix)
        if latest_same_track:
            depends.append(latest_same_track)
        additions.append(
            {
                "id": slice_id,
                "title": template["title"],
                "status": "pending",
                "priority": 300 + index * 10 + next_number,
                "depends_on": depends,
                "summary": template["summary"],
                "write_scope": list(template["write_scope"]),
                "verification": list(template["verification"]),
            }
        )
    return additions


def ensure_ready_work(backlog: dict) -> list[dict]:
    additions = replenish_backlog(backlog)
    if next_ready_slice(backlog, {"current_slice_id": ""}):
        return additions
    dynamic_additions = dynamic_wave(backlog)
    if dynamic_additions:
        backlog["slices"].extend(dynamic_additions)
        additions.extend(dynamic_additions)
    return additions


def brief_text(backlog: dict, state: dict, slice_item: dict | None) -> str:
    if not slice_item:
        return "# Next Slice\n\n진행 가능한 다음 슬라이스가 없습니다.\n"

    lines = [
        "# Next Slice",
        "",
        f"- generated_at: `{now_stamp()}`",
        f"- slice_id: `{slice_item['id']}`",
        f"- title: `{slice_item['title']}`",
        f"- status: `{slice_item['status']}`",
        f"- priority: `{slice_item.get('priority', '-')}`",
        "",
        "## Summary",
        "",
        slice_item.get("summary", ""),
        "",
        "## Dependencies",
        "",
    ]

    dependencies = slice_item.get("depends_on", [])
    if dependencies:
        lines.extend([f"- `{item}`" for item in dependencies])
    else:
        lines.append("- 없음")

    lines.extend([
        "",
        "## Write Scope",
        "",
    ])
    lines.extend([f"- `{item}`" for item in slice_item.get("write_scope", [])] or ["- 없음"])

    lines.extend([
        "",
        "## Verification",
        "",
    ])
    lines.extend([f"- `{item}`" for item in slice_item.get("verification", [])] or ["- 없음"])

    lines.extend([
        "",
        "## Operating Note",
        "",
        "- 다음 세션은 이 슬라이스 하나만 밀고, 완료 후 `complete`로 상태를 바꾼 뒤 다음 brief를 생성한다.",
        "- 사람 승인 없이는 외부 네트워크, 실제 배포, 서명, 비밀정보 작업을 하지 않는다.",
    ])
    return "\n".join(lines) + "\n"


def command_status(backlog: dict, state: dict) -> None:
    current = current_slice(backlog, state)
    next_item = next_ready_slice(backlog, state)

    print("Ship Sentinel Autonomy Status")
    print(f"mode: {state.get('mode', '-')}")
    print(f"updated_at: {state.get('updated_at', '-')}")
    print(f"current_slice: {current['id'] if current else '-'}")
    print(f"last_completed: {state.get('last_completed_slice_id', '-')}")
    print(f"next_ready: {next_item['id'] if next_item else '-'}")
    if next_item:
        print(f"title: {next_item['title']}")


def command_claim_next(backlog: dict, state: dict, write_brief: bool) -> None:
    current = current_slice(backlog, state)
    if current and current.get("status") == "in_progress":
        chosen = current
    else:
        chosen = next_ready_slice(backlog, state)
        if not chosen:
            additions = ensure_ready_work(backlog)
            chosen = next_ready_slice(backlog, state)
            if not chosen:
                raise SystemExit("No ready slice found.")
            if additions:
                state["updated_at"] = now_stamp()
        chosen["status"] = "in_progress"
        state["current_slice_id"] = chosen["id"]
        state["updated_at"] = now_stamp()

    if write_brief:
        NEXT_SLICE_PATH.write_text(brief_text(backlog, state, chosen), encoding="utf-8")
        state["last_generated_brief"] = str(NEXT_SLICE_PATH.relative_to(ROOT)).replace("\\", "/")

    write_json(BACKLOG_PATH, backlog)
    write_json(STATE_PATH, state)
    refresh_autonomy_status()
    print(f"claimed: {chosen['id']} - {chosen['title']}")


def command_complete(backlog: dict, state: dict, slice_id: str | None, summary: str, write_brief: bool) -> None:
    by_id = slices_by_id(backlog)
    target_id = slice_id or state.get("current_slice_id")
    if not target_id or target_id not in by_id:
        raise SystemExit("No slice to complete.")

    target = by_id[target_id]
    target["status"] = "completed"
    state["current_slice_id"] = ""
    state["last_completed_slice_id"] = target_id
    state["updated_at"] = now_stamp()
    state.setdefault("history", []).append(
        {
            "slice_id": target_id,
            "status": "completed",
            "timestamp": now_stamp(),
            "summary": summary or f"{target_id} completed."
        }
    )

    next_item = next_ready_slice(backlog, state)
    if not next_item and not any_pending_slice(backlog):
        ensure_ready_work(backlog)
        next_item = next_ready_slice(backlog, state)
    if write_brief:
        NEXT_SLICE_PATH.write_text(brief_text(backlog, state, next_item), encoding="utf-8")
        state["last_generated_brief"] = str(NEXT_SLICE_PATH.relative_to(ROOT)).replace("\\", "/")

    write_json(BACKLOG_PATH, backlog)
    write_json(STATE_PATH, state)
    refresh_autonomy_status()
    print(f"completed: {target_id}")
    if next_item:
        print(f"next_ready: {next_item['id']} - {next_item['title']}")


def command_brief(backlog: dict, state: dict, write: bool) -> None:
    target = next_ready_slice(backlog, state)
    if not target and not any_pending_slice(backlog):
        ensure_ready_work(backlog)
        target = next_ready_slice(backlog, state)
    text = brief_text(backlog, state, target)
    if write:
        NEXT_SLICE_PATH.write_text(text, encoding="utf-8")
        state["last_generated_brief"] = str(NEXT_SLICE_PATH.relative_to(ROOT)).replace("\\", "/")
        state["updated_at"] = now_stamp()
        write_json(STATE_PATH, state)
        refresh_autonomy_status()
    print(text, end="")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ship Sentinel local autonomy loop")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("status")

    claim_parser = subparsers.add_parser("claim-next")
    claim_parser.add_argument("--write-brief", action="store_true")

    complete_parser = subparsers.add_parser("complete")
    complete_parser.add_argument("--slice-id")
    complete_parser.add_argument("--summary", default="")
    complete_parser.add_argument("--write-brief", action="store_true")

    brief_parser = subparsers.add_parser("brief")
    brief_parser.add_argument("--write", action="store_true")

    args = parser.parse_args()
    backlog = load_json(BACKLOG_PATH)
    state = load_json(STATE_PATH)

    if args.command == "status":
        command_status(backlog, state)
    elif args.command == "claim-next":
        command_claim_next(backlog, state, args.write_brief)
    elif args.command == "complete":
        command_complete(backlog, state, args.slice_id, args.summary, args.write_brief)
    elif args.command == "brief":
        command_brief(backlog, state, args.write)


if __name__ == "__main__":
    main()
