const qs = window.JINSANG_QUESTIONS ?? [];
const rs = window.JINSANG_RESULTS ?? [];
const panel = document.getElementById("panel");

let idx = 0;                 // 현재 문항 인덱스
let score = 0;               // 내부 계산용 (유저에게 노출 X)
let picked = null;           // 현재 문항에서 선택한 choice index
let answers = Array(qs.length).fill(null); // 각 문항의 선택 기록

function recalcScore(){
  score = answers.reduce((sum, a, i) => {
    if (a == null) return sum;
    const choice = qs[i]?.choices?.[a];
    return sum + (choice?.score ?? 0);
  }, 0);
}

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
        <button class="btn-mini" id="backBtn">이전</button>
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

  // 현재 문항의 이전 선택 복원
  picked = answers[idx];
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");
  const choiceBtns = panel.querySelectorAll(".choice");

  if (picked !== null && picked !== undefined){
    const prevBtn = panel.querySelector(`.choice[data-i="${picked}"]`);
    if (prevBtn){
      prevBtn.classList.add("selected");
      prevBtn.setAttribute("aria-checked", "true");
      nextBtn.disabled = false;
      nextBtn.classList.add("enabled");
    }
  }

  // 첫 문항에서는 뒤로가기 비활성화
  if (idx === 0){
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

  // 다음 버튼: 현재 선택 저장하고 다음 문항으로
  nextBtn.addEventListener("click", () => {
    if (picked === null) return;

    answers[idx] = picked;  // 기록
    recalcScore();          // 항상 최신 점수 유지

    idx++;
    if (idx >= qs.length) renderResult();
    else renderQuestion();
  });

  // 뒤로가기 버튼: 이전 문항으로 이동(선택도 자동 복원)
  backBtn.addEventListener("click", () => {
    if (idx > 0){
      // 현재 문항의 선택 상태를 저장(아직 저장 안했을 수도 있으니 반영)
      if (picked !== null) answers[idx] = picked;

      idx--;
      picked = answers[idx]; // 이전 선택 복원은 renderQuestion에서 처리
      recalcScore();
      renderQuestion();
    }
  });
}

function renderResult(){
  // 결과 진입 시 최종 점수 재계산(안전)
  recalcScore();

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
    picked = null;
    answers = Array(qs.length).fill(null);
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
  panel.innerHTML = `<div class="panel"><div style="color:var(--muted)">데이터가 비었어 💬</div></div>`;
} else {
  renderQuestion();
}
