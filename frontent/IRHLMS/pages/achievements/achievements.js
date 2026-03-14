export class AchievementsPage {
  static BADGES = [
    { id:'first_login',   emoji:'🌱', label:'First Steps',       desc:'Logged in for the first time',   pts:50,  unlocked:true  },
    { id:'streak_7',      emoji:'🔥', label:'Week Warrior',      desc:'7-day habit streak',              pts:100, unlocked:true  },
    { id:'streak_21',     emoji:'⚡', label:'21-Day Legend',     desc:'21-day habit streak',             pts:200, unlocked:true  },
    { id:'physio_10',     emoji:'💪', label:'Physio Pro',        desc:'Completed 10 physio sessions',    pts:150, unlocked:true  },
    { id:'course_add',    emoji:'📚', label:'Scholar',           desc:'Added first course',              pts:75,  unlocked:true  },
    { id:'record_upload', emoji:'🗂', label:'Organised',         desc:'Uploaded a medical record',       pts:50,  unlocked:false },
    { id:'streak_30',     emoji:'🏆', label:'30-Day Champion',   desc:'Reach a 30-day streak',           pts:300, unlocked:false },
    { id:'physio_50',     emoji:'🦾', label:'Recovery Master',   desc:'Complete 50 physio sessions',     pts:500, unlocked:false },
  ];
  static init(store) {
    const unlockedPts = this.BADGES.filter(b => b.unlocked).reduce((s,b) => s+b.pts, 0);
    this._renderLevel(unlockedPts);
    this._renderBadges();
  }
  static _renderLevel(pts) {
    const level = Math.floor(pts / 200) + 1;
    const next  = level * 200;
    const pct   = Math.min((pts % 200) / 200 * 100, 100);
    const levelEl = document.getElementById('ach-level');
    const ptsEl   = document.getElementById('ach-pts');
    const barEl   = document.getElementById('ach-bar');
    const capEl   = document.getElementById('ach-cap');
    if (levelEl) levelEl.textContent = `Level ${level}`;
    if (ptsEl)   ptsEl.textContent   = `${pts} total points`;
    if (barEl)   barEl.style.width   = pct + '%';
    if (capEl)   capEl.textContent   = `${next - pts} pts to Level ${level + 1}`;
  }
  static _renderBadges() {
    const wrap = document.getElementById('badges-wrap');
    if (!wrap) return;
    const locked = this.BADGES.filter(b => !b.unlocked).length;
    const cntEl = document.getElementById('locked-cnt');
    if (cntEl) cntEl.textContent = locked;
    wrap.innerHTML = this.BADGES.map(b => `
      <div style="display:flex;align-items:center;gap:14px;padding:16px 20px;background:var(--surface);border:1px solid ${b.unlocked?'var(--gold)':'var(--border)'};border-radius:14px;opacity:${b.unlocked?1:0.45}">
        <div style="width:46px;height:46px;border-radius:13px;background:${b.unlocked?'var(--gold-pale)':'var(--surface2)'};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${b.emoji}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:600;color:var(--txt1)">${b.label}</div>
          <div style="font-size:11px;color:var(--txt3);margin-top:2px">${b.desc}</div>
        </div>
        <span class="badge ${b.unlocked?'badge-gold':''}">+${b.pts}</span>
      </div>`).join('');
  }
}