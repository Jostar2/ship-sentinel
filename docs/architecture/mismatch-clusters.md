# Mismatch Clusters

지오메트리 기반 메모를 화면 단위 hot spot으로 묶어서, 반복 triage를 한 번에 처리하기 위한 in-app 모델이다.

## Core Rules

- grouping: `screen_id + 10% bucket(x_pct, y_pct)`
- panes: `reference` / `live`는 같은 클러스터에 합쳐서 표시
- source: `state.notes[].geometry`
- persistence: derived only
- schema/API changes: 없음

## UI State

- selected clusters: `state.ui.selectedClusters`
- selection hygiene:
  - render 시 현재 보이는 클러스터로 prune
  - Notes view 이탈 시 clear

## Actions

- per-cluster:
  - 버그 후보 토글
  - 현행화 후보 토글
  - 버그 생성(묶음)
  - 현행화 생성(묶음)
  - 연결 버그 상태 순환
  - 연결 현행화 상태 순환
- board toolbar:
  - 전체 선택 / 선택 해제
  - 선택 클러스터 일괄 toggle / create / status-cycle

## Runtime Notes

- control plane: `registerClusterBoardHandlers()`
- UI refresh: toggle / cycle 이후 `commit()`으로 즉시 반영
- mutations: demo shell in-memory state만 변경

## Verification

- `node --check ship-sentinel\app\app.js`
- 브라우저에서 `app/index.html` 열기
- `메모 보드`에서 클러스터 카드와 toolbar 동작 확인
