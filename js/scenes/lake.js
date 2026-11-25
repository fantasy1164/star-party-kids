// 日月潭（11/26）：白鹿鹿鹿
//   碼頭（pier）：穿救生衣、上船規矩、划船跟節拍（岳岳的音樂；兩個人一人一支槳）、水面倒影（愷愷的空間）
//   伊達邵（thao）：邵族杵音（長的低音、短的高音；愷愷排長短、岳岳跟著敲）、湖邊安全（轉一轉找危險）
// 原則跟其他地方一樣：一關 1～2 分鐘、每次碰都有回饋、錯兩次就亮答案、做錯不扣分、一起玩輪流。
import { runRoom } from './room-base.js';
import { sortGame, findGame, roundDots } from './kit.js';
import { createDiorama } from '../engine/diorama.js';
import { div, wait, shuffle, pick, stageRect, burst } from '../core/dom.js';
import { sfx, playNote, think } from '../core/audio.js';
import { turnsOn, callTurn, nextTurn, levelNow, whoseTurn, turnTo } from '../core/turns.js';
import { setHint } from '../core/session.js';
import { shanSvg, kidSvg } from '../art/stars.js';
import { personSvg } from '../art/more.js';
import { itemSvg } from '../art/town.js';
import { luoluSvg, LAKE, BOARD, HAZARD, MIRROR } from '../art/lake.js';

const hello = (p) => (ph) => `${p}_hello_${ph === 'night' ? 'evening' : ph === 'morning' ? 'morning' : 'day'}`;
const hardSolo = (R) => R.members.length === 1 && R.members[0] === 'yy';
const easyNow = (R) => levelNow(R.profile) === 'easy';
const tree = (c = '#4fbf6e') => `<svg viewBox="0 0 80 110"><rect x="34" y="70" width="12" height="38" rx="5" fill="#a9744f"/><circle cx="40" cy="48" r="34" fill="${c}"/></svg>`;
const rock = (c = '#8d96a3') => `<svg viewBox="0 0 100 70"><path d="M6 70 Q4 30 34 20 Q60 6 84 28 Q100 46 96 70Z" fill="${c}"/><path d="M30 30 Q44 22 56 26" stroke="#fff" stroke-width="4" opacity=".3" fill="none"/></svg>`;
const LUO = () => luoluSvg();
const lakeFloor = 'background: linear-gradient(180deg, #3ea8e0 0 40%, #7fd3ff 40% 43%, #e8d8a8 43% 50%, #a6dd86 50% 100%)';

// ============================== 碼頭（鹿鹿） ==============================
export function mountPier(root, app) {
  return runRoom(root, app, {
    id: 'pier', host: 'luolu', back: 'town',
    build() {
      const dio = createDiorama({ w: 760, d: 620, walls: false, zoom: 0.9, cy: 0.6, base: '#3ea8e0', rim: 24, skirt: '#7cc46a', horizon: 'mountain', floorCss: lakeFloor });
      // 木頭棧橋伸進湖裡、船、救生衣架、售票亭、遠遠的拉魯島
      dio.addBox({ x: 330, y: 40, w: 100, d: 300, h: 14, color: '#b8865a', faces: { t: `<svg viewBox="0 0 100 300" width="100%" height="100%" preserveAspectRatio="none">${[...Array(15)].map((_, i) => `<path d="M0 ${i * 20 + 10} H100" stroke="#9c6c42" stroke-width="2"/>`).join('')}</svg>` } });
      [[330, 60], [416, 60], [330, 200], [416, 200]].forEach(([x, y]) => dio.addBox({ x, y, w: 14, d: 14, h: 30, color: '#8a5a32' }));
      dio.addSprite({ x: 230, y: 120, z: 2, w: 150, h: 110, shadow: 0, html: LAKE.rowboat });
      dio.addSprite({ x: 560, y: 90, z: 2, w: 190, h: 140, shadow: 0, html: LAKE.yacht });
      dio.addSprite({ x: 620, y: 30, z: 2, w: 150, h: 130, shadow: 0, html: LAKE.island });
      dio.addBox({ x: 590, y: 400, w: 110, d: 80, h: 80, color: '#fff3d6', faces: { s: `<svg viewBox="0 0 110 80" width="100%" height="100%" preserveAspectRatio="none"><rect x="15" y="20" width="80" height="34" fill="#bfe6ff"/><rect x="15" y="60" width="80" height="20" fill="#3ea8e0"/></svg>` } });
      dio.addGable({ x: 590, y: 400, z: 80, w: 110, d: 80, h: 40, over: 8, color: '#3ea8e0', wallColor: '#fff3d6', ridge: 'x' });
      dio.addBox({ x: 120, y: 420, w: 120, d: 26, h: 90, color: '#a9744f' });
      [0, 1, 2].forEach((i) => dio.addSprite({ x: 140 + i * 40, y: 450, z: 30, w: 50, h: 60, shadow: 0, html: LAKE.vest }));
      [[60, 560], [700, 580], [40, 380]].forEach(([x, y], i) => dio.addSprite({ x, y, w: 80, h: 110, shadow: 0.6, html: tree(i % 2 ? '#3f9f5a' : '#4fbf6e') }));
      const luolu = dio.addSprite({ x: 380, y: 420, w: 120, h: 128, html: luoluSvg(), shadow: 0.5, tap: 'luolu' });
      const shan = dio.addSprite({ x: 470, y: 520, w: 100, h: 114, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { luolu, shan } };
    },
    music: () => 'lake',
    lines: { hello: hello('pr'), pick: 'pr_pick', next: 'pr_next', allDone: [['luolu', 'pr_all_done'], ['shan', 'pr_all_done']] },
    games: [
      { id: 'vest', icon: LAKE.vest, marker: { x: 180, y: 430, z: 200 }, run: vestGame },
      { id: 'board', icon: BOARD.sit, marker: { x: 380, y: 300, z: 160 }, run: (R) => sortGame(R, {
        host: 'luolu', hostSvg: LUO(), intro: 'pr_board_go',
        bins: [{ id: 'good', html: itemSvg('good') }, { id: 'bad', html: itemSvg('bad') }],
        items: shuffle([
          { k: 'wait', bin: 'good', html: BOARD.wait }, { k: 'queue', bin: 'good', html: BOARD.queue }, { k: 'sit', bin: 'good', html: BOARD.sit },
          { k: 'stand', bin: 'bad', html: BOARD.stand }, { k: 'hand', bin: 'bad', html: BOARD.hand }, ...(hardSolo(R) ? [{ k: 'jump', bin: 'bad', html: BOARD.jump }] : []),
        ]),
        wrong: (it) => `pr_board_${it.k}`, done: 'pr_board_done' }) },
      { id: 'row', icon: LAKE.rowboat, marker: { x: 230, y: 120, z: 170 }, run: rowGame },
      { id: 'mirror', icon: MIRROR.sailboat, marker: { x: 560, y: 160, z: 220 }, run: mirrorGame },
    ],
    playful(name, R) { if (name === 'luolu') { sfx('boing'); R.hop(R.set.chars.luolu.el); R.say('luolu', 'luolu_hi'); return true; } return false; },
  });
}

// ---- 穿救生衣：點救生衣穿上 → 扣三個扣子 → 帶子往下拉緊 ----
const BK_Y = [134, 162, 190];   // 三個扣子（小孩圖的座標；畫面上放大 1.875 倍）
const VEST_ON = (shut, tight) => `<svg viewBox="0 0 160 300" width="100%" height="100%">
  <g class="vbody${tight ? ' tight' : ''}"><path d="M36 116 L60 108 Q80 128 100 108 L124 116 L128 206 Q80 218 32 206Z" fill="#ff7a1a"/><path d="M80 124 V212" stroke="#d65a00" stroke-width="3"/>
  <path d="M42 122 L46 200 M118 122 L114 200" stroke="#ffd2a8" stroke-width="4" opacity=".8"/>
  ${BK_Y.map((y, i) => shut[i]
    ? `<rect x="40" y="${y}" width="80" height="7" fill="#2a2f3a"/><rect x="72" y="${y - 3}" width="16" height="13" rx="3" fill="#555b6a"/>`
    : `<rect x="40" y="${y}" width="30" height="7" fill="#2a2f3a"/><rect x="92" y="${y}" width="28" height="7" fill="#2a2f3a"/><rect x="64" y="${y - 3}" width="8" height="13" rx="2" fill="#555b6a"/><rect x="90" y="${y - 3}" width="8" height="13" rx="2" fill="#555b6a"/>`).join('')}
  <rect x="74" y="${tight ? 206 : 214}" width="12" height="${tight ? 18 : 30}" rx="4" fill="#2a2f3a"/></g></svg>`;
async function vestGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('vestpanel', { host: 'luolu', hostSvg: LUO() });
  const el = P.el;
  const who = () => (turnsOn() ? whoseTurn() : R.members[0]) || 'yy';
  let dots = null;
  try {
    el.innerHTML = `<div class="vest-kid">${kidSvg(who(), ['shirt', 'pants'])}</div><div class="vest-on"></div><button class="vest-item">${LAKE.vest}</button>
      ${[0, 1, 2].map((i) => `<button class="vest-bk" data-i="${i}" style="top:${50 + BK_Y[i] * 1.875 - 23}px"></button>`).join('')}<button class="vest-strap"><i></i></button>`;
    const kidEl = el.querySelector('.vest-kid'), on = el.querySelector('.vest-on'), item = el.querySelector('.vest-item');
    const bks = [...el.querySelectorAll('.vest-bk')], strap = el.querySelector('.vest-strap');
    dots = roundDots(el, 3);
    const shut = [false, false, false];
    const draw = (tight = false) => { on.innerHTML = VEST_ON(shut, tight); };
    await say('luolu', 'pr_vest_go');
    chk();
    await callTurn();
    chk();
    let lastWrong = 0, wrongs = 0;
    const wrongTap = (target) => {
      sfx('soft');
      if (Date.now() - lastWrong > 3500) { lastWrong = Date.now(); say('luolu', 'pr_vest_wrong'); }
      if (++wrongs >= 2) target.classList.add('glowy-2d');
    };
    const step = (target, line, ok) => race(new Promise((resolve) => {
      wrongs = 0;
      if (easyNow(R)) target.classList.add('glowy-2d');
      setHint(() => target);
      say('luolu', line);
      const h = (e) => {
        const t = e.target.closest('button');
        if (!t) return;
        e.stopPropagation();
        if (ok(t)) { el.removeEventListener('pointerdown', h); resolve(t); } else wrongTap(target);
      };
      el.addEventListener('pointerdown', h);
    }));
    // 1. 穿上
    dots.set(0);
    await step(item, 'pr_vest_1', (t) => t === item);
    chk();
    item.classList.add('gone');
    sfx('whoosh');
    draw();
    on.classList.add('show');
    kidEl.classList.add('hop');
    await wait(500);
    sfx('sparkle');
    if (turnsOn()) { await nextTurn({ say: false }); kidEl.innerHTML = kidSvg(who(), ['shirt', 'pants']); }
    // 2. 三個扣子（一個一個）
    dots.set(1);
    bks.forEach((b) => b.classList.add('show'));
    say('luolu', 'pr_vest_2');
    for (let i = 0; i < 3; i++) {
      const b = bks.find((x) => !shut[+x.dataset.i]);
      await race(new Promise((resolve) => {
        wrongs = 0;
        bks.forEach((x) => x.classList.toggle('glowy-2d', easyNow(R) && !shut[+x.dataset.i]));
        setHint(() => b);
        const h = (e) => {
          const t = e.target.closest('button');
          if (!t) return;
          e.stopPropagation();
          if (t.classList.contains('vest-bk') && !shut[+t.dataset.i]) {
            el.removeEventListener('pointerdown', h);
            shut[+t.dataset.i] = true;
            t.classList.remove('glowy-2d', 'show');
            sfx('click');
            R.burstAt(t, { n: 8, stars: true });
            draw();
            resolve();
          } else wrongTap(b);
        };
        el.addEventListener('pointerdown', h);
      }));
      chk();
    }
    sfx('sparkle');
    if (turnsOn()) { await nextTurn({ say: false }); kidEl.innerHTML = kidSvg(who(), ['shirt', 'pants']); }
    // 3. 帶子拉緊（往下拉；點一下也可以）
    dots.set(2);
    strap.classList.add('show');
    await race(new Promise((resolve) => {
      if (easyNow(R)) strap.classList.add('glowy-2d');
      setHint(() => strap);
      say('luolu', 'pr_vest_3');
      let y0 = null;
      const done = () => { strap.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); resolve(); };
      const down = (e) => { e.stopPropagation(); y0 = e.clientY; strap.classList.add('pull'); };
      const up = (e) => { if (y0 === null) return; y0 = null; strap.classList.remove('pull'); done(); };
      strap.addEventListener('pointerdown', down);
      window.addEventListener('pointerup', up);
      el.addEventListener('pointerdown', (e) => { if (!e.target.closest('.vest-strap') && e.target.closest('button')) wrongTap(strap); });
    }));
    chk();
    strap.classList.remove('show', 'glowy-2d');
    sfx('slide');
    draw(true);
    dots.done();
    sfx('fanfare');
    R.burstAt(on, { n: 20, stars: true });
    await say('luolu', 'pr_vest_done');
    await wait(300);
  } finally { setHint(null); P.close(); }
}

// ---- 划船跟節拍：聽鼓聲，咚一下划一下，左右輪流 ----
// 對的槳、在鼓聲前後一點點按到 → 船往前；按錯邊 → 船歪一下（換另一邊）；沒跟上鼓聲 → 船晃一下（等咚）。
// 兩個人一起玩：左邊的槳是第一個人（岳岳）、右邊是第二個人（愷愷），要配合才會直直走。
async function rowGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('rowpanel', { host: 'luolu', hostSvg: LUO() });
  const el = P.el;
  const two = R.members.length > 1;
  const easy = !hardSolo(R);
  const goal = easy ? 10 : 12;
  let beatMs = easy ? 920 : 800, win = easy ? 380 : 300;
  let timer = 0;
  try {
    const face = (id) => (two ? `<span class="oar-kid">${kidSvg(id, ['shirt'])}</span>` : '');
    el.innerHTML = `<div class="row-water"></div><div class="row-island">${LAKE.island}</div><div class="row-drum">${LAKE.drum}</div>
      <div class="row-track"><i class="row-dot"></i></div><div class="row-boat">${LAKE.rowboat}</div>
      <button class="oar l" data-s="l">${face(R.members[0])}<b></b></button><button class="oar r" data-s="r">${face(R.members[1] || R.members[0])}<b></b></button>`;
    const island = el.querySelector('.row-island'), drum = el.querySelector('.row-drum'), boat = el.querySelector('.row-boat'), dot = el.querySelector('.row-dot');
    const oars = { l: el.querySelector('.oar.l'), r: el.querySelector('.oar.r') };
    await say('luolu', two ? 'pr_row_two' : 'pr_row_go');
    chk();
    let n = 0, want = 'l', last = 0, halfSaid = false, lastBeatSay = 0, lastTurnSay = 0, miss = 0, lastGood = Date.now();
    const show = () => {
      const k = n / goal;
      island.style.transform = `translateX(-50%) scale(${0.45 + k * 0.9})`;
      dot.style.bottom = `${k * 100}%`;
      Object.entries(oars).forEach(([s, o]) => o.classList.toggle('want', s === want));
    };
    show();
    // 鼓聲：一直打，按的時候看離最近的一拍多遠
    let next = performance.now() + 600;
    const beat = () => {
      const now = performance.now();
      if (now - next > beatMs) next = now;   // 畫面卡住過（切到背景）：不要一口氣補打好幾下
      if (now >= next - 8) {
        last = next;
        next += beatMs;
        sfx('rowdrum');
        drum.classList.remove('hit'); void drum.offsetWidth; drum.classList.add('hit');
        oars[want].classList.remove('cue'); void oars[want].offsetWidth; oars[want].classList.add('cue');
      }
      timer = requestAnimationFrame(beat);
    };
    timer = requestAnimationFrame(beat);
    setHint(() => oars[want]);
    await race(new Promise((resolve) => {
      const tap = (e) => {
        const o = e.target.closest('.oar');
        if (!o) return;
        e.stopPropagation();
        const now = performance.now();
        const off = Math.min(Math.abs(now - last), Math.abs(next - now));
        o.classList.remove('stroke'); void o.offsetWidth; o.classList.add('stroke');
        if (o.dataset.s !== want) {
          sfx('soft');
          boat.classList.remove('turn-l', 'turn-r', 'wobble'); void boat.offsetWidth; boat.classList.add(o.dataset.s === 'l' ? 'turn-r' : 'turn-l');
          if (now - lastTurnSay > 4500) { lastTurnSay = now; say('luolu', 'pr_row_turn'); }
          if (++miss >= 2) oars[want].classList.add('glowy-2d');
          return;
        }
        if (off > win) {
          sfx('paddle');
          boat.classList.remove('turn-l', 'turn-r', 'wobble'); void boat.offsetWidth; boat.classList.add('wobble');
          if (now - lastBeatSay > 5000) { lastBeatSay = now; say('luolu', 'pr_row_beat'); }
          if (++miss >= 3) { win = Math.min(480, win + 60); }   // 一直沒跟上：拍子的範圍放寬一點
          return;
        }
        // 划到了！
        miss = 0;
        lastGood = Date.now();
        oars[want].classList.remove('glowy-2d');
        sfx('paddle');
        playNote(['C5', 'D5', 'E5', 'G5', 'A5', 'C6'][n % 6], 'marimba', 0.2);
        boat.classList.remove('turn-l', 'turn-r', 'wobble', 'go'); void boat.offsetWidth; boat.classList.add('go');
        n++;
        want = want === 'l' ? 'r' : 'l';
        show();
        if (!halfSaid && n >= goal / 2) { halfSaid = true; say('luolu', 'pr_row_half'); }
        if (n >= goal) { el.removeEventListener('pointerdown', tap); resolve(); }
      };
      el.addEventListener('pointerdown', tap);
      // 卡住 15 秒：鼓聲慢一點、對的槳發亮
      const help = setInterval(() => { if (n >= goal) { clearInterval(help); return; } if (Date.now() - lastGood > 15000) { lastGood = Date.now(); beatMs = Math.min(1100, beatMs + 120); win = Math.min(480, win + 60); oars[want].classList.add('glowy-2d'); } }, 1000);
      R.app.onLeave(() => clearInterval(help));
    }));
    chk();
    cancelAnimationFrame(timer);
    timer = 0;
    sfx('splash');
    sfx('fanfare');
    island.classList.add('arrive');
    R.burstAt(island, { n: 24, stars: true });
    await say('luolu', 'pr_row_done');
    await wait(300);
  } finally { if (timer) cancelAnimationFrame(timer); setHint(null); P.close(); }
}

// ---- 水面倒影：岸上的東西，水裡的倒影是上下顛倒的 ----
// 愷愷（easy）：另外兩個選項是「一樣的」和「左右反過來（還是正的）」→ 只有一個是倒過來的。
// 岳岳：另外兩個是「一樣的」和「轉半圈（倒過來、但左右也反了）」→ 要看清楚左右。
async function mirrorGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('mirrorpanel', { host: 'luolu', hostSvg: LUO() });
  const el = P.el;
  const rounds = shuffle(Object.keys(MIRROR)).slice(0, hardSolo(R) ? 4 : 3);
  try {
    el.innerHTML = `<div class="mr-sky"></div><div class="mr-water"></div><div class="mr-obj"></div><div class="mr-slot"></div><div class="mr-opts"></div>`;
    const obj = el.querySelector('.mr-obj'), slot = el.querySelector('.mr-slot'), opts = el.querySelector('.mr-opts');
    const dots = roundDots(el, rounds.length);
    await say('luolu', 'pr_mirror_go');
    chk();
    await callTurn();
    chk();
    for (let r = 0; r < rounds.length; r++) {
      dots.set(r);
      const k = rounds[r];
      obj.innerHTML = MIRROR[k];
      obj.classList.remove('pop'); void obj.offsetWidth; obj.classList.add('pop');
      slot.innerHTML = '';
      slot.classList.remove('filled');
      const easy = easyNow(R);
      const kinds = shuffle(['flip', 'same', easy ? 'side' : 'rot']);
      opts.innerHTML = kinds.map((t) => `<button class="mr-opt" data-t="${t}"><i class="t-${t}">${MIRROR[k]}</i></button>`).join('');
      const right = opts.querySelector('[data-t="flip"]');
      setHint(() => right);
      think(true);
      await race(new Promise((resolve) => {
        let wrongs = 0, busy = false;
        opts.querySelectorAll('.mr-opt').forEach((b) => b.addEventListener('pointerdown', async (e) => {
          e.stopPropagation();
          if (busy || b.disabled) return;
          if (b.dataset.t === 'flip') {
            busy = true;
            think(false);
            sfx('sparkle');
            b.classList.add('right');
            slot.innerHTML = `<i class="t-flip">${MIRROR[k]}</i>`;
            slot.classList.add('filled');
            R.burstAt(slot, { n: 14, stars: true, colors: ['#bfe9ff', '#fff', '#ffd23f'] });
            await say('luolu', 'pr_mirror_ok');
            resolve();
            return;
          }
          sfx('soft');
          b.disabled = true;
          b.classList.add('wrong');
          say('luolu', b.dataset.t === 'rot' ? 'pr_mirror_side' : 'pr_mirror_up');
          if (++wrongs >= 1 && easy) right.classList.add('glowy-2d');
          if (wrongs >= 2) right.classList.add('glowy-2d');
        }));
      }));
      chk();
      think(false);
      await wait(400);
      if (turnsOn() && r < rounds.length - 1) await nextTurn({ say: false });
    }
    dots.done();
    sfx('fanfare');
    await say('luolu', 'pr_mirror_done');
    await wait(300);
  } finally { think(false); setHint(null); P.close(); }
}

// ============================== 伊達邵（鹿鹿） ==============================
export function mountThao(root, app) {
  return runRoom(root, app, {
    id: 'thao', host: 'luolu', back: 'town',
    build() {
      const dio = createDiorama({ w: 760, d: 620, walls: false, zoom: 0.9, cy: 0.6, base: '#3ea8e0', rim: 24, skirt: '#7cc46a', horizon: 'mountain', floorCss: lakeFloor });
      // 湖邊的欄杆、小碼頭、茅草屋、石板和杵、石頭
      dio.addBox({ x: 40, y: 268, w: 460, d: 6, h: 34, color: '#a9744f' });
      for (let x = 40; x <= 500; x += 46) dio.addBox({ x, y: 266, w: 10, d: 10, h: 44, color: '#8a5a32' });
      dio.addBox({ x: 580, y: 80, w: 80, d: 240, h: 12, color: '#b8865a' });
      dio.addSprite({ x: 520, y: 120, z: 2, w: 140, h: 100, shadow: 0, html: LAKE.rowboat });
      [[150, 430], [610, 470]].forEach(([x, y]) => {
        dio.addBox({ x: x - 60, y: y - 40, w: 120, d: 80, h: 70, color: '#c99a6a', faces: { s: `<svg viewBox="0 0 120 70" width="100%" height="100%" preserveAspectRatio="none"><rect x="48" y="26" width="24" height="44" fill="#6a4a2a"/><path d="M0 18 H120" stroke="#e2453a" stroke-width="5"/><path d="M0 26 H120" stroke="#3a6fd8" stroke-width="3" stroke-dasharray="8 6"/></svg>` } });
        dio.addGable({ x: x - 60, y: y - 40, z: 70, w: 120, d: 80, h: 50, over: 12, color: '#8a6a3a', wallColor: '#c99a6a', ridge: 'x' });
      });
      dio.addBox({ x: 330, y: 420, w: 120, d: 70, h: 14, color: '#8d96a3' });
      [0, 1, 2].forEach((i) => dio.addSprite({ x: 350 + i * 40, y: 450, z: 14, w: 50, h: 90, shadow: 0, html: LAKE.pestle }));
      dio.addSprite({ x: 460, y: 300, w: 90, h: 60, shadow: 0.3, html: rock() });
      [[40, 560], [720, 600], [720, 330]].forEach(([x, y], i) => dio.addSprite({ x, y, w: 80, h: 110, shadow: 0.6, html: tree(i % 2 ? '#3f9f5a' : '#4fbf6e') }));
      const luolu = dio.addSprite({ x: 300, y: 530, w: 120, h: 128, html: luoluSvg(), shadow: 0.5, tap: 'luolu' });
      const shan = dio.addSprite({ x: 470, y: 560, w: 100, h: 114, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { luolu, shan } };
    },
    music: () => 'lake',
    lines: { hello: hello('th'), pick: 'th_pick', next: 'th_next', allDone: [['luolu', 'th_all_done'], ['shan', 'th_all_done']] },
    games: [
      { id: 'pestle', icon: LAKE.pestle, marker: { x: 390, y: 450, z: 180 }, run: pestleGame },
      { id: 'safe', icon: HAZARD.slippery, marker: { x: 260, y: 270, z: 170 }, run: (R) => findGame(R, {
        host: 'luolu', intro: 'th_safe_go', found: (id) => `th_found_${id}`, hiddenLine: 'th_safe_hidden', done: 'th_safe_done',
        items: [
          { id: 'fence', x: 200, y: 262, z: 0, w: 100, h: 100, html: HAZARD.fence },
          { id: 'slippery', x: 470, y: 250, z: 0, w: 100, h: 90, html: HAZARD.slippery },
          { id: 'alone', x: 610, y: 360, z: 0, w: 90, h: 90, html: HAZARD.alone, hidden: true, seenFrom: [1, 2] },
          { id: 'run', x: 150, y: 355, z: 0, w: 90, h: 90, html: HAZARD.run, hidden: true, seenFrom: [2, 3] },
        ],
      }) },
    ],
    playful(name, R) { if (name === 'luolu') { sfx('boing'); R.hop(R.set.chars.luolu.el); R.say('luolu', 'luolu_hi'); return true; } return false; },
  });
}

// ---- 杵音：長的杵聲音低、短的杵聲音高 ----
// 愷愷：先把杵從最短排到最長（排的時候一支一支響，聽到音一個一個往下）
// 岳岳：鹿鹿敲一段，跟著敲一樣的（三下、三下、四下、四下）；錯了就再聽一次，錯兩次下一支會發亮
const PITCH = ['A3', 'G3', 'E3', 'D3', 'C3'];   // 短 → 長
async function pestleGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('pestlepanel', { host: 'luolu', hostSvg: LUO() });
  const el = P.el;
  const hasKK = R.members.includes('kk'), hasYY = R.members.includes('yy');
  const N = hasYY ? 5 : 4;
  const len = (i) => 130 + i * 40;   // 第 i 支（0 最短）
  const hit = async (b, i) => {
    b.classList.remove('thud'); void b.offsetWidth; b.classList.add('thud');
    playNote(PITCH[i], 'pestle', 0.5);
    const r = stageRect(b);
    burst(r.x, r.y + r.h / 2 - 10, { n: 5, colors: ['#d8d2c4', '#fff'] });
  };
  try {
    el.innerHTML = `<div class="ps-slab"></div><div class="ps-row"></div>`;
    const row = el.querySelector('.ps-row');
    const mk = (i) => { const b = document.createElement('button'); b.className = 'ps'; b.dataset.i = i; b.style.height = `${len(i)}px`; b.innerHTML = '<i></i>'; return b; };
    await say('luolu', 'th_pestle_go');
    chk();
    // 排長短（愷愷）
    let order = [...Array(N).keys()];
    if (hasKK) {
      if (turnsOn()) await turnTo('kk');
      const slots = div('ps-slots', order.map(() => '<i></i>').join(''));
      el.appendChild(slots);
      const pile = div('ps-pile');
      el.appendChild(pile);
      shuffle(order.slice()).forEach((i) => pile.appendChild(mk(i)));
      await say('luolu', 'th_pestle_sort');
      chk();
      let k = 0, wrongs = 0, lastWrong = 0;
      const want = () => pile.querySelector(`.ps[data-i="${k}"]`);
      setHint(() => want());
      if (easyNow(R)) want().classList.add('glowy-2d');
      await race(new Promise((resolve) => {
        pile.addEventListener('pointerdown', (e) => {
          const b = e.target.closest('.ps');
          if (!b) return;
          e.stopPropagation();
          const i = +b.dataset.i;
          if (i !== k) {
            sfx('soft'); R.hop(b);
            if (Date.now() - lastWrong > 3000) { lastWrong = Date.now(); say('luolu', 'th_pestle_sort_wrong'); }
            if (++wrongs >= 2) want().classList.add('glowy-2d');
            return;
          }
          wrongs = 0;
          b.classList.remove('glowy-2d');
          slots.children[k].appendChild(b);
          hit(b, i);
          k++;
          if (k === N) { resolve(); return; }
          if (easyNow(R)) want().classList.add('glowy-2d');
        });
      }));
      chk();
      // 排好了：從短到長敲一次（音一個一個往下）
      for (let i = 0; i < N; i++) { hit(slots.children[i].firstElementChild, i); await wait(380); }
      await say('luolu', 'th_pestle_sorted');
      chk();
      slots.remove(); pile.remove();
    }
    // 跟著敲
    order.forEach((i) => row.appendChild(mk(i)));
    const ps = [...row.children];
    const lens = hasYY ? [3, 3, 4, 4] : [2, 3, 3];
    if (hasKK && hasYY && turnsOn()) await turnTo('yy');
    const dots = roundDots(el, lens.length);
    await say('luolu', 'th_pestle_listen');
    chk();
    for (let r = 0; r < lens.length; r++) {
      dots.set(r);
      const pat = [];
      for (let j = 0; j < lens[r]; j++) { let x; do x = Math.floor(Math.random() * N); while (pat.length && x === pat[pat.length - 1]); pat.push(x); }
      let fails = 0;
      for (;;) {
        // 鹿鹿敲（亮起來＋聲音）
        row.classList.add('demo');
        await wait(400);
        for (const i of pat) { ps[i].classList.add('lit'); hit(ps[i], i); await wait(560); ps[i].classList.remove('lit'); await wait(120); chk(); }
        row.classList.remove('demo');
        if (r === 0 && fails === 0) await say('luolu', 'th_pestle_your');
        chk();
        // 換小孩敲
        think(true);
        const ok = await race(new Promise((resolve) => {
          let j = 0;
          const glow = () => ps.forEach((p, i) => p.classList.toggle('glowy-2d', (fails >= 2 || (easyNow(R) && fails >= 1)) && i === pat[j]));
          glow();
          setHint(() => ps[pat[j]]);
          const h = (e) => {
            const b = e.target.closest('.ps');
            if (!b) return;
            e.stopPropagation();
            const i = +b.dataset.i;
            hit(b, i);
            if (i !== pat[j]) { row.removeEventListener('pointerdown', h); sfx('soft'); resolve(false); return; }
            j++;
            glow();
            if (j === pat.length) { row.removeEventListener('pointerdown', h); resolve(true); }
          };
          row.addEventListener('pointerdown', h);
        }));
        think(false);
        ps.forEach((p) => p.classList.remove('glowy-2d'));
        chk();
        if (ok) { sfx('sparkle'); R.burstAt(row, { n: 14, stars: true }); await wait(250); if (r === lens.length - 1 || r % 2 === 1) await say('luolu', 'th_pestle_ok'); break; }
        fails++;
        await say('luolu', 'th_pestle_again');
        chk();
      }
    }
    dots.done();
    // 最後一起敲一段（全部從短到長再回來）
    for (const i of [0, 1, 2, 3, ...(N > 4 ? [4] : []), 2, 0]) { hit(ps[i], i); await wait(300); }
    sfx('fanfare');
    await say('luolu', 'th_pestle_done');
    await wait(300);
  } finally { think(false); setHint(null); P.close(); }
}
