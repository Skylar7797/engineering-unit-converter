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
    content: `In the earliest stages of human civilization, people relied on <u>body parts</u> such as hands, feet, arms, and cubits as natural standards for measurement. These references were intuitive and universally accessible, making them practical for early trade, construction, and agriculture. However, because body sizes varied from person to person, these units lacked consistency and accuracy. As societies grew and interactions expanded, disputes frequently arose due to inconsistent measurements. Despite their limitations, these early methods introduced the fundamental idea that physical quantities could be compared and quantified. The reliance on <span style="color:red;">human-scale references</span> shaped humanity’s initial understanding of space, length, and proportion, laying the conceptual groundwork for future standardized measurement systems and demonstrating that measurement has always been deeply tied to both daily life and scientific progress.` 
  },

  { 
    title: "From Local Units to Regional Standards", 
    content: `As civilizations advanced, different regions developed their own <u>local units</u> based on commonly available references such as grains, ropes, stones, or tools. While these units worked well within isolated communities, they created serious challenges as trade expanded beyond local boundaries. A unit like a “foot” or “pound” could vary significantly between cities or kingdoms, leading to errors in construction, unfair trade practices, and engineering failures. The growth of regional trade networks and early empires exposed the inefficiency of fragmented systems, prompting rulers and scholars to seek harmonization. This era represents a crucial shift toward <span style="color:red;">codified systems</span>, where measurement began to be regulated, documented, and enforced, marking the transition from informal tradition to organized standardization.` 
  },

  { 
    title: "The Birth of the Metric System", 
    content: `During the French Revolution in 1789, the need for a <span style="color:red;">universal and rational system</span> of measurement became a political and scientific priority. Revolutionary thinkers sought to eliminate arbitrary and region-specific units in favor of a system grounded in nature and reason. The metric system emerged with the ambitious goal of universal applicability, defining units based on natural phenomena rather than human convention. The meter was defined as one ten-millionth of the distance from the equator to the North Pole along a meridian. This radical approach allowed measurements to be reproduced anywhere on Earth, facilitating scientific collaboration, international trade, and engineering consistency. The metric system marked a decisive step toward global <u>standardization</u> and remains one of the most influential scientific reforms in history.` 
  },

  { 
    title: "Establishing the Meter and Kilogram", 
    content: `The meter and kilogram became the first internationally recognized physical standards, providing tangible references for length and mass. The meter’s definition was derived from Earth’s geometry, while the kilogram was represented by a platinum-iridium cylinder stored in Paris. This artifact-based approach highlighted both the strengths and limitations of physical standards. While they enabled consistent measurements across borders, they were vulnerable to contamination, wear, and environmental effects. Nevertheless, these standards allowed scientists and engineers to perform experiments and calculations with <span style="color:red;">unprecedented precision</span>. Their adoption accelerated industrialization, improved manufacturing accuracy, and reinforced the idea that reliable measurement is foundational to scientific and technological advancement.` 
  },

  { 
    title: "Electrical Units and Scientific Consistency", 
    content: `The industrial revolution and the rise of electrical technology demanded precise and reproducible measurement systems. Units such as the <span style="color:red;">Volt</span>, <span style="color:red;">Ampere</span>, and <span style="color:red;">Ohm</span> were introduced to quantify voltage, current, and resistance in a consistent manner. Without standardized electrical units, designing safe power systems and conducting repeatable experiments would have been impossible. These units enabled engineers to calculate energy losses, optimize circuit designs, and ensure compatibility across devices. Moreover, electrical unit standardization laid the groundwork for transformative technologies including telecommunication networks, electric grids, and electronic computing, making it a cornerstone of modern engineering.` 
  },

  { 
    title: "Time, Frequency, and Precision", 
    content: `Accurate time measurement has always been essential for navigation, astronomy, and technological coordination. Initially defined as a fraction of a day, the second was later redefined using the vibration frequency of the cesium atom. This <span style="color:red;">atomic definition</span> provides extraordinary precision, enabling synchronization across the globe. Such accuracy underpins technologies like GPS navigation, high-speed data communication, and financial transaction systems. The evolution of time measurement illustrates how units must adapt as technology advances, ensuring that increasing demands for precision can be met reliably and universally.` 
  },

  { 
    title: "Temperature Scales and Absolute Measures", 
    content: `Temperature measurement plays a critical role in physics, chemistry, and engineering processes. Scales such as Celsius and Kelvin provide standardized frameworks for quantifying thermal energy. The concept of <u>absolute zero</u> defines the theoretical lower bound of temperature, offering a reference point grounded in physical law. Kelvin, as an absolute scale, allows thermodynamic equations to be applied consistently across experiments and industries. The adoption of absolute temperature scales demonstrates how <span style="color:red;">unit standardization</span> ensures reproducibility, safety, and comparability in scientific research and industrial applications worldwide.` 
  },

  { 
    title: "Length Redefined Using Light", 
    content: `Modern metrology defines the meter based on the speed of light in a vacuum, linking length measurement to a fundamental physical constant. This transition eliminated reliance on physical artifacts, which are susceptible to damage and variation. By defining length through light, scientists achieved <span style="color:red;">universal stability</span> and reproducibility. This definition supports advanced technologies such as laser interferometry, nanofabrication, and aerospace engineering, where extreme precision is mandatory. The redefinition of length exemplifies the broader shift toward constant-based measurement systems in modern science.` 
  },

  { 
    title: "From Artifacts to Constants", 
    content: `Over time, measurement philosophy has evolved from reliance on physical artifacts to definitions based on immutable natural constants. This shift enables <span style="color:red;">highly accurate, universally applicable measurements</span> that remain consistent regardless of location or era. The replacement of artifacts like the platinum kilogram with constant-based definitions reflects humanity’s pursuit of precision and reliability. This evolution ensures that scientific results remain comparable across generations and that engineering designs meet ever-tightening tolerances in modern technology.` 
  },

  { 
    title: "The Role of SI in Global Engineering", 
    content: `The International System of Units (SI) provides a coherent and comprehensive framework used by engineers and scientists worldwide. This <span style="color:red;">global interoperability</span> minimizes miscommunication, reduces errors, and ensures compatibility across international projects. Covering seven base units, SI supports disciplines ranging from classical mechanics to cutting-edge nanotechnology. Its universal adoption underscores the idea that shared standards are essential for innovation, safety, and progress in an increasingly interconnected world.` 
  },

  {
    title: "When Units Go Wrong: Engineering Failures",
    content: `History provides numerous examples where incorrect unit usage led to catastrophic failures. One famous case is NASA’s Mars Climate Orbiter, which was lost due to a mismatch between metric and imperial units. Such incidents demonstrate that unit consistency is not a trivial concern but a critical requirement for engineering success. These failures highlight the importance of <span style="color:red;">rigorous unit management</span>, thorough verification, and standardized systems. By studying these mistakes, engineers learn that precise unit conversion and adherence to standards are essential safeguards against costly and sometimes dangerous outcomes.`
  },

  {
    title: "Units in Semiconductor Manufacturing",
    content: `Semiconductor manufacturing relies on extremely precise units such as nanometers, micrometers, parts per million (ppm), and Torr. As feature sizes shrink, even minor deviations can lead to significant yield losses. Accurate measurement of thickness, pressure, and chemical concentration is vital to maintaining process stability. This environment illustrates how <span style="color:red;">unit precision directly affects product performance</span>. The semiconductor industry exemplifies the real-world importance of standardized units in high-technology manufacturing and underscores why precise metrology is indispensable in modern engineering.`
  },

  {
    title: "Why Unit Conversion Accuracy Matters",
    content: `Unit conversion errors can introduce hidden risks into calculations, designs, and real-world implementations. Manual conversions are particularly vulnerable to mistakes, especially when dealing with complex or unfamiliar units. Automated tools and converters help mitigate these risks by ensuring consistency and accuracy. The need for reliable conversion highlights the value of <span style="color:red;">digital calculation tools</span> in engineering workflows. Accurate conversion is not merely a convenience; it is a fundamental requirement for safety, efficiency, and correctness in technical fields.`
  },

  {
    title: "Accuracy, Precision, and Measurement Uncertainty",
    content: `In engineering and science, accuracy and precision represent distinct concepts. Accuracy describes how close a measurement is to the true value, while precision reflects the consistency of repeated measurements. Understanding measurement uncertainty is essential for interpreting results and making informed decisions. Engineers must account for tolerances and error margins to ensure reliable designs. Recognizing the difference between these concepts reinforces the importance of <span style="color:red;">quantitative rigor</span> and demonstrates that measurement is as much about understanding limitations as it is about obtaining values.`
  },
    
  {
    title: "When Units Go Wrong: Engineering Failures",
    content: `Engineering history contains multiple examples where improper unit usage resulted in costly or catastrophic failures. One of the most well-known cases is NASA’s Mars Climate Orbiter, which was lost because one engineering team used imperial units while another used metric units. This mismatch caused incorrect trajectory calculations, ultimately leading to the spacecraft’s destruction. Similar issues have occurred in aviation, medicine, and construction, where incorrect unit conversion has led to structural failures, dosage errors, and safety incidents. These examples demonstrate that unit management is not merely an academic concern but a fundamental engineering responsibility. The lesson is clear: <span style="color:red;">consistent unit usage and verification</span> must be embedded into every stage of design, calculation, and validation. Standardized units, documentation, and automated checks exist precisely to prevent such failures, reinforcing why unit discipline is essential for reliable and safe engineering outcomes.`
  },

  {
    title: "Units in Semiconductor Manufacturing",
    content: `Semiconductor manufacturing represents one of the most unit-sensitive industries in modern engineering. Process parameters are measured in nanometers, micrometers, parts per million (ppm), Torr, and seconds, where even slight deviations can result in yield loss or device failure. As transistor dimensions continue to shrink, precise control of thickness, pressure, temperature, and chemical concentration becomes increasingly critical. Engineers rely on exact unit definitions to maintain consistency across fabrication steps such as lithography, etching, and deposition. In this environment, <span style="color:red;">measurement accuracy directly impacts profitability</span>, reliability, and performance. The semiconductor industry demonstrates how standardized units and precise metrology enable advanced technology, illustrating that modern electronics depend not only on design innovation but also on rigorous control of fundamental physical quantities.`
  },

  {
    title: "Why Unit Conversion Accuracy Matters",
    content: `Accurate unit conversion is a critical requirement in engineering, science, and everyday technical tasks. Errors in conversion can propagate silently through calculations, leading to incorrect conclusions or unsafe designs. Manual conversions are especially prone to mistakes when dealing with unfamiliar or complex units, increasing the risk of oversight. Automated conversion tools and calculators significantly reduce these risks by enforcing consistent mathematical relationships between units. This highlights the importance of <span style="color:red;">reliable digital conversion systems</span> in modern workflows. Accurate conversion is not just a matter of convenience; it is essential for ensuring correctness, safety, and efficiency in engineering processes, financial calculations, and scientific research, where small numerical errors can have large real-world consequences.`
  },

  {
    title: "Accuracy, Precision, and Measurement Uncertainty",
    content: `Accuracy and precision are often used interchangeably in casual language, but they represent distinct concepts in measurement science. Accuracy refers to how close a measurement is to the true value, while precision indicates how consistently measurements can be repeated. A system may be precise but inaccurate, or accurate but imprecise, depending on calibration and variability. Understanding measurement uncertainty is essential for interpreting results and making sound engineering decisions. Engineers must account for tolerances, error margins, and uncertainty propagation when designing systems. Recognizing these distinctions reinforces the importance of <span style="color:red;">quantitative rigor</span>, emphasizing that measurement is not only about obtaining numbers but also about understanding their limitations and reliability in practical applications.`
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
