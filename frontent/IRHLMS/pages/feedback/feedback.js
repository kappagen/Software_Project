import { Toast } from '../../utilities/toast.js';

export class FeedbackPage {
  static init(store) {
    this._bindStars(store);
    this._bindCats();
    this._bindTypes();
    this._bindSubmit(store);
    this._renderHistory(store.get('feedback').submissions);
  }
  static _bindStars(store) {
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = +btn.dataset.v;
        store.update('feedback', fb => ({ ...fb, rating:v }));
        const msgs = ['','Poor','Fair','Good','Very Good','Excellent'];
        const msgEl = document.getElementById('star-msg');
        if (msgEl) msgEl.textContent = msgs[v] || '';
        document.querySelectorAll('.star-btn').forEach((s,i) => {
          s.style.transform = i < v ? 'scale(1.15)' : 'scale(1)';
          s.style.opacity   = i < v ? '1' : '0.4';
        });
      });
    });
  }
  static _bindCats() {
    document.querySelectorAll('.fb-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.fb-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
  static _bindTypes() {
    document.querySelectorAll('.fb-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.fb-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
  static _bindSubmit(store) {
    document.getElementById('submit-fb-btn')?.addEventListener('click', () => {
      const title = document.getElementById('fb-title')?.value.trim();
      const msg   = document.getElementById('fb-msg')?.value.trim();
      const rating = store.get('feedback').rating;
      if (!title || !msg) { Toast.warning('Please fill in all fields.'); return; }
      if (!rating)        { Toast.warning('Please select a rating.'); return; }
      const cat  = document.querySelector('.fb-cat-btn.active')?.dataset.cat || 'general';
      const type = document.querySelector('.fb-type-btn.active')?.dataset.type || 'positive';
      const anon = document.getElementById('fb-anon')?.classList.contains('on');
      const sub  = { id: Date.now(), title, msg, rating, cat, type, anon, date: new Date().toLocaleDateString('en-GB') };
      store.update('feedback', fb => ({ ...fb, submissions: [sub, ...fb.submissions] }));
      document.getElementById('fb-title').value = '';
      document.getElementById('fb-msg').value   = '';
      this._renderHistory(store.get('feedback').submissions);
      Toast.success('Feedback submitted! Thank you 🙏');
    });
  }
  static _renderHistory(submissions) {
    const wrap = document.getElementById('fb-history');
    if (!wrap) return;
    wrap.innerHTML = submissions.length ? submissions.map(s => `
      <div style="padding:14px 20px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <div style="font-size:13px;font-weight:500;color:var(--txt1)">${s.title}</div>
          <div style="font-size:11px;color:var(--txt3)">${s.date}</div>
        </div>
        <div style="font-size:11px;color:var(--txt3)">${'⭐'.repeat(s.rating)} · ${s.cat} · ${s.anon ? 'Anonymous' : 'Yug S.'}</div>
      </div>`).join('')
    : '<div style="padding:24px;text-align:center;color:var(--txt3);font-size:13px">No submissions yet.</div>';
  }
}