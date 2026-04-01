# Information Architecture

## Top-level IA

- `/`
  - service positioning
  - deliverables
  - sample audit output
- `/intake/new`
  - client intake
  - audit scope definition
- `/dashboard`
  - sample audit summary
  - ship / fix / block
  - counts and blockers
- `/runs/[runId]/session/[screenId]`
  - persistent context bar
  - screen rail
  - scenario rail
  - reference/live compare
  - capture inbox
  - issue composer
  - spec drift lane
  - evidence timeline
  - package readiness
- `/runs/[runId]/maintenance`
  - current-state update requests
  - revised source uploads
  - back-office packaging status
- `/runs/[runId]/deliverables`
  - export readiness
  - output generation
  - package history

## Core entities

- App
- Audit Run
- Screen
- Scenario
- Execution Result
- Finding
- Evidence Item
- Release Memo
- Change Request
- Deliverable Package
