export class Router {
  constructor() {
    this._current = 'dashboard';
    this._titles  = {
      dashboard:'Dashboard', recovery:'Recovery Tracker', physio:'Physiotherapy',
      learning:'Learning Hub', habits:'Habit Manager', medical:'Medical Records',
      therapy:'Therapy Sessions', achievements:'Achievements', feedback:'Feedback', settings:'Settings'
    };
    this._onChange = null;
  }
  onNavigate(fn) { this._onChange = fn; }
  go(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) {
      target.classList.add('active');
      this._current = pageId;
      const titleEl = document.getElementById('tb-title');
      if (titleEl) titleEl.textContent = this._titles[pageId] || pageId;
      if (typeof this._onChange === 'function') this._onChange(pageId);
    }
  }
  current() { return this._current; }
}