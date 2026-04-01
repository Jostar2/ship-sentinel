const audit = {
  runId: "run-2026-04-01-001",
  appName: "Acme Support Portal",
  target: "https://staging.acme-support.example",
  decision: "fix_before_ship",
  score: 68,
  coverage: {
    planned: 14,
    passed: 10,
    failed: 3,
    blocked: 1
  },
  summary: {
    blockers: 3,
    warnings: 7,
    passed: 18
  },
  findings: [
    {
      id: "F-001",
      severity: "blocker",
      category: "security",
      title: "Admin route exposed without enforced auth middleware",
      evidence: "Unauthenticated request returned 200 on /admin/export"
    },
    {
      id: "F-002",
      severity: "blocker",
      category: "reliability",
      title: "Checkout route crashes on empty cart state",
      evidence: "Unhandled null access in /checkout"
    },
    {
      id: "F-003",
      severity: "warning",
      category: "accessibility",
      title: "Primary nav icons missing labels",
      evidence: "3 interactive elements missing accessible name"
    },
    {
      id: "F-004",
      severity: "warning",
      category: "performance",
      title: "Landing page bundle exceeds target",
      evidence: "Initial JS 410kB on mobile profile"
    }
  ],
  timeline: [
    {
      label: "Input Received",
      detail: "Staging URL and release note draft attached"
    },
    {
      label: "Gate Run Aggregated",
      detail: "Security, accessibility, reliability, and perf findings merged"
    },
    {
      label: "Decision Ready",
      detail: "Fix before ship recommended with backend owner handoff"
    }
  ],
  memo: {
    headline: "Release is not ready to ship",
    nextOwner: "backend lead",
    actions: [
      "Protect admin export route",
      "Fix checkout null-state crash",
      "Re-run release gate after patch"
    ]
  },
  deliverables: [
    "test-scenarios.xlsx",
    "execution-results.xlsx",
    "bug-register.xlsx",
    "evidence-index.xlsx",
    "release-memo.md"
  ],
  serviceFlow: [
    "고객 URL 및 계정 수집",
    "핵심 시나리오 설계",
    "직접 테스트 수행",
    "증적 수집 및 버그 등록",
    "릴리즈 메모 전달"
  ]
};

const decisionCard = document.getElementById("decision-card");
const findingsList = document.getElementById("findings-list");
const timelineList = document.getElementById("timeline-list");
const memoCard = document.getElementById("memo-card");
const serviceFlow = document.getElementById("service-flow");
const deliverablesList = document.getElementById("deliverables-list");

decisionCard.innerHTML = `
  <div class="decision-topline">
    <div>
      <p class="eyebrow">릴리즈 판단</p>
      <h2>${audit.appName}</h2>
      <p>${audit.target}</p>
    </div>
    <span class="decision-label">${audit.decision.replaceAll("_", " ").toUpperCase()}</span>
  </div>
  <div class="summary-strip">
    <div class="summary-item"><span>점수</span><strong>${audit.score}</strong></div>
    <div class="summary-item"><span>차단 이슈</span><strong>${audit.summary.blockers}</strong></div>
    <div class="summary-item"><span>경고</span><strong>${audit.summary.warnings}</strong></div>
    <div class="summary-item"><span>통과</span><strong>${audit.summary.passed}</strong></div>
  </div>
  <div class="summary-strip">
    <div class="summary-item"><span>계획 시나리오</span><strong>${audit.coverage.planned}</strong></div>
    <div class="summary-item"><span>통과 시나리오</span><strong>${audit.coverage.passed}</strong></div>
    <div class="summary-item"><span>실패 시나리오</span><strong>${audit.coverage.failed}</strong></div>
    <div class="summary-item"><span>막힌 시나리오</span><strong>${audit.coverage.blocked}</strong></div>
  </div>
`;

serviceFlow.innerHTML = audit.serviceFlow
  .map((step) => `<div class="summary-item"><span>서비스 단계</span><strong>${step}</strong></div>`)
  .join("");

deliverablesList.innerHTML = audit.deliverables
  .map((item) => `<article class="deliverable-card">${item}</article>`)
  .join("");

findingsList.innerHTML = audit.findings
  .map(
    (finding) => `
      <article class="finding-card">
        <div class="finding-meta">
          <span class="badge badge-${finding.severity}">${finding.severity}</span>
          <span class="badge">${finding.category}</span>
        </div>
        <strong>${finding.title}</strong>
        <p>${finding.evidence}</p>
      </article>
    `,
  )
  .join("");

timelineList.innerHTML = audit.timeline
  .map(
    (item) => `
      <article class="timeline-card">
        <strong>${item.label}</strong>
        <p>${item.detail}</p>
      </article>
    `,
  )
  .join("");

memoCard.innerHTML = `
  <article class="memo-card">
    <strong>${audit.memo.headline}</strong>
    <p>추천 다음 담당자: ${audit.memo.nextOwner}</p>
    <ul>
      ${audit.memo.actions.map((action) => `<li>${action}</li>`).join("")}
    </ul>
  </article>
`;
