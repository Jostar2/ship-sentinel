(function () {
  "use strict";

  const STORAGE_KEY = "ship-sentinel:workspace-state:v4";
  const root = document.getElementById("app");
  if (!root) return;

  const seed = window.SHIP_SENTINEL_DEMO_STATE || {};
  const library = Array.isArray(window.SHIP_SENTINEL_RUN_LIBRARY) ? window.SHIP_SENTINEL_RUN_LIBRARY : [];
  const lineage = window.SHIP_SENTINEL_RUN_LINEAGE || {};
  const autonomy = window.SHIP_SENTINEL_AUTONOMY_STATUS || {};

  const state = loadState();
  window.state = state;
  render();
  registerKeys();

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return ensureState(JSON.parse(raw));
    } catch (_) {}
    return ensureState(seed);
  }

  function ensureState(input) {
    const next = JSON.parse(JSON.stringify(input || {}));
    next.meta = next.meta || {};
    next.intake = next.intake || {};
    next.screens = Array.isArray(next.screens) ? next.screens : [];
    next.scenarios = Array.isArray(next.scenarios) ? next.scenarios : [];
    next.evidence = Array.isArray(next.evidence) ? next.evidence : [];
    next.bugs = Array.isArray(next.bugs) ? next.bugs : [];
    next.change_requests = Array.isArray(next.change_requests) ? next.change_requests : [];
    next.notes = Array.isArray(next.notes) ? next.notes : [];
    next.memo = next.memo || { decision: "-", headline: "-", blockers: [], warnings: [], actions: [] };
    next.ui = Object.assign(
      {
        view: "overview",
        flowMode: false,
        selectedScreenId: next.screens[0] ? next.screens[0].screen_id : "",
        selectedScenarioId: next.scenarios[0] ? next.scenarios[0].scenario_id : "",
        selectedEvidenceId: next.evidence[0] ? next.evidence[0].evidence_id : ""
      },
      next.ui || {}
    );
    return next;
  }

  function save() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function currentScreen() {
    return state.screens.find((item) => item.screen_id === state.ui.selectedScreenId) || state.screens[0] || null;
  }

  function currentScenario() {
    return state.scenarios.find((item) => item.scenario_id === state.ui.selectedScenarioId) || state.scenarios[0] || null;
  }

  function currentEvidence() {
    return state.evidence.find((item) => item.evidence_id === state.ui.selectedEvidenceId) || state.evidence[0] || null;
  }

  function render() {
    const screen = currentScreen();
    const scenario = currentScenario();
    const evidence = currentEvidence();
    root.innerHTML = `
      <div class="${state.ui.flowMode ? "shell flow-mode" : "shell"}">
        <nav class="nav-bar">
          ${nav("overview","감사 개요")}${nav("session","QA 세션")}${nav("notes","메모 보드")}${nav("autonomy","자율 운영")}${nav("lineage","라인리지")}${nav("deliverables","산출물")}
        </nav>
        <section class="hero-card">
          <p class="eyebrow">Ship Sentinel</p>
          <h1>세션 중심 QA 작업 OS</h1>
          <p class="helper">설계, 실서비스, 증적, 이슈, 현행화 요청, 산출물을 한 흐름으로 다루는 로컬 제품 셸입니다.</p>
          <div class="badge-row">
            ${badge(state.memo.decision || "검수 진행중","badge-warning")}
            ${badge(`화면 ${state.screens.length}`,"badge-neutral")}
            ${badge(`시나리오 ${state.scenarios.length}`,"badge-neutral")}
            ${badge(`증적 ${state.evidence.length}`,"badge-neutral")}
          </div>
          <div class="button-row">
            <button type="button" class="secondary-button" data-action="toggle-flow">${state.ui.flowMode ? "집중 모드 끄기" : "집중 모드 켜기"}</button>
            <button type="button" class="secondary-button" data-action="export-json">작업 JSON 저장</button>
            <button type="button" class="secondary-button" data-action="reset-demo">데모 초기화</button>
          </div>
        </section>
        <section class="context-bar">
          <p class="eyebrow">고정 문맥 바</p>
          <div class="context-grid">
            ${stat("Audit", state.meta.audit_id || "-", state.meta.client_name || "-")}
            ${stat("화면", screen ? screen.screen_id : "-", screen ? screen.display_name : "-")}
            ${stat("시나리오", scenario ? scenario.scenario_id : "-", scenario ? scenario.title : "-")}
            ${stat("증적", evidence ? evidence.evidence_id : "-", evidence ? evidence.summary : "-")}
            ${stat("Flow", state.ui.flowMode ? "ON" : "OFF", "Alt+F / Esc")}
            ${stat("다음 오너", state.meta.recommended_next_owner || "-", state.memo.headline || "-")}
          </div>
        </section>
        ${renderView(screen, scenario, evidence)}
      </div>
    `;
    bind();
  }

  function renderView(screen, scenario, evidence) {
    if (state.ui.view === "session") return `
      <section class="main-grid section-gap">
        <article class="panel rail-panel"><p class="eyebrow">화면</p><div class="queue-list">${state.screens.map(renderScreen).join("")}</div></article>
        <article class="panel core-panel"><p class="eyebrow">현재 화면</p><div class="compare-grid"><article class="frame-card frame-panel"><strong>레퍼런스</strong><p class="helper">${escapeHtml(((screen && screen.references) || []).join(" / ") || "-")}</p><div class="frame-box">${escapeHtml(screen ? screen.display_name : "선택 필요")}</div></article><article class="frame-card frame-panel"><strong>실서비스 / 증적</strong>${evidence && evidence.preview_data_url ? `<img class="evidence-image" src="${escapeHtml(evidence.preview_data_url)}" alt="preview" />` : `<div class="frame-box compact-frame">${escapeHtml(evidence ? evidence.summary : "증적 없음")}</div>`}</article></div><div class="two-grid section-gap"><article class="subtle-panel"><strong>시나리오</strong><div class="queue-list">${state.scenarios.filter((item)=>item.screen_id===(screen&&screen.screen_id)).map(renderScenario).join("") || empty("연결된 시나리오가 없습니다.")}</div></article><article class="subtle-panel"><strong>화면 메모</strong><p class="helper">${escapeHtml((screen && screen.qa_note) || "메모 없음")}</p>${badge(`버그 ${state.bugs.filter((item)=>item.screen_id===(screen&&screen.screen_id)).length}`,"badge-danger")}${badge(`현행화 ${state.change_requests.filter((item)=>item.screen_id===(screen&&screen.screen_id)).length}`,"badge-warning")}</article></div></article>
        <article class="panel drawer-panel"><p class="eyebrow">증적 / 이슈</p><div class="queue-list">${state.evidence.filter((item)=>item.screen_id===(screen&&screen.screen_id)).map(renderEvidence).join("") || empty("증적 없음")}${state.bugs.filter((item)=>item.screen_id===(screen&&screen.screen_id)).map((item)=>card(item.bug_id,item.title,`${item.status} / ${item.severity}`)).join("")}${state.change_requests.filter((item)=>item.screen_id===(screen&&screen.screen_id)).map((item)=>card(item.change_request_id,item.request_title,`${item.status} / ${item.packaging_state}`)).join("")}</div></article>
      </section>`;
    if (state.ui.view === "notes") return `<section class="panel section-gap"><p class="eyebrow">불일치 클러스터</p><div class="queue-list">${computeClusters().map(renderCluster).join("") || empty("geometry note가 없어 클러스터가 없습니다.")}</div></section>`;
    if (state.ui.view === "autonomy") return `<section class="two-grid section-gap"><article class="panel"><p class="eyebrow">Autonomy 상태</p><div class="three-grid">${stat("현재 slice",(autonomy.state||{}).current_slice_id || "-",(autonomy.heartbeat||{}).current_slice || "-")}${stat("마지막 완료",(autonomy.state||{}).last_completed_slice_id || "-",(autonomy.state||{}).updated_at || "-")}${stat("heartbeat",(autonomy.heartbeat||{}).status || "-",(autonomy.heartbeat||{}).timestamp || "-")}</div></article><article class="panel"><p class="eyebrow">최근 이력</p><div class="queue-list">${(((autonomy.state||{}).history)||[]).slice(-6).reverse().map((item)=>card(item.slice_id,item.summary || "-",item.timestamp || "-")).join("") || empty("이력 없음")}</div></article></section>`;
    if (state.ui.view === "lineage") return `<section class="panel section-gap"><p class="eyebrow">Run Lineage</p><div class="queue-list">${Object.keys(lineage).map((key)=>card(key,(lineage[key]||{}).branch_notes || "-",`nodes ${((lineage[key]||{}).nodes||[]).length} / edges ${((lineage[key]||{}).edges||[]).length}`)).join("") || empty("lineage 데이터 없음")}</div></section>`;
    if (state.ui.view === "deliverables") return `<section class="two-grid section-gap"><article class="panel"><p class="eyebrow">산출물 상태</p><div class="queue-list">${card("Scenario Sheet",`${state.scenarios.length}건`,"테스트 시나리오")}${card("Bug Register",`${state.bugs.length}건`,"버그 등록부")}${card("Evidence Index",`${state.evidence.length}건`,"증적 인덱스")}${card("Release Memo",state.memo.decision || "-",state.memo.headline || "-")}</div></article><article class="panel"><p class="eyebrow">저장된 감사</p><div class="queue-list">${library.map((item)=>`<button type="button" class="queue-button" data-load-audit="${escapeHtml(item.audit_id)}"><div class="row-topline"><strong>${escapeHtml(item.audit_id)}</strong>${badge(item.status || "saved","badge-neutral")}</div><p>${escapeHtml(item.title || "-")}</p><p class="helper">${escapeHtml(item.saved_at || "-")}</p></button>`).join("") || empty("saved run 없음")}</div></article></section>`;
    return `<section class="three-grid section-gap">${stat("릴리즈 판단",state.memo.decision || "-",state.memo.headline || "-")}${stat("블로커",String((state.memo.blockers||[]).length),(state.memo.blockers||[]).join(" / ") || "-")}${stat("경고",String((state.memo.warnings||[]).length),(state.memo.warnings||[]).join(" / ") || "-")}</section><section class="two-grid section-gap"><article class="panel"><p class="eyebrow">핵심 플로우</p><div class="queue-list">${(state.intake.critical_flows||[]).map((item)=>card("플로우",item,"검수 대상")).join("")}</div></article><article class="panel"><p class="eyebrow">즉시 액션</p><div class="queue-list">${(state.memo.actions||[]).map((item)=>card("액션",item,"우선 처리")).join("")}</div></article></section>`;
  }

  function bind() {
    root.querySelectorAll("[data-view]").forEach((node) => node.addEventListener("click", () => { state.ui.view = node.getAttribute("data-view"); renderAndSave(); }));
    root.querySelectorAll("[data-screen]").forEach((node) => node.addEventListener("click", () => { state.ui.selectedScreenId = node.getAttribute("data-screen"); renderAndSave(); }));
    root.querySelectorAll("[data-scenario]").forEach((node) => node.addEventListener("click", () => { state.ui.selectedScenarioId = node.getAttribute("data-scenario"); renderAndSave(); }));
    root.querySelectorAll("[data-evidence]").forEach((node) => node.addEventListener("click", () => { state.ui.selectedEvidenceId = node.getAttribute("data-evidence"); renderAndSave(); }));
    root.querySelectorAll("[data-load-audit]").forEach((node) => node.addEventListener("click", () => { const payload = window.SHIP_SENTINEL_SAVED_RUNS && window.SHIP_SENTINEL_SAVED_RUNS[node.getAttribute("data-load-audit")]; if (payload) { Object.keys(state).forEach((key)=>delete state[key]); Object.assign(state, ensureState(payload)); renderAndSave(); } }));
    root.querySelectorAll("[data-action='toggle-flow']").forEach((node) => node.addEventListener("click", () => { state.ui.flowMode = !state.ui.flowMode; renderAndSave(); }));
    root.querySelectorAll("[data-action='reset-demo']").forEach((node) => node.addEventListener("click", () => { window.localStorage.removeItem(STORAGE_KEY); Object.keys(state).forEach((key)=>delete state[key]); Object.assign(state, ensureState(seed)); renderAndSave(); }));
    root.querySelectorAll("[data-action='export-json']").forEach((node) => node.addEventListener("click", exportJson));
  }

  function registerKeys() {
    window.addEventListener("keydown", (event) => {
      const tag = String((event.target && event.target.tagName) || "").toLowerCase();
      const typing = ["input","textarea","select"].includes(tag) || (event.target && event.target.isContentEditable);
      if (typing) return;
      if ((event.altKey || event.metaKey) && String(event.key).toLowerCase() === "f") { event.preventDefault(); state.ui.flowMode = !state.ui.flowMode; renderAndSave(); }
      if (event.key === "Escape" && state.ui.flowMode) { state.ui.flowMode = false; renderAndSave(); }
    });
  }

  function renderAndSave() { save(); render(); }
  function nav(view, label) { return `<button type="button" class="${state.ui.view === view ? "nav-link nav-link-active" : "nav-link"}" data-view="${view}">${label}</button>`; }
  function renderScreen(screen) { return `<button type="button" class="${state.ui.selectedScreenId === screen.screen_id ? "queue-button queue-button-active" : "queue-button"}" data-screen="${escapeHtml(screen.screen_id)}"><div class="row-topline"><strong>${escapeHtml(screen.screen_id)}</strong>${badge(screen.current_state_status || "-", "badge-neutral")}</div><p>${escapeHtml(screen.display_name || "-")}</p><p class="helper">${escapeHtml(screen.feature_area || "-")} / ${escapeHtml(screen.route_hint || "-")}</p></button>`; }
  function renderScenario(item) { return `<button type="button" class="${state.ui.selectedScenarioId === item.scenario_id ? "queue-button queue-button-active" : "queue-button"}" data-scenario="${escapeHtml(item.scenario_id)}"><div class="row-topline"><strong>${escapeHtml(item.scenario_id)}</strong>${badge(item.status || "-", "badge-neutral")}</div><p>${escapeHtml(item.title || "-")}</p><p class="helper">${escapeHtml(item.expected_result || "-")}</p></button>`; }
  function renderEvidence(item) { return `<button type="button" class="${state.ui.selectedEvidenceId === item.evidence_id ? "queue-button queue-button-active" : "queue-button"}" data-evidence="${escapeHtml(item.evidence_id)}"><div class="row-topline"><strong>${escapeHtml(item.evidence_id)}</strong>${badge(item.upload_state || "수집됨", "badge-neutral")}</div><p>${escapeHtml(item.summary || "-")}</p><p class="helper">${escapeHtml(item.captured_at || "-")} / ${escapeHtml(item.source || "-")}</p></button>`; }
  function renderCluster(cluster) { return `<article class="queue-card"><div class="row-topline"><strong>${escapeHtml(cluster.screen_name)}</strong>${badge(String(cluster.note_count) + "건","badge-warning")}</div><p>${escapeHtml(cluster.coord)} / ${escapeHtml(cluster.panes)}</p><p class="helper">버그 후보 ${cluster.bugCandidates} / 현행화 후보 ${cluster.changeCandidates} / 연결 버그 ${cluster.bugs}</p></article>`; }
  function computeClusters() { const map = Object.create(null); state.notes.filter((note)=>note.geometry && note.geometry.pane).forEach((note)=>{ const x=bucket10(note.geometry.x_pct), y=bucket10(note.geometry.y_pct), id=`${note.screen_id}|${x},${y}`; if(!map[id]) map[id]={screen_name:(state.screens.find((s)=>s.screen_id===note.screen_id)||{}).display_name || note.screen_id, note_count:0, bugCandidates:0, changeCandidates:0, bugs:state.bugs.filter((b)=>b.screen_id===note.screen_id).length, coord:`${Math.round(x*100)}%, ${Math.round(y*100)}%`, panes:""}; map[id].note_count+=1; if(note.promote_to_bug) map[id].bugCandidates+=1; if(note.promote_to_change_request) map[id].changeCandidates+=1; map[id].panes = map[id].panes.includes(note.geometry.pane) ? map[id].panes : (map[id].panes ? `${map[id].panes}, ${note.geometry.pane}` : note.geometry.pane); }); return Object.values(map); }
  function bucket10(value) { let n = Number(value); if (!Number.isFinite(n)) n = 0; if (n > 1) n = n / 100; n = Math.max(0, Math.min(0.999, n)); return Math.floor(n * 10) / 10; }
  function stat(label, value, text) { return `<article class="stat-card"><span class="stat-label">${escapeHtml(label)}</span><span class="stat-value">${escapeHtml(String(value))}</span><p class="helper">${escapeHtml(text || "-")}</p></article>`; }
  function card(label, value, text) { return `<article class="queue-card"><div class="row-topline"><strong>${escapeHtml(label)}</strong></div><p>${escapeHtml(value || "-")}</p><p class="helper">${escapeHtml(text || "-")}</p></article>`; }
  function empty(text) { return `<div class="empty-state">${escapeHtml(text)}</div>`; }
  function badge(text, klass) { return `<span class="badge ${klass}">${escapeHtml(text)}</span>`; }
  function exportJson() { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${state.meta.audit_id || "ship-sentinel"}.json`; a.click(); URL.revokeObjectURL(url); }
  function escapeHtml(value) { return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
})();
