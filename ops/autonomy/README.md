# Autonomy Ops

`ship-sentinel/ops/autonomy`는 seed와 static config를 두는 위치다.

tracked seed/config:

- `backlog.json`
- `driver-config.json`
- `AGENT_CONTEXT.md`
- `executor-recipes.json`

runtime live state:

- `ship-sentinel/runtime/ops/autonomy/backlog.json`
- `ship-sentinel/runtime/ops/autonomy/state.json`
- `ship-sentinel/runtime/ops/autonomy/NEXT_SLICE.md`
- `ship-sentinel/runtime/ops/autonomy/heartbeat.json`
- `ship-sentinel/runtime/ops/autonomy/cycle-log.jsonl`
- `ship-sentinel/runtime/ops/autonomy/execution-log.jsonl`

역할:

- 다음 ready slice 자동 선택
- backlog 동적 seed / discovery wave 생성
- 현재 slice 추적
- deterministic executor 실행
- `codex exec` handoff
- watch loop / heartbeat 기록

원칙:

- repo에 남는 파일은 seed와 문서
- 실시간 상태와 로그는 `runtime/` 아래 ignored 경로만 사용
- hard human gate가 필요한 작업은 계속 멈춘다
