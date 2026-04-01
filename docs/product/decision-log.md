# Decision Log

## 2026-04-01

### Decision: position Ship Sentinel as a QA workspace, not a generic QA tool

Reason:

- the strongest pain is workflow friction between design, live app, evidence, issue logging, and current-state updates

### Decision: first ICP is agencies

Reason:

- agencies have the clearest pain
- they already use design files and delivery docs
- they can buy faster than enterprise teams
- they can wrap the service into client delivery immediately

### Decision: first wedge is web-first

Reason:

- the design-linking and screen-ID workflow is easier to prove on web products first

### Decision: first reference sources are Figma + PDF

Reason:

- these cover the highest-value early use cases while keeping implementation bounded

### Decision: issue management is internal-first

Reason:

- replacing Jira or deep issue tracker sync too early adds complexity without proving the core workflow
