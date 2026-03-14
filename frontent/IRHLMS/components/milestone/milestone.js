export class MilestoneTracker {
  static render(containerId, milestones = []) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = milestones.map(m => `
      <div class="milestone-item">
        <div class="milestone-dot ${m.status}"></div>
        <div class="milestone-txt">${m.label}</div>
        <div class="milestone-date">${m.date}</div>
      </div>`).join('');
  }
}