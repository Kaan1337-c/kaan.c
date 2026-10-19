(() => {
  const sections = [...document.querySelectorAll('main > section[id]')];
  if (!sections.length) return;
  const root = document.documentElement;
  const links = [...document.querySelectorAll('.header nav a')];
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
  const passage = document.createElement('div');
  passage.className = 'chapter-transition';
  passage.setAttribute('aria-hidden', 'true');
  const curtain = document.createElement('div');
  curtain.className = 'chapter-transition__curtain';
  const light = document.createElement('div');
  light.className = 'chapter-transition__light';
  const caption = document.createElement('span');
  caption.className = 'chapter-transition__caption';
  passage.append(curtain, light, caption);
  document.body.append(passage);
  let passageAnimations = [], passageSerial = 0;
  function clearPassage() {
    passageSerial++;
    passageAnimations.forEach(animation => animation.cancel());
    passageAnimations = [];
    passage.classList.remove('is-active');
    sections.forEach(section => section.classList.remove('chapter-entering'));
  }
  function showPassage(index, direction, duration = 850, full = true) {
    clearPassage();
    if (reduced.matches || root.classList.contains('intro-active')) return;
    const serial = passageSerial, section = sections[index];
    passage.dataset.theme = section.id;
    caption.textContent = {home:'Kaan',skills:'Skills & interests',projects:'Projects',contact:'Let’s talk'}[section.id] || '';
    passage.classList.add('is-active');
    section.classList.add('chapter-entering');
    section.style.setProperty('--arrival-duration', duration + 'ms');
    const settings = {duration,easing:'linear'};
    const veilStrength = full ? .94 : .48;
    passageAnimations = [
      curtain.animate([
        {opacity:0,transform:'translateY(' + direction * 95 + '%)'},
        {opacity:veilStrength,transform:'translateY(' + direction * 14 + '%)',offset:.28},
        {opacity:veilStrength * .75,transform:'translateY(' + direction * -12 + '%)',offset:.62},
        {opacity:0,transform:'translateY(' + direction * -95 + '%)'}
      ],settings),
      light.animate([{opacity:0,transform:'translateX(-8%)'},{opacity:full?.8:.45,offset:.4},{opacity:0,transform:'translateX(8%)'}],settings),
      caption.animate([
        {opacity:0,transform:'translateY(' + direction * 16 + 'px)'},
        {opacity:full?.85:.45,transform:'translateY(0)',offset:.32},
        {opacity:full?.85:.45,offset:.55},
        {opacity:0,transform:'translateY(' + direction * -12 + 'px)'}
      ],settings)
    ];
    Promise.allSettled(passageAnimations.map(animation => animation.finished)).then(() => {
      if (serial !== passageSerial) return;
      passage.classList.remove('is-active');
      section.classList.remove('chapter-entering');
    });
  }
  function measure() { bounds = sections.map(section => ({ top: section.offsetTop, height: section.offsetHeight })); }
  function setActive(index, animate = false) {
    const previous = active;
    active = index;
    const section = sections[index];
    section.classList.add('is-visible');
    document.body.dataset.sectionTheme = section.id;
    if (animate && previous !== index) showPassage(index, index > previous ? 1 : -1, 760, false);
    links.forEach(link => {
      const selected = link.hash === '#' + section.id;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        if (!frame) setActive(sections.indexOf(entry.target), true);
      }
    });
  }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    root.classList.remove('is-section-scrolling');
    clearPassage();
    focusTarget = null;
  }
  function nearest() {
    const point = scrollY + innerHeight * .4;
    const found = bounds.findIndex(box => point >= box.top && point < box.top + box.height);
    return found < 0 ? active : found;
  }
  function go(index, keyboard = false, historyMode = 'push') {
    if (index < 0 || index >= sections.length) return;
    const previous = nearest();
    stop();
    const target = sections[index];
    const top = Math.min(bounds[index].top, document.documentElement.scrollHeight - innerHeight);
    const from = scrollY, distance = top - from;
    const duration = reduced.matches ? 0 : Math.min(1350, 940 + Math.abs(distance) * .1);
    const start = performance.now();
    focusTarget = keyboard ? target : null;
    setActive(index);
    if (previous !== index && Math.abs(distance) > 20) showPassage(index, Math.sign(distance), duration, true);
    root.classList.add('is-section-scrolling');
    function settle() {
      frame = 0;
      root.classList.remove('is-section-scrolling');
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
  document.addEventListener('portfolio:ready', () => { measure(); setActive(nearest()); });
  reduced.addEventListener('change', () => { stop(); motionState(); });
  addEventListener('pagehide', stop);
  measure();
  setActive(nearest());
})();
