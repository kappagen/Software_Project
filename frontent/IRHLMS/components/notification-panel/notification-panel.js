export class NotificationPanel {
  constructor() {
    this.panel = document.getElementById('notif-panel');
    this.trigger = document.getElementById('notif-trigger');
    this._bound = false;
  }

  init() {
    if (!this.panel || this._bound) return;

    this.trigger?.addEventListener('click', (event) => {
      event.stopPropagation();
      this.toggle();
    });

    document.getElementById('notif-clear')?.addEventListener('click', () => {
      const list = document.getElementById('notif-list');
      if (list) list.innerHTML = '<li style="padding:24px;text-align:center;color:var(--txt3);font-size:13px">No notifications</li>';
    });

    document.addEventListener('click', (event) => {
      if (!this.panel || !this.trigger) return;
      if (!this.panel.contains(event.target) && !this.trigger.contains(event.target)) {
        this.close();
      }
    });

    this._bound = true;
  }

  open() {
    if (!this.panel) return;
    this.panel.classList.add('open');
    this.panel.setAttribute('aria-hidden', 'false');
    this.trigger?.setAttribute('aria-expanded', 'true');
  }

  close() {
    if (!this.panel) return;
    this.panel.classList.remove('open');
    this.panel.setAttribute('aria-hidden', 'true');
    this.trigger?.setAttribute('aria-expanded', 'false');
  }

  toggle() {
    if (!this.panel) return;
    this.panel.classList.contains('open') ? this.close() : this.open();
  }

  onNavigate() {
    this.close();
  }
}
