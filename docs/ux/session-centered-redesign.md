# Session-Centered Redesign

## Design decision

Ship Sentinel should not feel like a traditional multi-screen QA suite.

It should feel like:

`one long working table for one audit session`

## Core shift

### Old direction

- intake screen
- overview screen
- screen workspace
- change request board
- deliverables page

### New direction

- intake
- thin overview
- one dominant `QA Session`
- deliverables confirmation
- change request board only for overflow or back-office maintenance

## Primary product surface

The main product is `QA Session`.

That single surface should contain:

- persistent context bar
- screen rail
- scenario rail
- reference/live compare
- capture inbox
- issue composer
- spec drift lane
- evidence timeline
- package readiness strip

## UX ideas to keep

### 1. Persistent context bar

Always visible:

- audit ID
- screen ID
- current URL
- browser / device
- active scenario
- latest capture status

### 2. Capture Inbox

Every capture lands in an inbox immediately.

The operator should be able to turn a capture into:

- issue
- current-state update request
- note
- discard

### 3. Spec Drift Lane

The product should not treat every mismatch as a bug.

It should classify drift into:

- bug
- implementation mismatch
- document not updated
- design change needed

### 4. Auto-packaging strip

The bottom of the session should show what the final package already has:

- scenarios
- bug register
- evidence index
- release memo inputs

The package should accumulate continuously, not only at the end.

## Screens to demote

### Overview

- keep as a summary-only entry
- do not let it become a second workspace

### Change Request Board

- keep for doc owners and batch cleanup
- do not make operators leave the session for every request

### Deliverables

- make it mostly a final review and export confirmation surface

## Product rule

If a feature forces the operator to leave the current screen too often, it likely belongs inside `QA Session` instead.
