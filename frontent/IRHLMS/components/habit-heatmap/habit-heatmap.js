export class HabitHeatmap {
  static render(containerId, model) {
    const root = document.getElementById(containerId);
    if (!root) return;

    const weeks = Array.isArray(model?.weeks) ? model.weeks : [];
    const columns = Array.isArray(model?.columns) ? model.columns : [];
    const data = Array.isArray(model?.data) ? model.data : [];

    const gridCols = `120px repeat(${columns.length}, minmax(48px, 1fr))`;

    const headerCells = [
      '<div class="hh-head">Week</div>',
      ...columns.map((col) => `<div class="hh-head">${this._escape(col)}</div>`)
    ].join('');

    const body = weeks
      .map((week, rowIdx) => {
        const row = Array.isArray(data[rowIdx]) ? data[rowIdx] : [];
        const cells = columns
          .map((_, colIdx) => {
            const done = Boolean(row[colIdx]);
            return `<div class="hh-cell ${done ? 'done' : 'miss'}" title="${done ? 'Completed' : 'Missed'}"></div>`;
          })
          .join('');
        return `<div class="hh-week">${this._escape(week)}</div>${cells}`;
      })
      .join('');

    root.innerHTML = `
      <section class="habit-heatmap">
        <h3 class="hh-title">${this._escape(model?.title || 'Habit Consistency - Last 4 Weeks')}</h3>
        <div class="hh-sub">${this._escape(model?.subtitle || 'Brown = completed, Grey = missed')}</div>
        <div class="hh-wrap">
          <div class="hh-grid" style="grid-template-columns:${gridCols}">
            ${headerCells}
            ${body}
          </div>
        </div>
      </section>
    `;
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
