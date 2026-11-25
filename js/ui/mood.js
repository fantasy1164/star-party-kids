// 心情打卡（11/25）：仿台灣捷運廁所的滿意度按鈕——深色面板上一排五顆大圓鈕，綠色大笑臉到紅色哭臉。
// 選完人（玩之前）和休息時（玩之後）各問一次；全圖像、點一下就好、可以跳過，不追問原因。
// 兩個人一起玩：一個一個輪流按（頭像換人）。選了比較低的臉：閃閃安慰，邀他一起吹氣球深呼吸三次（也可以跳過）。
import { div, wait, burst, stageRect } from '../core/dom.js';
import { speak } from '../core/voice.js';
import { sfx } from '../core/audio.js';
import { setHint } from '../core/session.js';
import { addMood, askedRecently } from '../core/stats.js';
import { moodFace } from './charts.js';
import { shanSvg, kidHead } from '../art/stars.js';
import { itemSvg } from '../art/town.js';
import { ICON2 } from '../art/more.js';

// when：'s' 玩之前、'e' 玩之後
export async function moodCheck(root, members, when, alive = () => true) {
  const who = members.filter((id) => !askedRecently(id, when));
  if (!who.length) return;
  const scrim = div('scrim');
  const pnl = div('panel moodpanel');
  const host = div('panel-host', shanSvg());
  root.append(scrim, pnl, host);
  try {
    for (const id of who) {
      if (!alive()) return;
      const v = await askOne(pnl, host, id, when, alive);
      if (v == null || !alive()) continue;
      addMood(id, v, when);
      if (v >= 3) { await speak('shan', `mood_r${v}`, { node: host }); continue; }
      // 心情比較低：安慰＋要不要一起深呼吸
      await speak('shan', 'mood_r_low', { node: host });
      if (!alive()) return;
      if (await offerBreath(pnl, host, alive)) await breathe(pnl, host, alive);
    }
  } finally {
    setHint(null);
    scrim.remove(); pnl.remove(); host.remove();
  }
}

function askOne(pnl, host, id, when, alive) {
  pnl.innerHTML = `<div class="mood-kid">${kidHead(id, 160)}</div>
    <div class="mood-kiosk">${[5, 4, 3, 2, 1].map((v) => `<button class="mood-btn" data-v="${v}">${moodFace(v, 116)}</button>`).join('')}</div>
    <button class="mood-skip">${ICON2.skip}</button>`;
  speak('shan', `mood_${when}_${id}`, { node: host });   // 不等說完：說的時候就可以按
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (done) return; done = true; clearInterval(watch); resolve(v); };
    pnl.querySelectorAll('.mood-btn').forEach((b) => b.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (done) return;
      sfx('tap');
      b.classList.add('picked');
      pnl.querySelector('.mood-kiosk').classList.add('chosen');
      const r = stageRect(b);
      burst(r.x, r.y, { n: 12, stars: true, colors: ['#ffd23f', '#fff3a0'] });
      setTimeout(() => finish(+b.dataset.v), 450);
    }));
    pnl.querySelector('.mood-skip').addEventListener('pointerdown', (e) => { e.stopPropagation(); sfx('tap'); finish(null); });
    const watch = setInterval(() => { if (!alive()) finish(null); }, 400);
  });
}

// 要不要吹氣球？大氣球（要）＋跳過
function offerBreath(pnl, host, alive) {
  pnl.innerHTML = `<button class="mood-balloon">${itemSvg('balloon')}</button><button class="mood-skip">${ICON2.skip}</button>`;
  const btn = pnl.querySelector('.mood-balloon');
  setHint(() => btn);
  return new Promise((resolve) => {
    const watch = setInterval(() => { if (!alive()) { clearInterval(watch); resolve(false); } }, 400);
    btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); clearInterval(watch); sfx('tap'); resolve(true); }, { once: true });
    pnl.querySelector('.mood-skip').addEventListener('pointerdown', (e) => { e.stopPropagation(); clearInterval(watch); sfx('tap'); resolve(false); }, { once: true });
  });
}

// 吹氣球深呼吸三次：按住氣球慢慢吸氣（至少 2 秒，氣球變大），放開吐氣
async function breathe(pnl, host, alive) {
  pnl.innerHTML = `<div class="breath-balloon">${itemSvg('balloon')}</div>
    <div class="breath-dots">${'<i></i>'.repeat(3)}</div>
    <button class="breath-btn"><span class="ring"></span>${itemSvg('balloon')}</button>`;
  const balloon = pnl.querySelector('.breath-balloon');
  const btn = pnl.querySelector('.breath-btn');
  const dots = [...pnl.querySelectorAll('.breath-dots i')];
  let lastSlow = 0;
  speak('shan', 'mood_breath_in', { node: host });
  for (let b = 0; b < 3; b++) {
    if (!alive()) return;
    btn.classList.add('glowy-2d');
    setHint(() => btn);
    await new Promise((resolve) => {
      let t0 = 0, timer = null;
      const watch = setInterval(() => { if (!alive()) { clearInterval(watch); resolve(); } }, 400);
      const down = (e) => {
        e.preventDefault(); e.stopPropagation();
        try { btn.setPointerCapture(e.pointerId); } catch { /* 沒關係 */ }
        t0 = Date.now();
        btn.classList.add('hold');
        balloon.classList.remove('out'); balloon.classList.add('in');
        sfx('breathIn');
        timer = setTimeout(() => { btn.classList.add('full'); sfx('ding'); }, 2000);
      };
      const up = () => {
        if (!t0) return;
        clearTimeout(timer);
        btn.classList.remove('hold', 'full');
        const held = Date.now() - t0;
        t0 = 0;
        balloon.classList.remove('in'); balloon.classList.add('out');
        if (held >= 2000) {
          btn.removeEventListener('pointerdown', down); btn.removeEventListener('pointerup', up); btn.removeEventListener('pointercancel', up);
          clearInterval(watch);
          resolve();
        } else if (Date.now() - lastSlow > 3000) { lastSlow = Date.now(); speak('shan', 'mood_breath_slow', { node: host }); }
      };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
    });
    if (!alive()) return;
    btn.classList.remove('glowy-2d');
    setHint(null);
    sfx('breathOut');
    if (b === 0) await speak('shan', 'mood_breath_out', { node: host }); else await wait(1800);
    dots[b].classList.add('on');
    sfx('sparkle');
  }
  btn.remove();
  balloon.classList.remove('out'); balloon.classList.add('calm');
  await speak('shan', 'mood_breath_done', { node: host });
}
