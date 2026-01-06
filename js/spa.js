const navLinks = document.querySelectorAll('.nav-link');

// 페이지 전환
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();

    const pageKey = link.dataset.page;
    const pageId = "page-" + pageKey;

    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

    const page = document.getElementById(pageId);
    if (page) page.style.display = 'block';

    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // GA4 SPA page_view
    trackPage('/' + pageKey, pageKey.toUpperCase());
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
  // GA4 최초 페이지뷰 (SPA 필수)
  trackPage('/', 'Home');
  
  // === INSIGHTS ===
  const insightsList = document.querySelector('#page-insights .insights-list');
  const insights = [
    { 
      title: "The Beginning of Measurement Units", 
      content: `In the early stages of civilization, humans used <u>body parts</u> such as hands, feet, and cubits as natural standards for measurement. These primitive units, though inconsistent, were crucial for trade, construction, and agriculture. Over time, this reliance on human anatomy highlighted the need for more precise and uniform measurement systems, as discrepancies often caused disputes in commerce and construction projects. The use of <span style="color:red;">human-scale references</span> not only provided an intuitive understanding but also laid the foundation for future standardized units, emphasizing that measurement is both a practical and scientific endeavor.` 
    },
    { 
      title: "From Local Units to Regional Standards", 
      content: `Different regions developed their own <u>local units</u> based on common items such as grains, ropes, or body parts. This regional diversity was effective for localized trade but created significant problems for long-distance commerce and engineering projects. For instance, a 'foot' in one city could differ from another, causing misalignments in construction. The emergence of trade networks demanded consistency, eventually inspiring rulers and scholars to create standardized measures. This period marks the transition from intuitive, anthropocentric measurements to more organized, <span style="color:red;">codified systems</span>.`
    },
    { 
      title: "The Birth of the Metric System", 
      content: `During the French Revolution in 1789, scientists and policymakers sought a <span style="color:red;">universal and rational system</span> of measurement. The metric system was introduced, defining units based on natural constants rather than arbitrary human dimensions. The meter was defined as one ten-millionth of the distance from the equator to the North Pole along a meridian. This approach allowed scientists and engineers to communicate measurements consistently, facilitating international collaboration and scientific advancement. The metric system's introduction was a profound step toward global <u>standardization</u>.`
    },
    { 
      title: "Establishing the Meter and Kilogram", 
      content: `The meter and kilogram became the first internationally recognized physical standards. While the meter was based on a fraction of the Earth's meridian, the kilogram was defined using a platinum-iridium cylinder kept in Paris. This tangible artifact served as a reference for mass, highlighting the necessity for accurate physical standards in science and industry. The establishment of these standards enabled engineers to perform calculations and experiments with <span style="color:red;">unprecedented precision</span>, marking a turning point in both theoretical and applied sciences.`
    },
    { 
      title: "Electrical Units and Scientific Consistency", 
      content: `The industrial revolution created a need for standardized electrical measurements. Units like the <span style="color:red;">Volt</span>, <span style="color:red;">Ampere</span>, and <span style="color:red;">Ohm</span> were introduced to quantify electrical phenomena consistently. This standardization allowed for reproducible experiments, reliable design of electrical machinery, and improved safety in infrastructure. The development of these units also provided a framework for emerging technologies such as telegraphy and electric power distribution, laying the groundwork for modern electrical engineering practices.`
    },
    { 
      title: "Time, Frequency, and Precision", 
      content: `Accurate measurement of time became critical for navigation, astronomy, and technology. The second, originally a fraction of the day, was redefined using the vibration frequency of the cesium atom to achieve extreme precision. This <span style="color:red;">atomic definition</span> allowed engineers and scientists to synchronize clocks globally, supporting technologies such as GPS, telecommunications, and high-speed computing. The precise understanding of time demonstrates how fundamental units must evolve alongside technological demands and scientific discoveries.`
    },
    { 
      title: "Temperature Scales and Absolute Measures", 
      content: `Measuring temperature accurately is essential in chemistry, physics, and engineering. Scales such as Celsius and Kelvin provide a universal framework, with <u>absolute zero</u> serving as the theoretical lower limit. Kelvin, in particular, allows calculations that involve thermodynamic laws to be consistent across experiments. The adoption of absolute scales demonstrates the importance of <span style="color:red;">unit standardization</span> in ensuring reproducibility and comparability in scientific research worldwide.`
    },
    { 
      title: "Length Redefined Using Light", 
      content: `Modern metrology defines the meter based on the speed of light in vacuum, linking the unit of length to a fundamental physical constant. This shift from physical artifacts to intrinsic constants ensures <span style="color:red;">universal stability</span> and removes the limitations of material objects. Engineers and scientists now have a length reference that is reproducible anywhere, anytime, and this redefinition supports advanced fields such as optics, nanotechnology, and aerospace engineering.`
    },
    { 
      title: "From Artifacts to Constants", 
      content: `Over centuries, the approach to units has transitioned from tangible objects to abstract constants. This shift enables <span style="color:red;">highly accurate, universally applicable measurements</span> that form the backbone of modern science. Artifacts like the platinum kilogram are being replaced by definitions based on fundamental constants, illustrating the evolution of measurement philosophy and the relentless pursuit of precision in engineering and science.`
    },
    { 
      title: "The Role of SI in Global Engineering", 
      content: `The International System of Units (SI) ensures that engineers and scientists worldwide use a coherent set of standards. This <span style="color:red;">global interoperability</span> reduces errors in communication, design, and experimentation. The SI system covers length, mass, time, electric current, temperature, amount of substance, and luminous intensity, providing a complete framework for both classical and emerging engineering disciplines.`
    }
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
    { title: "How to perform complex unit conversions?", content: `To perform accurate and rapid conversions between different units, select the dimension, the source unit, and the target unit. Enter the numerical value and click the <span style="color:red;">Convert</span> button. The calculator provides precise results instantly. Understanding the underlying relationship between units is also important to verify the conversion, especially for compound units.` },
    { title: "Can the calculator be used offline?", content: `Yes, all calculations run entirely on the user's device using <span style="color:red;">client-side JavaScript</span>. No internet connection is required once the page has loaded. This ensures that engineers and students can continue working in environments where connectivity is limited or unavailable.` },
    { title: "What angle modes are available in the calculator?", content: `The calculator supports both <span style="color:red;">Radian</span> and <span style="color:red;">Degree</span> modes. Users can toggle between the modes using the RAD/DEG button. This feature is crucial for trigonometric calculations, ensuring that results are accurate and suitable for different engineering applications.` },
    { title: "How can I save or reference notes?", content: `The Note boxes (Note 1~3) allow temporary storage of calculations and observations. While the data is not permanently saved, it remains accessible during the session. This feature is useful for recording intermediate steps, assumptions, or important values while performing multi-step calculations.` },
    { title: "Is the website mobile-friendly?", content: `The interface is fully responsive, allowing usage on mobile phones, tablets, and desktops. Layouts adjust automatically to screen size, ensuring that all features, including the converter, calculator, FAQ, and Help sections, are accessible without horizontal scrolling or interface issues.` }
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
    { title: "Using the Unit Converter", content: `Select the appropriate dimension, units, and numerical value, then click <span style="color:red;">Convert</span>. The tool instantly provides the result and also ensures the conversion is precise by referencing standardized unit definitions.` },
    { title: "Using the Scientific Calculator", content: `Click numbers, operators, and functions to construct expressions. Use the <span style="color:red;">equal (=)</span> button to calculate. Toggle between RAD and DEG modes for trigonometric functions. The calculator also displays the history of calculations for review.` },
    { title: "Taking Notes", content: `You can write temporary notes in the Note 1~3 boxes. These notes persist until the page is refreshed, allowing you to track intermediate results, formulas, or observations while performing complex calculations.` },
    { title: "Contact Support", content: `If you encounter any issues, click the <span style="color:red;">Contact</span> link in the footer. Support staff can assist with technical problems, questions about functionality, or suggestions for improvement.` }
  ];

  const helpContainer = helpList.querySelector('.help-list');
  helpItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'help-item';
    div.innerHTML = `<h3>${item.title}</h3><div class="help-content" style="display:none;">${item.content}</div>`;
    helpContainer.appendChild(div);
  });
});
