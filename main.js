// ---------- ТЕМИ: Pastel / Dark з пам'яттю ----------
(function themeInit(){
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const metaTheme = document.getElementById('meta-theme-color');

  const THEMES = { AUTO:'auto', LIGHT:'light', DARK:'dark' };
  const STORAGE_KEY = 'theme-preference';

  // Прочитати збережену тему
  const saved = localStorage.getItem(STORAGE_KEY); // 'light' | 'dark' | 'auto' | null
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Встановити атрибут теми
  function applyTheme(mode){
    html.setAttribute('data-theme', mode);
    updateToggleLabel(mode);
    updateMetaThemeColor(mode);
  }

  // Оновити текст/іконку кнопки
  function updateToggleLabel(mode){
    const isDark = (mode === THEMES.DARK) || (mode === THEMES.AUTO && systemPrefersDark);
    btn.textContent = isDark ? '🌤 Pastel' : '🌙 Dark';
    btn.setAttribute('aria-pressed', String(isDark));
  }

  function currentMode(){
    return html.getAttribute('data-theme') || THEMES.AUTO;
  }

  // Оновити <meta name="theme-color"> під тему (для мобільних тулбарів)
  function updateMetaThemeColor(mode){
    const effectiveDark = (mode === THEMES.DARK) || (mode === THEMES.AUTO && systemPrefersDark);
    // Підіймаємо з CSS-перемінних
    const styles = getComputedStyle(document.documentElement);
    const headerColor = styles.getPropertyValue('--accent-1').trim() || (effectiveDark ? '#2a2f3a' : '#FADADD');
    if (metaTheme) metaTheme.setAttribute('content', headerColor);
  }

  // Ініціалізація
  applyTheme(saved || THEMES.AUTO);

  // Реагувати на зміну системної теми, якщо режим "auto"
  if (window.matchMedia){
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', () => {
      if (currentMode() === THEMES.AUTO){
        updateToggleLabel(THEMES.AUTO);
        updateMetaThemeColor(THEMES.AUTO);
      }
    });
  }

  // Клік по кнопці: циклічно перемикаємо Light → Dark → Auto → Light...
  btn?.addEventListener('click', () => {
    const mode = currentMode();
    const next = mode === THEMES.LIGHT ? THEMES.DARK
               : mode === THEMES.DARK  ? THEMES.AUTO
               : THEMES.LIGHT;
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  });
})();

// ---------- Плавна навігація по якорях ----------
document.querySelectorAll('a[href^="#"]').forE

// якщо JS працює — знімаємо клас no-js, щоб включились анімації
document.documentElement.classList.remove('no-js');

// Reveal-on-scroll (мінімальний варіант)
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
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealEls.forEach(el => io.observe(el));
})();



