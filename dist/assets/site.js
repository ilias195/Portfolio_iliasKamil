'use strict';

const root = document.documentElement;
const dialog = document.querySelector('#sfeerkeuze');
const menu = document.querySelector('.menu-trigger');
const navigation = document.querySelector('#navigatie');
const lampScenes = document.querySelectorAll('[data-lamp-scene]');
const lampButtons = document.querySelectorAll('[data-lamp-control]');
let sceneOpener;

function closeMenu() {
  navigation.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Menu openen');
}

function openStyles(opener) {
  sceneOpener = opener;
  closeMenu();
  if (dialog.open) return;
  dialog.showModal();
  document.body.classList.add('modal-open');
  dialog.querySelector('[data-lamp-control]').focus({ preventScroll: true });
}

menu.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
});
navigation.addEventListener('click', closeMenu);
document.addEventListener('click', event => {
  if (!event.target.closest('.mast') && navigation.classList.contains('open')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menu.focus(); }
});
window.matchMedia('(min-width: 781px)').addEventListener('change', closeMenu);

document.querySelectorAll('[data-scene-open]').forEach(opener => {
  opener.addEventListener('click', () => openStyles(opener));
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (sceneOpener?.isConnected) sceneOpener.focus({ preventScroll: true });
});
dialog.addEventListener('click', event => {
  if (event.target === dialog || event.target.closest('[data-scene-close], [data-view-lamp]')) dialog.close();
});

function setLamp(on) {
  lampScenes.forEach(scene => scene.classList.toggle('lamp-on', on));
  lampButtons.forEach(button => {
    button.hidden = false;
    button.setAttribute('aria-pressed', String(on));
    button.querySelector('[data-lamp-state]').textContent = on ? 'Aan' : 'Uit';
  });
}

function restoreLamp() {
  let on = lampButtons[0].getAttribute('aria-pressed') === 'true';
  try { on = sessionStorage.getItem('ik-veldlamp') !== 'uit'; } catch { /* Keep the current setting when storage is unavailable. */ }
  setLamp(on);
}
restoreLamp();
lampButtons.forEach(button => button.addEventListener('click', () => {
  const on = button.getAttribute('aria-pressed') !== 'true';
  setLamp(on);
  try { sessionStorage.setItem('ik-veldlamp', on ? 'aan' : 'uit'); } catch { /* The current page still reflects the choice. */ }
}));

const movableLamp = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
lampScenes.forEach(scene => {
  scene.addEventListener('pointermove', event => {
    if (!movableLamp.matches || event.pointerType !== 'mouse' || !scene.classList.contains('lamp-on')) return;
    const bounds = scene.getBoundingClientRect();
    scene.style.setProperty('--lamp-x', (event.clientX - bounds.left) / bounds.width * 100 + '%');
    scene.style.setProperty('--lamp-y', (event.clientY - bounds.top) / bounds.height * 100 + '%');
  });
  scene.addEventListener('pointerleave', () => {
    scene.style.removeProperty('--lamp-x');
    scene.style.removeProperty('--lamp-y');
  });
});

// Older bookmarks open the finished style and preserve the destination and live view.
const previewUrl = new URL(location.href);
const showStyles = previewUrl.searchParams.get('vergelijk') === '1' || previewUrl.searchParams.get('kleuren') === '1';
const retiredOptions = ['sfeer', 'palet', 'metro', 'kleuren', 'vergelijk'];
if (retiredOptions.some(key => previewUrl.searchParams.has(key))) {
  retiredOptions.forEach(key => previewUrl.searchParams.delete(key));
  history.replaceState(null, '', previewUrl);
}
if (showStyles) openStyles(document.querySelector('.scene-trigger'));

const meter = document.querySelector('.power');
const batteryValue = meter.querySelector('.power-value');
const cells = Array.from(meter.querySelectorAll('.battery i'));
let lastBattery = -1;
let frameRequested = false;
function drawBattery() {
  frameRequested = false;
  const range = root.scrollHeight - window.innerHeight;
  const fraction = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
  const percent = Math.round((1 - fraction) * 100);
  if (percent === lastBattery) return;
  lastBattery = percent;
  meter.setAttribute('aria-valuenow', String(percent));
  batteryValue.textContent = `${percent}%`;
  meter.classList.toggle('low', percent < 20);
  const filled = Math.ceil(percent / 100 * cells.length);
  cells.forEach((cell, index) => cell.classList.toggle('empty', index >= filled));
}
function requestBatteryUpdate() {
  if (!frameRequested) { frameRequested = true; requestAnimationFrame(drawBattery); }
}
window.addEventListener('scroll', requestBatteryUpdate, { passive: true });
window.addEventListener('resize', requestBatteryUpdate);
window.addEventListener('pageshow', event => {
  if (event.persisted) restoreLamp();
  requestBatteryUpdate();
});
if ('ResizeObserver' in window) new ResizeObserver(requestBatteryUpdate).observe(document.body);
drawBattery();

const clock = document.querySelector('[data-clock]');
if (clock) {
  const start = Date.now();
  const updateClock = () => {
    const seconds = Math.floor((Date.now() - start) / 1000);
    const time = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60];
    clock.textContent = time.map(value => String(value).padStart(2, '0')).join(':');
  };
  setInterval(updateClock, 1000);
}

const filters = document.querySelectorAll('[data-project-filter]');
const cards = document.querySelectorAll('.archive-list [data-group]');
filters.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.projectFilter;
  let count = 0;
  cards.forEach(card => {
    card.hidden = filter !== 'all' && card.dataset.group !== filter;
    if (!card.hidden) count++;
  });
  filters.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  document.querySelector('[data-project-count]').textContent = `${count} ${count === 1 ? 'project' : 'projecten'}`;
  requestBatteryUpdate();
}));

function setupTabs(container, barClass, tabClass, panelClass, prefix) {
  const bar = container.querySelector(`:scope > .${barClass}`);
  if (!bar) return;
  const buttons = Array.from(bar.querySelectorAll(`.${tabClass}`));
  const panels = Array.from(container.querySelectorAll(`:scope > .${panelClass}`));
  if (!buttons.length || buttons.length !== panels.length) return;
  bar.setAttribute('role', 'tablist');
  bar.setAttribute('aria-label', barClass === 'level-tabs' ? 'Level' : 'Game mechanic');
  function select(index) {
    buttons.forEach((button, i) => {
      const active = i === index;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      panels[i].classList.toggle('active', active);
      panels[i].hidden = !active;
      if (!active) panels[i].querySelectorAll('video,audio').forEach(media => media.pause());
    });
    requestBatteryUpdate();
  }
  buttons.forEach((button, i) => {
    button.id = `${prefix}-keuze-${i}`;
    panels[i].id = `${prefix}-inhoud-${i}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', button.id);
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', event => {
      const targets = { ArrowRight: (i + 1) % buttons.length, ArrowLeft: (i + buttons.length - 1) % buttons.length, Home: 0, End: buttons.length - 1 };
      if (!(event.key in targets)) return;
      event.preventDefault();
      const next = targets[event.key];
      select(next);
      buttons[next].focus();
    });
  });
  select(0);
}

const mechanics = document.querySelector('.mechanics-page');
if (mechanics) {
  setupTabs(mechanics, 'mechanic-tabs', 'mechanic-tab', 'mechanic-content', 'mechanic');
  mechanics.querySelectorAll('.mechanic-content').forEach((panel, i) => {
    setupTabs(panel, 'level-tabs', 'level-tab', 'level-content', `level-${i}`);
  });
  mechanics.addEventListener('click', async event => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const code = button.closest('details').querySelector('code');
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = 'Gekopieerd';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = 'Code geselecteerd';
    }
    setTimeout(() => { button.textContent = 'Kopieer code'; }, 2200);
  });
}
