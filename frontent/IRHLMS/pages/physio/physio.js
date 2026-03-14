import { BarChart } from '../../components/chart/chart.js';
import { Toast } from '../../utilities/toast.js';

export class PhysioPage {
  static _bound = false;
  static _pickerBound = false;
  static _timeState = { hour: '07', minute: '00', meridiem: 'AM' };

  static init(store) {
    BarChart.build('ex-chart', [12, 14, 10, 16, 14, 18, 14], 'var(--emerald)', 20);

    this._initTimePicker();

    if (this._bound) return;

    this._syncExerciseList();

    document.getElementById('ex-list')?.addEventListener('click', (e) => {
      const item = e.target.closest('.ex-item');
      if (!item) return;
      item.classList.toggle('done');
      this._syncExerciseItem(item);
    });

    document.getElementById('add-ex-btn')?.addEventListener('click', () => {
      const name = document.getElementById('ex-name-inp')?.value.trim();
      const timeInput = document.getElementById('ex-time-inp');
      const rawTime = timeInput?.value.trim() || '';
      const desc = document.getElementById('ex-desc-inp')?.value.trim();

      if (!name) {
        Toast.warning('Please enter an exercise name.');
        return;
      }

      let normalizedTime = '';
      if (rawTime) {
        const parsed = this._parseTime(rawTime);
        if (!parsed) {
          Toast.warning('Use time format hh:mm AM/PM.');
          return;
        }
        normalizedTime = this._formatTime(parsed);
        this._setTimeState(parsed);
      }

      const list = document.getElementById('ex-list');
      if (!list) return;

      const div = document.createElement('div');
      div.className = 'ex-item';
      div.innerHTML = `<div style="display:flex;align-items:center;gap:12px">
        <div class="ex-check"></div>
        <div><div class="ex-name">${name}</div><div class="ex-meta">${normalizedTime || '-'} · ${desc || '-'}</div></div>
      </div>`;
      this._syncExerciseItem(div);
      list.appendChild(div);

      ['ex-name-inp', 'ex-time-inp', 'ex-desc-inp'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      Toast.success('Exercise added!');
    });

    this._bound = true;
  }

  static _syncExerciseList() {
    document.querySelectorAll('#ex-list .ex-item').forEach((item) => this._syncExerciseItem(item));
  }

  static _syncExerciseItem(item) {
    const isDone = item.classList.contains('done');
    item.setAttribute('role', 'checkbox');
    item.setAttribute('aria-checked', isDone ? 'true' : 'false');
    const check = item.querySelector('.ex-check');
    if (check) check.textContent = '';
  }

  static _initTimePicker() {
    const picker = document.getElementById('ex-time-picker');
    const input = document.getElementById('ex-time-inp');
    const trigger = document.getElementById('ex-time-trigger');
    const panel = document.getElementById('ex-time-panel');
    const display = document.getElementById('ex-time-display');
    const hourCol = document.getElementById('ex-hour-col');
    const minCol = document.getElementById('ex-min-col');
    const merCol = document.getElementById('ex-mer-col');

    if (!picker || !input || !trigger || !panel || !display || !hourCol || !minCol || !merCol) return;

    if (!hourCol.childElementCount) {
      hourCol.innerHTML = Array.from({ length: 12 }, (_, i) => {
        const value = String(i + 1).padStart(2, '0');
        return `<button type="button" class="time-picker-item" data-time-part="hour" data-time-value="${value}">${value}</button>`;
      }).join('');
    }

    if (!minCol.childElementCount) {
      minCol.innerHTML = Array.from({ length: 60 }, (_, i) => {
        const value = String(i).padStart(2, '0');
        return `<button type="button" class="time-picker-item" data-time-part="minute" data-time-value="${value}">${value}</button>`;
      }).join('');
    }

    if (!merCol.childElementCount) {
      merCol.innerHTML = ['AM', 'PM']
        .map((value) => `<button type="button" class="time-picker-item" data-time-part="meridiem" data-time-value="${value}">${value}</button>`)
        .join('');
    }

    const parsedFromInput = input.value.trim() ? this._parseTime(input.value.trim()) : null;
    if (parsedFromInput) {
      this._setTimeState(parsedFromInput);
    } else {
      this._syncDisplay();
    }

    if (this._pickerBound) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
      panel.setAttribute('aria-hidden', panel.classList.contains('open') ? 'false' : 'true');
    });

    panel.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-time-part]');
      if (!btn) return;
      const part = btn.getAttribute('data-time-part');
      const value = btn.getAttribute('data-time-value');
      this._timeState[part] = value;
      this._syncDisplay();
      input.value = this._formatTime(this._timeState);
    });

    input.addEventListener('blur', () => {
      const raw = input.value.trim();
      if (!raw) return;
      const parsed = this._parseTime(raw);
      if (!parsed) {
        Toast.warning('Use time format hh:mm AM/PM.');
        input.value = this._formatTime(this._timeState);
        return;
      }
      this._setTimeState(parsed);
      input.value = this._formatTime(parsed);
    });

    document.addEventListener('click', (e) => {
      if (!picker.contains(e.target)) {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
      }
    });

    this._pickerBound = true;
  }

  static _setTimeState(parsed) {
    this._timeState = {
      hour: parsed.hour,
      minute: parsed.minute,
      meridiem: parsed.meridiem
    };
    this._syncDisplay();
  }

  static _syncDisplay() {
    const display = document.getElementById('ex-time-display');
    const input = document.getElementById('ex-time-inp');
    const value = this._formatTime(this._timeState);

    if (display) display.textContent = value;

    document.querySelectorAll('[data-time-part]').forEach((btn) => {
      const part = btn.getAttribute('data-time-part');
      const val = btn.getAttribute('data-time-value');
      btn.classList.toggle('active', this._timeState[part] === val);
    });

    if (input && !input.value.trim()) {
      input.placeholder = 'hh:mm AM/PM';
    }
  }

  static _formatTime(time) {
    return `${time.hour}:${time.minute} ${time.meridiem}`;
  }

  static _parseTime(raw) {
    const match = raw.match(/^\s*(\d{1,2})(?:\s*:\s*(\d{1,2}))?\s*([AaPp][Mm])?\s*$/);
    if (!match) return null;

    let hour = Number(match[1]);
    const minute = match[2] === undefined ? 0 : Number(match[2]);
    let meridiem = match[3] ? match[3].toUpperCase() : '';

    if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute < 0 || minute > 59) return null;

    if (meridiem) {
      if (hour < 1 || hour > 12) return null;
    } else {
      if (hour < 0 || hour > 23) return null;
      meridiem = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour === 0) hour = 12;
    }

    return {
      hour: String(hour).padStart(2, '0'),
      minute: String(minute).padStart(2, '0'),
      meridiem
    };
  }
}
