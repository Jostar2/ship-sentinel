# UI Tooling Stack

`Ship Sentinel`의 UI/UX 작업 품질을 빠르게 끌어올리기 위해 별도 프런트 툴체인을 붙였다.

## 설치한 패키지

- `vite`
  - 정적 HTML/JS 기반 앱을 빠르게 띄우고, npm 기반 UI 라이브러리를 바로 시험하기 위한 개발 서버
- `@playwright/test`
  - 실제 브라우저 기준 화면 부팅, 핵심 흐름, 시각 회귀를 검증하기 위한 테스트 러너
- `axe-core`
- `@axe-core/playwright`
  - 접근성 위반을 브라우저 테스트 안에서 바로 잡기 위한 a11y 스캔 조합
- `open-props`
  - 색상, 간격, radius, shadow 같은 디자인 토큰 레이어
- `lucide`
  - 일관된 스트로크 계열 아이콘 시스템
- `motion`
  - 제품 전체에 과하지 않은 entrance / hierarchy animation을 주기 위한 모션 라이브러리
- `@floating-ui/dom`
  - 툴팁, 드롭다운, 컨텍스트 액션, 인라인 메뉴 위치 계산을 위한 floating 레이어 유틸리티
- `prettier`
  - 앱/문서 스타일이 흐트러지지 않게 유지하는 포맷터

## 추가한 실행면

- `npm run ui:dev`
  - Vite 개발 서버
  - 기본 주소: `http://127.0.0.1:41743/app/index.html`
- `npm run ui:build`
  - Vite build
- `npm run ui:test`
  - Playwright 부팅 테스트 포함 전체 UI 테스트
- `npm run ui:test:a11y`
  - 접근성 스캔만 실행
- `npm run format:check`
  - HTML/CSS/JS/문서 포맷 검사

## 같이 추가한 실험 화면

- `app/ui-lab/index.html`
  - Open Props + Lucide + Motion + Floating UI를 한 번에 확인하는 실험 화면
  - Vite 개발 서버 기준 주소: `http://127.0.0.1:41743/app/ui-lab/index.html`

## 추천 브라우저 확장

아래 확장은 OS/브라우저 정책상 터미널에서 강제 설치하지 않았다. 대신 수동 설치 대상으로 고정한다.

- `VisBug`
  - 실서비스 위에서 spacing, typography, alignment를 직접 눈으로 검수하기 좋다
- `Axe DevTools`
  - 접근성 위반을 즉시 눈으로 확인하기 좋다

## 운영 원칙

- 메인 제품이 흔들릴 때는 새 라이브러리를 더 늘리지 않는다
- `QA Session` 중심 화면이 먼저다
- 아이콘, 모션, floating layer는 보조 수단이지 제품 흐름을 대체하지 않는다
- Playwright + axe 결과가 깨지면 UI 고도화보다 먼저 복구한다
