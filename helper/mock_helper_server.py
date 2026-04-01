from __future__ import annotations

import argparse
import json
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse


def now_stamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def parse_stamp(value: str) -> datetime:
    try:
        return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
    except Exception:
        return datetime.now()


def seconds_between(start: str, end: str | None = None) -> int:
    try:
        a = parse_stamp(start)
        b = parse_stamp(end) if end else datetime.now()
        return max(0, int((b - a).total_seconds()))
    except Exception:
        return 0



class HelperState:
    def __init__(self) -> None:
        self.binding = {
            "helper_binding_id": "",
            "audit_run_id": "",
            "screen_id": "",
            "workspace_origin": "",
            "endpoint": "",
            "bind_mode": "localhost-helper",
            "status": "idle",
            "bound_at": "",
        }
        self.queue: list[dict] = []
        self.events: list[dict] = []
        self.receipts: list[dict] = []
        self.capture_counter = 0
        self.binding_counter = 0
        self.event_counter = 0
        self.receipt_counter = 0
        self.retry_threshold_seconds = 60  # seconds for stale classification
        self.max_delivery_attempts = 5
        self.warn_ratio = 0.5

    def record_event(self, event_type: str, message: str, **payload: object) -> dict:
        self.event_counter += 1
        event = {
            "event_id": f"HEVT-{self.event_counter:03d}",
            "event_type": event_type,
            "message": message,
            "timestamp": now_stamp(),
            **payload,
        }
        self.events.insert(0, event)
        self.events = self.events[:100]
        return event

    def set_binding(self, payload: dict) -> dict:
        self.binding_counter += 1
        helper_binding_id = f"HB-{self.binding_counter:03d}"
        self.binding = {
            "helper_binding_id": helper_binding_id,
            "audit_run_id": payload.get("audit_run_id", ""),
            "screen_id": payload.get("screen_id", ""),
            "workspace_origin": payload.get("workspace_origin", ""),
            "endpoint": payload.get("endpoint", ""),
            "bind_mode": payload.get("bind_mode", "localhost-helper"),
            "status": "bound",
            "bound_at": now_stamp(),
        }
        self.record_event(
            "bind",
            f"{self.binding.get('screen_id', '-')} 화면으로 바인드 완료",
            audit_run_id=self.binding.get("audit_run_id", ""),
            screen_id=self.binding.get("screen_id", ""),
            helper_binding_id=helper_binding_id,
        )
        return self.binding

    def enqueue_capture(self, payload: dict) -> dict:
        self.capture_counter += 1
        capture = {
            "capture_id": f"HLP-CAP-{self.capture_counter:03d}",
            "audit_run_id": payload.get("audit_run_id") or self.binding.get("audit_run_id", ""),
            "screen_id": payload.get("screen_id") or self.binding.get("screen_id", ""),
            "scenario_id": payload.get("scenario_id", ""),
            "capture_mode": payload.get("capture_mode", "helper-simulated"),
            "source": payload.get("source", "Mock Helper Push"),
            "summary": payload.get("summary", "로컬 helper 큐에 캡처가 적재됨"),
            "suggested_lane": payload.get("suggested_lane", "구현 버그"),
            "captured_at": payload.get("captured_at", now_stamp()),
            "enqueued_at": now_stamp(),
            "delivery_attempts": int(payload.get("delivery_attempts", 0)),
            "file_name": payload.get("file_name", f"helper-{self.capture_counter:03d}.png"),
            "preview_data_url": payload.get("preview_data_url", ""),
            "upload_state": payload.get("upload_state", "수집됨"),
            "last_error": payload.get("last_error", ""),
            "image_size": payload.get("image_size", "248 KB"),
            "capture_resolution": payload.get("capture_resolution", "390x844"),
            "is_reference_candidate": bool(payload.get("is_reference_candidate", False)),
        }
        self.queue.append(capture)
        self.record_event(
            "capture_queued",
            f"{capture['capture_id']} queued",
            audit_run_id=capture.get("audit_run_id", ""),
            screen_id=capture.get("screen_id", ""),
            capture_id=capture.get("capture_id", ""),
        )
        return capture

    def claim_captures(self, audit_run_id: str, take: int) -> list[dict]:
        claimed: list[dict] = []
        remaining: list[dict] = []
        max_attempts = int(getattr(self, "max_delivery_attempts", 5))
        for item in self.queue:
            # skip items outside audit scope
            in_scope = (not audit_run_id) or (item.get("audit_run_id") == audit_run_id)
            if not in_scope:
                remaining.append(item)
                continue

            # respect delivery attempt cap
            try:
                attempts = int(item.get("delivery_attempts", 0))
            except Exception:
                attempts = 0
            if attempts >= max_attempts:
                # keep capped items in queue but do not claim again
                remaining.append(item)
                self.record_event(
                    "attempt_cap_reached",
                    f"{item.get('capture_id', '-')}: delivery attempts capped ({attempts}/{max_attempts})",
                    capture_id=item.get("capture_id", ""),
                    audit_run_id=item.get("audit_run_id", ""),
                    screen_id=item.get("screen_id", ""),
                )
                continue

            if len(claimed) < take:
                claimed.append(item)
            else:
                remaining.append(item)
        self.queue = remaining
        for item in claimed:
            # mark delivery attempt for aging/visibility
            try:
                item["delivery_attempts"] = int(item.get("delivery_attempts", 0)) + 1
                item["last_delivery_attempt_at"] = now_stamp()
            except Exception:
                item["delivery_attempts"] = 1
                item["last_delivery_attempt_at"] = now_stamp()
            self.receipt_counter += 1
            receipt = {
                "receipt_id": f"HRCPT-{self.receipt_counter:03d}",
                "capture_id": item.get("capture_id", ""),
                "audit_run_id": item.get("audit_run_id", ""),
                "screen_id": item.get("screen_id", ""),
                "received_at": now_stamp(),
                "status": "delivered",
                "message": "앱 세션으로 전달됨",
            }
            self.receipts.insert(0, receipt)
            self.receipts = self.receipts[:100]
            self.record_event(
                "capture_delivered",
                f"{item.get('capture_id', '-')} delivered",
                audit_run_id=item.get("audit_run_id", ""),
                screen_id=item.get("screen_id", ""),
                capture_id=item.get("capture_id", ""),
                receipt_id=receipt["receipt_id"],
            )
        return claimed

    def recent_events(self, take: int) -> list[dict]:
        return self.events[:take]

    def recent_receipts(self, take: int) -> list[dict]:
        return self.receipts[:take]


    def queue_aging(self) -> dict:
        now = datetime.now()
        oldest_age = 0
        oldest_id = ""
        stale_count = 0
        warning_count = 0
        attempt_high = 0
        attempt_cap = 0
        threshold = int(getattr(self, "retry_threshold_seconds", 60))
        warn_threshold = int(threshold * float(getattr(self, "warn_ratio", 0.5)))
        max_attempts = int(getattr(self, "max_delivery_attempts", 5))
        for item in self.queue:
            ts = item.get("last_activity_at") or item.get("last_delivery_attempt_at") or item.get("enqueued_at") or item.get("captured_at") or now_stamp()
            age = seconds_between(ts)
            if age > oldest_age:
                oldest_age = age
                oldest_id = item.get("capture_id", "")
            if age >= threshold:
                stale_count += 1
            elif age >= warn_threshold:
                warning_count += 1
            try:
                at = int(item.get("delivery_attempts", 0))
                if at >= max_attempts:
                    attempt_cap += 1
                elif at >= max_attempts - 1:
                    attempt_high += 1
            except Exception:
                pass
        return {
            "retry_threshold_seconds": threshold,
            "warn_threshold_seconds": warn_threshold,
            "max_delivery_attempts": max_attempts,
            "oldest_age_seconds": oldest_age,
            "oldest_capture_id": oldest_id,
            "warning_count": warning_count,
            "stale_count": stale_count,
            "attempt_high_count": attempt_high,
            "attempt_cap_count": attempt_cap,
            "queue_count": len(self.queue),
        }

class HelperServer(ThreadingHTTPServer):
    def __init__(self, server_address: tuple[str, int], handler_class: type[BaseHTTPRequestHandler]) -> None:
        super().__init__(server_address, handler_class)
        self.state = HelperState()


class HelperHandler(BaseHTTPRequestHandler):
    server_version = "ShipSentinelHelper/0.2"

    @property
    def helper_state(self) -> HelperState:
        return self.server.state  # type: ignore[attr-defined]

    def _send_json(self, status_code: int, payload: dict) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(encoded)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        if not raw:
            return {}
        return json.loads(raw.decode("utf-8"))

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._send_json(200, {"ok": True})

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._send_json(
                200,
                {
                    "ok": True,
                    "status": "ready",
                    "message": "로컬 helper mock 연결됨",
                    "server_time": now_stamp(),
                    "queue_count": len(self.helper_state.queue),
                    "event_count": len(self.helper_state.events),
                    "receipt_count": len(self.helper_state.receipts),
                    "binding": self.helper_state.binding,
                    "aging": self.helper_state.queue_aging(),
                },
            )
            return
        if parsed.path == "/events":
            query = parse_qs(parsed.query)
            take = int(query.get("take", ["8"])[0])
            self._send_json(
                200,
                {
                    "ok": True,
                    "events": self.helper_state.recent_events(take),
                    "event_count": len(self.helper_state.events),
                },
            )
            return
        if parsed.path == "/receipts":
            query = parse_qs(parsed.query)
            take = int(query.get("take", ["5"])[0])
            self._send_json(
                200,
                {
                    "ok": True,
                    "receipts": self.helper_state.recent_receipts(take),
                    "receipt_count": len(self.helper_state.receipts),
                },
            )
            return
        if parsed.path == "/queue/aging":
            aging = self.helper_state.queue_aging()
            self._send_json(200, {"ok": True, **aging})
            return

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/session-bind":
            payload = self._read_json()
            binding = self.helper_state.set_binding(payload)
            self._send_json(
                200,
                {
                    "ok": True,
                    "helper_binding_id": binding["helper_binding_id"],
                    "status": binding["status"],
                    "bound_at": binding["bound_at"],
                    "message": f"{binding.get('screen_id', '-')} 화면으로 바인드 완료",
                    "queue_count": len(self.helper_state.queue),
                    "event_count": len(self.helper_state.events),
                    "receipt_count": len(self.helper_state.receipts),
                    "echo": payload,
                },
            )
            return

        if parsed.path == "/captures/simulate":
            payload = self._read_json()
            capture = self.helper_state.enqueue_capture(payload)
            self._send_json(
                200,
                {
                    "ok": True,
                    "status": "queued",
                    "message": f"{capture['screen_id']} 캡처가 helper 큐에 추가됨",
                    "queue_count": len(self.helper_state.queue),
                    "event_count": len(self.helper_state.events),
                    "receipt_count": len(self.helper_state.receipts),
                    "capture": capture,
                },
            )
            return

        if parsed.path == "/captures/retry-stale":
            aging = self.helper_state.queue_aging()
            threshold = int(aging.get("retry_threshold_seconds", 60))
            max_attempts = int(aging.get("max_delivery_attempts", 5))
            stale_items = []
            fresh_items = []
            capped_items = []
            for item in self.helper_state.queue:
                # exclude items that already hit attempt cap
                try:
                    attempts = int(item.get("delivery_attempts", 0))
                except Exception:
                    attempts = 0
                if attempts >= max_attempts:
                    capped_items.append(item)
                    continue
                ts = item.get("last_activity_at") or item.get("last_delivery_attempt_at") or item.get("enqueued_at") or item.get("captured_at") or now_stamp()
                if seconds_between(ts) >= threshold:
                    stale_items.append(item)
                else:
                    fresh_items.append(item)
            # Prioritize oldest first among stale, then the rest; attempt-capped remain at the tail
            stale_items.sort(key=lambda x: seconds_between(x.get("enqueued_at") or x.get("captured_at") or now_stamp()), reverse=True)
            self.helper_state.queue = stale_items + fresh_items + capped_items
            if stale_items:
                self.helper_state.record_event("retry_scheduled", f"{len(stale_items)} stale captures prioritized for retry")
            if capped_items:
                self.helper_state.record_event("retry_skipped_capped", f"{len(capped_items)} captures skipped (attempt cap)")
            self._send_json(200, {"ok": True, "status": "retry_scheduled", "stale_count": len(stale_items), "capped_count": len(capped_items), **self.helper_state.queue_aging()})
            return

        if parsed.path == "/captures/claim":
            payload = self._read_json()
            audit_run_id = payload.get("audit_run_id", "")
            take = int(payload.get("take", 1))
            captures = self.helper_state.claim_captures(audit_run_id, take)
            self._send_json(
                200,
                {
                    "ok": True,
                    "status": "claimed",
                    "message": "helper pending capture 조회 완료" if captures else "대기 중인 helper capture 없음",
                    "queue_count": len(self.helper_state.queue),
                    "event_count": len(self.helper_state.events),
                    "receipt_count": len(self.helper_state.receipts),
                    "captures": captures,
                },
            )
            return

        self._send_json(404, {"ok": False, "message": "not found"})

    def log_message(self, format: str, *args: object) -> None:  # noqa: A003
        return


def main() -> None:
    parser = argparse.ArgumentParser(description="Ship Sentinel helper mock server")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=41741)
    args = parser.parse_args()

    server = HelperServer((args.host, args.port), HelperHandler)
    print(f"Ship Sentinel helper mock listening on http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()




