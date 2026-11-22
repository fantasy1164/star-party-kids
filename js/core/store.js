// 遊戲進度：存在這台 iPad 的 localStorage（key 是 spk-save，不會跟 toon-fun-party 打架）。
// 之後要接 Google 雲端硬碟同步時，從 exportData／importData 接。
import { KEY, DEFAULT_SETTINGS } from '../config.js';
import { dateKey } from './clock.js';

const SAVE = `${KEY}-save`;

function blankKid() {
  // stars：每天得到幾顆星星；total：累計；done：每天完成了哪些關卡（次數）
  return { stars: {}, total: 0, done: {} };
}
function blank() {
  return {
    v: 1,
    kids: { yy: blankKid(), kk: blankKid() },
    session: { usedMs: 0, restUntil: 0 },
    settings: { ...DEFAULT_SETTINGS },
    seen: {},   // 看過的東西（開場長版、規則說明）
  };
}
function normalize(s) {
  const b = blank();
  return {
    ...b, ...s,
    kids: { yy: { ...blankKid(), ...(s.kids?.yy || {}) }, kk: { ...blankKid(), ...(s.kids?.kk || {}) } },
    session: { ...b.session, ...(s.session || {}) },
    settings: { ...b.settings, ...(s.settings || {}) },
    seen: { ...(s.seen || {}) },
  };
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE);
    return raw ? normalize(JSON.parse(raw)) : blank();
  } catch { return blank(); }
}

export const state = load();

// 只留最近 30 天的每日紀錄
function prune() {
  const keep = new Set();
  const d = new Date();
  for (let i = 0; i < 30; i++) { keep.add(dateKey(d)); d.setDate(d.getDate() - 1); }
  for (const k of Object.values(state.kids)) {
    for (const map of [k.stars, k.done]) for (const day of Object.keys(map)) if (!keep.has(day)) delete map[day];
  }
}
export function save() {
  try { localStorage.setItem(SAVE, JSON.stringify(state)); } catch { /* 空間滿了也不要讓遊戲壞掉 */ }
}
prune();

export function addStar(ids, game) {
  const day = dateKey();
  for (const id of ids) {
    const k = state.kids[id];
    k.stars[day] = (k.stars[day] || 0) + 1;
    k.total += 1;
    k.done[day] = k.done[day] || {};
    k.done[day][game] = (k.done[day][game] || 0) + 1;
  }
  save();
}
export function starsToday(id) { return state.kids[id]?.stars[dateKey()] || 0; }
export function doneToday(ids, game) { return ids.every((id) => (state.kids[id]?.done[dateKey()] || {})[game]); }
export function markSeen(key) { state.seen[key] = Date.now(); save(); }

export function clearAll() {
  try { localStorage.removeItem(SAVE); } catch { /* 忽略 */ }
  Object.assign(state, blank());
}
export function exportData() { return JSON.stringify(state); }
export function importData(text) { Object.assign(state, normalize(JSON.parse(text))); save(); }
