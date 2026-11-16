(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle (initial theme is set inline in <head> to avoid a flash)
  const toggle = document.getElementById('theme-toggle');
  const prefersDark = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : prefersDark.matches;
  const updateToggle = () => {
    toggle.textContent = isDark() ? '☀' : '☾';
    toggle.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
  };
  toggle.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    updateToggle();
  });
  prefersDark.addEventListener('change', updateToggle);
  updateToggle();

  // Rotating stack in the hero
  const rotator = document.getElementById('rotator');
  const words = ['Java & Spring Boot', 'Angular & TypeScript', 'Spring AI & pgvector', 'Docker & GitHub Actions'];
  if (!reducedMotion) {
    let i = 0;
    setInterval(() => {
      rotator.classList.add('out');
      setTimeout(() => {
        i = (i + 1) % words.length;
        rotator.textContent = words[i];
        rotator.classList.remove('out');
      }, 350);
    }, 2600);
  }

  // Cursor glow on cards
  document.querySelectorAll('.glow').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // Project filter
  const cards = [...document.querySelectorAll('.project')];
  const filterButtons = [...document.querySelectorAll('#filters button')];
  const status = document.getElementById('filter-status');
  const tagsOf = card => [...card.querySelectorAll('.tags li')];

  const applyFilter = tag => {
    let shown = 0;
    cards.forEach(card => {
      const tags = tagsOf(card);
      const match = tag === 'all' || tags.some(t => t.textContent === tag);
      card.hidden = !match;
      tags.forEach(t => t.classList.toggle('match', t.textContent === tag));
      if (match) shown++;
    });
    filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tag === tag)));

    if (tag === 'all') {
      status.textContent = `${shown} projects`;
    } else {
      status.textContent = `${shown} project${shown === 1 ? '' : 's'} using ${tag}`;
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.textContent = 'Show all';
      reset.addEventListener('click', () => applyFilter('all'));
      status.append(reset);
    }
  };

  filterButtons.forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.tag)));
  document.querySelectorAll('.chips button').forEach(b => {
    b.addEventListener('click', () => {
      applyFilter(b.dataset.tag);
      document.getElementById('projects').scrollIntoView();
    });
  });
  applyFilter('all');

  // Journey tabs
  const tabs = [...document.querySelectorAll('.journey-rail [role="tab"]')];
  const selectTab = tab => {
    tabs.forEach(t => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      const next = tabs[(i + step + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });
  selectTab(tabs[1]);

  // Count-up stats
  const counters = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      counters.unobserve(e.target);
      const el = e.target;
      const end = Number(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / 1200, 1);
        el.textContent = prefix + Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  if (!reducedMotion) document.querySelectorAll('[data-count]').forEach(el => counters.observe(el));

  // Copy email
  const copyBtn = document.getElementById('copy-email');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.email);
      copyBtn.textContent = 'Copied ✓';
    } catch (e) {
      copyBtn.textContent = 'Copy failed';
    }
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
  });

  // Highlight the nav link of the section in view
  const navLinks = new Map(
    [...document.querySelectorAll('.nav-links a')].map(a => [a.getAttribute('href').slice(1), a])
  );
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.removeAttribute('aria-current'));
      navLinks.get(e.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

  // Reveal elements as they scroll into view
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        reveal.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
})();
