// 遠方的三個地方（11/26）
//   機場（翔翔）：報到托運、安全檢查、聽廣播找登機門（岳岳的聽覺）、行李轉盤找行李（愷愷的觀察）
//   澎湖（龜龜）：雙心石滬（愷愷的空間）、玄武岩補石柱（規律）、潮間帶規矩、海龜生蛋的夜晚
//   合歡山（雪雪）：洋蔥式穿衣、堆雪人（大小）、高山慢慢走（岳岳練「慢下來」）、晚上觀星（連北斗七星；岳岳照口訣連）
// 原則跟其他地方一樣：一關 1～2 分鐘、每次碰都有回饋、錯兩次亮答案、做錯不扣分、一起玩輪流。
import { runRoom } from './room-base.js';
import { sortGame, stepsGame, roundDots, findGame } from './kit.js';
import { createDiorama } from '../engine/diorama.js';
import { div, wait, shuffle, pick, stageRect, burst } from '../core/dom.js';
import { sfx, playNote, think } from '../core/audio.js';
import { turnsOn, callTurn, nextTurn, levelNow, whoseTurn, turnTo } from '../core/turns.js';
import { setHint } from '../core/session.js';
import { shanSvg, kidSvg } from '../art/stars.js';
import { personSvg } from '../art/more.js';
import { itemSvg } from '../art/town.js';
import { numSvg } from '../art/more.js';
import { VEHICLES } from '../art/fun.js';
import * as M from '../core/mult.js';
import { xiangxiangSvg, guiguiSvg, xuexueSvg, piaopiaoSvg, AIR, PH, HH, HD, FAR_ICON, bagSvg, STICKER, GATE_COLORS, basalt } from '../art/far.js';

const hello = (p) => (ph) => `${p}_hello_${ph === 'night' ? 'evening' : ph === 'morning' ? 'morning' : 'day'}`;
const hardSolo = (R) => R.members.length === 1 && R.members[0] === 'yy';
const easyNow = (R) => levelNow(R.profile) === 'easy';
const tree = (c = '#4fbf6e') => `<svg viewBox="0 0 80 110"><rect x="34" y="70" width="12" height="38" rx="5" fill="#a9744f"/><circle cx="40" cy="48" r="34" fill="${c}"/></svg>`;
const pine = `<svg viewBox="0 0 80 120"><rect x="35" y="90" width="10" height="28" fill="#8a5a32"/><path d="M40 6 L70 50 H54 L74 80 H50 L78 100 H2 L30 80 H6 L26 50 H10Z" fill="#2f7f55"/><path d="M40 6 L54 26 H26Z M30 50 H50 L44 42 H36Z M22 80 H58 L52 72 H28Z" fill="#fff"/></svg>`;
const XX = () => xiangxiangSvg(), GG = () => guiguiSvg(), XU = () => xuexueSvg();
// 每一關都會用到：點對、點錯（說明）、錯兩次發亮
function tapRound(R, el, { right, onWrong, onRight }) {
  return R.race(new Promise((resolve) => {
    let wrongs = 0;
    const h = async (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      e.stopPropagation();
      if (right(b)) { el.removeEventListener('pointerdown', h); await onRight?.(b); resolve(b); return; }
      sfx('soft');
      wrongs++;
      onWrong?.(b, wrongs);
    };
    el.addEventListener('pointerdown', h);
  }));
}

// ============================== 機場（翔翔） ==============================
export function mountAirport(root, app) {
  return runRoom(root, app, {
    id: 'airport', host: 'xiangxiang', back: 'town',
    build() {
      const dio = createDiorama({ w: 760, d: 620, walls: false, zoom: 0.9, cy: 0.6, base: '#c9d3de', rim: 24, skirt: '#9fd27f',
        floorCss: 'background: repeating-conic-gradient(#eef2f7 0 25%, #e2e8f0 0 50%) 0 0 / 80px 80px' });
      // 大窗戶外面的飛機、報到櫃台（輸送帶）、安檢門、登機門、行李轉盤
      dio.addPanel({ x1: 0, y1: 0, x2: 760, y2: 0, h: 220, css: 'background: linear-gradient(#bfe6ff, #e6f4ff)', html: `<svg viewBox="0 0 760 220" width="100%" height="100%">${AIR.plane.replace('<svg', '<svg x="250" y="40" width="300" height="160"')}${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${i * 110 + 50}" y="0" width="8" height="220" fill="#fff" opacity=".8"/>`).join('')}</svg>` });
      dio.addBox({ x: 60, y: 120, w: 220, d: 60, h: 60, color: '#3e6fb8', faces: { s: `<svg viewBox="0 0 220 60" width="100%" height="100%" preserveAspectRatio="none"><rect width="220" height="60" fill="#3e6fb8"/><rect x="10" y="10" width="200" height="14" fill="#fff" opacity=".8"/></svg>` } });
      dio.addBox({ x: 280, y: 136, w: 90, d: 30, h: 24, color: '#4a4f5e' });
      dio.addBox({ x: 470, y: 160, w: 20, d: 60, h: 120, color: '#c9d3dc' });
      dio.addBox({ x: 570, y: 160, w: 20, d: 60, h: 120, color: '#c9d3dc' });
      dio.addBox({ x: 470, y: 160, z: 120, w: 120, d: 60, h: 20, color: '#aab3bf' });
      dio.addDecal({ x: 420, y: 380, w: 280, h: 150, z: 1, css: 'border-radius: 75px; background: #4a4f5e; box-shadow: inset 0 0 0 26px #6a7080' });
      [['#ff5d5d', 470, 420], ['#3ea8e0', 600, 410], ['#46b46a', 650, 480], ['#ffc21a', 500, 500]].forEach(([c, x, y]) => dio.addSprite({ x, y, z: 6, w: 60, h: 60, shadow: 0, html: bagSvg(c) }));
      [[120, 420], [200, 420], [120, 500], [200, 500]].forEach(([x, y]) => dio.addBox({ x: x - 28, y: y - 22, w: 56, d: 44, h: 22, color: '#5b8ad6' }));
      const xiang = dio.addSprite({ x: 330, y: 360, w: 140, h: 130, html: xiangxiangSvg(), shadow: 0.5, tap: 'xiangxiang' });
      const shan = dio.addSprite({ x: 360, y: 540, w: 100, h: 114, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { xiangxiang: xiang, shan } };
    },
    music: () => 'airport',
    lines: { hello: hello('ap'), pick: 'ap_pick', next: 'ap_next', allDone: [['xiangxiang', 'ap_all_done'], ['shan', 'ap_all_done']] },
    games: [
      { id: 'checkin', icon: AIR.tag, marker: { x: 170, y: 150, z: 200 }, run: (R) => stepsGame(R, {
        host: 'xiangxiang', hostSvg: XX(), cls: 'ckpanel', intro: 'ap_ck_go', wrong: 'ap_ck_wrong', done: 'ap_ck_done',
        scene: `<div class="ck-counter"></div><div class="ck-scale">${AIR.scale}</div>`,
        steps: [
          { t: 'bag', line: 'ap_ck_1', icon: bagSvg('#ff5d5d', STICKER.star) },
          { t: 'tag', line: 'ap_ck_2', icon: AIR.tag },
          { t: 'belt', line: 'ap_ck_3', icon: AIR.belt },
        ],
        targets: [
          { id: 'bag', x: 80, y: 280, w: 190, h: 190, html: bagSvg('#ff5d5d', STICKER.star) },
          { id: 'tag', x: 600, y: 150, w: 150, h: 130, html: AIR.tag },
          { id: 'belt', x: 560, y: 400, w: 320, h: 140, html: AIR.belt },
        ],
        fx: async (i, t, el) => {
          const bag = el.querySelector('[data-w="bag"]');
          if (i === 0) { bag.classList.add('onscale'); sfx('slide'); await wait(500); sfx('ding'); }
          if (i === 1) { t.classList.add('stuck'); await wait(450); }
          if (i === 2) { bag.classList.add('away'); sfx('whoosh'); await wait(900); }
        },
      }) },
      { id: 'security', icon: AIR.tray, marker: { x: 530, y: 190, z: 220 }, run: (R) => sortGame(R, {
        host: 'xiangxiang', hostSvg: XX(), intro: 'ap_sc_go',
        bins: [{ id: 'tray', html: AIR.tray }, { id: 'bag', html: AIR.backpack }],
        items: shuffle([
          { k: 'jacket', bin: 'tray', html: AIR.jacket }, { k: 'ipad', bin: 'tray', html: AIR.ipad }, { k: 'robot', bin: 'tray', html: AIR.robot },
          { k: 'book', bin: 'bag', html: AIR.book }, { k: 'shirt', bin: 'bag', html: AIR.shirt }, ...(hardSolo(R) ? [{ k: 'water', bin: 'tray', html: AIR.water }] : []),
        ]),
        wrong: (it) => `ap_sc_${it.k}`, done: 'ap_sc_done' }) },
      { id: 'gate', icon: AIR.speaker, marker: { x: 160, y: 460, z: 160 }, run: gateGame },
      { id: 'carousel', icon: bagSvg('#46b46a', STICKER.dino), marker: { x: 560, y: 450, z: 170 }, run: carouselGame },
    ],
    playful(name, R) { if (name === 'xiangxiang') { sfx('whoosh'); R.hop(R.set.chars.xiangxiang.el); R.say('xiangxiang', 'xiangxiang_hi'); return true; } return false; },
  });
}

// ---- 聽廣播找登機門：叮咚！「請到三號，藍色登機門」——點對的門 ----
// 愷愷（easy）：手上的登機證也畫著號碼和顏色；岳岳只聽廣播（可以點喇叭再聽一次）
const GATES = [[1, 'red'], [2, 'green'], [3, 'blue'], [4, 'yellow']];
async function gateGame(R) {
  const { say, chk } = R;
  const P = R.panel('gatepanel', { host: 'xiangxiang', hostSvg: XX() });
  const el = P.el;
  const rounds = shuffle(GATES.slice()).slice(0, 3);
  try {
    el.innerHTML = `<div class="gt-row"></div><div class="gt-ticket"></div><button class="gt-speaker">${AIR.speaker}</button>`;
    const dots = roundDots(el, rounds.length);
    const row = el.querySelector('.gt-row'), ticket = el.querySelector('.gt-ticket'), spk = el.querySelector('.gt-speaker');
    await say('xiangxiang', 'ap_gate_go');
    chk();
    await callTurn();
    chk();
    for (let r = 0; r < rounds.length; r++) {
      dots.set(r);
      const [n, c] = rounds[r];
      row.innerHTML = shuffle(GATES.slice()).map(([g, col]) => `<button class="gt" data-g="${g}" style="--c:${GATE_COLORS[col]}"><i>${numSvg(g, { color: '#fff' })}</i><b>${AIR.plane}</b></button>`).join('');
      const easy = easyNow(R);
      ticket.innerHTML = easy ? `<div class="tk" style="--c:${GATE_COLORS[c]}">${numSvg(n, { color: '#fff' })}</div>` : `<div class="tk q">?</div>`;
      const call = async () => { sfx('ding'); await wait(500); await say('xiangxiang', `ap_gate_${n}`); };
      const right = row.querySelector(`[data-g="${n}"]`);
      setHint(() => spk);
      think(true);
      const onSpk = (e) => { e.stopPropagation(); call(); };
      spk.addEventListener('pointerdown', onSpk);
      call();   // ADHD 健檢：廣播一開始就可以點，不用等播完
      setHint(() => right);
      await tapRound(R, row, {
        right: (b) => b === right,
        onWrong: (b, w) => { b.classList.add('wrong'); b.disabled = true; say('xiangxiang', 'ap_gate_again'); if (w >= 2 || easy) right.classList.add('glowy-2d'); },
        onRight: async (b) => { think(false); b.classList.add('open'); sfx('sparkle'); R.burstAt(b, { n: 14, stars: true }); await say('xiangxiang', 'ap_gate_ok'); },
      });
      spk.removeEventListener('pointerdown', onSpk);
      chk();
      if (turnsOn() && r < rounds.length - 1) await nextTurn({ say: false });
    }
    dots.done();
    sfx('fanfare');
    await say('xiangxiang', 'ap_gate_done');
    await wait(300);
  } finally { think(false); setHint(null); P.close(); }
}

// ---- 行李轉盤：轉盤一直轉，照顏色、貼紙找我們家的行李 ----
// 愷愷（easy）：兩輪，別人的行李顏色大多不一樣；岳岳：三輪，有同顏色不同貼紙、同貼紙不同顏色的
const BAG_C = ['#ff5d5d', '#3ea8e0', '#46b46a', '#ffc21a', '#a98bff'];
const BAG_S = Object.keys(STICKER);
async function carouselGame(R) {
  const { say, chk } = R;
  const P = R.panel('carpanel', { host: 'xiangxiang', hostSvg: XX() });
  const el = P.el;
  const hard = hardSolo(R);
  const n = hard ? 3 : 2;
  let raf = 0;
  try {
    el.innerHTML = `<div class="cr-belt"></div><div class="cr-bags"></div><div class="cr-card"></div>`;
    const dots = roundDots(el, n);
    const bagsBox = el.querySelector('.cr-bags'), card = el.querySelector('.cr-card');
    await say('xiangxiang', 'ap_car_go');
    chk();
    await callTurn();
    chk();
    for (let r = 0; r < n; r++) {
      dots.set(r);
      const mine = { c: pick(BAG_C), s: pick(BAG_S) };
      const others = [];
      const key = (b) => `${b.c}|${b.s}`;
      const used = new Set([key(mine)]);
      const add = (b) => { if (!used.has(key(b))) { used.add(key(b)); others.push(b); } };
      if (hard) { add({ c: mine.c, s: pick(BAG_S.filter((x) => x !== mine.s)) }); add({ c: pick(BAG_C.filter((x) => x !== mine.c)), s: mine.s }); }
      while (others.length < 6) add({ c: pick(hard ? BAG_C : BAG_C.filter((x) => x !== mine.c)), s: pick(BAG_S) });
      const all = shuffle([mine, ...others]);
      card.innerHTML = bagSvg(mine.c, STICKER[mine.s]);
      card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
      bagsBox.innerHTML = all.map((b, i) => `<button class="cr-bag" data-m="${b === mine ? 1 : 0}" data-i="${i}">${bagSvg(b.c, STICKER[b.s])}</button>`).join('');
      const btns = [...bagsBox.children];
      // 沿著橢圓轉
      let t0 = performance.now();
      const spin = (now) => {
        const T = (now - t0) / 1000;
        btns.forEach((b, i) => { if (b.classList.contains('got')) return; const a = T * 0.35 + (i / btns.length) * Math.PI * 2; b.style.transform = `translate(${330 * Math.cos(a)}px, ${150 * Math.sin(a)}px)`; });
        raf = requestAnimationFrame(spin);
      };
      raf = requestAnimationFrame(spin);
      const right = btns.find((b) => b.dataset.m === '1');
      setHint(() => right);
      let lastSay = 0;
      await tapRound(R, bagsBox, {
        right: (b) => b === right,
        onWrong: (b, w) => { R.hop(b); if (Date.now() - lastSay > 3000) { lastSay = Date.now(); say('xiangxiang', 'ap_car_wrong'); } if (w >= 2 || (easyNow(R) && w >= 1)) right.classList.add('glowy-2d'); },
        onRight: async (b) => { b.classList.add('got'); b.classList.remove('glowy-2d'); sfx('sparkle'); R.burstAt(b, { n: 14, stars: true }); },
      });
      cancelAnimationFrame(raf); raf = 0;
      chk();
      await say('xiangxiang', r < n - 1 ? 'ap_car_next' : 'ap_car_ok');
      chk();
      if (turnsOn() && r < n - 1) await nextTurn({ say: false });
    }
    dots.done();
    sfx('fanfare');
    await say('xiangxiang', 'ap_car_done');
    await wait(300);
  } finally { if (raf) cancelAnimationFrame(raf); setHint(null); P.close(); }
}

// ============================== 澎湖（龜龜） ==============================
export function mountPenghu(root, app) {
  return runRoom(root, app, {
    id: 'penghu', host: 'guigui', back: 'town',
    build() {
      const dio = createDiorama({ w: 760, d: 620, walls: false, zoom: 0.9, cy: 0.6, base: '#3ea8e0', rim: 24, skirt: '#5ec3ee', horizon: 'sea',
        floorCss: 'background: linear-gradient(180deg, #3ea8e0 0 38%, #bfe9ff 38% 41%, #ecdcab 41% 100%)' });
      // 玄武岩石柱、雙心石滬（海裡）、燈塔、岩石上的小螃蟹
      [4, 5, 6, 5, 4, 3].forEach((h, i) => dio.addBox({ x: 40 + i * 36, y: 300, w: 34, d: 34, h: h * 22, color: '#5b6170' }));
      dio.addDecal({ x: 380, y: 30, w: 340, h: 200, z: 1, html: `<svg viewBox="0 0 340 200" width="100%" height="100%"><path d="M150 180 C40 120 40 50 90 40 C120 34 140 50 150 70 C160 50 180 34 210 40 C260 50 260 120 150 180Z" fill="none" stroke="#8d96a3" stroke-width="12" stroke-dasharray="16 6"/><path d="M270 170 C220 140 220 100 245 95 C258 92 266 100 270 110 C274 100 282 92 295 95 C320 100 320 140 270 170Z" fill="none" stroke="#a9b2bf" stroke-width="10" stroke-dasharray="12 6"/></svg>` });
      dio.addSprite({ x: 700, y: 330, w: 70, h: 130, shadow: 0.4, html: `<svg viewBox="0 0 80 120"><path d="M24 120 L30 30 H50 L56 120Z" fill="#fff"/><path d="M27 60 H53 M25 90 H55" stroke="#3a3550" stroke-width="12"/><rect x="28" y="16" width="24" height="16" fill="#ffd23f"/><path d="M24 16 L40 2 L56 16Z" fill="#3a3550"/></svg>` });
      [[560, 480], [180, 540]].forEach(([x, y]) => dio.addSprite({ x, y, w: 60, h: 50, shadow: 0.2, html: PH.crab }));
      dio.addSprite({ x: 300, y: 470, w: 80, h: 60, shadow: 0.3, html: PH.stone });
      const guigui = dio.addSprite({ x: 420, y: 400, w: 130, h: 130, html: guiguiSvg(), shadow: 0.5, tap: 'guigui' });
      const shan = dio.addSprite({ x: 500, y: 540, w: 100, h: 114, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { guigui, shan } };
    },
    music: () => 'sea',
    lines: { hello: hello('ph'), pick: 'ph_pick', next: 'ph_next', allDone: [['guigui', 'ph_all_done'], ['shan', 'ph_all_done']] },
    games: [
      { id: 'weir', icon: PH.stone, marker: { x: 540, y: 120, z: 160 }, run: weirGame },
      { id: 'basalt', icon: basalt(4), marker: { x: 130, y: 300, z: 230 }, run: basaltGame },
      { id: 'tide', icon: PH.crab, marker: { x: 560, y: 480, z: 150 }, run: (R) => sortGame(R, {
        host: 'guigui', hostSvg: GG(), intro: 'ph_tide_go',
        bins: [{ id: 'good', html: itemSvg('good') }, { id: 'bad', html: itemSvg('bad') }],
        items: shuffle([
          { k: 'shoes', bin: 'good', html: PH.shoes }, { k: 'camera', bin: 'good', html: PH.camera }, { k: 'adult', bin: 'good', html: personSvg('dad') },
          { k: 'crab', bin: 'bad', html: PH.takeCrab }, { k: 'rock', bin: 'bad', html: PH.flipRock }, ...(hardSolo(R) ? [{ k: 'tide', bin: 'bad', html: PH.tideUp }] : []),
        ]),
        wrong: (it) => `ph_tide_${it.k}`, done: 'ph_tide_done' }) },
      { id: 'turtle', icon: PH.turtle, marker: { x: 420, y: 260, z: 170 }, run: (R) => stepsGame(R, {
        host: 'guigui', hostSvg: GG(), cls: 'turtlepanel', intro: 'ph_tu_go', wrong: 'ph_tu_wrong', done: 'ph_tu_done',
        scene: `<div class="tu-sea"></div><div class="tu-mom">${PH.turtle}</div><div class="tu-eggs">${PH.eggs}</div><div class="tu-babies">${[0, 1, 2, 3, 4].map((i) => `<i style="--i:${i}">${PH.baby}</i>`).join('')}</div><div class="tu-kid">${kidSvg('kk', ['shirt', 'pants'])}</div>`,
        steps: [
          { t: 'torch', line: 'ph_tu_1', icon: PH.torchOff },
          { t: 'radio', line: 'ph_tu_2', icon: PH.radioOff },
          { t: 'rope', line: 'ph_tu_3', icon: PH.rope },
        ],
        targets: [
          { id: 'torch', x: 640, y: 380, w: 170, h: 130, html: PH.torchOn },
          { id: 'radio', x: 90, y: 420, w: 160, h: 130, html: PH.radioOn },
          { id: 'rope', x: 330, y: 470, w: 280, h: 110, html: PH.rope },
        ],
        fx: async (i, t, el) => {
          if (i === 0) { t.innerHTML = PH.torchOff; el.classList.add('dark'); sfx('click'); }
          if (i === 1) { t.innerHTML = PH.radioOff; sfx('tvoff'); }
          if (i === 2) { el.querySelector('.tu-kid').classList.add('back'); await wait(600); el.querySelector('.tu-babies').classList.add('go'); sfx('splash'); await wait(2600); }
        },
      }) },
    ],
    playful(name, R) { if (name === 'guigui') { sfx('water'); R.hop(R.set.chars.guigui.el); R.say('guigui', 'guigui_hi'); return true; } return false; },
  });
}

// ---- 雙心石滬：把石頭放在虛線上，圍出兩個愛心；潮水退了，數數愛心裡的魚 ----
const heartPts = (cx, cy, k, n) => [...Array(n)].map((_, i) => {
  const t = (i / n) * Math.PI * 2;
  const x = 16 * Math.sin(t) ** 3, y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [cx + x * k, cy - y * k];
});
async function weirGame(R) {
  const { say, chk } = R;
  const P = R.panel('weirpanel', { host: 'guigui', hostSvg: GG() });
  const el = P.el;
  try {
    // 兩個愛心大多已經用石頭圍好了，留幾個缺口讓小孩補（愷愷 5 個、岳岳 8 個）
    const big = heartPts(320, 300, 13, 27), small = heartPts(700, 340, 8, 18);
    const gapsN = hardSolo(R) ? [5, 3] : [3, 2];
    const pickGaps = (n, len) => shuffle([...Array(len).keys()].filter((i) => i % 3 === 1)).slice(0, n);
    const gB = pickGaps(gapsN[0], big.length), gS = pickGaps(gapsN[1], small.length);
    const stoneAt = ([x, y], k) => `<i class="wr-stone" style="left:${x - 24}px;top:${y - 20}px;--r:${(k * 37) % 30 - 15}deg">${PH.stone}</i>`;
    const outline = (cx, cy, k) => 'M' + heartPts(cx, cy, k, 80).map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join(' L') + 'Z';
    el.innerHTML = `<div class="wr-sea"></div><svg class="wr-path" viewBox="0 0 940 640"><path d="${outline(320, 300, 13)}"/><path d="${outline(700, 340, 8)}"/></svg>${big.map((p, i) => (gB.includes(i) ? '' : stoneAt(p, i))).join('')}${small.map((p, i) => (gS.includes(i) ? '' : stoneAt(p, i + 40))).join('')}
      ${[...gB.map((i) => big[i]), ...gS.map((i) => small[i])].map(([x, y], i) => `<button class="wr-slot" data-i="${i}" style="left:${x - 34}px;top:${y - 30}px"></button>`).join('')}<div class="wr-fish"></div>`;
    const slots = [...el.querySelectorAll('.wr-slot')];
    await say('guigui', 'ph_weir_go');
    chk();
    await callTurn();
    chk();
    let placed = 0;
    const glow = () => slots.forEach((s, k) => s.classList.toggle('glowy-2d', easyNow(R) && !s.classList.contains('on') && k === slots.findIndex((x) => !x.classList.contains('on'))));
    glow();
    setHint(() => slots.find((s) => !s.classList.contains('on')));
    await R.race(new Promise((resolve) => {
      el.addEventListener('pointerdown', (e) => {
        const s = e.target.closest('.wr-slot');
        if (!s || s.classList.contains('on')) return;
        e.stopPropagation();
        s.classList.add('on');
        s.innerHTML = PH.stone;
        sfx('knock');
        playNote(['C5', 'D5', 'E5', 'G5', 'A5', 'C6'][placed % 6], 'marimba', 0.18);
        placed++;
        if (placed === slots.length) { resolve(); return; }
        glow();
        if (turnsOn() && placed % 3 === 0) nextTurn({ say: false });
      });
    }));
    chk();
    // 退潮：水變淺，魚留在愛心裡
    sfx('splash');
    el.classList.add('ebb');
    const fish = el.querySelector('.wr-fish');
    const nFish = hardSolo(R) ? 7 : 5;
    const fp = [[280, 300], [360, 330], [320, 380], [250, 360], [380, 270], [690, 340], [720, 380]].slice(0, nFish);
    fish.innerHTML = fp.map(([x, y], i) => `<button class="wr-f" style="left:${x - 30}px;top:${y - 20}px;--i:${i}">${PH.fish}<b></b></button>`).join('');
    await wait(900);
    await say('guigui', 'ph_weir_tide');
    chk();
    let c = 0;
    const fs = [...fish.children];
    setHint(() => fs.find((f) => !f.classList.contains('counted')));
    await R.race(new Promise((resolve) => {
      fish.addEventListener('pointerdown', (e) => {
        const f = e.target.closest('.wr-f');
        if (!f || f.classList.contains('counted')) return;
        e.stopPropagation();
        c++;
        f.classList.add('counted');
        f.querySelector('b').innerHTML = numSvg(c, { color: '#3a3550' });
        playNote(['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'][c - 1], 'musicbox', 0.25);
        if (c === fs.length) resolve();
      });
    }));
    chk();
    sfx('fanfare');
    R.burstAt(fish, { n: 20, stars: true });
    await say('guigui', 'ph_weir_done');
    await wait(300);
  } finally { setHint(null); P.close(); }
}

// ---- 玄武岩：一排高高低低的石柱，補上缺的那一根 ----
// 愷愷：兩輪（一路變高、一路變矮）；岳岳：三輪（像山一樣先高再低、高低高低、一次缺兩根）
async function basaltGame(R) {
  const { say, chk } = R;
  const P = R.panel('basaltpanel', { host: 'guigui', hostSvg: GG() });
  const el = P.el;
  const rounds = hardSolo(R)
    ? [{ h: [1, 2, 3, 4, 3, 2, 1], gaps: [2, 5] }, { h: [2, 4, 2, 4, 2, 4], gaps: [3] }, { h: [1, 2, 3, 4, 5, 6], gaps: [1, 4] }]
    : [{ h: [1, 2, 3, 4, 5], gaps: [2] }, { h: [5, 4, 3, 2, 1], gaps: [3] }];
  try {
    el.innerHTML = `<div class="ba-sea"></div><div class="ba-row"></div><div class="ba-opts"></div>`;
    const dots = roundDots(el, rounds.length);
    const row = el.querySelector('.ba-row'), opts = el.querySelector('.ba-opts');
    await say('guigui', 'ph_ba_go');
    chk();
    await callTurn();
    chk();
    for (let r = 0; r < rounds.length; r++) {
      dots.set(r);
      const { h, gaps } = rounds[r];
      row.innerHTML = h.map((v, i) => `<div class="ba-col ${gaps.includes(i) ? 'gap' : ''}" data-i="${i}">${gaps.includes(i) ? '' : basalt(v)}</div>`).join('');
      for (const g of gaps) {
        const need = h[g];
        const slot = row.querySelector(`[data-i="${g}"]`);
        slot.classList.add('now');
        const choices = shuffle([need, need === 1 ? need + 2 : need - 1, need + 1].filter((v, i, a) => a.indexOf(v) === i && v >= 1 && v <= 6));
        opts.innerHTML = choices.map((v) => `<button class="ba-opt" data-v="${v}">${basalt(v, '#6a7080')}</button>`).join('');
        const right = opts.querySelector(`[data-v="${need}"]`);
        setHint(() => right);
        think(true);
        await tapRound(R, opts, {
          right: (b) => +b.dataset.v === need,
          onWrong: (b, w) => { b.disabled = true; b.classList.add('wrong'); say('guigui', 'ph_ba_wrong'); if (w >= 2 || easyNow(R)) right.classList.add('glowy-2d'); },
          onRight: async () => { think(false); slot.classList.remove('gap', 'now'); slot.innerHTML = basalt(need); slot.classList.add('pop'); sfx('knock'); sfx('sparkle'); R.burstAt(slot, { n: 10, stars: true }); },
        });
        think(false);
        chk();
      }
      await say('guigui', 'ph_ba_ok');
      chk();
      if (turnsOn() && r < rounds.length - 1) await nextTurn({ say: false });
    }
    dots.done();
    sfx('fanfare');
    await say('guigui', 'ph_ba_done');
    await wait(300);
  } finally { think(false); setHint(null); P.close(); }
}

// ============================== 合歡山（雪雪） ==============================
export function mountHehuan(root, app) {
  return runRoom(root, app, {
    id: 'hehuan', host: 'xuexue', back: 'town',
    build() {
      const dio = createDiorama({ w: 760, d: 620, walls: false, zoom: 0.9, cy: 0.6, base: '#c9d9ec', rim: 24, skirt: '#dfeaf6', horizon: 'mountain',
        floorCss: 'background: radial-gradient(circle at 50% 45%, #ffffff, #e9f1fa 60%, #d6e4f2)' });
      // 松樹、武嶺的牌子、雪球、觀星的望遠鏡
      for (const [x, y] of [[60, 80], [160, 60], [660, 90], [720, 400], [60, 480], [700, 560]]) dio.addSprite({ x, y, w: 80, h: 120, shadow: 0.4, html: pine });
      dio.addBox({ x: 300, y: 90, w: 160, d: 24, h: 90, color: '#8a5a32', faces: { s: `<svg viewBox="0 0 160 90" width="100%" height="100%" preserveAspectRatio="none"><rect width="160" height="90" fill="#8a5a32"/><rect x="10" y="10" width="140" height="70" rx="6" fill="#f3e6c8"/><path d="M24 64 L60 26 L78 44 L100 22 L136 64Z" fill="#7aa0c8"/><path d="M52 34 L60 26 L68 34 Z M92 30 L100 22 L108 30Z" fill="#fff"/></svg>` } });
      [[560, 300, 70], [610, 330, 50]].forEach(([x, y, w]) => dio.addSprite({ x, y, w, h: w, shadow: 0.3, html: HH.ball }));
      dio.addSprite({ x: 180, y: 300, w: 80, h: 100, shadow: 0.3, html: `<svg viewBox="0 0 80 100"><path d="M40 60 L20 98 M40 60 L60 98 M40 60 V98" stroke="#3a3550" stroke-width="4"/><rect x="14" y="30" width="56" height="20" rx="8" fill="#3e6fb8" transform="rotate(-25 40 40)"/><circle cx="66" cy="26" r="9" fill="#bfe6ff"/></svg>` });
      const xuexue = dio.addSprite({ x: 400, y: 400, w: 130, h: 138, html: xuexueSvg(), shadow: 0.4, tap: 'xuexue' });
      const shan = dio.addSprite({ x: 480, y: 540, w: 100, h: 114, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      for (let i = 0; i < 12; i++) dio.addSprite({ x: 40 + (i * 61) % 680, y: 40 + (i * 47) % 540, z: 160 + (i % 3) * 40, w: 14, h: 14, shadow: 0, cls: 'snowflake', html: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6" fill="#fff"/></svg>' });
      return { dio, chars: { xuexue, shan } };
    },
    music: () => 'snow',
    lines: { hello: hello('hh'), pick: 'hh_pick', next: 'hh_next', allDone: [['xuexue', 'hh_all_done'], ['shan', 'hh_all_done']] },
    games: [
      { id: 'layers', icon: HH.coat, marker: { x: 260, y: 200, z: 200 }, run: (R) => stepsGame(R, {
        host: 'xuexue', hostSvg: XU(), cls: 'layerpanel', intro: 'hh_ly_go', wrong: 'hh_ly_wrong', done: 'hh_ly_done',
        scene: `<div class="ly-kid">${kidSvg((turnsOn() ? whoseTurn() : R.members[0]) || 'yy', ['pants'])}</div><div class="ly-on"></div>`,
        steps: [
          { t: 'inner', line: 'hh_ly_1', icon: HH.inner },
          { t: 'sweater', line: 'hh_ly_2', icon: HH.sweater },
          { t: 'coat', line: 'hh_ly_3', icon: HH.coat },
          { t: 'beanie', line: 'hh_ly_4', icon: HH.beanie },
          { t: 'gloves', line: 'hh_ly_5', icon: HH.gloves },
        ],
        targets: shuffleSpots([
          { id: 'inner', html: HH.inner }, { id: 'sweater', html: HH.sweater }, { id: 'coat', html: HH.coat },
          { id: 'beanie', html: HH.beanie }, { id: 'gloves', html: HH.gloves }, { id: 'shorts', html: HH.shorts }, { id: 'flipflop', html: HH.flipflop },
        ]),
        fx: async (i, t, el) => { const on = el.querySelector('.ly-on'); const k = ['inner', 'sweater', 'coat', 'beanie', 'gloves'][i]; on.insertAdjacentHTML('beforeend', `<i class="ly-${k}">${HH[k]}</i>`); t.classList.add('used'); sfx('pop'); await wait(250); },
      }) },
      { id: 'snowman', icon: HH.ball, marker: { x: 585, y: 315, z: 170 }, run: snowmanGame },
      { id: 'walk', icon: HH.foot, marker: { x: 380, y: 110, z: 230 }, run: walkGame },
      { id: 'stars', icon: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#26305e"/>' + [[24, 40], [38, 36], [52, 42], [64, 50], [70, 66], [86, 62], [84, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#ffd23f"/>`).join('') + '</svg>', marker: { x: 180, y: 300, z: 180 }, run: starsGame },
    ],
    playful(name, R) { if (name === 'xuexue') { sfx('boing'); R.hop(R.set.chars.xuexue.el); R.say('xuexue', 'xuexue_hi'); return true; } return false; },
  });
}
// 衣服散在小孩左右兩邊
function shuffleSpots(items) {
  const spots = shuffle([[40, 130], [40, 290], [40, 450], [660, 130], [660, 290], [660, 450], [800, 290]]);
  return items.map((it, i) => ({ ...it, x: spots[i][0], y: spots[i][1], w: 140, h: 140 }));
}

// ---- 堆雪人：大的放下面、中的放中間、小的放上面；再戴上眼睛、鼻子、圍巾、帽子 ----
// 一起玩：愷愷堆雪球（大小），岳岳打扮
async function snowmanGame(R) {
  const { say, chk } = R;
  const P = R.panel('snowpanel', { host: 'xuexue', hostSvg: XU() });
  const el = P.el;
  try {
    const sizes = [200, 150, 105];   // 大 → 小
    el.innerHTML = `<div class="sn-ground"></div><div class="sn-pile">${shuffle([0, 1, 2]).map((i) => `<button class="sn-ball" data-i="${i}" style="--s:${sizes[i]}px">${HH.ball}</button>`).join('')}</div><div class="sn-stack"></div><div class="sn-deco"></div>`;
    const stack = el.querySelector('.sn-stack'), pile = el.querySelector('.sn-pile'), deco = el.querySelector('.sn-deco');
    await say('xuexue', 'hh_sm_go');
    chk();
    if (R.members.includes('kk') && turnsOn()) await turnTo('kk'); else await callTurn();
    chk();
    for (let k = 0; k < 3; k++) {
      const right = pile.querySelector(`[data-i="${k}"]`);
      if (easyNow(R)) right.classList.add('glowy-2d');
      setHint(() => right);
      let lastSay = 0;
      await tapRound(R, pile, {
        right: (b) => b === right,
        onWrong: (b, w) => { R.hop(b); if (Date.now() - lastSay > 3000) { lastSay = Date.now(); say('xuexue', 'hh_sm_wrong'); } if (w >= 2) right.classList.add('glowy-2d'); },
        onRight: async (b) => { b.classList.remove('glowy-2d'); stack.appendChild(b); b.disabled = true; sfx('squish'); R.burstAt(b, { n: 8, colors: ['#fff', '#dfeaf6'] }); },
      });
      chk();
    }
    // 打扮
    if (R.members.includes('yy') && R.members.length > 1 && turnsOn()) await turnTo('yy');
    const parts = ['coal', 'carrot', 'scarf', 'beanie'];
    deco.innerHTML = shuffle(parts).map((k) => `<button class="sn-item" data-k="${k}">${HH[k]}</button>`).join('');
    await say('xuexue', 'hh_sm_deco');
    chk();
    let left = parts.length;
    setHint(() => deco.querySelector('.sn-item:not(:disabled)'));
    await R.race(new Promise((resolve) => {
      deco.addEventListener('pointerdown', (e) => {
        const b = e.target.closest('.sn-item');
        if (!b || b.disabled) return;
        e.stopPropagation();
        b.disabled = true;
        b.classList.add('used');
        stack.insertAdjacentHTML('beforeend', `<i class="sn-on sn-${b.dataset.k}">${HH[b.dataset.k]}</i>`);
        sfx('pop');
        if (--left === 0) resolve();
      });
    }));
    chk();
    sfx('fanfare');
    R.burstAt(stack, { n: 22, stars: true, colors: ['#fff', '#bfe6ff', '#ffd23f'] });
    await say('xuexue', 'hh_sm_done');
    await wait(300);
  } finally { setHint(null); P.close(); }
}

// ---- 高山慢慢走：山上空氣比較少，跟著燈「亮一下走一步」；走太快會喘，喘三次就要停下來按住深呼吸 ----
// 這是給岳岳練「慢下來」：急著一直點不會比較快，反而要停下來
async function walkGame(R) {
  const { say, chk } = R;
  const P = R.panel('walkpanel', { host: 'xuexue', hostSvg: XU() });
  const el = P.el;
  const goal = 8;
  const gap = easyNow(R) ? 1000 : 1200;   // 兩步之間至少要隔多久
  let timer = 0;
  try {
    el.innerHTML = `<div class="wk-hill">${[...Array(goal)].map((_, i) => `<i style="--i:${i}"></i>`).join('')}</div><div class="wk-kid">${kidSvg((turnsOn() ? whoseTurn() : R.members[0]) || 'yy', ['shirt', 'pants'])}</div>
      <div class="wk-top">${HH.ball}</div><div class="wk-light"></div><div class="wk-puff">${[0, 1, 2].map(() => '<i></i>').join('')}</div><button class="wk-foot">${HH.foot}</button><button class="wk-breath">${HH.breath}<b></b></button>`;
    const kid = el.querySelector('.wk-kid'), light = el.querySelector('.wk-light'), puffs = [...el.querySelectorAll('.wk-puff i')], foot = el.querySelector('.wk-foot'), breath = el.querySelector('.wk-breath');
    await say('xuexue', 'hh_wk_go');
    chk();
    await callTurn();
    chk();
    let n = 0, last = performance.now() - gap, puff = 0, resting = false, lastFast = 0;
    const place = () => { kid.style.transform = `translate(${n * 70}px, ${-n * 52}px)`; };
    place();
    // 燈：可以走的時候亮綠燈
    const tick = () => { light.classList.toggle('go', !resting && performance.now() - last >= gap); timer = requestAnimationFrame(tick); };
    timer = requestAnimationFrame(tick);
    setHint(() => (resting ? breath : foot));
    await R.race(new Promise((resolve) => {
      foot.addEventListener('pointerdown', async (e) => {
        e.stopPropagation();
        if (n >= goal) return;
        if (resting) { sfx('soft'); return; }
        const now = performance.now();
        if (now - last < gap) {
          // 太快：喘一下
          sfx('soft');
          puff++;
          puffs.forEach((p, i) => p.classList.toggle('on', i < puff));
          kid.classList.remove('pant'); void kid.offsetWidth; kid.classList.add('pant');
          last = now;
          if (puff >= 3) {
            resting = true;
            breath.classList.add('show', 'glowy-2d');
            say('xuexue', 'hh_wk_rest');
          } else if (now - lastFast > 4000) { lastFast = now; say('xuexue', 'hh_wk_fast'); }
          return;
        }
        last = now;
        n++;
        sfx('tap');
        playNote(['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'][n - 1], 'musicbox', 0.22);
        place();
        if (n >= goal) resolve();
      });
      // 深呼吸：按住 2 秒（吸）→ 放開（吐）
      let down = 0;
      breath.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (!resting) return; down = performance.now(); breath.classList.add('in'); sfx('breathIn'); });
      const up = async () => {
        if (!down) return;
        const held = performance.now() - down;
        down = 0;
        breath.classList.remove('in');
        if (held < 1500) return;
        sfx('breathOut');
        resting = false;
        puff = 0;
        puffs.forEach((p) => p.classList.remove('on'));
        breath.classList.remove('show', 'glowy-2d');
        last = performance.now();
        say('xuexue', 'hh_wk_ok');
      };
      window.addEventListener('pointerup', up);
      R.app.onLeave(() => window.removeEventListener('pointerup', up));
    }));
    chk();
    cancelAnimationFrame(timer); timer = 0;
    sfx('fanfare');
    R.burstAt(kid, { n: 22, stars: true });
    await say('xuexue', 'hh_wk_done');
    await wait(300);
  } finally { if (timer) cancelAnimationFrame(timer); setHint(null); P.close(); }
}

// ---- 晚上觀星：照順序點星星，連出北斗七星 ----
// 愷愷：星星上是 1～7；岳岳：星星上是正在練的那一排口訣（例如 6、12、18…），照順序連
const DIPPER = [[150, 170], [260, 150], [370, 190], [470, 240], [500, 370], [680, 380], [700, 230]];
async function starsGame(R) {
  const { say, chk } = R;
  const P = R.panel('starpanel', { host: 'xuexue', hostSvg: XU() });
  const el = P.el;
  try {
    const multi = R.members.includes('yy') && !easyNow(R);
    const a = multi ? M.focusRow() : 1;
    const label = (i) => (multi ? a * (i + 1) : i + 1);
    el.innerHTML = `<svg class="st-lines" viewBox="0 0 940 640"></svg>${[...Array(40)].map((_, i) => `<i class="st-dust" style="left:${(i * 97) % 920}px;top:${(i * 61) % 600}px"></i>`).join('')}
      ${shuffle(DIPPER.map((p, i) => i)).map((i) => `<button class="st" data-i="${i}" style="left:${DIPPER[i][0] - 45}px;top:${DIPPER[i][1] - 45}px"><b>${numSvg(label(i), { color: '#3a3550' })}</b></button>`).join('')}`;
    const lines = el.querySelector('.st-lines');
    await say('xuexue', multi ? 'hh_st_mult' : 'hh_st_go');
    chk();
    await callTurn();
    chk();
    for (let k = 0; k < DIPPER.length; k++) {
      const right = el.querySelector(`.st[data-i="${k}"]`);
      if (easyNow(R) && k > 0) right.classList.add('glowy-2d');
      setHint(() => right);
      let lastSay = 0;
      await tapRound(R, el, {
        right: (b) => b === right,
        onWrong: (b, w) => { if (!b.classList.contains('st') || b.classList.contains('on')) return; R.hop(b); if (Date.now() - lastSay > 3000) { lastSay = Date.now(); say('xuexue', 'hh_st_wrong'); } if (w >= 2) right.classList.add('glowy-2d'); },
        onRight: async (b) => {
          b.classList.remove('glowy-2d'); b.classList.add('on'); b.disabled = true;
          playNote(['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6'][k], 'musicbox', 0.28);
          if (k > 0) { const [x1, y1] = DIPPER[k - 1], [x2, y2] = DIPPER[k]; lines.insertAdjacentHTML('beforeend', `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`); }
          if (multi) R.say('bibi', `c_${a}_${k + 1}`);
        },
      });
      chk();
      if (turnsOn() && k < DIPPER.length - 1 && k % 2 === 1) nextTurn({ say: false });
    }
    lines.insertAdjacentHTML('beforeend', `<line x1="${DIPPER[6][0]}" y1="${DIPPER[6][1]}" x2="${DIPPER[3][0]}" y2="${DIPPER[3][1]}"/>`);
    el.classList.add('done');
    sfx('star');
    R.burstAt(el.querySelector('.st[data-i="4"]'), { n: 26, stars: true });
    await say('xuexue', 'hh_st_done');
    await wait(400);
  } finally { setHint(null); P.close(); }
}

// ============================== 花東（飄飄） ==============================
//   太魯閣峽谷：轉一轉找燕子、吊橋、獼猴、長春祠的瀑布（有的躲在大理石峭壁後面）；說明安全帽、步道內側、不撿石頭、不餵猴子
//   縱谷騎腳踏車：戴好安全帽，看路牌做對的動作（左轉手勢、右轉手勢、按煞車）
//   熱氣球：按住加火升高、放開慢慢降，穿過雲的空隙，最後降落在草地上
//   花蓮賞鯨：海豚跳出水面的時候點一下、數一數，最後大鯨魚噴水
const PP = () => piaopiaoSvg();
const marble = (w, h) => `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none"><rect width="${w}" height="${h}" fill="#c9ced8"/>${[...Array(8)].map((_, i) => `<path d="M0 ${20 + i * h / 8} Q${w / 2} ${i * h / 8} ${w} ${30 + i * h / 8}" stroke="#eef1f6" stroke-width="5" fill="none"/>`).join('')}</svg>`;
export function mountHuadong(root, app) {
  return runRoom(root, app, {
    id: 'huadong', host: 'piaopiao', back: 'town',
    build() {
      const dio = createDiorama({ w: 760, d: 620, walls: false, zoom: 0.9, cy: 0.6, base: '#7d8494', rim: 24, skirt: '#8fd36a', horizon: 'mountain',
        floorCss: 'background: linear-gradient(90deg, #a6dd86 0 30%, #7fd3ff 30% 40%, #a6dd86 40% 100%)' });
      // 太魯閣：兩排大理石峭壁（上面長著樹）夾著立霧溪，峭壁之間一座紅色吊橋；右邊是縱谷的稻田
      dio.addDecal({ x: 215, y: 0, w: 80, h: 620, z: 0.8, css: 'background: linear-gradient(90deg, #5ec3ee, #8fdcff 50%, #5ec3ee); border-radius: 20px' });
      [[30, 20, 180, 130, 170], [50, 160, 160, 120, 140], [30, 290, 180, 140, 165], [300, 20, 150, 130, 185], [310, 160, 140, 120, 150], [300, 290, 150, 140, 175]].forEach(([x, y, w, d, h]) => dio.addBox({ x, y, w, d, h, color: '#c9ced8', top: '#7cb86a', faces: { s: marble(w, h), n: marble(w, h), e: marble(d, h), w: marble(d, h) } }));
      dio.addBox({ x: 205, y: 168, z: 118, w: 100, d: 14, h: 6, color: '#ff4a4a' });
      for (let i = 0; i < 6; i++) dio.addDecal({ x: 470 + (i % 3) * 95, y: 60 + Math.floor(i / 3) * 150, w: 85, h: 130, z: 0.8, css: `background:repeating-linear-gradient(0deg,${i % 2 ? '#9fe07a' : '#d9e36a'} 0 10px,#7cc35a 10px 13px);border-radius:8px` });
      dio.addSprite({ x: 640, y: 380, z: 220, w: 110, h: 120, shadow: 0.15, html: FAR_ICON.huadong });
      const piao = dio.addSprite({ x: 560, y: 470, z: 20, w: 140, h: 150, html: piaopiaoSvg(), shadow: 0.4, tap: 'piaopiao' });
      const shan = dio.addSprite({ x: 450, y: 560, w: 100, h: 114, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { piaopiao: piao, shan } };
    },
    music: () => 'lake',
    lines: { hello: hello('hd'), pick: 'hd_pick', next: 'hd_next', allDone: [['piaopiao', 'hd_all_done'], ['shan', 'hd_all_done']] },
    games: [
      { id: 'gorge', icon: HD.helmet, marker: { x: 250, y: 230, z: 220 }, run: (R) => findGame(R, {
        host: 'piaopiao', intro: 'hd_gg_go', found: (id) => `hd_gg_${id}`, hiddenLine: 'hd_gg_hidden', done: 'hd_gg_done',
        items: [
          { id: 'bird', x: 255, y: 90, z: 120, w: 80, h: 70, html: HD.bird },
          { id: 'bridge', x: 255, y: 182, z: 110, w: 130, h: 80, html: HD.bridge },
          { id: 'monkey', x: 480, y: 90, z: 0, w: 80, h: 90, html: HD.monkey, hidden: true, seenFrom: [1, 2] },
          { id: 'waterfall', x: 120, y: 10, z: 0, w: 90, h: 120, html: HD.waterfall, hidden: true, seenFrom: [2, 3] },
        ],
      }) },
      { id: 'bike', icon: HD.handR, marker: { x: 560, y: 140, z: 160 }, run: bikeGame },
      { id: 'balloon', icon: FAR_ICON.huadong, marker: { x: 640, y: 380, z: 380 }, run: balloonGame },
      { id: 'whale', icon: HD.dolphin, marker: { x: 260, y: 520, z: 160 }, run: whaleGame },
    ],
    playful(name, R) { if (name === 'piaopiao') { sfx('whoosh'); R.hop(R.set.chars.piaopiao.el); R.say('piaopiao', 'piaopiao_hi'); return true; } return false; },
  });
}

// ---- 縱谷騎腳踏車：先戴安全帽；路牌出來就做對的動作 ----
// 愷愷（easy）：飄飄直接說要做什麼、對的按鈕發亮；岳岳：只看路牌，做錯才說明
const BIKE_EV = { left: { sign: HD.signL, act: 'L', line: 'hd_bk_left' }, right: { sign: HD.signR, act: 'R', line: 'hd_bk_right' }, down: { sign: HD.signDown, act: 'B', line: 'hd_bk_down' }, walk: { sign: HD.signWalk, act: 'B', line: 'hd_bk_walk' } };
async function bikeGame(R) {
  const { say, chk } = R;
  const P = R.panel('bikepanel', { host: 'piaopiao', hostSvg: PP() });
  const el = P.el;
  const who = () => (turnsOn() ? whoseTurn() : R.members[0]) || 'yy';
  const evs = hardSolo(R) ? shuffle(['left', 'right', 'down', 'walk', 'left', 'right']) : shuffle(['left', 'right', 'down', 'walk']);
  try {
    el.innerHTML = `<div class="bk-road"></div><div class="bk-field l"></div><div class="bk-field r"></div><div class="bk-rider"><div class="bk-kid">${kidSvg(who(), ['shirt', 'pants'])}</div></div>
      <div class="bk-sign"></div><button class="bk-helm">${HD.helmet}</button><div class="bk-acts"><button class="bk-act" data-a="L">${HD.handL}</button><button class="bk-act" data-a="B">${HD.brake}</button><button class="bk-act" data-a="R">${HD.handR}</button></div>`;
    const dots = roundDots(el, evs.length);
    const rider = el.querySelector('.bk-rider'), sign = el.querySelector('.bk-sign'), helm = el.querySelector('.bk-helm'), acts = el.querySelector('.bk-acts');
    await say('piaopiao', 'hd_bk_go');
    chk();
    await callTurn();
    chk();
    // 戴安全帽
    helm.classList.add('glowy-2d');
    setHint(() => helm);
    await tapRound(R, el, { right: (b) => b === helm, onWrong: () => say('piaopiao', 'hd_bk_helmet') });
    helm.remove();
    const bikeOf = () => `<div class="bk-bike">${VEHICLES.bike(who() === 'kk' ? '#ff8a3d' : '#2f7fe0')}</div>`;
    rider.innerHTML = bikeOf();   // 戴好安全帽，騎上腳踏車
    sfx('click'); sfx('sparkle');
    await say('piaopiao', 'hd_bk_helmet_ok');
    chk();
    el.classList.add('riding');
    for (let i = 0; i < evs.length; i++) {
      dots.set(i);
      await wait(1400);
      chk();
      const ev = BIKE_EV[evs[i]];
      sign.innerHTML = ev.sign;
      sign.classList.remove('come'); void sign.offsetWidth; sign.classList.add('come');
      sfx('ding');
      const easy = easyNow(R);
      const right = acts.querySelector(`[data-a="${ev.act}"]`);
      if (easy) { right.classList.add('glowy-2d'); say('piaopiao', ev.line); }
      setHint(() => right);
      think(true);
      await tapRound(R, acts, {
        right: (b) => b === right,
        onWrong: (b, w) => { R.hop(b); say('piaopiao', ev.line); if (w >= 2 || easy) right.classList.add('glowy-2d'); },
        onRight: async (b) => {
          think(false); right.classList.remove('glowy-2d');
          rider.classList.remove('turn-l', 'turn-r', 'brake'); void rider.offsetWidth;
          rider.classList.add(ev.act === 'L' ? 'turn-l' : ev.act === 'R' ? 'turn-r' : 'brake');
          sfx(ev.act === 'B' ? 'slide' : 'sparkle');
          R.burstAt(b, { n: 10, stars: true });
        },
      });
      think(false);
      sign.classList.remove('come');
      chk();
      if (turnsOn() && i < evs.length - 1) { await nextTurn({ say: false }); rider.innerHTML = bikeOf(); }
    }
    dots.done();
    el.classList.remove('riding');
    sfx('fanfare');
    await say('piaopiao', 'hd_bk_done');
    await wait(300);
  } finally { think(false); setHint(null); P.close(); }
}

// ---- 熱氣球：按住「火」升高，放開慢慢降；穿過雲的空隙，最後降在草地上 ----
// 不會失敗：碰到雲只會停住，調好高度就能繼續往前飄
async function balloonGame(R) {
  const { say, chk } = R;
  const P = R.panel('balloonpanel', { host: 'piaopiao', hostSvg: PP() });
  const el = P.el;
  const easy = easyNow(R);
  const gapH = easy ? 220 : 160;
  const gates = (hardSolo(R) ? [[300, 150], [520, 330], [720, 200]] : [[340, 170], [600, 300]]).map(([x, y]) => ({ x, y }));   // y：空隙的中心
  let raf = 0;
  try {
    el.innerHTML = `<div class="bl-sky"></div><div class="bl-grass"></div><div class="bl-field"></div>${gates.map((g) => `<i class="bl-cloud" style="left:${g.x - 60}px;top:-20px;height:${g.y - gapH / 2 + 20}px"></i><i class="bl-cloud" style="left:${g.x - 60}px;top:${g.y + gapH / 2}px;height:${600 - g.y - gapH / 2}px"></i>`).join('')}
      <div class="bl-ball">${FAR_ICON.huadong}<i class="bl-fire">${HD.fire}</i></div><button class="bl-btn">${HD.fire}</button>`;
    const ball = el.querySelector('.bl-ball'), btn = el.querySelector('.bl-btn');
    await say('piaopiao', 'hd_bl_go');
    chk();
    await callTurn();
    chk();
    let x = 60, y = 440, vy = 0, burn = false, last = performance.now(), bumpAt = 0, landSaid = false, done = false;
    const FIELD = 800, GROUND = 500;
    btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); burn = true; ball.classList.add('burn'); sfx('whoosh'); });
    const off = () => { burn = false; ball.classList.remove('burn'); };
    window.addEventListener('pointerup', off);
    window.addEventListener('pointercancel', off);
    setHint(() => btn);
    btn.classList.add('glowy-2d');
    await R.race(new Promise((resolve) => {
      const step = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        vy += (burn ? -260 : 130) * dt;
        vy = Math.max(-150, Math.min(110, vy));
        y = Math.max(40, Math.min(GROUND, y + vy * dt));
        if (y >= GROUND) vy = 0;
        // 往前飄：前面的雲擋住就停
        const nx = x + (y >= GROUND && x < 120 ? 0 : 70) * dt;
        const g = gates.find((q) => nx + 50 > q.x - 60 && x + 50 <= q.x + 60 && (y - 50 < q.y - gapH / 2 || y + 50 > q.y + gapH / 2));
        if (g && x + 50 <= g.x - 60 + 4) { if (now - bumpAt > 5000) { bumpAt = now; sfx('boing'); say('piaopiao', 'hd_bl_bump'); } ball.classList.add('stuck'); }
        else { ball.classList.remove('stuck'); if (y < GROUND || x < 120) x = Math.min(FIELD, nx); }
        if (y < GROUND - 20 && x < 120) btn.classList.remove('glowy-2d');
        if (x >= FIELD - 80 && !landSaid) { landSaid = true; say('piaopiao', 'hd_bl_land'); }
        if (x >= FIELD - 80 && y >= GROUND && !done) { done = true; resolve(); return; }
        ball.style.transform = `translate(${x}px, ${y - 120}px)`;
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }));
    cancelAnimationFrame(raf); raf = 0;
    window.removeEventListener('pointerup', off);
    window.removeEventListener('pointercancel', off);
    chk();
    sfx('fanfare');
    R.burstAt(ball, { n: 24, stars: true });
    await say('piaopiao', 'hd_bl_done');
    await wait(300);
  } finally { if (raf) cancelAnimationFrame(raf); setHint(null); P.close(); }
}

// ---- 賞鯨：海豚跳出來的時候點一下（數一數）；最後大鯨魚噴水 ----
async function whaleGame(R) {
  const { say, chk } = R;
  const P = R.panel('whalepanel', { host: 'piaopiao', hostSvg: PP() });
  const el = P.el;
  const goal = hardSolo(R) ? 8 : 5;
  const stay = easyNow(R) ? 1700 : 1200;
  let alive = true;
  try {
    el.innerHTML = `<div class="wh-sky"></div><div class="wh-sea"></div><div class="wh-boat"></div><div class="wh-count"></div><div class="wh-pod"></div>`;
    el.querySelector('.wh-boat').innerHTML = `<svg viewBox="0 0 200 80"><path d="M10 30 H190 L170 70 H30Z" fill="#fff"/><path d="M10 30 H190" stroke="#3ea8e0" stroke-width="6"/><rect x="60" y="6" width="80" height="24" rx="6" fill="#e9f3ff"/><rect x="68" y="12" width="64" height="10" fill="#3ea8e0"/></svg>`;
    const pod = el.querySelector('.wh-pod'), count = el.querySelector('.wh-count');
    await say('piaopiao', 'hd_wh_go');
    chk();
    await callTurn();
    chk();
    let n = 0;
    const spots = [[120, 250], [300, 200], [480, 260], [660, 210], [800, 270], [220, 330], [600, 340]];
    await R.race(new Promise((resolve) => {
      const jump = async () => {
        if (!alive || n >= goal) return;
        const [x, y] = pick(spots);
        const d = document.createElement('button');
        d.className = 'wh-dol';
        d.style.left = `${x - 60}px`; d.style.top = `${y - 40}px`;
        d.innerHTML = HD.dolphin;
        pod.appendChild(d);
        sfx('splash');
        setHint(() => d);
        d.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          if (d.classList.contains('got')) return;
          d.classList.add('got');
          n++;
          count.innerHTML = numSvg(n, { color: '#3a3550' });
          count.classList.remove('pop'); void count.offsetWidth; count.classList.add('pop');
          playNote(['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6'][n - 1], 'musicbox', 0.28);
          R.burstAt(d, { n: 10, stars: true, colors: ['#bfe9ff', '#fff', '#ffd23f'] });
          if (n >= goal) resolve();
        });
        setTimeout(() => d.remove(), stay + 300);
        setTimeout(jump, stay + 500 + Math.random() * 600);
      };
      jump();
    }));
    chk();
    await wait(600);
    // 大鯨魚噴水
    const whale = document.createElement('button');
    whale.className = 'wh-big';
    whale.innerHTML = HD.whale;
    pod.appendChild(whale);
    sfx('water');
    setHint(() => whale);
    await say('piaopiao', 'hd_wh_look');
    chk();
    await tapRound(R, pod, { right: (b) => b === whale });
    whale.classList.add('spout');
    sfx('splash');
    R.burstAt(whale, { n: 24, colors: ['#bfe9ff', '#fff'] });
    await say('piaopiao', 'hd_wh_whale');
    chk();
    sfx('fanfare');
    await say('piaopiao', 'hd_wh_done');
    await wait(300);
  } finally { alive = false; setHint(null); P.close(); }
}
