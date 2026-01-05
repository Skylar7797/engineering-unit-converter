const navLinks = document.querySelectorAll('.nav-link');

// 페이지 전환
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const pageId = "page-" + link.dataset.page;

    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

    const page = document.getElementById(pageId);
    if (page) page.style.display = 'block';

    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// 이벤트 위임으로 토글 처리
document.addEventListener('click', e => {
  if (e.target.matches('.insights-list h3, .faq-list h3, .help-list h3')) {
    const content = e.target.nextElementSibling;
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
  }
});

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  // === INSIGHTS ===
  const insightsList = document.querySelector('#page-insights .insights-list');
  const insights = [
    { title: "The Beginning of Measurement Units", content: "Early humans measured using **body parts** like hands, feet, and cubits, providing a <span style='color:blue;'>human-scale reference</span> for daily life." },
    { title: "From Cubits to Local Standards", content: "Different regions developed <u>unique local units</u>, leading to confusion in trade and engineering." },
    { title: "The Introduction of the Metric System", content: "In <span style='color:green;'>1789 France</span>, the metric system was proposed to unify measurements based on natural constants." },
    { title: "The Definition of the Meter", content: "Originally, the meter was defined as one ten-millionth of the distance from the equator to the North Pole along a meridian." },
    { title: "The Kilogram and Mass Standardization", content: "A platinum-iridium cylinder became the <b>first standard kilogram</b>, kept in Paris, marking the start of mass standardization." },
    { title: "International Unit System (SI)", content: "In 1960, the <span style='color:red;'>SI system</span> was adopted, creating a universal system for scientific and engineering use." },
    { title: "Electrical Units Evolution", content: "Volt, Ampere, and Ohm were standardized to ensure consistency in electrical engineering calculations." },
    { title: "Time and Frequency Units", content: "The second was redefined using the cesium atom's vibration frequency, providing extreme precision for technology." },
    { title: "Temperature Units in Science", content: "Kelvin and Celsius scales allow scientists to compare experiments across the globe, with <u>absolute zero</u> as the lower limit." },
    { title: "Modern Trends in Units", content: "Today, units like the meter are defined using <b>light speed</b>, reflecting the shift from physical artifacts to fundamental constants." }
  ];

  insights.forEach(item => {
    const div = document.createElement('div');
    div.className = 'insight-item';
    div.innerHTML = `<h3>${item.title}</h3><div class="insight-content" style="display:none;">${item.content}</div>`;
    insightsList.appendChild(div);
  });

  // === FAQ ===
  const faqList = document.querySelector('#page-faq');
  faqList.innerHTML = `<h2>FAQ</h2><div class="faq-list"></div>`;
  const faqItems = [
    { title: "How do I convert units quickly?", content: "Use the <b>Unit Converter</b> section. Select dimensions and units, enter the value, and click Convert." },
    { title: "Can I use the calculator offline?", content: "Yes, all calculations run <span style='color:green;'>client-side</span>, no internet required." },
    { title: "What angle modes are supported?", content: "Both <b>Radian</b> and <b>Degree</b> modes are available. Toggle using the RAD/DEG button." },
    { title: "Can I store notes?", content: "Yes, the Note 1~3 areas let you save calculation notes temporarily in the browser." },
    { title: "Is the site mobile-friendly?", content: "The interface is responsive and works on mobile, tablet, and desktop screens." }
  ];

  const faqContainer = faqList.querySelector('.faq-list');
  faqItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'faq-item';
    div.innerHTML = `<h3>${item.title}</h3><div class="faq-content" style="display:none;">${item.content}</div>`;
    faqContainer.appendChild(div);
  });

  // === HELP ===
  const helpList = document.querySelector('#page-help');
  helpList.innerHTML = `<h2>Help</h2><div class="help-list"></div>`;
  const helpItems = [
    { title: "Using the Unit Converter", content: "Select the category, units, and value, then click Convert." },
    { title: "Using the Scientific Calculator", content: "Click numbers and functions to build expressions. Use = to calculate." },
    { title: "Saving and Viewing Notes", content: "Write notes in the Note boxes. They stay until the page is refreshed." },
    { title: "Contact Support", content: "For questions, reach us via the Contact link in the footer." }
  ];

  const helpContainer = helpList.querySelector('.help-list');
  helpItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'help-item';
    div.innerHTML = `<h3>${item.title}</h3><div class="help-content" style="display:none;">${item.content}</div>`;
    helpContainer.appendChild(div);
  });
});
