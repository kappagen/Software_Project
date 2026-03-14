import { Pomodoro } from '../../components/pomodoro/pomodoro.js';
import { Modal } from '../../components/modal/modal.js';
import { Toast } from '../../utilities/toast.js';

let coursesStore = null;

const GRADE_POINTS = {
  'A+': 10,
  A: 9,
  'B+': 8,
  B: 7,
  'C+': 6,
  C: 5,
  D: 4,
  F: 0,
  NA: 0
};

const STATUS_STYLE = {
  Active: { iconClass: 'violet', statusClass: 'active', barClass: 'active' },
  'In Progress': { iconClass: 'orange', statusClass: 'progress', barClass: 'progress' },
  'Near Complete': { iconClass: 'green', statusClass: 'complete', barClass: 'complete' },
  Completed: { iconClass: 'neutral', statusClass: 'done', barClass: 'done' }
};

const DEFAULT_COURSE = {
  title: 'Untitled Course',
  code: 'GEN0000',
  professor: 'TBA',
  credits: 0,
  year: 'B.Tech',
  progress: 0,
  grade: 'B',
  attendance: 0,
  status: 'Active',
  tags: ['Next Topic'],
  icon: 'C'
};

const DEFAULT_ASSIGNMENT = {
  title: 'Untitled Assignment',
  courseCode: 'GEN0000',
  dueDate: '',
  completed: false,
  createdAt: '',
  completedAt: null
};

const clampPercent = (value, fallback = 0) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const normalizeStatus = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'active') return 'Active';
  if (raw === 'in progress' || raw === 'inprogress') return 'In Progress';
  if (raw === 'near complete' || raw === 'nearcomplete') return 'Near Complete';
  if (raw === 'completed' || raw === 'complete') return 'Completed';
  return 'Active';
};

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 4);
  }
  if (typeof tags === 'string') {
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 4);
  }
  return [];
};

const toCourseId = (course, index = 0) => {
  if (course?.id !== undefined && course?.id !== null && String(course.id).trim() !== '') {
    return String(course.id);
  }
  const seed = String(course?.code || course?.title || `course-${index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return seed || `course-${index + 1}`;
};

const normalizeCourse = (course, index = 0) => {
  const tags = normalizeTags(course?.tags);
  return {
    id: toCourseId(course, index),
    title: String(course?.title || course?.name || DEFAULT_COURSE.title),
    code: String(course?.code || DEFAULT_COURSE.code),
    professor: String(course?.professor || course?.prof || DEFAULT_COURSE.professor),
    credits: Math.max(0, Number(course?.credits || DEFAULT_COURSE.credits) || 0),
    year: String(course?.year || DEFAULT_COURSE.year),
    progress: clampPercent(course?.progress, DEFAULT_COURSE.progress),
    grade: String(course?.grade || DEFAULT_COURSE.grade).toUpperCase(),
    attendance: clampPercent(course?.attendance, DEFAULT_COURSE.attendance),
    status: normalizeStatus(course?.status),
    tags: tags.length ? tags : [...DEFAULT_COURSE.tags],
    icon: String(course?.icon || DEFAULT_COURSE.icon)
  };
};

const normalizeAssignment = (assignment, index = 0) => {
  const id = assignment?.id ? String(assignment.id) : `asg-${Date.now()}-${index}`;
  const createdAt = assignment?.createdAt || new Date().toISOString();
  const completed = Boolean(assignment?.completed);
  return {
    id,
    title: String(assignment?.title || DEFAULT_ASSIGNMENT.title),
    courseCode: String(assignment?.courseCode || DEFAULT_ASSIGNMENT.courseCode).toUpperCase(),
    dueDate: String(assignment?.dueDate || DEFAULT_ASSIGNMENT.dueDate),
    completed,
    createdAt,
    completedAt: completed ? (assignment?.completedAt || new Date().toISOString()) : null
  };
};

const getCourses = () => {
  if (!coursesStore) return [];
  const raw = coursesStore.get('courses');
  if (!Array.isArray(raw)) return [];
  return raw.map((course, index) => normalizeCourse(course, index));
};

const getCourseById = (courseId) => {
  const id = String(courseId);
  return getCourses().find((course) => course.id === id) || null;
};

const getAssignments = () => {
  if (!coursesStore) return [];
  const raw = coursesStore.get('assignments');
  if (!Array.isArray(raw)) return [];
  return raw.map((assignment, index) => normalizeAssignment(assignment, index));
};

const getAssignmentActivity = () => {
  if (!coursesStore) return [];
  const raw = coursesStore.get('assignmentActivity');
  if (!Array.isArray(raw)) return [];
  return raw.map((entry, index) => ({
    id: String(entry?.id || `act-${index}`),
    message: String(entry?.message || ''),
    at: String(entry?.at || new Date().toISOString())
  }));
};

const gradeToPoint = (grade) => {
  const normalized = String(grade || '').toUpperCase();
  return GRADE_POINTS[normalized] ?? 0;
};

const statusStyle = (status) => STATUS_STYLE[normalizeStatus(status)] || STATUS_STYLE.Active;

const summarizeCourses = (courses, assignments) => {
  const activeCount = courses.filter((course) => course.status !== 'Completed').length;
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const pendingTasks = assignments.filter((assignment) => !assignment.completed).length;
  const avgGpa = courses.length
    ? (courses.reduce((sum, course) => sum + gradeToPoint(course.grade), 0) / courses.length).toFixed(1)
    : '0.0';
  return { activeCount, totalCredits, pendingTasks, avgGpa };
};

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
};

const formatShortDate = (dateString) => {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'No due date';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const pushAssignmentActivity = (message) => {
  if (!coursesStore) return;
  const entry = {
    id: `act-${Date.now()}`,
    message,
    at: new Date().toISOString()
  };
  coursesStore.update('assignmentActivity', (logs = []) => [entry, ...logs].slice(0, 20));
};

const renderAssignments = () => {
  const list = document.getElementById('learning-assignment-list');
  const activityWrap = document.getElementById('learning-assignment-activity');
  if (!list || !activityWrap) return;

  const assignments = getAssignments();
  const activity = getAssignmentActivity();

  if (!assignments.length) {
    list.innerHTML = '<div style="padding:16px;text-align:center;color:var(--txt3);font-size:12px">No assignments yet. Add your first one.</div>';
  } else {
    list.innerHTML = assignments
      .map((assignment) => `
        <div class="assignment-item ${assignment.completed ? 'done' : ''}">
          <input class="assignment-check" type="checkbox" data-asg-check="${escapeHtml(assignment.id)}" ${assignment.completed ? 'checked' : ''} />
          <div class="assignment-main">
            <div class="assignment-title">${escapeHtml(assignment.title)}</div>
            <div class="assignment-meta">${escapeHtml(assignment.courseCode)} | Due: ${escapeHtml(formatShortDate(assignment.dueDate))}</div>
          </div>
          <span class="assignment-chip ${assignment.completed ? 'done' : ''}">${assignment.completed ? 'Completed' : 'Pending'}</span>
        </div>
      `)
      .join('');
  }

  if (!activity.length) {
    activityWrap.innerHTML = '<div style="padding:8px;color:var(--txt3);font-size:12px">No activity yet.</div>';
  } else {
    activityWrap.innerHTML = activity
      .map((entry) => `
        <div class="assignment-activity-item">
          <div class="assignment-activity-msg">${escapeHtml(entry.message)}</div>
          <div class="assignment-activity-time">${escapeHtml(formatDateTime(entry.at))}</div>
        </div>
      `)
      .join('');
  }
};

const renderManageList = (courses) => {
  const list = document.getElementById('mc-list');
  if (!list) return;

  if (!courses.length) {
    list.innerHTML = '<div style="padding:20px;color:var(--txt3);font-size:13px">No courses added yet.</div>';
    return;
  }

  list.innerHTML = courses
    .map(
      (course) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid var(--border)">
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--txt1)">${escapeHtml(course.code)} - ${escapeHtml(course.title)}</div>
            <div style="font-size:11px;color:var(--txt3)">${escapeHtml(course.professor)} - ${course.credits} credits${course.status === 'In Progress' ? '' : ` - ${escapeHtml(course.grade)}`}</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-outline btn-sm" data-edit-course="${escapeHtml(course.id)}" style="color:var(--violet);border-color:var(--violet)">Edit</button>
            <button class="btn btn-outline btn-sm" data-remove-course="${escapeHtml(course.id)}" style="color:var(--violet);border-color:var(--violet)">Remove</button>
          </div>
        </div>
      `
    )
    .join('');
};

const courseCardTemplate = (course) => {
  const styles = statusStyle(course.status);
  const showGrade = course.status !== 'In Progress';
  const showAttendance = course.status === 'Completed';
  const gradeClass = showGrade ? 'good' : '';
  const gradeValue = showGrade ? escapeHtml(course.grade) : 'NA';
  const attendanceValue = showAttendance ? `${course.attendance}%` : 'NA';

  return `
    <article class="card course-card" data-course-id="${escapeHtml(course.id)}">
      <div class="course-card-head">
        <div class="course-icon ${styles.iconClass}">${escapeHtml(course.icon)}</div>
        <span class="course-status ${styles.statusClass}">${escapeHtml(course.status)}</span>
      </div>
      <div class="course-card-body">
        <h3 class="course-title">${escapeHtml(course.title)}</h3>
        <div class="course-meta">
          ${escapeHtml(course.code)} - ${escapeHtml(course.professor)}<br>
          ${course.credits} Credits - ${escapeHtml(course.year)}
        </div>
        <div>
          <div class="course-progress-label">
            <span>Course Progress</span>
            <span class="course-progress-val">${course.progress}%</span>
          </div>
          <div class="course-progress-track">
            <div class="course-progress-fill ${styles.barClass}" style="width:${course.progress}%"></div>
          </div>
        </div>
        <div class="course-metrics">
          <div class="course-metric">
            <div class="course-metric-label">Current Grade</div>
            <div class="course-metric-value ${gradeClass}">${gradeValue}</div>
          </div>
          <div class="course-metric">
            <div class="course-metric-label">Attendance</div>
            <div class="course-metric-value">${attendanceValue}</div>
          </div>
        </div>
        <div class="course-tags">
          ${course.tags.map((tag) => `<span class="course-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="course-actions">
          <button class="course-remove" data-remove-card="${escapeHtml(course.id)}">Remove Course</button>
        </div>
      </div>
    </article>
  `;
};

export function renderCourses() {
  const container = document.getElementById('coursesContainer');
  if (!container || !coursesStore) return;

  const courses = getCourses();
  const assignments = getAssignments();
  const summary = summarizeCourses(courses, assignments);

  setText('courses-active-count', summary.activeCount);
  setText('courses-avg-gpa', summary.avgGpa);
  setText('courses-pending-tasks', summary.pendingTasks);
  setText('courses-total-credits', summary.totalCredits);

  setText('learning-meta-active', summary.activeCount);
  setText('learning-meta-pending', summary.pendingTasks);
  setText('learning-meta-gpa', summary.avgGpa);

  container.innerHTML = courses.length
    ? courses.map((course) => courseCardTemplate(course)).join('')
    : '<div class="card card-pad" style="grid-column:1/-1;text-align:center;color:var(--txt3)">No courses available. Add one from Manage Courses.</div>';

  renderManageList(courses);
  renderAssignments();
}

export function addCourse(courseObject) {
  if (!coursesStore) return null;
  const id = courseObject?.id ?? `course-${Date.now()}`;
  const nextCourse = normalizeCourse({ ...courseObject, id });
  coursesStore.update('courses', (courses = []) => [...courses, nextCourse]);
  renderCourses();
  return nextCourse;
}

export function updateCourse(courseId, courseObject) {
  if (!coursesStore) return null;
  const id = String(courseId);
  let updatedCourse = null;

  coursesStore.update('courses', (courses = []) =>
    courses.map((course, index) => {
      const normalized = normalizeCourse(course, index);
      if (normalized.id !== id) return normalized;
      updatedCourse = normalizeCourse({ ...normalized, ...courseObject, id });
      return updatedCourse;
    })
  );

  renderCourses();
  return updatedCourse;
}

export function removeCourse(courseId) {
  if (!coursesStore) return;
  const id = String(courseId);
  coursesStore.update('courses', (courses = []) =>
    courses.filter((course, index) => normalizeCourse(course, index).id !== id)
  );
  renderCourses();
}

export function addAssignment(assignmentObject) {
  if (!coursesStore) return null;
  const next = normalizeAssignment({
    ...assignmentObject,
    id: assignmentObject?.id || `asg-${Date.now()}`,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null
  });
  coursesStore.update('assignments', (assignments = []) => [next, ...assignments]);
  pushAssignmentActivity(`Added assignment: ${next.title}`);
  renderCourses();
  return next;
}

export function toggleAssignmentComplete(assignmentId, completed) {
  if (!coursesStore) return;
  const id = String(assignmentId);
  const now = new Date().toISOString();
  let changedTitle = 'Assignment';

  coursesStore.update('assignments', (assignments = []) =>
    assignments.map((assignment, index) => {
      const normalized = normalizeAssignment(assignment, index);
      if (normalized.id !== id) return normalized;
      changedTitle = normalized.title;
      return {
        ...normalized,
        completed,
        completedAt: completed ? now : null
      };
    })
  );

  pushAssignmentActivity(`${completed ? 'Completed' : 'Reopened'} assignment: ${changedTitle}`);
  renderCourses();
}

export class LearningPage {
  static _pomo = null;
  static _tabsBound = false;
  static _formBound = false;
  static _listBound = false;
  static _cardsBound = false;
  static _storeBound = false;
  static _rulesBound = false;
  static _assignmentBound = false;
  static _editingCourseId = null;

  static init(store) {
    coursesStore = store;
    this._upgradeLearningState();
    this._bindTabs();
    this._bindCourseForm();
    this._bindStatusDrivenFields();
    this._bindManageListEvents();
    this._bindCourseCardEvents();
    this._bindAssignmentManager();
    this._bindStoreUpdates();
    renderCourses();

    if (!this._pomo) {
      this._pomo = new Pomodoro({
        onComplete: ({ sessions, label }) => {
          Toast.success(`${label} session complete! (${sessions} today)`);
          this._logStudySession(label);
        }
      });
      this._pomo.init();
    }
  }

  static _upgradeLearningState() {
    if (!coursesStore) return;

    coursesStore.update('courses', (courses = []) => {
      if (!Array.isArray(courses)) return [];
      return courses.map((course, index) => normalizeCourse(course, index));
    });

    coursesStore.update('assignments', (assignments = []) => {
      if (!Array.isArray(assignments)) return [];
      return assignments.map((assignment, index) => normalizeAssignment(assignment, index));
    });

    coursesStore.update('assignmentActivity', (logs = []) => (Array.isArray(logs) ? logs : []));
  }

  static _bindStoreUpdates() {
    if (this._storeBound || !coursesStore) return;
    coursesStore.subscribe('courses', () => renderCourses());
    coursesStore.subscribe('assignments', () => renderCourses());
    coursesStore.subscribe('assignmentActivity', () => renderAssignments());
    this._storeBound = true;
  }

  static _bindTabs() {
    if (this._tabsBound) return;
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((tab) => tab.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        ['tab-courses', 'tab-manage', 'tab-assignments', 'tab-timer'].forEach((id) => {
          const panel = document.getElementById(id);
          if (panel) panel.style.display = id === tabId ? '' : 'none';
        });
      });
    });
    this._tabsBound = true;
  }

  static _bindCourseForm() {
    if (this._formBound) return;
    const addBtn = document.getElementById('add-course-btn');
    const cancelBtn = document.getElementById('cancel-edit-course-btn');
    if (!addBtn || !cancelBtn) return;

    addBtn.addEventListener('click', () => {
      const code = document.getElementById('mc-code')?.value.trim();
      const title = document.getElementById('mc-name')?.value.trim();
      const professor = document.getElementById('mc-prof')?.value.trim();
      const credits = Number(document.getElementById('mc-cred')?.value || 3);
      const year = document.getElementById('mc-year')?.value.trim();
      const icon = document.getElementById('mc-icon')?.value.trim();
      const progress = Number(document.getElementById('mc-progress')?.value || 0);
      const attendanceInput = Number(document.getElementById('mc-attendance')?.value || 0);
      const status = document.getElementById('mc-status')?.value;
      const normalizedStatus = normalizeStatus(status);
      const gradeInput = document.getElementById('mc-grade')?.value;
      const tagsInput = document.getElementById('mc-tags')?.value || '';
      const tags = normalizeTags(tagsInput);
      const grade = normalizedStatus === 'In Progress' ? 'NA' : (gradeInput || 'A');
      const attendance = normalizedStatus === 'Completed' ? attendanceInput : 0;

      if (!code || !title) {
        Toast.warning('Course code and title are required.');
        return;
      }

      const payload = {
        title,
        code,
        professor,
        credits,
        year,
        progress,
        grade,
        attendance,
        status,
        tags,
        icon
      };

      if (this._editingCourseId) {
        updateCourse(this._editingCourseId, payload);
        Toast.success('Course updated.');
      } else {
        addCourse(payload);
        Toast.success('Course added.');
      }

      this._clearCourseForm();
    });

    cancelBtn.addEventListener('click', () => {
      this._clearCourseForm();
      Toast.info('Edit cancelled.');
    });

    this._formBound = true;
  }

  static _setCourseFormMode(editing) {
    const addBtn = document.getElementById('add-course-btn');
    const cancelBtn = document.getElementById('cancel-edit-course-btn');
    if (addBtn) addBtn.textContent = editing ? 'Update Course' : '+ Add Course';
    if (cancelBtn) cancelBtn.style.display = editing ? '' : 'none';
  }

  static _applyCourseStatusRules() {
    const statusEl = document.getElementById('mc-status');
    const gradeWrap = document.getElementById('mc-grade-wrap');
    const gradeEl = document.getElementById('mc-grade');
    const attendanceWrap = document.getElementById('mc-attendance-wrap');
    const attendanceEl = document.getElementById('mc-attendance');
    if (!statusEl || !gradeWrap || !gradeEl || !attendanceWrap || !attendanceEl) return;

    const status = normalizeStatus(statusEl.value);
    const allowGrade = status !== 'In Progress';
    const allowAttendance = status === 'Completed';

    gradeWrap.style.display = allowGrade ? '' : 'none';
    gradeEl.disabled = !allowGrade;
    if (!allowGrade) gradeEl.value = 'A';

    attendanceWrap.style.display = allowAttendance ? '' : 'none';
    attendanceEl.disabled = !allowAttendance;
    if (!allowAttendance) attendanceEl.value = '';
  }

  static _fillCourseForm(course) {
    const setValue = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    };

    setValue('mc-code', course.code);
    setValue('mc-name', course.title);
    setValue('mc-prof', course.professor);
    setValue('mc-cred', String(course.credits));
    setValue('mc-year', course.year);
    setValue('mc-icon', course.icon);
    setValue('mc-progress', String(course.progress));
    setValue('mc-attendance', String(course.attendance));
    setValue('mc-status', course.status);
    setValue('mc-grade', course.grade === 'NA' ? 'A' : course.grade);
    setValue('mc-tags', course.tags.join(', '));

    this._editingCourseId = course.id;
    this._applyCourseStatusRules();
    this._setCourseFormMode(true);
  }

  static _clearCourseForm() {
    ['mc-code', 'mc-name', 'mc-prof', 'mc-cred', 'mc-year', 'mc-icon', 'mc-progress', 'mc-attendance', 'mc-tags'].forEach((id) => {
      const field = document.getElementById(id);
      if (field) field.value = '';
    });

    const statusEl = document.getElementById('mc-status');
    const gradeEl = document.getElementById('mc-grade');
    if (statusEl) statusEl.value = 'Active';
    if (gradeEl) gradeEl.value = 'A+';

    this._editingCourseId = null;
    this._applyCourseStatusRules();
    this._setCourseFormMode(false);
  }

  static _bindStatusDrivenFields() {
    if (this._rulesBound) return;
    const statusEl = document.getElementById('mc-status');
    if (!statusEl) return;

    statusEl.addEventListener('change', () => this._applyCourseStatusRules());
    this._applyCourseStatusRules();
    this._setCourseFormMode(false);
    this._rulesBound = true;
  }

  static _bindManageListEvents() {
    if (this._listBound) return;
    const list = document.getElementById('mc-list');
    if (!list) return;

    list.addEventListener('click', (event) => {
      const editBtn = event.target.closest('[data-edit-course]');
      if (editBtn) {
        const courseId = editBtn.getAttribute('data-edit-course');
        const course = getCourseById(courseId);
        if (!course) {
          Toast.error('Course not found.');
          return;
        }
        this._fillCourseForm(course);
        Toast.info(`Editing ${course.code}.`);
        return;
      }

      const removeBtn = event.target.closest('[data-remove-course]');
      if (!removeBtn) return;
      const courseId = removeBtn.getAttribute('data-remove-course');

      Modal.open({
        title: 'Remove Course',
        body: 'Do you want to remove this course?',
        confirmLabel: 'Remove',
        onConfirm: () => {
          removeCourse(courseId);
          if (this._editingCourseId === String(courseId)) {
            this._clearCourseForm();
          }
          Toast.info('Course removed.');
        }
      });
    });

    this._listBound = true;
  }

  static _bindCourseCardEvents() {
    if (this._cardsBound) return;
    const container = document.getElementById('coursesContainer');
    if (!container) return;

    container.addEventListener('click', (event) => {
      const removeBtn = event.target.closest('[data-remove-card]');
      if (!removeBtn) return;
      const courseId = removeBtn.getAttribute('data-remove-card');

      Modal.open({
        title: 'Remove Course',
        body: 'Do you want to remove this course?',
        confirmLabel: 'Remove',
        onConfirm: () => {
          removeCourse(courseId);
          if (this._editingCourseId === String(courseId)) {
            this._clearCourseForm();
          }
          Toast.info('Course removed.');
        }
      });
    });

    this._cardsBound = true;
  }

  static _bindAssignmentManager() {
    if (this._assignmentBound) return;

    const addBtn = document.getElementById('add-assignment-btn');
    const titleEl = document.getElementById('asg-title');
    const courseEl = document.getElementById('asg-course');
    const dueEl = document.getElementById('asg-due');
    const list = document.getElementById('learning-assignment-list');
    if (!addBtn || !titleEl || !courseEl || !dueEl || !list) return;

    addBtn.addEventListener('click', () => {
      const title = titleEl.value.trim();
      const courseCode = courseEl.value.trim().toUpperCase();
      const dueDate = dueEl.value;

      if (!title) {
        Toast.warning('Assignment title is required.');
        return;
      }

      addAssignment({
        title,
        courseCode: courseCode || 'GEN0000',
        dueDate
      });

      titleEl.value = '';
      courseEl.value = '';
      dueEl.value = '';
      Toast.success('Assignment added.');
    });

    list.addEventListener('change', (event) => {
      const checkbox = event.target.closest('[data-asg-check]');
      if (!checkbox) return;
      const assignmentId = checkbox.getAttribute('data-asg-check');
      toggleAssignmentComplete(assignmentId, checkbox.checked);
    });

    this._assignmentBound = true;
  }

  static _logStudySession(label) {
    const log = document.getElementById('study-log');
    if (!log) return;
    const placeholder = log.querySelector('[style*="No sessions"]');
    if (placeholder) placeholder.remove();

    const entry = document.createElement('div');
    entry.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--violet-lt);border-radius:10px;font-size:12px';
    entry.innerHTML = `<span style="color:var(--txt1)">Study: ${escapeHtml(label)}</span><span style="color:var(--txt3)">${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>`;
    log.prepend(entry);
  }
}

if (typeof window !== 'undefined') {
  window.renderCourses = renderCourses;
  window.addCourse = addCourse;
  window.updateCourse = updateCourse;
  window.removeCourse = removeCourse;
  window.addAssignment = addAssignment;
  window.toggleAssignmentComplete = toggleAssignmentComplete;
}
