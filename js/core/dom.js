// 小工具：建立元素、等待、舞台縮放、彩紙。
import { STAGE_H } from '../config.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
export function div(cls = '', html = '') {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  if (html) d.innerHTML = html;
  return d;
}
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ---- 舞台：高度固定 900，寬度跟著螢幕比例（iPad 橫放約 1270～1300），不留黑邊 ----
let stageEl = null;
let scale = 1;
let width = 1200;
const fitHooks = [];
export function setupStage(el) {
  stageEl = el;
  const fit = () => {
    const W = window.innerWidth, H = window.innerHeight;
    if (W / H >= 1200 / STAGE_H) { scale = H / STAGE_H; width = Math.round(W / scale); }
    else { scale = W / 1200; width = 1200; }
    el.style.width = `${width}px`;
    el.style.transform = `translate(-50%, -50%) scale(${scale})`;
    document.documentElement.style.setProperty('--sw', `${width}px`);
    fitHooks.forEach((f) => f());
  };
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', () => setTimeout(fit, 300));
  fit();
}
export function stage() { return stageEl; }
export function stageW() { return width; }
export function stageScale() { return scale; }
export function onFit(fn) { fitHooks.push(fn); return () => fitHooks.splice(fitHooks.indexOf(fn), 1); }
// 螢幕座標 → 舞台座標
export function toStage(cx, cy) {
  const r = stageEl.getBoundingClientRect();
  return { x: (cx - r.left) / scale, y: (cy - r.top) / scale };
}
// 元素在舞台上的位置（中心點與大小）
export function stageRect(el) {
  const r = el.getBoundingClientRect();
  const a = toStage(r.left, r.top), b = toStage(r.right, r.bottom);
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, w: b.x - a.x, h: b.y - a.y, left: a.x, top: a.y };
}

// ---- 彩紙／星星爆開（畫在舞台的最上層） ----
const CONF = ['#ff5d8f', '#ffd23f', '#3ec7e0', '#7ee06a', '#a98bff', '#ff9f43'];
export function burst(x, y, { n = 18, colors = CONF, spread = 160, stars = false } = {}) {
  if (!stageEl) return;
  const box = div('burst');
  box.style.left = `${x}px`;
  box.style.top = `${y}px`;
  for (let i = 0; i < n; i++) {
    const p = div(stars ? 'bit star' : 'bit');
    const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
    const dist = spread * (0.55 + Math.random() * 0.6);
    p.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(ang) * dist - 40}px`);
    p.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = `${Math.random() * 0.08}s`;
    box.appendChild(p);
  }
  stageEl.appendChild(box);
  setTimeout(() => box.remove(), 1400);
}

// 長按（家長鎖）
export function longPress(el, ms, fn) {
  let t = null;
  const start = (e) => { e.stopPropagation(); el.classList.add('pressing'); t = setTimeout(() => { el.classList.remove('pressing'); fn(); }, ms); };
  const end = () => { clearTimeout(t); el.classList.remove('pressing'); };
  el.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, end));
}
