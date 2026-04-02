from __future__ import annotations

import argparse
import json
import subprocess
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = ROOT.parent
OPS_SEED_DIR = ROOT / "ops" / "autonomy"
OPS_DIR = ROOT / "runtime" / "ops" / "autonomy"
STATE_PATH = OPS_DIR / "state.json"
BACKLOG_PATH = OPS_DIR / "backlog.json"
RECIPES_PATH = ROOT / "ops" / "autonomy" / "executor-recipes.json"
LOG_PATH = OPS_DIR / "execution-log.jsonl"


def now_stamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def append_log(entry: dict) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, ensure_ascii=False) + "\n")


def ensure_runtime_files() -> None:
    OPS_DIR.mkdir(parents=True, exist_ok=True)
    if not BACKLOG_PATH.exists():
        BACKLOG_PATH.write_text((OPS_SEED_DIR / "backlog.json").read_text(encoding="utf-8"), encoding="utf-8")
    if not STATE_PATH.exists():
        STATE_PATH.write_text(
            json.dumps(
                {
                    "mode": "autonomous-local",
                    "updated_at": now_stamp(),
                    "current_slice_id": "",
                    "last_completed_slice_id": "",
                    "last_generated_brief": "",
                    "history": [],
                    "human_gates": [
                        "real API key wiring",
                        "external network access",
                        "production deployment",
                        "desktop app installer signing",
                    ],
                },
                ensure_ascii=False,
                indent=2,
            ) + "\n",
            encoding="utf-8",
        )


def current_slice_id(state: dict) -> str:
    return state.get("current_slice_id", "")


def current_recipe(recipes: dict, state: dict) -> tuple[str, dict]:
    slice_id = current_slice_id(state)
    if not slice_id:
        raise SystemExit("No current slice is claimed.")
    recipe = recipes.get(slice_id)
    if not recipe:
        raise SystemExit(f"No executor recipe found for {slice_id}.")
    return slice_id, recipe


def run_recipe(slice_id: str, recipe: dict, dry_run: bool) -> int:
    commands = recipe.get("commands", [])
    if not commands:
        raise SystemExit(f"Recipe {slice_id} has no commands.")

    failures = 0
    for index, command in enumerate(commands, start=1):
        receipt = {
            "timestamp": now_stamp(),
            "slice_id": slice_id,
            "recipe_description": recipe.get("description", ""),
            "step": index,
            "command": command,
            "dry_run": dry_run,
        }
        if dry_run:
            receipt["status"] = "planned"
            append_log(receipt)
            print(f"[dry-run] {' '.join(command)}")
            continue

        started_at = now_stamp()
        result = subprocess.run(
            command,
            cwd=str(WORKSPACE_ROOT),
            capture_output=True,
            text=True,
        )
        finished_at = now_stamp()
        receipt.update(
            {
                "status": "ok" if result.returncode == 0 else "failed",
                "started_at": started_at,
                "finished_at": finished_at,
                "returncode": result.returncode,
                "stdout_tail": result.stdout[-2000:],
                "stderr_tail": result.stderr[-2000:],
            }
        )
        append_log(receipt)
        print(f"[{receipt['status']}] {' '.join(command)}")
        if result.returncode != 0:
            failures += 1

    return failures


def command_status(state: dict, recipes: dict) -> None:
    slice_id = current_slice_id(state)
    print("Autonomous Executor Status")
    print(f"current_slice: {slice_id or '-'}")
    print(f"recipe_available: {'yes' if slice_id and slice_id in recipes else 'no'}")
    print(f"log_path: {LOG_PATH}")


def command_run_current(state: dict, recipes: dict, dry_run: bool) -> int:
    slice_id, recipe = current_recipe(recipes, state)
    return run_recipe(slice_id, recipe, dry_run)


def command_tail(limit: int) -> None:
    if not LOG_PATH.exists():
        print("No execution log yet.")
        return
    lines = LOG_PATH.read_text(encoding="utf-8").splitlines()
    for line in lines[-limit:]:
        print(line)


def main() -> int:
    parser = argparse.ArgumentParser(description="Ship Sentinel local autonomous executor")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("status")

    run_parser = subparsers.add_parser("run-current")
    run_parser.add_argument("--dry-run", action="store_true")

    tail_parser = subparsers.add_parser("tail-log")
    tail_parser.add_argument("--limit", type=int, default=10)

    args = parser.parse_args()
    ensure_runtime_files()
    state = load_json(STATE_PATH)
    recipes = load_json(RECIPES_PATH)

    if args.command == "status":
        command_status(state, recipes)
        return 0
    if args.command == "run-current":
        failures = command_run_current(state, recipes, args.dry_run)
        return 1 if failures else 0
    if args.command == "tail-log":
        command_tail(args.limit)
        return 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
