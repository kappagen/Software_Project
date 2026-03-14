export class NotificationPanel {
  constructor() {
    this.panel = document.getElementById('notif-panel');
    this.trigger = document.getElementById('notif-trigger');
  }
  init() {
    if (!this.panel) return;
    this.trigger?.addEventListener('click', e => { e.stopPropagation(); this.toggle(); });
    document.getElementById('notif-clear')?.addEventListener('click', () => {
      const list = document.getElementById('notif-list');
      if (list) list.innerHTML = '<li style="padding:24px;text-align:center;color:var(--txt3);font-size:13px">No notifications</li>';
    });
    document.addEventListener('click', e => {
      if (this.panel && this.trigger && !this.panel.contains(e.target) && !this.trigger.contains(e.target)) this.close();
    });
  }
  open()  { this.panel.classList.add('open'); this.panel.setAttribute('aria-hidden','false'); this.trigger?.setAttribute('aria-expanded','true'); }
  close() { this.panel.classList.remove('open'); this.panel.setAttribute('aria-hidden','true'); this.trigger?.setAttribute('aria-expanded','false'); }
  toggle() { this.panel.classList.contains('open') ? this.close() : this.open(); }
  onNavigate() { this.close(); }
}