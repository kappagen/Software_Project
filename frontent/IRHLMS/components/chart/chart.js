export class BarChart {
  static DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  static build(containerId, data, color, maxVal) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const max = Math.max(...data);
    el.innerHTML = data.map((v,i) => `
      <div class="bar-col">
        <div class="bar-body" style="height:${(v/maxVal)*100}%;background:${color};opacity:${v===max?1:0.55}" title="${this.DAYS[i]}: ${v}"></div>
        <div class="bar-lbl">${this.DAYS[i]}</div>
      </div>`).join('');
  }
}

export class DonutChart {
  static update(containerId, done, total, color='var(--amber)') {
    const pct = total > 0 ? Math.round((done/total)*100) : 0;
    const el = document.getElementById(containerId);
    if (el) el.style.background = `conic-gradient(${color} ${pct}%, var(--border) 0%)`;
    const valEl = document.getElementById('donut-val');
    if (valEl) valEl.textContent = done;
    const pctBadge = document.getElementById('hab-pct-badge');
    if (pctBadge) pctBadge.textContent = pct + '%';
  }
}