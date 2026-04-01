# Component Map

## Web app components

### Audit intake

- `AuditCreateForm`
- `FlowListEditor`
- `RiskListEditor`

### Overview

- `AuditSummaryHeader`
- `CoverageStrip`
- `IssueSummaryBoard`
- `NextActionPanel`

### Screen workspace

- `ScreenRail`
- `ScenarioRail`
- `ReferenceComparePanel`
- `LiveContextPanel`
- `IssueComposer`
- `EvidenceTimeline`

### Change request board

- `ChangeRequestQueue`
- `ChangeRequestDetail`
- `ArtifactRevisionPanel`

### Deliverables

- `ExportChecklist`
- `ExportJobPanel`
- `PackageHistoryList`

## Windows helper components

- `TrayMenu`
- `ClipboardWatcher`
- `FolderWatcher`
- `SessionBinder`
- `RetryQueue`

## Shared service components

- `ReferenceParser`
- `ScreenIdResolver`
- `ExportPackBuilder`
- `AuditDecisionEngine`
### Mismatch Cluster Board

- `MismatchClusterBoard` (lightweight shell)
  - Computes clusters from geometric notes (screen + 10% grid).
  - Renders `ClusterCard` list with pane coverage and related issue counts.
  - `ClusterToolbar` (APP-014) provides board-level multi-select and batch actions; APP-015 adds per-card checkboxes and selection highlighting.
- `registerClusterBoardHandlers` (APP-019) attaches root-level delegated click handlers for cluster and board actions (data-action="cluster-*" / "board-*"). Ensures actions remain active across DOM re-renders in the session-centered app.
- APP-020 finalizes the board in the session app: multi-select toolbar mirrors per-card actions; selection hygiene and delegated handlers remain consistent.
