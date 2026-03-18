export class Modal {
  static _overlay = null;
  static _onConfirm = null;
  static _bound = false;

  static init() {
    this._overlay = document.getElementById('modal-overlay');
    if (this._bound) return;

    document.getElementById('modal-close')?.addEventListener('click', () => this.close());
    document.getElementById('modal-cancel')?.addEventListener('click', () => this.close());
    document.getElementById('modal-confirm')?.addEventListener('click', () => { if (typeof this._onConfirm === 'function') this._onConfirm(); this.close(); });
    this._overlay?.addEventListener('click', e => { if (e.target === this._overlay) this.close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
    this._bound = true;
  }

  static open({ title='', body='', confirmLabel='Confirm', onConfirm, hideFoot=false } = {}) {
    const t = document.getElementById('modal-title');
    const b = document.getElementById('modal-body');
    const f = document.getElementById('modal-foot');
    const c = document.getElementById('modal-confirm');
    if (t) t.textContent = title;
    if (b) b.innerHTML = body;
    if (c) c.textContent = confirmLabel;
    if (f) f.style.display = hideFoot ? 'none' : '';
    this._onConfirm = onConfirm || null;
    this._overlay?.classList.add('open');
    this._overlay?.setAttribute('aria-hidden','false');
  }
  static close() { this._overlay?.classList.remove('open'); this._overlay?.setAttribute('aria-hidden','true'); this._onConfirm = null; }
}
