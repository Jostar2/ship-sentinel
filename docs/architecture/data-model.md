# Data Model

## Model philosophy

The core spine of the product is `screen_id`.

Everything important should be traceable back to:

- audit run
- screen
- scenario
- evidence
- issue
- change request
- deliverable package

## Entities

### AuditRun

Purpose:

- top-level QA engagement or release review container

Fields:

- `audit_run_id`
- `client_name`
- `service_name`
- `target_url`
- `environment`
- `release_goal`
- `requested_by`
- `due_at`
- `decision_status`
- `recommended_next_owner`
- `created_at`
- `updated_at`

### Screen

Purpose:

- canonical screen object used to connect design, implementation, and QA records

Fields:

- `screen_id`
- `audit_run_id`
- `name`
- `feature_area`
- `route_hint`
- `status`
- `current_reference_version`
- `qa_note`
- `qa_note_updated_at`

### ReferenceArtifact

Purpose:

- external source of truth for the screen

Fields:

- `reference_artifact_id`
- `screen_id`
- `source_type` (`figma`, `pdf`, `pptx`, `image`)
- `source_uri`
- `source_version`
- `frame_or_page_ref`
- `confirmed_state`
- `uploaded_at`

### Scenario

Purpose:

- structured test intent

Fields:

- `scenario_id`
- `audit_run_id`
- `screen_id`
- `feature_area`
- `priority`
- `title`
- `goal`
- `preconditions`
- `steps`
- `expected_result`
- `risk_tag`
- `status`

### ExecutionResult

Purpose:

- record of scenario execution

Fields:

- `execution_result_id`
- `scenario_id`
- `screen_id`
- `executed_by`
- `executed_at`
- `environment`
- `browser`
- `device`
- `result`
- `observed_result`
- `notes`

### EvidenceAsset

Purpose:

- screenshot, log, HAR, video, or attachment linked to the audit

Fields:

- `evidence_asset_id`
- `audit_run_id`
- `screen_id`
- `scenario_id`
- `issue_id`
- `source_type`
- `capture_mode` (`clipboard`, `file_watch`, `manual_upload`, `browser_extension`)
- `file_name`
- `storage_path`
- `captured_at`
- `window_title`
- `source_url`
- `browser`
- `device`
- `width`
- `height`

### Issue

Purpose:

- defect or mismatch record

Fields:

- `issue_id`
- `audit_run_id`
- `screen_id`
- `scenario_id`
- `severity`
- `category`
- `title`
- `expected_result`
- `actual_result`
- `repro_steps`
- `impact`
- `status`
- `evidence_asset_ids`
- `current_state_update_required`

### ChangeRequest

Purpose:

- doc/design current-state update request created from QA work

Fields:

- `change_request_id`
- `audit_run_id`
- `screen_id`
- `issue_id`
- `target_reference_artifact_id`
- `request_title`
- `requested_change`
- `owner`
- `status`
- `revised_artifact_uri`
- `packed_in_package_id`

### Note

Purpose:

- preserve screen-level QA thinking before it becomes a bug or change request

Fields:

- `note_id`
- `audit_run_id`
- `screen_id`
- `scenario_id`
- `note_type`
- `body`
- `linked_evidence_ids`
- `promote_to_bug`
- `promote_to_change_request`
- `reference_version`
- `created_at`
- `updated_at`

### DeliverablePackage

Purpose:

- final export bundle for the client or release review

Fields:

- `deliverable_package_id`
- `audit_run_id`
- `version`
- `generated_by`
- `generated_at`
- `scenario_sheet_uri`
- `execution_sheet_uri`
- `bug_register_uri`
- `evidence_index_uri`
- `release_memo_uri`
- `evidence_bundle_uri`

### HelperBinding

Purpose:

- keep desktop helper or browser bridge attached to the correct active audit and screen

Fields:

- `helper_binding_id`
- `audit_run_id`
- `screen_id`
- `bind_mode`
- `workspace_origin`
- `endpoint`
- `status`
- `last_ingress_at`
- `last_capture_id`

### HelperEvent

Purpose:

- record helper-side state changes and delivery milestones

Fields:

- `event_id`
- `audit_run_id`
- `screen_id`
- `capture_id`
- `event_type`
- `message`
- `timestamp`

### HelperReceipt

Purpose:

- confirm which helper capture was actually delivered into the app session

Fields:

- `receipt_id`
- `capture_id`
- `audit_run_id`
- `screen_id`
- `received_at`
- `status`
- `message`

## Core relationships

- `AuditRun 1:N Screen`
- `Screen 1:N ReferenceArtifact`
- `Screen 1:N Scenario`
- `Scenario 1:N ExecutionResult`
- `Screen 1:N EvidenceAsset`
- `Screen 1:N Note`
- `Screen 1:N Issue`
- `Issue 1:N ChangeRequest`
- `AuditRun 1:N DeliverablePackage`

## Important design rule

If an item cannot be tied to `audit_run_id` and `screen_id`, it should be treated as unlinked and blocked from final package export.
