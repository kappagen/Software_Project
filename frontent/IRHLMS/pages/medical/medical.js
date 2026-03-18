import { Toast } from '../../utilities/toast.js';
import { debounce } from '../../scripts/helpers/dom.js';

export class MedicalPage {
  static _nextId = 5;
  static _store = null;
  static _bound = false;
  static _subscribed = false;
  static _query = '';

  static init(store) {
    this._store = store;
    this._nextId = this._resolveNextId(store.get('medicalRecords'));
    this._renderFiltered();

    if (!this._bound) {
      this._bindUi();
      this._bound = true;
    }

    if (this._subscribed) return;
    store.subscribe('medicalRecords', () => {
      this._nextId = this._resolveNextId(store.get('medicalRecords'));
      this._renderFiltered();
    });
    this._subscribed = true;
  }

  static _bindUi() {
    document.getElementById('rec-search')?.addEventListener(
      'input',
      debounce((event) => {
        this._query = String(event?.target?.value || '').toLowerCase();
        this._renderFiltered();
      }, 300)
    );

    document.getElementById('open-rec-form')?.addEventListener('click', () => {
      this._setFormOpen(true);
    });

    document.getElementById('close-rec-form')?.addEventListener('click', () => {
      this._setFormOpen(false);
    });

    document.getElementById('save-rec-btn')?.addEventListener('click', () => {
      const name = document.getElementById('rf-name')?.value.trim();
      const type = document.getElementById('rf-type')?.value;
      const date = document.getElementById('rf-date')?.value;

      if (!name) {
        Toast.warning('Document name required.');
        return;
      }

      this._store?.update('medicalRecords', (records = []) => [
        ...records,
        { id: this._nextId++, name, type, date }
      ]);

      this._clearForm();
      this._setFormOpen(false);
      this._renderFiltered();
      Toast.success('Record added.');
    });
  }

  static _setFormOpen(open) {
    const form = document.getElementById('rec-form');
    if (form) form.style.display = open ? '' : 'none';
  }

  static _clearForm() {
    const name = document.getElementById('rf-name');
    const type = document.getElementById('rf-type');
    const date = document.getElementById('rf-date');
    if (name) name.value = '';
    if (type && type.options.length) type.selectedIndex = 0;
    if (date) date.value = '';
  }

  static _resolveNextId(records) {
    const maxId = (records || []).reduce((max, record) => {
      const id = Number(record?.id);
      return Number.isFinite(id) ? Math.max(max, id) : max;
    }, 0);
    return maxId + 1;
  }

  static _renderFiltered() {
    const records = this._store?.get('medicalRecords') || [];
    const filtered = records.filter((record) =>
      String(record?.name || '').toLowerCase().includes(this._query)
    );
    this._render(filtered);
  }

  static _escape(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  static _date(value) {
    const text = String(value || '').trim();
    return text || '-';
  }

  static _recordName(value) {
    const text = String(value || '').trim();
    return text || 'Untitled Document';
  }

  static _recordType(value) {
    const type = String(value || '').toLowerCase();
    if (type === 'pdf' || type === 'img' || type === 'doc') return type;
    return 'file';
  }

  static _recordTypeLabel(type) {
    if (type === 'img') return 'IMG';
    if (type === 'doc') return 'DOC';
    if (type === 'pdf') return 'PDF';
    return 'FILE';
  }

  static _recordColor(type) {
    if (type === 'img') return 'var(--teal)';
    if (type === 'doc') return 'var(--violet)';
    if (type === 'pdf') return 'var(--rose)';
    return 'var(--txt2)';
  }

  static _iconText(type) {
    return this._recordTypeLabel(type);
  }

  static _renderRow(record) {
    const type = this._recordType(record?.type);
    const badgeText = this._recordTypeLabel(type);
    const iconText = this._iconText(type);
    const color = this._recordColor(type);
    const name = this._escape(this._recordName(record?.name));
    const date = this._escape(this._date(record?.date));

    return `
      <div style="display:flex;align-items:center;gap:14px;padding:14px 20px;background:var(--surface);border:1px solid var(--border);border-radius:12px;margin-bottom:10px">
        <div style="width:38px;height:38px;border-radius:10px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${iconText}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500;color:var(--txt1)">${name}</div>
          <div style="font-size:11px;color:var(--txt3);margin-top:2px">${badgeText} | ${date}</div>
        </div>
        <span class="badge" style="background:var(--surface2);color:${color}">${badgeText}</span>
      </div>
    `;
  }

  static _render(records) {
    const wrap = document.getElementById('rec-wrap');
    if (!wrap) return;

    if (!records?.length) {
      wrap.innerHTML =
        '<div style="text-align:center;padding:40px;color:var(--txt3);font-size:13px">No records found.</div>';
      return;
    }

    wrap.innerHTML = records.map((record) => this._renderRow(record)).join('');
  }
}
