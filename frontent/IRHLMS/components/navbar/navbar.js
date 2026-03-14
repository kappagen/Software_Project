export class Navbar {
  constructor({ onThemeToggle, onSettingsClick } = {}) {
    this.onThemeToggle = onThemeToggle || (() => {});
    this.onSettingsClick = onSettingsClick || (() => {});
    this.titleEl = document.getElementById('tb-title');
    this.subEl = document.getElementById('tb-sub');
  }
  init() {
    this._setDateSub();
    document.getElementById('theme-toggle')?.addEventListener('click', () => this.onThemeToggle());
    document.getElementById('settings-btn')?.addEventListener('click', () => this.onSettingsClick());
  }
  setTitle(title) { if (this.titleEl) this.titleEl.textContent = title; }
  _setDateSub() {
    const opts = { weekday:'long', day:'numeric', month:'long', year:'numeric' };
    if (this.subEl) this.subEl.textContent = new Date().toLocaleDateString('en-GB', opts) + ' · IIT Jodhpur';
  }
}