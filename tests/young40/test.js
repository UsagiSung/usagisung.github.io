const qs = window.Y40_QUESTIONS ?? [];
const rs = window.Y40_RESULTS ?? [];
const panel = document.getElementById("panel");

let idx = 0;
let score = 0;      // 내부 계산용 (유저에게 노출 X)
let picked = null;  // 현재 문항에서 선택한 choice index

function renderQuestion(){
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
        <button class="btn-mini" id="restartBtn">처음으로</button>
        <button class="btn-next" id="nextBtn" disabled>다음</button>
      </div>

      <div class="home-btn">
        <a href="../../">
          <span aria-hidden="true">⌂</span>
          <span>타입테스트 홈으로 돌아가기</span>
        </a>
      </div>
    </div>
  `;

  picked = null;

  const nextBtn = document.getElementById("nextBtn");
  const restartBtn = document.getElementById("restartBtn");

  panel.querySelectorAll(".choice").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.i);
      picked = i;

      // UI 선택 상태
      panel.querySelectorAll(".choice").forEach(b => {
        b.classList.remove("selected");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("selected");
      btn.setAttribute("aria-checked", "true");

      // 다음 버튼 활성화
      nextBtn.disabled = false;
      nextBtn.classList.add("enabled");
    });
  });

  nextBtn.addEventListener("click", () => {
    if (picked === null) return;

    // 점수는 내부적으로만 누적
    score += q.choices[picked].score;

    idx++;
    if (idx >= qs.length) renderResult();
    else renderQuestion();
  });

  restartBtn.addEventListener("click", () => {
    idx = 0;
    score = 0;
    renderQuestion();
  });
}

function renderResult(){
  const found = rs.find(r => score >= r.min && score <= r.max) ?? rs[0];

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

      <div style="margin-top:18px; color:var(--muted); line-height:1.65;">
        ${escapeHtml(found.desc)}
      </div>

      <ul style="margin-top:14px; color:var(--muted); line-height:1.65;">
        ${(found.tips ?? []).map(t => `<li>${escapeHtml(t)}</li>`).join("")}
      </ul>

      <div class="btn-row">
        <button class="btn-mini" id="restartBtn">처음으로</button>
        <a class="btn-next enabled" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;"
           href="../../">홈</a>
      </div>
    </div>
  `;

  document.getElementById("restartBtn").addEventListener("click", () => {
    idx = 0;
    score = 0;
    renderQuestion();
  });
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

if (!qs.length || !rs.length){
  panel.innerHTML = `<div class="panel"><div style="color:var(--muted)">데이터가 비었어 🐇💬</div></div>`;
} else {
  renderQuestion();
}
