// 遊戲進度：存在這台裝置的 localStorage（key 是 spk-save，不會跟 toon-fun-party 打架）。
// 有設定雲端同步時，由 sync.js 另外上傳到家長的 Google 雲端硬碟（11/24）。
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
    stickers: { owned: {}, placed: [] },   // 愷愷的貼紙：手上有幾張、貼在小鎮哪裡
    met: { shan: 1 },   // 認識了哪些明星（第一次見到的時間）：名人堂的台座會亮
    multHist: {},   // 乘法每天學會幾題（11/25，家長頁畫進步曲線）
    fest: {},   // 節慶與生日（11/25）：降臨月曆開了哪格、相簿、生日卡…（代號 → 時間）
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
    stickers: { owned: { ...(s.stickers?.owned || {}) }, placed: [...(s.stickers?.placed || [])] },
    met: { ...b.met, ...(s.met || {}) },
    fest: { ...(s.fest || {}) },
    multHist: { ...(s.multHist || {}) },
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
// 「有沒有新進度」不算遊玩計時（usedMs 每幾秒就變，不用為了它一直上傳）
const progressOf = (st) => JSON.stringify({ ...st, session: { restUntil: st.session?.restUntil || 0 } });
let lastProgress = progressOf(state);
export function save() {
  try { localStorage.setItem(SAVE, JSON.stringify(state)); } catch { /* 空間滿了也不要讓遊戲壞掉 */ }
  const pj = progressOf(state);
  if (pj !== lastProgress) { lastProgress = pj; savedHooks.forEach((f) => { try { f(); } catch { /* 忽略 */ } }); }
}

// ---------- 雲端同步用 ----------
const savedHooks = [];
export function onSaved(fn) { savedHooks.push(fn); }
export const SYNC_META_KEY = `${KEY}-sync-meta`;
export const SYNC_CFG_KEY = `${KEY}-sync`;
// 清除全部進度後：雲端要改成以這台為準（不然下次同步又把舊進度載回來）
function forceCloudFromHere() {
  let m = {};
  try { m = JSON.parse(localStorage.getItem(SYNC_META_KEY) || '{}') || {}; } catch { m = {}; }
  try { localStorage.setItem(SYNC_META_KEY, JSON.stringify({ ...m, force: true, dirty: true, at: Date.now() })); } catch { /* 忽略 */ }
}
// 用另一份進度（雲端的或合併後的）取代目前的。保留原本的物件，只換內容：拿著 state.kids.yy 的程式也會看到新資料
export function replaceState(next) {
  const n = normalize(next);
  for (const k of Object.keys(state)) if (!(k in n)) delete state[k];
  for (const [k, v] of Object.entries(n)) {
    if (k === 'kids') {
      for (const id of Object.keys(v)) {
        const kid = state.kids[id] || (state.kids[id] = {});
        for (const kk of Object.keys(kid)) if (!(kk in v[id])) delete kid[kk];
        Object.assign(kid, v[id]);
      }
    } else state[k] = v;
  }
  lastProgress = progressOf(state);
  try { localStorage.setItem(SAVE, JSON.stringify(state)); } catch { /* 忽略 */ }
}
export function hasProgress(st) {
  return Object.values(st.kids || {}).some((k) => (k.total || 0) > 0) || Object.keys(st.mult?.facts || {}).length > 0
    || Object.keys(st.stickers?.owned || {}).length > 0 || (st.stickers?.placed || []).length > 0;
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
// 認識了新的明星：回傳這次新認識的
export function meet(ids) {
  const fresh = ids.filter((id) => !state.met[id]);
  if (fresh.length) { fresh.forEach((id) => { state.met[id] = Date.now(); }); save(); }
  return fresh;
}

export function clearAll() {
  try { localStorage.removeItem(SAVE); } catch { /* 忽略 */ }
  Object.assign(state, blank());
  forceCloudFromHere();
}
export function exportData() { return JSON.stringify(state); }
export function importData(text) { replaceState(JSON.parse(text)); }
