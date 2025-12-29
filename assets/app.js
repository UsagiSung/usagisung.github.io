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
