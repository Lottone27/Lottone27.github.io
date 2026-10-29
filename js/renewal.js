(() => {
  // Continuous employment since January 2025; show completed calendar months in Korea.
  function updateCareerDuration() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric'
    }).formatToParts(new Date());
    const year = Number(parts.find(part => part.type === 'year').value);
    const month = Number(parts.find(part => part.type === 'month').value);
    document.querySelectorAll('[data-career-start]').forEach(element => {
      const [startYear, startMonth] = element.dataset.careerStart.split('-').map(Number);
      if (!startYear || startMonth < 1 || startMonth > 12) return;
      const months = Math.max(0, (year - startYear) * 12 + month - startMonth);
      const years = Math.floor(months / 12);
      const remainder = months % 12;
      element.textContent = [years ? years + '년' : '', remainder ? remainder + '개월' : ''].filter(Boolean).join(' ') || '1개월 미만';
    });
  }
  updateCareerDuration();
  window.addEventListener('pageshow', updateCareerDuration);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateCareerDuration();
  });
  // Also refresh when an open tab crosses into a new month.
  setInterval(updateCareerDuration, 60 * 1000);

  let toastTimer;
  const toast = document.getElementById('toast');
  function showToast(message) {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
        } else {
          const field = document.createElement('textarea');
          field.value = value;
          field.style.cssText = 'position:fixed;left:-9999px;top:0;';
          field.setAttribute('readonly','');
          document.body.append(field);
          field.select();
          let copied = false;
          try { copied = document.execCommand('copy'); } finally { field.remove(); button.focus({preventScroll:true}); }
          if (!copied) throw new Error('Copy unavailable');
        }
        showToast('이메일 주소를 복사했습니다.');
      } catch { showToast('복사하지 못했습니다. 이메일 주소를 직접 선택해 주세요.'); }
    });
  });

  const storageKey = 'portfolio-reading-position';
  document.querySelectorAll('a[href^="project-"]').forEach(link => {
    link.addEventListener('click', () => {
      try { sessionStorage.setItem(storageKey, JSON.stringify({y:scrollY,path:location.pathname})); } catch {}
    });
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) return;
    const navigation = performance.getEntriesByType('navigation')[0];
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (saved && (navigation?.type === 'back_forward' || location.hash === '#projects')) {
        // Images have intrinsic dimensions; the window load event makes restoration stable.
        const restore = () => { scrollTo({top:saved.y,behavior:'instant'}); sessionStorage.removeItem(storageKey); };
        if (document.readyState === 'complete') restore(); else window.addEventListener('load',restore,{once:true});
      }
    } catch {}
  });

  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const active = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => active.set(entry.target.id,entry.isIntersecting));
      const id = [...active].find(([,visible])=>visible)?.[0];
      navLinks.forEach(link => {
        if (link.hash === '#'+id) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    },{rootMargin:'-12% 0px -50% 0px',threshold:0});
    navLinks.forEach(link => { const section = document.querySelector(link.hash); if (section) observer.observe(section); });
  }
})();
