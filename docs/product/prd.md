# PRD

## Summary

Ship Sentinel is a QA audit service that tests a customer's product, collects evidence, and delivers a spreadsheet-based audit pack plus a release decision memo.

## Primary users

- founder preparing a release
- PM or operator who needs a structured external QA pass
- agency handing off a product to a client

## Problem

Customers can ship faster than they can verify. They lack:

- business-critical scenario coverage
- consistent evidence collection
- a usable defect register
- a clear release recommendation

## Goals

- produce a reusable audit workflow for app QA services
- standardize client deliverables
- reduce ambiguity between testing activity and release recommendation

## Non-goals

- replacing client QA teams
- becoming a full observability platform
- owning production support
- shipping generic "AI test generation" as the primary value proposition

## MVP scope

### Included

- service landing and sample audit dashboard
- client intake structure
- scenario template
- execution result template
- bug register template
- evidence index template
- release memo structure

### Excluded

- live scanner orchestration
- billing workflow
- browser farm infrastructure
- auto-generated issue tracker sync

## Core service flow

1. collect product URL, environments, accounts, and priority flows
2. draft scenarios from real user journeys
3. execute tests and gather screenshots or logs
4. record defects and evidence in structured spreadsheets
5. summarize release decision in a memo

## Functional requirements

- FR-01: define a repeatable client intake workflow
- FR-02: define a repeatable scenario-writing structure
- FR-03: define a bug register with severity and repro standards
- FR-04: define an evidence index customers can review
- FR-05: define a release memo that answers ship / fix / block
- FR-06: show these artifacts in a sample dashboard or prototype

## Success metrics

- time from intake to first audit pack
- audit packs delivered per month
- repeat customer rate
- percentage of audits that lead to paid re-test or release gate follow-up
