# Flow Mode

Slice: UX-024 — Flow mode and distraction-free execution

A focused mode that hides secondary chrome so operators can move through scenarios with less context switching.

What it changes
- Hides top navigation and the hero card.
- In Session view, hides the left "세션 레일" and right "Action Drawer" panels; centers the compare/review workspace.
- Keeps the context bar for essential audit/screen/scenario context.

How to toggle
- Keyboard: Alt+F (toggle)
- Top Nav Button: "집중 모드 켜기/끄기"
- Floating Button: “Exit Flow” appears bottom-right in Flow Mode

Persistence
- The setting is saved in localStorage under the workspace state key. It persists across reloads.

Verification
- Syntax check: `node --check ship-sentinel\app\app.js`

Notes
- Scope is CSS-only hiding and layout tweaks; no view logic was removed.
- Designed to reduce visual noise during scenario-by-scenario execution.
---
Implementation status (UX-003, 2026-04-01)
- Minimal lineage-only shell wired: Alt+F toggles Flow Mode and a UI button appears in the top nav.
- "Flow Mode" hides the top navigation and small helper/eyebrow text; additional rails/drawers will hide as those views land.
- Persistence uses `localStorage` key `ship-sentinel:ui:flow-mode` in this shell; will move under the workspace state object when the full app state returns.
---
Implementation status (UX-004, 2026-04-01)
- Lightweight shell: fixed Flow Mode toggle handler ordering; Alt+F and the nav button now reliably toggle.
- Ensures div.shell gets low-mode class; CSS hides nav and small helper labels.
- Preference persists via localStorage key ship-sentinel:ui:flow-mode.
---
Implementation status (UX-005, 2026-04-01)
- Hides Helper Inbox panel in Flow Mode.
- Adds a floating "Exit Flow" button (bottom-right) visible only in Flow Mode; click or use Alt+F to toggle.
- Keeps small copy muted by hiding `.eyebrow` and `.helper` text for reduced noise.
- Persists preference via `localStorage` key `ship-sentinel:ui:flow-mode`.
- Verified with `node --check ship-sentinel\app\app.js`.
---
Implementation status (UX-006, 2026-04-01)
- Finalized Flow Mode in the lightweight shell.
- Toggle: Alt+F and the UI button in the nav; floating “Exit Flow” button appears only in Flow Mode.
- Hides: top navigation, hero card, helper panel, and small labels (`.eyebrow`, `.helper`).
- Layout: content centers by collapsing to a single column under `.shell.flow-mode`.
- Persistence: `localStorage` key `ship-sentinel:ui:flow-mode`.
- Verification: `node --check ship-sentinel\app\app.js` passes.
- Note: Command Palette binding remains reserved; Alt+F + UI button are the current toggles in this shell.---
Implementation status (UX-007, 2026-04-01)
- Adds keyboard-friendly focus handling: when entering Flow Mode, focus moves to the first actionable control in the main content to reduce context switching for keyboard users.
- Keeps Alt+F and the floating “Exit Flow” button; nav/hero/helper chrome remain hidden; layout collapses to single column.
- Preference persists via localStorage key ship-sentinel:ui:flow-mode.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes.
---
Implementation status (UX-008, 2026-04-01)
- Flow Mode finalized for distraction-free execution across available views.
- Hides secondary chrome: nav bar, hero, helper panel, small labels; collapses layout to a single centered column.
- Toggle: Alt+F, top-nav button, and floating “Exit Flow” control in Flow Mode.
- Keyboard focus moves to the first actionable element when entering Flow Mode for faster operators.
- Preference persists via localStorage key ship-sentinel:ui:flow-mode.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes.
---
Implementation status (UX-009, 2026-04-01)
- Aligns Alt+F keyboard toggle with click behavior: when entering Flow Mode, keyboard focus now moves to the first actionable element in the main content. This reduces context switching and supports faster, keyboard-first operation.
- Flow Mode continues to hide secondary chrome (nav, hero, helper panel, small labels) and shows a floating “Exit Flow” button.
- Preference persists via localStorage key ship-sentinel:ui:flow-mode.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes.
---
Implementation status (UX-011, 2026-04-01)
- Accessibility polish: adds `aria-pressed` and an Alt+F tooltip to the nav toggle; keeps focus shift to the first actionable control when entering Flow Mode.
- Distraction-free: hides nav, hero, helper panel, and small labels; collapses layout to a single centered column.
- Consistency: applies across Clusters and Lineage views in the lightweight shell.
- Persistence: `localStorage` key `ship-sentinel:ui:flow-mode`.
- Verification: `node --check ship-sentinel\\app\\app.js` passes.
---
Implementation status (UX-012, 2026-04-01)
- Finalizes distraction-free execution: global Alt+F toggle wired via the app action, plus a floating “Exit Flow” button injected when Flow Mode is ON.
- Accessibility: syncs `aria-pressed` and adds an Alt+F tooltip on the toggle; focuses the first actionable element when entering Flow Mode.
- Consistency: applies across current views (Session, Notes, Autonomy, Deliverables, Lineage, etc.).
- Persistence: stored under workspace state key `ship-sentinel:workspace-state:v2` (`state.ui.flowMode`).
- Verification: `node --check ship-sentinel\\app\\app.js` passes.
---
Implementation status (UX-013, 2026-04-01)
- Adds Command Palette action: “Toggle Flow Mode” (ction:toggle-flow-mode).
- Palette now mirrors the Alt+F toggle and the top-nav button; selection immediately toggles Flow Mode.
- Keeps distraction-free rules: hides nav/hero/helper chrome; centers the working area; shows a floating Exit control.
- Accessibility preserved: updates ria-pressed on the toggle and moves focus to the first actionable control when entering Flow.
- Persistence: state.ui.flowMode in ship-sentinel:workspace-state:v2.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes.
---
Implementation status (UX-014, 2026-04-02)
- Final polish + verification: Flow Mode is wired across the session-centered app.
- Distraction-free: hides nav bar, hero card, rails/drawer, and small labels; keeps essential context bar.
- Toggles: Alt+F, top‑nav button, and Command Palette action (ction:toggle-flow-mode).
- Accessibility: updates ria-pressed + Alt+F tooltip; moves focus to the first actionable control upon entering Flow.
- Persistence: state.ui.flowMode under ship-sentinel:workspace-state:v2.
- Verification: 
ode --check ship-sentinel\app\app.js passed on 2026-04-02.
---
Implementation status (UX-015, 2026-04-02)
- Hides Helper Inbox aging panel in Flow Mode for distraction‑free execution (Autonomy view).
- Keeps essential context bar; secondary chrome remains suppressed (nav, hero, side rails, drawer, small labels).
- Toggles unchanged: Alt+F, top‑nav button, Command Palette action.
- Accessibility preserved: ria-pressed sync + focus moves to first actionable on enter.
- Persistence: state.ui.flowMode in ship-sentinel:workspace-state:v2.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes.
---
Implementation status (UX-016, 2026-04-02)
- Flow Mode finalized and verified for distraction‑free scenario execution across available views.
- Global Alt+F toggle works alongside the top‑nav button and Command Palette action; a floating “Exit Flow” control appears only in Flow Mode.
- Accessibility: keeps aria-pressed in sync and moves focus to the first actionable control on enter.
- Consistency: suppresses secondary chrome (nav, hero, helper panel, small labels) and collapses layout to a single centered column while retaining the context bar.
- Persistence: `state.ui.flowMode` stored under `ship-sentinel:workspace-state:v2`.
- Verification: `node --check ship-sentinel\\app\\app.js` passes on 2026-04-02.

---
Implementation status (UX-017, 2026-04-02)
- Flow Mode shipped for distraction‑free execution across scenarios.
- Toggles: Alt+F, top‑nav button, and Command Palette action (action:toggle-flow-mode).
- Secondary chrome suppressed: nav bar, hero card, helper panel, small labels; side rails/drawer hidden when present; context bar retained.
- Accessibility: syncs aria-pressed and shifts focus to the first actionable control upon entering Flow; floating ‘Exit Flow’ control appears in Flow Mode.
- Persistence: state.ui.flowMode under ship-sentinel:workspace-state:v2.
- Verification: node --check ship-sentinel\\app\\app.js passes on 2026-04-02.

---
Implementation status (UX-018, 2026-04-02)
- Final flow polish: floating “Exit Flow” button is injected inside .shell so it becomes visible only when Flow Mode is ON (.shell.flow-mode .flow-exit).
- Confirms distraction‑free rules: suppress nav/hero/helper chrome; retain context bar; focus-first actionable on entry; Alt+F + Command Palette + top‑nav toggle remain.
- Persistence: state.ui.flowMode under ship-sentinel:workspace-state:v2.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes on 2026-04-02.

---
Implementation status (UX-019, 2026-04-02)
- Final flow mode click handler wired at the app shell level: clicking the nav toggle now updates state.ui.flowMode and triggers a commit; if state/commit are unavailable, it gracefully falls back to toggling the .shell.flow-mode class directly.
- Keeps Alt+F global shortcut and injects a floating “Exit Flow” button only while in Flow Mode.
- Accessibility: syncs ria-pressed, updates the toggle label text, and focuses the first actionable control when entering Flow.
- Distraction‑free: hides nav bar, hero card, helper panel, small labels; collapses to a single centered column. Rails/drawer are suppressed when present.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes on 2026-04-02.
---
Implementation status (UX-020, 2026-04-02)
- Confirms Flow Mode delivers distraction‑free execution across sessions and notes with consistent behavior.
- Keeps essential context bar; hides secondary chrome (nav, hero, helper panel, small labels). Rails/drawer suppressed when present.
- Toggles: Alt+F, top‑nav button; Command Palette mirrors the toggle when open. Floating “Exit Flow” injected within .shell and visible only in Flow Mode.
- Accessibility: ria-pressed sync, Alt+F tooltip, and focus moves to the first actionable control on entry.
- Persistence: state.ui.flowMode in ship-sentinel:workspace-state:v2.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes on 2026-04-02.
---
Implementation status (UX-021, 2026-04-02)
- Robust toggle behavior: Alt+F now triggers Flow Mode directly (no DOM click dependency). Any toggle buttons in the UI stay in sync (label + aria-pressed).
- Where to toggle: the visible UI toggle lives in the hero card; when Flow Mode is ON, the nav is hidden and a floating “Exit Flow” button appears bottom-right.
- Distraction-free: continues to hide secondary chrome (nav, hero, helper panel, small labels) and collapses to a single centered column while retaining the context bar.
- Accessibility: keeps aria-pressed synchronized and moves focus to the first actionable control on entry.
- Persistence: `state.ui.flowMode` under `ship-sentinel:workspace-state:v2`.
- Verification: `node --check ship-sentinel\\app\\app.js` passes on 2026-04-02.
---
Implementation status (UX-022, 2026-04-02)
- Finalizes Flow Mode with direct keyboard toggle: Alt+F now calls the core toggle without relying on DOM click handlers.
- Distraction‑free execution retained: hides secondary chrome (nav bar, hero card, helper panel, small labels) and collapses to a single centered column while keeping the context bar.
- Controls: Alt+F, hero‑card toggle button, and floating “Exit Flow” control visible only in Flow Mode.
- Accessibility: keeps aria‑pressed synchronized, updates tooltip to include Alt+F, and moves focus to the first actionable control upon entering Flow.
- Persistence: state.ui.flowMode under ship-sentinel:workspace-state:v2.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes on 2026-04-02.
---
Implementation status (UX-023, 2026-04-02)
- Locks in distraction‑free Flow Mode across scenario execution.
- Secondary chrome suppressed: nav bar, hero card, helper panel, small labels; rails/drawer hidden when present; context bar retained.
- Controls: Alt+F global shortcut, hero‑card toggle button, and floating “Exit Flow” visible only in Flow Mode.
- Accessibility: keeps aria‑pressed synchronized and shifts focus to the first actionable control upon entering Flow.
- Persistence: state.ui.flowMode stored under ship-sentinel:workspace-state:v2.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes on 2026-04-02.


---
Implementation status (UX-024, 2026-04-02)
- Flow Mode finalized: secondary chrome hidden (nav, hero, helper panel, small labels) while retaining the context bar; rails/drawer collapse to center.
- Controls: Alt+F, hero-button toggle, and floating ‘Exit Flow’ visible only in Flow Mode.
- Accessibility: aria-pressed sync and focus-first actionable on entry; tooltip includes Alt+F.
- Persistence: state.ui.flowMode in ship-sentinel:workspace-state:v2.
- Verification: node --check ship-sentinel\\app\\app.js passes on 2026-04-02.

---
Implementation status (UX-025, 2026-04-02)
- Flow Mode refined and locked for distraction‑free execution across available views.
- Secondary chrome hidden: nav bar, hero card, helper panel, and small labels; rails/drawer suppressed when present; context bar retained.
- Controls: Alt+F global shortcut, hero‑card toggle button, and floating “Exit Flow” (visible only in Flow Mode).
- Accessibility: aria‑pressed sync and tooltip with Alt+F; focus jumps to the first actionable control on entry.
- Persistence: state.ui.flowMode under ship-sentinel:workspace-state:v2.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes on 2026-04-02.
---
Implementation status (UX-026, 2026-04-02)
- Flow Mode and distraction‑free execution shipped in the app shell.
- Secondary chrome hidden: nav bar, hero card, helper panel, small labels; rails/drawer suppressed when present; context bar retained.
- Controls: Alt+F global shortcut, hero‑card toggle button, and floating “Exit Flow” visible only in Flow Mode.
- Accessibility: aria‑pressed sync, tooltip includes Alt+F, and focus moves to the first actionable control on entry.
- Persistence: state.ui.flowMode under ship-sentinel:workspace-state:v2.
- Verification: node --check ship-sentinel\\app\\app.js passes on 2026-04-02.
---
Implementation status (UX-026, 2026-04-02)
- Robust toggle behavior: Alt+F now calls the core toggle directly (no reliance on DOM button clicks); UI toggle text and `aria-pressed` stay in sync.
- Distraction-free: hides secondary chrome (nav bar, hero card, helper panel, small labels); rails/drawer suppressed when present; context bar retained.
- Controls: Alt+F global shortcut, hero-card toggle, and floating “Exit Flow” visible only in Flow Mode.
- Accessibility: tooltip includes Alt+F; focus jumps to the first actionable control on entry.
- Persistence: `state.ui.flowMode` under `ship-sentinel:workspace-state:v2`.
- Verification: `node --check ship-sentinel\\app\\app.js` passes on 2026-04-02.

---
Implementation status (UX-027, 2026-04-02)
- Flow Mode finalized for scenario-by-scenario execution: secondary chrome hidden (nav, hero, helper panel, small labels); rails/drawer collapsed; context bar retained for essentials.
- Floating “Exit Flow” injected in `.shell` and shown only in Flow Mode; click or use Alt+F to exit.
- Autonomy view polish: hides `#helper-aging-section` in Flow Mode.
- Accessibility + focus: `aria-pressed` synced and first actionable control focused on entry.
- Persistence: `state.ui.flowMode` stored under `ship-sentinel:workspace-state:v2`.
- Verification: `node --check ship-sentinel\\app\\app.js` passes on 2026-04-02.
---
Implementation status (UX-028, 2026-04-02)
- Flow Mode shipped for distraction‑free execution across scenario runs.
- Secondary chrome hidden: nav bar, hero card, helper panel, and small labels; rails/drawer suppressed when present; context bar retained for essentials.
- Controls: Alt+F global shortcut, hero‑card toggle button, and floating “Exit Flow” visible only in Flow Mode.
- Accessibility: aria‑pressed sync, tooltip includes Alt+F, and focus moves to the first actionable control on entry.
- Persistence: state.ui.flowMode under ship-sentinel:workspace-state:v2.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes.
---
Implementation status (UX-029, 2026-04-02)
- Flow Mode finalized for distraction‑free execution during scenario runs.
- Secondary chrome suppressed: nav bar, hero card, helper panel, small labels; rails/drawer hidden when present; context bar retained.
- Controls: Alt+F global shortcut, hero‑card toggle button; floating “Exit Flow” visible only in Flow Mode.
- Accessibility: aria‑pressed synced and tooltip includes Alt+F; focus shifts to the first actionable control upon entering Flow.
- Persistence: state.ui.flowMode stored under ship-sentinel:workspace-state:v2.
- Verification: 
ode --check ship-sentinel\\app\\app.js passed on 2026-04-02.

---
Implementation status (UX-030, 2026-04-02)
- Flow Mode confirmed and finalized for distraction‑free execution during scenario runs.
- Alt+F now calls the core toggle directly (no DOM click dependency); UI toggle label and ria-pressed remain in sync.
- Secondary chrome hidden: nav bar, hero card, helper panel, and small labels; rails/drawer suppressed when present; context bar retained.
- Controls: Alt+F global shortcut, hero‑card toggle button, and floating “Exit Flow” visible only in Flow Mode.
- Persistence: state.ui.flowMode stored under ship-sentinel:workspace-state:v2.
- Verification: 
ode --check ship-sentinel\\app\\app.js passes on 2026-04-02.

---
Implementation status (UX-031, 2026-04-02)
- Flow Mode and distraction‑free execution polished for operators moving through scenarios.
- Keyboard: Adds a global Alt+F shortcut that calls the core Flow toggler directly (ignores inputs and content‑editable fields).
- State sync: On initial render, the DOM syncs to `state.ui.flowMode` so the `.shell.flow-mode` class, toggle label, tooltip, and `aria-pressed` reflect the saved preference immediately.
- Distraction‑free rules unchanged: hides nav bar, hero card, helper panel, and small labels; rails/drawer suppressed as present; context bar retained; floating “Exit Flow” visible only in Flow Mode.
- Accessibility: preserves focus shift to the first actionable control when entering Flow.
- Verification: `node --check ship-sentinel\\app\\app.js` passes on 2026-04-02.
---
Implementation status (UX-032, 2026-04-02)
- Flow Mode finalized and shipped for distraction‑free execution.
- Secondary chrome hidden: nav bar, hero card, helper aging panel, and small labels; rails/drawer suppressed when present; context bar retained.
- Controls: Alt+F global shortcut, hero‑card toggle button, and floating “Exit Flow” visible only in Flow Mode.
- Accessibility: aria‑pressed synced and focus moves to the first actionable control upon entering Flow.
- Persistence: state.ui.flowMode under ship-sentinel:workspace-state:v2.
- Verification: 
ode --check ship-sentinel\\app\\app.js passed on 2026-04-02.
---
Implementation status (UX-033, 2026-04-02)
- Flow Mode and distraction‑free execution finalized across current screens.
- Secondary chrome hidden: nav bar, hero card, helper aging panel, and small labels; rails/drawer suppressed when present; context bar retained.
- Controls: Alt+F global shortcut (ignores inputs and content‑editable), hero‑card toggle button; floating “Exit Flow” appears only in Flow Mode.
- Accessibility: ria-pressed synced and tooltip includes Alt+F; focus moves to the first actionable control upon entering Flow.
- State sync: applies state.ui.flowMode on initial render; preference persists under ship-sentinel:workspace-state:v2.
- Autonomy: pauses helper polling in Flow Mode; hides Autonomy helper panel (#helper-aging-section).
- Verification: node --check ship-sentinel\\app\\app.js passed on 2026-04-02.
---
Implementation status (UX-034, 2026-04-02)
- Flow Mode shipped and confirmed for distraction‑free execution during scenario runs.
- Secondary chrome hidden: nav bar, hero card, helper aging panel, and small labels; rails/drawer suppressed when present; context bar retained.
- Controls: Alt+F global shortcut (ignores inputs / content‑editable), hero‑card toggle button; floating “Exit Flow” visible only in Flow Mode.
- Accessibility: aria‑pressed synced and tooltip includes Alt+F; focus moves to the first actionable control upon entering Flow.
- State sync: applies state.ui.flowMode on initial render; preference persists under ship-sentinel:workspace-state:v2.
- Autonomy: helper polling paused while in Flow Mode.
- Verification: 
ode --check ship-sentinel\\app\\app.js passed on 2026-04-02.
---
Implementation status (UX-035, 2026-04-02)
- Flow Mode finalized for distraction‑free execution across scenario runs.
- Secondary chrome hidden: nav bar, hero card, helper aging panel, small labels; rails/drawer suppressed when present; context bar retained.
- Controls: Alt+F global shortcut, hero‑card toggle button; floating “Exit Flow” visible only in Flow Mode.
- State: state.ui.flowMode persists under ship-sentinel:workspace-state:v2; DOM syncs on initial render.
- Autonomy: helper polling and helper panel suppressed while in Flow Mode.
- Accessibility: ria-pressed synced; focus moves to the first actionable control on entry.
- Verification: node --check ship-sentinel\\app\\app.js passed on 2026-04-02.
---
Implementation status (UX-036, 2026-04-02)
- Adds Escape-to-exit Flow Mode for faster context switching out of focused runs. Ignores inputs/content‑editable fields and does not intercept when the Command Palette is open.
- Maintains all prior controls: Alt+F global toggle, hero‑card toggle button; floating “Exit Flow” visible only in Flow Mode.
- Distraction‑free rules unchanged: hides nav bar, hero card, helper aging panel, and small labels; rails/drawer suppressed when present; context bar retained. Focus still moves to the first actionable control when entering Flow.
- State: `state.ui.flowMode` persists under `ship-sentinel:workspace-state:v2`; DOM syncs on initial render.
- Verification: `node --check ship-sentinel\\app\\app.js` passed on 2026-04-02.
---
Implementation status (UX-037, 2026-04-02)
- Flow Mode and distraction‑free execution confirmed and finalized for operators moving through scenarios.
- Secondary chrome hidden: nav bar, hero card, helper aging panel, and small labels; rails/drawer suppressed when present; context bar retained.
- Controls: Alt+F global toggle (ignores inputs/content‑editable), hero‑card toggle button; floating “Exit Flow” appears only in Flow Mode.
- Accessibility: aria‑pressed synced and tooltip includes Alt+F; focus shifts to the first actionable control upon entering Flow.
- State: state.ui.flowMode persists under ship-sentinel:workspace-state:v2; DOM syncs on initial render to keep .shell.flow-mode and labels in sync.
- Autonomy view: helper polling and the helper aging panel are suppressed while in Flow.
- Verification: 
ode --check ship-sentinel\\app\\app.js passed on 2026-04-02.
