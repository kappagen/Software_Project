export class Router {
  constructor(defaultPage = 'dashboard') {
    this._defaultPage = defaultPage;
    this._current = defaultPage;
    this._titles = {
      dashboard: 'Dashboard',
      recovery: 'Recovery Tracker',
      physio: 'Physiotherapy',
      learning: 'Learning Hub',
      habits: 'Habit Manager',
      medical: 'Medical Records',
      therapy: 'Therapy Sessions',
      achievements: 'Achievements',
      feedback: 'Feedback',
      settings: 'Settings'
    };
    this._onChange = null;
  }

  onNavigate(listener) {
    this._onChange = listener;
  }

  go(pageId) {
    const nextPage = this._resolvePage(pageId);
    const target = document.getElementById(`page-${nextPage}`);
    if (!target) return;

    document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
    target.classList.add('active');

    this._current = nextPage;
    this._syncTitle(nextPage);

    if (typeof this._onChange === 'function') {
      this._onChange(nextPage);
    }
  }

  current() {
    return this._current;
  }

  _resolvePage(pageId) {
    const id = String(pageId || '').trim();
    if (id && document.getElementById(`page-${id}`)) return id;
    return this._defaultPage;
  }

  _syncTitle(pageId) {
    const titleEl = document.getElementById('tb-title');
    if (!titleEl) return;
    titleEl.textContent = this._titles[pageId] || pageId;
  }
}
