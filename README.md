# Ship Sentinel

`Ship Sentinel`은 고객용 웹서비스와 앱을 대상으로 시나리오 기반 QA 감사와 증적 패키징을 제공하는 서비스형 워크스페이스다.

핵심 제안은 “또 하나의 QA 툴”이 아니다.  
핵심은 “서비스를 직접 검수하고, 증적을 남기고, 엑셀 산출물과 릴리즈 메모까지 한 번에 정리해준다”는 것이다.

## 서비스 약속

- 고객으로부터 URL, 계정, 핵심 플로우를 받는다
- 그것을 구조화된 시나리오 세트로 바꾼다
- 직접 테스트를 수행한다
- 스크린샷, 재현 절차, 증적을 정리한다
- 스프레드시트 기반 QA 감사 패키지와 릴리즈 판단 메모를 전달한다

## 산출물

- 시나리오 시트
- 실행 결과 시트
- 버그 등록부
- 증적 인덱스
- 릴리즈 메모

## 주요 고객

- 클라이언트 납품을 앞둔 에이전시
- 웹앱을 빠르게 만드는 부티크 스튜디오
- QA 체계가 약한 소형 SaaS 팀
- QA 없이 제품을 출시하려는 창업자

## 초기 집중 방향

- 첫 ICP: 에이전시
- 첫 wedge: 웹서비스 QA 워크플로우
- 첫 레퍼런스 소스: Figma + PDF

## 현재 앱 상태

- `ship-sentinel/app`에 세션 중심 상호작용 앱 셸이 있음
- 자동저장, JSON import/export, helper capture ingress mock이 들어가 있음
- 인테이크 기반 새 감사 생성과 file-backed run 저장이 들어가 있음
- app state JSON 또는 `demo-state.js`에서 바로 audit pack export 가능
- 실 helper와 DB는 아직 없음

## Repo layout

- [docs/product/README.md](./docs/product/README.md)
- [docs/ux/README.md](./docs/ux/README.md)
- [docs/architecture/README.md](./docs/architecture/README.md)
- [docs/architecture/autonomy-loop.md](./docs/architecture/autonomy-loop.md)
- [docs/architecture/helper-localhost-bridge.md](./docs/architecture/helper-localhost-bridge.md)
- [docs/product/deliverables.md](./docs/product/deliverables.md)
- [docs/product/delivery-sop.md](./docs/product/delivery-sop.md)
- [docs/product/client-intake.md](./docs/product/client-intake.md)
- [docs/product/export-workflow.md](./docs/product/export-workflow.md)
- [docs/product/qa-workspace-vision.md](./docs/product/qa-workspace-vision.md)
- [web/index.html](./web/index.html)
- [web/workspace.html](./web/workspace.html)
- [web/prototypes/index.html](./web/prototypes/index.html)
- [web/prototypes/qa-session.html](./web/prototypes/qa-session.html)
- [web/styles.css](./web/styles.css)
- [web/app.js](./web/app.js)
- [web/workspace.js](./web/workspace.js)
- [app/README.md](./app/README.md)
- [app/index.html](./app/index.html)
- [app/app.js](./app/app.js)
- [app/styles.css](./app/styles.css)
- [app/data/demo-state.js](./app/data/demo-state.js)
- [helper/README.md](./helper/README.md)
- [helper/mock_helper_server.py](./helper/mock_helper_server.py)
- [data/README.md](./data/README.md)
- [data/autonomy-status.json](./data/autonomy-status.json)
- [data/run-library.json](./data/run-library.json)
- [data/runs/README.md](./data/runs/README.md)
- [app/data/run-library.js](./app/data/run-library.js)
- [app/data/run-payloads.js](./app/data/run-payloads.js)
- [app/data/autonomy-status.js](./app/data/autonomy-status.js)
- [scripts/create_audit_run.py](./scripts/create_audit_run.py)
- [scripts/refresh_run_library.py](./scripts/refresh_run_library.py)
- [scripts/refresh_autonomy_status.py](./scripts/refresh_autonomy_status.py)
- [ops/autonomy/README.md](./ops/autonomy/README.md)
- [ops/autonomy/backlog.json](./ops/autonomy/backlog.json)
- [ops/autonomy/state.json](./ops/autonomy/state.json)
- [ops/autonomy/driver-config.json](./ops/autonomy/driver-config.json)
- [ops/autonomy/AGENT_CONTEXT.md](./ops/autonomy/AGENT_CONTEXT.md)
- [ops/autonomy/executor-recipes.json](./ops/autonomy/executor-recipes.json)
- [ops/autonomy/execution-log.jsonl](./ops/autonomy/execution-log.jsonl)
- [ops/autonomy/cycle-log.jsonl](./ops/autonomy/cycle-log.jsonl)
- [scripts/autonomy_loop.py](./scripts/autonomy_loop.py)
- [scripts/run_autonomy_once.ps1](./scripts/run_autonomy_once.ps1)
- [scripts/autonomous_executor.py](./scripts/autonomous_executor.py)
- [scripts/run_executor_once.ps1](./scripts/run_executor_once.ps1)
- [scripts/autonomy_cycle.py](./scripts/autonomy_cycle.py)
- [scripts/run_autonomy_cycle.ps1](./scripts/run_autonomy_cycle.ps1)
- [scripts/start_autonomy_watch.ps1](./scripts/start_autonomy_watch.ps1)
- [start_autonomy_watch.ps1](./start_autonomy_watch.ps1)
- [scripts/register_autonomy_task.ps1](./scripts/register_autonomy_task.ps1)
- [scripts/install_startup_launcher.ps1](./scripts/install_startup_launcher.ps1)
- [data/demo-audit.json](./data/demo-audit.json)
- [data/demo-workspace.json](./data/demo-workspace.json)
- [data/demo-references.json](./data/demo-references.json)
- `templates/*.xlsx`
