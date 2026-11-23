(() => {
  const url = new URL(location.href);
  let enabled = url.searchParams.has('meekijken');
  try {
    if (enabled) sessionStorage.setItem('meekijken', '1');
    enabled ||= sessionStorage.getItem('meekijken') === '1';
  } catch { /* A directly opened preview also works without browser storage. */ }
  if (!enabled) return;
  const currentVersion = document.querySelector('meta[name="portfolio-versie"]')?.content || 'origineel';
  let fetching = false;
  async function check() {
    if (fetching || document.visibilityState !== 'visible') return;
    fetching = true;
    try {
      const response = await fetch(`preview-state.json?controle=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return;
      const { version } = await response.json();
      if (typeof version === 'string' && version !== currentVersion) {
        const page = new URL(location.href);
        page.searchParams.set('v', version);
        location.replace(page.href);
      }
    } catch { /* Another update check will run after a temporary interruption. */ }
    finally { fetching = false; }
  }
  setInterval(check, 10000);
  document.addEventListener('visibilitychange', check);
})();
