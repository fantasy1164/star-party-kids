// 遊玩時間（閃閃的發條）與「停 8 秒沒動作就出現手指提示」。
// ADHD 的轉換最難：時間到不會中途打斷，而是先預告「再玩一個就休息」，等這一關做完才休息。
import { state, save } from './store.js';
import { quietFor } from './voice.js';
import { div, stageRect } from './dom.js';
import { ICON } from '../art/props.js';
import { speak } from './voice.js';

let playing = false;
let lastTick = Date.now();
let warned = false;
let clockEl = null;

export function setPlaying(on) { playing = on; lastTick = Date.now(); }
function limitMs() { return state.settings.sessionMin * 60000; }
export function remainingMs() { return Math.max(0, limitMs() - state.session.usedMs); }
export function timeUp() { return !state.settings.nolimit && remainingMs() <= 0; }
export function resting() { return Date.now() < state.session.restUntil; }
export function restLeftMs() { return Math.max(0, state.session.restUntil - Date.now()); }
export function startRest() {
  state.session.restUntil = Date.now() + state.settings.restMin * 60000;
  state.session.usedMs = 0;
  warned = false;
  save();
}
export function clearRest() { state.session.restUntil = 0; state.session.usedMs = 0; warned = false; save(); }

setInterval(() => {
  const now = Date.now();
  const dt = Math.min(5000, now - lastTick);
  lastTick = now;
  if (!playing || document.hidden || state.settings.nolimit) { drawClock(); return; }
  state.session.usedMs += dt;
  if (Math.round(state.session.usedMs / 1000) % 10 === 0) save();
  if (!warned && remainingMs() <= 120000 && remainingMs() > 0) {
    warned = true;
    setTimeout(() => speak('shan', 'one_more'), 600);
  }
  drawClock();
}, 1000);

// 右上角的發條時鐘：金色的圈越來越少
export function mountClock(root) {
  clockEl = div('windclock');
  root.appendChild(clockEl);
  drawClock();
}
function drawClock() {
  if (!clockEl || !clockEl.isConnected) return;
  const k = state.settings.nolimit ? 1 : remainingMs() / limitMs();
  const a = Math.max(0.0001, k) * Math.PI * 2;
  const x = 50 + 40 * Math.sin(a), y = 50 - 40 * Math.cos(a);
  const arc = k >= 0.999 ? '<circle cx="50" cy="50" r="40" fill="#ffd23f"/>' : `<path d="M50 50 L50 10 A40 40 0 ${a > Math.PI ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)} Z" fill="#ffd23f"/>`;
  clockEl.classList.toggle('low', k < 0.15);
  clockEl.innerHTML = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#fff" opacity=".9"/><circle cx="50" cy="50" r="40" fill="#f3e6c8"/>${arc}
    <g transform="translate(50 50)"><rect x="-4" y="-16" width="8" height="18" rx="3" fill="#c4902a"/><circle cx="-10" cy="-20" r="9" fill="#f6c453" stroke="#c4902a" stroke-width="3"/><circle cx="10" cy="-20" r="9" fill="#f6c453" stroke="#c4902a" stroke-width="3"/></g></svg>`;
}

// ---- 手指提示 ----
let hintFn = null;
let lastTouch = Date.now();
let hand = null;
let stageRoot = null;
export function setupHints(stageEl) {
  stageRoot = stageEl;
  ['pointerdown', 'pointermove'].forEach((t) => document.addEventListener(t, () => { lastTouch = Date.now(); hideHand(); wake(); }, { capture: true, passive: true }));
  setInterval(() => {
    // 省電：沒人碰、也沒人在說話時，停掉一直重複的小動畫（標記上下飄、角色眨眼晃動、警車燈…）。
    // 畫面完全不動時 iPhone／iPad 就不用每秒重畫 60 次，比較不會發燙、降頻變鈍（11/24）。
    if (Date.now() - lastTouch > STILL_MS && quietFor() > 1500) rest(); else wake();
    if (!hintFn || hand) return;
    if (Date.now() - lastTouch < 8000 || quietFor() < 3000) return;
    const target = hintFn();
    if (!target || !target.isConnected) return;
    const r = stageRect(target);
    if (r.w === 0) return;
    hand = div('hinthand', ICON.hand);
    hand.style.left = `${r.x - 20}px`;
    hand.style.top = `${r.y - 10}px`;
    stageRoot.appendChild(hand);
    setTimeout(hideHand, 4000);
    lastTouch = Date.now();
  }, 1000);
}
const STILL_MS = 5000;
const paused = new Set();
function rest() {
  for (const a of document.getAnimations()) {
    if (a.playState !== 'running' || a.effect?.getTiming?.().iterations !== Infinity) continue;
    if (a.effect.target?.closest?.('.hinthand')) continue;   // 手指提示要繼續動
    a.pause();
    paused.add(a);
  }
}
function wake() {
  if (!paused.size) return;
  for (const a of paused) { try { a.play(); } catch { /* 元素已經不在了 */ } }
  paused.clear();
}
// 設定「下一步要點什麼」：回傳一個元素（或 null）
export function setHint(fn) { hintFn = fn; lastTouch = Date.now(); hideHand(); }
function hideHand() { hand?.remove(); hand = null; }
