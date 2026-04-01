# Autonomy Ops

`ship-sentinel/ops/autonomy`는 다음 슬라이스를 자동으로 선택하고 상태를 기록하기 위한 로컬 운영 레이어다.

핵심 파일:

- `backlog.json`
- `state.json`
- `NEXT_SLICE.md`
- `driver-config.json`
- `AGENT_CONTEXT.md`
- `executor-recipes.json`
- `execution-log.jsonl`
- `cycle-log.jsonl`
- `heartbeat.json`
- `../scripts/start_autonomy_watch.ps1`
- `../scripts/register_autonomy_task.ps1`
- `../scripts/install_startup_launcher.ps1`

역할:

- 다음 ready slice 자동 선택
- backlog가 비면 다음 파동 slice 자동 시드
- 고정 seed가 끝나면 track별 동적 discovery wave 생성
- 현재 진행중 slice 추적
- 의존성 기반 우선순위 정렬
- 다음 작업 brief 자동 생성
- deterministic 로컬 명령 실행
- 실행 receipt 기록
- one-shot autonomy cycle 실행
- 필요 시 `codex exec`로 다음 작업 외부 에이전트 호출
- watch 모드로 반복 실행
- Windows scheduled task 등록 scaffold 제공

한계:

- 실제 완전 무인 장기 실행은 로컬 프로세스를 계속 띄워야 함
- human gate가 필요한 작업은 계속 멈춘다
