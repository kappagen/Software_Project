let container = null;

function getContainer() {
  if (!container) {
    container = Object.assign(document.createElement('div'), {
      style:
        'position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:8px;z-index:9999;pointer-events:none'
    });
    document.body.appendChild(container);
  }
  return container;
}

function show(msg, { bg = 'var(--navy)', color = '#fff', icon = '' } = {}) {
  const toast = document.createElement('div');
  const iconEl = document.createElement('span');
  const msgEl = document.createElement('span');

  iconEl.textContent = String(icon);
  msgEl.textContent = String(msg);

  Object.assign(iconEl.style, {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '.04em'
  });

  Object.assign(toast.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 18px',
    borderRadius: '10px',
    background: bg,
    color,
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: 'var(--font-body)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    animation: 'fadeUp .25s ease',
    opacity: '1',
    transition: 'opacity .3s ease',
    pointerEvents: 'auto',
    maxWidth: '300px'
  });

  toast.append(iconEl, msgEl);
  getContainer().appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

export const Toast = {
  show: (msg, opts) => show(msg, opts),
  success: (msg) => show(msg, { bg: 'var(--teal)', icon: 'OK' }),
  error: (msg) => show(msg, { bg: 'var(--rose)', icon: 'ERR' }),
  info: (msg) => show(msg, { bg: 'var(--blue)', icon: 'INFO' }),
  warning: (msg) => show(msg, { bg: 'var(--amber)', icon: 'WARN', color: 'var(--navy-deep)' })
};
