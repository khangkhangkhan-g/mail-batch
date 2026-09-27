(() => {
  const ROOT_ID = 'mailbatch-gmail-root';
  const WIDTH_KEY = 'mailbatchPanelWidth';
  const POSITION_KEY = 'mailbatchLauncherPosition';
  const LANGUAGE_KEY = 'mailbatchUiLanguage';
  const DEFAULT_WIDTH = 720;
  const MIN_WIDTH = 460;
  const EDGE = 10;
  const DRAG_THRESHOLD = 5;
  if (document.getElementById(ROOT_ID)) return;

  let uiLang = 'en';
  const launcherCopy = {
    en: 'Drag to move. Click to open MailBatch.',
    vi: 'Kéo để di chuyển. Bấm để mở MailBatch.'
  };

  const root = document.createElement('div');
  root.id = ROOT_ID;
  Object.assign(root.style, {
    position: 'fixed', inset: '0', zIndex: '2147483647', pointerEvents: 'none'
  });

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'MailBatch';
  Object.assign(button.style, {
    position: 'absolute', right: '20px', bottom: '20px', height: '42px', padding: '0 16px',
    border: '1px solid rgba(60,64,67,.22)', borderRadius: '12px', background: '#fff', color: '#202124',
    boxShadow: '0 3px 12px rgba(60,64,67,.22)', font: '600 14px/42px Arial, sans-serif',
    cursor: 'grab', pointerEvents: 'auto', touchAction: 'none', whiteSpace: 'nowrap'
  });

  const panelWrap = document.createElement('div');
  Object.assign(panelWrap.style, {
    position: 'absolute', top: '0', right: '0', width: `${DEFAULT_WIDTH}px`, maxWidth: '98vw', height: '100vh',
    background: '#fff', boxShadow: '-12px 0 36px rgba(32,33,36,.18)', transform: 'translateX(102%)',
    transition: 'transform 180ms ease', pointerEvents: 'auto'
  });

  const panel = document.createElement('iframe');
  panel.src = chrome.runtime.getURL('app.html');
  panel.title = 'MailBatch for Gmail';
  Object.assign(panel.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', border: '0', background: '#fff' });

  const resizeHandle = document.createElement('div');
  resizeHandle.title = 'Drag to resize. Double-click to maximize or restore.';
  resizeHandle.setAttribute('aria-label', 'Resize MailBatch panel');
  Object.assign(resizeHandle.style, {
    position: 'absolute', left: '-5px', top: '0', width: '10px', height: '100%', cursor: 'col-resize', pointerEvents: 'auto', zIndex: '2'
  });

  const resizeIndicator = document.createElement('div');
  Object.assign(resizeIndicator.style, {
    position: 'absolute', left: '4px', top: 'calc(50% - 34px)', width: '2px', height: '68px', borderRadius: '99px',
    background: 'rgba(95,99,104,.35)', transition: 'background 120ms ease, width 120ms ease'
  });
  resizeHandle.appendChild(resizeIndicator);

  let open = false;
  let resizing = false;
  let restoreWidth = DEFAULT_WIDTH;
  let launchDrag = null;
  let launcherMoved = false;

  function maxWidth() { return Math.max(MIN_WIDTH, window.innerWidth - 10); }
  function clampWidth(value) { return Math.min(maxWidth(), Math.max(MIN_WIDTH, Number(value) || DEFAULT_WIDTH)); }

  function applyLauncherLanguage() {
    const text = launcherCopy[uiLang] || launcherCopy.en;
    button.title = text;
    button.setAttribute('aria-label', text);
    resizeHandle.title = uiLang === 'vi' ? 'Kéo để đổi độ rộng. Bấm đúp để phóng to hoặc khôi phục.' : 'Drag to resize. Double-click to maximize or restore.';
    resizeHandle.setAttribute('aria-label', uiLang === 'vi' ? 'Đổi độ rộng panel MailBatch' : 'Resize MailBatch panel');
  }

  async function loadLanguage() {
    try {
      const stored = await chrome.storage.local.get(LANGUAGE_KEY);
      const lang = stored[LANGUAGE_KEY];
      uiLang = lang === 'vi' ? 'vi' : 'en';
    } catch {}
    applyLauncherLanguage();
  }

  async function loadWidth() {
    try {
      const stored = await chrome.storage.local.get(WIDTH_KEY);
      const width = clampWidth(stored[WIDTH_KEY] || DEFAULT_WIDTH);
      panelWrap.style.width = `${width}px`;
      restoreWidth = width;
    } catch { panelWrap.style.width = `${clampWidth(DEFAULT_WIDTH)}px`; }
  }

  async function saveWidth() {
    try { await chrome.storage.local.set({ [WIDTH_KEY]: Math.round(panelWrap.getBoundingClientRect().width) }); } catch {}
  }

  function launcherRectFromStored(position) {
    if (!position || !Number.isFinite(Number(position.x)) || !Number.isFinite(Number(position.y))) return null;
    const width = button.offsetWidth || 100;
    const height = button.offsetHeight || 42;
    return {
      x: Math.min(Math.max(EDGE, Number(position.x)), Math.max(EDGE, window.innerWidth - width - EDGE)),
      y: Math.min(Math.max(EDGE, Number(position.y)), Math.max(EDGE, window.innerHeight - height - EDGE))
    };
  }

  function placeLauncher(x, y) {
    const pos = launcherRectFromStored({ x, y });
    if (!pos) return;
    button.style.right = 'auto';
    button.style.bottom = 'auto';
    button.style.left = `${pos.x}px`;
    button.style.top = `${pos.y}px`;
  }

  async function loadLauncherPosition() {
    try {
      const stored = await chrome.storage.local.get(POSITION_KEY);
      const pos = launcherRectFromStored(stored[POSITION_KEY]);
      if (pos) placeLauncher(pos.x, pos.y);
    } catch {}
  }

  async function saveLauncherPosition() {
    const rect = button.getBoundingClientRect();
    try { await chrome.storage.local.set({ [POSITION_KEY]: { x: Math.round(rect.left), y: Math.round(rect.top) } }); } catch {}
  }

  function setOpen(next) {
    open = next;
    panelWrap.style.transform = open ? 'translateX(0)' : 'translateX(102%)';
    button.style.display = open ? 'none' : 'block';
  }

  function resizeFromPointer(clientX) {
    panelWrap.style.width = `${clampWidth(window.innerWidth - clientX)}px`;
  }

  resizeHandle.addEventListener('pointerdown', (event) => {
    resizing = true;
    resizeHandle.setPointerCapture(event.pointerId);
    panelWrap.style.transition = 'none';
    resizeIndicator.style.background = '#0b57d0';
    resizeIndicator.style.width = '3px';
    event.preventDefault();
  });
  resizeHandle.addEventListener('pointermove', (event) => {
    if (!resizing) return;
    resizeFromPointer(event.clientX);
    event.preventDefault();
  });
  resizeHandle.addEventListener('pointerup', async (event) => {
    if (!resizing) return;
    resizing = false;
    try { resizeHandle.releasePointerCapture(event.pointerId); } catch {}
    panelWrap.style.transition = 'transform 180ms ease';
    resizeIndicator.style.background = 'rgba(95,99,104,.35)';
    resizeIndicator.style.width = '2px';
    const width = panelWrap.getBoundingClientRect().width;
    if (width < maxWidth() - 24) restoreWidth = width;
    await saveWidth();
  });
  resizeHandle.addEventListener('dblclick', async () => {
    const current = panelWrap.getBoundingClientRect().width;
    const full = maxWidth();
    if (Math.abs(current - full) < 24) panelWrap.style.width = `${clampWidth(restoreWidth)}px`;
    else { restoreWidth = current; panelWrap.style.width = `${full}px`; }
    await saveWidth();
  });

  button.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    const rect = button.getBoundingClientRect();
    launchDrag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top };
    launcherMoved = false;
    button.setPointerCapture(event.pointerId);
    button.style.cursor = 'grabbing';
    event.preventDefault();
  });
  button.addEventListener('pointermove', (event) => {
    if (!launchDrag || launchDrag.pointerId !== event.pointerId) return;
    const dx = event.clientX - launchDrag.startX;
    const dy = event.clientY - launchDrag.startY;
    if (!launcherMoved && Math.hypot(dx, dy) >= DRAG_THRESHOLD) launcherMoved = true;
    if (!launcherMoved) return;
    placeLauncher(launchDrag.left + dx, launchDrag.top + dy);
    event.preventDefault();
  });
  button.addEventListener('pointerup', async (event) => {
    if (!launchDrag || launchDrag.pointerId !== event.pointerId) return;
    try { button.releasePointerCapture(event.pointerId); } catch {}
    const moved = launcherMoved;
    launchDrag = null;
    launcherMoved = false;
    button.style.cursor = 'grab';
    if (moved) await saveLauncherPosition();
    else setOpen(true);
    event.preventDefault();
  });
  button.addEventListener('pointercancel', () => {
    launchDrag = null;
    launcherMoved = false;
    button.style.cursor = 'grab';
  });
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpen(true); }
  });

  window.addEventListener('resize', () => {
    const current = panelWrap.getBoundingClientRect().width;
    panelWrap.style.width = `${clampWidth(current)}px`;
    if (button.style.left) {
      const rect = button.getBoundingClientRect();
      placeLauncher(rect.left, rect.top);
      saveLauncherPosition();
    }
  });

  window.addEventListener('message', (event) => {
    if (event.source !== panel.contentWindow) return;
    if (event.data?.type === 'MAILBATCH_CLOSE') setOpen(false);
    if (event.data?.type === 'MAILBATCH_LANGUAGE') {
      uiLang = event.data.language === 'vi' ? 'vi' : 'en';
      applyLauncherLanguage();
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[LANGUAGE_KEY]) return;
    uiLang = changes[LANGUAGE_KEY].newValue === 'vi' ? 'vi' : 'en';
    applyLauncherLanguage();
  });

  panelWrap.append(panel, resizeHandle);
  root.append(button, panelWrap);
  (document.body || document.documentElement).appendChild(root);
  loadWidth();
  loadLauncherPosition();
  loadLanguage();
})();
