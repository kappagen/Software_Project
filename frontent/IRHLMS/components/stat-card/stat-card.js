export class Store {
  constructor(initialState = {}) {
    this._state = structuredClone(initialState);
    this._listeners = {};
  }
  get(key) { return this._state[key]; }
  set(key, value) {
    this._state[key] = value;
    this._emit(key, value);
  }
  update(key, fn) { this.set(key, fn(structuredClone(this._state[key]))); }
  subscribe(key, fn) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
    return () => { this._listeners[key] = this._listeners[key].filter(f => f !== fn); };
  }
  _emit(key, value) { (this._listeners[key] || []).forEach(fn => fn(value)); }
}

export const store = new Store({
  habits: {
    medical:  [{ t:'Take Baclofen 10mg', d:'Morning with food', s:false },
               { t:'Vitamin D supplement', d:'2000 IU after breakfast', s:false },
               { t:'Blood pressure check', d:'Log morning reading', s:false }],
    physical: [{ t:'Morning stretching', d:'15 min ROM exercises', s:false },
               { t:'Resistance band exercises', d:'3 sets upper body', s:false },
               { t:'Wheelchair mobility practice', d:'30 min indoor route', s:false }],
    mental:   [{ t:'Study session (DSA)', d:'Pomodoro × 4', s:false },
               { t:'Read NPTEL materials', d:'30 min minimum', s:false },
               { t:'Mindfulness / breathing', d:'10 min guided session', s:false }]
  },
  courses: [
    { code:'CSL2060', name:'Software Engineering',      prof:'Dr. R. Sharma',   credits:4, status:'Active',       grade:'A+' },
    { code:'CSL2030', name:'Data Structures & Algo',    prof:'Dr. P. Agarwal',  credits:4, status:'In Progress',  grade:'A' },
    { code:'MAL2010', name:'Probability & Statistics',  prof:'Dr. K. Mehta',    credits:3, status:'Near Complete', grade:'B+' }
  ],
  medicalRecords: [
    { id:1, name:'MRI Report — L2 Vertebrae',     type:'pdf', date:'2025-12-10' },
    { id:2, name:'X-Ray Post Surgery',            type:'img', date:'2025-12-18' },
    { id:3, name:'Physiotherapy Prescription',    type:'doc', date:'2026-01-05' },
    { id:4, name:'Discharge Summary',             type:'pdf', date:'2025-12-20' }
  ],
  theme: 'light',
  feedback: { rating: 0, submissions: [] }
});