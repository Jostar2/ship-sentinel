# User Flows

## Flow 1. New Audit Intake

1. operator clicks `New Audit`
2. enters service name, target URL, and release goal
3. enters critical flows and risky areas
4. enters test accounts and browser targets
5. saves audit and moves to scenario design

### Key UX requirement

- no wizard fatigue
- support paste-friendly multi-line flow input

## Flow 2. Scenario To QA Session

1. operator selects a screen or scenario
2. QA Session opens with references, live app context, and capture inbox
3. operator executes steps
4. system records execution result
5. operator continues to next scenario or opens issue composer without leaving the session

### Key UX requirement

- the operator should not need to leave QA Session to update execution status

## Flow 3. Bug Capture With Evidence

1. operator finds issue in live app
2. screenshot is captured by helper and lands in Capture Inbox
3. operator drags or classifies it as issue / request / note
4. issue panel opens with screen ID, URL, browser, and timestamp prefilled
5. issue is created and linked to evidence and scenario

### Key UX requirement

- no manual screenshot upload
- no repeated metadata entry

## Flow 4. Current-State Update Request

1. operator creates issue and marks `doc update required`
2. operator classifies the mismatch in Spec Drift Lane
3. system creates current-state request
4. request is visible inside QA Session and later in maintenance board
5. doc owner uploads revised file or links revised figma frame
6. request moves to ready / packed / closed

### Key UX requirement

- issue-to-change-request linkage must be automatic

## Flow 5. Audit Pack Delivery

1. QA lead opens deliverables screen
2. system validates completeness
3. operator exports spreadsheets and memo
4. evidence bundle is attached
5. package version is recorded for delivery

### Key UX requirement

- export must be deterministic and repeatable

## Flow 6. Re-test After Fix

1. issue owner marks fix ready
2. operator reopens affected scenarios only
3. new execution results are recorded
4. existing evidence remains linked; new evidence is appended
5. release memo is updated

### Key UX requirement

- re-test should reuse existing scope, not start a fresh audit from scratch
