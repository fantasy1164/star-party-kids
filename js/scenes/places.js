// 小鎮的新地點：超市（多多）、公園（啾啾）、醫院（謝醫生＋護理師抱抱）、農場（達達）。每個地點三個短關卡。
// 大部分用 kit.js 的三種玩法（分類、尋找、照步驟）組合；付錢、溜滑梯排隊、身體部位是各自的特別玩法。
import { runRoom } from './room-base.js';
import { sortGame, findGame, stepsGame } from './kit.js';
import { createDiorama } from '../engine/diorama.js';
import { div, wait, burst, stageRect, toStage, shuffle, pick } from '../core/dom.js';
import { sfx } from '../core/audio.js';
import { turnsOn, callTurn, nextTurn, whoseTurn, levelNow } from '../core/turns.js';
import { setHint } from '../core/session.js';
import { KIDS } from '../config.js';
import { shanSvg, kidSvg, starPolygon } from '../art/stars.js';
import { guaSvg, dongSvg, bibiSvg, personSvg } from '../art/more.js';
import { duoduoSvg, jiujiuSvg, baobaoSvg, dadaSvg, itemSvg } from '../art/town.js';
import { shaoSvg, VEHICLES, signSvg, DINOS, boneSvg, skullSvg, ANIMALS } from '../art/fun.js';
import { xieSvg } from '../art/doctor.js';

const hardSolo = (R) => R.members.includes('yy') && !turnsOn();
const tree = (s = 1) => `<svg viewBox="0 0 80 110"><rect x="34" y="70" width="12" height="38" rx="5" fill="#a9744f"/><circle cx="40" cy="48" r="34" fill="#4fbf6e"/><circle cx="28" cy="36" r="10" fill="#8fe39a" opacity=".7"/></svg>`;
const outdoor = (w, d, extra = {}) => createDiorama({ w, d, walls: false, zoom: 0.92, cy: 0.6, base: '#8fbf6a', rim: 24, skirt: '#a6d987', horizon: 'town',
  floorCss: 'background: radial-gradient(circle at 40% 35%, #c4ee9f 0, #a3dc84 70%, #95d277 100%)', ...extra });
const lineOf = (prefix) => (ph) => `${prefix}_hello_${ph === 'night' ? 'evening' : ph === 'morning' ? 'morning' : 'day'}`;

// ============================== 超市（多多） ==============================
export function mountMarket(root, app) {
  return runRoom(root, app, {
    id: 'market', host: 'duoduo', back: 'town',
    build() {
      const dio = createDiorama({ w: 640, d: 600, wallH: 280, zoom: 0.98, cy: 0.6, wall: '#e6f2ff', base: '#9aa9c0',
        floorCss: 'background: repeating-conic-gradient(#f2f6fb 0 25%, #e3ebf5 0 50%) 0 0/64px 64px' });
      // 兩排貨架（面向南），冰箱靠西牆，收銀台在東南
      const shelf = (y) => dio.addBox({ x: 130, y, w: 300, d: 50, h: 150, color: '#ffd9a8',
        faces: { s: `<svg viewBox="0 0 300 150" width="100%" height="100%" preserveAspectRatio="none"><rect y="48" width="300" height="8" fill="#e0a873"/><rect y="98" width="300" height="8" fill="#e0a873"/></svg>` } });
      shelf(120); shelf(320);
      dio.addBox({ x: 0, y: 140, w: 70, d: 260, h: 220, color: '#dff4ff',
        faces: { e: `<svg viewBox="0 0 260 220" width="100%" height="100%" preserveAspectRatio="none"><rect x="10" y="10" width="115" height="200" rx="6" fill="#bfe6ff" opacity=".8"/><rect x="135" y="10" width="115" height="200" rx="6" fill="#bfe6ff" opacity=".8"/></svg>` } });
      dio.addBox({ x: 470, y: 440, w: 140, d: 80, h: 72, color: '#a98bff' });
      dio.addSprite({ x: 580, y: 470, z: 72, w: 60, h: 60, shadow: 0, html: `<svg viewBox="0 0 60 60"><rect x="6" y="20" width="48" height="34" rx="6" fill="#4a3b6b"/><rect x="12" y="6" width="36" height="18" rx="4" fill="#7ff0c0"/></svg>` });
      const duoduo = dio.addSprite({ x: 515, y: 470, z: 72, w: 100, h: 100, html: duoduoSvg(), shadow: 0.5, tap: 'duoduo' });
      // 裝飾：貨架上的東西
      const deco = ['cookie', 'yogurt', 'candy']; // 不放清單上的東西，免得找錯
      [[160, 172, 50], [220, 172, 100], [300, 172, 50], [380, 172, 100], [170, 372, 100], [250, 372, 50], [400, 372, 50]].forEach(([x, y, z], i) =>
        dio.addSprite({ x, y, z, w: 46, h: 46, shadow: 0, html: itemSvg(deco[i % deco.length]) }));
      dio.wallArt('n', { along: 470, up: 160, w: 140, h: 80, html: `<svg viewBox="0 0 140 80"><rect width="140" height="80" rx="12" fill="#3ea8e0"/><g transform="translate(40 8) scale(.64)">${strip(itemSvg('cart'))}</g></svg>` });
      const shan = dio.addSprite({ x: 520, y: 260, w: 110, h: 126, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { duoduo, shan } };
    },
    music: () => 'market',
    lines: { hello: lineOf('mk'), pick: 'mk_pick', next: 'mk_next', allDone: [['duoduo', 'mk_all_done'], ['shan', 'mk_all_done']] },
    games: [
      { id: 'list', icon: itemSvg('list'), marker: { x: 280, y: 250, z: 210 }, run: (R) => {
        const all = [
          { id: 'apple', x: 200, y: 375, z: 0, hidden: false },
          { id: 'milk', x: 90, y: 470, z: 0, hidden: false },
          { id: 'bread', x: 360, y: 300, z: 0, hidden: true },
          { id: 'cereal', x: 250, y: 98, z: 0, hidden: true },
        ];
        const items = (hardSolo(R) ? all : all.slice(0, 3)).map((it) => ({ ...it, w: 62, h: 62, html: itemSvg(it.id) }));
        return findGame(R, { host: 'duoduo', intro: 'mk_list_go', items, list: true, found: (id) => `mk_got_${id}`, hiddenLine: 'mk_list_hidden', done: 'mk_list_done' });
      } },
      { id: 'pay', icon: itemSvg('coin10'), marker: { x: 540, y: 480, z: 220 }, run: payGame },
      { id: 'bag', icon: itemSvg('bagCold'), marker: { x: 35, y: 270, z: 300 }, run: (R) => {
        const cold = ['icecream', 'milk', 'meat', 'yogurt'], normal = ['bread', 'cookie', 'apple', 'cereal'];
        const n = hardSolo(R) ? 4 : 3;
        const items = [...cold.slice(0, n).map((k) => ({ k, bin: 'cold', html: itemSvg(k) })), ...normal.slice(0, n).map((k) => ({ k, bin: 'normal', html: itemSvg(k) }))];
        return sortGame(R, { host: 'duoduo', hostSvg: duoduoSvg(), intro: 'mk_bag_go',
          bins: [{ id: 'cold', html: itemSvg('bagCold') }, { id: 'normal', html: itemSvg('bagNormal') }],
          items, wrong: (it) => (it.bin === 'cold' ? 'mk_bag_is_cold' : 'mk_bag_is_normal'), done: 'mk_bag_done' });
      } },
    ],
    playful(name, R) { if (name === 'duoduo') { sfx('ding'); R.hop(R.set.chars.duoduo.el); return true; } return false; },
  });
}
const strip = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

// 付錢：價錢牌上的錢，用硬幣付剛好。多付了點托盤上的硬幣拿回來。
async function payGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('paypanel', { host: 'duoduo', hostSvg: duoduoSvg() });
  const el = P.el;
  const hard = hardSolo(R);
  try {
    const coins = hard ? [50, 10, 5, 1] : [10, 5, 1];
    el.innerHTML = `<div class="price"></div><div class="paytray"><div class="paycoins"></div><div class="paysum">0</div></div>
      <div class="coinbank">${coins.map((v) => `<div class="coin" data-v="${v}">${itemSvg(`coin${v}`)}</div>`).join('')}</div>`;
    const priceEl = el.querySelector('.price');
    const trayCoins = el.querySelector('.paycoins');
    const sumEl = el.querySelector('.paysum');
    const tray = el.querySelector('.paytray');
    await say('duoduo', 'mk_pay_go');
    chk();
    const rounds = 3;
    for (let r = 0; r < rounds; r++) {
      if (turnsOn()) { await callTurn(); chk(); }
      const lvl = turnsOn() ? levelNow(R.profile) : hard ? 'hard' : 'easy';
      const price = lvl === 'hard' ? pick([17, 23, 28, 35, 42, 56, 63, 75]) : pick([3, 6, 7, 8, 12, 15]);
      const item = pick(['apple', 'bread', 'milk', 'cookie', 'icecream', 'cereal']);
      priceEl.innerHTML = `<div class="ptag-item">${itemSvg(item)}</div><div class="ptag">${price}<small>元</small></div>`;
      let sum = 0;
      trayCoins.innerHTML = '';
      sumEl.textContent = '0';
      setHint(() => el.querySelector('.coin'));
      await say('duoduo', 'mk_pay_price');
      chk();
      await race(new Promise((resolve) => {
        let lastOver = 0;
        const update = () => {
          sumEl.textContent = sum;
          sumEl.classList.toggle('over', sum > price);
          if (sum === price) { finish(); }
          else if (sum > price && Date.now() - lastOver > 2500) { lastOver = Date.now(); sfx('soft'); say('duoduo', 'mk_pay_over'); }
        };
        const finish = () => { el.removeEventListener('pointerdown', onDown); resolve(); };
        const onDown = (e) => {
          const c = e.target.closest('.coinbank .coin');
          const t = e.target.closest('.paycoins .coin');
          if (t) { sum -= +t.dataset.v; t.remove(); sfx('tick'); update(); return; }
          if (!c) return;
          const v = +c.dataset.v;
          R.drag(e, {
            html: itemSvg(`coin${v}`), size: 100, originEl: c,
            onDrop: (cx, cy) => {
              const p = toStage(cx, cy), tr = stageRect(tray);
              if (Math.abs(p.x - tr.x) > tr.w / 2 + 40 || Math.abs(p.y - tr.y) > tr.h / 2 + 40) return null;
              return { x: tr.x, y: tr.y };
            },
            onPlaced: () => {
              const cc = div('coin', itemSvg(`coin${v}`));
              cc.dataset.v = v;
              trayCoins.appendChild(cc);
              sum += v;
              sfx('ding');
              update();
            },
          });
        };
        el.addEventListener('pointerdown', onDown);
      }));
      chk();
      setHint(null);
      sfx('fanfare');
      R.burstAt(tray, { n: 20, stars: true, colors: ['#ffd23f', '#fff3a0'] });
      await say('duoduo', r === rounds - 1 ? 'mk_pay_done' : 'mk_pay_good');
      chk();
      if (turnsOn() && r < rounds - 1) nextTurn({ say: false });
    }
  } finally {
    P.close();
  }
}

// ============================== 公園（啾啾） ==============================
export function mountPark(root, app) {
  return runRoom(root, app, {
    id: 'park', host: 'jiujiu', back: 'town',
    build() {
      const dio = outdoor(700, 600);
      dio.addDecal({ x: 70, y: 380, w: 220, h: 150, z: 0.6, css: 'border-radius:50%;background:radial-gradient(circle,#bfe9ff 0 50%,#8fd3ff 51% 100%)' });
      dio.addDecal({ x: 300, y: 0, w: 90, h: 600, z: 0.5, css: 'background:#f2e2c4;border-radius:20px' });
      // 樹（看板；後面可以躲東西）
      const trees = [[120, 120], [560, 110], [620, 420], [200, 300]];
      trees.forEach(([x, y]) => dio.addSprite({ x, y, w: 120, h: 170, html: tree(), shadow: 0.6 }));
      // 溜滑梯
      dio.addBox({ x: 470, y: 230, w: 60, d: 60, h: 120, color: '#ff8a3d' });
      dio.addBox({ x: 470, y: 290, w: 60, d: 110, h: 20, z: 40, color: '#ffd23f', cls: 'soft' });
      // 長椅
      dio.addBox({ x: 120, y: 200, w: 140, d: 40, h: 40, color: '#c98b5e' });
      dio.addBox({ x: 120, y: 196, w: 140, d: 10, h: 80, color: '#a8693f' });
      const jiujiu = dio.addSprite({ x: 190, y: 225, z: 40, w: 90, h: 90, html: jiujiuSvg(), shadow: 0.5, tap: 'jiujiu' });
      // 沙坑（挖恐龍化石）
      dio.addBox({ x: 560, y: 250, w: 120, d: 100, h: 14, color: '#c9a86b' });
      dio.addDecal({ x: 566, y: 256, w: 108, h: 88, z: 14.5, css: 'background:radial-gradient(circle at 40% 40%,#f2dca6,#e6c98a);border-radius:8px' });
      // 垃圾桶
      [['binTrash', 600, 520], ['binRecycle', 650, 520], ['binFood', 550, 520]].forEach(([k, x, y]) => dio.addSprite({ x, y, w: 52, h: 60, shadow: 0.4, html: itemSvg(k) }));
      // 花
      [[400, 450], [430, 480], [380, 500], [250, 90]].forEach(([x, y], i) => dio.addSprite({ x, y, w: 36, h: 40, shadow: 0, html: `<svg viewBox="0 0 36 40"><rect x="16" y="18" width="4" height="22" fill="#4fbf6e"/><polygon points="${starPolygon(18, 14, 12, 6)}" fill="${['#ff8fbf', '#ffd23f', '#a98bff', '#ff8a3d'][i]}"/><circle cx="18" cy="14" r="4" fill="#fff"/></svg>` }));
      const shan = dio.addSprite({ x: 360, y: 300, w: 110, h: 126, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { jiujiu, shan } };
    },
    music: () => 'park',
    lines: { hello: lineOf('pk'), pick: 'pk_pick', next: 'pk_next', allDone: [['jiujiu', 'pk_all_done'], ['shan', 'pk_all_done']] },
    games: [
      { id: 'trash', icon: itemSvg('binRecycle'), marker: { x: 600, y: 520, z: 150 }, run: (R) => {
        const all = [['bottle', 'recycle'], ['can', 'recycle'], ['paperbox', 'recycle'], ['peel', 'food'], ['core', 'food'], ['tissue', 'trash'], ['wrapper', 'trash']];
        const use = hardSolo(R) ? all : [all[0], all[1], all[3], all[4], all[5], all[6]];
        return sortGame(R, { host: 'jiujiu', hostSvg: jiujiuSvg(), intro: 'pk_trash_go',
          bins: [{ id: 'trash', html: itemSvg('binTrash') }, { id: 'recycle', html: itemSvg('binRecycle') }, { id: 'food', html: itemSvg('binFood') }],
          items: use.map(([k, bin]) => ({ k, bin, html: itemSvg(k) })), wrong: (it) => `pk_is_${it.bin}`, done: 'pk_trash_done' });
      } },
      { id: 'animals', icon: itemSvg('butterfly'), marker: { x: 200, y: 330, z: 230 }, run: (R) => {
        const all = [
          { id: 'butterfly', x: 410, y: 440, z: 50, hidden: false },
          { id: 'ladybug', x: 260, y: 235, z: 40, w: 46, h: 46, hidden: false },
          { id: 'frog', x: 150, y: 400, z: 0, hidden: false },
          { id: 'squirrel', x: 540, y: 70, z: 0, hidden: true, seenFrom: [1, 2] },
          { id: 'nest', x: 100, y: 90, z: 90, hidden: true, seenFrom: [1, 2] },
          { id: 'duck', x: 180, y: 455, z: 0, hidden: false },
          { id: 'turtle', x: 270, y: 545, z: 0, hidden: false },
        ];
        const pickIds = hardSolo(R) ? null : ['butterfly', 'ladybug', 'frog', 'squirrel', 'duck'];
        const items = all.filter((it) => !pickIds || pickIds.includes(it.id)).map((it) => ({ w: 64, h: 64, ...it, html: ANIMALS[it.id] || itemSvg(it.id) }));
        return findGame(R, { host: 'jiujiu', intro: 'pk_animals_go', items, found: (id) => `pk_found_${id}`, hiddenLine: 'pk_animals_hidden', done: 'pk_animals_done' });
      } },
      { id: 'queue', icon: itemSvg('slide'), marker: { x: 500, y: 300, z: 230 }, run: queueGame },
      { id: 'dino', icon: DINOS.trex, marker: { x: 620, y: 300, z: 200 }, run: dinoGame },
    ],
    playful(name, R) { if (name === 'jiujiu') { sfx('giggle'); R.hop(R.set.chars.jiujiu.el); return true; } return false; },
  });
}

// 溜滑梯排隊：滑梯空了（綠燈），才點排在最前面的人。點中間的人、或滑梯上還有人時點，啾啾會提醒。
async function queueGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('queuepanel', { host: 'jiujiu', hostSvg: jiujiuSvg() });
  const el = P.el;
  try {
    const cast = [['shan', shanSvg()], ['gua', guaSvg()], ['dong', dongSvg()], ['bibi', bibiSvg()]];
    el.innerHTML = `<div class="slide-art">${itemSvg('slide')}</div><div class="slide-light green"></div><div class="queue"></div>`;
    const q = el.querySelector('.queue');
    const light = el.querySelector('.slide-light');
    const line = cast.map(([id, svg]) => { const d = div('qkid', svg); d.dataset.id = id; q.appendChild(d); return d; });
    let busy = false;
    await say('jiujiu', 'pk_queue_go');
    chk();
    await callTurn();
    chk();
    let lastV = 0;
    const voice = (id) => { if (Date.now() - lastV > 2500) { lastV = Date.now(); say('jiujiu', id); } };
    while (line.length) {
      setHint(() => (busy ? null : line[0]));
      const who = await race(new Promise((resolve) => {
        const dn = (e) => {
          const k = e.target.closest('.qkid');
          if (!k || k.classList.contains('going')) return;
          if (busy) { sfx('soft'); R.hop(light, 'shake'); voice('pk_queue_wait'); return; }
          if (k !== line[0]) { sfx('soft'); R.hop(k, 'shake'); voice('pk_queue_line'); return; }
          el.removeEventListener('pointerdown', dn);
          resolve(k);
        };
        el.addEventListener('pointerdown', dn);
      }));
      chk();
      line.shift();
      busy = true;
      light.className = 'slide-light red';
      who.classList.add('going');
      sfx('boing');
      await wait(700);
      sfx('whoosh');
      who.classList.add('sliding');
      await wait(1500);
      who.remove();
      sfx('giggle');
      R.burstAt(el.querySelector('.slide-art'), { n: 10, spread: 100, stars: true, colors: ['#ffd23f', '#fff3a0'] });
      await wait(400);
      busy = false;
      light.className = 'slide-light green';
      sfx('ding');
      if (line.length && turnsOn()) nextTurn({ say: false });
    }
    setHint(null);
    sfx('fanfare');
    await say('jiujiu', 'pk_queue_done');
  } finally {
    P.close();
  }
}

// ============================== 醫院・小兒科（謝醫生；抱抱是護理小幫手） ==============================
// 11/24：醫院只有一個人類角色謝醫生（小兒科）。五件事：看醫生流程、哪裡不舒服、勇敢打針（深呼吸）、視力檢查、生病時怎麼做。
// 岳岳：打針前的深呼吸（按住按鈕吸氣、放開吐氣），練習讓自己冷靜；愷愷：視力檢查（E 的開口朝哪邊）練觀察和方向。
const giraffeSvg = () => `<svg viewBox="0 0 120 300"><rect x="70" y="10" width="40" height="286" rx="10" fill="#fff"/>${[...Array(13)].map((_, i) => `<path d="M70 ${24 + i * 21} H${i % 2 ? 84 : 94}" stroke="#ff8a3d" stroke-width="4"/>`).join('')}
  <path d="M30 296 V120 C30 90 40 70 50 50" stroke="#ffc94a" stroke-width="22" stroke-linecap="round" fill="none"/>
  <ellipse cx="54" cy="40" rx="20" ry="14" fill="#ffc94a"/><path d="M46 28 V16 M60 28 V16" stroke="#c98b3a" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="38" r="3" fill="#2b2140"/>
  ${[[30, 150], [34, 200], [28, 250], [40, 95]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#c98b3a"/>`).join('')}</svg>`;
const tumbleE = (rot = 0, fill = '#2b2140') => `<svg viewBox="0 0 50 50" width="100%" height="100%"><path d="M0 0 H50 V10 H10 V20 H50 V30 H10 V40 H50 V50 H0Z" fill="${fill}" transform="rotate(${rot} 25 25)"/></svg>`;
const eyeChartSvg = () => `<svg viewBox="0 0 120 170"><rect width="120" height="170" rx="8" fill="#fff"/>${[[60, 26, 30, 0], [40, 66, 18, 90], [80, 66, 18, 180], [30, 98, 12, 270], [60, 98, 12, 0], [90, 98, 12, 90]].map(([x, y, w, r]) => `<g transform="translate(${x - w / 2} ${y - w / 2}) scale(${w / 50})"><path d="M0 0 H50 V10 H10 V20 H50 V30 H10 V40 H50 V50 H0Z" fill="#2b2140" transform="rotate(${r} 25 25)"/></g>`).join('')}
  ${[0, 1, 2, 3, 4, 5].map((i) => `<g transform="translate(${16 + i * 16} 122) scale(.16)"><path d="M0 0 H50 V10 H10 V20 H50 V30 H10 V40 H50 V50 H0Z" fill="#2b2140" transform="rotate(${(i * 90) % 360} 25 25)"/></g>`).join('')}
  <rect x="20" y="150" width="80" height="8" rx="4" fill="#ff8fb8"/></svg>`;

export function mountClinic(root, app) {
  return runRoom(root, app, {
    id: 'clinic', host: 'xie', back: 'town',
    build() {
      const dio = createDiorama({ w: 640, d: 580, wallH: 280, zoom: 0.95, cy: 0.6, wall: '#fff3e2', base: '#b8a99a',
        floorCss: 'background: repeating-conic-gradient(#e8f6ff 0 25%, #fff6e6 0 50%) 0 0/80px 80px' });
      // 看診床（西邊）＋小枕頭
      dio.addBox({ x: 20, y: 60, w: 110, d: 220, h: 60, color: '#ffffff', cls: 'soft' });
      dio.addBox({ x: 20, y: 60, w: 110, d: 60, h: 14, z: 60, color: '#bfe6ff', cls: 'soft' });
      dio.addBox({ x: 24, y: 140, w: 102, d: 130, h: 3, z: 60, color: '#ffd6e6', cls: 'soft' });
      // 謝醫生的桌子＋電腦（北邊）
      dio.addBox({ x: 380, y: 50, w: 180, d: 84, h: 76, color: '#d4955f', top: '#e8b07a' });
      dio.addBox({ x: 440, y: 62, w: 70, d: 10, h: 48, z: 76, color: '#4a3b6b', faces: { s: '<div style="position:absolute;inset:5px;border-radius:4px;background:linear-gradient(#bfe6ff,#e8f6ff)"></div>' } });
      // 牆上：長頸鹿身高尺（西牆）、E 字視力表（北牆）、小熊海報
      dio.wallArt('w', { along: dio.alongWall('w', 0, 400) - 40, up: 10, w: 90, h: 240, html: giraffeSvg() });
      dio.wallArt('n', { along: 210, up: 110, w: 110, h: 156, html: eyeChartSvg() });
      dio.wallArt('n', { along: 600, up: 150, w: 80, h: 80, html: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#c8f5d6"/>${strip(itemSvg('heal'))}</svg>` });
      // 身高體重計（身高尺旁邊）
      dio.addSprite({ x: 70, y: 420, w: 96, h: 96, shadow: 0.4, html: itemSvg('scale') });
      // 候診的玩具角（東南）：小地毯、積木、球
      dio.addDecal({ x: 470, y: 430, w: 150, h: 130, z: 0.6, css: 'border-radius:28px;background:radial-gradient(circle,#ffe27a 0 30%,#ffd0a0 31% 60%,#ffb3c8 61%)' });
      [['#ff5d73', 490, 450], ['#5b8fd8', 524, 452], ['#4cd07d', 506, 470]].forEach(([c, x, y], i) => dio.addBox({ x, y, w: 28, d: 28, h: 28, z: i === 2 ? 28 : 0, color: c, cls: 'soft' }));
      dio.addSprite({ x: 590, y: 520, w: 44, h: 44, shadow: 0.4, html: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#ff8a3d"/><path d="M4 16 C14 22 26 22 36 16 M20 2 C14 14 14 26 20 38" stroke="#fff" stroke-width="3" fill="none"/></svg>' });
      dio.addSprite({ x: 610, y: 240, w: 70, h: 100, shadow: 0.5, html: itemSvg('plant') });
      const xie = dio.addSprite({ x: 400, y: 260, w: 140, h: 184, html: xieSvg(), shadow: 0.6, tap: 'xie' });
      const baobao = dio.addSprite({ x: 180, y: 400, w: 104, h: 125, html: baobaoSvg(), shadow: 0.6, tap: 'baobao' });
      const shan = dio.addSprite({ x: 320, y: 490, w: 104, h: 120, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { xie, baobao, shan } };
    },
    music: () => 'clinic',
    lines: { hello: lineOf('cl'), pick: 'cl_pick', next: 'cl_next', allDone: [['xie', 'cl_all_done'], ['baobao', 'cl_all_done'], ['shan', 'cl_all_done']] },
    games: [
      { id: 'checkup', icon: itemSvg('stetho'), marker: { x: 470, y: 80, z: 230 }, run: checkupGame },
      { id: 'ouch', icon: itemSvg('ouch'), marker: { x: 75, y: 170, z: 200 }, run: ouchGame },
      { id: 'shot', icon: itemSvg('bandaid'), marker: { x: 290, y: 400, z: 170 }, run: shotGame },
      { id: 'eye', icon: itemSvg('eyechart'), marker: { x: 230, y: 40, z: 250 }, run: eyeGame },
      { id: 'heal', icon: itemSvg('heal'), marker: { x: 610, y: 160, z: 210 }, run: async (R) => {
        const all = [['water', 'good'], ['sleep', 'good'], ['medicine', 'good'], ['veggie', 'good'], ['icedrink', 'bad'], ['icecream', 'bad'], ['candy', 'bad'], ['phone', 'bad']];
        const use = hardSolo(R) ? all : all.filter(([k]) => !['veggie', 'icecream'].includes(k));
        await sortGame(R, { host: 'xie', hostSvg: xieSvg(), intro: 'cl_heal_go',
          bins: [{ id: 'good', html: itemSvg('good') }, { id: 'bad', html: itemSvg('bad') }],
          items: use.map(([k, bin]) => ({ k, bin, html: itemSvg(k) })), wrong: (it) => `cl_heal_${it.k}`, done: 'cl_heal_done',
          placedLine: (it) => (it.k === 'medicine' ? 'cl_heal_medicine' : null) });
        await R.say('xie', 'cl_motto');   // 謝醫生的口頭禪
      } },
    ],
    playful(name, R) {
      if (name === 'xie') { R.hop(R.set.chars.xie.el); R.say('xie', 'cl_motto'); return true; }
      if (name === 'baobao') { sfx('squish'); R.hop(R.set.chars.baobao.el); R.say('baobao', 'cl_tap_baobao'); return true; }
      return false;
    },
  });
}

// ---- 看醫生流程：掛號 → 量身高體重 → 耳溫 → 聽診 → 看喉嚨 → 貼紙 ----
// 病人是輪到的小孩（面板左邊）；工具出現的位置是 kidSvg 放大 1.625 倍後的身體位置。
function checkupGame(R) {
  const id = whoseTurn() || R.members[0];
  const T = (t, x, y) => ({ id: t, html: itemSvg(t), x, y, w: 120, h: 120 });
  return stepsGame(R, { host: 'xie', hostSvg: xieSvg(), intro: 'cl_check_go', wrong: 'cl_check_wrong', done: 'cl_check_done', cls: 'checkpanel',
    scene: `<div class="patient">${kidSvg(id, ['shirt', 'pants'])}</div>`,
    targets: [T('card', 600, 120), T('scale', 750, 120), T('earthermo', 600, 280), T('stetho', 750, 280), T('light', 600, 440), T('sticker', 750, 440)],
    steps: [
      { t: 'card', icon: itemSvg('card'), line: 'cl_check_card' },
      { t: 'scale', icon: itemSvg('scale'), line: 'cl_check_scale', who: 'baobao' },
      { t: 'earthermo', icon: itemSvg('earthermo'), line: 'cl_check_ear' },
      { t: 'stetho', icon: itemSvg('stetho'), line: 'cl_check_stetho' },
      { t: 'light', icon: itemSvg('light'), line: 'cl_check_mouth' },
      { t: 'sticker', icon: itemSvg('sticker'), line: 'cl_check_sticker' },
    ],
    fx: async (i, t, pnl) => {
      const pt = pnl.querySelector('.patient');
      const kid = pt.querySelector('svg.kid');
      const k = t.dataset.w;
      const pos = { card: 'left:350px;top:380px', scale: 'left:245px;top:520px', earthermo: 'left:120px;top:150px', stetho: 'left:250px;top:290px', light: 'left:250px;top:130px', sticker: 'left:250px;top:280px' }[k];
      const tool = div('tool-on', t.innerHTML);
      tool.style.cssText = pos;
      pnl.appendChild(tool);
      if (k === 'card') { sfx('click'); sfx('ding'); }
      if (k === 'scale') {
        // 身高尺從腳長到頭頂，頭頂一顆星星
        const bar = div('hbar', `<i>${itemSvg('sticker')}</i>`);
        pnl.appendChild(bar);
        R.hop(pt, 'hop');
        sfx('boing');
        await wait(400);
        sfx('star');
        await wait(900);
        bar.remove();
      }
      if (k === 'earthermo') { sfx('beep'); await wait(350); sfx('beep'); }
      if (k === 'stetho') { sfx('knock'); await wait(260); sfx('knock'); await wait(500); sfx('knock'); await wait(260); sfx('knock'); }
      if (k === 'light') { kid?.classList.add('talking'); sfx('click'); }
      if (k === 'sticker') sfx('star');
      await wait(k === 'stetho' ? 300 : 900);
      kid?.classList.remove('talking');
      if (k !== 'sticker') tool.remove();
    },
  });
}

// ---- 哪裡不舒服？謝醫生說症狀，點身上那個地方（不舒服要說出來，大人才能幫你） ----
// 位置是 kidSvg（160×300）裡的座標。
const PARTS = {
  head: [[80, 45, 34]], belly: [[80, 170, 28]], hand: [[32, 200, 18], [128, 200, 18]], foot: [[64, 282, 18], [96, 282, 18]],
  ear: [[31, 78, 14], [129, 78, 14]], knee: [[66, 238, 14], [94, 238, 14]], shoulder: [[52, 126, 16], [108, 126, 16]], elbow: [[30, 165, 14], [130, 165, 14]],
  nose: [[80, 92, 9]], eye: [[64, 80, 10], [96, 80, 10]], throat: [[80, 106, 10], [80, 126, 12]],
};
async function ouchGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('bodypanel', { host: 'xie', hostSvg: xieSvg() });
  const el = P.el;
  try {
    await say('xie', 'cl_ouch_go');
    chk();
    const rounds = 6;
    const easy = shuffle(['belly', 'head', 'ear', 'nose', 'knee', 'hand']);
    const hard = shuffle(['throat', 'nose', 'eye', 'elbow', 'foot', 'ear']);
    for (let r = 0; r < rounds; r++) {
      if (turnsOn()) { await callTurn(); chk(); }
      const id = whoseTurn() || R.members[0];
      const part = (levelNow(R.profile) === 'hard' ? hard : easy)[r];
      el.innerHTML = `<div class="bodykid">${kidSvg(id, ['shirt', 'pants'])}</div>`;
      const fig = el.querySelector('.bodykid');
      setHint(() => null);
      await say('xie', `cl_ouch_${part}`);
      chk();
      let lastV = 0;
      await race(new Promise((resolve) => {
        const dn = (e) => {
          const svg = fig.querySelector('svg');
          const rr = svg.getBoundingClientRect();
          const x = ((e.clientX - rr.left) / rr.width) * 160, y = ((e.clientY - rr.top) / rr.height) * 300;
          if (x < -20 || x > 180 || y < -20 || y > 320) return;
          const hit = Object.entries(PARTS).map(([k, cs]) => [k, Math.min(...cs.map(([cx, cy, cr]) => Math.hypot(x - cx, y - cy) / cr))]).sort((a, b) => a[1] - b[1])[0];
          if (hit[0] === part && hit[1] < 1.6) {
            el.removeEventListener('pointerdown', dn);
            const dot = div('touch-dot ouch');
            const p = toStage(e.clientX, e.clientY), q = stageRect(el);
            dot.style.left = `${p.x - q.left}px`;
            dot.style.top = `${p.y - q.top}px`;
            el.appendChild(dot);
            resolve();
          } else {
            sfx('soft');
            if (Date.now() - lastV > 2500 && hit[1] < 1.6) { lastV = Date.now(); say('xie', `cl_is_${hit[0]}`); }
          }
        };
        el.addEventListener('pointerdown', dn);
      }));
      chk();
      sfx('sparkle');
      R.burstAt(fig, { n: 12, stars: true, colors: ['#ffd23f', '#fff3a0'] });
      // 第一題說「說出來，大人就能幫你」；鼻子過敏接謝醫生的口頭禪；眼睛癢提醒不要揉
      if (part === 'nose') await say('xie', 'cl_motto');
      else if (part === 'eye') await say('xie', 'cl_ouch_eye_ok');
      else if (r === 0) await say('xie', 'cl_ouch_tell');
      else await wait(700);
      chk();
      if (turnsOn() && r < rounds - 1) nextTurn({ say: false });
    }
    sfx('fanfare');
    await say('xie', 'cl_ouch_done');
  } finally {
    P.close();
  }
}

// ---- 勇敢打針：先深呼吸三次（按住吸氣、氣球變大；放開吐氣、氣球變小），酒精棉、數一二三，貼 OK 繃 ----
async function shotGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('shotpanel', { host: 'xie', hostSvg: xieSvg() });
  const el = P.el;
  try {
    const id = whoseTurn() || R.members[0];
    el.innerHTML = `<div class="patient">${kidSvg(id, ['shirt', 'pants'])}</div>
      <div class="breath-balloon">${itemSvg('balloon')}</div>
      <div class="breath-dots">${'<i></i>'.repeat(3)}</div>
      <button class="breath-btn"><span class="ring"></span>${itemSvg('balloon')}</button>`;
    const balloon = el.querySelector('.breath-balloon');
    const btn = el.querySelector('.breath-btn');
    const dots = [...el.querySelectorAll('.breath-dots i')];
    await say('xie', 'cl_shot_go');
    chk();
    let saidIn = false, saidOut = false, lastSlow = 0;
    for (let b = 0; b < 3; b++) {
      if (turnsOn()) { await callTurn(); chk(); }
      btn.classList.add('glowy-2d');
      setHint(() => btn);
      if (!saidIn) { saidIn = true; say('xie', 'cl_shot_in'); }
      // 按住至少 2 秒才算一次吸氣
      await race(new Promise((resolve) => {
        let t0 = 0, timer = null;
        const down = (e) => {
          e.preventDefault();
          try { btn.setPointerCapture(e.pointerId); } catch (_) { /* 沒關係 */ }
          t0 = Date.now();
          btn.classList.add('hold');
          balloon.classList.remove('out');
          balloon.classList.add('in');
          sfx('breathIn');
          timer = setTimeout(() => { btn.classList.add('full'); sfx('ding'); }, 2000);
        };
        const up = () => {
          if (!t0) return;
          clearTimeout(timer);
          btn.classList.remove('hold', 'full');
          const held = Date.now() - t0;
          t0 = 0;
          balloon.classList.remove('in');
          balloon.classList.add('out');
          if (held >= 2000) {
            btn.removeEventListener('pointerdown', down);
            btn.removeEventListener('pointerup', up);
            btn.removeEventListener('pointercancel', up);
            resolve();
          } else if (Date.now() - lastSlow > 3000) { lastSlow = Date.now(); say('xie', 'cl_shot_slow'); }
        };
        btn.addEventListener('pointerdown', down);
        btn.addEventListener('pointerup', up);
        btn.addEventListener('pointercancel', up);
      }));
      chk();
      btn.classList.remove('glowy-2d');
      sfx('breathOut');
      if (!saidOut) { saidOut = true; await say('xie', 'cl_shot_out'); } else await wait(2000);
      chk();
      dots[b].classList.add('on');
      sfx('sparkle');
      if (turnsOn() && b < 2) nextTurn({ say: false });
    }
    btn.remove();
    balloon.classList.remove('out');
    balloon.classList.add('calm');
    // 酒精棉：點一下擦手臂
    const cotton = div('wtap cotton glowy-2d', itemSvg('cotton'));
    cotton.style.cssText = 'left:640px;top:420px;width:120px;height:120px';
    el.appendChild(cotton);
    setHint(() => cotton);
    say('baobao', 'cl_shot_cotton');
    await race(new Promise((resolve) => cotton.addEventListener('pointerdown', resolve, { once: true })));
    chk();
    setHint(null);
    cotton.classList.remove('glowy-2d');
    cotton.classList.add('wipe');
    sfx('scrub');
    await wait(300);
    sfx('scrub');
    await wait(500);
    cotton.remove();
    const shot = div('tool-on', itemSvg('shot'));
    shot.style.cssText = 'left:150px;top:250px';
    el.appendChild(shot);
    await say('xie', 'cl_shot_count');
    chk();
    sfx('pop');
    shot.remove();
    const aid = div('tool-on', itemSvg('bandaid'));
    aid.style.cssText = 'left:160px;top:270px;width:80px;height:80px';
    el.appendChild(aid);
    sfx('fanfare');
    R.burstAt(aid, { n: 18, stars: true, colors: ['#ffd23f', '#fff3a0', '#ff8fb8'] });
    await say('xie', 'cl_shot_done');
    chk();
    const bao = div('shot-bao', baobaoSvg());
    el.appendChild(bao);
    sfx('squish');
    await say('baobao', 'cl_shot_hug');
    await wait(300);
  } finally {
    setHint(null);
    P.close();
  }
}

// ---- 視力檢查：E 的開口朝哪邊，就往那邊滑（或點那邊的箭頭）。E 會越來越小 ----
const DIRS = { right: 0, down: 90, left: 180, up: 270 };
async function eyeGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('eyepanel', { host: 'xie', hostSvg: xieSvg() });
  const el = P.el;
  try {
    el.innerHTML = `<div class="eye-card"><div class="eye-e"></div></div>
      ${Object.keys(DIRS).map((d) => `<button class="eye-pad ${d}" data-d="${d}"><span style="transform:rotate(${DIRS[d]}deg)">${itemSvg('arrow')}</span></button>`).join('')}`;
    const card = el.querySelector('.eye-card');
    const E = el.querySelector('.eye-e');
    const pads = Object.fromEntries([...el.querySelectorAll('.eye-pad')].map((b) => [b.dataset.d, b]));
    await say('xie', 'cl_eye_go');
    chk();
    const hardNow = () => levelNow(R.profile) === 'hard';
    const rounds = hardSolo(R) ? 7 : 6;
    let prev = null, saidSmall = false;
    for (let r = 0; r < rounds; r++) {
      if (turnsOn()) { await callTurn(); chk(); }
      const dir = pick(Object.keys(DIRS).filter((d) => d !== prev));
      prev = dir;
      const min = hardNow() ? 0.14 : 0.3;
      const sz = 1 - (1 - min) * (r / (rounds - 1));
      E.style.width = E.style.height = `${Math.round(220 * sz)}px`;
      E.innerHTML = tumbleE(DIRS[dir]);
      R.hop(card, 'hop');
      sfx('whoosh');
      if (!saidSmall && sz < 0.55) { saidSmall = true; await say('xie', 'cl_eye_small'); chk(); }
      setHint(() => null);
      let wrongs = 0, lastV = 0;
      await race(new Promise((resolve) => {
        let sx = 0, sy = 0, st = 0;
        const answer = (d) => {
          if (d === dir) { cleanup(); resolve(); return; }
          wrongs++;
          sfx('soft');
          R.hop(card, 'shake');
          if (Date.now() - lastV > 2500) { lastV = Date.now(); say('xie', 'cl_eye_wrong'); }
          // 愷愷錯一次、岳岳錯兩次：對的箭頭發亮
          if (wrongs >= (hardNow() ? 2 : 1)) { pads[dir].classList.add('glowy-2d'); setHint(() => pads[dir]); }
        };
        const down = (e) => { sx = e.clientX; sy = e.clientY; st = 1; };
        const up = (e) => {
          if (!st) return;
          st = 0;
          const a = toStage(sx, sy), b = toStage(e.clientX, e.clientY);
          const dx = b.x - a.x, dy = b.y - a.y;
          if (Math.hypot(dx, dy) > 60) { answer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); return; }
          const pad = e.target.closest('.eye-pad');
          if (pad) answer(pad.dataset.d);
        };
        const cleanup = () => { el.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); };
        el.addEventListener('pointerdown', down);
        window.addEventListener('pointerup', up);
      }));
      chk();
      Object.values(pads).forEach((b) => b.classList.remove('glowy-2d'));
      R.hop(pads[dir], 'hop');
      sfx('sparkle');
      R.burstAt(card, { n: 12, stars: true, colors: ['#ffd23f', '#fff3a0', '#4cd07d'] });
      if (r === 0 || r === rounds - 2) await say('xie', 'cl_eye_ok');
      else await wait(600);
      chk();
      if (turnsOn() && r < rounds - 1) nextTurn({ say: false });
    }
    sfx('fanfare');
    await say('xie', 'cl_eye_done');
  } finally {
    setHint(null);
    P.close();
  }
}

// ============================== 農場（達達） ==============================
export function mountFarm(root, app) {
  return runRoom(root, app, {
    id: 'farm', host: 'dada', back: 'town',
    build() {
      const dio = outdoor(760, 620, { horizon: 'nature' });
      // 穀倉（西北）＋屋頂
      dio.addBox({ x: 40, y: 40, w: 200, d: 150, h: 150, color: '#ff7a5a', faces: { s: `<svg viewBox="0 0 200 150" width="100%" height="100%"><rect x="70" y="60" width="60" height="90" fill="#c9503a"/><path d="M70 60 L130 150 M130 60 L70 150" stroke="#fff" stroke-width="6"/></svg>` } });
      dio.addBox({ x: 30, y: 30, w: 220, d: 170, h: 20, z: 150, color: '#c9503a', cls: 'soft' });
      // 雞舍
      dio.addBox({ x: 520, y: 60, w: 110, d: 80, h: 80, color: '#ffd9a8' });
      dio.addBox({ x: 512, y: 52, w: 126, d: 96, h: 12, z: 80, color: '#c98b5e' });
      // 菜園
      dio.addDecal({ x: 300, y: 420, w: 220, h: 140, z: 0.6, css: 'border-radius:16px;background:repeating-linear-gradient(0deg,#8a5a3a 0 24px,#a8704a 24px 34px)' });
      // 圍欄
      for (let x = 280; x < 740; x += 60) dio.addBox({ x, y: 250, w: 10, d: 10, h: 50, color: '#e0b27e' });
      dio.addBox({ x: 280, y: 262, w: 460, d: 6, h: 8, z: 36, color: '#e0b27e' });
      // 稻草堆
      dio.addBox({ x: 120, y: 300, w: 70, d: 60, h: 50, color: '#ffd56a', cls: 'soft' });
      // 動物
      dio.addSprite({ x: 420, y: 200, w: 100, h: 90, shadow: 0.5, html: itemSvg('cow') });
      dio.addSprite({ x: 600, y: 200, w: 60, h: 60, shadow: 0.4, html: itemSvg('rabbit') });
      dio.addSprite({ x: 560, y: 180, w: 56, h: 56, shadow: 0.4, html: itemSvg('chicken') });
      [[680, 560], [700, 40], [40, 560]].forEach(([x, y]) => dio.addSprite({ x, y, w: 110, h: 150, html: tree(), shadow: 0.6 }));
      const dada = dio.addSprite({ x: 330, y: 330, w: 120, h: 132, html: dadaSvg(), shadow: 0.6, tap: 'dada' });
      const pig = dio.addSprite({ x: 470, y: 520, w: 90, h: 80, html: ANIMALS.pig, shadow: 0.5, tap: 'pig' });
      const sheep = dio.addSprite({ x: 90, y: 520, w: 90, h: 80, html: ANIMALS.sheep, shadow: 0.5, tap: 'sheep' });
      const shan = dio.addSprite({ x: 620, y: 420, w: 110, h: 126, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { dada, shan, pig, sheep } };
    },
    music: () => 'farm',
    lines: { hello: lineOf('fm'), pick: 'fm_pick', next: 'fm_next', allDone: [['dada', 'fm_all_done'], ['shan', 'fm_all_done']] },
    games: [
      { id: 'feed', icon: itemSvg('feed'), marker: { x: 470, y: 230, z: 190 }, run: (R) => {
        const all = [['carrot', 'rabbit'], ['carrot', 'rabbit'], ['hay', 'cow'], ['hay', 'cow'], ['corn', 'chicken'], ['corn', 'chicken'], ['apple', 'horse']];
        const use = hardSolo(R) ? all : all.slice(0, 6);
        return sortGame(R, { host: 'dada', hostSvg: dadaSvg(), intro: 'fm_feed_go',
          bins: [{ id: 'rabbit', html: itemSvg('rabbit') }, { id: 'cow', html: itemSvg('cow') }, { id: 'chicken', html: itemSvg('chicken') }, ...(hardSolo(R) ? [{ id: 'horse', html: dadaSvg() }] : [])],
          items: use.map(([k, bin]) => ({ k, bin, html: itemSvg(k) })), wrong: (it) => `fm_eat_${it.k}`, done: 'fm_feed_done' });
      } },
      { id: 'eggs', icon: itemSvg('basket'), marker: { x: 575, y: 100, z: 200 }, run: (R) => {
        const all = [
          { id: 'e1', x: 150, y: 368, z: 0 },
          { id: 'e2', x: 580, y: 150, z: 0 },
          { id: 'e3', x: 380, y: 300, z: 0 },
          { id: 'e4', x: 580, y: 40, z: 0, hidden: true, seenFrom: [1, 2] },
          { id: 'e5', x: 140, y: 20, z: 0, hidden: true, seenFrom: [1, 2] },
        ];
        const items = (hardSolo(R) ? all : [all[0], all[1], all[3], all[2]]).map((it) => ({ w: 44, h: 52, ...it, html: itemSvg('egg'), icon: itemSvg('egg') }));
        return findGame(R, { host: 'dada', intro: 'fm_eggs_go', items, list: true, found: () => null, hiddenLine: 'fm_eggs_hidden', done: 'fm_eggs_done' });
      } },
      { id: 'grow', icon: itemSvg('sprout'), marker: { x: 410, y: 490, z: 160 }, run: (R) => stepsGame(R, {
        host: 'dada', hostSvg: dadaSvg(), intro: 'fm_grow_go', wrong: 'fm_grow_wrong', done: 'fm_grow_done', cls: 'growpanel',
        scene: `<div class="plot"><div class="plot-art">${itemSvg('soil')}</div></div>`,
        targets: [
          { id: 'shovel', html: itemSvg('shovel'), x: 660, y: 120, w: 110, h: 110 },
          { id: 'seeds', html: itemSvg('seeds'), x: 780, y: 120, w: 110, h: 110 },
          { id: 'soil', html: itemSvg('soil'), x: 660, y: 260, w: 110, h: 110 },
          { id: 'can2', html: itemSvg('can2'), x: 780, y: 260, w: 110, h: 110 },
          { id: 'sun', html: itemSvg('sun'), x: 720, y: 400, w: 110, h: 110 },
          { id: 'plot', html: '', x: 140, y: 180, w: 400, h: 340 },
        ],
        steps: [
          { t: 'shovel', icon: itemSvg('shovel'), line: 'fm_grow_dig' },
          { t: 'seeds', icon: itemSvg('seeds'), line: 'fm_grow_seed' },
          { t: 'soil', icon: itemSvg('soil'), line: 'fm_grow_cover' },
          { t: 'can2', icon: itemSvg('can2'), line: 'fm_grow_water' },
          { t: 'sun', icon: itemSvg('sun'), line: 'fm_grow_sun' },
          { t: 'plot', icon: itemSvg('cabbage'), line: 'fm_grow_pick' },
        ],
        fx: async (i, t, pnl) => {
          const art = pnl.querySelector('.plot-art');
          const pics = ['soil', 'soil', 'soil', 'soil', 'sprout', 'cabbage'];
          sfx(['mop', 'pop', 'mop', 'water', 'sparkle', 'boing'][i]);
          if (i === 0) art.classList.add('dug');
          if (i === 1) art.insertAdjacentHTML('beforeend', '<div class="seeds-in"></div>');
          if (i === 3) art.classList.add('wet');
          await wait(800);
          art.innerHTML = itemSvg(pics[i]);
          if (i === 5) R.burstAt(art, { n: 20, stars: true, colors: ['#6fd17f', '#ffd23f', '#fff3a0'] });
        },
      }) },
    ],
    playful(name, R) {
      if (name === 'dada') { sfx('boing'); R.hop(R.set.chars.dada.el); return true; }
      if (name === 'pig' || name === 'sheep') { sfx('giggle'); R.hop(R.set.chars[name].el); R.say('dada', `fm_${name}`); return true; }
      return false;
    },
  });
}

// ============================== 警察局（警察狗哨哨） ==============================
// 愷愷喜歡警察：哨哨是原創的玩具警察狗，教交通安全和「走散了找誰幫忙」。
//   指揮交通：有人要過馬路 → 舉「停」；人都走過去了 → 舉「走」。人還在走就舉「走」會被提醒（先停一下、等一下）
//   過馬路：停在路邊 → 看左 → 看右 → 再看左 → 等綠燈 → 走斑馬線
//   走散了找誰：可以找的放愛心（警察、店員、帶著小孩的媽媽），不可以的放叉叉（給糖果叫你跟他走、叫你上車的陌生人）
export function mountPolice(root, app) {
  return runRoom(root, app, {
    id: 'police', host: 'shao', back: 'town',
    build() {
      const dio = outdoor(700, 600);
      // 馬路與斑馬線
      dio.addDecal({ x: 0, y: 380, w: 700, h: 110, z: 0.6, css: 'background:#8a8fa0' });
      dio.addDecal({ x: 300, y: 380, w: 100, h: 110, z: 0.7, css: 'background:repeating-linear-gradient(90deg,#fff 0 14px,transparent 14px 28px)' });
      // 警察局
      const front = `<svg viewBox="0 0 260 120" width="100%" height="100%" preserveAspectRatio="none"><rect width="260" height="18" fill="#2f5fbf"/><rect x="20" y="36" width="44" height="34" rx="4" fill="#bfe6ff"/><rect x="196" y="36" width="44" height="34" rx="4" fill="#bfe6ff"/><rect x="108" y="56" width="44" height="64" rx="4" fill="#1d3f8a"/><circle cx="130" cy="38" r="14" fill="#ffd23f"/></svg>`;
      dio.addBox({ x: 220, y: 90, w: 260, d: 150, h: 120, color: '#e3ebff', faces: { s: front } });
      dio.addBox({ x: 318, y: 150, z: 120, w: 30, d: 26, h: 26, color: '#ff4a4a', cls: 'siren-r' });
      dio.addBox({ x: 352, y: 150, z: 120, w: 30, d: 26, h: 26, color: '#3ea8e0', cls: 'siren-b' });
      dio.addSprite({ x: 560, y: 330, w: 130, h: 108, shadow: 0.5, html: VEHICLES.police });
      dio.addSprite({ x: 290, y: 372, w: 46, h: 120, shadow: 0.3, html: `<svg viewBox="0 0 46 120"><rect x="20" y="50" width="6" height="68" fill="#4a3b6b"/><rect x="6" y="4" width="34" height="54" rx="10" fill="#2f2a44"/><circle cx="23" cy="18" r="9" fill="#ff4a4a"/><circle cx="23" cy="42" r="9" fill="#4cff8a"/></svg>` });
      [[90, 120], [620, 130], [80, 560], [630, 560]].forEach(([x, y]) => dio.addSprite({ x, y, w: 110, h: 150, html: tree(), shadow: 0.6 }));
      const shao = dio.addSprite({ x: 200, y: 330, w: 120, h: 128, html: shaoSvg(), shadow: 0.6, tap: 'shao' });
      const shan = dio.addSprite({ x: 470, y: 560, w: 110, h: 126, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { shao, shan } };
    },
    music: () => 'town',
    lines: { hello: lineOf('pl'), pick: 'pl_pick', next: 'pl_next', allDone: [['shao', 'pl_all_done'], ['shan', 'pl_all_done']] },
    games: [
      { id: 'traffic', icon: `<svg viewBox="0 0 100 100"><rect x="30" y="6" width="40" height="88" rx="14" fill="#2f2a44"/><circle cx="50" cy="28" r="12" fill="#ff4a4a"/><circle cx="50" cy="62" r="12" fill="#4cff8a"/></svg>`, marker: { x: 350, y: 440, z: 160 }, run: trafficGame },
      { id: 'cross', icon: crossIcon('walk'), marker: { x: 120, y: 440, z: 160 }, run: (R) => stepsGame(R, {
        host: 'shao', hostSvg: shaoSvg(), cls: 'crosspanel', intro: 'pl_cross_go', wrong: 'pl_cross_wrong', done: 'pl_cross_done',
        scene: `<div class="cr-road"><div class="cr-zebra"></div></div><div class="cr-kid">${kidSvg(R.members[0])}</div>`,
        steps: [
          { t: 'curb', line: 'pl_cross_1', icon: itemSvg('stop') },
          { t: 'left', line: 'pl_cross_2', icon: crossIcon('left') },
          { t: 'right', line: 'pl_cross_3', icon: crossIcon('right') },
          { t: 'left', line: 'pl_cross_4', icon: crossIcon('left') },
          { t: 'light', line: 'pl_cross_5', icon: signSvg(true) },
          { t: 'zebra', line: 'pl_cross_6', icon: crossIcon('walk') },
        ],
        targets: [
          { id: 'curb', x: 330, y: 380, w: 160, h: 70, html: '<div class="cr-curb"></div>' },
          { id: 'left', x: 30, y: 150, w: 150, h: 150, html: crossIcon('left') },
          { id: 'right', x: 640, y: 150, w: 150, h: 150, html: crossIcon('right') },
          { id: 'light', x: 620, y: 110, w: 80, h: 160, html: `<svg viewBox="0 0 46 120" width="100%" height="100%"><rect x="20" y="50" width="6" height="68" fill="#4a3b6b"/><rect x="6" y="4" width="34" height="54" rx="10" fill="#2f2a44"/><circle class="lr" cx="23" cy="18" r="9" fill="#ff4a4a"/><circle class="lg" cx="23" cy="42" r="9" fill="#2f4a3a"/></svg>` },
          { id: 'zebra', x: 300, y: 170, w: 220, h: 150, html: '<div class="cr-zebra-hit"></div>' },
        ],
        fx: async (i, target, el) => {
          if (i === 4) { target.querySelector('.lr').setAttribute('fill', '#5a3a3a'); target.querySelector('.lg').setAttribute('fill', '#4cff8a'); }
          if (i === 5) { el.querySelector('.cr-kid').classList.add('walk'); await wait(1600); }
        },
      }) },
      { id: 'lost', icon: shaoSvg(), marker: { x: 560, y: 220, z: 200 }, run: (R) => {
        const all = [
          ['police', shaoSvg(), 'good'], ['clerk', duoduoSvg(), 'good'], ['mom', personSvg('mom'), 'good'],
          ['candy', `<div class="withicon">${personSvg('uncle')}<i>${itemSvg('candy')}</i></div>`, 'bad'],
          ['car', `<div class="withicon">${personSvg('auntie')}<i>${VEHICLES.bus}</i></div>`, 'bad'],
        ];
        return sortGame(R, { host: 'shao', hostSvg: shaoSvg(), intro: 'pl_lost_go',
          bins: [{ id: 'good', html: itemSvg('good') }, { id: 'bad', html: itemSvg('bad') }],
          items: all.map(([k, html, bin]) => ({ k, bin, html })), wrong: (it) => `pl_lost_${it.k}`, done: 'pl_lost_done' });
      } },
    ],
    playful(name, R) { if (name === 'shao') { sfx('ding'); R.hop(R.set.chars.shao.el); R.say('shao', 'shao_hi'); return true; } return false; },
  });
}
function crossIcon(k) {
  if (k === 'walk') return `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M20 70 H80 M20 50 H80 M20 30 H80" stroke="#fff" stroke-width="10"/><circle cx="56" cy="20" r="9" fill="#ffd9b8"/><path d="M56 30 V56 L44 76 M56 56 L66 76 M56 38 L40 30" stroke="#2f7fe0" stroke-width="7" stroke-linecap="round" fill="none"/></svg>`;
  const flip = k === 'right' ? 'transform="scale(-1 1) translate(-100 0)"' : '';
  return `<svg viewBox="0 0 100 100" width="100%" height="100%"><g ${flip}><circle cx="50" cy="50" r="44" fill="#fff3c4"/><path d="M66 50 H28 M42 34 L26 50 L42 66" stroke="#ff8a3d" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="72" cy="40" r="6" fill="#4a3b6b"/></g></svg>`;
}

async function trafficGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('trafficpanel', { host: 'shao', hostSvg: shaoSvg() });
  const el = P.el;
  const cars = ['bus', 'police', 'fire', 'bus'];
  try {
    el.innerHTML = `<div class="tr-road"><div class="tr-zebra"></div><div class="tr-cars moving">${[...cars, ...cars].map((k) => `<div class="tr-car">${VEHICLES[k]}</div>`).join('')}</div></div>
      <div class="tr-walkers"></div><button class="tr-sign">${signSvg(true)}</button>`;
    const sign = el.querySelector('.tr-sign');
    const carsEl = el.querySelector('.tr-cars');
    const walkersEl = el.querySelector('.tr-walkers');
    let mode = 'go';
    let tapped = null;
    sign.addEventListener('pointerdown', (e) => { e.stopPropagation(); tapped?.(); });
    const setSign = (m) => { mode = m; sign.innerHTML = signSvg(m === 'go'); sfx('click'); R.hop(sign); carsEl.classList.toggle('moving', m === 'go'); };
    const waitTap = () => race(new Promise((res) => { tapped = () => { tapped = null; res(); }; }));
    await say('shao', 'pl_tr_go');
    chk();
    await callTurn();
    chk();
    const rounds = hardSolo(R) ? 4 : 3;
    for (let r = 0; r < rounds; r++) {
      // 有人要過馬路
      const who = shuffle(['mom', 'dad', 'grandma', 'uncle', 'auntie']).slice(0, r % 2 ? 2 : 1);
      walkersEl.innerHTML = who.map((k, i) => `<div class="tr-w" style="left:${360 + i * 70}px">${personSvg(k)}</div>`).join('');
      await wait(400);
      await say('shao', 'pl_tr_walkers');
      chk();
      if (levelNow(R.profile) === 'easy') sign.classList.add('glowy-2d');
      setHint(() => sign);
      await waitTap();
      chk();
      sign.classList.remove('glowy-2d');
      setSign('stop');
      sfx('sparkle');
      await say('shao', 'pl_tr_stop_good');
      chk();
      // 走過去；還在走的時候舉「走」會被提醒（等一下）
      setHint(null);
      walkersEl.querySelectorAll('.tr-w').forEach((w) => w.classList.add('cross'));
      let early = 0;
      tapped = () => { if (early++ === 0) say('shao', 'pl_tr_wait'); sfx('soft'); R.hop(sign); };
      await wait(3200);
      chk();
      tapped = null;
      walkersEl.innerHTML = '';
      await say('shao', 'pl_tr_clear');
      chk();
      if (levelNow(R.profile) === 'easy') sign.classList.add('glowy-2d');
      setHint(() => sign);
      await waitTap();
      chk();
      sign.classList.remove('glowy-2d');
      setSign('go');
      sfx('sparkle');
      await say('shao', early ? 'pl_tr_go_wait_good' : 'pl_tr_go_good');
      chk();
      if (turnsOn() && r < rounds - 1) await nextTurn({ say: false });
      await wait(1200);
    }
    sfx('fanfare');
    await say('shao', 'pl_tr_done');
    await wait(300);
  } finally {
    setHint(null);
    P.close();
  }
}

// ---------------- 公園：挖恐龍化石（愷愷喜歡恐龍；看形狀放回骨架是他的強項）----------------
// 1. 用手指撥開沙子（擦掉），找到三塊化石
// 2. 把化石拖回骨架上一樣形狀、一樣方向的位置
// 3. 恐龍活過來！
const DINO_KINDS = ['trex', 'tri', 'stego', 'bronto'];
async function dinoGame(R) {
  const { say, chk, race } = R;
  const kind = pick(DINO_KINDS);
  const P = R.panel('dinopanel', { host: 'jiujiu', hostSvg: jiujiuSvg() });
  const el = P.el;
  // 三塊化石：頭骨、兩根（不同方向的）骨頭
  const pieces = [
    { k: 'skull', html: skullSvg(), dig: [70, 60], slot: [720, 150] },
    { k: 'bone0', html: boneSvg(0), dig: [300, 230], slot: [600, 260] },
    { k: 'bone1', html: boneSvg(60), dig: [470, 80], slot: [470, 300] },
  ];
  try {
    el.innerHTML = `<div class="sandbox"><canvas class="sand" width="600" height="380"></canvas>${pieces.map((p, i) => `<div class="fos" data-i="${i}" style="left:${p.dig[0]}px;top:${p.dig[1]}px">${p.html}</div>`).join('')}</div>
      <div class="skel">${pieces.map((p, i) => `<div class="slot" data-i="${i}" style="left:${p.slot[0]}px;top:${p.slot[1]}px">${p.html}</div>`).join('')}<div class="dino-big">${DINOS[kind]}</div></div>`;
    const cv = el.querySelector('canvas');
    const g = cv.getContext('2d');
    g.fillStyle = '#e8cf95'; g.fillRect(0, 0, 600, 380);
    for (let i = 0; i < 500; i++) { g.fillStyle = i % 2 ? '#d8b878' : '#f4e0ad'; g.beginPath(); g.arc((i * 131) % 600, (i * 71) % 380, 3 + (i % 4), 0, 7); g.fill(); }
    const fos = [...el.querySelectorAll('.fos')];
    const slots = [...el.querySelectorAll('.slot')];
    await say('jiujiu', 'dn_go');
    chk();
    await callTurn();
    chk();
    // 1. 挖
    const found = new Set();
    let down = false, moves = 0;
    const rectOf = (i) => { const p = pieces[i]; return [p.dig[0] - 20, p.dig[1] - 20, 110, 110]; };
    const uncovered = (i) => {
      const [x, y, w, h] = rectOf(i);
      const d = g.getImageData(Math.max(0, x), Math.max(0, y), w, h).data;
      let clear = 0;
      for (let k = 3; k < d.length; k += 16) if (d[k] < 40) clear++;
      return clear / (d.length / 16);
    };
    setHint(() => fos.find((_, i) => !found.has(i)));
    await race(new Promise((resolve) => {
      const erase = (e) => {
        const r = cv.getBoundingClientRect();
        const x = (e.clientX - r.left) * 600 / r.width, y = (e.clientY - r.top) * 380 / r.height;
        g.globalCompositeOperation = 'destination-out';
        g.beginPath(); g.arc(x, y, 34, 0, 7); g.fill();
        g.globalCompositeOperation = 'source-over';
        if (++moves % 4) return;
        if (moves % 24 === 0) sfx('scrub');
        pieces.forEach((_, i) => {
          if (found.has(i) || uncovered(i) < 0.45) return;
          found.add(i);
          fos[i].classList.add('found');
          sfx('sparkle');
          R.burstAt(fos[i], { n: 12, stars: true });
          if (found.size < pieces.length) say('jiujiu', 'dn_found');
          setHint(() => fos.find((_, k) => !found.has(k)));
          if (found.size === pieces.length) resolve();
        });
      };
      cv.addEventListener('pointerdown', (e) => { e.preventDefault(); down = true; cv.setPointerCapture(e.pointerId); erase(e); });
      cv.addEventListener('pointermove', (e) => { if (down) erase(e); });
      cv.addEventListener('pointerup', () => { down = false; });
    }));
    chk();
    cv.classList.add('gone');
    await say('jiujiu', 'dn_build');
    chk();
    // 2. 拼回骨架（一起玩：輪流放）
    el.classList.add('building');
    const placed = new Set();
    let lastWrong = 0;
    if (turnsOn()) await nextTurn({ say: false });
    if (levelNow(R.profile) === 'easy') slots.forEach((s) => s.classList.add('hintslot'));
    setHint(() => fos.find((_, i) => !placed.has(i)));
    await race(new Promise((resolve) => {
      fos.forEach((f, i) => f.addEventListener('pointerdown', (e) => {
        if (placed.has(i)) return;
        R.drag(e, {
          html: pieces[i].html, size: 110, originEl: f,
          onStart: () => f.classList.add('lifted'),
          onDrop: (cx, cy) => {
            const hit = slots.findIndex((s, k) => { if (placed.has(k)) return false; const r = s.getBoundingClientRect(); return Math.hypot(cx - (r.left + r.width / 2), cy - (r.top + r.height / 2)) < r.width * 0.75; });
            if (hit === i) { const r = stageRect(slots[i]); return { x: r.x, y: r.y }; }
            if (hit >= 0 && Date.now() - lastWrong > 3000) { lastWrong = Date.now(); say('jiujiu', 'dn_wrong'); }
            return null;
          },
          onPlaced: async () => {
            placed.add(i);
            f.classList.add('used');
            slots[i].classList.add('filled');
            sfx('click'); sfx('sparkle');
            if (placed.size === pieces.length) resolve();
            else if (turnsOn()) await nextTurn({ say: false });
          },
          onBack: () => { f.classList.remove('lifted'); sfx('soft'); },
        });
      }));
    }));
    chk();
    setHint(null);
    // 3. 活過來
    el.classList.add('alive');
    sfx('drum'); sfx('fanfare');
    R.burstAt(el.querySelector('.dino-big'), { n: 28, spread: 240, stars: true });
    await say('jiujiu', `dn_is_${kind}`);
    chk();
    await say('jiujiu', 'dn_done');
    await wait(300);
  } finally {
    setHint(null);
    P.close();
  }
}
