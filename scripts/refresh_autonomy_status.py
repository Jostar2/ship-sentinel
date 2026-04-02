from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RUNTIME_DIR = ROOT / "runtime"
OPS_DIR = RUNTIME_DIR / "ops" / "autonomy"
APP_DATA_DIR = RUNTIME_DIR / "app-data"
DATA_DIR = RUNTIME_DIR / "data"
JSON_OUTPUT = DATA_DIR / "autonomy-status.json"
JS_OUTPUT = APP_DATA_DIR / "autonomy-status.js"


def load_json_or_default(path: Path, default: object) -> object:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def load_text_or_default(path: Path, default: str = "") -> str:
    if not path.exists():
        return default
    return path.read_text(encoding="utf-8")


def tail_jsonl(path: Path, limit: int) -> list[dict]:
    if not path.exists():
        return []
    lines = [line for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    return [json.loads(line) for line in lines[-limit:]]


def build_payload() -> dict:
    state = load_json_or_default(OPS_DIR / "state.json", {})
    heartbeat = load_json_or_default(OPS_DIR / "heartbeat.json", {})
    next_slice = load_text_or_default(OPS_DIR / "NEXT_SLICE.md")
    cycle_log = tail_jsonl(OPS_DIR / "cycle-log.jsonl", 10)
    execution_log = tail_jsonl(OPS_DIR / "execution-log.jsonl", 10)
    last_agent_message = load_text_or_default(OPS_DIR / "last-agent-message.md")
    return {
        "state": state,
        "heartbeat": heartbeat,
        "next_slice_markdown": next_slice,
        "cycle_log": cycle_log,
        "execution_log": execution_log,
        "last_agent_message": last_agent_message,
    }


def refresh_autonomy_status() -> dict:
    APP_DATA_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = build_payload()
    JSON_OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    JS_OUTPUT.write_text(
        "window.SHIP_SENTINEL_AUTONOMY_STATUS = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    return payload


if __name__ == "__main__":
    data = refresh_autonomy_status()
    print(f"Refreshed autonomy status for current slice {data.get('state', {}).get('current_slice_id', '-')}")
