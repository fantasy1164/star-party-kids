// 獎勵（11/24，依兩兄弟的興趣）：
//   愷愷：貼紙。每做完一關拿到一張（恐龍、車車、小動物、哨哨…），可以貼在小鎮上任何地方——
//         立體小鎮可以轉，貼在哪裡、從哪個角度看都是他自己決定的（他的空間能力）。
//   岳岳：畫畫板（自由繪畫＋黏土筆＋太空印章）。每學會一排口訣，多一顆星球印章。
import { div, wait, burst, stageW, pick } from '../core/dom.js';
import { sfx } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { state, save } from '../core/store.js';
import { setPlaying, mountClock, setHint } from '../core/session.js';
import { STICKERS, rocketSvg, planetSvg } from '../art/fun.js';
import { starIcon } from '../art/stars.js';
import { homeBtn, roundBtn } from '../ui/hud.js';
import { ICON2 } from '../art/more.js';
import * as M from '../core/mult.js';
import { KEY } from '../config.js';

// ======================= 貼紙 =======================
const IDS = Object.keys(STICKERS);
export function earnSticker() {
  const own = state.stickers.owned;
  // 先給還沒拿過的，收集起來有新鮮感
  const have = new Set([...Object.keys(own).filter((k) => own[k] > 0), ...state.stickers.placed.map((p) => p.id)]);
  const fresh = IDS.filter((k) => !have.has(k));
  const id = fresh.length ? pick(fresh) : pick(IDS);
  own[id] = (own[id] || 0) + 1;
  save();
  return id;
}
// 拿到貼紙的動畫（關卡做完、星星飛進罐子之後）
export async function showNewSticker(root) {
  const id = earnSticker();
  const el = div('sticker-pop', `<div class="sticker">${STICKERS[id]}</div>`);
  root.appendChild(el);
  sfx('star');
  burst(stageW() / 2, 420, { n: 18, spread: 160, stars: true });
  await speak('shan', 'sticker_new');
  el.classList.add('fly');
  await wait(600);
  el.remove();
}
export const stickerCount = () => Object.values(state.stickers.owned).reduce((s, n) => s + n, 0);

// 小鎮上：畫出已經貼好的貼紙
export function drawPlacedStickers(dio) {
  return state.stickers.placed.map((p, i) => dio.addSprite({ x: p.x, y: p.y, w: 76, h: 76, shadow: 0.4, cls: 'placed-sticker', html: `<div class="inner sticker">${STICKERS[p.id] || ''}</div>`, tap: `stk:${i}` }));
}

// 小鎮上的貼紙本：選一張 → 點小鎮的地面貼上去；點貼好的貼紙可以拿回來
export function mountStickerBook(root, dio, { onOpen, onClose } = {}) {
  let sprites = drawPlacedStickers(dio);
  let open = false;
  let chosen = null;
  const btn = roundBtn(root, 'btn-stickers', `<div class="stkbtn">${STICKERS.trex}<b></b></div>`, () => toggle());
  const tray = div('sticker-tray ui');
  root.appendChild(tray);
  const badge = () => { btn.querySelector('b').textContent = stickerCount() || ''; };
  badge();
  const paintTray = () => {
    const own = state.stickers.owned;
    const ids = IDS.filter((k) => own[k] > 0);
    tray.innerHTML = ids.length
      ? ids.map((k) => `<button class="tstk ${k === chosen ? 'sel' : ''}" data-k="${k}">${STICKERS[k]}${own[k] > 1 ? `<b>${own[k]}</b>` : ''}</button>`).join('')
      : `<div class="tray-empty">${starIcon(70)}</div>`;
  };
  tray.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const b = e.target.closest('.tstk');
    if (!b) return;
    chosen = b.dataset.k;
    sfx('pop');
    paintTray();
    root.classList.add('placing');
    setHint(null);
  });
  function toggle(force) {
    open = force ?? !open;
    tray.classList.toggle('show', open);
    root.classList.toggle('sticker-mode', open);
    if (!open) { chosen = null; root.classList.remove('placing'); }
    paintTray();
    (open ? onOpen : onClose)?.();
    if (open) speak('shan', stickerCount() ? 'sticker_book' : 'sticker_none');
  }
  const redraw = () => { sprites.forEach((s) => s.remove()); sprites = drawPlacedStickers(dio); badge(); paintTray(); };
  // 點地面：換算成小鎮的座標（地面、馬路這些平面的 offsetX/Y 就是它自己裡面的位置）
  dio.el.addEventListener('click', (e) => {
    if (!open || dio.justDragged()) return;
    const placed = e.target.closest('[data-tap^="stk:"]');
    if (placed && !chosen) {
      const i = +placed.dataset.tap.slice(4);
      const p = state.stickers.placed.splice(i, 1)[0];
      state.stickers.owned[p.id] = (state.stickers.owned[p.id] || 0) + 1;
      save();
      sfx('pop');
      redraw();
      return;
    }
    if (!chosen) return;
    // 點到地面的哪裡（用鏡頭算，地面畫在 WebGL 或 CSS 都可以）
    const g = dio.groundAt(e.clientX, e.clientY);
    if (!g) return;
    const { x, y } = g;
    if (!(x > 0 && y > 0 && x < dio.o.w && y < dio.o.d)) return;
    state.stickers.placed.push({ id: chosen, x: Math.round(x), y: Math.round(y) });
    state.stickers.owned[chosen] -= 1;
    if (state.stickers.owned[chosen] <= 0) { delete state.stickers.owned[chosen]; chosen = null; root.classList.remove('placing'); }
    save();
    sfx('sparkle');
    redraw();
    const sp = sprites[sprites.length - 1];
    sp?.el.classList.add('just');
  }, true);
  return { toggle, isOpen: () => open, btn };
}

// ======================= 畫畫板（岳岳）=======================
const COLORS = ['#2a2f3a', '#ff4a4a', '#ff8a3d', '#ffd23f', '#4cd07d', '#3ea8e0', '#2f5fbf', '#a98bff', '#ff8fbf', '#ffffff'];
const DRAW_KEY = `${KEY}-draw`;
export function mount(root, app) {
  root.classList.add('drawroom');
  setPlaying(true);
  mountClock(root);
  homeBtn(root, () => app.go('town'));
  // 星球印章：學會幾排就有幾顆（至少一顆，第一次就有東西可以蓋）
  let rows = 0;
  for (let a = 2; a <= 9; a++) if (M.rowDone(a)) rows++;
  const stamps = [
    { k: 'rocket', html: rocketSvg('#ff5d73', true) },
    { k: 'star', html: starIcon(100) },
    ...[...Array(Math.max(1, rows))].map((_, i) => ({ k: `planet${i}`, html: planetSvg(i) })),
  ];
  root.insertAdjacentHTML('beforeend', `
    <div class="drawpad"><canvas width="1600" height="1000"></canvas></div>
    <div class="dtools ui">
      <div class="dcolors">${COLORS.map((c, i) => `<button class="dc ${i === 5 ? 'sel' : ''}" data-c="${c}" style="--c:${c}"></button>`).join('')}</div>
      <div class="dbrush">
        <button class="db sel" data-b="pen"><svg viewBox="0 0 100 100"><path d="M20 80 L70 30 L80 40 L30 90 L16 94Z" fill="#ffd23f"/><path d="M70 30 L78 22 L88 32 L80 40Z" fill="#ff8fbf"/></svg></button>
        <button class="db" data-b="clay"><svg viewBox="0 0 100 100"><path d="M20 70 Q30 30 50 50 Q70 70 82 34" stroke="#ff8a3d" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M20 66 Q30 28 50 46 Q70 64 80 32" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/></svg></button>
        <button class="db" data-b="erase"><svg viewBox="0 0 100 100"><rect x="18" y="34" width="64" height="36" rx="10" fill="#ff8fbf" transform="rotate(-20 50 52)"/><rect x="18" y="52" width="30" height="18" rx="6" fill="#fff" transform="rotate(-20 50 52)"/></svg></button>
      </div>
      <div class="dstamps">${stamps.map((s) => `<button class="ds" data-s="${s.k}">${s.html}</button>`).join('')}</div>
      <div class="dbg"><button class="dbgb" data-bg="space"></button><button class="dbgb" data-bg="paper"></button></div>
      <button class="dclear"><svg viewBox="0 0 100 100"><path d="M58 10 L46 52" stroke="#a9744f" stroke-width="8" stroke-linecap="round"/><path d="M30 50 H62 L74 90 H18Z" fill="#ffd23f"/><path d="M30 64 L26 90 M42 64 L40 90 M54 64 L56 90" stroke="#e0a800" stroke-width="4"/></svg></button>
    </div>`);
  const cv = root.querySelector('canvas');
  const g = cv.getContext('2d');
  let bg = 'space';
  const paintBg = () => {
    if (bg === 'space') {
      const gr = g.createLinearGradient(0, 0, 0, 1000); gr.addColorStop(0, '#1d2256'); gr.addColorStop(1, '#3a2f7a');
      g.fillStyle = gr; g.fillRect(0, 0, 1600, 1000);
      g.fillStyle = '#fff';
      for (let i = 0; i < 90; i++) { g.globalAlpha = 0.3 + ((i * 37) % 7) / 10; g.beginPath(); g.arc((i * 173) % 1600, (i * 97) % 1000, 1 + (i % 3), 0, 7); g.fill(); }
      g.globalAlpha = 1;
    } else { g.fillStyle = '#fffdf6'; g.fillRect(0, 0, 1600, 1000); }
  };
  // 上次畫的接著畫
  const saved = (() => { try { return JSON.parse(localStorage.getItem(DRAW_KEY) || 'null'); } catch { return null; } })();
  if (saved?.img) {
    bg = saved.bg || 'space';
    const im = new Image();
    im.onload = () => g.drawImage(im, 0, 0, 1600, 1000);
    im.src = saved.img;
    paintBg();
  } else paintBg();
  const persist = () => { try { localStorage.setItem(DRAW_KEY, JSON.stringify({ bg, img: cv.toDataURL('image/jpeg', 0.7) })); } catch { /* 存不下就算了 */ } };
  app.onLeave(() => { persist(); setPlaying(false); setHint(null); });

  let color = COLORS[5], brush = 'pen', stamp = null;
  const tools = root.querySelector('.dtools');
  tools.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const c = e.target.closest('.dc'), b = e.target.closest('.db'), s = e.target.closest('.ds'), bgb = e.target.closest('.dbgb');
    if (c) { color = c.dataset.c; stamp = null; if (brush === 'erase') brush = 'pen'; }
    if (b) { brush = b.dataset.b; stamp = null; }
    if (s) { stamp = s.dataset.s; }
    if (bgb) { bg = bgb.dataset.bg; paintBg(); }
    // 清掉要點兩次（免得不小心把畫好的擦掉）
    const clr = e.target.closest('.dclear');
    if (clr) {
      if (clr.classList.contains('armed')) { clr.classList.remove('armed'); sfx('whoosh'); paintBg(); persist(); }
      else { clr.classList.add('armed'); setTimeout(() => clr.classList.remove('armed'), 2500); }
    }
    sfx('tap');
    tools.querySelectorAll('.dc').forEach((x) => x.classList.toggle('sel', !stamp && x.dataset.c === color && brush !== 'erase'));
    tools.querySelectorAll('.db').forEach((x) => x.classList.toggle('sel', !stamp && x.dataset.b === brush));
    tools.querySelectorAll('.ds').forEach((x) => x.classList.toggle('sel', x.dataset.s === stamp));
  });
  // 畫
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 1600 / r.width, (e.clientY - r.top) * 1000 / r.height]; };
  let last = null;
  const line = (a, b) => {
    g.lineCap = 'round'; g.lineJoin = 'round';
    if (brush === 'erase') { g.strokeStyle = bg === 'space' ? '#2a2868' : '#fffdf6'; g.lineWidth = 60; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); return; }
    if (brush === 'clay') {
      // 黏土筆：粗粗的一條，下面有影子、上面有亮光，看起來鼓鼓的
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 46; g.beginPath(); g.moveTo(a[0] + 4, a[1] + 6); g.lineTo(b[0] + 4, b[1] + 6); g.stroke();
      g.strokeStyle = color; g.lineWidth = 42; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 10; g.beginPath(); g.moveTo(a[0] - 8, a[1] - 9); g.lineTo(b[0] - 8, b[1] - 9); g.stroke();
      return;
    }
    g.strokeStyle = color; g.lineWidth = 12; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
  };
  const doStamp = (p) => {
    const html = stamps.find((s) => s.k === stamp)?.html;
    if (!html) return;
    const svgText = html.replace(/<svg([^>]*)>/, (m, attrs) => `<svg${attrs.replace(/\s(width|height|xmlns)="[^"]*"/g, '')} xmlns="http://www.w3.org/2000/svg" width="200" height="200">`);
    const im = new Image();
    im.onload = () => g.drawImage(im, p[0] - 90, p[1] - 90, 180, 180);
    im.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
    sfx('pop');
  };
  cv.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const p = pos(e);
    if (stamp) { doStamp(p); return; }
    last = p;
    line(p, [p[0] + 0.1, p[1] + 0.1]);
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', (e) => { if (!last) return; const p = pos(e); line(last, p); last = p; });
  const up = () => { if (last) { last = null; persist(); } };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  speak('shan', saved?.img ? 'draw_back' : 'draw_hello');
}
