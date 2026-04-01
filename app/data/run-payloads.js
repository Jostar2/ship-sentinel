window.SHIP_SENTINEL_SAVED_RUNS = {
  "audit-2026-04-01-acme": {
    "meta": {
      "audit_id": "audit-2026-04-01-acme",
      "client_name": "Acme Commerce",
      "service_name": "Acme Support Portal",
      "target_url": "https://staging.acme-support.example",
      "environment": "스테이징",
      "release_goal": "베타 출시 전 릴리즈 준비도 검수",
      "requested_by": "Mina Kim",
      "delivery_date": "2026-04-01",
      "recommended_next_owner": "백엔드 리드",
      "package_version": "v1.2"
    },
    "intake": {
      "accounts": "buyer@test.example / admin@test.example",
      "critical_flows": [
        "Login and dashboard access",
        "Checkout and payment",
        "Account recovery",
        "Admin export access"
      ],
      "known_risks": [
        "Auth middleware recently changed",
        "Checkout logic was refactored this sprint"
      ],
      "browsers": [
        "Chrome Desktop",
        "Safari iPhone"
      ],
      "out_of_scope": [
        "대규모 부하 테스트",
        "다국어 번역 검수"
      ]
    },
    "screens": [
      {
        "screen_id": "acme-auth-001",
        "display_name": "로그인 화면",
        "feature_area": "인증",
        "route_hint": "/login",
        "current_state_status": "matched",
        "references": [
          "Figma: Login / Default",
          "PDF: acme-auth-flow p.3"
        ]
      },
      {
        "screen_id": "acme-checkout-014",
        "display_name": "체크아웃 메인",
        "feature_area": "결제",
        "route_hint": "/checkout",
        "current_state_status": "drifted",
        "references": [
          "Figma: Checkout / Main",
          "PDF: acme-checkout p.14"
        ],
        "qa_note": "결제 CTA 클릭 직후 상태 전환이 멈추고, 문서 기준 로딩 상태도 노출되지 않음.",
        "qa_note_updated_at": "2026-04-01 10:24"
      },
      {
        "screen_id": "acme-order-015",
        "display_name": "주문 확인",
        "feature_area": "결제",
        "route_hint": "/order/complete",
        "current_state_status": "pending_review",
        "references": [
          "Figma: Order Complete",
          "PDF: acme-checkout p.15"
        ]
      }
    ],
    "scenarios": [
      {
        "scenario_id": "SCN-001",
        "screen_id": "acme-auth-001",
        "priority": "P0",
        "title": "유효한 계정으로 로그인",
        "steps": "1. 로그인 페이지 진입\n2. 계정 입력\n3. 제출",
        "expected_result": "대시보드가 오류 없이 열린다",
        "status": "통과"
      },
      {
        "scenario_id": "SCN-002",
        "screen_id": "acme-checkout-014",
        "priority": "P0",
        "title": "카드 결제 완료",
        "steps": "1. 상품 추가\n2. 체크아웃 진입\n3. 카드 입력\n4. 결제 제출",
        "expected_result": "주문 확인 화면으로 이동",
        "status": "실패"
      },
      {
        "scenario_id": "SCN-003",
        "screen_id": "acme-checkout-014",
        "priority": "P1",
        "title": "빈 장바구니 예외 처리",
        "steps": "1. /checkout 직접 진입",
        "expected_result": "장바구니 안내와 복귀 CTA 노출",
        "status": "미실행"
      }
    ],
    "evidence": [
      {
        "evidence_id": "EVD-001",
        "screen_id": "acme-auth-001",
        "scenario_id": "SCN-001",
        "captured_at": "2026-04-01 10:00",
        "source": "Windows helper",
        "summary": "로그인 후 대시보드 정상 상태",
        "file_name": "login-success.png",
        "upload_state": "수집됨",
        "image_size": "182 KB",
        "capture_resolution": "1440x900",
        "is_reference_candidate": false
      },
      {
        "evidence_id": "EVD-002",
        "screen_id": "acme-checkout-014",
        "scenario_id": "SCN-002",
        "captured_at": "2026-04-01 10:21",
        "source": "Windows helper",
        "summary": "결제 제출 직후 크래시 화면",
        "file_name": "checkout-crash-1.png",
        "upload_state": "수집됨",
        "image_size": "264 KB",
        "capture_resolution": "390x844",
        "is_reference_candidate": false
      },
      {
        "evidence_id": "EVD-021",
        "screen_id": "acme-checkout-014",
        "scenario_id": "SCN-002",
        "captured_at": "2026-04-01 10:22",
        "source": "Clipboard",
        "summary": "에러 직후 추가 캡처",
        "file_name": "checkout-crash-2.png",
        "upload_state": "수집됨",
        "image_size": "291 KB",
        "capture_resolution": "390x844",
        "is_reference_candidate": true,
        "preview_data_url": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 420'%3E%3Crect width='640' height='420' fill='%23f4ede2'/%3E%3Crect x='38' y='46' width='564' height='62' rx='12' fill='%23d76d43'/%3E%3Crect x='38' y='126' width='564' height='220' rx='18' fill='%23fffaf2' stroke='%23d5c1a6'/%3E%3Ctext x='56' y='86' font-size='26' font-family='Segoe UI' fill='white'%3ECheckout Error State%3C/text%3E%3Ctext x='56' y='172' font-size='20' font-family='Segoe UI' fill='%2333241d'%3EEVD-021%3C/text%3E%3Ctext x='56' y='212' font-size='18' font-family='Segoe UI' fill='%236a5d52'%3E결제 제출 직후 크래시가 재현된 캡처%3C/text%3E%3Ctext x='56' y='252' font-size='18' font-family='Segoe UI' fill='%236a5d52'%3ETwitter / Safari iPhone / 390x844%3C/text%3E%3C/svg%3E"
      }
    ],
    "bugs": [
      {
        "bug_id": "BUG-001",
        "screen_id": "acme-checkout-014",
        "scenario_id": "SCN-002",
        "severity": "차단",
        "title": "결제 제출 후 체크아웃이 크래시남",
        "impact": "매출 플로우 출시 차단",
        "status": "열림",
        "drift_type": "구현 버그"
      }
    ],
    "change_requests": [
      {
        "change_request_id": "CR-003",
        "issue_id": "BUG-001",
        "screen_id": "acme-checkout-014",
        "request_title": "체크아웃 상태 문서 현행화",
        "owner": "UX 디자이너",
        "status": "열림",
        "packaging_state": "대기"
      }
    ],
    "inbox": [
      {
        "capture_id": "CAP-001",
        "evidence_id": "EVD-021",
        "screen_id": "acme-checkout-014",
        "scenario_id": "SCN-002",
        "status": "분류대기",
        "suggested_lane": "구현 버그"
      }
    ],
    "notes": [
      {
        "note_id": "NOTE-001",
        "screen_id": "acme-checkout-014",
        "scenario_id": "SCN-002",
        "note_type": "qa",
        "body": "체크아웃 문구와 로딩 상태가 설계서와 달라 버그와 문서 미반영 가능성이 동시에 보임.",
        "linked_evidence_ids": [
          "EVD-021"
        ],
        "promote_to_bug": true,
        "promote_to_change_request": true,
        "reference_version": "checkout-main-v7",
        "created_at": "2026-04-01 10:23",
        "updated_at": "2026-04-01 10:24"
      }
    ],
    "memo": {
      "decision": "수정 후 출시",
      "headline": "현재 상태로는 출시가 어렵습니다",
      "blockers": [
        "결제 제출 후 체크아웃 크래시",
        "관리자 export 접근 권한 누락"
      ],
      "warnings": [
        "주 네비게이션 아이콘 라벨 누락",
        "랜딩 페이지 번들 크기 초과"
      ],
      "actions": [
        "관리자 export 경로 보호",
        "체크아웃 크래시 수정",
        "매출 플로우 재검수"
      ]
    }
  }
};
