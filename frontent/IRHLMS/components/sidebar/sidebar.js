export class Sidebar {
  constructor({ onNavigate } = {}) {
    this.onNavigate = onNavigate || (() => {});
    this.el = document.getElementById('app-sidebar');
  }
  init() {
    if (!this.el) return;
    this._bindNavItems();
    this._bindQuickActionBtns();
  }
  _bindNavItems() {
    this.el.querySelectorAll('.sb-item[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActive(btn.dataset.page);
        this.onNavigate(btn.dataset.page);
      });
    });
  }
  _bindQuickActionBtns() {
    document.querySelectorAll('[data-page]:not(.sb-item)').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActive(btn.dataset.page);
        this.onNavigate(btn.dataset.page);
      });
    });
  }
  setActive(pageId) {
    this.el.querySelectorAll('.sb-item').forEach(b => {
      b.classList.toggle('active', b.dataset.page === pageId);
      b.dataset.page === pageId ? b.setAttribute('aria-current','page') : b.removeAttribute('aria-current');
    });
  }
  updateHabitBadge(count) {
    const badge = document.getElementById('hab-badge');
    if (badge) badge.textContent = count;
  }
}