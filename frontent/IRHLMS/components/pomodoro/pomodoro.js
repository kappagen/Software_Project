import { pad2 } from '../../scripts/helpers/dom.js';

export class Pomodoro {
  constructor({ onComplete } = {}) {
    this.onComplete = onComplete || (() => {});
    this._interval = null;
    this._remaining = 25 * 60;
    this._total = 25 * 60;
    this._running = false;
    this._label = 'FOCUS';
    this._sessions = 0;
    this._bound = false;
  }

  init() {
    this._timeEl = document.getElementById('pomo-time');
    this._lblEl = document.getElementById('pomo-lbl');
    this._ringEl = document.getElementById('pomo-ring');
    this._cntEl = document.getElementById('pomo-count');
    this._startBtn = document.getElementById('pomo-start');
    this._resetBtn = document.getElementById('pomo-reset');

    if (!this._bound) {
      this._startBtn?.addEventListener('click', () => (this._running ? this.pause() : this.start()));
      this._resetBtn?.addEventListener('click', () => this.reset());
      document.querySelectorAll('[data-pomo]').forEach((button) => {
        button.addEventListener('click', () => {
          const [mins, label] = String(button.dataset.pomo || '').split('|');
          this.setMode(Number(mins), label);
        });
      });
      this._bound = true;
    }

    this._render();
  }

  start() {
    if (this._running || this._remaining <= 0) return;
    this._running = true;
    if (this._startBtn) this._startBtn.textContent = 'Pause';

    clearInterval(this._interval);
    this._interval = setInterval(() => {
      this._remaining -= 1;
      this._render();
      if (this._remaining <= 0) {
        this.pause();
        this._complete();
      }
    }, 1000);
  }

  pause() {
    this._running = false;
    clearInterval(this._interval);
    this._interval = null;
    if (this._startBtn) this._startBtn.textContent = 'Start';
  }

  reset() {
    this.pause();
    this._remaining = this._total;
    this._render();
  }

  setMode(mins, label) {
    const minutes = Number.isFinite(mins) && mins > 0 ? mins : 25;
    this.pause();
    this._total = this._remaining = minutes * 60;
    this._label = label || 'FOCUS';
    if (this._lblEl) this._lblEl.textContent = this._label;
    this._render();
  }

  _complete() {
    this._sessions += 1;
    if (this._cntEl) this._cntEl.textContent = String(this._sessions);
    this.onComplete({ sessions: this._sessions, label: this._label });
    this.reset();
  }

  _render() {
    const m = Math.floor(this._remaining / 60);
    const s = this._remaining % 60;
    if (this._timeEl) this._timeEl.textContent = `${pad2(m)}:${pad2(s)}`;

    const total = Math.max(this._total, 1);
    const pct = ((total - this._remaining) / total) * 100;
    if (this._ringEl) {
      this._ringEl.style.background = `conic-gradient(var(--violet) ${pct}%, var(--border) 0%)`;
    }
  }
}
