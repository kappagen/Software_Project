export class ThemeManager {
  constructor() {
    this._root = document.documentElement;
    this._theme = localStorage.getItem('irhlms-theme') || 'light';
    this._contrast = localStorage.getItem('irhlms-contrast') || 'normal';
    this._fontSize = localStorage.getItem('irhlms-fontsize') || 'md';
  }
  init() {
    this._applyAll();
    this._bindControls();
  }
  toggle() {
    this._theme = this._theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('irhlms-theme', this._theme);
    this._root.setAttribute('data-theme', this._theme);
    const darkToggle = document.getElementById('t-dark');
    if (darkToggle) darkToggle.classList.toggle('on', this._theme === 'dark');
  }
  setFontSize(size) {
    this._fontSize = size;
    localStorage.setItem('irhlms-fontsize', size);
    this._root.setAttribute('data-fontsize', size);
  }
  setContrast(high) {
    this._contrast = high ? 'high' : 'normal';
    localStorage.setItem('irhlms-contrast', this._contrast);
    this._root.setAttribute('data-contrast', this._contrast);
  }
  _applyAll() {
    this._root.setAttribute('data-theme', this._theme);
    this._root.setAttribute('data-contrast', this._contrast);
    this._root.setAttribute('data-fontsize', this._fontSize);
  }
  _bindControls() {
    document.getElementById('t-dark')?.addEventListener('click', e => {
      this.toggle();
      e.currentTarget.classList.toggle('on', this._theme === 'dark');
    });
    document.getElementById('t-contrast')?.addEventListener('click', e => {
      const on = e.currentTarget.classList.toggle('on');
      this.setContrast(on);
    });
    document.getElementById('t-motion')?.addEventListener('click', e => {
      const on = e.currentTarget.classList.toggle('on');
      document.documentElement.style.setProperty('--tr', on ? '0s' : '0.22s cubic-bezier(.4,0,.2,1)');
    });
    document.querySelectorAll('[data-size]').forEach(btn => {
      btn.addEventListener('click', () => this.setFontSize(btn.dataset.size));
    });
  }
}