// Плавний перехід до секцій
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Smooth anchors (якщо ще не зроблено)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', id);
    }
  });
});

// Reveal on scroll
(function setupReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || items.length === 0) {
    // Фолбек: показати все одразу
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // спрацьовує один раз для акуратності
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,         // коли 12% секції видно — вмикаємо
    rootMargin: '0px 0px -8% 0px' // трохи раніше спрацьовує
  });

  items.forEach(el => io.observe(el));
})();

// Active-link підсвітка (необов’язково, але приємно)
(function highlightActiveNav() {
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = new Map(
    [...document.querySelectorAll('nav a[href^="#"]')]
      .map(a => [a.getAttribute('href').slice(1), a])
  );

  if (sections.length === 0) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = links.get(id);
      if (!link) return;
      if (entry.isIntersecting) {
        // зняти активність зі всіх і додати поточній
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: 0.6 });

  sections.forEach(sec => io.observe(sec));
})();

