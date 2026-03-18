export class BarChart {
  static DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  static build(containerId, data, color, maxVal) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const values = Array.isArray(data)
      ? data.map((value) => {
          const parsed = Number(value);
          return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
        })
      : [];

    if (!values.length) {
      el.innerHTML = '';
      return;
    }

    const maxData = Math.max(...values);
    const safeScale = Number.isFinite(maxVal) && maxVal > 0 ? maxVal : Math.max(maxData, 1);

    el.innerHTML = values
      .map(
        (value, index) => `
      <div class="bar-col">
        <div class="bar-body" style="height:${Math.max(0, Math.min(100, (value / safeScale) * 100))}%;background:${color};opacity:${value === maxData ? 1 : 0.55}" title="${this.DAYS[index] || `Day ${index + 1}`}: ${value}"></div>
        <div class="bar-lbl">${this.DAYS[index] || `D${index + 1}`}</div>
      </div>`
      )
      .join('');
  }
}

export class DonutChart {
  static update(containerId, done, total, color = 'var(--amber)') {
    const totalCount = Math.max(0, Number(total) || 0);
    const doneCount = Math.max(0, Math.min(totalCount, Number(done) || 0));
    const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    const el = document.getElementById(containerId);
    if (el) el.style.background = `conic-gradient(${color} ${pct}%, var(--border) 0%)`;

    const valEl = document.getElementById('donut-val');
    if (valEl) valEl.textContent = String(doneCount);

    const totalEl = document.getElementById('donut-tot');
    if (totalEl) totalEl.textContent = String(totalCount);

    const pctBadge = document.getElementById('hab-pct-badge');
    if (pctBadge) pctBadge.textContent = `${pct}%`;
  }
}
