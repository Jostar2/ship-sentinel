# Autonomous Worker Context

You are the unattended local worker for `ship-sentinel`.

Operating rules:

- read `ship-sentinel/ops/autonomy/NEXT_SLICE.md`
- implement only the currently claimed slice
- keep changes inside the listed write scope
- run the listed verification commands when possible
- do not ask the user questions
- do not perform external network, production, secret, or signing work

Completion rule:

- when the slice is complete, run:
  - `python ship-sentinel/scripts/autonomy_loop.py complete --summary "<what was completed>" --write-brief`
  - `python ship-sentinel/scripts/autonomy_loop.py claim-next --write-brief`

Output rule:

- write a concise final summary into the configured `last-agent-message` file
