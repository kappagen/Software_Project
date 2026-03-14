import { Toast } from '../../utilities/toast.js';
import { HabitHeatmap } from '../../components/habit-heatmap/habit-heatmap.js';

const CATEGORY_ORDER = ['medical', 'physical', 'mental', 'academic', 'other'];
const CATEGORY_LABELS = {
  medical: 'Medical',
  physical: 'Physical',
  mental: 'Mental',
  academic: 'Academic',
  other: 'Other'
};

export class HabitsPage {
  static _store = null;
  static _sidebar = null;
  static _bound = false;
  static _subscribed = false;
  static _activeFilter = 'all';

  static init(store, sidebar) {
    this._store = store;
    this._sidebar = sidebar;

    this._renderAll();

    if (!this._bound) {
      this._bindHabitClicks();
      this._bindAdd();
      this._bound = true;
    }

    if (!this._subscribed) {
      store.subscribe('habits', () => this._renderAll());
      this._subscribed = true;
    }
  }

  static _renderAll() {
    this._renderTodayHabits();
    this._updateCounts();
    this._renderHeatmap();
  }

  static _renderTodayHabits() {
    const habits = this._store.get('habits');
    const host = document.getElementById('habits-today-list');
    if (!habits || !host) return;

    const allHabits = this._flattenHabits(habits);
    const filteredHabits =
      this._activeFilter === 'all'
        ? allHabits
        : allHabits.filter((habit) => habit.filterCat === this._activeFilter);

    host.innerHTML = filteredHabits.length
      ? filteredHabits
          .map(
            (habit) => `
              <div
                class="hab-item ${habit.s ? 'done' : ''}"
                data-cat="${this._escape(habit.sourceCat)}"
                data-idx="${habit.idx}"
                role="checkbox"
                aria-checked="${habit.s ? 'true' : 'false'}"
              >
                <div class="hab-check">${habit.s ? '&#10003;' : ''}</div>
                <div class="hab-txt">
                  <div class="hab-name">${this._escape(habit.t || 'Untitled Habit')}</div>
                  <div class="hab-meta-line">
                    <span class="hab-cat-pill">${this._escape(this._categoryLabel(habit.filterCat))}</span>
                    <span class="hab-points">
                      <img class="hab-fire-inline" src="assets/svg/fire.svg" alt="" aria-hidden="true"/>
                      <span>${habit.points}</span>
                    </span>
                  </div>
                </div>
              </div>
            `
          )
          .join('')
      : '<div class="hab-empty">No habits in this category.</div>';

    this._renderFilterState();
  }

  static _bindHabitClicks() {
    document.getElementById('page-habits')?.addEventListener('click', (event) => {
      const filterBtn = event.target.closest('[data-habit-filter]');
      if (filterBtn) {
        this._activeFilter = filterBtn.dataset.habitFilter || 'all';
        this._renderTodayHabits();
        return;
      }

      const item = event.target.closest('.hab-item');
      if (!item) return;

      const cat = item.dataset.cat;
      const idx = Number(item.dataset.idx);
      if (!cat || Number.isNaN(idx)) return;

      this._store.update('habits', (habits) => {
        if (!habits[cat] || !habits[cat][idx]) return habits;
        habits[cat][idx].s = !habits[cat][idx].s;
        return habits;
      });
    });
  }

  static _bindAdd() {
    document.getElementById('add-hab-btn')?.addEventListener('click', () => {
      const input = document.getElementById('new-hab-inp');
      const category = document.getElementById('new-hab-cat')?.value || 'mental';
      const text = input?.value.trim();

      if (!text) {
        Toast.warning('Enter a habit name.');
        return;
      }

      this._store.update('habits', (habits) => {
        if (!Array.isArray(habits[category])) {
          habits[category] = [];
        }
        habits[category].push({ t: text, d: '', s: false, n: 0 });
        return habits;
      });

      if (input) input.value = '';
      Toast.success('Habit added.');
    });
  }

  static _updateCounts() {
    const habits = this._store.get('habits');
    if (!habits) return;

    const all = this._flattenHabits(habits);
    const done = all.filter((habit) => habit.s).length;
    const percent = all.length ? Math.round((done / all.length) * 100) : 0;

    const pctEl = document.getElementById('hab-page-pct-badge');
    if (pctEl) pctEl.textContent = `${percent}%`;

    this._sidebar?.updateHabitBadge(done);
  }

  static _renderHeatmap() {
    const habits = this._store.get('habits');
    const model = this._store.get('habitHeatmap');
    if (!habits || !model) return;

    const weeks = Array.isArray(model.weeks) ? model.weeks : ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
    const oldColumns = Array.isArray(model.columns) ? model.columns : [];
    const oldData = Array.isArray(model.data) ? model.data.map((row) => (Array.isArray(row) ? [...row] : [])) : [];

    const flatHabits = this._flattenHabits(habits);
    const columns = flatHabits.map((habit, idx) => habit.t?.trim() || `Habit ${idx + 1}`);
    const currentWeek = flatHabits.map((habit) => (habit.s ? 1 : 0));

    const mapRowToColumns = (row) => {
      const valueByColumn = new Map();
      oldColumns.forEach((label, i) => valueByColumn.set(label, row[i] ? 1 : 0));
      return columns.map((label) => valueByColumn.get(label) || 0);
    };

    const historyTarget = Math.max(weeks.length - 1, 0);
    const oldHistory = oldData.slice(0, historyTarget);
    const mappedHistory = oldHistory.map((row) => mapRowToColumns(row));

    while (mappedHistory.length < historyTarget) {
      mappedHistory.push(Array.from({ length: columns.length }, () => 0));
    }

    const data = [...mappedHistory, currentWeek];

    HabitHeatmap.render('habit-heatmap', {
      title: 'Habit Consistency - Last 4 Weeks',
      subtitle: 'Amber = completed, Grey = missed',
      weeks,
      columns,
      data
    });
  }

  static _renderFilterState() {
    document.querySelectorAll('#habit-filter-row .habit-filter-btn').forEach((button) => {
      const isActive = (button.dataset.habitFilter || 'all') === this._activeFilter;
      button.classList.toggle('active', isActive);
    });
  }

  static _flattenHabits(habits) {
    return this._categoryKeys(habits).flatMap((cat) => {
      const list = Array.isArray(habits[cat]) ? habits[cat] : [];
      const filterCat = this._normalizeCategory(cat);
      return list.map((habit, idx) => ({
        ...habit,
        filterCat,
        sourceCat: cat,
        idx,
        points: this._parsePoints(habit?.n)
      }));
    });
  }

  static _categoryKeys(habits) {
    const keys = Object.keys(habits || {});
    const known = CATEGORY_ORDER.filter((cat) => keys.includes(cat));
    const extra = keys.filter((cat) => !CATEGORY_ORDER.includes(cat));
    return [...known, ...extra];
  }

  static _categoryLabel(cat) {
    return CATEGORY_LABELS[cat] || `${cat.charAt(0).toUpperCase()}${cat.slice(1)}`;
  }

  static _normalizeCategory(cat) {
    return CATEGORY_ORDER.includes(cat) ? cat : 'other';
  }

  static _parsePoints(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0;
  }

  static _escape(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
