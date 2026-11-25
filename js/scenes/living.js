// 客廳（主持人閃閃）。三個短關卡：
//   時間到，關電視：電視在播卡通，鬧鐘一響就按遙控器關電視；門鈴、電話響不能關（直接練岳岳最難的「轉換」：時間到就停）。
//   誰按電鈴？：從門上的小洞看是誰。爸爸、媽媽、阿嬤可以開門；不認識的人不開門，要去找大人（愷愷很會觀察，可以當看門孔的人）。
//   明星舞台：跟著閃閃做動作（真的站起來做），再跟著拍子打鼓（讓岳岳動身體、練習抓時間點）。
import { runRoom } from './room-base.js';
import { isDark } from '../core/clock.js';
import { streetWindow, stairDoor } from '../art/house.js';
import { createDiorama } from '../engine/diorama.js';
import { div, wait, burst, stageW, shuffle, pick } from '../core/dom.js';
import { roundDots } from './kit.js';
import { sfx, stopMusic, playMusic } from '../core/audio.js';
import { turnsOn, callTurn, nextTurn, levelNow } from '../core/turns.js';
import { setHint } from '../core/session.js';
import { shanSvg, starPolygon } from '../art/stars.js';
import { personSvg, FAMILY, STRANGERS, ICON2 } from '../art/more.js';

export function mount(root, app) {
  return runRoom(root, app, {
    id: 'living',
    host: 'shan',
    build: buildLiving,
    music: () => 'living',
    lines: {
      hello: (ph) => `liv_hello_${ph === 'night' ? 'evening' : ph}`,
      pick: 'liv_pick',
      next: 'liv_next',
      allDone: [['shan', 'liv_all_done']],
    },
    games: [
      { id: 'tv', icon: ICON2.tv, marker: { x: 40, y: 290, z: 260 }, run: tvGame },
      { id: 'door', icon: ICON2.door, marker: { x: 450, y: 30, z: 290 }, run: doorGame },
      { id: 'stage', icon: ICON2.drum, marker: { x: 320, y: 460, z: 240 }, run: stageGame },
    ],
    playful(name, R) {
      if (name === 'tv') { sfx('click'); R.set.screen.classList.toggle('on'); return true; }
      if (name === 'door') { sfx('doorbell'); return true; }
      if (name === 'clock' || name === 'phone') { sfx('tick'); R.hop(R.set[name].el, 'wiggle'); return true; }
      return false;
    },
  });
}

// ---------------- 模型 ----------------
const CLOCK = `<svg viewBox="0 0 60 66" width="100%" height="100%"><circle cx="14" cy="12" r="9" fill="#ff5b5b"/><circle cx="46" cy="12" r="9" fill="#ff5b5b"/>
  <circle cx="30" cy="36" r="24" fill="#ff8a3d"/><circle cx="30" cy="36" r="18" fill="#fff"/><path d="M30 36 V24 M30 36 L38 40" stroke="#4a3b6b" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M14 58 L10 64 M46 58 L50 64" stroke="#4a3b6b" stroke-width="4" stroke-linecap="round"/></svg>`;
const PHONE = `<svg viewBox="0 0 50 60" width="100%" height="100%"><rect x="6" y="20" width="38" height="36" rx="10" fill="#7fd3ff"/><path d="M4 22 C4 8 46 8 46 22 L38 26 C36 20 14 20 12 26Z" fill="#3ea8e0"/><circle cx="25" cy="38" r="8" fill="#fff"/></svg>`;
const SHOW = `<svg class="show" viewBox="0 0 200 140" preserveAspectRatio="none"><circle cx="170" cy="26" r="14" fill="#ffd23f"/>
  <ellipse cx="50" cy="30" rx="22" ry="8" fill="#fff"/><g class="ballx"><circle cx="100" cy="90" r="16" fill="#ff5fae"/><circle cx="95" cy="85" r="5" fill="#fff" opacity=".7"/></g>
  <polygon points="${starPolygon(40, 110, 10, 4)}" fill="#ffd23f"/><polygon points="${starPolygon(160, 112, 8, 3.5)}" fill="#ff8a3d"/></svg>`;
const DOOR = `<svg viewBox="0 0 120 230" width="100%" height="100%"><rect x="2" y="2" width="116" height="228" rx="8" fill="#a8693f"/><rect x="12" y="12" width="96" height="218" rx="6" fill="#d4955f"/>
  <rect x="24" y="110" width="72" height="100" rx="6" fill="#c98451"/><circle cx="60" cy="56" r="11" fill="#bfe6ff" stroke="#7a4f2e" stroke-width="4"/><circle cx="92" cy="124" r="7" fill="#ffd23f"/></svg>`;

function buildLiving() {
  const dio = createDiorama({
    w: 640, d: 600, wallH: 300, zoom: 0.98, cy: 0.6, wall: '#f6eaff', base: '#b98a6a',
    floorCss: 'background: repeating-linear-gradient(0deg, #ecc89a 0 56px, #e0bb8b 56px 58px)',
  });
  // 窗外看得到街道、門口看得到 Z 字型樓梯（11/24：房間不再是封閉的盒子）
  dio.wallArt('e', { along: 200, up: 120, w: 180, h: 135, html: streetWindow(isDark()), cls: 'window' });
  dio.wallArt('w', { along: 40, up: 0, w: 110, h: 190, html: stairDoor() });
  // 地毯
  dio.addDecal({ x: 190, y: 250, w: 280, h: 240, z: 0.6, css: 'border-radius:40px;background:radial-gradient(circle,#fff2b8 0 25%,#ffd5e5 25% 50%,#c9e9ff 50% 100%)' });
  // 電視櫃與電視（靠西牆，螢幕朝東）
  dio.addBox({ x: 0, y: 170, w: 74, d: 240, h: 62, color: '#d4955f' });
  const tv = dio.addBox({ x: 8, y: 188, w: 18, d: 204, h: 140, z: 62, color: '#4a3b6b', tap: 'tv',
    faces: { e: `<div class="tvscreen on" style="position:absolute;left:8px;top:8px;right:8px;bottom:8px;border-radius:6px">${SHOW}</div>` } });
  const screen = tv.faces.e.querySelector('.tvscreen');
  // 沙發（靠東邊）
  dio.addBox({ x: 480, y: 180, w: 100, d: 250, h: 48, color: '#a98bff', cls: 'soft' });
  dio.addBox({ x: 572, y: 180, w: 40, d: 250, h: 120, color: '#9478f0', cls: 'soft' });
  dio.addBox({ x: 480, y: 166, w: 132, d: 22, h: 80, color: '#9478f0', cls: 'soft' });
  dio.addBox({ x: 480, y: 422, w: 132, d: 22, h: 80, color: '#9478f0', cls: 'soft' });
  // 茶几、鬧鐘、電話
  dio.addBox({ x: 250, y: 280, w: 140, d: 90, h: 44, color: '#e7a774', cls: 'soft' });
  const clock = dio.addSprite({ x: 300, y: 320, z: 44, w: 58, h: 64, html: CLOCK, shadow: 0.5, tap: 'clock' });
  const phone = dio.addSprite({ x: 520, y: 240, z: 48, w: 46, h: 56, html: PHONE, shadow: 0.5, tap: 'phone' });
  // 門（北牆）、相框、植物、檯燈
  const door = dio.wallArt('n', { along: 390, up: 0, w: 120, h: 230, html: DOOR });
  door.dataset.tap = 'door';
  dio.wallArt('n', { along: 120, up: 160, w: 150, h: 100, html: `<svg viewBox="0 0 150 100"><rect x="2" y="2" width="146" height="96" rx="8" fill="#fff"/><rect x="10" y="10" width="130" height="80" rx="4" fill="#ffe9a8"/>
    <circle cx="44" cy="52" r="16" fill="#ffd9b8"/><circle cx="76" cy="46" r="18" fill="#ffd9b8"/><circle cx="106" cy="54" r="14" fill="#ffd9b8"/><circle cx="62" cy="66" r="11" fill="#ffd9b8"/><circle cx="90" cy="68" r="10" fill="#ffd9b8"/></svg>` });
  dio.addSprite({ x: 600, y: 60, w: 90, h: 130, shadow: 0.6, html: `<svg viewBox="0 0 90 130"><path d="M24 90 H66 L60 128 H30Z" fill="#ff8a3d"/><path d="M45 92 C20 70 10 40 30 30 C40 50 44 70 45 92 C46 60 50 30 66 14 C80 40 70 70 45 92 C60 70 78 60 86 66 C80 84 62 90 45 92Z" fill="#4fbf6e"/></svg>` });
  dio.wallArt('w', { along: dio.alongWall('w', 0, 120) - 60, up: 150, w: 120, h: 96, html: `<svg viewBox="0 0 120 96"><rect x="2" y="2" width="116" height="92" rx="8" fill="#fff"/><rect x="10" y="10" width="100" height="76" rx="4" fill="#c9e9ff"/><polygon points="${starPolygon(60, 48, 26, 11)}" fill="#ffd23f"/></svg>` });
  const shan = dio.addSprite({ x: 320, y: 470, w: 140, h: 160, html: shanSvg(), shadow: 0.7, tap: 'shan' });
  return { dio, chars: { shan }, screen, clock, phone, door };
}

// ---------------- 時間到，關電視 ----------------
async function tvGame(R) {
  const { set, dio, say, chk, race, root, members } = R;
  dio.lock(true);
  R.rot.show(false);
  if (dio.quadrant() !== 0) await dio.faceQuadrant(0, 600);
  await dio.animateTo({ z: 1.35, px: 190, py: 300 }, 800);
  chk();
  const remote = document.createElement('button');
  remote.className = 'bigbtn blue ui';
  remote.innerHTML = ICON2.remote;
  remote.style.cssText = 'left:calc(50% - 75px);bottom:24px';
  root.appendChild(remote);
  let pressed = null;
  remote.addEventListener('pointerdown', (e) => { e.stopPropagation(); sfx('click'); R.hop(remote, 'hop'); pressed?.(); });
  const hard = members.includes('yy') && !turnsOn();
  const n = hard ? 6 : 4;
  // 第一次一定是鬧鐘（先學會），之後混進門鈴、電話；鬧鐘至少一半
  const plan = ['alarm'];
  for (let i = 1; i < n; i++) plan.push(Math.random() < (hard ? 0.45 : 0.35) ? pick(['doorbell', 'phone']) : 'alarm');
  if (plan.filter((x) => x !== 'alarm').length === 0) plan[n - 1] = 'doorbell';
  try {
    set.screen.classList.add('on');
    await say('shan', 'tv_go');
    chk();
    var tvDots = roundDots(root, n);   // 看得到還有幾次
    for (let i = 0; i < n; i++) {
      tvDots.set(i);
      if (turnsOn()) { await callTurn(); chk(); }
      set.screen.classList.add('on');
      sfx('tick');
      setHint(() => null);
      // 先看一下卡通；這時候按遙控器 → 還沒響喔
      const waitMs = 2500 + Math.random() * 2500;
      let saidNotYet = 0;
      await race(new Promise((resolve) => {
        setTimeout(resolve, waitMs);
        pressed = () => { if (Date.now() - saidNotYet > 3000) { saidNotYet = Date.now(); say('shan', 'tv_not_yet'); } };
      }));
      pressed = null;
      chk();
      const ev = plan[i];
      const win = levelNow(R.profile) === 'hard' ? 3600 : 5000;
      if (ev === 'alarm') {
        set.clock.el.classList.add('ring-anim');
        let ringing = true;
        const ring = async () => { while (ringing && R.alive()) { sfx('alarm'); await wait(1000); } };
        ring();
        setHint(() => remote);
        const ok = await race(new Promise((resolve) => {
          const t = setTimeout(() => resolve(false), win);
          pressed = () => { clearTimeout(t); resolve(true); };
        }));
        pressed = null;
        if (!ok) {
          await say('shan', 'tv_late');
          await race(new Promise((resolve) => {
            const t = setTimeout(resolve, 8000);
            pressed = () => { clearTimeout(t); resolve(); };
          }));
          pressed = null;
        }
        ringing = false;
        set.clock.el.classList.remove('ring-anim');
        sfx('tvoff');
        set.screen.classList.remove('on');
        R.burstAt(remote, { n: 16, stars: true, colors: ['#ffd23f', '#fff3a0'] });
        if (ok) await say('shan', i % 2 ? 'tv_good2' : 'tv_good');
      } else {
        const target = ev === 'phone' ? set.phone.el : set.door;
        sfx(ev);
        if (ev === 'phone') target.classList.add('ring-anim'); else target.classList.add('door-glow');
        const tricked = await race(new Promise((resolve) => {
          const t = setTimeout(() => resolve(false), 3200);
          pressed = () => { clearTimeout(t); resolve(true); };
        }));
        pressed = null;
        target.classList.remove('ring-anim', 'door-glow');
        if (tricked) { sfx('giggle'); await say('shan', ev === 'phone' ? 'tv_phone' : 'tv_doorbell'); }
        else { sfx('sparkle'); await say('shan', 'tv_held'); }
      }
      chk();
      if (i < n - 1) {
        await wait(600);
        if (turnsOn()) nextTurn({ say: false });
      }
    }
    setHint(null);
    set.screen.classList.remove('on');
    await say('shan', 'tv_done');
  } finally {
    remote.remove();
    tvDots?.remove();
    set.screen.classList.add('on');
  }
}

// ---------------- 誰按電鈴？ ----------------
async function doorGame(R) {
  const { set, dio, say, chk, race, root, members } = R;
  dio.lock(true);
  R.rot.show(false);
  if (dio.quadrant() !== 0) await dio.faceQuadrant(0, 600);
  await dio.animateTo({ z: 1.2, px: 400, py: 200 }, 800);
  chk();
  const hard = members.includes('yy') && !turnsOn();
  const fam = hard ? shuffle(FAMILY) : shuffle(FAMILY).slice(0, 2);
  const str = hard ? shuffle(STRANGERS) : shuffle(STRANGERS).slice(0, 2);
  // 第一個是家人（先學會開門），陌生人和家人交錯
  let visitors;
  for (let k = 0; k < 30; k++) {
    visitors = shuffle([...fam, ...str]);
    if (FAMILY.includes(visitors[0]) && !visitors.some((v, i) => i >= 2 && STRANGERS.includes(v) && STRANGERS.includes(visitors[i - 1]) && STRANGERS.includes(visitors[i - 2]))) break;
  }
  const entered = [];
  try {
    await say('shan', 'door_go');
    chk();
    for (let i = 0; i < visitors.length; i++) {
      const v = visitors[i];
      const family = FAMILY.includes(v);
      if (turnsOn()) { await callTurn(); chk(); }
      // 門鈴響、門發光
      sfx('doorbell');
      set.door.classList.add('door-glow');
      if (i > 0) await say('shan', 'door_ring');
      await wait(500);
      chk();
      const P = R.panel('doorpanel', { host: 'shan', hostSvg: shanSvg() });
      P.el.innerHTML = `<div class="peephole"><div class="who">${personSvg(v)}</div></div>`;
      const open = document.createElement('button');
      open.className = 'bigbtn green';
      open.innerHTML = ICON2.openDoor;
      open.style.cssText = 'left:220px;top:470px';
      const adult = document.createElement('button');
      adult.className = 'bigbtn blue';
      adult.innerHTML = ICON2.getAdult;
      adult.style.cssText = 'left:570px;top:470px';
      P.el.append(open, adult);
      if (levelNow(R.profile) === 'easy') (family ? open : adult).classList.add('glowy-2d');
      setHint(() => (family ? open : adult));
      let choice;
      try {
        choice = await race(new Promise((resolve) => {
          open.addEventListener('click', () => resolve('open'));
          adult.addEventListener('click', () => resolve('adult'));
        }));
        sfx('tap');
        if (!family && choice === 'open') {
          // 陌生人：不能開門，一定要去找大人
          R.hop(open, 'shake');
          sfx('soft');
          open.disabled = true;
          open.style.opacity = '.4';
          adult.classList.add('glowy-2d');
          await say('shan', 'door_stranger_stop');
          chk();
          await race(new Promise((resolve) => adult.addEventListener('click', () => resolve())));
          choice = 'adult';
        }
      } finally {
        P.close();
        set.door.classList.remove('door-glow');
      }
      chk();
      if (family) {
        if (choice === 'adult') await say('shan', 'door_family_adult');
        sfx('door');
        // 家人走進客廳，站到沙發旁邊
        const spot = [[440, 230], [440, 310], [440, 390]][entered.length];
        const sp = dio.addSprite({ x: 450, y: 14, w: 74, h: 142, html: personSvg(v), shadow: 0.6 });
        entered.push(sp);
        walk(sp, spot[0], spot[1]);
        R.burstAt(sp.el, { n: 14, stars: true, colors: ['#ffd23f', '#fff3a0'] });
        await say('shan', `door_${v}`);
      } else {
        sfx('sparkle');
        R.burstAt(set.chars.shan.el, { n: 16, stars: true, colors: ['#ffd23f', '#fff3a0'] });
        await say('shan', v === 'courier' ? 'door_courier_good' : 'door_stranger_good');
      }
      chk();
      if (turnsOn() && i < visitors.length - 1) nextTurn({ say: false });
      await wait(500);
    }
    setHint(null);
    sfx('fanfare');
    entered.forEach((sp, i) => setTimeout(() => R.hop(sp.el), i * 150));
    await say('shan', 'door_done');
    await wait(800);
  } finally {
    entered.forEach((sp) => sp.remove());
  }
}
function walk(sp, x1, y1, ms = 1200) {
  const { x: x0, y: y0 } = sp;
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / ms);
    sp.move(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, Math.abs(Math.sin(k * Math.PI * 4)) * 10);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------------- 明星舞台 ----------------
const MOVES = ['up', 'jump', 'spin', 'squat'];
async function stageGame(R) {
  const { set, dio, say, chk, race, root, members } = R;
  dio.lock(true);
  R.rot.show(false);
  if (dio.quadrant() !== 0) await dio.faceQuadrant(0, 600);
  await dio.animateTo({ z: 1.3, px: 330, py: 420 }, 800);
  chk();
  stopMusic();
  const spot = div('spotlight');
  root.appendChild(spot);
  const shanEl = set.chars.shan.el;
  const lane = div('lane', '<div class="hit"></div>');
  const drum = document.createElement('button');
  drum.className = 'bigbtn ui';
  drum.innerHTML = ICON2.drum;
  drum.style.cssText = 'left:calc(50% - 75px);bottom:24px;width:150px;height:150px';
  try {
    await say('shan', 'stage_go');
    chk();
    const moves = shuffle(MOVES).slice(0, 3);
    var stDots = roundDots(root, 3);
    for (let r = 0; r < 3; r++) {
      stDots.set(r);
      chk();
      if (turnsOn()) { await callTurn(); chk(); }
      // 1. 跟著做動作（真的站起來做）
      const mv = moves[r];
      shanEl.classList.add(`mv-${mv}`);
      sfx('boing');
      await say('shan', `move_${mv}`);
      await wait(3200);
      shanEl.classList.remove(`mv-${mv}`);
      chk();
      sfx('sparkle');
      await say('shan', 'move_good');
      chk();
      // 2. 跟著拍子打鼓
      if (r === 0) { await say('shan', 'drum_go'); chk(); }
      root.append(lane, drum);
      const hard = levelNow(R.profile) === 'hard';
      const hits = await drumRound(R, lane, drum, { bpm: hard ? 100 : 84, win: hard ? 0.22 : 0.3, extra: hard });
      chk();
      lane.remove();
      drum.remove();
      await say('shan', hits >= 5 ? 'drum_great' : 'drum_ok');
      if (turnsOn() && r < 2) nextTurn({ say: false });
    }
    sfx('applause');
    burst(stageW() / 2, 360, { n: 36, spread: 320 });
    await say('shan', 'stage_done');
    chk();
    // 自己編節奏（岳岳喜歡音樂）：三顆鼓，想怎麼打都可以，12 秒後自己結束
    const kit = div('freedrums ui', ['drum', 'tap', 'ding'].map((k, i) => `<button class="fdrum" data-s="${k}" style="--c:${['#ff5d73', '#ffb627', '#3ea8e0'][i]}">${ICON2.drum}</button>`).join(''));
    root.appendChild(kit);
    kit.addEventListener('pointerdown', (e) => { const b = e.target.closest('.fdrum'); if (!b) return; e.stopPropagation(); sfx(b.dataset.s); b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); shanEl.classList.toggle('mv-jump'); });
    await say('shan', 'drum_free');
    await wait(12000);
    kit.remove();
    chk();
    await say('shan', 'drum_free_end');
  } finally {
    document.querySelector('.freedrums')?.remove();
    stDots?.remove();
    spot.remove();
    lane.remove();
    drum.remove();
    MOVES.forEach((m) => shanEl.classList.remove(`mv-${m}`));
    playMusic(R.music());
  }
}

// 一回合打鼓：先數四拍，再來 8 個音符（岳岳版多一個半拍）
export function drumRound(R, lane, drum, { bpm, win, extra, onHit = null }) {
  return R.race(new Promise((resolve) => {
    const beat = 60 / bpm;
    const lead = 1.4;
    const t0 = performance.now() / 1000 + 0.6;
    const times = [];
    for (let i = 0; i < 8; i++) times.push(t0 + (4 + i) * beat);
    if (extra) times.splice(5, 0, t0 + 8.5 * beat);
    const notes = [];
    const laneH = 520;
    // 數拍子
    for (let i = 0; i < 4; i++) setTimeout(() => sfx('tick'), (t0 + i * beat - performance.now() / 1000) * 1000);
    times.forEach((t) => {
      const spawnIn = (t - lead - performance.now() / 1000) * 1000;
      setTimeout(() => {
        if (!R.alive()) return;
        const n = div('beatnote');
        lane.appendChild(n);
        const nt = { t, el: n, hit: false };
        notes.push(nt);
        void n.offsetWidth;
        n.style.transitionDuration = `${lead}s`;
        n.style.top = `${laneH - 120 + 15}px`;
        setTimeout(() => { if (!nt.hit) { n.style.opacity = '0'; } setTimeout(() => n.remove(), 400); }, (lead + 0.35) * 1000);
      }, Math.max(0, spawnIn));
    });
    let hits = 0;
    setHint(() => drum);
    const onTap = (e) => {
      e.stopPropagation();
      sfx('drum');
      R.hop(drum, 'hop');
      const now = performance.now() / 1000;
      let best = null, bd = win;
      for (const nt of notes) { const d = Math.abs(nt.t - now); if (!nt.hit && d < bd) { bd = d; best = nt; } }
      if (best) {
        best.hit = true;
        best.el.classList.add('hit-ok');
        hits++;
        sfx('sparkle');
        R.burstAt(drum, { n: 8, spread: 80, stars: true, colors: ['#ffd23f', '#fff3a0'] });
        onHit?.(hits);
      }
    };
    drum.addEventListener('pointerdown', onTap);
    const end = times[times.length - 1] + 0.8;
    setTimeout(() => { drum.removeEventListener('pointerdown', onTap); setHint(null); resolve(hits); }, (end - performance.now() / 1000) * 1000);
  }));
}
