import { BarChart, DonutChart } from '../../components/chart/chart.js';

export class DashboardPage {
  static _subscribed = false;

  static init(store) {
    BarChart.build('recovery-chart', [65, 72, 58, 80, 75, 88, 72], 'var(--teal)', 100);
    const habits = this._safeHabits(store.get('habits'));
    const allHabits = this._flattenHabits(habits);
    const done = allHabits.filter((habit) => habit.s).length;
    DonutChart.update('dash-donut', done, allHabits.length);
    this._updateLegend(habits);

    if (this._subscribed) return;
    store.subscribe('habits', (nextHabits) => {
      const safe = this._safeHabits(nextHabits);
      const all = this._flattenHabits(safe);
      const doneCount = all.filter((habit) => habit.s).length;
      DonutChart.update('dash-donut', doneCount, all.length);
      this._updateLegend(safe);
    });
    this._subscribed = true;
  }

  static _updateLegend(habits) {
    const legend = document.getElementById('hab-legend');
    if (!legend) return;
    const cats = [
      { key: 'medical', label: 'Medical', color: 'var(--rose)' },
      { key: 'physical', label: 'Physical', color: 'var(--teal)' },
      { key: 'mental', label: 'Mental', color: 'var(--violet)' }
    ];

    legend.innerHTML = cats
      .map((cat) => {
        const group = Array.isArray(habits[cat.key]) ? habits[cat.key] : [];
        const done = group.filter((habit) => habit.s).length;
        const total = group.length;

        return `<div style="display:flex;align-items:center;gap:8px">
        <div style="width:8px;height:8px;border-radius:50%;background:${cat.color};flex-shrink:0"></div>
        <div style="font-size:12px;color:var(--txt2);flex:1">${cat.label}</div>
        <div style="font-size:12px;font-weight:600;color:var(--txt1)">${done}/${total}</div>
      </div>`;
      })
      .join('');
  }

  static _safeHabits(habits) {
    return {
      medical: Array.isArray(habits?.medical) ? habits.medical : [],
      physical: Array.isArray(habits?.physical) ? habits.physical : [],
      mental: Array.isArray(habits?.mental) ? habits.mental : [],
      academic: Array.isArray(habits?.academic) ? habits.academic : [],
      other: Array.isArray(habits?.other) ? habits.other : []
    };
  }

  static _flattenHabits(habits) {
    return [
      ...habits.medical,
      ...habits.physical,
      ...habits.mental,
      ...habits.academic,
      ...habits.other
    ];
  }
}
