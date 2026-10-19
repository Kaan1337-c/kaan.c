
(() => {
  const host = document.querySelector('.portfolio-home .bitwall-card .server-art');
  if (!host || host.querySelector('.bitwall-viz')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'bitwall-viz';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  host.classList.add('has-bitwall-viz');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let visible = false;
  let frame = 0;
  let previousTime = 0;
  let elapsed = 0;

  function line(x1, y1, x2, y2, color, thickness = 1) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.stroke();
  }

  function shape(points, fill, stroke) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function text(value, x, y, size = 8, color = '#a8a8a8', align = 'left') {
    ctx.fillStyle = color;
    ctx.font = `500 ${size}px ui-monospace, "Cascadia Code", monospace`;
    ctx.textAlign = align;
    ctx.fillText(value, x, y);
  }

  function screw(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 1.9, 0, Math.PI * 2);
    ctx.fillStyle = '#737373';
    ctx.fill();
    line(x - .9, y + .8, x + .9, y - .8, '#161616', .7);
  }

  function packet(x, y, alpha = 1, rejected = false) {
    ctx.fillStyle = `rgba(225,225,225,${alpha * (rejected ? .64 : .96)})`;
    ctx.fillRect(x - 10, y - 2, 10, 4);
    ctx.fillStyle = `rgba(225,225,225,${alpha * .13})`;
    ctx.fillRect(x - 27, y - 1, 14, 2);
    if (rejected) line(x - 7, y - 2, x - 3, y + 2, '#080808');
  }

  function traffic(t) {
    const input = 24;
    const decision = 168;
    [78, 108, 138].forEach((y, lane) => {
      const accepted = lane === 1;
      line(input, y + .5, decision, y + .5, '#363636');
      ctx.fillStyle = '#151515';
      ctx.fillRect(input - 4, y - 5, 9, 10);
      ctx.strokeStyle = '#656565';
      ctx.strokeRect(input - 3.5, y - 4.5, 8, 9);
      if (accepted) {
        line(decision, y, 197, y, '#a0a0a0');
        for (let i = 0; i < 2; i++) {
          const phase = (t * .22 + i * .5) % 1;
          packet(input + phase * 172, y, Math.min(1, phase * 12));
        }
      } else {
        line(decision + 2, y - 5, decision + 2, y + 5, '#a8a8a8', 2);
        for (let i = 0; i < 2; i++) {
          const phase = (t * (lane ? .25 : .3) + i * .5 + lane * .13) % 1;
          if (phase < .8) {
            packet(input + phase / .8 * (decision - input - 7), y, Math.min(1, phase * 10), true);
          } else {
            const spread = (phase - .8) * 5;
            ctx.fillStyle = `rgba(180,180,180,${(1 - spread) * .7})`;
            for (let j = 0; j < 4; j++) {
              ctx.fillRect(decision - 7 + spread * (j % 2 ? 8 : -9),
                y + (j < 2 ? -1 : 1) * (3 + spread * (j % 2 ? 15 : 8)), 2, 2);
            }
          }
        }
      }
    });
    text('INBOUND', input - 4, 164, 7.5, '#8b8b8b');
    text('DROP', decision + 2, 62, 7, '#b3b3b3', 'center');
  }

  function appliance(t) {
    const x = 192, y = 85, w = 240, h = 61, dx = 19, dy = -17;

    shape([[x, y], [x + dx, y + dy], [x + w + dx, y + dy], [x + w, y]], '#272727', '#6e6e6e');
    shape([[x + w, y], [x + w + dx, y + dy], [x + w + dx, y + h + dy], [x + w, y + h]], '#111', '#4d4d4d');
    for (let i = 0; i < 10; i++) line(x + 128 + i * 8, y - 7, x + 140 + i * 8, y - 17, '#121212', 2);
    const face = ctx.createLinearGradient(0, y, 0, y + h);
    face.addColorStop(0, '#333');
    face.addColorStop(.06, '#1c1c1c');
    face.addColorStop(1, '#111');
    ctx.fillStyle = face;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#7f7f7f';
    ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
    line(x + 1, y + 2, x + w - 1, y + 2, '#ffffff24');
    screw(x + 6, y + 7); screw(x + 6, y + h - 7);
    screw(x + w - 6, y + 7); screw(x + w - 6, y + h - 7);
    text('BW', x + 18, y + 25, 15, '#e4e4e4');
    text('BITWALL', x + 18, y + 39, 6.3, '#a7a7a7');
    line(x + 57, y + 11, x + 57, y + h - 11, '#484848');


    const screenX = x + 68, screenY = y + 10, screenW = 92, screenH = 37;
    ctx.fillStyle = '#070707';
    ctx.fillRect(screenX, screenY, screenW, screenH);
    ctx.strokeStyle = '#494949';
    ctx.strokeRect(screenX + .5, screenY + .5, screenW - 1, screenH - 1);
    text('POLICY ACTIVE', screenX + 6, screenY + 10, 6.2, '#c9c9c9');
    line(screenX + 6, screenY + 25, screenX + screenW - 6, screenY + 25, '#333');
    ctx.beginPath();
    for (let j = 0; j < 80; j++) {
      const pulse = Math.pow(Math.max(0, Math.sin((j - t * 22) * .18)), 12);
      const waveY = screenY + 25 - pulse * 10 + Math.sin(j * .35 - t * 3) * .9;
      if (!j) ctx.moveTo(screenX + 6 + j, waveY);
      else ctx.lineTo(screenX + 6 + j, waveY);
    }
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 1;
    ctx.stroke();


    for (let i = 0; i < 4; i++) {
      const portX = x + 173 + i * 11;
      ctx.fillStyle = '#080808';
      ctx.fillRect(portX, y + 24, 8, 12);
      ctx.strokeStyle = '#777';
      ctx.strokeRect(portX + .5, y + 24.5, 7, 11);
      for (let pin = 0; pin < 3; pin++) line(portX + 2 + pin * 2, y + 25, portX + 2 + pin * 2, y + 28, '#a1a1a1', .7);
      ctx.fillStyle = Math.sin(t * 4 + i * 2) > .3 ? '#dcdcdc' : '#4e4e4e';
      ctx.fillRect(portX + 2, y + 41, 4, 1.5);
    }
    text('POLICY ENGINE', x + 119, 164, 7.5, '#c1c1c1', 'center');
  }

  function origin(t) {
    const x = 489, y = 73, w = 67, h = 77;
    line(451, 109, x - 9, 109, '#666');
    for (let i = 0; i < 2; i++) {
      const phase = (t * .34 + i * .5) % 1;
      packet(452 + phase * 29, 109, Math.sin(phase * Math.PI));
    }
    ctx.fillStyle = '#080808';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#535353';
    ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
    for (let i = 0; i < 3; i++) {
      const unitY = y + 8 + i * 22;
      ctx.fillStyle = '#1b1b1b';
      ctx.fillRect(x + 6, unitY, w - 12, 15);
      ctx.strokeStyle = '#696969';
      ctx.strokeRect(x + 6.5, unitY + .5, w - 13, 14);
      for (let vent = 0; vent < 7; vent++) line(x + 13 + vent * 4, unitY + 5, x + 13 + vent * 4, unitY + 10, '#444');
      ctx.fillStyle = Math.sin(t * 3 + i * 1.7) > 0 ? '#d5d5d5' : '#777';
      ctx.fillRect(x + w - 13, unitY + 7, 2, 2);
    }
    text('ORIGIN', x + w / 2, 164, 7.5, '#8b8b8b', 'center');
  }

  function draw(t) {
    if (!width || !height) return;
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, width, height);
    const viewHeight = 160;
    const scale = Math.min(width / 580, height / viewHeight);
    ctx.save();
    ctx.translate((width - 580 * scale) / 2, (height - viewHeight * scale) / 2 - 14 * scale);
    ctx.scale(scale, scale);
    text('BITWALL / TRAFFIC INSPECTION', 20, 28, 8.1, '#bababa');
    text('DENY BY DEFAULT', 558, 28, 7, '#797979', 'right');
    line(20, 39.5, 558, 39.5, '#2a2a2a');
    traffic(t);
    appliance(t);
    origin(t);
    ctx.restore();
  }

  function loop(now) {
    if (previousTime) elapsed += Math.min((now - previousTime) / 1000, .05);
    previousTime = now;
    draw(elapsed);
    frame = window.requestAnimationFrame(loop);
  }

  function updateAnimation() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    if (visible && !reducedMotion.matches && !window.portfolioMotionPaused && !document.hidden) frame = window.requestAnimationFrame(loop);
    else draw(reducedMotion.matches ? 1.7 : elapsed);
  }

  function resize() {
    const bounds = host.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    const density = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    ctx.setTransform(density, 0, 0, density, 0, 0);
    draw(reducedMotion.matches ? 1.7 : elapsed);
  }

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
  else window.addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateAnimation();
    }, { threshold: .01 }).observe(host);
  } else visible = true;
  document.addEventListener('visibilitychange', updateAnimation);
  document.addEventListener('portfolio:motion', updateAnimation);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', updateAnimation);
  else reducedMotion.addListener(updateAnimation);
  resize();
  updateAnimation();
})();
