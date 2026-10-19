(() => {
  const root = document.documentElement;
  root.classList.add('intro-active');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let screen, button, stage, art, done = false, fading = false;
  let holdTimer, fadeTimer;
  let particleFrame = 0, particleCanvas, particleContext, particles = [], dust = [];
  let animationStart = 0, scatterStart = 0, metrics = null, glyphAtlas = null, glyphMap = new Map(), atlasCell = null;
  const inertElements = [];
  const artSymbols = [...'░▒▓⠿⣿※⌁⌘⋮⊹{}<>/\\+*#%&@$'];
  const titleSymbols = [...'!@#$%&*+=?~^<>|{}[]/\\'];

  function finish() {
    if (done) return;
    done = true;
    clearTimeout(holdTimer);
    clearTimeout(fadeTimer);
    clearTimeout(safetyTimer);
    cancelAnimationFrame(particleFrame);
    const restoreFocus = screen?.contains(document.activeElement);
    root.classList.remove('intro-active');
    inertElements.forEach(([element, previous]) => { element.inert = previous; });
    screen?.remove();
    window.removeEventListener('resize', fit);
    document.removeEventListener('keydown', onKey);
    if (restoreFocus) document.getElementById('main')?.focus({ preventScroll: true });
    document.dispatchEvent(new Event('portfolio:ready'));
  }

  function dismiss(skip = false) {
    if (done || fading) return;
    fading = true;
    clearTimeout(holdTimer);
    screen?.classList.toggle('is-skipping', skip);
    screen?.classList.add('is-fading');
    if (particleCanvas && !skip) {
      scatterStart = performance.now();
      screen.classList.remove('is-assembled');
    }
    fadeTimer = setTimeout(finish, reduced.matches ? 220 : skip ? 370 : 4820);
  }

  function fit() {
    if (done || !art || !screen) return;
    const scale = Math.min(1.2, stage.clientWidth * .68 / art.offsetWidth, stage.clientHeight * .9 / art.offsetHeight);
    stage.style.setProperty('--art-scale', scale);
    if (particleCanvas) sizeParticles();
  }

  function sizeParticles() {
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    particleCanvas.width = Math.round(stage.clientWidth * ratio);
    particleCanvas.height = Math.round(stage.clientHeight * ratio);
    particleContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    const box = art.getBoundingClientRect(), stageBox = stage.getBoundingClientRect();
    const style = getComputedStyle(art), scale = box.width / art.offsetWidth;
    metrics = { width: stage.clientWidth, height: stage.clientHeight, box, stageBox, fontSize: parseFloat(style.fontSize) * scale, lineHeight: parseFloat(style.lineHeight) * scale, fontFamily: style.fontFamily };
    const glyphs = [...new Set([...artSymbols, ...particles.map(p => p.glyph)])];
    const cellWidth = Math.ceil(metrics.fontSize * 2 + 4), cellHeight = Math.ceil(metrics.lineHeight + 5);
    atlasCell = {width:cellWidth,height:cellHeight};
    glyphAtlas = document.createElement('canvas');
    glyphAtlas.width = cellWidth * 2 * glyphs.length;glyphAtlas.height = cellHeight * 4;
    const ink = glyphAtlas.getContext('2d');ink.scale(2,2);ink.font = metrics.fontSize + 'px ' + metrics.fontFamily;ink.textBaseline='top';
    glyphMap = new Map(glyphs.map((glyph,index) => [glyph,index]));
    ['#d2cccc','#b94b5b'].forEach((color,row) => {ink.fillStyle=color;glyphs.forEach((glyph,index)=>ink.fillText(glyph,index*cellWidth+1,row*cellHeight));});
  }

  function animateArt() {
    if (done || reduced.matches) return;
    particleCanvas = document.createElement('canvas');
    particleCanvas.className = 'opening-particles';
    particleCanvas.setAttribute('aria-hidden', 'true');
    particleContext = particleCanvas.getContext('2d');
    if (!particleContext) { particleCanvas = null; return; }
    stage.prepend(particleCanvas);
    const lines = art.textContent.replace(/\r/g, '').split('\n');
    const columns = Math.max(...lines.map(line => [...line].length));
    let seed = 47;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    lines.forEach((line, row) => [...line].forEach((glyph, column) => {
      if (glyph === '\u2800' || /\s/.test(glyph)) return;
      particles.push({ glyph, row, column, x: random(), y: random(), delay: random() * 900, arc: (random() - .5) * 110, digit: Math.floor(random() * artSymbols.length) });
    }));
    dust = Array.from({ length: 46 }, () => ({ x: random(), y: random(), size: random() * 1.3 + .6, speed: random() * 7 + 3, phase: random() * Math.PI * 2 }));
    sizeParticles();
    screen.classList.add('has-particles');
    animationStart = performance.now();
    const title = screen.querySelector('.opening-title');
    title.setAttribute('aria-label', 'C KAAN');
    const titleText = [...'C KAAN'];
    const titleGlyphs = titleText.map(() => {
      const glyph = document.createElement('span');
      glyph.className = 'opening-title-glyph';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = titleSymbols[Math.floor(Math.random() * titleSymbols.length)];
      return glyph;
    });
    title.replaceChildren(...titleGlyphs);
    const titleDrift = [[-110,-55],[-24,-85],[85,-68],[-65,55],[60,80],[135,30]];
    function paint(now) {
      if (done) return;
      particleFrame = requestAnimationFrame(paint);
      if (document.hidden) return;
      const elapsed = now - animationStart;
      const lockedLetters = Math.min(5, Math.max(0, Math.floor((elapsed - 500) / 750)));
      title.dataset.phase = scatterStart ? 'scattering' : lockedLetters === 5 ? 'resolved' : 'scrambling';
      title.classList.toggle('is-resolved', lockedLetters === 5 && !scatterStart);
      titleGlyphs.forEach((glyph, index) => {
        const rank = index > 1 ? index - 1 : 0;
        const resolved = index === 1 ? lockedLetters > 0 : rank < lockedLetters;
        const progress = scatterStart ? Math.min(1, Math.max(0, (now - scatterStart - index * 130) / 3800)) : 0;
        const spread = progress * progress * (3 - 2 * progress);
        glyph.textContent = resolved && progress < .055 ? titleText[index] : titleSymbols[Math.floor(Math.random() * titleSymbols.length)];
        glyph.style.transform = `translate(${titleDrift[index][0] * spread}px,${titleDrift[index][1] * spread}px) rotate(${(index % 2 ? 1 : -1) * spread * 32}deg)`;
        glyph.style.opacity = 1 - spread * .9;
      });
      title.dataset.glitch = titleGlyphs.map(glyph => glyph.textContent).join('');
      const ctx = particleContext, { width, height, box, stageBox, fontSize, lineHeight, fontFamily } = metrics;
      const seconds = (now - animationStart) / 1000;
      ctx.clearRect(0, 0, width, height);
      dust.forEach((p, index) => {
        const x = (p.x * width + Math.sin(seconds * .4 + p.phase) * 12 + width) % width;
        const y = (p.y * height - seconds * p.speed + height * 10) % height;
        ctx.fillStyle = `rgba(164,54,66,${.15 + (Math.sin(seconds + p.phase) + 1) * .12})`;
        ctx.font = `${Math.max(8, width * .012)}px Consolas,monospace`;
        ctx.fillText(String((index * 7 + Math.floor(seconds * 2)) % 10), x, y);
        if (index % 7 === 0) { ctx.fillRect(x - 3, y, 7, .6); ctx.fillRect(x, y - 3, .6, 7); }
      });
      if (!scatterStart && elapsed >= 4500) screen.classList.add('is-assembled');
      drawVeins(ctx, width, height, seconds, box, stageBox);
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#c9c9c9';
      particles.forEach(p => {
        const progress = Math.max(0, Math.min(1, (elapsed - p.delay) / 3600));
        const gather = progress * progress * (3 - 2 * progress);
        const scatterProgress = scatterStart ? Math.min(1, Math.max(0, (now - scatterStart - 100) / 4500)) : 0;
        const disperse = scatterProgress * scatterProgress * (3 - 2 * scatterProgress);
        const blend = gather * (1 - disperse);
        const targetX = box.left - stageBox.left + p.column * box.width / columns;
        const targetY = box.top - stageBox.top + p.row * lineHeight;
        const originX = p.x * width, originY = p.y * height;
        ctx.globalAlpha = Math.min(1, progress * 4) * (1 - disperse * .6);
        const symbolPhase = progress < .88 || disperse > .035;
        const glyph = symbolPhase ? artSymbols[(p.digit + Math.floor(seconds * 14)) % artSymbols.length] : p.glyph;
        const color = symbolPhase && p.digit % 7 === 0 ? 1 : 0;
        ctx.drawImage(glyphAtlas,glyphMap.get(glyph)*atlasCell.width*2,color*atlasCell.height*2,atlasCell.width*2,atlasCell.height*2,
          originX + (targetX-originX)*blend + Math.sin(blend*Math.PI)*p.arc-1,originY+(targetY-originY)*blend,atlasCell.width,atlasCell.height);
      });
      ctx.globalAlpha = 1;
    }
    particleFrame = requestAnimationFrame(paint);
  }

  function drawVeins(ctx, width, height, seconds, box, stageBox) {
    const bloom = Math.min(1, seconds / 1.8);
    const pulse = .67 + Math.sin(seconds * 1.5) * .12;
    const left = box.left - stageBox.left, right = box.right - stageBox.left;
    const centerY = height * .51;
    ctx.lineCap = 'round';
    [-1, 1].forEach(side => {
      const edge = side < 0 ? left : right;
      const roseX = side < 0 ? width * .095 : width * .905;
      const roseY = height * (side < 0 ? .29 : .72);
      const endX = edge + side * -12;
      const endY = centerY + side * height * .075;
      const c1x = roseX - side * width * .12, c1y = roseY + height * .23;
      const c2x = edge + side * width * .17, c2y = endY - height * .22;
      const point = t => {
        const a = 1 - t;
        return {x:a*a*a*roseX+3*a*a*t*c1x+3*a*t*t*c2x+t*t*t*endX,
          y:a*a*a*roseY+3*a*a*t*c1y+3*a*t*t*c2y+t*t*t*endY};
      };
      ctx.globalAlpha = bloom * pulse;
      ctx.strokeStyle = '#6e202e';ctx.lineWidth = 1.35;
      ctx.beginPath();ctx.moveTo(roseX, roseY);ctx.bezierCurveTo(c1x,c1y,c2x,c2y,endX,endY);ctx.stroke();
      for (let branch = 1; branch <= 4; branch++) {
        const p = point(branch / 5), direction = branch % 2 ? 1 : -1;
        ctx.lineWidth = .7;ctx.strokeStyle = '#6c2430';
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.bezierCurveTo(p.x+side*width*.04,p.y+direction*height*.03,p.x+side*width*.07,p.y+direction*height*.085,p.x+side*width*.045,p.y+direction*height*.12);ctx.stroke();
      }
      ctx.font = `${Math.max(7, width * .0105)}px Consolas,monospace`;ctx.textBaseline = 'middle';
      for (let i = 0; i < 20; i++) {
        const t = (i / 20 + seconds * .035) % 1, p = point(t);
        ctx.fillStyle = i % 4 ? '#923746' : '#e47a86';
        ctx.fillText(String((i * 3 + Math.floor(seconds * 3)) % 10),p.x,p.y);
      }
      drawRose(ctx, roseX, roseY, width * .053, seconds + side);
    });
    ctx.globalAlpha = 1;
  }

  function drawRose(ctx, x, y, radius, time) {
    ctx.save();ctx.translate(x, y);ctx.rotate(Math.sin(time * .3) * .045);
    ctx.fillStyle = '#17070c';ctx.strokeStyle = '#963446';ctx.lineWidth = .9;

    for (let ring = 0; ring < 3; ring++) {
      const count = 5 + ring, r = radius * (1 - ring * .24);
      for (let petal = 0; petal < count; petal++) {
        ctx.save();ctx.rotate(petal / count * Math.PI * 2 + ring * .6);
        ctx.beginPath();ctx.moveTo(-r*.3,r*.14);
        ctx.bezierCurveTo(-r*1.15,-r*.24,-r*.8,-r*1.06,0,-r*.8);
        ctx.bezierCurveTo(r*.85,-r*1.16,r*1.03,-r*.1,r*.15,r*.29);
        ctx.quadraticCurveTo(r*.03,-r*.32,-r*.3,r*.14);ctx.fill();ctx.stroke();ctx.restore();
      }
    }
    ctx.strokeStyle = '#c35b6a';ctx.beginPath();
    for (let i = 0; i < 55; i++) { const angle=i*.18,r=radius*.2*(1-i/60);ctx.lineTo(Math.cos(angle)*r,Math.sin(angle)*r); }
    ctx.stroke();ctx.restore();
  }

  function onKey(event) {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      dismiss(true);
    }
  }


  const safetyTimer = setTimeout(finish, 22000);
  document.addEventListener('DOMContentLoaded', () => {
    if (done) { document.getElementById('opening-screen')?.remove(); return; }
    screen = document.getElementById('opening-screen');
    if (!screen) { finish(); return; }
    button = screen.querySelector('.opening-enter');
    stage = screen.querySelector('.opening-art-stage');
    art = screen.querySelector('.opening-art');
    document.querySelectorAll('body > header, body > main, body > footer, body > .skip').forEach(element => {
      inertElements.push([element, element.inert]);
      element.inert = true;
    });
    fit();
    animateArt();
    document.fonts.ready.then(fit);
    window.addEventListener('resize', fit);
    button.addEventListener('click', () => dismiss(true));
    document.addEventListener('keydown', onKey);
    button.focus({ preventScroll: true });
    holdTimer = setTimeout(() => dismiss(), reduced.matches ? 250 : 5800);
  }, { once: true });
  window.addEventListener('pagehide', finish, { once: true });
})();
