// 名人堂（11/24）：城市裡，明星小鎮的每一位明星都站在展示台上。
// 點明星：跳一下、用自己的聲音自我介紹（加一句英文）。
// 還沒認識的明星是灰色剪影：點了閃閃會提示去哪裡找他。去過那個地方就認識了，台座會亮起來；全部認識有慶祝。
import { createDiorama } from '../engine/diorama.js';
import { div, burst, pick } from '../core/dom.js';
import { speak } from '../core/voice.js';
import { playMusic, sfx } from '../core/audio.js';
import { state, markSeen } from '../core/store.js';
import { roomTint, isDark } from '../core/clock.js';
import { setHint, setPlaying, mountClock } from '../core/session.js';
import { backdrop, homeBtn, rotateBtns, zoomBtns, jars } from '../ui/hud.js';
import { CAST } from '../data/cast.js';
import { starPolygon } from '../art/stars.js';

const W = 1300, D = 780;

export async function mountFame(root, app) {
  backdrop(root);
  const dio = createDiorama({ gl: true, w: W, d: D, walls: false, zoom: 0.62, zmin: 0.45, zmax: 1.2, cy: 0.6, skirt: '#e9dcc4',
    floorCss: 'background: radial-gradient(ellipse at 50% 40%, #fffaf0 0, #f3e8d4 60%, #e9dcc4 100%)' });
  root.appendChild(dio.el);
  app.onLeave(() => { setHint(null); setPlaying(false); dio.destroy(); });
  dio.setTint(roomTint());
  if (isDark()) root.classList.add('night');

  // ---- 大廳 ----
  // 紅地毯（從門口一路鋪到後面）
  dio.addDecal({ x: W / 2 - 70, y: 120, w: 140, h: D - 120, z: 1, css: 'background: linear-gradient(90deg, #f0c64a 0 6px, #d9473b 6px calc(100% - 6px), #f0c64a calc(100% - 6px))' });
  // 後牆：深藍夜空、金色星星、中間一個大獎盃
  const stars = [...Array(16)].map((_, i) => `<polygon points="${starPolygon(60 + (i % 8) * 150 + (i > 7 ? 75 : 0), i > 7 ? 200 : 70, 16, 7)}" fill="#ffd23f" opacity=".85"/>`).join('');
  const backArt = `<svg viewBox="0 0 1180 320" width="100%" height="100%" preserveAspectRatio="none">${stars}
    <g transform="translate(590 150)"><path d="M-70 -90 H70 V-20 Q70 50 0 62 Q-70 50 -70 -20Z" fill="#ffc93c"/><path d="M-70 -70 Q-120 -70 -114 -30 Q-108 6 -64 6" stroke="#ffc93c" stroke-width="18" fill="none"/><path d="M70 -70 Q120 -70 114 -30 Q108 6 64 6" stroke="#ffc93c" stroke-width="18" fill="none"/><rect x="-20" y="60" width="40" height="40" fill="#e0a800"/><rect x="-70" y="96" width="140" height="34" rx="8" fill="#c98b5e"/><polygon points="${starPolygon(0, -30, 44, 19)}" fill="#fff6b0"/></g></svg>`;
  dio.addPanel({ x1: 60, y1: 60, x2: W - 60, y2: 60, h: 320, css: 'background: linear-gradient(#3b3480, #5a4fa0)', html: backArt });
  const sideArt = `<svg viewBox="0 0 640 320" width="100%" height="100%" preserveAspectRatio="none">${[...Array(4)].map((_, i) => `<polygon points="${starPolygon(80 + i * 160, 110, 22, 9)}" fill="#ffd23f" opacity=".8"/>`).join('')}</svg>`;
  dio.addPanel({ x1: 60, y1: D - 80, x2: 60, y2: 60, h: 320, css: 'background: linear-gradient(#3b3480, #5a4fa0)', html: sideArt });
  dio.addPanel({ x1: W - 60, y1: 60, x2: W - 60, y2: D - 80, h: 320, css: 'background: linear-gradient(#3b3480, #5a4fa0)', html: sideArt });
  // 白色柱子
  for (const [x, y] of [[60, 60], [W - 60, 60], [W / 2 - 220, 60], [W / 2 + 220, 60]]) {   // 前面不放柱子，免得擋住明星
    dio.addBox({ x: x - 22, y: y - 22, w: 44, d: 44, h: 340, color: '#fffaf0' });
  }

  // ---- 展示台：後排高、前排矮；閃閃在前排正中間 ----
  // 後排 10 位、前排 9 位（11/24 加入謝醫生）
  const order = [...CAST.slice(1, 11), ...CAST.slice(11, 15), CAST[0], ...CAST.slice(15)];
  const spots = [
    ...[...Array(10)].map((_, i) => ({ x: 128 + i * 116, y: 250, h: 90 })),
    ...[...Array(9)].map((_, i) => ({ x: 130 + i * 130, y: 520, h: 40 })),
  ];
  const met = (id) => !!state.met[id];
  const seats = order.map((c, i) => {
    const s = spots[i];
    const lit = met(c.id);
    const band = `<svg viewBox="0 0 96 100" width="100%" height="100%" preserveAspectRatio="none"><rect y="${s.h > 60 ? 18 : 8}" width="96" height="${s.h > 60 ? 22 : 14}" fill="${lit ? c.color : '#bdb6a8'}"/></svg>`;
    dio.addBox({ x: s.x - 48, y: s.y - 48, w: 96, d: 96, h: s.h, color: lit ? '#fff3d6' : '#ddd6c8', top: lit ? '#ffd23f' : '#cfc8bb', faces: { s: band }, tap: `ch:${c.id}` });
    return { c, ...s };
  });
  dio.seal();

  // 明星（會跳、會說話：用 CSS）
  const sp = {};
  for (const s of seats) {
    sp[s.c.id] = dio.addSprite({ x: s.x, y: s.y + 6, z: s.h, w: 104, h: 114, html: s.c.svg(), cls: met(s.c.id) ? '' : 'sil', shadow: 0.45, tap: `ch:${s.c.id}`, live: true });
  }
  const shan = sp.shan;

  // 上方：認識了幾位（一排小星星，亮的是認識的）
  const prog = div('fame-progress ui', CAST.map((c) => `<i class="${met(c.id) ? 'on' : ''}" style="--c:${c.color}"></i>`).join(''));
  root.appendChild(prog);

  homeBtn(root, () => app.go('town'));
  jars(root, app.profile.members);
  mountClock(root);
  rotateBtns(root, dio);
  zoomBtns(root, dio);
  setPlaying(true);
  playMusic('party');
  // 手指提示：指一位認識的明星
  setHint(() => sp[pick(CAST.filter((c) => met(c.id)).map((c) => c.id))]?.el);

  const hop = (s, cls = 'hop') => { s.el.classList.remove(cls); void s.el.offsetWidth; s.el.classList.add(cls); };
  dio.onTap((name) => {
    if (!name.startsWith('ch:')) return;
    const id = name.slice(3);
    const s = sp[id];
    if (!s) return;
    if (met(id)) {
      sfx('pop');
      hop(s);
      speak(id, 'fame_me', { node: s.el });
    } else {
      hop(s, 'wiggle');
      speak('shan', `fame_find_${id}`, { node: shan.el });
    }
  });

  await speak('shan', 'fame_hi', { node: shan.el });
  if (!app.alive()) return;
  // 全部認識了：慶祝一次
  if (CAST.every((c) => met(c.id)) && !state.seen.fameAll) {
    markSeen('fameAll');
    Object.values(sp).forEach((s, i) => setTimeout(() => hop(s), i * 60));
    burst(app.stageCenter().x, 360, { n: 40, spread: 420 });
    sfx('fanfare');
    await speak('shan', 'fame_all', { node: shan.el });
  }
}
