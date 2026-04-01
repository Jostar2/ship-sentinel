# App

`ship-sentinel/app`은 현재 데모 가능한 정적 앱 셸의 canonical 구현 경로다.

## Canonical Files

- `index.html`
- `app.js`
- `styles.css`
- `data/demo-state.js`
- `data/run-library.js`
- `data/run-payloads.js`
- `data/autonomy-status.js`
- `data/run-lineage.js`

## Main Views

- 인테이크
- 감사 개요
- QA 세션
- 현행화 보드
- 메모 보드
- 자율 운영
- 산출물
- 라인리지

## Current Capabilities

- 세션 중심 QA 워크스페이스
- 비교 주석 생성 및 mismatch cluster board
- 빠른 버그 등록 / 현행화 요청 생성
- helper 상태 확인, queue aging 표시, stale 재시도
- `localStorage` 자동저장
- JSON import / export
- file-backed run 생성과 run library 로드
- lineage 표시
- package 확정 및 export 연계

## Flow Mode

- `Alt+F` 토글
- 집중 모드 종료 버튼
- `Escape`로 종료
- 보조 chrome 숨김
- helper panel / polling 억제
- `state.ui.flowMode`에 저장

## Helper Bridge

- `GET /health`
- `GET /queue/aging`
- `POST /session-bind`
- `POST /captures/simulate`
- `POST /captures/claim`
- `POST /captures/retry-stale`

## Related Files

- helper mock: `../helper/mock_helper_server.py`
- run refresh: `../scripts/refresh_run_library.py`
- export: `../scripts/export_audit_pack.py`

## Reference Docs

- `../docs/ux/core-screens.md`
- `../docs/ux/flow-mode.md`
- `../docs/ux/mismatch-cluster-board.md`
- `../docs/architecture/data-model.md`
- `../docs/architecture/api-contracts.md`
- `../docs/architecture/helper-localhost-bridge.md`
- `../docs/architecture/mismatch-clusters.md`
- `../docs/architecture/run-lineage.md`
