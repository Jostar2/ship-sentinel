from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import time
from datetime import datetime
from pathlib import Path

from refresh_autonomy_status import refresh_autonomy_status


ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = ROOT.parent
OPS_SEED_DIR = ROOT / "ops" / "autonomy"
OPS_DIR = ROOT / "runtime" / "ops" / "autonomy"
STATE_PATH = OPS_DIR / "state.json"
BACKLOG_PATH = OPS_DIR / "backlog.json"
CONFIG_PATH = ROOT / "ops" / "autonomy" / "driver-config.json"
CYCLE_LOG_PATH = OPS_DIR / "cycle-log.jsonl"
HEARTBEAT_PATH = OPS_DIR / "heartbeat.json"


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


def now_stamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def append_cycle_log(entry: dict) -> None:
    CYCLE_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with CYCLE_LOG_PATH.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, ensure_ascii=False) + "\n")


def write_heartbeat(status: str, details: dict) -> None:
    HEARTBEAT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "timestamp": now_stamp(),
        "status": status,
        **details,
    }
    HEARTBEAT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    refresh_autonomy_status()


def current_slice_id(state: dict) -> str:
    return state.get("current_slice_id", "")


def recipe_exists(slice_id: str, recipes: dict) -> bool:
    return slice_id in recipes


def run_subprocess(command: list[str], dry_run: bool, stdin_text: str | None = None) -> dict:
    if dry_run:
        return {
            "status": "planned",
            "command": command,
            "returncode": 0,
            "stdout_tail": "",
            "stderr_tail": "",
        }
    result = subprocess.run(
        command,
        cwd=str(WORKSPACE_ROOT),
        input=stdin_text,
        capture_output=True,
        text=True,
    )
    return {
        "status": "ok" if result.returncode == 0 else "failed",
        "command": command,
        "returncode": result.returncode,
        "stdout_tail": result.stdout[-4000:],
        "stderr_tail": result.stderr[-4000:],
    }


def maybe_claim_next(config: dict, dry_run: bool) -> dict:
    if not config.get("auto_claim_next", True):
        return {"status": "skipped", "reason": "auto_claim_next disabled"}
    return run_subprocess(
        ["python", "ship-sentinel/scripts/autonomy_loop.py", "claim-next", "--write-brief"],
        dry_run,
    )


def maybe_complete_and_claim(config: dict, dry_run: bool, slice_id: str) -> list[dict]:
    results = []
    if config.get("auto_complete_deterministic", True):
        results.append(
            run_subprocess(
                [
                    "python",
                    "ship-sentinel/scripts/autonomy_loop.py",
                    "complete",
                    "--slice-id",
                    slice_id,
                    "--summary",
                    f"{slice_id} completed by autonomy cycle deterministic recipe.",
                    "--write-brief",
                ],
                dry_run,
            )
        )
    if config.get("auto_claim_after_complete", True):
        results.append(
            run_subprocess(
                ["python", "ship-sentinel/scripts/autonomy_loop.py", "claim-next", "--write-brief"],
                dry_run,
            )
        )
    return results


def build_agent_prompt(config: dict) -> str:
    prompt_parts = []
    for relative_path in config.get("agent_exec", {}).get("prompt_files", []):
        prompt_parts.append((WORKSPACE_ROOT / relative_path).read_text(encoding="utf-8"))
    return "\n\n".join(prompt_parts).strip() + "\n"


def build_agent_command(config: dict) -> list[str]:
    agent_config = config.get("agent_exec", {})
    last_message_path = str((WORKSPACE_ROOT / agent_config.get("last_message_path", "ship-sentinel/ops/autonomy/last-agent-message.md")).resolve())
    command = []
    for part in agent_config.get("command", []):
        command.append(
            part.format(
                workspace_root=str(WORKSPACE_ROOT.resolve()),
                last_message_path=last_message_path,
            )
        )
    if command:
        command[0] = shutil.which(command[0]) or shutil.which(f"{command[0]}.cmd") or command[0]
    return command


def run_agent_exec(config: dict, dry_run: bool) -> dict:
    agent_config = config.get("agent_exec", {})
    if not agent_config.get("enabled", False):
        return {"status": "skipped", "reason": "agent_exec disabled"}

    command = build_agent_command(config)
    prompt = build_agent_prompt(config)
    result = run_subprocess(command, dry_run, stdin_text=prompt)

    stdout_log_path = WORKSPACE_ROOT / agent_config.get("stdout_log_path", "ship-sentinel/ops/autonomy/last-agent-stdout.txt")
    if not dry_run:
        stdout_log_path.write_text((result.get("stdout_tail", "") or "") + "\n" + (result.get("stderr_tail", "") or ""), encoding="utf-8")
    result["stdout_log_path"] = str(stdout_log_path.relative_to(WORKSPACE_ROOT)).replace("\\", "/")
    return result


def execute_cycle(dry_run: bool) -> int:
    ensure_runtime_files()
    state = load_json(STATE_PATH)
    backlog = load_json(BACKLOG_PATH)
    recipes = load_json(ROOT / "ops" / "autonomy" / "executor-recipes.json")
    config = load_json(CONFIG_PATH)

    cycle_receipt = {
        "timestamp": now_stamp(),
        "dry_run": dry_run,
        "before_current_slice": current_slice_id(state),
        "steps": [],
    }
    write_heartbeat("cycle-start", {"dry_run": dry_run, "current_slice": current_slice_id(state)})

    if not current_slice_id(state):
        claim_result = maybe_claim_next(config, dry_run)
        cycle_receipt["steps"].append({"type": "claim-next", **claim_result})
        if not dry_run:
            state = load_json(STATE_PATH)

    slice_id = current_slice_id(state)
    if not slice_id:
        cycle_receipt["status"] = "idle"
        append_cycle_log(cycle_receipt)
        write_heartbeat("idle", {"dry_run": dry_run, "current_slice": ""})
        print("No current slice.")
        return 0

    cycle_receipt["current_slice"] = slice_id

    if recipe_exists(slice_id, recipes):
        exec_result = run_subprocess(
            ["python", "ship-sentinel/scripts/autonomous_executor.py", "run-current"] + (["--dry-run"] if dry_run else []),
            dry_run,
        )
        cycle_receipt["steps"].append({"type": "deterministic-executor", **exec_result})
        if exec_result["status"] == "ok":
            cycle_receipt["steps"].extend(
                {"type": "post-complete", **result} for result in maybe_complete_and_claim(config, dry_run, slice_id)
            )
            cycle_receipt["status"] = "deterministic-complete"
        else:
            cycle_receipt["status"] = "deterministic-failed"
    else:
        agent_result = run_agent_exec(config, dry_run)
        cycle_receipt["steps"].append({"type": "agent-exec", **agent_result})
        if not dry_run:
            refreshed_state = load_json(STATE_PATH)
            cycle_receipt["after_current_slice"] = current_slice_id(refreshed_state)
            cycle_receipt["after_last_completed"] = refreshed_state.get("last_completed_slice_id", "")
        cycle_receipt["status"] = "agent-dispatched" if agent_result.get("status") in {"ok", "planned"} else "agent-failed"

    append_cycle_log(cycle_receipt)
    write_heartbeat(
        cycle_receipt["status"],
        {
            "dry_run": dry_run,
            "current_slice": cycle_receipt.get("current_slice", ""),
            "after_current_slice": cycle_receipt.get("after_current_slice", ""),
            "after_last_completed": cycle_receipt.get("after_last_completed", ""),
        },
    )
    refresh_autonomy_status()
    print(json.dumps(cycle_receipt, ensure_ascii=False, indent=2))
    return 0 if cycle_receipt["status"] in {"idle", "deterministic-complete", "agent-dispatched"} else 1


def watch_loop(dry_run: bool, interval_seconds: int) -> int:
    while True:
        exit_code = execute_cycle(dry_run)
        if dry_run:
            return exit_code
        time.sleep(interval_seconds)


def main() -> int:
    parser = argparse.ArgumentParser(description="Ship Sentinel one-shot or watch autonomy cycle runner")
    subparsers = parser.add_subparsers(dest="command", required=True)

    once_parser = subparsers.add_parser("once")
    once_parser.add_argument("--dry-run", action="store_true")

    watch_parser = subparsers.add_parser("watch")
    watch_parser.add_argument("--dry-run", action="store_true")
    watch_parser.add_argument("--interval", type=int, default=45)

    args = parser.parse_args()

    if args.command == "once":
        return execute_cycle(args.dry_run)
    if args.command == "watch":
        return watch_loop(args.dry_run, args.interval)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
