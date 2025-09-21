// Плавна навігація по якорях
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

// Reveal-on-scroll
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

// Підсвічування активного пункту меню
(function highlightActiveNav() {
  const sections = [...document.querySelectorAll('main section[id]')];
  const linkMap = new Map(
    [...document.querySelectorAll('nav a[href^="#"]')].map(a => [a.getAttribute('href').slice(1), a])
  );
  if (!('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = linkMap.get(id);
      if (!link) return;
      if (entry.isIntersecting) {
        linkMap.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: 0.6 });

  sections.forEach(s => io.observe(s));
})();

// Прогрес-бар прокрутки (безкоштовно + продуктивно)
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

  // рік у футері
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
})();


