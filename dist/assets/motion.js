(() => {
  'use strict';

  const motion = window.matchMedia('(prefers-reduced-motion: no-preference) and (min-width: 581px) and (min-height: 581px)');
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  const root = document.documentElement;
  let active;

  function decoration(parent, tag, className, signal) {
    const element = document.createElement(tag);
    element.className = className;
    element.setAttribute('aria-hidden', 'true');
    parent.append(element);
    signal.addEventListener('abort', () => element.remove(), { once: true });
    return element;
  }

  // Two depths of snow use the same wind. Stop drawing off screen and in background tabs.
  function snowfall(parent, count, near, signal) {
    const canvas = decoration(parent, 'canvas', 'camera-snow', signal);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = 0, height = 0, previous = 0, frame = 0, visible = true;
    const flakes = Array.from({ length: count }, (_, index) => {
      const close = index < near;
      return {
        x: Math.random(), y: Math.random(), phase: Math.random() * Math.PI * 2,
        radius: close ? 4 + Math.random() * 7 : .5 + Math.random() * 2.1,
        speed: close ? 1.4 + Math.random() : .25 + Math.random() * .9,
        alpha: close ? .07 + Math.random() * .08 : 0
      };
    });

    function resize() {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    }
    function draw(time) {
      frame = requestAnimationFrame(draw);
      if (!width || !height || time - previous < 1000 / 30) return;
      const step = previous ? Math.min((time - previous) / (1000 / 60), 4) : 1;
      previous = time;
      const gust = .5 + Math.sin(time / 5200) * .45 + Math.sin(time / 1700) * .15;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#e4edf1';
      for (const flake of flakes) {
        flake.phase += .012 * step;
        flake.x += (Math.sin(flake.phase) * .45 + gust * (.4 + flake.radius / 4)) * step / width;
        flake.y += flake.speed * (.6 + flake.radius / 2.6) * .8 * step / height;
        if (flake.y > 1 + 12 / height) { flake.y = -12 / height; flake.x = Math.random(); }
        if (flake.x > 1 + 12 / width) flake.x = -12 / width;
        if (flake.x < -12 / width) flake.x = 1 + 12 / width;
        ctx.globalAlpha = flake.alpha || .18 + flake.radius / 3.6;
        ctx.beginPath();
        ctx.arc(flake.x * width, flake.y * height, flake.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    function stop() {
      cancelAnimationFrame(frame);
      frame = previous = 0;
    }
    function update() {
      if (document.hidden || !visible || signal.aborted) stop();
      else if (!frame) frame = requestAnimationFrame(draw);
    }
    resize();
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      signal.addEventListener('abort', () => observer.disconnect(), { once: true });
    } else {
      window.addEventListener('resize', resize, { signal });
    }
    if (parent === hero && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
      observer.observe(parent);
      signal.addEventListener('abort', () => observer.disconnect(), { once: true });
    }
    document.addEventListener('visibilitychange', update, { signal });
    signal.addEventListener('abort', stop, { once: true });
    update();
  }

  function polaroid(signal) {
    const photo = hero.querySelector('.photo-window');
    const shutter = document.createElement('button');
    shutter.type = 'button';
    shutter.className = 'photo-shutter';
    shutter.setAttribute('aria-label', 'Ontwikkel de instantfoto opnieuw');
    photo.append(shutter);
    function develop() {
      photo.classList.remove('is-developing');
      void photo.offsetWidth;
      photo.classList.add('is-developing');
    }
    shutter.addEventListener('click', develop, { signal });
    photo.addEventListener('animationend', event => {
      if (event.animationName === 'print-develop') photo.classList.remove('is-developing');
    }, { signal });
    signal.addEventListener('abort', () => { shutter.remove(); photo.classList.remove('is-developing'); }, { once: true });
  }

  function exposeCards(signal) {
    if (!('IntersectionObserver' in window)) return;
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-exposed');
        observer.unobserve(entry.target);
      }
    }, { threshold: .25 });
    cards.forEach(card => observer.observe(card));
    signal.addEventListener('abort', () => {
      observer.disconnect();
      cards.forEach(card => card.classList.remove('is-exposed'));
    }, { once: true });
  }

  function pointerEffects(signal) {
    const ring = decoration(document.body, 'span', 'finder-ring', signal);
    let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0;
    function follow() {
      x += (targetX - x) * .18;
      y += (targetY - y) * .18;
      ring.style.transform = `translate(${x}px,${y}px)`;
      if (Math.abs(x - targetX) + Math.abs(y - targetY) > .25) frame = requestAnimationFrame(follow);
      else frame = 0;
    }
    function hide() {
      cancelAnimationFrame(frame);
      frame = 0;
      ring.classList.remove('is-visible');
    }
    document.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || document.querySelector('dialog[open]')) { hide(); return; }
      targetX = event.clientX;
      targetY = event.clientY;
      if (!ring.classList.contains('is-visible')) { x = targetX; y = targetY; ring.classList.add('is-visible'); }
      ring.classList.toggle('on-control', !!event.target.closest('a,button,summary,[role="button"]'));
      if (!frame) follow();
    }, { passive: true, signal });
    document.documentElement.addEventListener('pointerleave', hide, { signal });
    window.addEventListener('blur', hide, { signal });
    signal.addEventListener('abort', hide, { once: true });

    function track(element, properties, values) {
      function clear() { properties.forEach(key => element.style.removeProperty(key)); }
      element.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const box = element.getBoundingClientRect();
        if (!box.width || !box.height) return;
        const result = values((event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height);
        properties.forEach((key, index) => element.style.setProperty(key, result[index]));
      }, { passive: true, signal });
      element.addEventListener('pointerleave', clear, { signal });
      signal.addEventListener('abort', clear, { once: true });
    }
    if (hero) {
      track(hero, ['--camera-x', '--camera-y', '--camera-overscan'], (x, y) => {
        const dx = 2 * x - 1, dy = 2 * y - 1;
        return [dx, dy, 1 + .06 * Math.max(Math.abs(dx), Math.abs(dy))];
      });
    }
    document.querySelectorAll('.card-link').forEach(card => {
      track(card, ['--card-rx', '--card-ry', '--card-x', '--card-y', '--card-glare'],
        (x, y) => [`${(.5 - y) * 6}deg`, `${(x - .5) * 7}deg`, `${x * 100}%`, `${y * 100}%`, 1]);
    });
  }

  // Match covers across real document navigations, including the browser's Back button.
  function pageTransitions(signal) {
    const cover = document.querySelector('.case-cover img');
    const links = Array.from(document.querySelectorAll('.card-link'));
    const pagePath = url => new URL(url, location.href).pathname.replace(/\.html$|\/$/g, '');
    function prepare(transition, other, leaving) {
      if (!transition || !other) return;
      const otherPath = pagePath(other);
      const listing = ['', '/index', '/myprojects'].includes(otherPath);
      const match = links.find(link => pagePath(link.href) === otherPath);
      const image = cover && listing ? cover : match?.querySelector('.card-photo img');
      if (!image) return;
      image.style.viewTransitionName = 'project-cover';
      const backwards = leaving ? !!cover : !!match;
      root.classList.toggle('camera-back', backwards);
      function clear() {
        image.style.removeProperty('view-transition-name');
        root.classList.remove('camera-back');
      }
      // The outgoing document may be frozen in the back-forward cache before the transition finishes.
      (leaving ? transition.ready : transition.finished).then(clear, clear);
    }
    window.addEventListener('pageswap', event => {
      prepare(event.viewTransition, event.activation?.entry?.url, true);
    }, { signal });
    window.addEventListener('pagereveal', event => {
      prepare(event.viewTransition, window.navigation?.activation?.from?.url, false);
    }, { signal });
  }

  function sync() {
    active?.abort();
    if (!motion.matches) return;
    active = new AbortController();
    const { signal } = active;
    if (hero) {
      decoration(hero, 'span', 'camera-mist', signal);
      snowfall(hero, 130, 9, signal);
      polaroid(signal);
    }
    snowfall(document.body, 34, 5, signal);
    exposeCards(signal);
    pageTransitions(signal);
    let pointer;
    function syncPointer() {
      pointer?.abort();
      if (mouse.matches) { pointer = new AbortController(); pointerEffects(pointer.signal); }
    }
    mouse.addEventListener('change', syncPointer, { signal });
    signal.addEventListener('abort', () => pointer?.abort(), { once: true });
    syncPointer();
  }
  if (hero && motion.matches && !location.hash && performance.getEntriesByType('navigation')[0]?.type !== 'back_forward') {
    root.classList.add('camera-intro');
    window.setTimeout(() => root.classList.remove('camera-intro'), 3200);
  }
  motion.addEventListener('change', sync);
  sync();
})();
