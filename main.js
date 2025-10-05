// ==================== Bootstrap ====================
// JS активний → забираємо no-js (секції видно навіть при збоях)
document.documentElement.classList.remove('no-js');


// ==================== LANGUAGE SWITCHING ====================
(function languageInit() {
  const html = document.documentElement;
  const btn = document.getElementById('lang-toggle');
  const LANG_KEY = 'language-preference';
  
  function updateLanguage(lang) {
    html.setAttribute('data-lang', lang);
    
    // Update navigation text
    document.querySelectorAll('[data-da][data-en]').forEach(el => {
      const text = lang === 'da' ? el.getAttribute('data-da') : el.getAttribute('data-en');
      if (text && !el.querySelector('span, div')) {
        el.textContent = text;
      }
    });
    
    // Update placeholder text
    document.querySelectorAll('[data-placeholder-da][data-placeholder-en]').forEach(el => {
      const placeholder = lang === 'da' ? el.getAttribute('data-placeholder-da') : el.getAttribute('data-placeholder-en');
      if (placeholder) {
        el.setAttribute('placeholder', placeholder);
      }
    });
    
    // Update chat suggestions
    document.querySelectorAll('[data-q-da][data-q-en]').forEach(el => {
      const question = lang === 'da' ? el.getAttribute('data-q-da') : el.getAttribute('data-q-en');
      if (question) {
        el.setAttribute('data-q', question);
      }
    });
    
    // Update button text and flag
    if (btn) {
      const flag = lang === 'da' ? '🇬🇧' : '🇩🇰';
      const text = lang === 'da' ? 'EN' : 'DA';
      btn.innerHTML = `<span class="lang-flag">${flag}</span> ${text}`;
    }
    
    localStorage.setItem(LANG_KEY, lang);
  }
  
  // Initialize language
  const saved = localStorage.getItem(LANG_KEY) || 'da';
  updateLanguage(saved);
  
  // Toggle language
  btn?.addEventListener('click', () => {
    const current = html.getAttribute('data-lang') || 'da';
    const next = current === 'da' ? 'en' : 'da';
    updateLanguage(next);
  });
})();


// ==================== MODERN THEME SYSTEM ====================
(function themeInit(){
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const metaTheme = document.getElementById('meta-theme-color');

  const THEMES = { LIGHT:'light', DARK:'dark', AUTO:'auto' };
  const STORAGE_KEY = 'theme-preference';
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function updateToggleLabel(mode){
    const isDark = (mode === THEMES.DARK) || (mode === THEMES.AUTO && systemPrefersDark);
    if (btn){
      btn.textContent = isDark ? '🌤 Light' : '🌙 Dark';
      btn.setAttribute('aria-pressed', String(isDark));
    }
  }
  
  function updateMetaThemeColor(mode){
    const styles = getComputedStyle(document.documentElement);
    const isDark = (mode === THEMES.DARK) || (mode === THEMES.AUTO && systemPrefersDark);
    const headerColor = isDark ? '#0f172a' : '#667eea';
    if (metaTheme) metaTheme.setAttribute('content', headerColor);
  }
  
  function applyTheme(mode){
    html.setAttribute('data-theme', mode);
    updateToggleLabel(mode);
    updateMetaThemeColor(mode);
  }
  
  function currentMode(){
    return html.getAttribute('data-theme') || THEMES.DARK;
  }

  // init - default to dark theme
  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(saved || THEMES.DARK);

  // react to system change in AUTO
  if (window.matchMedia){
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', () => {
      if (currentMode() === THEMES.AUTO){
        updateToggleLabel(THEMES.AUTO);
        updateMetaThemeColor(THEMES.AUTO);
      }
    });
  }

  // toggle: Dark → Light → Auto → Dark...
  btn?.addEventListener('click', () => {
    const mode = currentMode();
    const next = mode === THEMES.DARK ? THEMES.LIGHT
               : mode === THEMES.LIGHT ? THEMES.AUTO
               : THEMES.DARK;
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  });
})();


// ==================== Плавні якорі ====================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', id);
  });
});


// ==================== Reveal-on-scroll ====================
(function setupReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target); // одноразово
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealEls.forEach(el => io.observe(el));
})();


// ==================== Enhanced Active nav + Scroll progress ====================
(function highlightActiveNav() {
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = new Map(
    [...document.querySelectorAll('nav a[href^="#"]')]
      .map(a => [a.getAttribute('href').slice(1), a])
  );
  if (!('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = links.get(id);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: 0.6 });

  sections.forEach(sec => io.observe(sec));
})();

(function scrollProgress() {
  const root = document.documentElement;
  let ticking = false;

  function update() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY || window.pageYOffset;
    const p = h > 0 ? Math.min(1, Math.max(0, y / h)) : 0;
    root.style.setProperty('--scroll', p.toFixed(3));
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // Рік у футері
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
})();


// ==================== AI CV Chat (мінімізувати/закривати) ====================
(function aiChat(){
  const toggle   = document.getElementById('ai-chat-toggle');
  const pane     = document.getElementById('ai-chat');
  const btnMin   = document.getElementById('ai-chat-minimize');
  const btnClose = document.getElementById('ai-chat-close');
  const form     = document.getElementById('ai-chat-form');
  const input    = document.getElementById('ai-chat-input');
  const log      = document.getElementById('ai-chat-log');
  const suggests = document.getElementById('ai-chat-suggests');

  if (!toggle || !pane) return;

  // helpers
  const norm = s => (s||'')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu,'')
    .replace(/[^a-z0-9æøåäöü \-]/gi,' ')
    .replace(/\s+/g,' ')
    .trim();

  function say(text, who='bot'){
    const msg = document.createElement('div');
    msg.className = `ai-msg ai-msg--${who}`;
    msg.innerHTML = text;
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
  }
  function think(on=true){
    const id = 'ai-typing';
    let el = document.getElementById(id);
    if (on && !el){
      el = document.createElement('div');
      el.id = id; el.className='ai-msg ai-msg--bot ai-typing';
      const currentLang = document.documentElement.getAttribute('data-lang') || 'da';
      el.textContent = currentLang === 'en' ? 'Typing...' : 'Skriver…';
      log.appendChild(el);
    } else if (!on && el){ el.remove(); }
    log.scrollTop = log.scrollHeight;
  }

  // Enhanced Knowledge base with AI integration focus
  const KB = [
    { t:['ai','artificial intelligence','integration','business analysis','etisk ai','ethical ai','governance'],
      a:`<strong>AI Integration & Business Analysis</strong><br>
         • Specialiserer mig i at forbinde forretningsbehov med AI-baserede løsninger.<br>
         • Fokus på etisk AI-governance, databeskyttelse og GDPR-compliance.<br>
         • Anvender analytisk tilgang til at oversætte komplekse tekniske koncepter til ikke-tekniske interessenter.` },
    { t:['fullstack','development','frontend','backend','goit','javascript','node'],
      a:`<strong>FullStack Development</strong><br>
         • Igangværende uddannelse på GoIT (2024–2025).<br>
         • Praktisk erfaring med front-end og back-end udvikling.<br>
         • Stack: JavaScript, HTML5, CSS3, React, Node.js, Git/GitHub.` },
    { t:['krise','crisis','management','problemløsning','uia','ukraine','flyulykke','iran'],
      a:`<strong>Krisehåndtering & Problemløsning</strong><br>
         • Nøglerolle under den tragiske UIA-flyulykke i Iran som del af det centrale team.<br>
         • Dokumenteret evne til at navigere i komplekse, usikre miljøer under tidspres.<br>
         • Stærk baggrund i risiko-vurdering og hurtige beslutninger.` },
    { t:['kommunikation','communication','pr','manager','uia','ukraine international airlines','digital team'],
      a:`<strong>Communication/PR Manager — Ukraine International Airlines (2017–2022)</strong><br>
         • Etablerede og ledede et team på 10 social medie-specialister.<br>
         • Håndterede strategisk krisekommunikation og udviklede digitale kommunikationsstrategier.<br>
         • Støttede direktionen med briefings og interviewmaterialer til CEO.` },
    { t:['projektledelse','project management','leadership','team','stakeholder'],
      a:`<strong>Projektledelse & Teamledelse</strong><br>
         • Solid erfaring i at lede tværfunktionelle teams og styre projekter fra koncept til implementering.<br>
         • Stærk i stakeholder engagement og formidling af tekniske koncepter.<br>
         • Erfaring med at drive organisatoriske forandringer.` },
    { t:['tui','agency relations','partnerskaber','booking systemer'],
      a:`<strong>Agency Relations Manager — TUI (2020)</strong><br>
         • Vedligeholdt partnerskaber med rejsebureauer og leverede træning i online bookingsystemer.<br>
         • Administrerede onlinesystemer og loyalitetsprogrammer for at forbedre partner-engagement.` },
    { t:['køkkenassistent','gymnastik','ollerup','2025','current job'],
      a:`<strong>Køkkenassistent — Gymnastikhøjskolen i Ollerup (2025–nu)</strong><br>
         • Tilbereder mad i forskellige køkkenafdelinger (bageri, koldt & varmt køkken).<br>
         • Fokus på hygiejne og tidsfrister i et travlt teammiljø.` },
    { t:['danmark','arbejdskultur','midlertidige stillinger','2022-2024'],
      a:`<strong>Øvrig Beskæftigelse i Danmark (2022–2024)</strong><br>
         • Erfaring fra lager-, rengørings- og servicejobs.<br>
         • Opnåede værdifuld indsigt i dansk arbejdskultur og gennemførte videreuddannelse.<br>
         • Viser tilpasningsevne og engagement i kontinuerlig læring.` },
    { t:['uddannelse','education','ai course','fullstack','goit','bachelor','technical translation'],
      a:`<strong>Uddannelse & Kurser</strong><br>
         • <strong>AI Integration for Business, Marketing and Communications</strong> (igangværende, 2025)<br>
         • <strong>Fullstack Development</strong> — GoIT (2024–2025)<br>
         • <strong>Bachelor i Teknisk Oversættelse</strong> — National Transport University, Kyiv (2016)<br>
         • <strong>Danskuddannelse (DU3.5, B2)</strong> — UCplus & AOF (2022-2025)` },
    { t:['skills','færdigheder','tech','stack','værktøjer','ai tools','cloud'],
      a:`<strong>Tekniske Færdigheder</strong><br>
         • <strong>AI & Machine Learning:</strong> ChatGPT, CopyAI, AI Integration, Ethical AI, GDPR Compliance<br>
         • <strong>Frontend:</strong> JavaScript, HTML5, CSS3, React, Responsive Design<br>
         • <strong>Backend & Tools:</strong> Node.js, Git/GitHub, AWS, Google Cloud, APIs<br>
         • <strong>Design:</strong> Figma, Canva, Avid Media Composer, UX/UI` },
    { t:['volunteer','frivilligt','røde kors','tolk','event','coordinator','ukrainsk'],
      a:`<strong>Frivilligt Arbejde</strong><br>
         • <strong>Tolk & Eventkoordinator — Røde Kors Danmark (2022–2023)</strong>: Arrangerede events og leverede oversættelsestjenester for ukrainere.<br>
         • <strong>Kommunikationskonsulent (2022–2024)</strong>: Hjalp ukrainske familier i Danmark og Ukraine med humanitær støtte og socialisering.` },
    { t:['sprog','languages','danish','english','ukrainian','russian','german','c1','b2'],
      a:`<strong>Sprog</strong><br>
         • <strong>Engelsk (C1)</strong> — Flydende<br>
         • <strong>Dansk (B2)</strong> — Avanceret niveau<br>
         • <strong>Ukrainsk (C2)</strong> — Modersmål<br>
         • <strong>Russisk (C2)</strong> — Flydende<br>
         • <strong>Tysk (A1)</strong> — Begynderniveau` },
    { t:['kontakt','email','telefon','contact','aarslev','fyn'],
      a:`<strong>Kontakt Information</strong><br>
         📧 <a href="mailto:chaplyhina.anastasiia@gmail.com">chaplyhina.anastasiia@gmail.com</a><br>
         📞 <a href="tel:+4555279574">+45 55 27 95 74</a><br>
         📍 Aarslev, Fyn, Danmark<br>
         💼 Lovligt arbejde i Danmark/EU` },
    { t:['summary','om mig','about','profil','professional profile','proaktiv'],
      a:`<strong>Professionel Profil</strong><br>
         Proaktiv og løsningsorienteret professionel med en unik kombination af erfaring i krisekommunikation og nyerhvervede færdigheder inden for AI og FullStack-udvikling. Jeg specialiserer mig i at identificere forretningsbehov og oversætte dem til teknologiske løsninger, der forbedrer effektiviteten og skaber reel værdi.` },
  ];

  function retrieve(q){
    const s = norm(q);
    if (!s) return null;
    const tokens = new Set(s.split(' ').filter(Boolean));
    let best = null, bestScore = 0;
    for (const item of KB){
      const hay = item.t.join(' ');
      let score = 0;
      for (const tok of tokens){ if (hay.includes(tok)) score++; }
      if (/(uia|ukraine|tui|ringkøbing|lampemestern|røde kors|skills|uddannelse)/.test(s)) score += 2;
      if (score > bestScore){ bestScore = score; best = item; }
    }
    // Boost score for key terms
    if (bestScore > 0 && /(ai|artificial intelligence|fullstack|crisis|communication|ukraine|project management)/.test(s)) {
      bestScore += 2;
    }
    return bestScore > 0 ? best : null;
  }

  async function answer(q){
    const n = norm(q);
    if (!n) return 'Skriv et spørgsmål om AI-integration, FullStack-udvikling, krisehåndtering eller anden erfaring 🙂';
    if (/^(hej|hello|hi|hey)\b/.test(n)){
      const currentLang = document.documentElement.getAttribute('data-lang') || 'da';
      if (currentLang === 'en') {
        return 'Hello! Ask me about: "AI integration experience", "Technical skills", "Crisis management" or "FullStack development".';
      }
      return 'Hej! Spørg fx: "AI integration erfaring", "Tekniske færdigheder", "Krisehåndtering" eller "FullStack udvikling".';
    }
    const found = retrieve(q);
    if (found) return found.a;
    const currentLang = document.documentElement.getAttribute('data-lang') || 'da';
    if (currentLang === 'en') {
      return 'I didn\'t quite catch that. Try asking about AI integration, FullStack development, crisis management, or technical skills.';
    }
    return 'Det har jeg ikke helt fanget endnu. Prøv at spørge om AI-integration, FullStack-udvikling, krisehåndtering eller tekniske færdigheder.';
  }

  // UI
  function openChat(){
    pane.hidden = false;
    pane.classList.remove('collapsed');
    toggle.setAttribute('aria-expanded','true');
    if (!log.dataset.init){
      const currentLang = document.documentElement.getAttribute('data-lang') || 'da';
      const welcomeMsg = currentLang === 'en' 
        ? 'Hello! I\'m your CV bot. Ask me about AI integration, FullStack development, crisis management, or technical skills (da/en).'
        : 'Hej! Jeg er din CV-bot. Spørg mig om AI-integration, FullStack-udvikling, krisehåndtering eller tekniske færdigheder (da/en).';
      say(welcomeMsg);
      log.dataset.init = '1';
    }
    setTimeout(()=>input?.focus(), 0);
  }
  function closeChat(){
    pane.hidden = true;
    toggle.setAttribute('aria-expanded','false');
    toggle.focus();
  }
  function toggleMinimize(){
    pane.classList.toggle('collapsed');
  }

  toggle.addEventListener('click', () => (pane.hidden ? openChat() : closeChat()));
  btnClose?.addEventListener('click', closeChat);
  btnMin?.addEventListener('click', toggleMinimize);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pane.hidden) closeChat(); });

  // форма: блокуємо дефолт (щоб не було ?q=…)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const q = input.value.trim();
    if (!q) return;
    say(q, 'user');
    input.value = '';
    think(true);
    const a = await answer(q);
    think(false);
    say(a, 'bot');
  });

  suggests?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-q]');
    if (!b) return;
    input.value = b.dataset.q;
    form.dispatchEvent(new Event('submit', { cancelable:true, bubbles:true }));
  });
})();

// ==================== Portfolio (filters + search + sort) ====================
(function setupPortfolio(){
  const grid   = document.getElementById('portfolio-grid');
  const tagsEl = document.getElementById('portfolio-tags');
  const qEl    = document.getElementById('portfolio-search');
  const sortEl = document.getElementById('portfolio-sort');

  if (!grid) return;

  // Фолбек-дані, якщо не знайдеться projects.json
  const fallbackProjects = [
    {
      title: "Flight Delay Dashboard",
      year: 2024,
      description: "Dashboard for airline ops: delays, reasons, SLAs. Clean UI, fast filtering.",
      stack: ["JavaScript","HTML","CSS"],
      tags: ["frontend","dashboard","data"],
      links: [{label:"Demo", url:"#"}, {label:"Code", url:"#"}]
    },
    {
      title: "Event Landing (Conference)",
      year: 2023,
      description: "Minimalist landing with schedule, speakers, and ticket CTA.",
      stack: ["HTML","CSS"],
      tags: ["landing","marketing","accessibility"],
      links: [{label:"Preview", url:"#"}]
    },
    {
      title: "Image Gallery App",
      year: 2024,
      description: "Search & lightbox with keyboard nav, lazy images, SimpleLightbox.",
      stack: ["JavaScript","HTML","CSS"],
      tags: ["frontend","gallery","ux"],
      links: [{label:"Demo", url:"#"}]
    }
  ];

  let projects = [];
  let activeTags = new Set();

  // завантажуємо json (якщо впаде — беремо фолбек)
  fetch('projects.json')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => { projects = Array.isArray(data) ? data : fallbackProjects; init(); })
    .catch(() => { projects = fallbackProjects; init(); });

  function init(){
    buildTags();
    render();
    bind();
  }

  function uniqueTags(list){
    const set = new Set();
    list.forEach(p => (p.tags||[]).forEach(t => set.add(t)));
    return [...set].sort((a,b)=>a.localeCompare(b));
  }

  function buildTags(){
    const all = uniqueTags(projects);
    tagsEl.innerHTML = '';
    all.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tag';
      b.textContent = t;
      b.setAttribute('aria-pressed','false');
      b.addEventListener('click', () => {
        if (activeTags.has(t)) { activeTags.delete(t); b.classList.remove('active'); b.setAttribute('aria-pressed','false'); }
        else { activeTags.add(t); b.classList.add('active'); b.setAttribute('aria-pressed','true'); }
        render();
      });
      tagsEl.appendChild(b);
    });
  }

  function matchesQuery(p, q){
    if (!q) return true;
    const blob = `${p.title} ${p.description||''} ${(p.stack||[]).join(' ')} ${(p.tags||[]).join(' ')}`.toLowerCase();
    return blob.includes(q.toLowerCase());
  }

  function matchesTags(p){
    if (activeTags.size === 0) return true;
    const ptags = new Set(p.tags || []);
    for (const t of activeTags) if (!ptags.has(t)) return false;
    return true;
  }

  function sortProjects(list, mode){
    const arr = [...list];
    switch(mode){
      case 'old': return arr.sort((a,b)=>(a.year||0)-(b.year||0));
      case 'az' : return arr.sort((a,b)=>a.title.localeCompare(b.title));
      case 'za' : return arr.sort((a,b)=>b.title.localeCompare(a.title));
      case 'new':
      default:   return arr.sort((a,b)=>(b.year||0)-(a.year||0));
    }
  }

  function cardTemplate(p){
    const year = p.year ? `<span class="meta">Year: ${p.year}</span>` : '';
    const stack = (p.stack||[]).map(s=>`<span class="badge">${s}</span>`).join(' ');
    const tags  = (p.tags||[]).map(s=>`<span class="badge">${s}</span>`).join(' ');
    const links = (p.links||[]).map(l=>`<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join(' · ');

    // Якщо додаси зображення: <img src="..." loading="lazy" alt="Preview of ${p.title}">
    return `
      <article class="project reveal-item">
        <h3>${p.title}</h3>
        ${year}
        <p>${p.description || ''}</p>
        <div class="stack">${stack}</div>
        <div class="stack">${tags}</div>
        <div class="links">${links}</div>
      </article>
    `;
  }

  function render(){
    const q = qEl?.value?.trim() || '';
    const mode = sortEl?.value || 'new';
    const filtered = projects.filter(p => matchesQuery(p, q) && matchesTags(p));
    const sorted = sortProjects(filtered, mode);
    grid.innerHTML = sorted.map(cardTemplate).join('') || `<p class="meta">No projects match filters.</p>`;
    // щоб красиво “випливали” додані картки
    grid.closest('.section')?.classList.add('is-visible');
  }

  function bind(){
    let debounce;
    qEl?.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(render, 150);
    });
    sortEl?.addEventListener('change', render);
  }
})();

// ==================== Print button ====================
(function setupPrint(){
  const btn = document.getElementById('btn-print');
  btn?.addEventListener('click', () => window.print());
})();

