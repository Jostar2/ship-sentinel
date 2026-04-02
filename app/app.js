(function(){
  'use strict';
  var root = document.getElementById('app');
  if (!root) return;

  // Flow Mode helpers
  var prevFlow = null;
  function isFlowModeOn(){ try { var el = root.querySelector('.shell'); return !!(el && el.classList.contains('flow-mode')); } catch(_){ return false; } }
  function getFlowToggleButton(){ try { return root.querySelector('[data-action="toggle-flow-mode"]'); } catch(_){ return null; } }
  function updateFlowButtonAria(){ var btn = getFlowToggleButton(); if (!btn) return; var on = isFlowModeOn(); try { btn.setAttribute('aria-pressed', on ? 'true' : 'false'); btn.setAttribute('title', 'Alt+F: ' + (on ? '집중 모드 끄기' : '집중 모드 켜기')); } catch(_){ } }
  function ensureFloatingExit(){ var on = isFlowModeOn(); var existing = null; try { existing = root.querySelector('.flow-exit'); } catch(_){ existing = null; } if (on && !existing){ try { var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'flow-exit'; btn.setAttribute('aria-label','Exit Flow'); btn.setAttribute('title','Exit Flow (Alt+F)'); btn.textContent='×'; btn.addEventListener('click', function(){ toggleFlowModeCore(); }); var container = root.querySelector('.shell') || root; container.appendChild(btn); } catch(_){ } } else if (!on && existing){ try { existing.remove(); } catch(_){ } } }
  function focusFirstActionable(){ if (!isFlowModeOn()) return; var container = null; try { container = root.querySelector('.shell'); } catch(_){ container = null; } if (!container) return; var nodes = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]'); for (var i=0;i<nodes.length;i++){ var n = nodes[i]; if (!n) continue; var disabled = !!(n.hasAttribute('disabled') || n.getAttribute('aria-disabled')==='true'); if (disabled) continue; var visible = !!(n.offsetParent !== null); if (!visible) continue; try { n.focus(); } catch(_){ } break; } }
  function onRenderFlow(){ var nowOn = isFlowModeOn(); if (prevFlow === null) prevFlow = nowOn; updateFlowButtonAria(); ensureFloatingExit(); if (!prevFlow && nowOn) { setTimeout(focusFirstActionable, 0); } prevFlow = nowOn; }
  function updateFlowButtonLabel(on){ var btn = getFlowToggleButton(); if (!btn) return; try { btn.textContent = on ? '집중 모드 끄기' : '집중 모드 켜기'; } catch(_){ } }
  function toggleFlowModeCore(){ var nextOn = !isFlowModeOn(); var committed=false; try { if (typeof state==='object' && state && state.ui){ state.ui.flowMode = nextOn; if (typeof commit==='function'){ try { commit('toggle-flow-mode'); committed=true; } catch(_){ committed=false; } } } } catch(_){ } if (!committed){ try { var shell = root.querySelector('.shell'); if (shell) shell.classList.toggle('flow-mode', nextOn); } catch(_){ } updateFlowButtonAria(); updateFlowButtonLabel(nextOn); ensureFloatingExit(); if (nextOn){ setTimeout(focusFirstActionable, 0); } } }
  function registerFlowToggleHandlers(){ if (window.__flowToggleHandlerRegistered) return; window.__flowToggleHandlerRegistered = true; root.addEventListener('click', function(e){ var node = (e && e.target && e.target.closest) ? e.target.closest('[data-action="toggle-flow-mode"]') : null; if (!node) return; try { e.preventDefault(); } catch(_){ } toggleFlowModeCore(); }, true); }

  // Flow Mode: keep DOM in sync with state.ui.flowMode on initial render
  function syncFlowDomFromState(){
    var desired = false;
    try { desired = !!(window.state && window.state.ui && window.state.ui.flowMode); } catch(_){ desired = false; }
    var shell = null;
    try { shell = root.querySelector('.shell'); } catch(_){ shell = null; }
    if (!shell) return;
    var has = shell.classList.contains('flow-mode');
    if (desired !== has){
      try { shell.classList.toggle('flow-mode', desired); } catch(_){ }
      updateFlowButtonAria();
      updateFlowButtonLabel(desired);
      ensureFloatingExit();
      if (desired){ setTimeout(focusFirstActionable, 0); }
    }
  }

  // Flow Mode: Alt+F global shortcut (ignores inputs/contentEditable)
  function registerFlowShortcutHandlers(){
    if (window.__flowShortcutRegistered) return;
    window.__flowShortcutRegistered = true;
    try {
      window.addEventListener('keydown', function(e){
        try {
          var key = (e && (e.key || e.code || '')) || '';
          var target = e && e.target;
          var tag = (target && target.tagName) ? String(target.tagName).toLowerCase() : '';
          var isTyping = !!(tag === 'input' || tag === 'textarea' || tag === 'select' || (target && target.isContentEditable));
          if (isTyping) return;
          // Alt+F (also allow Meta+F for some keyboards)
          var hit = false;
          if (e && (e.altKey || e.metaKey)){
            var k = String(key).toLowerCase();
            hit = (k === 'f' || k === 'keyf');
          }
          if (!hit) return;
          try { e.preventDefault(); } catch(_){ }
          toggleFlowModeCore();
        } catch(_){ }
      }, true);
    } catch(_){ }
  }

  // Mismatch cluster board (Notes view)
  function safeGet(obj, path, d){ try { return path.split('.').reduce(function(v,k){ return (v && v[k] != null) ? v[k] : undefined; }, obj) ?? d; } catch(_){ return d; } }
  function isNotesView(){ try { return safeGet(window, 'state.ui.view', '') === 'notes'; } catch(_){ return false; } }
  function bucket10(p){ var v = Number(p); if (!isFinite(v)) v = 0; if (v>1) v = v/100; if (v<0) v=0; if (v>=1) v=0.9999; return Math.floor(v*10)/10; }
  function getScreenMap(){ var map = Object.create(null); try { (state && Array.isArray(state.screens)? state.screens:[]).forEach(function(sc){ map[sc.screen_id]=sc; }); } catch(_){ } return map; }
  function computeMismatchClusters(){ var st = state || {}; var notes = Array.isArray(st.notes)? st.notes:[]; var clustersById = Object.create(null); var screens = getScreenMap(); notes.forEach(function(n){ var g = n && n.geometry; if (!g || (g.pane!=='reference' && g.pane!=='live')) return; var bx = bucket10(g.x_pct), by = bucket10(g.y_pct); var cid = (n.screen_id||'?') + '|' + bx.toFixed(1) + ',' + by.toFixed(1); var c = clustersById[cid]; if (!c){ c = clustersById[cid] = { cluster_id: cid, screen_id: n.screen_id || '?', screen_name: (screens[n.screen_id] && screens[n.screen_id].display_name) || n.screen_id || '-', bucket_x: bx, bucket_y: by, panes: new Set(), note_ids: [], note_count: 0, bug_candidate_count: 0, change_candidate_count: 0, related_bug_count: 0, related_change_count: 0 }; } c.note_ids.push(n.note_id||''); c.note_count+=1; c.panes.add(g.pane); if (n.promote_to_bug) c.bug_candidate_count+=1; if (n.promote_to_change_request) c.change_candidate_count+=1; }); var bugs = Array.isArray(st.bugs)? st.bugs:[]; var changes = Array.isArray(st.change_requests)? st.change_requests:[]; Object.keys(clustersById).forEach(function(cid){ var c = clustersById[cid]; c.related_bug_count = bugs.filter(function(b){ return b && b.screen_id===c.screen_id; }).length; c.related_change_count = changes.filter(function(cr){ return cr && cr.screen_id===c.screen_id; }).length; }); return Object.values(clustersById).sort(function(a,b){ return (b.note_count||0)-(a.note_count||0); }); }
  function paneCoverageLabel(c){ var hasRef = c.panes && c.panes.has('reference'); var hasLive = c.panes && c.panes.has('live'); if (hasRef && hasLive) return '양면'; if (hasRef) return '레퍼런스'; if (hasLive) return '라이브'; return '-'; }
  function approxCoordLabel(c){ var x = Math.round((c.bucket_x||0)*100); var y = Math.round((c.bucket_y||0)*100); return x+'%, '+y+'%'; }
  function notesInCluster(clusterId){ var clusters = computeMismatchClusters(); var c = clusters.find(function(x){ return x.cluster_id===clusterId; }); if (!c) return []; var ids = new Set(c.note_ids); var st = state || {}; return (st.notes||[]).filter(function(n){ return n && ids.has(n.note_id); }); }
  function toggleClusterFlag(clusterId, flag){ var list = notesInCluster(clusterId); if (!list.length) return; var allOn = list.every(function(n){ return !!n[flag]; }); var target = !allOn; list.forEach(function(n){ n[flag]=target; }); }
  function newBugId(){ var st=state||{}; var n = (Array.isArray(st.bugs)? st.bugs.length:0)+1; return 'BUG-'+String(n).padStart(3,'0'); }
  function newChangeId(){ var st=state||{}; var n = (Array.isArray(st.change_requests)? st.change_requests.length:0)+1; return 'CR-'+String(n).padStart(3,'0'); }
  function clusterSummary(clusterId){ var clusters = computeMismatchClusters(); var c = clusters.find(function(x){ return x.cluster_id===clusterId; }); if (!c) return {title:'',screen_id:'',coord:'',count:0}; return { title: c.screen_name+' 불일치('+approxCoordLabel(c)+', '+c.note_count+'건)', screen_id: c.screen_id, coord: approxCoordLabel(c), count: c.note_count }; }
  function createBugFromCluster(clusterId){ var st = state || {}; var s = clusterSummary(clusterId); (st.bugs = st.bugs || []).unshift({ bug_id: newBugId(), screen_id: s.screen_id, severity: '보통', title: s.title, impact: s.coord+' 영역 이슈', status: '열림', drift_type: '구현 버그', expected_result: '', actual_result: '' }); try { if (typeof commit==='function') commit('cluster-create-bug'); } catch(_){ } }
  function createChangeFromCluster(clusterId){ var st = state || {}; var s = clusterSummary(clusterId); (st.change_requests = st.change_requests || []).unshift({ change_request_id: newChangeId(), issue_id: '', screen_id: s.screen_id, request_title: s.title, owner: '자동 생성', status: '열림', packaging_state: '대기' }); try { if (typeof commit==='function') commit('cluster-create-change'); } catch(_){ } }

  // Selection state and toolbar
  function __ensureClusterUi(){ try { state.ui = state.ui || {}; if (!Array.isArray(state.ui.selectedClusters)) state.ui.selectedClusters = []; } catch(_){} }
  function __selectedSet(){ __ensureClusterUi(); try { return new Set(state.ui.selectedClusters||[]); } catch(_) { return new Set(); } }
  function __setSelected(id, on){ __ensureClusterUi(); var s = __selectedSet(); var k = String(id||''); if (on) s.add(k); else s.delete(k); try { state.ui.selectedClusters = Array.from(s); if (typeof commit==='function') commit('cluster-selection'); } catch(_){ state.ui.selectedClusters = Array.from(s); } }
  function __clearSelection(){ __ensureClusterUi(); try { state.ui.selectedClusters = []; if (typeof commit==='function') commit('cluster-selection-clear'); } catch(_) { state.ui.selectedClusters = []; } }
  function __pruneSelectionTo(clusters){ __ensureClusterUi(); try { var ids = new Set((clusters||[]).map(function(c){ return c.cluster_id; })); var prev = __selectedSet(); var next = Array.from(prev).filter(function(id){ return ids.has(id); }); state.ui.selectedClusters = next; } catch(_){} }
  function __selectAll(clusters){ __ensureClusterUi(); try { state.ui.selectedClusters = (clusters||[]).map(function(c){ return c.cluster_id; }); if (typeof commit==='function') commit('cluster-select-all'); } catch(_){} }
  function __selectedCount(){ try { return __selectedSet().size; } catch(_) { return 0; } }
  function __updateToolbarDisabled(toolbar){ try { var c = __selectedCount(); ['board-clear-selection','board-toggle-bug-selected','board-toggle-change-selected','board-create-bug-selected','board-create-change-selected','board-cycle-bug-status-selected','board-cycle-change-status-selected'].forEach(function(a){ var b = toolbar.querySelector('[data-action="'+a+'"]'); if (b) b.disabled = !c; }); var cnt = toolbar.querySelector('[data-selection-count]'); if (cnt) cnt.textContent = String(c); } catch(_){} }
  function __ensureToolbar(section, clusters){ try { var tb = section.querySelector('#cluster-board-toolbar'); if (!tb){ var wrap = document.createElement('article'); wrap.className = 'panel'; wrap.id = 'cluster-board-toolbar'; wrap.innerHTML = [ '<div class="row-topline"><p class="eyebrow">클러스터 배치 작업</p><strong>선택: <span data-selection-count>0</span> / '+String(clusters.length)+'</strong></div>', '<div class="button-row">', '  <button type="button" class="secondary-button" data-action="board-select-all">전체 선택</button>', '  <button type="button" class="secondary-button" data-action="board-clear-selection" disabled>선택 해제</button>', '  <button type="button" class="secondary-button" data-action="board-toggle-bug-selected" disabled>버그 후보 토글(선택)</button>', '  <button type="button" class="secondary-button" data-action="board-toggle-change-selected" disabled>현행화 후보 토글(선택)</button>', '  <button type="button" class="secondary-button" data-action="board-create-bug-selected" disabled>버그 생성(선택 묶음)</button>', '  <button type="button" class="secondary-button" data-action="board-create-change-selected" disabled>현행화 생성(선택 묶음)</button>', '  <button type="button" class="secondary-button" data-action="board-cycle-bug-status-selected" disabled>연결 버그 상태 순환(선택)</button>', '  <button type="button" class="secondary-button" data-action="board-cycle-change-status-selected" disabled>연결 현행화 상태 순환(선택)</button>', '</div>', '<p class="helper">여러 클러스터를 선택해 반복 작업을 한번에 처리합니다.</p>' ].join(''); var firstCard = section.querySelector('article.panel[data-cluster-id]'); if (firstCard) { section.insertBefore(wrap, firstCard); } else { section.appendChild(wrap); } tb = wrap; } __updateToolbarDisabled(tb); } catch(_){ } return section.querySelector('#cluster-board-toolbar'); }
  function __augmentClusterCards(section){ try { var nodes = section.querySelectorAll('article.panel[data-cluster-id]'); var s = __selectedSet(); nodes.forEach(function(card){ var id = card.getAttribute('data-cluster-id')||''; card.classList.toggle('cluster-selected', s.has(id)); var top = card.querySelector('.row-topline'); if (top && !top.querySelector('[data-action="cluster-select"]')){ var lab = document.createElement('label'); lab.className='helper'; var cb=document.createElement('input'); cb.type='checkbox'; cb.setAttribute('data-action','cluster-select'); cb.setAttribute('data-cluster-id', id); cb.checked = s.has(id); lab.appendChild(cb); lab.appendChild(document.createTextNode(' 선택')); top.appendChild(lab); } }); } catch(_){ } }
  function __boardToggleFlagSelected(flag){ var s = __selectedSet(); if (!s.size) return; s.forEach(function(id){ try { toggleClusterFlag(id, flag); } catch(_){ } }); try { if (typeof commit==='function') commit('board-toggle-'+String(flag)); } catch(_){ } }
  function __boardCreateBugSelected(){ var s = __selectedSet(); if (!s.size) return; s.forEach(function(id){ try { createBugFromCluster(id); } catch(_){ } }); }
  function __boardCreateChangeSelected(){ var s = __selectedSet(); if (!s.size) return; s.forEach(function(id){ try { createChangeFromCluster(id); } catch(_){ } }); }
  function __boardCycleIssueStatusSelected(kind){ var s = __selectedSet(); if (!s.size) return; var clusters = computeMismatchClusters(); var byId = Object.create(null); clusters.forEach(function(c){ byId[c.cluster_id] = c; }); var screens = new Set(); s.forEach(function(id){ var c = byId[id]; if (c && c.screen_id) screens.add(c.screen_id); }); var nextStatus = function(st){ return st==='열림' ? '진행중' : (st==='진행중' ? '닫힘' : '열림'); }; var touched=0; if (kind==='bug'){ (state.bugs||[]).forEach(function(b){ if (b && screens.has(b.screen_id)) { b.status = nextStatus(b.status||'열림'); touched+=1; } }); if (touched){ try { if (typeof commit==='function') commit('board-cycle-bug-status-selected'); } catch(_){ } } } else if (kind==='change'){ (state.change_requests||[]).forEach(function(cr){ if (cr && screens.has(cr.screen_id)) { cr.status = nextStatus(cr.status||'열림'); touched+=1; } }); if (touched){ try { if (typeof commit==='function') commit('board-cycle-change-status-selected'); } catch(_){ } } } }
  function __cycleIssueStatusForCluster(kind, clusterId){ var clusters = computeMismatchClusters(); var c = clusters.find(function(x){ return x.cluster_id===clusterId; }); if (!c || !c.screen_id) return; var nextStatus = function(st){ return st==='열림' ? '진행중' : (st==='진행중' ? '닫힘' : '열림'); }; var touched=0; if (kind==='bug'){ (state.bugs||[]).forEach(function(b){ if (b && b.screen_id===c.screen_id){ b.status = nextStatus(b.status||'열림'); touched+=1; } }); if (touched){ try { if (typeof commit==='function') commit('cluster-cycle-bug-status'); } catch(_){ } } } else if (kind==='change'){ (state.change_requests||[]).forEach(function(cr){ if (cr && cr.screen_id===c.screen_id){ cr.status = nextStatus(cr.status||'열림'); touched+=1; } }); if (touched){ try { if (typeof commit==='function') commit('cluster-cycle-change-status'); } catch(_){ } } } }
  function renderClusterCard(c){ var qCard = (typeof queueCard==='function') ? queueCard : function(label,val,helper){ return '<article class="queue-card"><div class="row-topline"><strong>'+String(label)+'</strong></div><p>'+String(val)+'</p><p class="helper">'+String(helper||'')+'</p></article>'; }; return [ '<article class="panel" data-cluster-id="'+String(c.cluster_id)+'">', '  <div class="row-topline"><p class="eyebrow">불일치 클러스터</p><strong>'+String(c.screen_name)+'</strong></div>', '  <div class="badge-row">', '    <span class="badge badge-neutral">좌표 '+String(approxCoordLabel(c))+'</span>', '    <span class="badge badge-warning">노트 '+String(c.note_count||0)+'</span>', '    <span class="badge badge-ok">'+String(paneCoverageLabel(c))+'</span>', '    <span class="badge badge-neutral">연결 버그 '+String(c.related_bug_count||0)+'</span>', '    <span class="badge badge-neutral">연결 현행화 '+String(c.related_change_count||0)+'</span>', '  </div>', '  <div class="queue-list">', qCard('버그 후보', String(c.bug_candidate_count||0), '클러스터 내 버그 후보 수'), qCard('현행화 후보', String(c.change_candidate_count||0), '클러스터 내 현행화 후보 수'), '  </div>', '  <div class="button-row">', '    <button type="button" class="secondary-button" data-action="cluster-toggle-bug" data-cluster-id="'+String(c.cluster_id)+'">버그 후보 토글(모두)</button>', '    <button type="button" class="secondary-button" data-action="cluster-toggle-change" data-cluster-id="'+String(c.cluster_id)+'">현행화 후보 토글(모두)</button>', '    <button type="button" class="secondary-button" data-action="cluster-create-bug" data-cluster-id="'+String(c.cluster_id)+'">버그 생성(묶음)</button>', '    <button type="button" class="secondary-button" data-action="cluster-create-change" data-cluster-id="'+String(c.cluster_id)+'">현행화 생성(묶음)</button>', '    <button type="button" class="secondary-button" data-action="cluster-cycle-bug-status" data-cluster-id="'+String(c.cluster_id)+'">연결 버그 상태 순환</button>', '    <button type="button" class="secondary-button" data-action="cluster-cycle-change-status" data-cluster-id="'+String(c.cluster_id)+'">연결 현행화 상태 순환</button>', '  </div>', '  <p class="helper">선택된 화면의 비교 불일치 지오메트리 클러스터입니다.</p>', '</article>' ].join(''); }
  function renderClusterBoard(){ var clusters = computeMismatchClusters(); if (!clusters.length){ return '<section class="panel"><p class="eyebrow">불일치 클러스터 보드</p><div class="empty-state">클러스터가 없습니다.</div></section>'; } var cards = clusters.map(renderClusterCard).join(''); return '<section class="section-gap" id="cluster-board">'+ cards +'</section>'; }
  function augmentClusterBoard(){ try { var section = root.querySelector('#cluster-board'); if (!section) return; var clusters = computeMismatchClusters(); __pruneSelectionTo(clusters); var tb = __ensureToolbar(section, clusters); __augmentClusterCards(section); __updateToolbarDisabled(tb); } catch(_){ } }
  function syncClusterBoard(){ if (!isNotesView()){ try { __clearSelection(); } catch(_){ } var prev = root.querySelector('#cluster-board'); if (prev){ try { prev.remove(); } catch(_){ } } return; } var container = root.querySelector('.shell') || root; var existing = container.querySelector('#cluster-board'); var html = renderClusterBoard(); if (existing){ existing.outerHTML = html; try { augmentClusterBoard(); } catch(_){ } } else { var tmp = document.createElement('div'); tmp.innerHTML = html; var el = tmp.firstElementChild; if (el) container.appendChild(el); try { augmentClusterBoard(); } catch(_){ } } }
  function onRenderClusters(){ try { syncClusterBoard(); } catch(_){ } }

  function registerClusterBoardHandlers(){ if (window.__clusterBoardHandlersRegistered) return; window.__clusterBoardHandlersRegistered = true; root.addEventListener('click', function(e){ var btn = e.target && e.target.closest ? e.target.closest('[data-action]') : null; if (!btn) return; var action = btn.getAttribute('data-action') || ''; if (action && action.indexOf('board-') === 0) { if (action === 'board-select-all') { __selectAll(computeMismatchClusters()); try { augmentClusterBoard(); } catch(_){} } else if (action === 'board-clear-selection') { __clearSelection(); try { augmentClusterBoard(); } catch(_){} } else if (action === 'board-toggle-bug-selected') { __boardToggleFlagSelected('promote_to_bug'); try { if (typeof commit==='function') commit('board-toggle-bug-selected'); } catch(_){ } } else if (action === 'board-toggle-change-selected') { __boardToggleFlagSelected('promote_to_change_request'); try { if (typeof commit==='function') commit('board-toggle-change-selected'); } catch(_){ } } else if (action === 'board-create-bug-selected') { __boardCreateBugSelected(); } else if (action === 'board-create-change-selected') { __boardCreateChangeSelected(); } else if (action === 'board-cycle-bug-status-selected') { __boardCycleIssueStatusSelected('bug'); } else if (action === 'board-cycle-change-status-selected') { __boardCycleIssueStatusSelected('change'); } return; } var cid = btn.getAttribute('data-cluster-id') || ''; if (!cid) return; if (action === 'cluster-toggle-bug') { toggleClusterFlag(cid, 'promote_to_bug'); try { if (typeof commit==='function') commit('cluster-toggle-bug'); } catch(_){ } } else if (action === 'cluster-toggle-change') { toggleClusterFlag(cid, 'promote_to_change_request'); try { if (typeof commit==='function') commit('cluster-toggle-change'); } catch(_){ } } else if (action === 'cluster-create-bug') { createBugFromCluster(cid); } else if (action === 'cluster-create-change') { createChangeFromCluster(cid); } else if (action === 'cluster-cycle-bug-status') { __cycleIssueStatusForCluster('bug', cid); } else if (action === 'cluster-cycle-change-status') { __cycleIssueStatusForCluster('change', cid); } else if (action === 'cluster-select') { __setSelected(cid, !!(btn.checked)); try { augmentClusterBoard(); } catch(_){ } } }); }

  try { var mo = new MutationObserver(function(){ onRenderFlow(); onRenderClusters(); }); mo.observe(root, { childList:true, subtree:true }); } catch(_){ }
  try { syncFlowDomFromState(); onRenderFlow(); onRenderClusters(); registerClusterBoardHandlers(); registerFlowToggleHandlers(); registerFlowShortcutHandlers(); } catch(_){ }
})();;// HELPER-031: Autonomy > Helper aging panel injection and controls(function(){  'use strict';  var root = document.getElementById('app');  if (!root) return;  function q(sel, ctx){ try { return (ctx||root).querySelector(sel); } catch(_){ return null; } }  function qa(sel, ctx){ try { return Array.from((ctx||root).querySelectorAll(sel)); } catch(_){ return []; } }  function inAutonomyView(){ try { return (window.state && window.state.ui && window.state.ui.view === 'autonomy'); } catch(_){ return false; } }  function flowModeOn(){ try { return !!(window.state && window.state.ui && window.state.ui.flowMode); } catch(_){ return false; } }  function helperEP(){ try { return (typeof window.helperEndpoint === 'function') ? window.helperEndpoint() : (window.state && window.state.ui && window.state.ui.helperConfig && window.state.ui.helperConfig.endpoint) || 'http://127.0.0.1:41741'; } catch(_){ return 'http://127.0.0.1:41741'; } }  function nn(v){ return (v==null||Number.isNaN(v)) ? 0 : v; }  function fmtSec(n){ n = Math.max(0, Number(n)||0); var m = Math.floor(n/60), s = Math.floor(n%60); return (m>0? (m+'m '):'')+s+'s'; }  function queueCardSafe(label, val, helper){    try { return (typeof queueCard === 'function') ? queueCard(label, val, helper) : ('<article class="queue-card"><div class="row-topline"><strong>'+String(label)+'</strong></div><p>'+String(val)+'</p><p class="helper">'+String(helper||'')+'</p></article>'); } catch(_){ return ''; }  }  function renderHelperPanel(){    var ui = (window.state && window.state.ui) || {};    var warnThr = Number(ui.helperWarnThresholdSec || Math.floor(Number(ui.helperRetryThresholdSec||60)*0.5));    var html = [      '<article class="panel" id="helper-aging-panel">',      '  <div class="row-topline">',      '    <p class="eyebrow">Helper Inbox Aging</p>',      '    <span class="spacer"></span>',      '    <span class="helper">마지막 업데이트: '+String(ui.helperLastRefreshed||'-')+'</span>',      '  </div>',      '  <div class="queue-list">',           queueCardSafe('Queue', String(nn(ui.helperQueueCount||0))+'건', '대기 중 캡처 수'),           queueCardSafe('Oldest wait', fmtSec(nn(ui.helperOldestAgeSec||0)), 'oldest_capture_id: '+String(ui.helperOldestCaptureId||'-')),           queueCardSafe('Warn (≥ '+warnThr+'s)', String(nn(ui.helperWarnCount||0))+'건', '경고 임계치 도달'),           queueCardSafe('Stale (≥ '+Number(nn(ui.helperRetryThresholdSec||60))+'s)', String(nn(ui.helperStaleCount||0))+'건', '재시도 대상'),           queueCardSafe('Attempts (high)', String(nn(ui.helperAttemptHighCount||0))+'건', 'cap-1 경고'),           queueCardSafe('Attempts (capped)', String(nn(ui.helperAttemptCapCount||0))+'건', '최대 시도 초과로 보류'),      '  </div>',      '  <div class="button-row">',      '    <button type="button" class="secondary-button" data-action="helper-refresh">새로고침</button>',      '    <button type="button" class="secondary-button" data-action="helper-retry-stale">stale 재시도</button>',      '  </div>',      '  <p class="helper">임계치 초과 시 자동 재시도를 예약합니다. 필요 시 수동으로도 재정렬할 수 있습니다.</p>',      '</article>'    ].join('');    return html;  }  async function doRetryStale(){    try {      await fetch(helperEP()+'/captures/retry-stale', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: '{}' });    } catch(_){ }    try { if (typeof window.refreshHelperAging === 'function') await window.refreshHelperAging(); } catch(_){ }  }  function wireHelperPanel(){    var panel = q('#helper-aging-panel'); if (!panel) return;    // Avoid duplicate listeners by delegating on root and checking action    if (!window.__helperPanelHandler){      window.__helperPanelHandler = true;      root.addEventListener('click', function(e){        var btn = e && e.target && e.target.closest ? e.target.closest('[data-action]') : null;        if (!btn) return;        var action = btn.getAttribute('data-action')||'';        if (action === 'helper-refresh'){          try { e.preventDefault(); } catch(_){ }          try { if (typeof window.refreshHelperAging === 'function') window.refreshHelperAging(); } catch(_){ }        } else if (action === 'helper-retry-stale'){          try { e.preventDefault(); } catch(_){ }          doRetryStale();        }      }, true);    }  }  function syncHelperPanel(){    // Hide in non-autonomy view or in Flow Mode    var existing = q('#helper-aging-panel');    if (!inAutonomyView() || flowModeOn()) { if (existing) { try { existing.remove(); } catch(_){ } } return; }    // Find a reasonable container: prefer the first .section-gap area under autonomy, else append to .shell    var container = q('.shell') || root;    // If panel exists, refresh its markup for latest metrics; else insert    var html = renderHelperPanel();    if (existing){ existing.outerHTML = html; }    else {      var tmp = document.createElement('div'); tmp.innerHTML = html; var el = tmp.firstElementChild; if (el) container.appendChild(el);    }    wireHelperPanel();  }  // Observe app DOM updates and sync panel  try {    var mo2 = new MutationObserver(function(){ syncHelperPanel(); });    mo2.observe(root, { childList: true, subtree: true });  } catch(_){ }  // Initial render attempt  try { syncHelperPanel(); } catch(_){ }})();// DATA-032: Autonomy > Run lineage panel injection(function(){  'use strict';  var root = document.getElementById('app');  if (!root) return;  function q(sel, ctx){ try { return (ctx||root).querySelector(sel); } catch(_){ return null; } }  function inAutonomyView(){ try { return (window.state && window.state.ui && window.state.ui.view === 'autonomy'); } catch(_){ return false; } }  function flowModeOn(){ try { return !!(window.state && window.state.ui && window.state.ui.flowMode); } catch(_){ return false; } }  function esc(v){ try { return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); } catch(_){ return String(v||''); } }  function runLineagePayload(){ try { return window.SHIP_SENTINEL_RUN_LINEAGE || {}; } catch(_){ return {}; } }  function queueCardSafe(label, val, helper){    try { return (typeof queueCard === 'function') ? queueCard(label, val, helper) : ('<article class="queue-card"><div class="row-topline"><strong>'+esc(label)+'</strong></div><p>'+esc(val)+'</p>'+(helper?('<p class="helper">'+esc(helper)+'</p>'):'')+'</article>'); } catch(_){ return ''; }  }  function renderLineagePanel(){    var payload = runLineagePayload();    var auditIds = Object.keys(payload||{});    var inner = '';    if (!auditIds.length){      inner = '<div class="queue-list">'+ queueCardSafe('Run Lineage','-','lineage 데이터가 없습니다.') + '</div>';    } else {      inner = auditIds.map(function(aid){        var g = payload[aid] || {};        var nodes = Array.isArray(g.nodes) ? g.nodes : [];        var edges = Array.isArray(g.edges) ? g.edges : [];        var merges = Array.isArray(g.merge_candidates) ? g.merge_candidates : [];        var nodesText = nodes.map(function(n){ return esc(n.id)+' ('+esc(n.type)+')'; }).join(', ');        var edgesText = edges.map(function(e){ return esc(e.from)+' → '+esc(e.to)+' ['+esc(e.relation)+']'; }).join(', ');        var mergesText = merges.length ? merges.map(function(m){ var desc = [m.reason||'', m.summary||''].filter(Boolean).join(' — '); return queueCardSafe('Merge candidate', (m.from?esc(m.from):'')+' → '+(m.to?esc(m.to):''), desc || ''); }).join('') : queueCardSafe('Merge candidate','-','no divergence detected');        return [          '<article class="panel" data-lineage-aid="'+esc(aid)+'">',          '  <div class="row-topline"><p class="eyebrow">Run Lineage</p><strong>'+esc(aid)+' / '+esc(g.branch||'main')+'</strong></div>',          '  <div class="queue-list">',               queueCardSafe('Branch notes', g.branch_notes || '-', 'rerun ancestry and divergence summary'),               queueCardSafe('Nodes', nodesText || '-', 'snapshots and current run'),               queueCardSafe('Edges', edgesText || '-', 'lineage chain'),               mergesText,          '  </div>',          '</article>'        ].join('');      }).join('');    }    return [      '<article class="panel" id="run-lineage-panel">',      '  <div class="row-topline"><p class="eyebrow">Lineage Overview</p><span class="spacer"></span><span class="helper">파일 기반</span></div>',      inner,      '</article>'    ].join('');  }  function syncLineagePanel(){    var existing = q('#run-lineage-panel');    if (!inAutonomyView() || flowModeOn()) { if (existing){ try { existing.remove(); } catch(_){ } } return; }    var container = q('.shell') || root;    var html = renderLineagePanel();    if (existing){ existing.outerHTML = html; }    else { var tmp = document.createElement('div'); tmp.innerHTML = html; var el = tmp.firstElementChild; if (el) container.appendChild(el); }  }  try { var mo = new MutationObserver(function(){ syncLineagePanel(); }); mo.observe(root, { childList:true, subtree:true }); } catch(_){ }  try { syncLineagePanel(); } catch(_){ }})();// HELPER-034: Autonomy > Helper inbox aging poll + retry policy hookup
(function(){
  'use strict';
  var root = document.getElementById('app');
  if (!root) return;
  function helperEP(){
    try {
      return (typeof window.helperEndpoint === 'function')
        ? window.helperEndpoint()
        : (window.state && window.state.ui && window.state.ui.helperConfig && window.state.ui.helperConfig.endpoint) || 'http://127.0.0.1:41741';
    } catch(_){ return 'http://127.0.0.1:41741'; }
  }
  function nowLocal(){
    try { var d=new Date(); return d.toISOString().replace('T',' ').split('.')[0]; } catch(_){ return String(new Date()); }
  }
  function applyAging(aging){
    try {
      var st = (window.state = window.state || {});
      var ui = (st.ui = st.ui || {});
      ui.helperRetryThresholdSec = Number(aging.retry_threshold_seconds || ui.helperRetryThresholdSec || 60);
      ui.helperWarnThresholdSec  = Number(aging.warn_threshold_seconds  || ui.helperWarnThresholdSec  || Math.floor(ui.helperRetryThresholdSec*0.5));
      ui.helperQueueCount        = Number(aging.queue_count || 0);
      ui.helperOldestAgeSec      = Number(aging.oldest_age_seconds || 0);
      ui.helperOldestCaptureId   = String(aging.oldest_capture_id || '');
      ui.helperWarnCount         = Number(aging.warning_count || 0);
      ui.helperStaleCount        = Number(aging.stale_count || 0);
      ui.helperAttemptHighCount  = Number(aging.attempt_high_count || 0);
      ui.helperAttemptCapCount   = Number(aging.attempt_cap_count || 0);
      ui.helperLastRefreshed     = nowLocal();
      try { if (typeof commit === 'function') commit('helper-aging-refresh'); } catch(_){ }
    } catch(_){ }
  }
  async function refresh(){
    try {
      var res = await fetch(helperEP() + '/queue/aging', { method: 'GET' });
      if (!res || !res.ok) throw new Error('aging fetch failed');
      var data = await res.json();
      if (data && data.ok !== false) applyAging(data);
    } catch(_){ }
  }
  try { window.refreshHelperAging = refresh; } catch(_){}
  var timer = null;
  function shouldPoll(){
    try { return window.state && window.state.ui && window.state.ui.view === 'autonomy' && !window.state.ui.flowMode; } catch(_){ return false; }
  }
  function tick(){ if (shouldPoll()) refresh(); }
  function start(){ if (timer) return; try { timer = setInterval(tick, 5000); } catch(_){} }
  function stop(){ try { if (timer) clearInterval(timer); } catch(_){} timer=null; }
  try { var mo = new MutationObserver(function(){ if (shouldPoll()) start(); else stop(); }); mo.observe(root, { childList:true, subtree:true }); } catch(_){}
  try { start(); } catch(_){}
})();

// HELPER-037: Autonomy > Helper auto-retry loop + badge helpers
(function(){
  'use strict';
  var root = document.getElementById('app');
  if (!root) return;

  function helperEP(){
    try {
      return (typeof window.helperEndpoint === 'function')
        ? window.helperEndpoint()
        : (window.state && window.state.ui && window.state.ui.helperConfig && window.state.ui.helperConfig.endpoint) || 'http://127.0.0.1:41741';
    } catch(_){ return 'http://127.0.0.1:41741'; }
  }

  function shouldOperate(){
    try { return window.state && window.state.ui && window.state.ui.view === 'autonomy' && !window.state.ui.flowMode; } catch(_){ return false; }
  }

  var lastRetryAt = 0;
  var retryCooldownMs = 30000; // avoid thrashing the queue

  async function autoRetryIfStale(aging){
    try {
      var stale = Number(aging && aging.stale_count || 0);
      var oldest = Number(aging && aging.oldest_age_seconds || 0);
      var thr = Number(aging && aging.retry_threshold_seconds || 60);
      if (stale > 0 && oldest >= thr) {
        var now = Date.now();
        if (now - lastRetryAt >= retryCooldownMs) {
          try { await fetch(helperEP() + '/captures/retry-stale', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: '{}' }); } catch(_){ }
          lastRetryAt = now;
          try {
            window.state = window.state || {}; window.state.ui = window.state.ui || {};
            var d=new Date(); window.state.ui.helperLastAutoRetryAt = d.toISOString().replace('T',' ').split('.')[0];
            if (typeof window.refreshHelperAging === 'function') { try { await window.refreshHelperAging(); } catch(_){ } }
          } catch(_){ }
        }
      }
    } catch(_){ }
  }

  async function pollAndMaybeRetry(){
    if (!shouldOperate()) return;
    try {
      var res = await fetch(helperEP() + '/queue/aging', { method: 'GET' });
      if (!res || !res.ok) return;
      var data = await res.json();
      if (data && data.ok !== false) {
        try { if (typeof window.refreshHelperAging === 'function') await window.refreshHelperAging(); } catch(_){ }
        await autoRetryIfStale(data);
      }
    } catch(_){ }
  }

  var timer = null;
  function start(){ if (timer) return; try { timer = setInterval(pollAndMaybeRetry, 10000); } catch(_){ } }
  function stop(){ try { if (timer) clearInterval(timer); } catch(_){ } timer = null; }
  try { var mo = new MutationObserver(function(){ if (shouldOperate()) start(); else stop(); }); mo.observe(root, { childList:true, subtree:true }); } catch(_){ }
  try { start(); } catch(_){ }

  // Badge helpers: surface helper aging state in hero or shell
  function badgeState(){
    try {
      var ui = (window.state && window.state.ui) || {};
      var cap = Number(ui.helperAttemptCapCount || 0);
      var stale = Number(ui.helperStaleCount || 0);
      var warn = Number(ui.helperWarnCount || 0);
      if (cap > 0) return { cls: 'badge-cap', label: 'Helper Capped ('+cap+')' };
      if (stale > 0) return { cls: 'badge-stale', label: 'Helper Stale ('+stale+')' };
      if (warn > 0) return { cls: 'badge-warn', label: 'Helper Warn ('+warn+')' };
      return { cls: 'badge-ok', label: 'Helper OK' };
    } catch(_){ return { cls: 'badge-ok', label: 'Helper OK' }; }
  }
  try { window.helperAgingBadgeLabel = function(){ return badgeState().label; }; } catch(_){ }
  try { window.helperAgingBadgeClass = function(){ return badgeState().cls; }; } catch(_){ }
})();

// UX-036: Escape-to-exit Flow Mode (safe, non-intrusive)
(function(){
  'use strict';
  var root = document.getElementById('app');
  if (!root) return;
  if (window.__flowEscapeShortcutRegistered) return; // guard against duplicate
  window.__flowEscapeShortcutRegistered = true;

  function isFlowOn(){
    try { var el = root.querySelector('.shell'); return !!(el && el.classList.contains('flow-mode')); } catch(_){ return false; }
  }
  function setFlow(on){
    var committed = false;
    try {
      if (typeof window.state === 'object' && window.state && window.state.ui){
        window.state.ui.flowMode = !!on;
        if (typeof commit === 'function'){ try { commit('toggle-flow-mode'); committed = true; } catch(_){ committed = false; } }
      }
    } catch(_){ committed = false; }
    if (!committed){
      try { var shell = root.querySelector('.shell'); if (shell) shell.classList.toggle('flow-mode', !!on); } catch(_){ }
    }
  }

  window.addEventListener('keydown', function(e){
    try {
      var key = (e && (e.key || e.code || '')) || '';
      var target = e && e.target;
      var tag = (target && target.tagName) ? String(target.tagName).toLowerCase() : '';
      var isTyping = !!(tag === 'input' || tag === 'textarea' || tag === 'select' || (target && target.isContentEditable));
      if (isTyping) return;
      // Do not hijack Escape when command palette is open
      try { if (window.state && window.state.ui && window.state.ui.palette && window.state.ui.palette.open) return; } catch(_){ }
      if (String(key) === 'Escape' || String(key).toLowerCase() === 'escape'){
        if (isFlowOn()) { try { e.preventDefault(); } catch(_){ } setFlow(false); }
      }
    } catch(_){ }
  }, true);
})();

