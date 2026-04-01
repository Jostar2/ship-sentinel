# API Contracts

## Design goal

The first API should support the operator workflow before any automation workflow.

## 1. Audit runs

### `POST /api/audit-runs`

Create a new audit run.

Request:

- service name
- client name
- target URL
- environment
- release goal
- requested by
- due date

Response:

- `audit_run_id`
- summary metadata

### `GET /api/audit-runs/:auditRunId`

Return audit summary, counts, decision state, and owner recommendations.

## 2. Screens

### `POST /api/audit-runs/:auditRunId/screens`

Create or import a screen record.

### `GET /api/audit-runs/:auditRunId/screens`

List screen records with current binding state.

### `PATCH /api/screens/:screenId`

Update screen-level QA note, current status, and helper binding hints.

## 2A. Notes

### `POST /api/notes`

Create a screen-level QA note before escalation.

### `PATCH /api/notes/:noteId`

Update note body, evidence links, and promotion flags.

## 3. Reference artifacts

### `POST /api/screens/:screenId/references`

Attach a Figma, PDF, PPTX, or image reference.

### `GET /api/screens/:screenId/references`

Return all linked artifacts and current state versions.

## 4. Scenarios

### `POST /api/audit-runs/:auditRunId/scenarios`

Create scenario rows.

### `PATCH /api/scenarios/:scenarioId`

Update scenario details, priority, status, or notes.

## 5. Execution results

### `POST /api/scenarios/:scenarioId/executions`

Save an execution result.

### `GET /api/audit-runs/:auditRunId/executions`

List execution history for the audit.

## 6. Evidence assets

### `POST /api/evidence`

Upload evidence from helper or manual UI.

Request:

- `audit_run_id`
- `screen_id`
- `scenario_id`
- `capture_mode`
- `file`
- metadata block

Response:

- `evidence_asset_id`
- linked screen context

### `GET /api/audit-runs/:auditRunId/evidence`

List evidence items and their linkage state.

## 7. Issues

### `POST /api/issues`

Create issue with evidence links.

### `PATCH /api/issues/:issueId`

Update severity, owner, status, and current-state update flag.

## 8. Change requests

### `POST /api/change-requests`

Create current-state update request from an issue.

### `PATCH /api/change-requests/:changeRequestId`

Update owner, status, revised artifact URI, and packaging state.

## 9. Deliverables

### `POST /api/audit-runs/:auditRunId/export`

Generate spreadsheet pack and release memo.

### `GET /api/audit-runs/:auditRunId/packages`

List package versions and generated files.

## 10. Windows helper binding

### `POST /api/helper/session-bind`

Bind desktop helper to active audit and screen.

Request:

- `audit_run_id`
- `screen_id`
- `workspace_origin`
- `endpoint`
- `bind_mode`

Response:

- `helper_binding_id`
- `status`
- `bound_at`

### `GET /api/helper/health`

Return helper availability, version, and bind readiness.

### `POST /api/helper/captures/simulate`

Queue a simulated helper capture for localhost testing.

### `POST /api/helper/captures/claim`

Claim pending helper captures for the active audit run.

### `GET /api/helper/events`

Return helper-side event history for the current audit context.

### `GET /api/helper/receipts`

Return delivery receipts for captures that reached the app session.

### `POST /api/helper/evidence-upload`

Upload clipboard or watched-folder evidence into bound session.
