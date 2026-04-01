# System Architecture

## Product shape

Ship Sentinel should be built as a multi-part system, not a single web app.

### 1. Web application

Responsibilities:

- audit creation and management
- screen workspace
- issue and evidence management
- change request board
- deliverable packaging

### 2. Windows helper

Responsibilities:

- clipboard image detection
- screenshot file watching
- hotkey capture
- active window metadata collection
- upload into the currently active audit session

### 3. Document parser services

Responsibilities:

- extract frame/page metadata from Figma/PDF/PPTX
- normalize screen IDs
- store reference mappings

### 4. Export engine

Responsibilities:

- generate spreadsheets
- generate release memo
- package evidence bundle

## MVP deployment boundary

### In MVP

- web app
- Windows helper
- PDF metadata ingestion
- Figma link mapping
- spreadsheet export

### Out of MVP

- collaborative editing
- native macOS helper
- browser farm
- multi-tenant enterprise governance

## Recommended technical split

### Frontend

- React + Next.js or React SPA
- workspace-first UI
- local-first optimistic updates for operator speed

### Backend

- Python FastAPI or Node service
- audit domain API
- evidence metadata API
- export job API

### Storage

- relational DB for audit metadata
- object storage for screenshots and files

### Desktop helper

- .NET 8 + WPF for MVP
- local tray app
- loopback or websocket channel to web session

## Why .NET 8 + WPF for helper

- Windows-first product
- easy clipboard and filesystem integration
- strong shell integration
- low friction for tray app and hotkey handling

## Integration points

- web app session token handed to helper
- helper uploads evidence to active audit / active screen
- parser attaches reference artifacts to screen IDs
- export engine reads normalized audit data and generates files
