(() => {
  const root = document.documentElement;

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
      status.textContent = `Showing all ${shown} projects`;
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

  // Skill chips jump to the projects that use them
  document.querySelectorAll('.chips button').forEach(b => {
    b.addEventListener('click', () => {
      applyFilter(b.dataset.tag);
      document.getElementById('projects').scrollIntoView();
    });
  });

  applyFilter('all');

  // Copy email
  const copyBtn = document.getElementById('copy-email');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.email);
      copyBtn.textContent = 'Copied';
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
