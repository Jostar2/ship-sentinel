# Delivery SOP

## 1. Intake

- collect app URL and environment
- collect test accounts
- collect top user flows
- collect release goal and timeline

## 2. Scenario design

- identify money or trust critical flows first
- write scenarios from user intent, not component names
- mark priority and risk level

## 3. Test execution

- run scenarios manually
- record actual result immediately
- capture evidence for failures and risky passes

## 4. Defect logging

- create one bug row per distinct issue
- keep repro steps concrete
- assign severity using a fixed rubric

## 5. Audit packaging

- update bug register
- update evidence index
- summarize blockers and warnings
- produce release memo
- export client summary (client-summary.md)
- compute package diff and delivery history on reruns (package-diff.*, delivery-history.*)

## 6. Handoff

- send audit pack
- walk customer through blockers
- define re-test scope if needed

