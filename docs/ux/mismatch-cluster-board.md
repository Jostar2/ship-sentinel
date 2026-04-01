# Mismatch Cluster Board

목적: 비교 주석 hot spot을 화면 단위로 묶어서 한 번에 triage한다.

## Placement

- 위치: `메모 보드`
- 조건: geometric note가 하나 이상 있을 때 표시
- 구성:
  - 클러스터 카드
  - selection toolbar

## Cluster Rules

- key: `screen_id + 10% bucket(x_pct, y_pct)`
- pane merge: `reference` / `live`는 같은 좌표 버킷이면 한 카드로 통합
- 카드 정보:
  - 화면명
  - 좌표 근사치
  - note count
  - pane coverage
  - related bug/change count

## Operator Actions

- per-cluster:
  - 버그 후보 토글
  - 현행화 후보 토글
  - 버그 생성(묶음)
  - 현행화 생성(묶음)
  - 연결 버그 상태 순환
  - 연결 현행화 상태 순환
- selection toolbar:
  - 전체 선택
  - 선택 해제
  - 선택 클러스터 일괄 toggle / create / status-cycle

## Interaction Rules

- selection count가 0이면 toolbar action 비활성화
- re-render 시 selection prune
- Notes view를 벗어나면 selection clear
- 모든 toggle / cycle은 `commit()`으로 즉시 화면 갱신

## Verification

- `node --check ship-sentinel\app\app.js`
- 브라우저에서 `ship-sentinel/app/index.html` 열기
- `메모 보드`에서 카드 선택과 toolbar 동작 확인
