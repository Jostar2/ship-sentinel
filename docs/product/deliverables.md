# Deliverables

## Standard audit pack

### 1. Scenario sheet

- scenario id
- feature area
- scenario title
- preconditions
- steps
- expected result
- priority
- status

### 2. Execution result sheet

- scenario id
- tester
- executed at
- result
- notes
- linked evidence id

### 3. Bug register

- bug id
- title
- severity
- environment
- repro steps
- expected result
- actual result
- impact
- owner recommendation
- linked evidence id

### 4. Evidence index

- evidence id
- type
- file name
- linked scenario
- linked bug
- notes

### 5. Release memo

- scope covered
- blockers
- warnings
- passed areas
- release decision
- next owners

### 6. Evidence bundle manifest

- package version
- generated at
- evidence item list
- evidence storage path

### 7. Package metadata

- audit id
- delivery slug
- generated file list
- package version

## Delivery formats

- `.xlsx` for scenario, execution, bug, and evidence sheets
- `.md` or `.docx` for release memo
- screenshot folder or archive for raw evidence

### 8. Package diff summary (rerun)

- generated at
- previous generated at
- file-level changes (added/removed/changed)
- payload deltas (scenario status changes, added/removed scenarios, bug ids)
- counts summary (scenarios/executions/bugs/evidence)

### 9. Delivery history (audit trail)

- rolling history of packages per audit id
- entry fields: generated_at, package_version, counts (scenarios/executions/bugs/evidence/pass/fail), and decision
- deltas against previous entry for quick change scanning
- outputs: `delivery-history.json` and `delivery-history.md`

### 10. Client summary bundle

- compact handoff summary including coverage counts and deltas
- top blockers and warnings summarized for executives
- next actions/owners for re-test planning
- output: `client-summary.md`
