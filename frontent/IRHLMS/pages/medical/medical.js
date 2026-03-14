import { Toast }    from '../../utilities/toast.js';
import { debounce } from '../../scripts/helpers/dom.js';

export class MedicalPage {
  static _nextId = 5;
  static init(store) {
    this._render(store.get('medicalRecords'));
    document.getElementById('rec-search')?.addEventListener('input',
      debounce(e => {
        const q = e.target.value.toLowerCase();
        this._render(store.get('medicalRecords').filter(r => r.name.toLowerCase().includes(q)));
      }, 300)
    );
    document.getElementById('open-rec-form')?.addEventListener('click', () => {
      document.getElementById('rec-form').style.display = '';
    });
    document.getElementById('close-rec-form')?.addEventListener('click', () => {
      document.getElementById('rec-form').style.display = 'none';
    });
    document.getElementById('save-rec-btn')?.addEventListener('click', () => {
      const name = document.getElementById('rf-name')?.value.trim();
      const type = document.getElementById('rf-type')?.value;
      const date = document.getElementById('rf-date')?.value;
      if (!name) { Toast.warning('Document name required.'); return; }
      store.update('medicalRecords', arr => [...arr, { id:this._nextId++, name, type, date }]);
      document.getElementById('rec-form').style.display = 'none';
      this._render(store.get('medicalRecords'));
      Toast.success('Record added!');
    });
  }
  static _render(records) {
    const wrap = document.getElementById('rec-wrap');
    if (!wrap) return;
    const icons = { pdf:'📄', img:'🖼', doc:'📝' };
    const colors = { pdf:'var(--rose)', img:'var(--teal)', doc:'var(--violet)' };
    wrap.innerHTML = records.length ? records.map(r => `
      <div style="display:flex;align-items:center;gap:14px;padding:14px 20px;background:var(--surface);border:1px solid var(--border);border-radius:12px;margin-bottom:10px">
        <div style="width:38px;height:38px;border-radius:10px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${icons[r.type]||'📎'}</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:500;color:var(--txt1)">${r.name}</div><div style="font-size:11px;color:var(--txt3);margin-top:2px">${r.type?.toUpperCase()||'FILE'} · ${r.date||'—'}</div></div>
        <span class="badge" style="background:var(--surface2);color:${colors[r.type]||'var(--txt2)'}">${r.type?.toUpperCase()}</span>
      </div>`).join('')
    : '<div style="text-align:center;padding:40px;color:var(--txt3);font-size:13px">No records found.</div>';
  }
}