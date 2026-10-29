(() => {
  const dialog = document.querySelector('.image-dialog');
  const dialogImage = dialog?.querySelector('.dialog-image');
  let lastTrigger;
  document.querySelectorAll('.image-zoom-button').forEach(button => {
    button.addEventListener('click', () => {
      const image = button.querySelector('img');
      if (!dialog || !dialogImage || !image || !dialog.showModal) return;
      dialogImage.src = image.currentSrc || image.src;
      dialogImage.alt = image.alt;
      lastTrigger = button;
      dialog.showModal();
      document.documentElement.classList.add('dialog-open');
      dialog.querySelector('.dialog-close')?.focus();
    });
  });
  dialog?.querySelector('.dialog-close')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog?.addEventListener('close',()=>{
    document.documentElement.classList.remove('dialog-open');
    if (dialogImage) dialogImage.removeAttribute('src');
    lastTrigger?.focus({preventScroll:true});
  });

  document.querySelectorAll('[data-deck]').forEach(viewer => {
    const count = Number(viewer.dataset.count);
    const deck = viewer.dataset.deck;
    const image = viewer.querySelector('.slide-image');
    const input = viewer.querySelector('.slide-page');
    const prev = viewer.querySelector('.slide-prev');
    const next = viewer.querySelector('.slide-next');
    const announce = viewer.querySelector('.slide-announcement');
    let page = 1;
    function goTo(value) {
      page = Math.max(1,Math.min(count,Math.round(Number(value)||1)));
      image.src = `image/${deck}/ppt/${page}.jpg`;
      image.alt = `발표자료 ${page}페이지`;
      input.value = page;
      prev.disabled = page === 1;
      next.disabled = page === count;
      announce.textContent = `${count}페이지 중 ${page}페이지`;
      viewer.querySelector('.slide-image-button').setAttribute('aria-label',`발표자료 ${page}페이지 확대`);
    }
    prev.addEventListener('click',()=>goTo(page-1));
    next.addEventListener('click',()=>goTo(page+1));
    input.addEventListener('change',()=>goTo(input.value));
    viewer.addEventListener('keydown',event=>{
      if (event.target === input) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(page-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); goTo(page+1); }
    });
    let startX;
    let suppressClick = false;
    viewer.querySelector('.slide-image-button').addEventListener('click', event => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    }, true);
    viewer.querySelector('.slide-image-button').addEventListener('touchstart',event=>{ suppressClick=false; startX=event.touches[0]?.clientX; },{passive:true});
    viewer.querySelector('.slide-image-button').addEventListener('touchend',event=>{
      const delta=(event.changedTouches[0]?.clientX??startX)-startX;
      if (Math.abs(delta)>45) { suppressClick = true; goTo(page+(delta<0?1:-1)); }
      startX=undefined;
    },{passive:true});
    goTo(1);
  });

  document.querySelectorAll('[data-gif]').forEach(button=>{
    button.addEventListener('click',()=>{
      const image = button.querySelector('img');
      const label = button.querySelector('.gif-action');
      label.textContent = '시연 불러오는 중…';
      image.onload = ()=> { label.textContent='↻ 처음부터 다시 재생'; };
      image.onerror = ()=> { label.textContent='불러오지 못했습니다 · 다시 시도'; };
      image.src = button.dataset.gif + '?replay=' + Date.now();
      button.setAttribute('aria-label','시연 처음부터 다시 재생');
    });
  });
})();
