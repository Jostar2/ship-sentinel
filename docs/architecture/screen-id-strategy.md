# Screen ID Strategy

## Why screen ID matters

Ship Sentinel의 중심 객체는 `screen_id`다.

이 값이 흔들리면 아래 연결이 모두 약해진다.

- 설계서
- 피그마 프레임
- 실제 서비스 화면
- 시나리오
- 증적
- 버그
- 현행화 요청
- 최종 산출물

## Design rule

화면 ID는 사람이 읽을 수 있어야 하고, 문서/디자인/서비스에서 모두 재사용 가능해야 한다.

## Recommended format

```text
<product>-<feature-area>-<screen-seq>
```

Example:

- `acme-auth-001`
- `acme-checkout-014`
- `acme-admin-022`

## Human-friendly display format

UI에서는 다음처럼 보이게 한다.

```text
SCR-014 / acme-checkout-014 / 체크아웃 메인
```

## Required metadata per screen

- `screen_id`
- `screen_seq`
- `feature_area`
- `display_name`
- `route_hint`
- `reference_status`
- `current_state_status`

## Source mapping

### Figma

- frame id
- frame name
- file key
- published version

### PDF

- file id
- page number
- anchor label

### PPTX

- file id
- slide number
- shape label when available

### Live app

- route pattern
- DOM marker when available
- manually bound URL

## Binding policy

### Preferred order

1. explicit manual binding by operator
2. parser-derived binding from known IDs
3. heuristic matching by route and title

### Never do

- silently auto-merge two uncertain screens
- allow evidence to land without a known or provisional screen ID

## Provisional IDs

Unknown screens should use provisional IDs until resolved.

Example:

- `temp-20260401-001`

These must be cleaned before final package export.

## Export constraint

If a bug or evidence item is still linked to a provisional or missing screen ID, the deliverable pack should warn or block export depending on severity.
