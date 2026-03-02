// 입구 푸터는 일단 가볍게 알림으로 처리 (나중에 모달/페이지로 확장 가능)
const bind = (id, msg) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("click", (e) => {
    e.preventDefault();
    alert(msg);
  });
};

bind("aboutLink", "About Us: 타입테스트 프로젝트 🐇🐾");
bind("privacyLink", "Privacy Policy: 준비중이야 💋");
bind("contactLink", "Contact: 준비중이야 👋");

const picks = [
  {
    key: "young40",
    title: "영포티 테스트",
    href: "./tests/young40/",
    line: "오늘은 자신감 MAX 모드 😎🔥"
  },
  {
    key: "invest",
    title: "투자 성향 테스트",
    href: "./tests/invest/",
    line: "지갑과 멘탈 밸런스 체크 📈💰"
  },
  {
    key: "hogu",
    title: "호구력 테스트",
    href: "./tests/hogu/",
    line: "연애 레이더 점검 타임 🐶💗"
  },
  {
    key: "love",
    title: "연애 성향 테스트",
    href: "./tests/love/",
    line: "내 연애 밸런스 점검하기 🧠👑"
  },
  {
    key: "jinsang",
    title: "진상 테스트",
    href: "./tests/jinsang/",
    line: "매너력 셀프 진단 들어갑니다 😤📢"
  }
];

const dailyPickBtn = document.getElementById("dailyPickBtn");
const dailyPickResult = document.getElementById("dailyPickResult");

if (dailyPickBtn && dailyPickResult) {
  dailyPickBtn.addEventListener("click", () => {
    const picked = picks[Math.floor(Math.random() * picks.length)];
    dailyPickResult.innerHTML = `${picked.line}<br/><a href="${picked.href}">👉 ${picked.title} 바로 가기</a>`;
  });
}
