import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  ClipboardCheck,
  FileSpreadsheet,
  Layers3,
  PanelRight,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

const STORAGE_KEY = "ship-sentinel:workspace-state:v6";
const seed = window.SHIP_SENTINEL_DEMO_STATE || {};
const runLibrary = Array.isArray(window.SHIP_SENTINEL_RUN_LIBRARY) ? window.SHIP_SENTINEL_RUN_LIBRARY : [];
const savedRuns = window.SHIP_SENTINEL_SAVED_RUNS || {};
const QUEUE_VIEWS = [
  { id: "priority", label: "우선 triage" },
  { id: "failed", label: "실패 / P0" },
  { id: "drift", label: "드리프트" },
  { id: "watch", label: "재검수" },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalize(input) {
  const next = clone(input || {});
  next.meta = next.meta || {};
  next.intake = next.intake || {};
  next.memo = next.memo || { decision: "-", headline: "-", blockers: [], warnings: [], actions: [] };
  next.screens = Array.isArray(next.screens) ? next.screens : [];
  next.scenarios = Array.isArray(next.scenarios) ? next.scenarios : [];
  next.evidence = Array.isArray(next.evidence) ? next.evidence : [];
  next.bugs = Array.isArray(next.bugs) ? next.bugs : [];
  next.change_requests = Array.isArray(next.change_requests) ? next.change_requests : [];
  next.inbox = Array.isArray(next.inbox) ? next.inbox : [];
  next.activity_log = Array.isArray(next.activity_log) ? next.activity_log : [];
  const defaultScreenId = preferredScreenId(next);
  const defaultScenarioId = preferredScenarioId(next, defaultScreenId);
  const defaultEvidenceId = preferredEvidenceId(next, defaultScreenId);
  next.ui = Object.assign(
    {
      view: "session",
      screenId: defaultScreenId,
      scenarioId: defaultScenarioId,
      evidenceId: defaultEvidenceId,
      queueView: "priority",
      queueQuery: "",
    },
    next.ui || {}
  );
  return next;
}

function preferredScreenId(snapshot) {
  const screens = Array.isArray(snapshot.screens) ? snapshot.screens.slice() : [];
  if (!screens.length) return "";
  screens.sort((a, b) => screenWeight(a, snapshot) - screenWeight(b, snapshot));
  return screens[0].screen_id;
}

function preferredScenarioId(snapshot, screenId) {
  const scenarios = (snapshot.scenarios || [])
    .filter((item) => item.screen_id === screenId)
    .sort((a, b) => scenarioWeight(a) - scenarioWeight(b));
  return scenarios[0] ? scenarios[0].scenario_id : "";
}

function preferredEvidenceId(snapshot, screenId) {
  const evidence = (snapshot.evidence || []).filter((item) => item.screen_id === screenId);
  const preferred = evidence.find((item) => item.preview_data_url) || evidence[0];
  return preferred ? preferred.evidence_id : "";
}

function screenWeight(screen, snapshot) {
  let score = 20;
  if ((screen.current_state_status || "") === "drifted") score -= 8;
  if ((screen.current_state_status || "") === "pending_review") score -= 4;
  const hasFailedScenario = (snapshot.scenarios || []).some(
    (item) => item.screen_id === screen.screen_id && item.status === "실패"
  );
  if (hasFailedScenario) score -= 6;
  return score;
}

function scenarioWeight(item) {
  let score = 10;
  if (item.status === "실패") score -= 6;
  if (item.status === "미실행") score -= 2;
  if (item.priority === "P0") score -= 3;
  return score;
}

function nextId(prefix, list, field) {
  const max = list.reduce((current, item) => {
    const raw = String((item && item[field]) || "");
    const match = raw.match(/(\d+)$/);
    return Math.max(current, match ? Number(match[1]) : 0);
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

function buildScenarioQueue(snapshot) {
  const screensById = new Map((snapshot.screens || []).map((screen) => [screen.screen_id, screen]));
  const evidenceByScreen = new Map();
  const bugsByScreen = new Map();
  const changesByScreen = new Map();

  for (const item of snapshot.evidence || []) {
    evidenceByScreen.set(item.screen_id, (evidenceByScreen.get(item.screen_id) || 0) + 1);
  }
  for (const item of snapshot.bugs || []) {
    bugsByScreen.set(item.screen_id, (bugsByScreen.get(item.screen_id) || 0) + 1);
  }
  for (const item of snapshot.change_requests || []) {
    changesByScreen.set(item.screen_id, (changesByScreen.get(item.screen_id) || 0) + 1);
  }

  return (snapshot.scenarios || [])
    .map((scenario) => {
      const screen = screensById.get(scenario.screen_id) || null;
      const drifted = screen && screen.current_state_status === "drifted";
      const pendingReview = screen && screen.current_state_status === "pending_review";
      const bugCount = bugsByScreen.get(scenario.screen_id) || 0;
      const changeCount = changesByScreen.get(scenario.screen_id) || 0;
      const evidenceCount = evidenceByScreen.get(scenario.screen_id) || 0;
      return {
        scenario,
        screen,
        bugCount,
        changeCount,
        evidenceCount,
        drifted,
        pendingReview,
        queueWeight: queueWeight(scenario, { drifted, pendingReview, bugCount, changeCount }),
      };
    })
    .sort((a, b) => a.queueWeight - b.queueWeight);
}

function queueWeight(scenario, meta) {
  let score = 100;
  if (scenario.status === "실패") score -= 30;
  if (scenario.priority === "P0") score -= 22;
  if (scenario.priority === "P1") score -= 12;
  if (meta.drifted) score -= 18;
  if (meta.pendingReview) score -= 8;
  if (meta.bugCount > 0) score -= 10;
  if (meta.changeCount > 0) score -= 6;
  if (scenario.status === "미실행") score -= 4;
  return score;
}

function filterScenarioQueue(queue, view, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  return queue.filter((entry) => {
    const matchesView =
      view === "priority"
        ? entry.scenario.status === "실패" || entry.scenario.priority === "P0" || entry.drifted
        : view === "failed"
          ? entry.scenario.status === "실패" || entry.scenario.priority === "P0"
          : view === "drift"
            ? entry.drifted || entry.pendingReview
            : view === "watch"
              ? entry.scenario.status === "미실행" || entry.changeCount > 0
              : true;

    if (!matchesView) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      entry.scenario.scenario_id,
      entry.scenario.title,
      entry.screen?.screen_id,
      entry.screen?.display_name,
      entry.screen?.route_hint,
      entry.scenario.expected_result,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

function queueTone(entry) {
  if (!entry) return "neutral";
  if (entry.scenario.status === "실패") return "danger";
  if (entry.drifted || entry.pendingReview || entry.scenario.priority === "P0") return "warn";
  if (entry.scenario.status === "통과") return "ok";
  return "neutral";
}

function queueHint(entry) {
  if (!entry) return "";
  const hints = [];
  if (entry.drifted) hints.push("드리프트");
  if (entry.scenario.priority === "P0") hints.push("P0");
  if (entry.bugCount > 0) hints.push(`버그 ${entry.bugCount}`);
  if (entry.changeCount > 0) hints.push(`현행화 ${entry.changeCount}`);
  if (entry.evidenceCount > 0) hints.push(`증적 ${entry.evidenceCount}`);
  return hints.join(" · ");
}

function exportState(snapshot) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${snapshot?.meta?.audit_id || "ship-sentinel-run"}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toneForCapture(capture) {
  if (!capture) return "neutral";
  if (capture.status === "버그 생성") return "danger";
  if (capture.status === "현행화 요청") return "warn";
  if (capture.status === "관찰 유지") return "neutral";
  return "ok";
}

export function ShipSentinelApp() {
  const [state, setState] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (_) {}
    return normalize(seed);
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentScreen = state.screens.find((item) => item.screen_id === state.ui.screenId) || state.screens[0] || null;
  const currentScenarios = state.scenarios
    .filter((item) => item.screen_id === (currentScreen ? currentScreen.screen_id : ""))
    .sort((a, b) => scenarioWeight(a) - scenarioWeight(b));
  const currentScenario =
    state.scenarios.find((item) => item.scenario_id === state.ui.scenarioId) || currentScenarios[0] || null;
  const currentEvidenceList = state.evidence.filter((item) => item.screen_id === (currentScreen ? currentScreen.screen_id : ""));
  const currentEvidence =
    state.evidence.find((item) => item.evidence_id === state.ui.evidenceId) || currentEvidenceList[0] || null;
  const currentCapture =
    currentEvidence &&
    (state.inbox.find((item) => item.evidence_id === currentEvidence.evidence_id) || null);
  const scenarioQueue = buildScenarioQueue(state);
  const filteredQueue = filterScenarioQueue(scenarioQueue, state.ui.queueView, state.ui.queueQuery);
  const selectedQueueEntry =
    filteredQueue.find((entry) => entry.scenario.scenario_id === state.ui.scenarioId) ||
    scenarioQueue.find((entry) => entry.scenario.scenario_id === state.ui.scenarioId) ||
    filteredQueue[0] ||
    scenarioQueue[0] ||
    null;
  const failedScenarioCount = state.scenarios.filter((item) => item.status === "실패").length;
  const driftedScreenCount = state.screens.filter((item) => item.current_state_status === "drifted").length;
  const linkedItemCount = state.bugs.length + state.change_requests.length;

  const linkedBug =
    currentEvidence &&
    state.bugs.find(
      (item) => Array.isArray(item.linked_evidence_ids) && item.linked_evidence_ids.includes(currentEvidence.evidence_id)
    );
  const linkedChange =
    currentEvidence &&
    state.change_requests.find(
      (item) => Array.isArray(item.linked_evidence_ids) && item.linked_evidence_ids.includes(currentEvidence.evidence_id)
    );
  const currentLog = currentEvidence
    ? state.activity_log.filter((item) => item.evidence_id === currentEvidence.evidence_id).slice(0, 4)
    : [];

  function update(nextFn) {
    setState((prev) => normalize(nextFn(clone(prev))));
  }

  function selectScreen(screenId) {
    update((next) => {
      next.ui.screenId = screenId;
      const nextScenarios = next.scenarios.filter((item) => item.screen_id === screenId).sort((a, b) => scenarioWeight(a) - scenarioWeight(b));
      const nextEvidence = next.evidence.filter((item) => item.screen_id === screenId);
      next.ui.scenarioId = nextScenarios[0] ? nextScenarios[0].scenario_id : "";
      next.ui.evidenceId = nextEvidence[0] ? nextEvidence[0].evidence_id : "";
      return next;
    });
  }

  function selectScenario(scenarioId) {
    update((next) => {
      next.ui.scenarioId = scenarioId;
      return next;
    });
  }

  function selectQueueScenario(entry) {
    if (!entry) return;
    update((next) => {
      next.ui.screenId = entry.screen?.screen_id || "";
      next.ui.scenarioId = entry.scenario.scenario_id;
      const evidenceForScreen = next.evidence.filter((item) => item.screen_id === entry.scenario.screen_id);
      next.ui.evidenceId = evidenceForScreen[0] ? evidenceForScreen[0].evidence_id : "";
      return next;
    });
  }

  function selectEvidence(evidenceId) {
    update((next) => {
      next.ui.evidenceId = evidenceId;
      return next;
    });
  }

  function promoteBug() {
    if (!currentScreen || !currentEvidence) return;
    update((next) => {
      const bugId = nextId("BUG-", next.bugs, "bug_id");
      next.bugs.unshift({
        bug_id: bugId,
        screen_id: currentScreen.screen_id,
        scenario_id: currentScenario ? currentScenario.scenario_id : "",
        severity: "높음",
        title: `${currentScreen.display_name} - ${currentEvidence.summary}`,
        impact: "Fast path에서 생성된 버그 초안",
        status: "초안",
        drift_type: "구현 버그",
        linked_evidence_ids: [currentEvidence.evidence_id],
      });
      const evidence = next.evidence.find((item) => item.evidence_id === currentEvidence.evidence_id);
      const capture = next.inbox.find((item) => item.evidence_id === currentEvidence.evidence_id);
      if (evidence) evidence.upload_state = "버그 등록됨";
      if (capture) {
        capture.status = "버그 생성";
        capture.suggested_lane = "구현 버그";
      }
      next.activity_log.unshift({
        id: nextId("ACT-", next.activity_log, "id"),
        type: "promote_bug",
        summary: `${bugId} 생성`,
        evidence_id: currentEvidence.evidence_id,
        previous_capture: clone(capture || {}),
        previous_upload_state: "수집됨",
        created_bug_id: bugId,
        timestamp: new Date().toISOString(),
        undone: false,
      });
      return next;
    });
  }

  function promoteChange() {
    if (!currentScreen || !currentEvidence) return;
    update((next) => {
      const changeId = nextId("CR-", next.change_requests, "change_request_id");
      next.change_requests.unshift({
        change_request_id: changeId,
        issue_id: "",
        screen_id: currentScreen.screen_id,
        request_title: `${currentScreen.display_name} - ${currentEvidence.summary} 현행화`,
        owner: "디자인/문서 오너",
        status: "초안",
        packaging_state: "대기",
        linked_evidence_ids: [currentEvidence.evidence_id],
      });
      const evidence = next.evidence.find((item) => item.evidence_id === currentEvidence.evidence_id);
      const capture = next.inbox.find((item) => item.evidence_id === currentEvidence.evidence_id);
      if (evidence) evidence.upload_state = "현행화 요청";
      if (capture) {
        capture.status = "현행화 요청";
        capture.suggested_lane = "문서 미반영";
      }
      next.activity_log.unshift({
        id: nextId("ACT-", next.activity_log, "id"),
        type: "promote_change",
        summary: `${changeId} 생성`,
        evidence_id: currentEvidence.evidence_id,
        previous_capture: clone(capture || {}),
        previous_upload_state: "수집됨",
        created_change_request_id: changeId,
        timestamp: new Date().toISOString(),
        undone: false,
      });
      return next;
    });
  }

  function keepWatch() {
    if (!currentEvidence) return;
    update((next) => {
      const evidence = next.evidence.find((item) => item.evidence_id === currentEvidence.evidence_id);
      const capture = next.inbox.find((item) => item.evidence_id === currentEvidence.evidence_id);
      if (evidence) evidence.upload_state = "관찰 중";
      if (capture) {
        capture.status = "관찰 유지";
        capture.suggested_lane = "추가 검토";
      }
      next.activity_log.unshift({
        id: nextId("ACT-", next.activity_log, "id"),
        type: "watch",
        summary: "관찰 유지",
        evidence_id: currentEvidence.evidence_id,
        previous_capture: clone(capture || {}),
        previous_upload_state: "수집됨",
        timestamp: new Date().toISOString(),
        undone: false,
      });
      return next;
    });
  }

  function undoFastPath() {
    if (!currentEvidence) return;
    update((next) => {
      const action = next.activity_log.find(
        (item) => item.evidence_id === currentEvidence.evidence_id && !item.undone && item.type !== "rollback"
      );
      if (!action) return next;
      if (action.created_bug_id) next.bugs = next.bugs.filter((item) => item.bug_id !== action.created_bug_id);
      if (action.created_change_request_id) next.change_requests = next.change_requests.filter((item) => item.change_request_id !== action.created_change_request_id);
      const evidence = next.evidence.find((item) => item.evidence_id === currentEvidence.evidence_id);
      const capture = next.inbox.find((item) => item.evidence_id === currentEvidence.evidence_id);
      if (evidence) evidence.upload_state = action.previous_upload_state || "수집됨";
      if (capture && action.previous_capture) Object.assign(capture, action.previous_capture);
      action.undone = true;
      next.activity_log.unshift({
        id: nextId("ACT-", next.activity_log, "id"),
        type: "rollback",
        summary: `${action.summary} 되돌림`,
        evidence_id: currentEvidence.evidence_id,
        timestamp: new Date().toISOString(),
        undone: true,
      });
      return next;
    });
  }

  function resetDemo() {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(normalize(seed));
  }

  function nextEvidence() {
    if (!currentEvidenceList.length) return;
    const currentIndex = currentEvidenceList.findIndex((item) => item.evidence_id === state.ui.evidenceId);
    const nextItem = currentEvidenceList[(currentIndex + 1 + currentEvidenceList.length) % currentEvidenceList.length];
    selectEvidence(nextItem.evidence_id);
  }

  function canUndo() {
    if (!currentEvidence) return false;
    return Boolean(
      state.activity_log.find(
        (item) => item.evidence_id === currentEvidence.evidence_id && !item.undone && item.type !== "rollback"
      )
    );
  }

  function bugsFor(screenId) {
    return state.bugs.filter((item) => item.screen_id === screenId);
  }

  function changesFor(screenId) {
    return state.change_requests.filter((item) => item.screen_id === screenId);
  }

  return (
    <div className="qa-shell">
      <motion.header className="hero-neo" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="hero-neo__copy">
          <div className="hero-neo__kicker">
            <Sparkles size={14} />
            <span className="kicker">Ship Sentinel</span>
          </div>
          <h1 className="hero-title" aria-label="QA Session이 설계보다 빠르게 움직이는 검수 콘솔">
            <span>QA Session</span>
            <span>설계보다 빠르게</span>
            <span>움직이는 검수 콘솔</span>
          </h1>
          <p className="hero-copy">
            실패 플로우와 증적 triage를 화면 중앙으로 끌어올렸습니다. 목표는 예쁜 데모가 아니라,
            <strong> 문제 화면을 즉시 고치는 운영 콘솔</strong>입니다.
          </p>
          <div className="hero-chips">
            <StatPill tone="accent" text={state.memo.decision || "검수 진행중"} />
            <StatPill tone="danger" text={`실패 ${failedScenarioCount}`} />
            <StatPill tone="warn" text={`드리프트 ${driftedScreenCount}`} />
            <StatPill tone="neutral" text={`증적 ${state.evidence.length}`} />
          </div>
        </div>
        <aside className="hero-neo__side">
          <div className="hero-side-grid">
            <div className="audit-orb">
              <span>현재 감사</span>
              <strong>{state.meta.audit_id || "-"}</strong>
              <p>{state.meta.client_name || "-"}</p>
            </div>
            <div className="hero-signal-card">
              <div className="hero-signal-card__icon">
                <ShieldAlert size={18} />
              </div>
              <div>
                <span>Mismatch pressure</span>
                <strong>{failedScenarioCount} failed scenarios</strong>
                <p>drifted screen {driftedScreenCount} / 현재 {currentScreen?.screen_id || "-"}</p>
              </div>
            </div>
            <div className="hero-signal-card">
              <div className="hero-signal-card__icon hero-signal-card__icon--cool">
                <Layers3 size={18} />
              </div>
              <div>
                <span>Linked bundle</span>
                <strong>{linkedItemCount} linked outcomes</strong>
                <p>{currentEvidence?.evidence_id || "-"} fast path ready / delivery pack pending</p>
              </div>
            </div>
          </div>
          <div className="hero-neo__actions">
            <button className="ghost-button" type="button" onClick={() => exportState(state)}>작업 JSON 저장</button>
            <button className="ghost-button" type="button" onClick={resetDemo}>데모 초기화</button>
          </div>
        </aside>
      </motion.header>

      <nav className="top-tabs-neo" aria-label="Primary views">
        <button className="top-tabs-neo__trigger" data-state={state.ui.view === "session" ? "active" : "inactive"} type="button" onClick={() => update((next) => { next.ui.view = "session"; return next; })}>QA Session</button>
        <button className="top-tabs-neo__trigger" data-state={state.ui.view === "overview" ? "active" : "inactive"} type="button" onClick={() => update((next) => { next.ui.view = "overview"; return next; })}>Overview</button>
        <button className="top-tabs-neo__trigger" data-state={state.ui.view === "deliverables" ? "active" : "inactive"} type="button" onClick={() => update((next) => { next.ui.view = "deliverables"; return next; })}>Deliverables</button>
      </nav>

      <section className="context-band">
        <ContextCard label="Audit" value={state.meta.audit_id || "-"} detail={state.meta.client_name || "-"} />
        <ContextCard label="Screen" value={currentScreen?.screen_id || "-"} detail={currentScreen?.display_name || "-"} />
        <ContextCard label="Scenario" value={currentScenario?.scenario_id || "-"} detail={currentScenario?.title || "-"} />
        <ContextCard label="Capture" value={currentEvidence?.evidence_id || "-"} detail={currentEvidence?.summary || "-"} />
        <ContextCard label="Decision" value={state.memo.decision || "-"} detail={state.memo.headline || "-"} />
      </section>

      {state.ui.view === "overview" && (
        <section className="overview-grid">
          <Panel label="Release Decision" title={state.memo.decision || "-"} body={state.memo.headline || "-"} />
          <Panel label="Blockers" title={`${state.memo.blockers.length}`} list={state.memo.blockers} />
          <Panel label="Warnings" title={`${state.memo.warnings.length}`} list={state.memo.warnings} />
          <Panel label="Critical Flows" title="운영 핵심 플로우" wide tags={state.intake.critical_flows || []} />
          <Panel label="Next Actions" title="즉시 액션" wide list={state.memo.actions || []} />
        </section>
      )}

      {state.ui.view === "deliverables" && (
        <section className="deliverables-shell">
          <div className="package-banner">
            <div>
              <span className="section-label">Delivery Pack</span>
              <h2>고객에게 넘길 QA 납품 패널</h2>
              <p>시나리오, 버그, 증적, 릴리즈 메모를 마지막 handoff 기준으로 묶는 면입니다.</p>
            </div>
            <StatPill tone="accent" text={state.memo.decision || "-"} />
          </div>
          <div className="package-metrics">
            <InspectCard label="Scenario coverage" value={`${state.scenarios.length} scenarios`} meta="실행 기준 산출물" />
            <InspectCard label="Issue bundle" value={`${state.bugs.length + state.change_requests.length} linked items`} meta="버그 + 현행화 요청" />
            <InspectCard label="Evidence set" value={`${state.evidence.length} captures`} meta="납품 첨부 증적" />
            <InspectCard label="Decision" value={state.memo.decision || "-"} meta={state.memo.headline || "-"} />
          </div>
          <div className="deliverable-tiles">
            <DeliverableTile icon={FileSpreadsheet} label="Scenario Sheet" value={`${state.scenarios.length}건`} meta="테스트 시나리오" />
            <DeliverableTile icon={TriangleAlert} label="Bug Register" value={`${state.bugs.length}건`} meta="버그 등록부" />
            <DeliverableTile icon={ClipboardCheck} label="Evidence Index" value={`${state.evidence.length}건`} meta="증적 인덱스" />
            <DeliverableTile icon={PanelRight} label="Release Memo" value={state.memo.decision || "-"} meta={state.memo.headline || "-"} />
          </div>
          <div className="deliverable-grid">
            <Panel label="Handoff Checklist" title="납품 전 마지막 확인" list={[
              "핵심 P0 시나리오 재검수 완료",
              "차단 버그와 현행화 요청 연결 확인",
              "증적 파일명과 메모 요약 정리",
              "최종 릴리즈 판단 문구 확정",
            ]} />
            <Panel
              label="Saved Runs"
              title="저장된 감사"
              list={[]}
              custom={
                <div className="stack stack-tight">
                  {runLibrary.map((item) => (
                    <RailButton
                      key={item.audit_id}
                      title={item.audit_id}
                      badge={item.status || "saved"}
                      body={item.title || "-"}
                      meta={item.saved_at || "-"}
                      onClick={() => {
                        const payload = savedRuns[item.audit_id];
                        if (payload) setState(normalize(payload));
                      }}
                    />
                  ))}
                </div>
              }
            />
          </div>
        </section>
      )}

      {state.ui.view === "session" && (
        <section className="session-shell">
          <aside className="panel-card panel-card--dark rail-shell">
            <div className="panel-card__head">
              <div>
                <span className="section-label">Scenario Queue</span>
                <h2>대규모 검수를 위한 작업 큐</h2>
              </div>
              <StatPill tone="neutral" text={`${state.scenarios.length} scenarios`} />
            </div>
            <p className="queue-copy">
              시나리오를 화면별로 펼치지 않고, 우선순위 큐와 검색으로 줄입니다. 메인 작업면은 선택된 1건만 깊게 봅니다.
            </p>
            <div className="queue-views" aria-label="Scenario queue views">
              {QUEUE_VIEWS.map((view) => (
                <button
                  key={view.id}
                  className="queue-chip"
                  data-state={state.ui.queueView === view.id ? "active" : "inactive"}
                  type="button"
                  onClick={() =>
                    update((next) => {
                      next.ui.queueView = view.id;
                      return next;
                    })
                  }
                >
                  {view.label}
                </button>
              ))}
            </div>
            <label className="queue-search">
              <span>검색</span>
              <input
                type="text"
                value={state.ui.queueQuery || ""}
                onChange={(event) =>
                  update((next) => {
                    next.ui.queueQuery = event.target.value;
                    return next;
                  })
                }
                placeholder="시나리오 ID, 화면 ID, 화면명, route"
              />
            </label>
            <div className="rail-block">
              <span className="rail-title">Queue Summary</span>
              <div className="queue-summary">
                <ContextCard
                  label="Visible"
                  value={`${filteredQueue.length}`}
                  detail={`현재 뷰 ${QUEUE_VIEWS.find((item) => item.id === state.ui.queueView)?.label || "-"}`}
                />
                <ContextCard label="Failed" value={`${failedScenarioCount}`} detail="즉시 triage 필요" />
                <ContextCard label="Drifted" value={`${driftedScreenCount}`} detail="설계 불일치 화면" />
              </div>
            </div>
            <div className="rail-block">
              <span className="rail-title">Queue Items</span>
              <div className="stack stack-tight">
                {filteredQueue.slice(0, 18).map((entry) => (
                    <RailButton
                      key={entry.scenario.scenario_id}
                      active={state.ui.scenarioId === entry.scenario.scenario_id}
                      title={entry.screen?.screen_id || entry.scenario.scenario_id}
                      badge={`${entry.scenario.status || "-"} / ${entry.scenario.priority || "-"}`}
                      body={entry.scenario.title}
                      meta={`${entry.scenario.scenario_id} / ${entry.screen?.display_name || "-"}`}
                      tone={queueTone(entry)}
                      hint={queueHint(entry)}
                      onClick={() => selectQueueScenario(entry)}
                    />
                ))}
                {!filteredQueue.length ? <EmptyState text="조건에 맞는 시나리오가 없습니다." dark /> : null}
              </div>
            </div>
          </aside>

          <main className="session-main">
            <div className="session-head">
              <div>
                <span className="section-label">QA Session</span>
                <h2>{currentScreen?.display_name || "화면 선택 필요"}</h2>
                <p>{currentScreen ? `${currentScreen.feature_area || "-"} / ${currentScreen.route_hint || "-"} 기준으로 설계와 실서비스를 비교합니다.` : "왼쪽 rail에서 화면을 선택하세요."}</p>
              </div>
              <div className="hero-chips">
                <StatPill tone="neutral" text={currentScreen?.current_state_status || "-"} />
                <StatPill tone="danger" text={`${bugsFor(currentScreen?.screen_id).length} bug`} />
                <StatPill tone="warn" text={`${changesFor(currentScreen?.screen_id).length} change`} />
                <StatPill tone="neutral" text={`${filteredQueue.length} visible in queue`} />
              </div>
            </div>

            <section className="selected-queue-banner">
              <div>
                <span className="section-label">Selected Queue Item</span>
                <h3>{selectedQueueEntry?.scenario.title || currentScenario?.title || "선택된 시나리오 없음"}</h3>
                <p>
                  {selectedQueueEntry
                    ? `${selectedQueueEntry.scenario.scenario_id} / ${selectedQueueEntry.screen?.screen_id || "-"} / ${
                        selectedQueueEntry.screen?.route_hint || "-"
                      }`
                    : "큐에서 선택된 시나리오가 없으면 기본 우선순위 항목을 표시합니다."}
                </p>
              </div>
              <div className="hero-chips">
                <StatPill tone={selectedQueueEntry ? queueTone(selectedQueueEntry) : "neutral"} text={selectedQueueEntry?.scenario.priority || "-"} />
                <StatPill tone="neutral" text={selectedQueueEntry?.scenario.status || "-"} />
                <StatPill tone="warn" text={queueHint(selectedQueueEntry) || "queue info"} />
              </div>
            </section>

            <div className="compare-stage">
              <div className="compare-stage__head">
                <div>
                  <span className="section-label">Compare Stage</span>
                  <h2>설계 기준과 실서비스를 바로 맞대기</h2>
                </div>
                <div className="hero-chips">
                  <StatPill tone="neutral" text="Reference" />
                  <StatPill tone="neutral" text="Live" />
                  <StatPill tone="warn" text="Diff focus" />
                </div>
              </div>
              <p className="compare-stage__copy">
                문서나 피그마를 보고 따로 판단하는 대신, 비교 자체를 화면 중앙에 고정했습니다. mismatch와 bug 후보가 여기서 바로 보여야 합니다.
              </p>

              <div className="inspection-grid">
                <InspectCard label="Reference readiness" value={(currentScreen?.references || []).length ? "자료 연결됨" : "자료 없음"} meta="설계/확정안 연결" />
                <InspectCard label="Scenario pressure" value={currentScenario ? `${currentScenario.priority || "-"} / ${currentScenario.status || "-"}` : "-"} meta="현재 테스트 우선순위" />
                <InspectCard label="Evidence focus" value={currentEvidence?.evidence_id || "-"} meta={currentEvidence?.summary || "증적 선택 필요"} />
                <InspectCard label="Mismatch risk" value={bugsFor(currentScreen?.screen_id).length ? "High" : changesFor(currentScreen?.screen_id).length ? "Medium" : "Low"} meta="현재 화면 기준" />
              </div>

              <div className="compare-panels">
                <div className="compare-panel compare-panel--reference">
                  <div className="compare-panel__head">
                    <div>
                      <span className="section-label">Reference</span>
                      <h3>설계 기준</h3>
                    </div>
                    <StatPill tone={(currentScreen?.references || []).length ? "ok" : "warn"} text={(currentScreen?.references || []).length ? "linked" : "missing"} />
                  </div>
                  <div className="tag-cloud">
                    {(currentScreen?.references || []).map((item) => (
                      <span key={item} className="tag-cloud__item">{item}</span>
                    ))}
                  </div>
                  <div className="frame-stage">{currentScreen?.display_name || "Reference"}</div>
                </div>

                <div className="compare-panel compare-panel--live">
                  <div className="compare-panel__head">
                    <div>
                      <span className="section-label">Live / Evidence</span>
                      <h3>선택된 캡처</h3>
                    </div>
                    <StatPill tone={currentEvidence ? "ok" : "neutral"} text={currentEvidence?.upload_state || "없음"} />
                  </div>
                  <p className="compare-panel__copy">{currentEvidence?.summary || "증적 선택 필요"}</p>
                  {currentEvidence?.preview_data_url ? (
                    <img className="preview-stage" src={currentEvidence.preview_data_url} alt={currentEvidence.summary || "preview"} />
                  ) : (
                    <div className="frame-stage frame-stage--compact">{currentEvidence?.summary || "Evidence"}</div>
                  )}
                </div>
              </div>

              <div className="signal-strip">
                <SignalCard label="Primary mismatch" value={bugsFor(currentScreen?.screen_id)[0]?.title || "치명 불일치 없음"} tone={bugsFor(currentScreen?.screen_id).length ? "danger" : "ok"} />
                <SignalCard label="Doc drift" value={changesFor(currentScreen?.screen_id)[0]?.request_title || "현행화 요청 없음"} tone={changesFor(currentScreen?.screen_id).length ? "warn" : "ok"} />
                <SignalCard label="Next decision" value={state.memo.headline || "-"} tone="neutral" />
              </div>
            </div>
          </main>

          <aside className="fast-console fast-path-panel">
            <div className="fast-console__head">
              <div>
                <span className="section-label">Fast Path</span>
                <h2>Capture → Issue</h2>
              </div>
              <StatPill tone={toneForCapture(currentCapture)} text={currentCapture?.status || "분류대기"} />
            </div>

            <div className="fast-console__spotlight">
              <div className="fast-console__top">
                <div>
                  <span className="spotlight-label">Selected Capture</span>
                  <strong>{currentEvidence?.evidence_id || "증적 없음"}</strong>
                </div>
                <StatPill tone="neutral" text={currentCapture?.suggested_lane || "-"} />
              </div>
              <p>{currentEvidence?.summary || "캡처를 선택하면 바로 triage합니다."}</p>
              <div className="capture-state">{currentEvidence?.upload_state || "수집됨"}</div>
              <div className="tag-cloud">
                <span className="tag-cloud__item tag-cloud__item--dark">소스 {currentEvidence?.source || "-"}</span>
                <span className="tag-cloud__item tag-cloud__item--dark">해상도 {currentEvidence?.capture_resolution || "-"}</span>
                <span className="tag-cloud__item tag-cloud__item--dark">상태 {currentEvidence?.upload_state || "-"}</span>
              </div>
              <div className="fast-console__actions">
                <button className="action-primary" type="button" onClick={promoteBug} disabled={!currentEvidence}>버그 초안 생성</button>
                <button className="action-secondary" type="button" onClick={promoteChange} disabled={!currentEvidence}>현행화 요청</button>
                <button className="action-secondary" type="button" onClick={keepWatch} disabled={!currentEvidence}>관찰 유지</button>
                <button className="action-secondary" type="button" onClick={undoFastPath} disabled={!canUndo()}>되돌리기</button>
                <button className="action-ghost" type="button" onClick={nextEvidence} disabled={currentEvidenceList.length <= 1}>다음 증적</button>
              </div>
            </div>

            <div className="console-stack">
              <ConsoleCard label="Linked Outcome">
                {linkedBug ? (
                  <OutcomeCard id={linkedBug.bug_id} title={linkedBug.title} meta={`${linkedBug.status} / ${linkedBug.severity}`} tone="ok" />
                ) : linkedChange ? (
                  <OutcomeCard id={linkedChange.change_request_id} title={linkedChange.request_title} meta={`${linkedChange.status} / ${linkedChange.packaging_state}`} tone="warn" />
                ) : (
                  <EmptyState text="생성된 결과 없음" dark />
                )}
              </ConsoleCard>
              <ConsoleCard label="Capture Inbox">
                <div className="stack stack-tight">
                  {state.inbox
                    .filter((item) => item.screen_id === currentScreen?.screen_id)
                    .map((item) => (
                      <RailButton
                        key={item.capture_id}
                        active={currentEvidence?.evidence_id === item.evidence_id}
                        title={item.capture_id || item.evidence_id}
                        badge={item.status || "분류대기"}
                        body={item.suggested_lane || "-"}
                        meta={item.evidence_id || "-"}
                        tone={toneForCapture(item) === "danger" ? "danger" : toneForCapture(item) === "warn" ? "warn" : "neutral"}
                        onClick={() => selectEvidence(item.evidence_id)}
                        dark
                      />
                    ))}
                </div>
              </ConsoleCard>
              <ConsoleCard label="Rollback Trail">
                <div className="stack stack-tight">
                  {currentLog.length ? currentLog.map((item) => (
                    <OutcomeCard key={item.id} id={item.id} title={item.summary || item.type} meta={item.timestamp || "-"} tone={item.undone ? "neutral" : "warn"} />
                  )) : <EmptyState text="되돌릴 작업 없음" dark />}
                </div>
              </ConsoleCard>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}

function Panel({ label, title, body, list, tags, wide = false, custom }) {
  return (
    <article className={`panel ${wide ? "wide" : ""}`}>
      <span className="section-label">{label}</span>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
      {tags ? (
        <div className="tag-cloud">
          {tags.map((item) => (
            <span key={item} className="tag-cloud__item">
              {item}
            </span>
          ))}
        </div>
      ) : null}
      {list ? (
        <div className="stack stack-tight">
          {list.map((item) => (
            <OutcomeCard key={item} id="ITEM" title={item} meta={label} tone="neutral" />
          ))}
        </div>
      ) : null}
      {custom || null}
    </article>
  );
}

function ContextCard({ label, value, detail }) {
  return (
    <article className="context-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function StatPill({ tone = "neutral", text }) {
  return <span className={`stat-pill stat-pill--${tone}`}>{text}</span>;
}

function InspectCard({ label, value, meta }) {
  return (
    <article className="inspect-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{meta}</p>
    </article>
  );
}

function SignalCard({ label, value, tone = "neutral" }) {
  return (
    <article className={`signal-card signal-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function OutcomeCard({ id, title, meta, tone = "neutral" }) {
  return (
    <article className={`outcome-card outcome-card--${tone}`}>
      <div className="row">
        <strong>{id}</strong>
        <ArrowUpRight size={14} />
      </div>
      <p>{title}</p>
      <span>{meta}</span>
    </article>
  );
}

function EmptyState({ text, dark = false }) {
  return <div className={`empty-state${dark ? " empty-state--dark" : ""}`}>{text}</div>;
}

function ConsoleCard({ label, children }) {
  return (
    <article className="console-card">
      <span className="section-kicker">{label}</span>
      {children}
    </article>
  );
}

function DeliverableTile({ icon: Icon, label, value, meta }) {
  return (
    <article className="deliverable-tile">
      <div className="deliverable-tile__icon">
        <Icon size={18} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{meta}</p>
    </article>
  );
}

function RailButton({ title, badge, body, meta, hint, tone = "neutral", active = false, onClick, dark = false }) {
  return (
    <button
      type="button"
      className={`rail-card rail-card--${tone}${active ? " rail-card--active" : ""}${dark ? " rail-card--dark" : ""}`}
      onClick={onClick}
    >
      <div className="row">
        <strong>{title}</strong>
        <StatPill tone={tone === "danger" ? "danger" : tone === "warn" ? "warn" : tone === "ok" ? "ok" : "neutral"} text={badge} />
      </div>
      <p>{body}</p>
      <span className="rail-card__meta">{meta}</span>
      {hint ? <span className="rail-card__hint">{hint}</span> : null}
    </button>
  );
}
