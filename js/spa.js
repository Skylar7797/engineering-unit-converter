const navLinks = document.querySelectorAll('.nav-link');

// 페이지 전환
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const pageId = "page-" + link.dataset.page;

    // 모든 페이지 숨기기
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

    // 선택한 페이지 표시
    const page = document.getElementById(pageId);
    if (page) page.style.display = 'block';

    // active 클래스
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// 이벤트 위임으로 Insights 토글 처리
document.addEventListener('click', e => {
  if (e.target.matches('.insights-list h3')) {
    const content = e.target.nextElementSibling;
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
  }
});

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  const insightsPage = document.getElementById('page-insights');
  insightsPage.innerHTML = `
  <h2>Insights</h2>
  <div class="insights-list">
    <div class="insight-item">
      <h3>단위의 시작은 어떻게 된걸까?</h3>
      <div class="insight-content" style="display:none;">
        <p>인류가 물건을 측정하기 위해 만든 최초의 단위는 몸의 일부(손가락, 팔 길이 등)를 기준으로 삼았습니다.</p>
      </div>
    </div>
    <div class="insight-item">
      <h3>미터법의 등장</h3>
      <div class="insight-content" style="display:none;">
        <p>18세기 프랑스 혁명 당시, 전국적으로 통일된 단위 체계를 만들기 위해 미터법이 등장했습니다.</p>
      </div>
    </div>
    <div class="insight-item">
      <h3>국제단위계(SI)의 발전</h3>
      <div class="insight-content" style="display:none;">
        <p>1960년 국제단위계(SI)가 공식적으로 채택되어 전 세계적으로 과학적 단위를 통일하게 되었습니다.</p>
      </div>
    </div>
  </div>`;
});
