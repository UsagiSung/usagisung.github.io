// test.js (이전 기능 포함 버전)
const qs = window.Y40_QUESTIONS ?? [];
const rs = window.Y40_RESULTS ?? [];
const panel = document.getElementById("panel");

// ✅ 표시 설정
const SHOW_INTERNAL_KEY = false;     // true면 내부 타입키도 같이 보여줌(디버그용)
const SHOW_ALIAS_LINE   = true;      // true면 별칭 라인 표시
const SHOW_SCORE_DEBUG  = false;     // true면 축 점수 디버그 표시

// ✅ 타입키 → 별칭 맵
const titleMap = {
  "R-_C-_N-_H-": "위험이 두려운 수호자 🛡️",
  "R-_C-_N-_H+": "변수가 두려운 설계자 🧱",
  "R-_C-_N+_H-": "새로움에 신중한 관찰자 🔍",
  "R-_C-_N+_H+": "불안을 이겨낸 혁신자 💡",
  "R-_C+_N-_H-": "혼란이 두려운 원칙자 📜",
  "R-_C+_N-_H+": "흐름을 통제하는 안정러 ⚖️",
  "R-_C+_N+_H-": "과속이 두려운 신중러 🚦",
  "R-_C+_N+_H+": "위험이 낯선 안정러 🏡",
  "R+_C-_N-_H-": "기회를 노리는 전략가 🎯",
  "R+_C-_N-_H+": "균형을 계산하는 전술가 ♟️",
  "R+_C-_N+_H-": "변화를 즐기는 탐험가 🌈",
  "R+_C-_N+_H+": "모험을 설계하는 탐험가 🧭",
  "R+_C+_N-_H-": "데이터에 집중하는 개척자 🚀",
  "R+_C+_N-_H+": "리스크를 관리하는 수호자 🧱🛡️",
  "R+_C+_N+_H-": "미래를 좇는 몰입가 🔥",
  "R+_C+_N+_H+": "성장을 설계하는 듀얼마스터 ⚙️🌱",
};

let idx = 0;
let score = { R: 0, C: 0, N: 0, H: 0 };
let lastDir = { R: null, C: null, N: null, H: null }; // ✅ 동점 깨기용
let picked = null;
// ✅ 이전/다음 이동을 위한 선택 기록
let answers = Array(qs.length).fill(null);

function addScore(s) {
  for (const k of ["R", "C", "N", "H"]) {
    const v = Number(s?.[k] ?? 0);
    score[k] += v;
    if (v !== 0) lastDir[k] = v > 0 ? "+" : "-";
  }
}

// ✅ 전체 재계산(이전 기능을 위해 반드시 필요)
function recalcScoreAndLastDir() {
  score = { R: 0, C: 0, N: 0, H: 0 };
  lastDir = { R: null, C: null, N: null, H: null };
  for (let i = 0; i < answers.length; i++) {
    const a = answers[i];
    if (a == null) continue;
    const s = qs[i]?.choices?.[a]?.score ?? {};
    for (const k of ["R", "C", "N", "H"]) {
      const v = Number(s?.[k] ?? 0);
      score[k] += v;
      if (v !== 0) lastDir[k] = v > 0 ? "+" : "-";
    }
  }
}

// ✅ 0 동점이면 마지막으로 영향 준 방향으로 결정, 그래도 없으면 "-" (쏠림 방지)
function signAxis(axis) {
  const v = score[axis];
  if (v > 0) return "+";
  if (v < 0) return "-";
  return lastDir[axis] ?? "-";
}

function typeKey() {
  return `R${signAxis("R")}_C${signAxis("C")}_N${signAxis("N")}_H${signAxis("H")}`;
}

function renderQuestion() {
  const q = qs[idx];
  const pct = Math.round((idx / qs.length) * 100);

  panel.innerHTML = `
    <div class="top-progress">
      <div class="progress-wrap">
        <div class="label">진행률</div>
        <div class="progress" aria-label="진행률">
          <div class="bar" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="count">${idx + 1}/${qs.length}</div>
    </div>

    <div class="panel">
      <h2 class="qtitle">${escapeHtml(q.title)}</h2>

      <div class="choices" role="radiogroup" aria-label="선택지">
        ${q.choices.map((c, i) => `
          <button class="choice" data-i="${i}" role="radio" aria-checked="false">
            <span class="radio" aria-hidden="true"></span>
            <span>${escapeHtml(c.text)}</span>
          </button>
        `).join("")}
      </div>

      <div class="btn-row">
        <button class="btn-mini" id="backBtn">이전</button>
        <button class="btn-next" id="nextBtn" disabled>다음</button>
      </div>

      <div class="home-btn">
        <a href="../../">
          <span aria-hidden="true">⌂</span>
          <span>홈으로 돌아가기</span>
        </a>
      </div>
    </div>
  `;

  picked = answers[idx];

  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");
  const choiceBtns = panel.querySelectorAll(".choice");

  // 이전 선택 복원
  if (picked !== null && picked !== undefined) {
    const prevBtn = panel.querySelector(`.choice[data-i="${picked}"]`);
    if (prevBtn) {
      prevBtn.classList.add("selected");
      prevBtn.setAttribute("aria-checked", "true");
      nextBtn.disabled = false;
      nextBtn.classList.add("enabled");
    }
  }

  // 첫 문항에서는 이전 비활성화
  if (idx === 0) {
    backBtn.disabled = true;
    backBtn.classList.add("disabled");
  }

  choiceBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.i);
      picked = i;

      choiceBtns.forEach(b => {
        b.classList.remove("selected");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("selected");
      btn.setAttribute("aria-checked", "true");

      nextBtn.disabled = false;
      nextBtn.classList.add("enabled");
    });
  });

  // 다음: 현재 선택 저장 후 다음 문항
  nextBtn.addEventListener("click", () => {
    if (picked === null) return;
    answers[idx] = picked;
    recalcScoreAndLastDir();

    idx++;
    if (idx >= qs.length) renderResult();
    else renderQuestion();
  });

  // 이전: 현재 선택 잠정 저장 후 한 문항 되돌아가기
  backBtn.addEventListener("click", () => {
    if (idx > 0) {
      if (picked !== null) answers[idx] = picked;
      idx--;
      picked = answers[idx];
      recalcScoreAndLastDir();
      renderQuestion();
    }
  });
}

function renderResult() {
  // 안전하게 최종 재계산
  recalcScoreAndLastDir();

  const key = typeKey();
  const found = rs.find(r => r.key === key) ?? rs[0];

  const alias = titleMap[key] ?? "투자 성향 분석 완료";
  const ex = found.examples ?? {};

  const labelMap = {
    core: "코어(광범위)",
    growth: "기술/성장",
    value: "가치/퀄리티",
    factor: "팩터",
    income: "배당/인컴",
    covered: "커버드콜",
    bonds: "채권/현금성",
    stable: "안정",
    hedge: "헷지(금/인플레)",
    lowvol: "저변동",
    intl: "해외",
  };

  const exHtml = Object.keys(ex).length
    ? `
      <div style="margin-top:16px;">
        <div style="font-weight:900; margin-bottom:8px; color:var(--muted);">전략/예시</div>
        ${Object.entries(ex).map(([k, arr]) => `
          <div style="margin:10px 0;">
            <div style="font-weight:800; color:var(--muted); margin-bottom:6px;">
              ${escapeHtml(labelMap[k] ?? k)}
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${(arr ?? []).map(x => `
                <span style="padding:6px 10px; border-radius:999px; background:rgba(255,255,255,.06); color:var(--muted); font-weight:800; font-size:13px;">
                  ${escapeHtml(x)}
                </span>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    `
    : "";

  const aliasHtml = SHOW_ALIAS_LINE ? `
    <div style="text-align:center; color:var(--muted); font-weight:900; margin-top:10px;">
      ${escapeHtml(alias)}
    </div>
  ` : "";

  const keyHtml = SHOW_INTERNAL_KEY ? `
    <div style="text-align:center; color:var(--muted); font-weight:800; margin-top:8px; opacity:.6;">
      내부키: ${escapeHtml(found.key ?? key)}
    </div>
  ` : "";

  const debugHtml = SHOW_SCORE_DEBUG ? `
    <div style="text-align:center; color:var(--muted); font-weight:800; margin-top:8px; opacity:.6;">
      score: ${escapeHtml(JSON.stringify(score))} / last: ${escapeHtml(JSON.stringify(lastDir))}
    </div>
  ` : "";

  panel.innerHTML = `
    <div class="top-progress">
      <div class="progress-wrap">
        <div class="label">진행률</div>
        <div class="progress" aria-label="완료">
          <div class="bar" style="width:100%"></div>
        </div>
      </div>
      <div class="count">${qs.length}/${qs.length}</div>
    </div>

    <div class="panel">
      <h2 class="qtitle">${escapeHtml(found.title)}</h2>
      <div style="text-align:center; color:var(--muted); font-weight:900; margin-top:-6px;">
        ${escapeHtml(found.badge)}
      </div>

      ${aliasHtml}
      ${keyHtml}
      ${debugHtml}

      <div style="margin-top:18px; color:var(--muted); line-height:1.65;">
        ${escapeHtml(found.desc)}
      </div>

      <ul style="margin-top:14px; color:var(--muted); line-height:1.65;">
        ${(found.tips ?? []).map(t => `<li>${escapeHtml(t)}</li>`).join("")}
      </ul>

      ${exHtml}

      <div class="btn-row" style="margin-top:18px;">
        <button class="btn-mini" id="restartBtn">처음으로</button>
        <a class="btn-next enabled" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;"
           href="../../">홈</a>
      </div>
    </div>
  `;

  document.getElementById("restartBtn").addEventListener("click", () => {
    idx = 0;
    score = { R: 0, C: 0, N: 0, H: 0 };
    lastDir = { R: null, C: null, N: null, H: null };
    picked = null;
    answers = Array(qs.length).fill(null);
    renderQuestion();
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (!qs.length || !rs.length) {
  panel.innerHTML = `<div class="panel"><div style="color:var(--muted)">데이터가 비었음</div></div>`;
} else {
  renderQuestion();
}
