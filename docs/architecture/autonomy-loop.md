# Autonomy Loop

## Goal

Make `Ship Sentinel` continue from one slice to the next without the operator deciding the next task every time.

## What this layer does now

- keeps a structured backlog
- marks the current slice
- picks the next ready slice from dependencies and priority
- seeds the next wave automatically when the backlog runs dry
- generates dynamic next-wave slices per track when the seed wave is exhausted
- writes a `NEXT_SLICE.md` brief
- runs deterministic recipes
- writes execution receipts
- can dispatch `codex exec` through a local cycle runner when configured

## What this layer does not do yet

- it does not self-approve network or deployment work
- it does not bypass human gates
- it still relies on a local long-running process if true unattended operation is desired

## Local files

- `ops/autonomy/backlog.json`
- `ops/autonomy/state.json`
- `ops/autonomy/NEXT_SLICE.md`
- `ops/autonomy/driver-config.json`
- `ops/autonomy/AGENT_CONTEXT.md`
- `ops/autonomy/executor-recipes.json`
- `ops/autonomy/execution-log.jsonl`
- `ops/autonomy/cycle-log.jsonl`
- `ops/autonomy/heartbeat.json`
- `scripts/autonomy_loop.py`
- `scripts/run_autonomy_once.ps1`
- `scripts/autonomous_executor.py`
- `scripts/run_executor_once.ps1`
- `scripts/autonomy_cycle.py`
- `scripts/run_autonomy_cycle.ps1`
- `scripts/start_autonomy_watch.ps1`
- `start_autonomy_watch.ps1`
- `scripts/register_autonomy_task.ps1`
- `scripts/install_startup_launcher.ps1`

## Commands

- `python ship-sentinel\scripts\autonomy_loop.py status`
- `python ship-sentinel\scripts\autonomy_loop.py claim-next --write-brief`
- `python ship-sentinel\scripts\autonomy_loop.py brief --write`
- `python ship-sentinel\scripts\autonomy_loop.py complete --summary "slice done" --write-brief`
- `python ship-sentinel\scripts\autonomous_executor.py status`
- `python ship-sentinel\scripts\autonomous_executor.py run-current --dry-run`
- `python ship-sentinel\scripts\autonomous_executor.py tail-log --limit 10`
- `python ship-sentinel\scripts\autonomy_cycle.py once --dry-run`
- `python ship-sentinel\scripts\autonomy_cycle.py watch --interval 45`
- `powershell -File ship-sentinel\scripts\start_autonomy_watch.ps1`
- `powershell -File ship-sentinel\scripts\install_startup_launcher.ps1`

## Next step to become more autonomous

The current layer already has a local runner.

The next layer after this is:

- richer agent completion detection
- better human-gate pausing and resumption
- background service hardening and better Windows startup control
