export const $  = (sel, root=document) => root.querySelector(sel);
export const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
export const el = (tag, attrs={}, ...children) => {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => k === 'style' && typeof v === 'object'
    ? Object.assign(e.style, v) : e.setAttribute(k, v));
  children.forEach(c => e.append(typeof c === 'string' ? document.createTextNode(c) : c));
  return e;
};
export const debounce = (fn, ms=300) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};
export const pad2 = n => String(n).padStart(2, '0');
export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
export const formatDate = (d=new Date()) => d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });