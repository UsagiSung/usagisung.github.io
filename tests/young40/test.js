const qs = window.Y40_QUESTIONS ?? [];
const rs = window.Y40_RESULTS ?? [];
const panel = document.getElementById("panel");

let idx = 0;
let score = 0;
let answers = [];

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function renderQuestion(){
  const q = qs[idx];
  const pct = Math.round((idx / qs.length) * 100);

  panel.innerHTML = `
    <div class="progress" aria-label="진행률"><div class="bar" style="width:${pct}%"></div></div>
    <div class="meta">
      <span>문항 ${idx + 1} / ${qs.length}</span>
      <span>현재 점수: ${score}</span>
    </div>
    <h2 class="qtitle">${escapeHtml(q.title)}</h2>
    <p class="qdesc">${escapeHtml(q.desc ?? "")}</p>
    <div class="choices">
      ${q.choices.map((c, i) => `
        <button class="choice" data-i="${i}">${escapeHtml(c.text)}</button>
      `).join("")}
    </div>
  `;

  panel.querySelectorAll(".choice").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.i);
      const choice = q.choices[i];
      answers.push({ qid: q.id, choice: i, score: choice.score });
      score += choice.score;
      idx++;
      if (idx >= qs.length) renderResult();
      else renderQuestion();
    });
  });
}

function renderResult(){
  const found = rs.find(r => score >= r.min && score <= r.max) ?? rs[0];
  panel.innerHTML = `
    <div class="progress" aria-label="완료"><div class="bar" style="width:100%"></div></div>
    <h2 class="result-title">${escapeHtml(found.title)}</h2>
    <div class="pill">${escapeHtml(found.badge)} · 점수 ${score}</div>
    <p class="result-desc" style="margin-top:14px">${escapeHtml(found.desc)}</p>
    <ul class="result-desc">
      ${(found.tips ?? []).map(t => `<li>${escapeHtml(t)}</li>`).join("")}
    </ul>
    <div class="row">
      <button class="btn btn-pink" id="restartBtn">다시하기</button>
      <a class="btn ghost" href="../../">입구로</a>
    </div>
  `;

  document.getElementById("restartBtn").addEventListener("click", () => {
    idx = 0; score = 0; answers = [];
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
  panel.innerHTML = `<p class="qdesc">문항/결과 데이터가 비었어 🐇💬</p>`;
} else {
  renderQuestion();
}
