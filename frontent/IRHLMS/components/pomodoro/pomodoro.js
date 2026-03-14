import { pad2 } from '../../scripts/helpers/dom.js';

export class Pomodoro {
  constructor({ onComplete } = {}) {
    this.onComplete = onComplete || (() => {});
    this._interval = null;
    this._remaining = 25 * 60;
    this._total     = 25 * 60;
    this._running   = false;
    this._label     = 'FOCUS';
    this._sessions  = 0;
  }
  init() {
    this._timeEl  = document.getElementById('pomo-time');
    this._lblEl   = document.getElementById('pomo-lbl');
    this._ringEl  = document.getElementById('pomo-ring');
    this._cntEl   = document.getElementById('pomo-count');
    this._startBtn= document.getElementById('pomo-start');
    this._resetBtn= document.getElementById('pomo-reset');
    this._startBtn?.addEventListener('click', () => this._running ? this.pause() : this.start());
    this._resetBtn?.addEventListener('click', () => this.reset());
    document.querySelectorAll('[data-pomo]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [mins, lbl] = btn.dataset.pomo.split('|');
        this.setMode(+mins, lbl);
      });
    });
    this._render();
  }
  start() {
    this._running = true;
    if (this._startBtn) this._startBtn.textContent = '⏸ Pause';
    this._interval = setInterval(() => {
      this._remaining--;
      this._render();
      if (this._remaining <= 0) { this.pause(); this._complete(); }
    }, 1000);
  }
  pause() {
    this._running = false;
    clearInterval(this._interval);
    if (this._startBtn) this._startBtn.textContent = '▶ Start';
  }
  reset() {
    this.pause();
    this._remaining = this._total;
    this._render();
  }
  setMode(mins, label) {
    this.pause();
    this._total = this._remaining = mins * 60;
    this._label = label;
    if (this._lblEl) this._lblEl.textContent = label;
    this._render();
  }
  _complete() {
    this._sessions++;
    if (this._cntEl) this._cntEl.textContent = this._sessions;
    this.onComplete({ sessions: this._sessions, label: this._label });
    this.reset();
  }
  _render() {
    const m = Math.floor(this._remaining / 60);
    const s = this._remaining % 60;
    if (this._timeEl) this._timeEl.textContent = `${pad2(m)}:${pad2(s)}`;
    const pct = ((this._total - this._remaining) / this._total) * 100;
    if (this._ringEl) this._ringEl.style.background = `conic-gradient(var(--violet) ${pct}%, var(--border) 0%)`;
  }
}