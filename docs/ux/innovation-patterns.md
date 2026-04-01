# Innovation Patterns

## Why this matters

Ship Sentinel이 기존 QA 툴과 달라지려면 기능 수보다 작업 감각이 달라야 한다.

핵심은:

- 페이지를 돌아다니게 하지 않기
- 캡처 이후 업로드 고민을 없애기
- 버그, 문서 불일치, 디자인 변경을 같은 흐름 안에서 분기하기
- 산출물을 마지막에 조립하지 않고 작업 중 누적하기

## Pattern 1. Session-centered UX

대부분의 작업은 `QA Session` 안에서 끝나야 한다.

- Intake는 시작용
- Overview는 얇은 요약용
- Deliverables는 최종 확정용
- 실제 일은 QA Session에서 수행

## Pattern 2. Persistent Context Bar

항상 보여야 하는 정보:

- Audit ID
- Screen ID
- 현재 URL
- 브라우저 / 디바이스
- 활성 시나리오
- 최근 캡처 상태

## Pattern 3. Capture Inbox

캡처는 생성 즉시 inbox에 들어가야 한다.

사용자는 그 캡처를 다음 중 하나로 즉시 분기한다.

- 버그
- 현행화 요청
- 메모
- 보류

## Pattern 4. Spec Drift Lane

차이는 모두 버그가 아니다.

분류 차선:

- 구현 버그
- 설계 미반영
- 문서 미반영
- 디자인 변경 필요

## Pattern 5. Auto-packaging

작업이 끝나면 산출물이 생기는 게 아니라, 작업하는 동안 계속 누적되어야 한다.

- 시나리오 저장 -> scenario sheet 반영
- 버그 생성 -> bug register 반영
- 증적 생성 -> evidence index 반영
- 메모 수정 -> release memo 초안 반영

## Pattern 6. Review / Action Toggle

같은 화면 안에서 비교와 액션을 전환해야 한다.

- Review: 레퍼런스와 실서비스 비교
- Action: 이슈, 요청, 메모 생성
