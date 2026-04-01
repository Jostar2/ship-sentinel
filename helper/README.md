# Helper

`ship-sentinel/helper`는 Windows helper MVP 전 단계의 로컬 브리지 실험 공간이다.

현재 포함:

- `mock_helper_server.py`

역할:

- `/health` 응답
- `/session-bind` 바인드 응답
- `/captures/simulate` 큐 적재
- `/captures/claim` pending capture 전달
- `/events` helper 이벤트 로그
- `/receipts` delivery receipt 로그
- 브라우저 앱의 localhost handshake 테스트

기본 포트:

- `41741`

## Aging and Retry

- GET /queue/aging: returns `queue_count`, `retry_threshold_seconds`, `warn_threshold_seconds`, `max_delivery_attempts`, `oldest_age_seconds`, `oldest_capture_id`, `warning_count`, `stale_count`, `attempt_high_count`, `attempt_cap_count`.
- POST /captures/retry-stale: prioritizes stale captures (age ≥ threshold) to the front of the queue and records an event. Response also includes the full aging object.

The GET /health payload also includes an `aging` object for quick polling in the app shell.

Enforced policy (HELPER-016):

- Claiming (`POST /captures/claim`) skips items that have reached `max_delivery_attempts` and records an `attempt_cap_reached` event per item.
- Retrying (`POST /captures/retry-stale`) excludes attempt-capped items from prioritization and records a `retry_skipped_capped` event with the count.
