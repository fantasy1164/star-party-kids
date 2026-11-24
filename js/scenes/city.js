// 城市裡的公共設施（11/24）：消防局、捷運站／公車站、圖書館、郵局、垃圾車停靠點。
// 每個地方三關，盡量用共用的小遊戲（分類、尋找、照步驟），偶爾穿插英文。
import { runRoom } from './room-base.js';
import { sortGame, findGame, stepsGame, askChoice } from './kit.js';
import { createDiorama } from '../engine/diorama.js';
import { div, wait, shuffle, pick, stageRect, burst } from '../core/dom.js';
import { sfx } from '../core/audio.js';
import { turnsOn, callTurn, nextTurn, whoseTurn, levelNow } from '../core/turns.js';
import { setHint } from '../core/session.js';
import { shanSvg, kidSvg } from '../art/stars.js';
import { personSvg, numSvg, ICON2 } from '../art/more.js';
import { itemSvg } from '../art/town.js';
import { VEHICLES, DINOS } from '../art/fun.js';
import { huahuaSvg, xiuxiuSvg, guguSvg, xinxinSvg, ZOO, ABC_ART, MISC, PLACE_ICON, garbageTruckSvg, recycleTruckSvg, trashBagSvg } from '../art/world.js';
import { boardTrain } from './world.js';

const tree = () => `<svg viewBox="0 0 80 110"><rect x="34" y="70" width="12" height="38" rx="5" fill="#a9744f"/><circle cx="40" cy="48" r="34" fill="#4fbf6e"/></svg>`;
const outdoor = (w, d, css) => createDiorama({ w, d, walls: false, zoom: 0.92, cy: 0.6, base: '#8fbf6a', rim: 24, floorCss: css || 'background: radial-gradient(circle at 40% 35%, #c4ee9f 0, #a3dc84 70%, #95d277 100%)' });
const indoor = (w, d, floor, wall) => createDiorama({ w, d, walls: true, zoom: 0.9, cy: 0.6, wall, floorCss: floor });
const hello = (p) => (ph) => `${p}_hello_${ph === 'night' ? 'evening' : ph === 'morning' ? 'morning' : 'day'}`;
const hardSolo = (R) => R.members.length === 1 && R.members[0] === 'yy';
const aliveOf = (R) => () => { try { R.chk(); return true; } catch { return false; } };
const withIcon = (base, icon) => `<div class="withicon">${base}<i>${icon}</i></div>`;

// ============================== 消防局（嘩嘩） ==============================
// 打 119、火災逃生（摀口鼻、低姿勢、走樓梯不搭電梯、到外面集合）、開消防車滅火
export function mountFire(root, app) {
  return runRoom(root, app, {
    id: 'fire', host: 'huahua', back: 'town',
    build() {
      const dio = outdoor(700, 600);
      const front = `<svg viewBox="0 0 300 120" width="100%" height="100%" preserveAspectRatio="none"><rect width="300" height="18" fill="#c92a2a"/>${[12, 108, 204].map((x) => `<rect x="${x}" y="36" width="84" height="84" rx="6" fill="#fff"/><path d="M${x} 56 H${x + 84} M${x} 76 H${x + 84} M${x} 96 H${x + 84}" stroke="#d0d4dc" stroke-width="4"/>`).join('')}</svg>`;
      dio.addBox({ x: 180, y: 80, w: 300, d: 160, h: 120, color: '#ff4a4a', faces: { s: front } });
      dio.addBox({ x: 500, y: 100, w: 70, d: 70, h: 220, color: '#ff6a5a' });
      dio.addSprite({ x: 330, y: 340, w: 200, h: 170, shadow: 0.6, html: VEHICLES.fire, tap: 'truck' });
      dio.addSprite({ x: 120, y: 420, w: 70, h: 90, shadow: 0.4, html: `<svg viewBox="0 0 70 90"><rect x="22" y="30" width="26" height="54" rx="6" fill="#ff4a4a"/><rect x="14" y="40" width="42" height="10" rx="4" fill="#e03535"/><path d="M22 30 Q35 14 48 30Z" fill="#ffd23f"/></svg>` });
      [[80, 120], [640, 520], [70, 540]].forEach(([x, y]) => dio.addSprite({ x, y, w: 100, h: 140, html: tree(), shadow: 0.6 }));
      const huahua = dio.addSprite({ x: 470, y: 420, w: 120, h: 128, html: huahuaSvg(), shadow: 0.6, tap: 'huahua' });
      const shan = dio.addSprite({ x: 220, y: 540, w: 110, h: 126, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { huahua, shan } };
    },
    music: () => 'fire',
    lines: { hello: hello('fr'), pick: 'fr_pick', next: 'fr_next', allDone: [['huahua', 'fr_all_done'], ['shan', 'fr_all_done']] },
    games: [
      { id: 'call', icon: itemSvg('phone'), marker: { x: 120, y: 300, z: 200 }, run: callGame },
      { id: 'escape', icon: MISC.crawl, marker: { x: 330, y: 160, z: 260 }, run: (R) => stepsGame(R, {
        host: 'huahua', hostSvg: huahuaSvg(), cls: 'escapepanel', intro: 'fr_esc_go', wrong: 'fr_esc_wrong', done: 'fr_esc_done',
        scene: `<div class="smoke"></div>`,
        steps: [
          { t: 'towel', line: 'fr_esc_1', icon: MISC.towel },
          { t: 'crawl', line: 'fr_esc_2', icon: MISC.crawl },
          { t: 'stairs', line: 'fr_esc_3', icon: MISC.stairs },
          { t: 'meet', line: 'fr_esc_4', icon: MISC.meetpoint },
          { t: 'phone', line: 'fr_esc_5', icon: itemSvg('phone') },
        ],
        targets: [
          { id: 'towel', x: 60, y: 300, w: 140, h: 140, html: MISC.towel },
          { id: 'crawl', x: 250, y: 430, w: 170, h: 150, html: MISC.crawl },
          { id: 'elevator', x: 470, y: 150, w: 130, h: 150, html: MISC.elevator },
          { id: 'stairs', x: 640, y: 160, w: 150, h: 150, html: MISC.stairs },
          { id: 'meet', x: 640, y: 400, w: 140, h: 150, html: MISC.meetpoint },
          { id: 'phone', x: 450, y: 410, w: 110, h: 110, html: itemSvg('phone') },
        ],
      }) },
      { id: 'spray', icon: MISC.flame, marker: { x: 470, y: 300, z: 200 }, run: sprayGame },
    ],
    playful(name, R) {
      if (name === 'huahua') { sfx('ding'); R.hop(R.set.chars.huahua.el); R.say('huahua', 'huahua_hi'); return true; }
      if (name === 'truck') { sfx('alarm'); R.say('huahua', 'fr_truck_en'); return true; }
      return false;
    },
  });
}

async function callGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('callpanel', { host: 'huahua', hostSvg: huahuaSvg() });
  const el = P.el;
  try {
    el.innerHTML = `<div class="phone"><div class="pscreen"></div><div class="keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => `<button class="key" data-n="${n}">${numSvg(n, { color: '#4a3b6b' })}</button>`).join('')}</div></div><div class="picks"></div>`;
    const scr = el.querySelector('.pscreen');
    await say('huahua', 'fr_call_go');
    chk();
    await callTurn();
    chk();
    const need = [1, 1, 9];
    let k = 0, lastWrong = 0;
    const easy = () => levelNow(R.profile) === 'easy';
    const glowNext = () => { el.querySelectorAll('.key').forEach((b) => b.classList.toggle('glowy-2d', easy() && k < 3 && +b.dataset.n === need[k])); };
    glowNext();
    setHint(() => el.querySelector(`.key[data-n="${need[k]}"]`));
    await race(new Promise((resolve) => {
      el.querySelectorAll('.key').forEach((b) => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (k >= 3) return;
        const n = +b.dataset.n;
        R.hop(b);
        if (n === need[k]) {
          sfx('tap');
          scr.insertAdjacentHTML('beforeend', `<i>${numSvg(n, { color: '#fff' })}</i>`);
          k++;
          if (turnsOn() && k < 3) nextTurn({ say: false });
          glowNext();
          if (k === 3) resolve();
        } else { sfx('soft'); if (Date.now() - lastWrong > 2500) { lastWrong = Date.now(); say('huahua', 'fr_call_wrong'); } }
      }));
    }));
    chk();
    setHint(null);
    sfx('phone');
    await wait(900);
    await say('huahua', 'fr_call_ask');
    chk();
    // 發生什麼事？點火
    const picks = el.querySelector('.picks');
    picks.innerHTML = shuffle([['fire', MISC.flame], ['cat', ABC_ART.cat], ['cake', itemSvg('cookie')]]).map(([k2, h]) => `<button class="pk" data-k="${k2}">${h}</button>`).join('');
    picks.classList.add('show');
    if (easy()) picks.querySelector('[data-k="fire"]').classList.add('glowy-2d');
    await race(new Promise((resolve) => {
      picks.querySelectorAll('.pk').forEach((b) => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (b.dataset.k === 'fire') { sfx('sparkle'); resolve(); } else { sfx('soft'); R.hop(b); }
      }));
    }));
    chk();
    picks.innerHTML = '';
    await say('huahua', 'fr_call_addr');
    chk();
    sfx('alarm');
    await say('huahua', 'fr_call_done');
    await wait(300);
  } finally { setHint(null); P.close(); }
}

async function sprayGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('spraypanel', { host: 'huahua', hostSvg: huahuaSvg() });
  const el = P.el;
  const spots = [[180, 130], [360, 90], [540, 140], [260, 280], [470, 280]];
  const hits = hardSolo(R) ? 3 : 2;
  try {
    el.innerHTML = `<div class="burnhouse"></div>${spots.map(([x, y], i) => `<div class="flame" data-i="${i}" style="left:${x}px;top:${y}px">${MISC.flame}</div>`).join('')}<div class="ftruck">${VEHICLES.fire}</div><svg class="stream" viewBox="0 0 940 640"><path d="" stroke="#7fd3ff" stroke-width="14" fill="none" stroke-linecap="round" opacity=".85"/></svg>`;
    const flames = [...el.querySelectorAll('.flame')];
    const stream = el.querySelector('.stream path');
    const left = new Map(flames.map((f) => [f, hits]));
    await say('huahua', 'fr_spray_go');
    chk();
    await callTurn();
    chk();
    setHint(() => flames.find((f) => left.get(f) > 0));
    await race(new Promise((resolve) => {
      flames.forEach((f) => f.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (!left.get(f)) return;
        const fx = parseFloat(f.style.left) + 50, fy = parseFloat(f.style.top) + 60;
        stream.setAttribute('d', `M780 520 Q${(780 + fx) / 2} ${Math.min(fy, 520) - 160} ${fx} ${fy}`);
        stream.parentNode.classList.remove('on'); void stream.parentNode.offsetWidth; stream.parentNode.classList.add('on');
        sfx('water');
        const n = left.get(f) - 1;
        left.set(f, n);
        f.style.transform = `scale(${0.35 + (0.65 * n) / hits})`;
        if (!n) {
          f.classList.add('out');
          sfx('sparkle');
          if (turnsOn()) nextTurn({ say: false });
          if ([...left.values()].every((v) => !v)) resolve();
        }
      }));
    }));
    chk();
    setHint(null);
    sfx('fanfare');
    await say('huahua', 'fr_spray_done');
    await wait(300);
  } finally { setHint(null); P.close(); }
}

// ============================== 捷運站／公車站（咻咻） ==============================
export function mountMrt(root, app) {
  return runRoom(root, app, {
    id: 'mrt', host: 'xiuxiu', back: 'town',
    build() {
      const dio = indoor(720, 560, 'background: repeating-linear-gradient(90deg,#e9edf4 0 60px,#dde3ec 60px 120px)', '#f4f8ff');
      dio.addDecal({ x: 0, y: 380, w: 720, h: 24, z: 0.8, css: 'background:#ffd23f' });
      dio.addDecal({ x: 0, y: 404, w: 720, h: 156, z: 0.5, css: 'background:#8a8fa0' });
      dio.addSprite({ x: 360, y: 470, w: 300, h: 200, shadow: 0.4, html: PLACE_ICON.mrt });
      [[110, 200], [220, 200]].forEach(([x, y]) => dio.addSprite({ x, y, w: 90, h: 90, shadow: 0.3, html: MISC.seat }));
      dio.addSprite({ x: 560, y: 160, w: 140, h: 100, shadow: 0, html: `<svg viewBox="0 0 140 100"><rect width="140" height="100" rx="10" fill="#fff"/><path d="M14 70 Q50 20 80 50 T126 30" stroke="#ff5d73" stroke-width="8" fill="none"/>${[[14, 70], [50, 36], [80, 50], [126, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="#ff5d73" stroke-width="4"/>`).join('')}</svg>` });
      const xiuxiu = dio.addSprite({ x: 470, y: 290, w: 110, h: 118, html: xiuxiuSvg(), shadow: 0.5, tap: 'xiuxiu' });
      const shan = dio.addSprite({ x: 160, y: 330, w: 100, h: 114, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { xiuxiu, shan } };
    },
    music: () => 'mrt',
    lines: { hello: hello('mr'), pick: 'mr_pick', next: 'mr_next', allDone: [['xiuxiu', 'mr_all_done'], ['shan', 'mr_all_done']] },
    games: [
      { id: 'board', icon: MISC.card, marker: { x: 360, y: 380, z: 200 }, run: async (R) => {
        await boardTrain(R.root, { say: (id) => R.say('xiuxiu', id), alive: aliveOf(R), glow: levelNow(R.profile) === 'easy' });
        R.chk();
        await R.say('xiuxiu', 'mr_board_done');
      } },
      { id: 'seat', icon: MISC.seat, marker: { x: 160, y: 200, z: 160 }, run: (R) => {
        const items = [
          { k: 'grandma', bin: 'give', html: personSvg('grandma') },
          { k: 'baby', bin: 'give', html: withIcon(personSvg('mom'), `<svg viewBox="0 0 100 100"><circle cx="50" cy="40" r="22" fill="#ffd9b8"/><path d="M24 60 Q50 100 76 60Z" fill="#ffb3c8"/></svg>`) },
          { k: 'crutch', bin: 'give', html: withIcon(personSvg('uncle'), `<svg viewBox="0 0 100 100"><path d="M40 10 V94 M30 10 H50 M30 50 H50" stroke="#8a8fa0" stroke-width="8" stroke-linecap="round"/></svg>`) },
          { k: 'me', bin: 'stand', html: kidSvg(R.members[0]) },
        ];
        return sortGame(R, { host: 'xiuxiu', hostSvg: xiuxiuSvg(), intro: 'mr_seat_go',
          bins: [{ id: 'give', html: withIcon(MISC.seat, itemSvg('good')) }, { id: 'stand', html: MISC.meetpoint }],
          items, wrong: (it) => `mr_seat_${it.k}`, done: 'mr_seat_done' });
      } },
      { id: 'route', icon: PLACE_ICON.mrt, marker: { x: 560, y: 160, z: 200 }, run: routeGame },
    ],
    playful(name, R) { if (name === 'xiuxiu') { sfx('ding'); R.hop(R.set.chars.xiuxiu.el); R.say('xiuxiu', 'xiuxiu_hi'); return true; } return false; },
  });
}

// 看路線圖坐捷運：一站一站點下去（愷愷），到了再問坐了幾站（岳岳）
async function routeGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('routepanel', { host: 'xiuxiu', hostSvg: xiuxiuSvg() });
  const el = P.el;
  const pts = [[90, 470], [210, 360], [330, 420], [450, 300], [560, 380], [680, 250], [800, 330]];
  const dest = [ZOO.panda, PLACE_ICON.library, itemSvg('slide'), PLACE_ICON.train];
  try {
    const start = Math.floor(Math.random() * 2);
    const stops = 2 + Math.floor(Math.random() * (hardSolo(R) ? 3 : 2));
    const end = start + stops;
    el.innerHTML = `<svg class="rline" viewBox="0 0 940 640"><path d="M${pts.map((p) => p.join(' ')).join(' L')}" stroke="#ff5d73" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      ${pts.map(([x, y], i) => `<button class="stn" data-i="${i}" style="left:${x - 34}px;top:${y - 34}px"></button>`).join('')}
      <div class="rtrain" style="left:${pts[start][0] - 50}px;top:${pts[start][1] - 110}px">${PLACE_ICON.mrt}</div>
      <div class="rdest" style="left:${pts[end][0] - 50}px;top:${pts[end][1] + 30}px">${pick(dest)}</div><div class="answers in-panel"></div>`;
    const stn = [...el.querySelectorAll('.stn')];
    const train = el.querySelector('.rtrain');
    stn[end].classList.add('goal');
    await say('xiuxiu', 'mr_route_go');
    chk();
    await callTurn();
    chk();
    let at = start;
    const easy = () => levelNow(R.profile) === 'easy';
    const mark = () => stn.forEach((b, i) => b.classList.toggle('glowy-2d', easy() && i === at + 1 && at < end));
    mark();
    setHint(() => stn[at + 1]);
    await race(new Promise((resolve) => {
      stn.forEach((b, i) => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (at >= end) return;
        if (i !== at + 1) { sfx('soft'); R.hop(b); return; }
        at = i;
        sfx('ding');
        b.classList.add('passed');
        train.style.left = `${pts[i][0] - 50}px`;
        train.style.top = `${pts[i][1] - 110}px`;
        if (turnsOn() && at < end) nextTurn({ say: false });
        mark();
        if (at === end) resolve();
      }));
    }));
    chk();
    setHint(null);
    sfx('sparkle');
    await say('xiuxiu', 'mr_route_arrive');
    chk();
    // 坐了幾站？（岳岳）
    if (R.members.includes('yy')) {
      if (turnsOn() && whoseTurn() !== 'yy') await nextTurn({ say: false });
      await say('xiuxiu', 'mr_route_count');
      chk();
      await askChoice(R, el.querySelector('.answers'), shuffle([stops, stops + 1, stops - 1 || stops + 2]), stops, { host: 'xiuxiu' });
      chk();
    }
    await say('xiuxiu', 'mr_route_done');
    await wait(300);
  } finally { setHint(null); P.close(); }
}

// ============================== 圖書館（咕咕） ==============================
// 小聲說話、聽故事回答問題（岳岳是聽覺型）、照顏色或字母把書放回書架
const STORIES = [
  { id: 1, panels: [[itemSvg('rabbit'), '🎈'], [itemSvg('rabbit'), ZOO.giraffe], [ZOO.giraffe, itemSvg('rabbit')]], q: [['giraffe', ZOO.giraffe], ['penguin', ZOO.penguin], ['cat', ABC_ART.cat]], a: 'giraffe' },
  { id: 2, panels: [[ZOO.blackbear, MISC.book('#7ee06a')], [ZOO.blackbear, DINOS.trex], [ZOO.blackbear, PLACE_ICON.library]], q: [['dino', DINOS.trex], ['fish', ABC_ART.fish], ['car', VEHICLES.bus]], a: 'dino' },
  { id: 3, panels: [[ABC_ART.cat, MISC.meetpoint], [personSvg('grandma'), ABC_ART.cat], [ABC_ART.cat, MISC.seat]], q: [['grandma', personSvg('grandma')], ['lion', ZOO.lion], ['rabbit', itemSvg('rabbit')]], a: 'grandma' },
];
export function mountLibrary(root, app) {
  return runRoom(root, app, {
    id: 'library', host: 'gugu', back: 'town',
    build() {
      const dio = indoor(700, 560, 'background: repeating-linear-gradient(0deg,#f3e3c3 0 40px,#ead6b0 40px 80px)', '#fff6e8');
      const shelf = (x, y, c) => dio.addBox({ x, y, w: 160, d: 40, h: 150, color: '#c98b5e', faces: { s: `<svg viewBox="0 0 160 150" width="100%" height="100%" preserveAspectRatio="none">${[10, 60, 110].map((sy) => [...Array(9)].map((_, i) => `<rect x="${8 + i * 16}" y="${sy}" width="13" height="36" rx="2" fill="${['#ff5d73', '#3ea8e0', '#ffd23f', '#7ee06a', '#a98bff'][(i + sy) % 5]}"/>`).join('')).join('')}</svg>` } });
      shelf(40, 20, '#ff5d73'); shelf(260, 20, '#3ea8e0'); shelf(480, 20, '#ffd23f');
      dio.addBox({ x: 230, y: 300, w: 240, d: 110, h: 60, color: '#e0b080' });
      dio.addSprite({ x: 300, y: 360, z: 60, w: 70, h: 70, shadow: 0, html: MISC.book('#7ee06a') });
      const gugu = dio.addSprite({ x: 420, y: 360, z: 60, w: 110, h: 118, html: guguSvg(), shadow: 0.4, tap: 'gugu' });
      const shan = dio.addSprite({ x: 140, y: 440, w: 100, h: 114, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { gugu, shan } };
    },
    music: () => 'library',
    lines: { hello: hello('lb'), pick: 'lb_pick', next: 'lb_next', allDone: [['gugu', 'lb_all_done'], ['shan', 'lb_all_done']] },
    games: [
      { id: 'voice', icon: MISC.quiet, marker: { x: 120, y: 300, z: 180 }, run: (R) => sortGame(R, {
        host: 'gugu', hostSvg: guguSvg(), intro: 'lb_voice_go',
        bins: [{ id: 'quiet', html: MISC.quiet }, { id: 'loud', html: MISC.loud }],
        items: [
          { k: 'library', bin: 'quiet', html: PLACE_ICON.library },
          { k: 'clinic', bin: 'quiet', html: itemSvg('heal') },
          { k: 'mrt', bin: 'quiet', html: PLACE_ICON.mrt },
          { k: 'sleep', bin: 'quiet', html: itemSvg('sleep') },
          { k: 'park', bin: 'loud', html: itemSvg('slide') },
        ],
        wrong: (it) => `lb_voice_${it.k}`, done: 'lb_voice_done' }) },
      { id: 'story', icon: MISC.book('#a98bff'), marker: { x: 360, y: 340, z: 200 }, run: storyGame },
      { id: 'shelf', icon: MISC.book('#3ea8e0', 'A'), marker: { x: 340, y: 30, z: 240 }, run: (R) => {
        const yy = hardSolo(R);
        // 愷愷：照顏色；岳岳：照書背上的英文字母（顏色故意打亂）
        const cols = ['#ff5d73', '#3ea8e0', '#ffd23f'];
        const L = ['A', 'B', 'C'];
        const items = [];
        for (let i = 0; i < 6; i++) {
          const b = i % 3;
          items.push({ k: `b${i}`, bin: `s${b}`, html: yy ? MISC.book(cols[(b + 1 + (i % 2)) % 3], L[b]) : MISC.book(cols[b]) });
        }
        return sortGame(R, { host: 'gugu', hostSvg: guguSvg(), intro: yy ? 'lb_shelf_go_abc' : 'lb_shelf_go',
          bins: [0, 1, 2].map((b) => ({ id: `s${b}`, html: `<div class="shelfbin" style="--c:${yy ? '#c98b5e' : cols[b]}">${yy ? `<b>${L[b]}</b>` : ''}</div>` })),
          items: shuffle(items), wrong: () => (yy ? 'lb_shelf_wrong_abc' : 'lb_shelf_wrong'), done: 'lb_shelf_done' });
      } },
    ],
    playful(name, R) { if (name === 'gugu') { sfx('tap'); R.hop(R.set.chars.gugu.el); R.say('gugu', 'gugu_hi'); return true; } return false; },
  });
}

async function storyGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('storypanel', { host: 'gugu', hostSvg: guguSvg() });
  const el = P.el;
  const st = pick(STORIES);
  const pic = (h) => (h.startsWith('<') ? h : `<span class="emo">${h}</span>`);
  try {
    el.innerHTML = `<div class="spanels">${st.panels.map((p, i) => `<div class="sp" data-i="${i}">${p.map(pic).join('')}</div>`).join('')}</div><div class="squiz"></div>`;
    const sp = [...el.querySelectorAll('.sp')];
    await say('gugu', 'lb_story_go');
    chk();
    for (let i = 0; i < 3; i++) {
      sp[i].classList.add('on');
      await say('gugu', `lb_st${st.id}_${i + 1}`);
      chk();
    }
    await callTurn();
    chk();
    const quiz = el.querySelector('.squiz');
    let tries = 0;
    await say('gugu', `lb_st${st.id}_q`);
    chk();
    quiz.innerHTML = shuffle(st.q).map(([k, h]) => `<button class="pk" data-k="${k}">${h}</button>`).join('');
    quiz.classList.add('show');
    if (levelNow(R.profile) === 'easy') quiz.querySelector(`[data-k="${st.a}"]`).classList.add('glowy-2d');
    await race(new Promise((resolve) => {
      quiz.querySelectorAll('.pk').forEach((b) => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (b.dataset.k === st.a) { sfx('fanfare'); R.burstAt(b, { n: 16, stars: true }); resolve(); return; }
        sfx('soft'); b.disabled = true; b.classList.add('gone');
        if (++tries === 1) say('gugu', 'lb_story_again');
      }));
    }));
    chk();
    await say('gugu', 'lb_story_done');
    await wait(300);
  } finally { P.close(); }
}

// ============================== 郵局（信信） ==============================
// 寄卡片（畫愛心 → 貼郵票 → 寫地址 → 投郵筒）、紅綠郵筒（綠色平信、紅色限時）、照門牌送信
const HOUSE_C = ['#ff5d73', '#3ea8e0', '#ffd23f', '#7ee06a'];
const houseSvg = (c, n) => `<svg viewBox="0 0 100 110" width="100%" height="100%"><rect x="14" y="44" width="72" height="62" fill="${c}"/><path d="M6 48 L50 10 L94 48Z" fill="#8a5a4a"/><rect x="38" y="70" width="24" height="36" rx="3" fill="#fff"/><g transform="translate(36 46) scale(.28)">${numSvg(n, { color: '#4a3b6b' }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></svg>`;
export function mountPost(root, app) {
  return runRoom(root, app, {
    id: 'post', host: 'xinxin', back: 'town',
    build() {
      const dio = outdoor(760, 600);
      dio.addDecal({ x: 0, y: 300, w: 760, h: 80, z: 0.6, css: 'background:#8a8fa0' });
      // 一排房子（有些是要送信的地方，在送信關卡裡才可以點）
      [[60, 120, 0, 2], [200, 120, 1, 5], [340, 120, 2, 3], [480, 120, 3, 1], [620, 120, 0, 4], [60, 470, 1, 7], [200, 470, 2, 6], [340, 470, 3, 8], [480, 470, 1, 2], [620, 470, 2, 9]].forEach(([x, y, c, n]) => dio.addSprite({ x, y, w: 110, h: 120, shadow: 0.5, html: houseSvg(HOUSE_C[c], n) }));
      const xinxin = dio.addSprite({ x: 700, y: 360, w: 90, h: 100, html: xinxinSvg(), shadow: 0.5, tap: 'xinxin' });
      dio.addSprite({ x: 640, y: 360, w: 60, h: 80, html: MISC.mailRed, shadow: 0.4 });
      const shan = dio.addSprite({ x: 120, y: 360, w: 90, h: 104, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { xinxin, shan } };
    },
    music: () => 'post',
    lines: { hello: hello('po'), pick: 'po_pick', next: 'po_next', allDone: [['xinxin', 'po_all_done'], ['shan', 'po_all_done']] },
    games: [
      { id: 'send', icon: MISC.letter, marker: { x: 640, y: 360, z: 160 }, run: (R) => stepsGame(R, {
        host: 'xinxin', hostSvg: xinxinSvg(), cls: 'sendpanel', intro: 'po_send_go', wrong: 'po_send_wrong', done: 'po_send_done',
        scene: `<div class="bigcard"><div class="heart"></div><div class="stampspot"></div><div class="addr"></div></div>`,
        steps: [
          { t: 'heart', line: 'po_send_1', icon: itemSvg('good') },
          { t: 'stamp', line: 'po_send_2', icon: MISC.stamp },
          { t: 'addr', line: 'po_send_3', icon: itemSvg('home2') },
          { t: 'box', line: 'po_send_4', icon: MISC.mailGreen },
        ],
        targets: [
          { id: 'heart', x: 200, y: 260, w: 140, h: 140, html: itemSvg('good') },
          { id: 'stamp', x: 700, y: 140, w: 110, h: 120, html: MISC.stamp },
          { id: 'addr', x: 700, y: 300, w: 120, h: 120, html: itemSvg('home2') },
          { id: 'box', x: 40, y: 420, w: 110, h: 150, html: MISC.mailGreen },
        ],
        fx: async (i, target, el) => {
          const card = el.querySelector('.bigcard');
          if (i === 0) card.querySelector('.heart').innerHTML = itemSvg('good');
          if (i === 1) card.querySelector('.stampspot').innerHTML = MISC.stamp;
          if (i === 2) card.querySelector('.addr').innerHTML = itemSvg('home2');
          if (i === 3) { card.classList.add('mailed'); await wait(800); }
        },
      }) },
      { id: 'color', icon: MISC.mailRed, marker: { x: 360, y: 340, z: 160 }, run: (R) => sortGame(R, {
        host: 'xinxin', hostSvg: xinxinSvg(), intro: 'po_color_go',
        bins: [{ id: 'green', html: MISC.mailGreen }, { id: 'red', html: MISC.mailRed }],
        items: shuffle([0, 1, 2].map((i) => ({ k: `n${i}`, bin: 'green', html: MISC.letter })).concat([0, 1, 2].map((i) => ({ k: `e${i}`, bin: 'red', html: MISC.express })))),
        wrong: (it) => (it.bin === 'red' ? 'po_color_red' : 'po_color_green'), done: 'po_color_done' }) },
      { id: 'deliver', icon: houseSvg('#3ea8e0', 5), marker: { x: 200, y: 120, z: 200 }, run: (R) => {
        // 送三封信：信封上畫著房子的顏色和號碼，在街上找一樣的房子
        const all = [{ x: 200, y: 120, c: 1, n: 5 }, { x: 480, y: 120, c: 3, n: 1 }, { x: 340, y: 470, c: 3, n: 8 }, { x: 620, y: 470, c: 2, n: 9 }, { x: 60, y: 470, c: 1, n: 7 }];
        const pickd = shuffle(all).slice(0, hardSolo(R) ? 4 : 3);
        const items = pickd.map((h, i) => ({ id: `h${i}`, x: h.x, y: h.y + 4, z: 0, w: 116, h: 126, html: houseSvg(HOUSE_C[h.c], h.n), icon: withIcon(MISC.letter, houseSvg(HOUSE_C[h.c], h.n)) }));
        return findGame(R, { host: 'xinxin', intro: 'po_deliver_go', items, list: true, found: () => pick(['po_deliver_got1', 'po_deliver_got2']), hiddenLine: 'po_deliver_hidden', done: 'po_deliver_done' });
      } },
    ],
    playful(name, R) { if (name === 'xinxin') { sfx('pop'); R.hop(R.set.chars.xinxin.el); R.say('xinxin', 'xinxin_hi'); return true; } return false; },
  });
}

// ============================== 垃圾車停靠點（閃閃＋垃圾車、資源回收車） ==============================
// 家是透天，垃圾車傍晚停在小區路口，大家拿垃圾出來倒；旁邊是資源回收車，要分類。
// 垃圾車放〈給愛麗絲〉（貝多芬，早就沒有著作權了），玩具樂器合成。
export function mountGarbage(root, app) {
  return runRoom(root, app, {
    id: 'garbage', host: 'shan', back: 'town',
    build() {
      const dio = outdoor(720, 560);
      dio.addDecal({ x: 0, y: 200, w: 720, h: 130, z: 0.6, css: 'background:#8a8fa0' });
      dio.addDecal({ x: 300, y: 200, w: 130, h: 360, z: 0.6, css: 'background:#8a8fa0' });
      dio.addSprite({ x: 170, y: 290, w: 260, h: 210, shadow: 0.6, html: garbageTruckSvg(), tap: 'gtruck' });
      dio.addSprite({ x: 520, y: 290, w: 260, h: 210, shadow: 0.6, html: recycleTruckSvg(), tap: 'rtruck' });
      [[60, 470, 'grandma'], [140, 500, 'dad'], [560, 470, 'auntie']].forEach(([x, y, k]) => dio.addSprite({ x, y, w: 70, h: 130, shadow: 0.4, html: personSvg(k) }));
      // 透天厝一排
      [[30, 40, '#fff3e6'], [160, 40, '#e6f4e8'], [290, 40, '#e6eeff'], [420, 40, '#fff0f0'], [550, 40, '#fff8d6']].forEach(([x, y, c]) => dio.addBox({ x, y, w: 120, d: 110, h: 180, color: c, faces: { s: `<svg viewBox="0 0 120 180" width="100%" height="100%" preserveAspectRatio="none">${[14, 70].map((yy) => `<rect x="14" y="${yy}" width="36" height="30" rx="4" fill="#bfe6ff"/><rect x="70" y="${yy}" width="36" height="30" rx="4" fill="#bfe6ff"/>`).join('')}<rect x="34" y="124" width="52" height="56" fill="#9aa3b5"/></svg>` } }));
      const shan = dio.addSprite({ x: 360, y: 470, w: 110, h: 126, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { shan } };
    },
    music: () => 'garbage',
    lines: { hello: hello('gb'), pick: 'gb_pick', next: 'gb_next', allDone: [['shan', 'gb_all_done']] },
    games: [
      { id: 'steps', icon: itemSvg('list'), marker: { x: 360, y: 470, z: 200 }, run: (R) => stepsGame(R, {
        host: 'shan', hostSvg: shanSvg(), cls: 'gsteps', intro: 'gb_steps_go', wrong: 'gb_steps_wrong', done: 'gb_steps_done',
        scene: '',
        steps: [
          { t: 'music', line: 'gb_steps_1', icon: ABC_ART.xylophone },
          { t: 'bag', line: 'gb_steps_2', icon: trashBagSvg() },
          { t: 'line', line: 'gb_steps_3', icon: MISC.meetpoint },
          { t: 'truck', line: 'gb_steps_4', icon: garbageTruckSvg() },
          { t: 'wash', line: 'gb_steps_5', icon: itemSvg('water') },
        ],
        targets: [
          { id: 'music', x: 60, y: 140, w: 140, h: 120, html: ABC_ART.xylophone },
          { id: 'bag', x: 260, y: 420, w: 120, h: 130, html: trashBagSvg() },
          { id: 'line', x: 440, y: 420, w: 120, h: 140, html: MISC.meetpoint },
          { id: 'truck', x: 640, y: 160, w: 200, h: 160, html: garbageTruckSvg() },
          { id: 'wash', x: 700, y: 420, w: 120, h: 120, html: itemSvg('water') },
        ],
      }) },
      { id: 'trash', icon: trashBagSvg(), marker: { x: 170, y: 290, z: 240 }, run: (R) => sortGame(R, {
        host: 'shan', hostSvg: shanSvg(), intro: 'gb_trash_go',
        bins: [{ id: 'truck', html: garbageTruckSvg() }, { id: 'food', html: itemSvg('binFood') }],
        items: shuffle([
          { k: 'bag1', bin: 'truck', html: trashBagSvg() }, { k: 'bag2', bin: 'truck', html: trashBagSvg('#3a3f4e') },
          { k: 'peel', bin: 'food', html: itemSvg('peel') }, { k: 'core', bin: 'food', html: itemSvg('core') },
        ]),
        wrong: (it) => (it.bin === 'food' ? 'gb_trash_food' : 'gb_trash_bag'), done: 'gb_trash_done' }) },
      { id: 'recycle', icon: recycleTruckSvg(), marker: { x: 520, y: 290, z: 240 }, run: (R) => {
        const yy = hardSolo(R);
        const bins = [
          { id: 'paper', html: withIcon(`<div class="rbin" style="--c:#3ea8e0"></div>`, itemSvg('paperbox')) },
          { id: 'bottle', html: withIcon(`<div class="rbin" style="--c:#ffb627"></div>`, itemSvg('bottle')) },
          { id: 'can', html: withIcon(`<div class="rbin" style="--c:#4cd07d"></div>`, itemSvg('can')) },
          ...(yy ? [{ id: 'trash', html: garbageTruckSvg() }] : []),
        ];
        const items = [
          { k: 'paperbox', bin: 'paper', html: itemSvg('paperbox') }, { k: 'paper2', bin: 'paper', html: MISC.book('#e6d4b0') },
          { k: 'bottle', bin: 'bottle', html: itemSvg('bottle') }, { k: 'can', bin: 'can', html: itemSvg('can') },
          ...(yy ? [{ k: 'tissue', bin: 'trash', html: itemSvg('tissue') }, { k: 'wrapper', bin: 'trash', html: itemSvg('wrapper') }] : []),
        ];
        return sortGame(R, { host: 'shan', hostSvg: shanSvg(), intro: yy ? 'gb_rec_go_yy' : 'gb_rec_go', bins, items: shuffle(items), wrong: (it) => `gb_rec_${it.bin}`, done: 'gb_rec_done' });
      } },
    ],
    playful(name, R) {
      if (name === 'gtruck' || name === 'rtruck') { sfx('ding'); R.say('shan', name === 'gtruck' ? 'gb_truck_en' : 'gb_rtruck_en'); return true; }
      return false;
    },
  });
}
