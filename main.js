(() => {
  const sections = [...document.querySelectorAll('main > section[id]')];
  if (!sections.length) return;
  const root = document.documentElement;
  const links = [...document.querySelectorAll('.header nav a')];
  const nav = document.querySelector('.header nav');
  const indicator = document.createElement('span');
  indicator.className = 'nav-current';
  indicator.setAttribute('aria-hidden', 'true');
  nav?.prepend(indicator);
  function positionNav() {
    const selected = links.find(link => link.getAttribute('aria-current') === 'location');
    if (!selected || !nav) return;
    indicator.style.setProperty('--nav-x', selected.offsetLeft + 'px');
    indicator.style.setProperty('--nav-y', selected.offsetTop + 'px');
    indicator.style.setProperty('--nav-width', selected.offsetWidth + 'px');
    indicator.style.setProperty('--nav-height', selected.offsetHeight + 'px');
    indicator.style.opacity = '1';
    if (!indicator.classList.contains('is-ready')) requestAnimationFrame(() => indicator.classList.add('is-ready'));
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1024px) and (pointer: fine)');
  let bounds = [], active = 0, frame = 0, wheelTime = 0, wheelAmount = 0, consumed = false;
  let unlockAt = 0, focusTarget = null;
  document.body.classList.add('js-enhanced');
  function motionState() {
    window.portfolioMotionPaused = reduced.matches;
    root.dataset.motion = reduced.matches ? 'paused' : 'playing';
    document.dispatchEvent(new Event('portfolio:motion'));
  }
  motionState();
  let lightTimer = 0;
  const profile = document.getElementById('skills');
  if (profile) {
    profile.dataset.bioState = reduced.matches ? 'visible' : 'pending';
    profile.querySelectorAll('.capability-list li').forEach((item,index) => item.style.setProperty('--item-delay', (.4 + index * .075) + 's'));
    profile.querySelectorAll('.exploration-list li').forEach((item,index) => item.style.setProperty('--item-delay', (.52 + index * .09) + 's'));
  }
  const contact = document.getElementById('contact');
  if (contact) {
    contact.dataset.entryState = reduced.matches ? 'visible' : 'pending';
    contact.querySelectorAll('.screen-inner > *').forEach((element,index) => element.style.setProperty('--contact-delay', (.1 + index * .13) + 's'));
  }
  const projects = document.getElementById('projects');
  const projectCards = ['.bitwall-card','.c-lock-card','.scientra-card'].map(selector => projects?.querySelector(selector)).filter(Boolean);
  const cardVisibility = new Map();
  projectCards.forEach((card,index) => {
    card.dataset.revealState = reduced.matches ? 'visible' : 'pending';
    card.style.setProperty('--card-delay', (.12 + index * .16) + 's');
  });
  const cardObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    cardVisibility.set(entry.target, entry.isIntersecting);
    if (entry.isIntersecting && (projects?.classList.contains('is-lit') || reduced.matches)) entry.target.dataset.revealState = 'visible';
  }), {threshold:.08});
  projectCards.forEach(card => cardObserver.observe(card));
  sections.forEach(section => {
    const lighting = document.createElement('div');
    lighting.className = 'scene-lighting';
    lighting.setAttribute('aria-hidden', 'true');
    ['ambient','beam','reflection'].forEach(type => {
      const layer = document.createElement('span');
      layer.className = 'scene-lighting__' + type;
      lighting.append(layer);
    });
    section.append(lighting);
  });
  function illuminate(index) {
    clearTimeout(lightTimer);
    if (root.classList.contains('intro-active')) return;
    sections.forEach((section, current) => section.classList.toggle('is-lit', current === index));
    if (profile) profile.dataset.bioState = sections[index] === profile || reduced.matches ? 'visible' : 'pending';
    if (contact) contact.dataset.entryState = sections[index] === contact || reduced.matches ? 'visible' : 'pending';
    projectCards.forEach(card => {
      if (reduced.matches || sections[index] === projects && cardVisibility.get(card)) card.dataset.revealState = 'visible';
      else if (sections[index] !== projects) card.dataset.revealState = 'pending';
    });
  }
  function queueLighting(index) {
    clearTimeout(lightTimer);
    lightTimer = setTimeout(() => { if (!frame && nearest() === index) illuminate(index); }, 480);
  }
  function measure() { bounds = sections.map(section => ({ top: section.offsetTop, height: section.offsetHeight })); positionNav(); }
  function setActive(index) {
    active = index;
    const section = sections[index];
    section.classList.add('is-visible');
    document.body.dataset.sectionTheme = section.id;
    links.forEach(link => {
      const selected = link.hash === '#' + section.id;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    positionNav();
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        if (!frame) { const index = sections.indexOf(entry.target); setActive(index); queueLighting(index); }
      }
    });
  }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    root.classList.remove('is-section-scrolling');
    clearTimeout(lightTimer);
    focusTarget = null;
    queueLighting(nearest());
  }
  function nearest() {
    const point = scrollY + innerHeight * .4;
    const found = bounds.findIndex(box => point >= box.top && point < box.top + box.height);
    return found < 0 ? active : found;
  }
  function go(index, keyboard = false, historyMode = 'push') {
    if (index < 0 || index >= sections.length) return;
    stop();
    clearTimeout(lightTimer);
    const target = sections[index];
    const top = Math.min(bounds[index].top, document.documentElement.scrollHeight - innerHeight);
    const from = scrollY, distance = top - from;
    const duration = reduced.matches ? 0 : Math.min(1350, 940 + Math.abs(distance) * .1);
    const start = performance.now();
    focusTarget = keyboard ? target : null;
    setActive(index);
    root.classList.add('is-section-scrolling');
    function settle() {
      frame = 0;
      root.classList.remove('is-section-scrolling');
      illuminate(index);
      unlockAt = performance.now() + 100;
      if (historyMode !== 'none' && location.hash !== '#' + target.id) history[historyMode === 'replace' ? 'replaceState' : 'pushState'](null, '', '#' + target.id);
      if (focusTarget) {
        focusTarget.setAttribute('tabindex', '-1');
        focusTarget.focus({ preventScroll: true });
        focusTarget = null;
      }
    }
    if (!duration || Math.abs(distance) < 2) { scrollTo(0, top); settle(); return; }
    function travel(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      scrollTo(0, from + distance * eased);
      if (progress < 1) frame = requestAnimationFrame(travel);
      else settle();
    }
    frame = requestAnimationFrame(travel);
  }
  function atEdge(index, direction) {
    const box = bounds[index];
    return direction > 0 ? scrollY + innerHeight >= box.top + box.height - 4 : scrollY <= box.top + 4;
  }
  function nestedScroll(target, direction) {
    for (let node = target instanceof Element ? target : null; node && node !== document.body; node = node.parentElement) {
      if (node.scrollHeight > node.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(node).overflowY)) {
        if (direction > 0 ? node.scrollTop + node.clientHeight < node.scrollHeight - 2 : node.scrollTop > 2) return true;
      }
    }
    return false;
  }
  addEventListener('wheel', event => {
    if (!desktop.matches || reduced.matches || root.classList.contains('intro-active') || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const now = performance.now(), gap = now - wheelTime;
    wheelTime = now;
    if (frame || now < unlockAt || (consumed && gap < 190)) { event.preventDefault(); return; }
    if (gap >= 190) { consumed = false; wheelAmount = 0; }
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    const direction = Math.sign(delta), index = nearest();
    if (!direction || nestedScroll(event.target, direction) || !atEdge(index, direction)) return;
    const next = index + direction;
    if (next < 0 || next >= sections.length) return;
    event.preventDefault();
    if (Math.sign(wheelAmount) !== direction) wheelAmount = 0;
    wheelAmount += delta;
    if (Math.abs(wheelAmount) >= 34) { consumed = true; wheelAmount = 0; go(next, false, 'replace'); }
  }, { passive: false });
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const link = event.target.closest('a[href^="#"]');
    const index = link ? sections.findIndex(section => '#' + section.id === link.hash) : -1;
    if (index < 0) return;
    event.preventDefault();
    measure();
    go(index, event.detail === 0);
  });
  addEventListener('keydown', event => {
    if (event.key === 'Escape') { stop(); return; }
    if (event.defaultPrevented || root.classList.contains('intro-active') || !desktop.matches || reduced.matches || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target.closest('input,textarea,select,button,a,[contenteditable="true"]')) return;
    const direction = ['ArrowDown', 'PageDown', ' '].includes(event.key) ? (event.shiftKey ? -1 : 1) : ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
    const index = nearest();
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); go(event.key === 'Home' ? 0 : sections.length - 1, true); }
    else if (direction && atEdge(index, direction) && index + direction >= 0 && index + direction < sections.length) {
      event.preventDefault();
      if (!frame) go(index + direction, true);
    }
  });
  addEventListener('touchstart', stop, { passive: true });
  addEventListener('pointerdown', stop, { passive: true });
  addEventListener('popstate', () => {
    measure();
    const index = sections.findIndex(section => '#' + section.id === location.hash);
    go(index < 0 ? 0 : index, false, 'none');
  });
  addEventListener('resize', () => { stop(); measure(); }, { passive: true });
  new ResizeObserver(measure).observe(document.querySelector('main'));
  document.fonts.ready.then(measure);
  document.addEventListener('portfolio:ready', () => { measure(); setActive(nearest()); illuminate(nearest()); });
  addEventListener('scrollend', () => { if (!frame) illuminate(nearest()); }, {passive:true});
  reduced.addEventListener('change', () => { stop(); motionState(); illuminate(nearest()); });
  addEventListener('pagehide', stop);
  measure();
  setActive(nearest());
  queueLighting(nearest());
})();
