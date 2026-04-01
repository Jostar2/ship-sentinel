# Core Screens

This document defines the five product-defining screens for Ship Sentinel.

The objective is not to produce pretty SaaS screens. The objective is to remove friction from real QA work.

## Screen 1. Client Intake

### Route

- `/intake/new`

### Purpose

- start a new QA audit without losing context
- collect just enough information to begin scenario design

### Primary user

- QA operator
- delivery manager

### Core jobs

- identify the product under test
- identify release goal and priority flows
- identify accounts and environments
- define testing scope before execution starts
- create the first audit run file without leaving the screen

### Must-have blocks

- basic project identity
  - service name
  - client name
  - target URL
  - environment
- release context
  - release goal
  - requested due date
  - delivery priority
- access package
  - test accounts
  - browser / device targets
- flow definition
  - critical flows
  - risky areas
  - out-of-scope areas

### UX rules

- single-page form, not a wizard for MVP
- default to multi-line list entry for critical flows and risk areas
- auto-save drafts
- no hidden required fields
- new audit creation should also produce a reusable local run file

### Success metric

- one operator should create a usable audit scope in under 5 minutes

## Screen 2. Audit Overview

### Route

- `/runs/[runId]`

### Purpose

- give a quick decision-level summary of the audit
- show whether the operator should continue execution, triage, or package delivery

### Primary user

- QA operator
- PM
- delivery owner

### Core jobs

- understand audit status
- see progress against scenario coverage
- understand blocker count and release risk
- jump to the correct next workspace

### Must-have blocks

- audit metadata
  - app
  - target URL
  - owner
  - due date
- release status card
  - ship / fix / block
  - confidence score
  - next owner
- coverage strip
  - planned
  - executed
  - passed
  - failed
  - blocked
- issue summary
  - blockers
  - warnings
  - current-state requests
- action rail
  - continue testing
  - open workspace
  - export memo

### UX rules

- summary first, detail second
- every metric must click through to underlying rows
- do not show raw logs at top level

### Success metric

- a PM should understand release health in under 60 seconds

## Screen 3. QA Session

### Route

- `/runs/[runId]/session/[screenId]`

### Purpose

- make almost all QA execution happen in one place

### Primary user

- QA operator

### Core jobs

- compare spec and real implementation
- execute scenario
- receive captures automatically
- create issue
- classify spec drift
- create current-state update request
- monitor export readiness

### Layout

- persistent top bar
  - audit id
  - screen id
  - URL
  - browser/device
  - current scenario
  - latest capture state
- left rail
  - screen list
  - scenario list
  - quick filters
- main center
  - live app view or captured current screen
  - reference/live compare
- right panel
  - capture inbox
  - issue composer
  - spec drift classification
  - current-state update toggle
- bottom panel
  - evidence timeline
  - history
  - package readiness

### Must-have blocks

- linked references
  - figma frame
  - pdf page
  - current-state doc version
- issue creation
  - title
  - severity
  - actual result
  - expected result
- capture inbox
  - latest screenshot
  - drag to issue / request / note / discard
- spec drift lane
  - bug
  - implementation mismatch
  - document not updated
  - design change needed
- evidence panel
  - timeline
  - screenshot source
  - attach to issue
- evidence preview
  - selected capture preview
  - capture metadata
- screen note
  - QA note
  - follow-up memo
- helper binding
  - active audit binding
  - active screen binding

### UX rules

- issue creation should complete within 10 seconds after a capture
- screenshot should appear automatically without manual upload
- screen ID must remain visible at all times
- references and live state must be viewable side-by-side
- operators should not have to move to a different screen for most issues
- keyboard shortcuts should cover screen navigation, scenario navigation, capture triage, and quick registration

### Success metric

- operator can move from “found a bug” to “registered with evidence and classified for follow-up” in one uninterrupted flow

## Screen 4. Deliverable Packager

### Route

- `/runs/[runId]/deliverables`

### Purpose

- gather the final audit outputs and ship them as one client-facing bundle

### Primary user

- QA lead
- delivery manager

### Core jobs

- verify audit completeness
- generate spreadsheets and memo
- attach evidence folder
- package final delivery set

### Must-have blocks

- completeness checklist
  - scenarios done
  - bug register updated
  - evidence linked
  - memo drafted
- output generator
  - test scenarios xlsx
  - execution xlsx
  - bug register xlsx
  - evidence index xlsx
  - release memo
- delivery package history
  - package version
  - generated at
  - generated by

### UX rules

- show missing data before allowing export
- never generate a final pack with orphaned evidence ids
- export should preserve stable filenames

### Success metric

- final package should be ready in under 2 minutes after QA closure

## Screen 5. Maintenance Board

### Route

- `/runs/[runId]/maintenance`

### Purpose

- handle overflow current-state update work and revised artifact management

### Primary user

- QA lead
- designer
- documentation owner

### Core jobs

- see which issues require design/doc updates
- upload revised files
- track packaging readiness
- close out document current-state tasks

### Must-have blocks

- request queue
  - open
  - in progress
  - ready to pack
  - closed
- request detail
  - linked issue
  - linked screen id
  - revised artifact upload
  - packaging state

### UX rules

- maintenance board should not be the main operator home
- most change requests should be creatable and viewable from QA Session
- this screen should be optimized for back-office cleanup, not primary execution

### Success metric

- doc owners can resolve and close requests without corrupting the export package

## Screen 6. Autonomy Control Center

### Route

- `/autonomy`

### Purpose

- surface unattended execution state without opening local files

### Primary user

- operator
- builder

### Core jobs

- see current slice
- confirm heartbeat freshness
- inspect recent cycle receipts
- inspect recent executor receipts
- read last agent message

### Must-have blocks

- heartbeat card
- current slice card
- last completed slice card
- cycle receipt list
- executor receipt list
- last agent message preview

## Product-level UX standards

- every screen must expose `current screen ID`, `current audit ID`, and `current artifact context`
- repeated metadata entry should be avoided everywhere
- the product should prefer side-by-side comparison over tab switching
- every important action should leave an auditable trace
