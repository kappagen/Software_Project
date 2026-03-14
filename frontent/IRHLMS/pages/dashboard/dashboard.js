import { BarChart, DonutChart } from '../../components/chart/chart.js';

export class DashboardPage {
  static init(store) {
    BarChart.build('recovery-chart',
      [65,72,58,80,75,88,72], 'var(--teal)', 100);
    const habits = store.get('habits');
    const allHabits = [...habits.medical, ...habits.physical, ...habits.mental];
    const done = allHabits.filter(h => h.s).length;
    DonutChart.update('dash-donut', done, allHabits.length);
    this._updateLegend(habits);
    store.subscribe('habits', (h) => {
      const all = [...h.medical, ...h.physical, ...h.mental];
      const d = all.filter(x => x.s).length;
      DonutChart.update('dash-donut', d, all.length);
      this._updateLegend(h);
    });
  }
  static _updateLegend(habits) {
    const legend = document.getElementById('hab-legend');
    if (!legend) return;
    const cats = [
      { key:'medical',  label:'Medical',  color:'var(--rose)' },
      { key:'physical', label:'Physical', color:'var(--teal)' },
      { key:'mental',   label:'Mental',   color:'var(--violet)' }
    ];
    legend.innerHTML = cats.map(c => {
      const done = habits[c.key].filter(h => h.s).length;
      const total = habits[c.key].length;
      return `<div style="display:flex;align-items:center;gap:8px">
        <div style="width:8px;height:8px;border-radius:50%;background:${c.color};flex-shrink:0"></div>
        <div style="font-size:12px;color:var(--txt2);flex:1">${c.label}</div>
        <div style="font-size:12px;font-weight:600;color:var(--txt1)">${done}/${total}</div>
      </div>`;
    }).join('');
  }
}