import { Toast } from '../../utilities/toast.js';

const AVATAR_TONES = ['rose', 'blue', 'violet', 'teal', 'amber'];

const therapyState = {
  completedTotal: 14,
  sessions: [
    {
      id: 'session-1',
      title: 'Physiotherapy',
      doctor: 'Dr. Priya Mehta',
      dateLabel: 'Thursday, Mar 12',
      timeLabel: '10:00 AM',
      durationLabel: '45 min',
      goals: 'Progressive weight-bearing exercises, wheelchair transfer practice, and core strengthening assessment.',
      status: 'Confirmed',
      note: 'Transfer confidence improved this week.'
    },
    {
      id: 'session-2',
      title: 'Neurological Check',
      doctor: 'Dr. Anand Kumar',
      dateLabel: 'Friday, Mar 13',
      timeLabel: '03:00 PM',
      durationLabel: '30 min',
      goals: 'Routine neurological assessment and sensation mapping. Bring previous scan reports.',
      status: 'Pending',
      note: ''
    }
  ],
  doctors: [
    {
      id: 'doctor-1',
      name: 'Dr. Priya Mehta',
      specialization: 'Physiotherapist',
      qualification: 'AIIMS trained',
      notes: 'Focus on weekly gait and transfer progression.',
      initials: 'PM',
      tone: 'rose'
    },
    {
      id: 'doctor-2',
      name: 'Dr. Deepak Sharma',
      specialization: 'Spine Rehabilitation Specialist',
      qualification: 'Rehab fellowship, CMC Vellore',
      notes: 'Monthly review for spine stability and pain score.',
      initials: 'DS',
      tone: 'blue'
    },
    {
      id: 'doctor-3',
      name: 'Dr. Anand Kumar',
      specialization: 'Neurologist',
      qualification: 'Consultant neurologist, 15 years practice',
      notes: 'Monitors sensory mapping and reflex changes.',
      initials: 'AK',
      tone: 'violet'
    }
  ]
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const statusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'confirmed') return 'confirmed';
  return 'pending';
};

const buildInitials = (name) =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

const formatSessionDateLabel = (date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

const formatSessionTimeLabel = (time24) => {
  const parts = String(time24 || '').split(':');
  if (parts.length < 2) return '09:00 AM';
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return '09:00 AM';

  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${meridiem}`;
};

const toTimeInputValue = (timeLabel) => {
  const match = String(timeLabel || '').match(/^\s*(\d{1,2}):(\d{2})\s*([AP]M)\s*$/i);
  if (!match) return '09:00';

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return '09:00';

  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const toDateInputValue = (dateLabel) => {
  const cleaned = String(dateLabel || '').replace(/^[A-Za-z]+,\s*/, '').trim();
  const year = new Date().getFullYear();
  const parsed = new Date(`${cleaned} ${year}`);
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
};

export class TherapyPage {
  static _bound = false;
  static _editingNoteSessionId = null;
  static _editingRescheduleSessionId = null;

  static init() {
    this._renderHeaderStats();
    this._renderSessions();
    this._renderCareTeam();

    if (!this._bound) {
      this._bindActions();
      this._bindDoctorForm();
      this._bound = true;
    }
  }

  static _renderHeaderStats() {
    const upcomingEl = document.getElementById('therapy-upcoming-count');
    const completedEl = document.getElementById('therapy-completed-count');
    if (upcomingEl) upcomingEl.textContent = String(therapyState.sessions.length);
    if (completedEl) completedEl.textContent = String(therapyState.completedTotal);
  }

  static _renderSessions() {
    const host = document.getElementById('therapy-sessions-list');
    if (!host) return;

    host.innerHTML = therapyState.sessions
      .map((session) => {
        const isConfirmed = String(session.status).toLowerCase() === 'confirmed';
        const hasNote = Boolean(session.note && session.note.trim());
        const isEditingNote = this._editingNoteSessionId === session.id;
        const isEditingReschedule = this._editingRescheduleSessionId === session.id;
        return `
          <article class="card therapy-session-card" data-session-id="${escapeHtml(session.id)}">
            <div class="therapy-session-head">
              <h3 class="therapy-session-title">${escapeHtml(session.title)} - ${escapeHtml(session.doctor)}</h3>
              <span class="therapy-status ${statusClass(session.status)}">${escapeHtml(session.status)}</span>
            </div>
            <p class="therapy-session-meta">
              <span aria-hidden="true">&#128197;</span>
              ${escapeHtml(session.dateLabel)} | ${escapeHtml(session.timeLabel)} | ${escapeHtml(session.durationLabel)}
            </p>
            <p class="therapy-session-goals">${escapeHtml(session.goals)}</p>
            <div class="therapy-session-note ${hasNote ? 'has-note' : ''}">
              ${hasNote ? `Notes: ${escapeHtml(session.note)}` : 'No notes added yet.'}
            </div>
            ${
              isEditingNote
                ? `
                    <div class="therapy-note-editor">
                      <textarea
                        class="inp"
                        rows="3"
                        data-session-note-input="${escapeHtml(session.id)}"
                        placeholder="Write session notes..."
                        style="resize:none"
                      >${escapeHtml(session.note || '')}</textarea>
                      <div class="therapy-note-actions">
                        <button class="btn btn-sm therapy-note-save" type="button" data-therapy-action="save-note" data-session-id="${escapeHtml(session.id)}">Save Note</button>
                        <button class="btn btn-outline btn-sm" type="button" data-therapy-action="cancel-note" data-session-id="${escapeHtml(session.id)}">Cancel</button>
                      </div>
                    </div>
                  `
                : ''
            }
            ${
              isEditingReschedule
                ? `
                    <div class="therapy-reschedule-editor">
                      <div class="therapy-reschedule-grid">
                        <label class="therapy-reschedule-field">
                          <span class="therapy-reschedule-label">&#128197; Calendar</span>
                          <input
                            class="inp therapy-reschedule-input therapy-date-input"
                            type="date"
                            data-session-reschedule-date="${escapeHtml(session.id)}"
                            value="${escapeHtml(toDateInputValue(session.dateLabel))}"
                          />
                        </label>
                        <label class="therapy-reschedule-field">
                          <span class="therapy-reschedule-label">&#9200; Time</span>
                          <input
                            class="inp therapy-reschedule-input therapy-time-input"
                            type="time"
                            step="900"
                            data-session-reschedule-time="${escapeHtml(session.id)}"
                            value="${escapeHtml(toTimeInputValue(session.timeLabel))}"
                          />
                        </label>
                      </div>
                      <div class="therapy-note-actions">
                        <button class="btn btn-sm therapy-note-save" type="button" data-therapy-action="save-reschedule" data-session-id="${escapeHtml(session.id)}">Save Schedule</button>
                        <button class="btn btn-outline btn-sm" type="button" data-therapy-action="cancel-reschedule" data-session-id="${escapeHtml(session.id)}">Cancel</button>
                      </div>
                    </div>
                  `
                : ''
            }
            <div class="therapy-session-actions">
              <button class="btn btn-outline btn-sm" type="button" data-therapy-action="notes" data-session-id="${escapeHtml(session.id)}">${hasNote ? 'Edit Notes' : 'Add Notes'}</button>
              <button class="btn btn-outline btn-sm therapy-confirm-btn ${isConfirmed ? 'is-confirmed' : ''}" type="button" data-therapy-action="confirm" data-session-id="${escapeHtml(session.id)}" ${isConfirmed ? 'disabled' : ''}>Confirm</button>
              <button class="btn btn-outline btn-sm" type="button" data-therapy-action="reschedule" data-session-id="${escapeHtml(session.id)}">Reschedule</button>
              <button class="btn btn-outline btn-sm therapy-delete-btn" type="button" data-therapy-action="delete-session" data-session-id="${escapeHtml(session.id)}">Delete</button>
            </div>
          </article>
        `;
      })
      .join('');
  }

  static _renderCareTeam() {
    const host = document.getElementById('therapy-care-team-list');
    if (!host) return;

    host.innerHTML = therapyState.doctors
      .map(
        (doctor) => `
          <article class="card therapy-doctor-card">
            <div class="therapy-doctor-main">
              <div class="therapy-avatar tone-${escapeHtml(doctor.tone)}">${escapeHtml(doctor.initials)}</div>
              <div>
                <div class="therapy-doctor-name">${escapeHtml(doctor.name)}</div>
                <div class="therapy-doctor-spec">${escapeHtml(doctor.specialization)}</div>
                <div class="therapy-doctor-qual">${escapeHtml(doctor.qualification)}</div>
                ${doctor.notes ? `<div class="therapy-doctor-note">Notes: ${escapeHtml(doctor.notes)}</div>` : ''}
              </div>
            </div>
            <button class="btn btn-gold btn-sm therapy-book-btn" type="button" data-therapy-action="book" data-doctor-id="${escapeHtml(doctor.id)}">Book</button>
          </article>
        `
      )
      .join('');
  }

  static _bindDoctorForm() {
    const trigger = document.getElementById('therapy-add-doctor-trigger');
    const addBtn = document.getElementById('therapy-add-doctor-btn');
    const cancelBtn = document.getElementById('therapy-cancel-doctor-btn');
    if (!trigger || !addBtn || !cancelBtn) return;

    trigger.addEventListener('click', () => this._toggleDoctorForm(true));
    cancelBtn.addEventListener('click', () => this._toggleDoctorForm(false));
    addBtn.addEventListener('click', () => this._addDoctor());
  }

  static _toggleDoctorForm(show) {
    const card = document.getElementById('therapy-add-doctor-card');
    const trigger = document.getElementById('therapy-add-doctor-trigger');
    if (!card || !trigger) return;

    card.style.display = show ? '' : 'none';
    trigger.style.display = show ? 'none' : '';

    if (!show) this._clearDoctorForm();
  }

  static _clearDoctorForm() {
    ['therapy-doc-name', 'therapy-doc-spec', 'therapy-doc-qual', 'therapy-doc-initials', 'therapy-doc-notes'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  static _addDoctor() {
    const name = document.getElementById('therapy-doc-name')?.value.trim() || '';
    const specialization = document.getElementById('therapy-doc-spec')?.value.trim() || '';
    const qualification = document.getElementById('therapy-doc-qual')?.value.trim() || '';
    const notes = document.getElementById('therapy-doc-notes')?.value.trim() || '';
    const rawInitials =
      (document.getElementById('therapy-doc-initials')?.value || '')
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 3);

    if (!name || !specialization || !qualification) {
      Toast.warning('Please fill doctor name, specialization, and qualification.');
      return;
    }

    const initials = rawInitials || buildInitials(name) || 'DR';
    const tone = AVATAR_TONES[therapyState.doctors.length % AVATAR_TONES.length];

    therapyState.doctors.unshift({
      id: `doctor-${Date.now()}`,
      name,
      specialization,
      qualification,
      notes,
      initials,
      tone
    });

    this._renderCareTeam();
    this._toggleDoctorForm(false);
    Toast.success(`${name} added to Doctor Info.`);
  }

  static _buildUpcomingSessionFromDoctor(doctor) {
    const timeSlots = ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'];
    const sessionsAhead = therapyState.sessions.length + 1;
    const date = new Date();
    date.setDate(date.getDate() + sessionsAhead);

    const specialization = doctor.specialization || 'Therapy Consultation';
    const durationLabel = specialization.toLowerCase().includes('physio') ? '45 min' : '30 min';

    return {
      id: `session-${Date.now()}`,
      title: specialization,
      doctor: doctor.name,
      dateLabel: formatSessionDateLabel(date),
      timeLabel: timeSlots[sessionsAhead % timeSlots.length],
      durationLabel,
      goals: `Booked from Doctor Info. ${doctor.qualification || 'Therapy coordination follow-up.'}`,
      status: 'Pending',
      note: ''
    };
  }

  static _bindActions() {
    document.getElementById('page-therapy')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-therapy-action]');
      if (!button) return;

      const action = button.getAttribute('data-therapy-action');
      if (action === 'book') {
        const doctor = therapyState.doctors.find((entry) => entry.id === button.getAttribute('data-doctor-id'));
        if (!doctor) return;

        const newSession = this._buildUpcomingSessionFromDoctor(doctor);
        therapyState.sessions.unshift(newSession);
        this._editingNoteSessionId = null;
        this._editingRescheduleSessionId = null;
        this._renderHeaderStats();
        this._renderSessions();
        Toast.success(`${doctor.name} booked and added to Upcoming Sessions.`);
        return;
      }

      const sessionId = button.getAttribute('data-session-id');
      const session = therapyState.sessions.find((entry) => entry.id === sessionId);
      if (!session) return;

      if (action === 'notes') {
        this._editingNoteSessionId = session.id;
        this._editingRescheduleSessionId = null;
        this._renderSessions();
        const input = document.querySelector(`[data-session-note-input="${session.id}"]`);
        if (input) input.focus();
        return;
      }

      if (action === 'cancel-note') {
        this._editingNoteSessionId = null;
        this._renderSessions();
        return;
      }

      if (action === 'save-note') {
        const noteInput = document.querySelector(`[data-session-note-input="${session.id}"]`);
        session.note = noteInput ? noteInput.value.trim() : '';
        this._editingNoteSessionId = null;
        this._renderSessions();
        Toast.success(`Notes updated for ${session.title}.`);
        return;
      }

      if (action === 'reschedule') {
        this._editingRescheduleSessionId = session.id;
        this._editingNoteSessionId = null;
        this._renderSessions();
        const dateInput = document.querySelector(`[data-session-reschedule-date="${session.id}"]`);
        if (dateInput) dateInput.focus();
        return;
      }

      if (action === 'cancel-reschedule') {
        this._editingRescheduleSessionId = null;
        this._renderSessions();
        return;
      }

      if (action === 'save-reschedule') {
        const dateInput = document.querySelector(`[data-session-reschedule-date="${session.id}"]`);
        const timeInput = document.querySelector(`[data-session-reschedule-time="${session.id}"]`);

        const dateValue = dateInput ? dateInput.value : '';
        const timeValue = timeInput ? timeInput.value : '';

        if (!dateValue || !timeValue) {
          Toast.warning('Please select date and time.');
          return;
        }

        const date = new Date(`${dateValue}T00:00:00`);
        if (Number.isNaN(date.getTime())) {
          Toast.warning('Invalid date selected.');
          return;
        }

        session.dateLabel = formatSessionDateLabel(date);
        session.timeLabel = formatSessionTimeLabel(timeValue);
        session.status = 'Pending';
        this._editingRescheduleSessionId = null;
        this._renderSessions();
        Toast.success(`${session.title} rescheduled.`);
        return;
      }

      if (action === 'delete-session') {
        therapyState.sessions = therapyState.sessions.filter((entry) => entry.id !== session.id);
        if (this._editingNoteSessionId === session.id) {
          this._editingNoteSessionId = null;
        }
        if (this._editingRescheduleSessionId === session.id) {
          this._editingRescheduleSessionId = null;
        }
        this._renderHeaderStats();
        this._renderSessions();
        Toast.info(`${session.title} removed from upcoming sessions.`);
        return;
      }

      if (action === 'confirm') {
        session.status = 'Confirmed';
        this._renderSessions();
        Toast.success(`${session.title} confirmed.`);
      }
    });
  }
}
