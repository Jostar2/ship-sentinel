const storageKey = "ship-sentinel-workspace";
const demoWorkspace = {
  meta: {
    audit_id: "audit-2026-04-01-acme",
    service_name: "Acme Support Portal",
    target_url: "https://staging.acme-support.example",
    release_goal: "베타 출시 전 릴리즈 준비도 검수",
    requested_by: "Mina Kim",
    delivery_date: "2026-04-01",
    recommended_next_owner: "백엔드 리드"
  },
  intake: {
    accounts: "buyer@test.example / admin@test.example",
    critical_flows: [
      "Login and dashboard access",
      "Checkout and payment",
      "Account recovery",
      "Admin export access"
    ],
    known_risks: [
      "Auth middleware recently changed",
      "Checkout logic was refactored this sprint"
    ],
    browsers: ["Chrome Desktop", "Safari iPhone"]
  },
  scenarios: [
    {
      scenario_id: "SCN-001",
      feature_area: "Authentication",
      priority: "P0",
      title: "User logs in with valid account",
      user_goal: "Access dashboard",
      preconditions: "Valid staging account exists",
      steps: "1. Open login\n2. Enter credentials\n3. Submit",
      expected_result: "Dashboard loads without error",
      risk_tag: "Core access",
      status: "통과",
      owner_notes: ""
    },
    {
      scenario_id: "SCN-002",
      feature_area: "Checkout",
      priority: "P0",
      title: "User completes purchase with card",
      user_goal: "Finish payment",
      preconditions: "Product in cart and payment test card available",
      steps: "1. Add item\n2. Open checkout\n3. Submit payment",
      expected_result: "Order confirmation appears",
      risk_tag: "Revenue",
      status: "실패",
      owner_notes: "결제 제출 직후 크래시 발생"
    }
  ],
  executions: [
    {
      execution_id: "EXE-001",
      scenario_id: "SCN-001",
      executed_at: "2026-04-01 10:00",
      tester: "QA Operator",
      environment: "Staging",
      browser_device: "Chrome Desktop",
      result: "통과",
      observed_result: "대시보드가 정상적으로 열림",
      evidence_id: "EVD-001",
      linked_bug_id: "",
      retest_required: "아니오",
      notes: ""
    }
  ],
  bugs: [
    {
      bug_id: "BUG-001",
      severity: "차단",
      category: "안정성",
      title: "결제 제출 후 체크아웃이 크래시남",
      environment: "스테이징",
      browser_device: "iPhone Safari",
      scenario_id: "SCN-002",
      repro_steps: "1. Add item\n2. Open checkout\n3. Submit payment",
      expected_result: "주문 확인 화면이 나타나야 함",
      actual_result: "처리되지 않은 에러 페이지가 표시됨",
      impact: "매출 플로우가 출시 전에 차단됨",
      evidence_id: "EVD-002",
      owner_recommendation: "출시 전 백엔드 수정 필요",
      status: "열림"
    }
  ],
  evidence: [
    {
      evidence_id: "EVD-001",
      type: "스크린샷",
      captured_at: "2026-04-01 10:00",
      file_name: "login-success.png",
      scenario_id: "SCN-001",
      bug_id: "",
      source_url: "https://staging.acme-support.example/login",
      summary: "로그인 후 대시보드 정상 상태",
      storage_path: "evidence/login-success.png",
      reviewer_notes: ""
    }
  ],
  memo: {
    decision: "수정 후 출시",
    headline: "현재 상태로는 출시가 어렵습니다",
    scope_covered: "로그인, 체크아웃, 계정 복구, 관리자 접근 경로 검수",
    blockers: ["결제 제출 후 체크아웃 크래시", "관리자 export 접근 권한 누락"],
    warnings: ["주 네비게이션 아이콘 라벨 누락", "랜딩 페이지 번들 크기 초과"],
    passed_areas: ["기본 로그인 플로우"],
    actions: ["관리자 export 경로 보호", "체크아웃 크래시 수정", "매출 플로우 재검수"]
  }
};

const emptyWorkspace = {
  meta: {
    audit_id: "",
    service_name: "",
    target_url: "",
    release_goal: "",
    requested_by: "",
    delivery_date: "",
    recommended_next_owner: ""
  },
  intake: {
    accounts: "",
    critical_flows: [],
    known_risks: [],
    browsers: []
  },
  scenarios: [],
  executions: [],
  bugs: [],
  evidence: [],
  memo: {
    decision: "수정 후 출시",
    headline: "",
    scope_covered: "",
    blockers: [],
    warnings: [],
    passed_areas: [],
    actions: []
  }
};

let state = structuredClone(emptyWorkspace);

function $(id) {
  return document.getElementById(id);
}

function setStatus(message) {
  $("workspace-status").textContent = message;
}

function loadSavedState() {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return;
  state = JSON.parse(raw);
}

function saveState(message = "작업공간이 로컬에 저장되었습니다.") {
  window.localStorage.setItem(storageKey, JSON.stringify(state, null, 2));
  setStatus(message);
}

async function loadDemoData() {
  state = structuredClone(demoWorkspace);
  saveState("데모 데이터를 불러왔습니다.");
  render();
}

function resetWorkspace() {
  state = structuredClone(emptyWorkspace);
  saveState("작업공간을 초기화했습니다.");
  render();
}

function downloadWorkspace() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.meta.audit_id || "ship-sentinel-workspace"}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function textInput(value, onInput, placeholder = "") {
  const input = document.createElement("input");
  input.value = value || "";
  input.placeholder = placeholder;
  input.addEventListener("input", (event) => onInput(event.target.value));
  return input;
}

function textareaInput(value, onInput, placeholder = "") {
  const area = document.createElement("textarea");
  area.value = Array.isArray(value) ? value.join("\n") : value || "";
  area.placeholder = placeholder;
  area.rows = 3;
  area.addEventListener("input", (event) => onInput(event.target.value));
  return area;
}

function renderIntake() {
  const container = $("intake-panel");
  container.innerHTML = "";
  const fields = [
    ["감사 ID", state.meta.audit_id, (value) => (state.meta.audit_id = value)],
    ["서비스명", state.meta.service_name, (value) => (state.meta.service_name = value)],
    ["대상 URL", state.meta.target_url, (value) => (state.meta.target_url = value)],
    ["릴리즈 목표", state.meta.release_goal, (value) => (state.meta.release_goal = value)],
    ["요청자", state.meta.requested_by, (value) => (state.meta.requested_by = value)],
    ["전달일", state.meta.delivery_date, (value) => (state.meta.delivery_date = value)],
    ["다음 담당자", state.meta.recommended_next_owner, (value) => (state.meta.recommended_next_owner = value)]
  ];

  fields.forEach(([label, value, setter]) => {
    const wrapper = document.createElement("label");
    wrapper.className = "field";
    const span = document.createElement("span");
    span.textContent = label;
    wrapper.appendChild(span);
    wrapper.appendChild(textInput(value, (next) => {
      setter(next);
      saveState();
    }));
    container.appendChild(wrapper);
  });

  const multiFields = [
    ["계정 정보", state.intake.accounts, (value) => (state.intake.accounts = value), false],
    ["핵심 플로우", state.intake.critical_flows, (value) => (state.intake.critical_flows = splitLines(value)), true],
    ["주요 리스크", state.intake.known_risks, (value) => (state.intake.known_risks = splitLines(value)), true],
    ["브라우저 / 디바이스", state.intake.browsers, (value) => (state.intake.browsers = splitLines(value)), true]
  ];

  multiFields.forEach(([label, value, setter, multiline]) => {
    const wrapper = document.createElement("label");
    wrapper.className = "field";
    const span = document.createElement("span");
    span.textContent = label;
    wrapper.appendChild(span);
    const control = multiline
      ? textareaInput(value, (next) => {
          setter(next);
          saveState();
        })
      : textInput(value, (next) => {
      setter(next);
      saveState();
    });
    wrapper.appendChild(control);
    container.appendChild(wrapper);
  });
}

function renderMemo() {
  const container = $("memo-panel");
  container.innerHTML = "";
  const fields = [
    ["판단", state.memo.decision, (value) => (state.memo.decision = value), false],
    ["헤드라인", state.memo.headline, (value) => (state.memo.headline = value), false],
    ["검수 범위", state.memo.scope_covered, (value) => (state.memo.scope_covered = value), true],
    ["차단 이슈", state.memo.blockers, (value) => (state.memo.blockers = splitLines(value)), true],
    ["경고", state.memo.warnings, (value) => (state.memo.warnings = splitLines(value)), true],
    ["통과 영역", state.memo.passed_areas, (value) => (state.memo.passed_areas = splitLines(value)), true],
    ["권장 액션", state.memo.actions, (value) => (state.memo.actions = splitLines(value)), true]
  ];

  fields.forEach(([label, value, setter, multiline]) => {
    const wrapper = document.createElement("label");
    wrapper.className = "field";
    const span = document.createElement("span");
    span.textContent = label;
    wrapper.appendChild(span);
    const control = multiline
      ? textareaInput(value, (next) => {
          setter(next);
          saveState();
        })
      : textInput(value, (next) => {
          setter(next);
          saveState();
        });
    wrapper.appendChild(control);
    container.appendChild(wrapper);
  });
}

function splitLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderTable(containerId, rows, columns) {
  const container = $(containerId);
  container.innerHTML = "";

  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "helper-text";
    empty.textContent = "아직 입력된 항목이 없습니다.";
    container.appendChild(empty);
    return;
  }

  rows.forEach((row, index) => {
    const card = document.createElement("article");
    card.className = "table-card";
    columns.forEach((column) => {
      const wrapper = document.createElement("label");
      wrapper.className = "field";
      const span = document.createElement("span");
      span.textContent = column.label;
      wrapper.appendChild(span);
      const value = row[column.key] ?? "";
      const control = column.multiline
        ? textareaInput(value, (next) => {
            row[column.key] = column.array ? splitLines(next) : next;
            saveState();
          })
        : textInput(value, (next) => {
            row[column.key] = next;
            saveState();
          });
      wrapper.appendChild(control);
      card.appendChild(wrapper);
    });

    const removeButton = document.createElement("button");
    removeButton.className = "secondary-button";
    removeButton.textContent = "삭제";
    removeButton.addEventListener("click", () => {
      rows.splice(index, 1);
      saveState("행을 삭제했습니다.");
      render();
    });
    card.appendChild(removeButton);
    container.appendChild(card);
  });
}

function render() {
  $("meta-audit-id").textContent = state.meta.audit_id || "-";
  $("meta-scenario-count").textContent = String(state.scenarios.length);
  $("meta-bug-count").textContent = String(state.bugs.length);
  $("meta-evidence-count").textContent = String(state.evidence.length);

  renderIntake();
  renderMemo();

  renderTable("scenarios-table", state.scenarios, [
    { key: "scenario_id", label: "시나리오 ID" },
    { key: "feature_area", label: "기능 영역" },
    { key: "priority", label: "우선순위" },
    { key: "title", label: "시나리오명" },
    { key: "user_goal", label: "사용자 목표" },
    { key: "preconditions", label: "사전 조건", multiline: true },
    { key: "steps", label: "테스트 단계", multiline: true },
    { key: "expected_result", label: "기대 결과", multiline: true },
    { key: "risk_tag", label: "리스크 태그" },
    { key: "status", label: "상태" },
    { key: "owner_notes", label: "메모", multiline: true }
  ]);

  renderTable("executions-table", state.executions, [
    { key: "execution_id", label: "실행 ID" },
    { key: "scenario_id", label: "시나리오 ID" },
    { key: "executed_at", label: "실행 시각" },
    { key: "tester", label: "테스터" },
    { key: "environment", label: "환경" },
    { key: "browser_device", label: "브라우저 / 디바이스" },
    { key: "result", label: "결과" },
    { key: "observed_result", label: "관찰 결과", multiline: true },
    { key: "evidence_id", label: "증적 ID" },
    { key: "linked_bug_id", label: "연결 버그 ID" },
    { key: "retest_required", label: "재검수 필요 여부" },
    { key: "notes", label: "메모", multiline: true }
  ]);

  renderTable("bugs-table", state.bugs, [
    { key: "bug_id", label: "버그 ID" },
    { key: "severity", label: "심각도" },
    { key: "category", label: "카테고리" },
    { key: "title", label: "제목" },
    { key: "environment", label: "환경" },
    { key: "browser_device", label: "브라우저 / 디바이스" },
    { key: "scenario_id", label: "시나리오 ID" },
    { key: "repro_steps", label: "재현 절차", multiline: true },
    { key: "expected_result", label: "기대 결과", multiline: true },
    { key: "actual_result", label: "실제 결과", multiline: true },
    { key: "impact", label: "영향도", multiline: true },
    { key: "evidence_id", label: "증적 ID" },
    { key: "owner_recommendation", label: "권장 조치", multiline: true },
    { key: "status", label: "상태" }
  ]);

  renderTable("evidence-table", state.evidence, [
    { key: "evidence_id", label: "증적 ID" },
    { key: "type", label: "유형" },
    { key: "captured_at", label: "캡처 시각" },
    { key: "file_name", label: "파일명" },
    { key: "scenario_id", label: "시나리오 ID" },
    { key: "bug_id", label: "버그 ID" },
    { key: "source_url", label: "원본 URL" },
    { key: "summary", label: "요약", multiline: true },
    { key: "storage_path", label: "저장 경로" },
    { key: "reviewer_notes", label: "검토 메모", multiline: true }
  ]);
}

function wireButtons() {
  $("load-demo").addEventListener("click", () => void loadDemoData());
  $("download-json").addEventListener("click", downloadWorkspace);
  $("reset-workspace").addEventListener("click", resetWorkspace);

  $("add-scenario").addEventListener("click", () => {
    state.scenarios.push({
      scenario_id: `SCN-${String(state.scenarios.length + 1).padStart(3, "0")}`,
      feature_area: "",
      priority: "P1",
      title: "",
      user_goal: "",
      preconditions: "",
      steps: "",
      expected_result: "",
      risk_tag: "",
      status: "미실행",
      owner_notes: ""
    });
    saveState("시나리오 행을 추가했습니다.");
    render();
  });

  $("add-execution").addEventListener("click", () => {
    state.executions.push({
      execution_id: `EXE-${String(state.executions.length + 1).padStart(3, "0")}`,
      scenario_id: "",
      executed_at: "",
      tester: "",
      environment: "",
      browser_device: "",
      result: "통과",
      observed_result: "",
      evidence_id: "",
      linked_bug_id: "",
      retest_required: "아니오",
      notes: ""
    });
    saveState("실행 행을 추가했습니다.");
    render();
  });

  $("add-bug").addEventListener("click", () => {
    state.bugs.push({
      bug_id: `BUG-${String(state.bugs.length + 1).padStart(3, "0")}`,
      severity: "중간",
      category: "",
      title: "",
      environment: "",
      browser_device: "",
      scenario_id: "",
      repro_steps: "",
      expected_result: "",
      actual_result: "",
      impact: "",
      evidence_id: "",
      owner_recommendation: "",
      status: "열림"
    });
    saveState("버그 행을 추가했습니다.");
    render();
  });

  $("add-evidence").addEventListener("click", () => {
    state.evidence.push({
      evidence_id: `EVD-${String(state.evidence.length + 1).padStart(3, "0")}`,
      type: "스크린샷",
      captured_at: "",
      file_name: "",
      scenario_id: "",
      bug_id: "",
      source_url: "",
      summary: "",
      storage_path: "",
      reviewer_notes: ""
    });
    saveState("증적 행을 추가했습니다.");
    render();
  });
}

loadSavedState();
wireButtons();
render();
