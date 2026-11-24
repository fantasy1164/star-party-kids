// 手勢（11/24）：小鎮、房間都用手指操作，不再有轉向、放大的按鈕。
//   一根手指左右滑：轉一圈看　一根手指上下滑：抬頭、低頭　兩根手指張開／捏起來：拉近、拉遠　兩根手指一起滑：移動
// 每天第一次打開（打開禮物盒、大家歡迎完之後）跟著閃閃練習一次；家長頁可以關掉。
// 另外提供「指引手」動畫（ghost），找東西時提醒「轉一轉」也用它。
import { div, wait, burst, stageRect } from '../core/dom.js';
import { speak } from '../core/voice.js';
import { sfx } from '../core/audio.js';
import { state, save } from '../core/store.js';
import { dateKey } from '../core/clock.js';
import { ICON } from '../art/props.js';

// 一隻或兩隻手的動畫：drag（左右）、tilt（上下）、pinch（兩指張開）、pan（兩指一起移動）
export function ghost(root, kind) {
  const g = div(`ghost g-${kind} ui`);
  const two = kind === 'pinch' || kind === 'pan';
  g.innerHTML = `<div class="gh gh1">${ICON.hand}</div>${two ? `<div class="gh gh2">${ICON.hand}</div>` : ''}<div class="trail"></div>`;
  root.appendChild(g);
  return g;
}

export function gestureTipDue() {
  if (state.settings.gestureTip === false) return false;
  const t = state.seen.gestures;
  return !t || dateKey(new Date(t)) !== dateKey();
}

const STEPS = [
  { kind: 'drag', line: 'gest_drag', done: (v0, v) => Math.abs(v.a - v0.a) >= 60 },
  { kind: 'tilt', line: 'gest_tilt', done: (v0, v) => Math.abs(v.t - v0.t) >= 5 },
  { kind: 'pinch', line: 'gest_pinch', done: (v0, v) => v.z / v0.z >= 1.25 || v.z / v0.z <= 0.8 },
  { kind: 'pan', line: 'gest_pan', done: (v0, v) => Math.hypot(v.px - v0.px, v.py - v0.py) >= 110 },
];

// 跟著閃閃練習。node：閃閃的元素（說話時嘴巴會動）
export async function practice(root, dio, { node, alive = () => true } = {}) {
  let skipped = false;
  const skip = div('gest-skip ui', `<svg viewBox="0 0 100 100"><path d="M22 20 L58 50 L22 80Z M54 20 L90 50 L54 80Z" fill="#fff"/></svg>`);
  skip.addEventListener('pointerdown', (e) => e.stopPropagation());
  skip.addEventListener('click', (e) => { e.stopPropagation(); skipped = true; });
  root.appendChild(skip);
  const steps = div('gest-steps ui', STEPS.map((s) => `<i class="g-${s.kind}"></i>`).join(''));
  root.appendChild(steps);
  const dots = [...steps.children];
  const home = { ...dio.view };
  await speak('shan', 'gest_intro', { node });
  for (let i = 0; i < STEPS.length && !skipped && alive(); i++) {
    const s = STEPS[i];
    dots[i].classList.add('now');
    const v0 = { ...dio.view };
    const g = ghost(root, s.kind);
    speak('shan', s.line, { node });
    // 等小朋友做到（每 0.1 秒看一下鏡頭有沒有變）；20 秒沒做到就再說一次，40 秒就先跳過（不要卡住）
    const t0 = Date.now();
    let again = false;
    let ok = false;
    while (!skipped && alive()) {
      await wait(100);
      if (s.done(v0, dio.view)) { ok = true; break; }
      if (!again && Date.now() - t0 > 20000) { again = true; speak('shan', s.line, { node }); }
      if (Date.now() - t0 > 40000) break;
    }
    g.remove();
    dots[i].classList.remove('now');
    if (ok) {
      dots[i].classList.add('ok');
      sfx('star');
      const r = stageRect(dots[i]);
      burst(r.x, r.y, { n: 12, spread: 120, stars: true });
      await speak('shan', 'gest_ok', { node });
    }
  }
  skip.remove();
  steps.remove();
  state.seen.gestures = Date.now();
  save();
  if (!alive()) return;
  // 鏡頭回到原來的樣子，再說「學會了」
  dio.animateTo({ a: home.a, t: home.t, z: home.z, px: home.px, py: home.py }, 700);
  if (!skipped) await speak('shan', 'gest_done', { node });
}
