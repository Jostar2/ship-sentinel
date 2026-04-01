# Windows Helper Spec

## Purpose

Remove manual screenshot handling and repeated context entry during QA execution.

## Product role

The Windows helper is not optional in the long-term product vision.

It is the layer that enables:

- zero re-upload
- zero re-context
- fast issue creation

## MVP responsibilities

### 1. Clipboard watcher

- detect image content in clipboard
- auto-create evidence item in active audit session

### 2. Screenshot folder watcher

- monitor a configured screenshot folder
- ingest new images automatically

### 3. Hotkey capture

- optional global shortcut for capture submit
- map capture to active screen context

### 4. Active window context

- read window title
- capture timestamp
- attach active browser/app info when possible

### 5. Session binding

- know which Ship Sentinel audit and screen are currently active
- upload evidence into that context automatically

## Current browser-side bridge

Before the real Windows helper ships, the app shell already accepts capture ingress through:

- `window.postMessage({ type: "ship-sentinel:capture", payload })`
- `window.dispatchEvent(new CustomEvent("ship-sentinel:capture", { detail: payload }))`
- browser `paste` event for image clipboard items

Expected payload shape:

- `screen_id`
- `scenario_id`
- `capture_mode`
- `source`
- `summary`
- `suggested_lane`
- `captured_at`
- `file_name`
- `preview_data_url`

This browser bridge is a temporary proving layer, not the final helper product.

The current app shell also exposes:

- helper endpoint field
- active audit/screen binding display
- bind-current-screen action
- bind state progression: `워크스페이스 연결됨 -> 감사 바인드됨 -> 화면 추적중`
- localhost handshake buttons for `health` and `session-bind`
- helper queue push and pending claim test flow
- localhost-helper auto polling path
- helper event log and delivery receipt surface

## Recommended MVP stack

- `.NET 8`
- `WPF`
- tray application
- local config file
- websocket or localhost HTTP channel to web app

## Why this stack

- strongest Windows integration for clipboard and filesystem
- stable hotkey and tray support
- simplest Windows-first operator app path

## UI surface

The helper should stay minimal.

### Tray menu

- current audit
- current screen
- capture mode
- pause auto-upload
- open last uploaded evidence
- settings

### Small panel window

- active workspace binding
- last 5 captures
- upload success / failure
- screenshot folder path

## Config options

- Ship Sentinel workspace URL
- helper bind endpoint
- local screenshot watch folder
- auto-upload on clipboard image on/off
- auto-upload on folder detect on/off
- default capture tag

## Upload payload

Each upload should include:

- `audit_run_id`
- `screen_id`
- `captured_at`
- `capture_mode`
- `window_title`
- `file_name`
- `raw_image`

Optional metadata:

- `browser`
- `source_url`
- `display_scale`
- `screen_resolution`

## Failure handling

- failed uploads remain in a retry queue
- helper should not discard a screenshot before confirmation
- operator should be able to rebind a screenshot to another screen
- helper should surface the currently bound `audit_run_id` and `screen_id` before uploading

## Security guardrails

- user must explicitly bind helper to workspace
- helper should only upload to configured workspace origin
- local cache should be encrypted or at least stored in app data, not temp desktop folders

## Future expansion

- browser extension handshake
- OCR for screen ID detection
- auto-crop by selected window
- smart duplicate detection
