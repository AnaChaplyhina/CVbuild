// ==================== Bootstrap ====================
// JS активний → забираємо no-js (секції видно навіть при збоях)
document.documentElement.classList.remove('no-js');


// ==================== ТЕМИ: Pastel / Dark з пам'яттю ====================
(function themeInit(){
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const metaTheme = document.getElementById('meta-theme-color');

  const THEMES = { AUTO:'auto', LIGHT:'light', DARK:'dark' };
  const STORAGE_KEY = 'theme-preference';
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function updateToggleLabel(mode){
    const isDark = (mode === THEMES.DARK) || (mode === THEMES.AUTO && systemPrefersDark);
    if (btn){
      btn.textContent = isDark ? '🌤 Pastel' : '🌙 Dark';
      btn.setAttribute('aria-pressed', String(isDark));
    }
  }
  function updateMetaThemeColor(mode){
    const styles = getComputedStyle(document.documentElement);
    const headerColor = styles.getPropertyValue('--accent-1').trim() || '#FADADD';
    if (metaTheme) metaTheme.setAttribute('content', headerColor);
  }
  function applyTheme(mode){
    html.setAttribute('data-theme', mode);
    updateToggleLabel(mode);
    updateMetaThemeColor(mode);
  }
  function currentMode(){
    return html.getAttribute('data-theme') || THEMES.AUTO;
  }

  // init
  const saved = localStorage.getItem(STORAGE_KEY); // 'light' | 'dark' | 'auto' | null
  applyTheme(saved || THEMES.AUTO);

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

  // toggle: Light → Dark → Auto → Light...
  btn?.addEventListener('click', () => {
    const mode = currentMode();
    const next = mode === THEMES.LIGHT ? THEMES.DARK
               : mode === THEMES.DARK  ? THEMES.AUTO
               : THEMES.LIGHT;
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


// ==================== Active nav + Scroll progress ====================
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
      el.textContent = 'Skriver…';
      log.appendChild(el);
    } else if (!on && el){ el.remove(); }
    log.scrollTop = log.scrollHeight;
  }

  // Knowledge base
  const KB = [
    { t:['uia','ukraine international airlines','kommunikationschef','krise','presse','medie'],
      a:`<strong>Kommunikationschef — Ukraine International Airlines (2017–2022)</strong><br>
         • Officielle statements, interviews, web/SoMe-indhold.<br>
         • Krisehåndtering og kommunikationsstrategi; pressemøder/presseture.<br>
         • Tværfagligt samarbejde for at optimere processer (flight maintenance).` },
    { t:['tui','agency relations','loyalitetsprogram','online'],
      a:`<strong>Agency Relations Manager — TUI (2020)</strong><br>
         • Administration af onlinesystemer, partner-support, loyalitetsprogrammer.<br>
         • Rådgivning/uddannelse og forbedring af onlinesalg.` },
    { t:['social media','kundeservice','support'],
      a:`<strong>Social Media Customer Specialist — UIA (2016–2017)</strong><br>
         • Kommunikation med kunder og løsning af tekniske problemer.` },
    { t:['lampemestern','lager','truck','revision'],
      a:`<strong>Lagerspecialist — Lampemestern A/S (2022–2024)</strong><br>
         • Modtagelse/inspektion, revision, truckkørsel, pakning.` },
    { t:['hotel ringkøbing','servitrice','køkken','fisk'],
      a:`<strong>Servitrice / Køkkenassistent — Hotel Ringkøbing (2022)</strong><br>
         • Gæstebetjening, bar, ordrer; mise en place (fisk).` },
    { t:['gartneri','vikar','blomster'],
      a:`<strong>Gartneriarbejder — Vikar Bureau (2024)</strong><br>
         • Plantning og pakning af blomster.` },
    { t:['uddannelse','education','goit','ucplus','bachelor','kandidat'],
      a:`<strong>Uddannelse</strong><br>
         • Kandidat: Kyiv National Linguistic University (2014–2016).<br>
         • Bachelor: Kyiv National Transport University (2011–2014).<br>
         • Danskuddannelse — UCPLUS (2022–2023).<br>
         • Fullstack — GoIT (2024–2025).` },
    { t:['skills','færdigheder','tech','stack','værktøjer'],
      a:`<strong>Tekniske færdigheder</strong><br>
         • JavaScript, HTML, CSS, Node.js; Git/GitHub.<br>
         • Figma, Canva; Avid Media Composer.<br>
         • AWS, Google Cloud; AI: ChatGPT, CopyAI.` },
    { t:['volunteer','frivilligt','røde kors','humanitær'],
      a:`<strong>Frivilligt arbejde</strong><br>
         • Kommunikationskonsulent (2022–2024) — støtte til ukrainske familier i DK/UA.<br>
         • Røde Kors (2022–2023) — events og oversættelse.` },
    { t:['sprog','languages','danish','english','ukrainian','russian','german'],
      a:`<strong>Sprog</strong><br>
         • Ukrainsk (modersmål), Engelsk (C1), Dansk (B1), Russisk (C2), Tysk (A1).` },
    { t:['kontakt','email','telefon','contact'],
      a:`Kontakt: <a href="mailto:chaplyhina.anastasiia@gmail.com">chaplyhina.anastasiia@gmail.com</a>,
          <a href="tel:+4555279574">+45 55 27 95 74</a>.` },
    { t:['summary','om mig','about','profil','resume'],
      a:`Jeg har 8+ års erfaring i kommunikation/medieproduktion/krisehåndtering
          fra luftfartsbranchen samt praktisk erfaring i service og logistik.
          Nu fokuserer jeg på front-end og brugervenlige løsninger.` },
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
    return bestScore > 0 ? best : null;
  }

  async function answer(q){
    const n = norm(q);
    if (!n) return 'Skriv et spørgsmål om erfaring, færdigheder, uddannelse eller frivilligt arbejde 🙂';
    if (/^(hej|hello|hi|hey)\b/.test(n)){
      return 'Hej! Spørg fx: "Erfaring hos UIA", "Hvilke tekniske færdigheder har du?" eller "Fortæl om frivilligt arbejde".';
    }
    const found = retrieve(q);
    if (found) return found.a;
    return 'Det har jeg ikke helt fanget endnu. Prøv at spørge om erfaring, færdigheder, uddannelse eller frivilligt arbejde.';
  }

  // UI
  function openChat(){
    pane.hidden = false;
    pane.classList.remove('collapsed');
    toggle.setAttribute('aria-expanded','true');
    if (!log.dataset.init){
      say('Hej! Jeg er din CV-bot. Spørg mig om erfaring, færdigheder, uddannelse eller frivilligt arbejde (da/en).');
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

