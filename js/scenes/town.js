// 明星小鎮：選完人之後的主畫面，以及坐叭叭的車。
// 小鎮是一塊可以轉的立體模型：3×3 的路口、馬路、斑馬線、六個地點（家、學堂、公園、超市、診所、農場），閃閃站在中間的廣場。
// 點一個地點 → 叭叭開過來載兄弟倆去：
//   1. 上車繫安全帶（把扣環拖到扣座，「喀」一聲）
//   2. 認路：車子自己開，到路口出現地上的箭頭，選往旗子的方向（凱凱的空間能力；凱凱的對的箭頭會發亮）
//   3. 路上的安全：紅燈、有人過斑馬線，要按「停」（岳岳的「先停一下」；按太晚叭叭也會自己停、不扣分）
//   這次遊玩的第一趟走完整版，之後的路程走短版（繫安全帶＋自動開過去），轉場不會太長。
// 一起玩：凱凱認路、岳岳煞車，兩個人同時有事做。
import { createDiorama } from '../engine/diorama.js';
import { div, wait, burst, stageW, shuffle, pick, toStage, stageRect } from '../core/dom.js';
import { speak } from '../core/voice.js';
import { sfx, playMusic } from '../core/audio.js';
import { isDark, roomTint } from '../core/clock.js';
import { turnsOn, turnsScene, whoseTurn, nextTurn, callTurn, levelNow } from '../core/turns.js';
import { setHint, setPlaying, mountClock } from '../core/session.js';
import { KIDS } from '../config.js';
import { shanSvg, kidHead } from '../art/stars.js';
import { personSvg } from '../art/more.js';
import { babaSvg, itemSvg, ITEM } from '../art/town.js';
import { backdrop, homeBtn, rotateBtns, jars } from '../ui/hud.js';
import { ICON2 } from '../art/more.js';

// ---- 路網：3×3 的路口 ----
const XS = [150, 650, 1150], YS = [150, 500, 850];
const node = (c, r) => ({ c, r, x: XS[c], y: YS[r], id: `${c},${r}` });
export const PLACES = {
  school: { node: [0, 0], x: 300, y: 300, screen: 'school', color: '#ffe0a8', roof: '#ff5d73', icon: ICON2.school, h: 120 },
  park: { node: [1, 0], x: 520, y: 310, screen: 'park', color: null, icon: itemSvg('slide'), h: 0 },
  market: { node: [2, 0], x: 900, y: 310, screen: 'market', color: '#dff4ff', roof: '#3ea8e0', icon: itemSvg('cart'), h: 110 },
  home: { node: [0, 2], x: 390, y: 690, screen: 'house', color: '#fff3e0', roof: '#ff8a3d', icon: itemSvg('home2'), h: 110 },
  clinic: { node: [1, 2], x: 790, y: 690, screen: 'clinic', color: '#ffffff', roof: '#4cd07d', icon: itemSvg('heal'), h: 100 },
  farm: { node: [2, 2], x: 1030, y: 690, screen: 'farm', color: '#ff7a5a', roof: '#c9503a', icon: itemSvg('feed'), h: 100 },
};
export const PLACE_OF_SCREEN = Object.fromEntries(Object.entries(PLACES).map(([k, p]) => [p.screen, k]));

function neighbors(n) {
  const out = [];
  for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const c = n.c + dc, r = n.r + dr;
    if (c >= 0 && c < 3 && r >= 0 && r < 3) out.push(node(c, r));
  }
  return out;
}
// 最短路線（BFS）；同樣短的路線隨機選一條，路程不會每次都一樣
function route(from, to) {
  const start = node(...from), goal = node(...to);
  const prev = { [start.id]: null };
  const q = [start];
  while (q.length) {
    const n = q.shift();
    if (n.id === goal.id) break;
    for (const m of shuffle(neighbors(n))) if (!(m.id in prev)) { prev[m.id] = n; q.push(m); }
  }
  const path = [];
  for (let n = goal; n; n = prev[n.id]) path.unshift(n);
  return path;
}

// ---- 小鎮模型（小鎮地圖和坐車都用） ----
export function buildTown() {
  const W = 1300, D = 1000;
  const dio = createDiorama({ w: W, d: D, walls: false, zoom: 0.72, cy: 0.58, base: '#8fbf6a', rim: 30,
    floorCss: 'background: radial-gradient(circle at 30% 30%, #b8e89a 0, #9fd87f 60%, #92cf72 100%)' });
  // 馬路
  const road = (x, y, w, h) => dio.addDecal({ x, y, w, h, z: 0.8, cls: 'road', css: 'background:#8a8fa0;border-radius:10px' });
  for (const y of YS) road(XS[0] - 45, y - 45, XS[2] - XS[0] + 90, 90);
  for (const x of XS) road(x - 45, YS[0] - 45, 90, YS[2] - YS[0] + 90);
  // 中線
  for (const y of YS) dio.addDecal({ x: XS[0] + 50, y: y - 3, w: XS[2] - XS[0] - 100, h: 6, z: 1, css: 'background:repeating-linear-gradient(90deg,#fff 0 30px,transparent 30px 60px)' });
  for (const x of XS) dio.addDecal({ x: x - 3, y: YS[0] + 50, w: 6, h: YS[2] - YS[0] - 100, z: 1, css: 'background:repeating-linear-gradient(0deg,#fff 0 30px,transparent 30px 60px)' });
  // 廣場（中間的路口）
  dio.addDecal({ x: XS[1] - 70, y: YS[1] - 70, w: 140, h: 140, z: 1.2, css: 'border-radius:50%;background:radial-gradient(circle,#fff6d6 0 55%,#ffd98a 56% 100%)' });
  // 斑馬線（每段路中間附近一條）
  const crossings = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
    const x = (XS[c] + XS[c + 1]) / 2 + 120, y = YS[r];
    dio.addDecal({ x: x - 24, y: y - 42, w: 48, h: 84, z: 1.1, css: 'background:repeating-linear-gradient(0deg,#fff 0 12px,transparent 12px 24px)' });
    crossings.push({ a: node(c, r), b: node(c + 1, r), x, y });
  }
  for (let c = 0; c < 3; c++) for (let r = 0; r < 2; r++) {
    const x = XS[c], y = (YS[r] + YS[r + 1]) / 2 + 100;
    dio.addDecal({ x: x - 42, y: y - 24, w: 84, h: 48, z: 1.1, css: 'background:repeating-linear-gradient(90deg,#fff 0 12px,transparent 12px 24px)' });
    crossings.push({ a: node(c, r), b: node(c, r + 1), x, y });
  }
  // 地點
  const markers = {};
  for (const [id, p] of Object.entries(PLACES)) {
    if (id === 'park') {
      // 公園：草地、樹、溜滑梯
      dio.addDecal({ x: p.x - 110, y: p.y - 110, w: 220, h: 200, z: 0.9, css: 'border-radius:40px;background:#7fd06a', cls: 'place' }).dataset.tap = `go:${id}`;
      for (const [tx, ty] of [[p.x - 70, p.y - 60], [p.x + 70, p.y - 70], [p.x - 60, p.y + 60]]) dio.addSprite({ x: tx, y: ty, w: 80, h: 110, shadow: 0.6, tap: `go:${id}`, html: `<svg viewBox="0 0 80 110"><rect x="34" y="70" width="12" height="38" rx="5" fill="#a9744f"/><circle cx="40" cy="48" r="34" fill="#4fbf6e"/><circle cx="28" cy="36" r="10" fill="#8fe39a" opacity=".7"/></svg>` });
      dio.addSprite({ x: p.x + 40, y: p.y + 50, w: 110, h: 100, shadow: 0.5, html: itemSvg('slide'), tap: `go:${id}` });
    } else {
      const w = 170, d = 140;
      dio.addBox({ x: p.x - w / 2, y: p.y - d / 2, w, d, h: p.h, color: p.color, tap: `go:${id}`,
        faces: { s: `<svg viewBox="0 0 ${w} ${p.h}" width="100%" height="100%" preserveAspectRatio="none"><rect x="${w / 2 - 18}" y="${p.h - 50}" width="36" height="50" rx="4" fill="#a8693f"/>
          <rect x="16" y="20" width="34" height="30" rx="4" fill="#bfe6ff"/><rect x="${w - 50}" y="20" width="34" height="30" rx="4" fill="#bfe6ff"/></svg>` } });
      dio.addBox({ x: p.x - w / 2 - 10, y: p.y - d / 2 - 10, w: w + 20, d: d + 20, h: 18, z: p.h, color: p.roof, cls: 'soft', tap: `go:${id}` });
    }
    markers[id] = dio.addSprite({ x: p.x, y: p.y, z: (p.h || 40) + 70, w: 120, h: 120, html: `<div class="inner">${p.icon}</div>`, cls: 'marker place-mark', shadow: 0, tap: `go:${id}` });
  }
  // 路燈（晚上會亮）
  for (const [x, y] of [[XS[0] + 60, YS[1] - 60], [XS[2] - 60, YS[1] + 60], [XS[1] + 60, YS[0] + 60], [XS[1] - 60, YS[2] - 60]]) {
    dio.addSprite({ x, y, w: 40, h: 120, shadow: 0.3, cls: 'streetlight', html: `<svg viewBox="0 0 40 120"><rect x="17" y="20" width="6" height="98" fill="#4a3b6b"/><circle class="lamp" cx="20" cy="16" r="12" fill="#fff3a0"/></svg>` });
  }
  // 樹
  for (const [x, y] of [[40, 40], [1260, 60], [40, 960], [1260, 960], [650, 980], [1270, 500], [30, 500]]) {
    dio.addSprite({ x, y, w: 80, h: 110, shadow: 0.6, html: `<svg viewBox="0 0 80 110"><rect x="34" y="70" width="12" height="38" rx="5" fill="#a9744f"/><circle cx="40" cy="48" r="34" fill="#4fbf6e"/></svg>` });
  }
  return { dio, markers, crossings };
}

// ======================= 小鎮地圖 =======================
export async function mountTown(root, app) {
  backdrop(root);
  const T = buildTown();
  const { dio } = T;
  root.appendChild(dio.el);
  app.onLeave(() => { setHint(null); setPlaying(false); dio.destroy(); });
  dio.setTint(roomTint());
  if (isDark()) root.classList.add('night');
  const shan = dio.addSprite({ x: XS[1], y: YS[1] + 10, z: 1, w: 120, h: 136, html: shanSvg(), shadow: 0.7, tap: 'shan' });
  // 叭叭停在現在的位置
  const here = PLACES[app.trip.location];
  const car = dio.addSprite({ x: XS[here.node[0]] + 20, y: YS[here.node[1]] + 20, z: 1, w: 120, h: 98, html: babaSvg(), shadow: 0.6, tap: 'baba' });
  T.markers[app.trip.location].el.classList.add('here');

  homeBtn(root, () => app.go('opening'));
  jars(root, app.profile.members);
  mountClock(root);
  rotateBtns(root, dio);
  turnsScene(root);
  setPlaying(true);
  playMusic(isDark() ? 'lullaby' : 'town');
  setHint(() => T.markers.school.el);

  let going = false;
  dio.onTap(async (name) => {
    if (name.startsWith('go:')) {
      if (going) return;
      const to = name.slice(3);
      going = true;
      sfx('tap');
      T.markers[to].el.classList.add('hop');
      setPlaying(false);
      if (to === (app.trip.location)) {
        await speak('shan', `town_go_${to}`, { node: shan.el });
        if (app.alive()) app.go(PLACES[to].screen);
      } else {
        await speak('shan', `town_go_${to}`, { node: shan.el });
        if (app.alive()) app.go('ride', { to });
      }
    } else if (name === 'shan') {
      sfx('boing');
      shan.el.classList.remove('hop'); void shan.el.offsetWidth; shan.el.classList.add('hop');
      speak('shan', 'town_pick', { node: shan.el });
    } else if (name === 'baba') {
      sfx('boing');
      car.el.classList.remove('hop'); void car.el.offsetWidth; car.el.classList.add('hop');
      speak('baba', 'baba_hi', { node: car.el });
    }
  });
  if (!app.trip.seenTown) {
    app.trip.seenTown = true;
    await speak('shan', 'town_hello', { node: shan.el });
  }
  if (app.alive()) speak('shan', 'town_pick', { node: shan.el });
}

// ======================= 坐叭叭的車 =======================
export async function mountRide(root, app) {
  const to = app.params?.to || 'school';
  const from = app.trip.location;
  const full = !app.trip.rides;
  app.trip.rides += 1;
  let alive = true;
  backdrop(root);
  const T = buildTown();
  const { dio } = T;
  root.appendChild(dio.el);
  app.onLeave(() => { alive = false; setHint(null); setPlaying(false); dio.destroy(); });
  dio.setTint(roomTint());
  if (isDark()) root.classList.add('night');
  dio.lock(true);
  turnsScene(root);
  mountClock(root);
  setPlaying(true);
  playMusic('drive');
  const say = (ch, id, node) => (alive ? speak(ch, id, { node: node || null }) : Promise.resolve());
  const chk = () => { if (!alive) throw new Error('left'); };

  const path = route(PLACES[from].node, PLACES[to].node);
  const car = dio.addSprite({ x: path[0].x, y: path[0].y, z: 1, w: 110, h: 90, html: babaSvg(), shadow: 0.6 });
  const flag = dio.addSprite({ x: path[path.length - 1].x + 30, y: path[path.length - 1].y - 30, z: 1, w: 80, h: 100, html: itemSvg('flag'), shadow: 0.4 });
  T.markers[to].el.classList.add('target');
  dio.el.classList.add('riding');   // 坐車時：只留目的地的標記，其他東西點不到（不擋住地上的箭頭）

  // 鏡頭跟著車
  const follow = () => { dio.view.px = car.x; dio.view.py = car.y; dio.apply(); };
  dio.view.z = 1.25;
  follow();

  try {
    // 1. 繫安全帶
    await seatbelt(root, app, full, () => alive);
    chk();
    // 2. 開車
    const stopBtn = document.createElement('button');
    stopBtn.className = 'bigbtn stopbtn ui';
    stopBtn.innerHTML = itemSvg('stop');
    stopBtn.style.cssText = 'left:calc(50% - 75px);bottom:24px;display:none';
    root.appendChild(stopBtn);
    let stopPressed = null;
    let lastNoNeed = 0;
    stopBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      sfx('click');
      if (stopPressed) stopPressed();
      else if (Date.now() - lastNoNeed > 3000) { lastNoNeed = Date.now(); say('baba', 'ride_go_ok', car.el); }
    });
    await say('baba', full ? 'ride_start' : 'ride_start_short', car.el);
    chk();
    if (full) stopBtn.style.display = '';
    // 這一趟要遇到的狀況：紅燈一次、行人一次（完整版才有）
    const segs = path.length - 1;
    const events = {};
    if (full && segs >= 1) {
      const order = shuffle([...Array(segs).keys()]);
      events[order[0]] = 'light';
      if (segs >= 2) events[order[1]] = 'walker';
      else events[order[0]] = pick(['light', 'walker']);
    }
    const speed = full ? 260 : 520;   // 每秒幾個單位
    for (let i = 0; i < segs; i++) {
      const a = path[i], b = path[i + 1];
      // 路口選方向（完整版、而且這裡有岔路）
      if (full && i > 0 && neighbors(a).length > 2) {
        await chooseDirection(a, b);
        chk();
      }
      const ev = events[i];
      await drive(a, b, ev);
      chk();
    }
    stopBtn.remove();
    // 3. 到了
    sfx('fanfare');
    burst(stageW() / 2, 400, { n: 24, spread: 220 });
    await say('baba', full ? `ride_arrive_${to}` : 'ride_arrive_short', car.el);
    chk();
    if (full) { await say('baba', 'ride_lookback', car.el); chk(); }
    app.trip.location = to;
    app.go(PLACES[to].screen);

    // ---- 開一段路；ev：'light' 紅燈、'walker' 行人 ----
    async function drive(a, b, ev) {
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const dur = (len / speed) * 1000;
      let t = 0, last = performance.now(), paused = false;
      let evState = ev ? 'wait' : null;  // wait → active → stopped → done
      let light = null, walker = null, cross = null;
      if (ev === 'light') light = dio.addSprite({ x: b.x - 50 * Math.sign(b.x - a.x || 0.0001) + 40, y: b.y - 50 * Math.sign(b.y - a.y || 0.0001) - 40, w: 46, h: 120, shadow: 0.3, html: lightSvg('green') });
      if (ev === 'walker') {
        cross = T.crossings.find((c) => (c.a.id === a.id && c.b.id === b.id) || (c.a.id === b.id && c.b.id === a.id));
      }
      // 停的位置：紅燈在路口前；行人在斑馬線前
      const stopAt = ev === 'light' ? 0.82 : cross ? Math.max(0.2, Math.min(0.85, (Math.hypot(cross.x - a.x, cross.y - a.y) - 70) / len)) : 1;
      const trigger = Math.max(0.1, stopAt - 0.35);
      if (turnsOn() && ev && whoseTurn() !== 'yy') nextTurn({ say: false });
      await new Promise((resolve) => {
        const step = async (now) => {
          if (!alive) return resolve();
          const dt = now - last;
          last = now;
          if (!paused) t = Math.min(1, t + dt / dur);
          car.move(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 1);
          follow();
          if (evState === 'wait' && t >= trigger) {
            evState = 'active';
            if (ev === 'light') { light.el.innerHTML = lightSvg('red'); sfx('ding'); say('baba', 'ride_red', car.el); }
            else {
              const dx = Math.abs(b.x - a.x) > 1;
              walker = dio.addSprite({ x: cross.x + (dx ? 0 : -70), y: cross.y + (dx ? -70 : 0), w: 60, h: 116, shadow: 0.5, html: personSvg(pick(['dad', 'mom', 'grandma', 'uncle', 'auntie'])) });
              walker.dx = dx;
              say('baba', 'ride_walker', car.el);
            }
            setHint(() => stopBtn);
            stopPressed = () => { if (evState === 'active') { evState = 'stopping'; stopPressed = null; } };
          }
          if ((evState === 'active' || evState === 'stopping') && t >= stopAt) {
            const late = evState === 'active';
            evState = 'stopped';
            paused = true;
            stopPressed = null;
            setHint(null);
            (async () => {
              sfx(late ? 'soft' : 'sparkle');
              if (!late) burst(stageRect(stopBtn).x, stageRect(stopBtn).y - 60, { n: 14, stars: true, colors: ['#ffd23f', '#fff3a0'] });
              await say('baba', late ? (ev === 'light' ? 'ride_red_late' : 'ride_walker_late') : 'ride_stop_good', car.el);
              if (ev === 'walker') {
                // 行人走過斑馬線
                const sx = walker.x, sy = walker.y, t0 = performance.now();
                await new Promise((res) => {
                  const w = (n2) => {
                    const k = Math.min(1, (n2 - t0) / 2200);
                    walker.move(sx + (walker.dx ? 0 : 140 * k), sy + (walker.dx ? 140 * k : 0), Math.abs(Math.sin(k * 12)) * 6);
                    if (k < 1 && alive) requestAnimationFrame(w); else res();
                  };
                  requestAnimationFrame(w);
                });
                walker.remove();
              } else {
                await wait(2200);
                light.el.innerHTML = lightSvg('green');
              }
              if (!alive) return;
              sfx('ding');
              await say('baba', 'ride_green', car.el);
              evState = 'done';
              paused = false;
              last = performance.now();
            })();
          }
          if (t >= 1 && !paused) { light?.remove(); return resolve(); }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }

    // ---- 路口：地上出現箭頭，選往旗子的方向 ----
    async function chooseDirection(a, b) {
      if (turnsOn() && whoseTurn() !== 'kk') nextTurn({ say: false });
      const opts = neighbors(a);
      const shadows = [];
      const arrows = opts.map((n) => {
        const dx = Math.sign(n.x - a.x), dy = Math.sign(n.y - a.y);
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;
        // 箭頭浮在屋頂上方（不會被房子擋住），地上留一個小圓點表示是哪條路
        const gx = a.x + dx * 95, gy = a.y + dy * 95;
        shadows.push(dio.addDecal({ x: gx - 22, y: gy - 22, w: 44, h: 44, z: 2, cls: 'road-dot' }));
        const d = dio.addDecal({ x: gx - 45, y: gy - 45, w: 90, h: 90, z: 150, cls: 'road-arrow', html: `<div style="transform:rotate(${ang}deg);width:100%;height:100%">${itemSvg('arrow')}</div>` });
        d.dataset.tap = `dir:${n.id}`;
        if (n.id === b.id) d.dataset.ok = '1';
        return d;
      });
      const right = arrows.find((d) => d.dataset.ok);
      if (levelNow(app.profile) === 'easy' || (turnsOn() && whoseTurn() === 'kk')) right.classList.add('glow');
      setHint(() => right);
      say('baba', 'ride_which', car.el);   // 不等說完：說的時候就可以點
      let lastWrong = 0;
      await new Promise((resolve) => {
        const handler = (e) => {
          const t = e.target.closest('[data-tap^="dir:"]');
          if (!t) return;
          if (t.dataset.ok) { dio.el.removeEventListener('click', handler); sfx('tap'); resolve(); return; }
          sfx('soft');
          R2(t);
          if (Date.now() - lastWrong > 3000) { lastWrong = Date.now(); say('baba', 'ride_wrong_way', car.el); }
        };
        const R2 = (el) => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
        dio.el.addEventListener('click', handler);
        const watch = setInterval(() => { if (!alive) { clearInterval(watch); resolve(); } }, 400);
      });
      setHint(null);
      arrows.forEach((d) => d.remove());
      shadows.forEach((d) => d.remove());
      if (alive) say('baba', 'ride_right_way', car.el);
    }
  } catch (e) {
    if (alive) console.error(e);
  }
}

function lightSvg(state) {
  return `<svg viewBox="0 0 46 120" width="100%" height="100%"><rect x="20" y="50" width="6" height="68" fill="#4a3b6b"/><rect x="6" y="4" width="34" height="54" rx="10" fill="#2f2a44"/>
    <circle cx="23" cy="18" r="9" fill="${state === 'red' ? '#ff4a4a' : '#5a3a3a'}"/><circle cx="23" cy="42" r="9" fill="${state === 'green' ? '#4cff8a' : '#2f4a3a'}"/></svg>`;
}

// ---- 繫安全帶：把扣環拖到扣座 ----
async function seatbelt(root, app, full, alive) {
  const members = app.profile.members;
  const scrim = div('scrim');
  const pnl = div('panel beltpanel2');
  root.append(scrim, pnl);
  pnl.innerHTML = `<div class="carseat-bg"></div>`;
  const node = div('panel-host', babaSvg());
  root.appendChild(node);
  try {
    const belts = members.map((id, i) => {
      const x = members.length > 1 ? (i === 0 ? 120 : 520) : 320;
      const seat = div('seat', `<div class="seat-back"></div><div class="seat-kid">${kidHead(id, 200)}</div>
        <div class="belt-strap"></div><div class="buckle" data-kid="${id}">${itemSvg('belt')}</div><div class="clasp"></div>`);
      seat.style.left = `${x}px`;
      pnl.appendChild(seat);
      return { id, seat, buckle: seat.querySelector('.buckle'), clasp: seat.querySelector('.clasp'), done: false };
    });
    await speak('baba', full ? 'belt_go' : 'belt_short', { node });
    if (!alive()) return;
    setHint(() => belts.find((b) => !b.done)?.buckle);
    await new Promise((resolve) => {
      for (const b of belts) {
        b.buckle.addEventListener('pointerdown', (e) => {
          if (b.done) return;
          e.preventDefault();
          e.stopPropagation();
          b.buckle.classList.add('dragging');
          const sr = b.seat.getBoundingClientRect();
          const scale = b.seat.offsetWidth / sr.width;
          const mv = (ev) => {
            b.buckle.style.left = `${(ev.clientX - sr.left) * scale - 45}px`;
            b.buckle.style.top = `${(ev.clientY - sr.top) * scale - 45}px`;
          };
          const up = (ev) => {
            window.removeEventListener('pointermove', mv);
            window.removeEventListener('pointerup', up);
            b.buckle.classList.remove('dragging');
            const c = b.clasp.getBoundingClientRect();
            const cx = c.left + c.width / 2, cy = c.top + c.height / 2;
            if (Math.hypot(ev.clientX - cx, ev.clientY - cy) < 90 / (1 / (sr.width / b.seat.offsetWidth))) {
              b.done = true;
              b.seat.classList.add('buckled');
              b.buckle.style.left = ''; b.buckle.style.top = '';
              sfx('click');
              sfx('sparkle');
              const r = stageRect(b.clasp);
              burst(r.x, r.y, { n: 14, stars: true, colors: ['#ffd23f', '#fff3a0'] });
              if (belts.every((x) => x.done)) resolve();
            } else {
              b.buckle.style.left = ''; b.buckle.style.top = '';
              sfx('soft');
            }
          };
          window.addEventListener('pointermove', mv);
          window.addEventListener('pointerup', up);
        });
      }
      const watch = setInterval(() => { if (!alive()) { clearInterval(watch); resolve(); } }, 400);
    });
    setHint(null);
    if (!alive()) return;
    await speak('baba', 'belt_done', { node });
  } finally {
    scrim.remove(); pnl.remove(); node.remove();
  }
}
