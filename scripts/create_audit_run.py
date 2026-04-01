from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

from refresh_run_library import refresh_run_library


ROOT = Path(__file__).resolve().parents[1]
DEMO_STATE_PATH = ROOT / "app" / "data" / "demo-state.js"
RUNS_DIR = ROOT / "data" / "runs"


def load_demo_state() -> dict:
    node_script = """
const fs = require("fs");
const vm = require("vm");
const path = process.argv[1];
const code = fs.readFileSync(path, "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(code, context);
process.stdout.write(JSON.stringify(context.window.SHIP_SENTINEL_DEMO_STATE));
""".strip()
    result = subprocess.run(
        ["node", "-e", node_script, str(DEMO_STATE_PATH)],
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(result.stdout)


def load_source(path: Path | None) -> dict:
    if path is None:
        return load_demo_state()
    return json.loads(path.read_text(encoding="utf-8"))


def write_run_file(payload: dict, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    audit_id = payload.get("meta", {}).get("audit_id", "audit-unknown")
    output_path = output_dir / f"{audit_id}.json"
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a file-backed Ship Sentinel audit run")
    parser.add_argument("--from-json", dest="from_json", help="Path to exported audit JSON")
    parser.add_argument("--output-dir", default=str(RUNS_DIR), help="Directory to write run files into")
    args = parser.parse_args()

    source = Path(args.from_json) if args.from_json else None
    payload = load_source(source)
    output_path = write_run_file(payload, Path(args.output_dir))
    refresh_run_library()
    print(output_path)


if __name__ == "__main__":
    main()
