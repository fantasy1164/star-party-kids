// 海邊與山上（11/24）：
//   海生館（白白；參考屏東海生館：海底隧道、白鯨、企鵝）
//   沙灘（夾夾：防曬、撿貝殼、海邊安全）
//   動物園（竹竹；參考木柵動物園：熊貓、無尾熊、非洲動物、台灣動物區、企鵝）
// 找到動物時會說英文名字（偶爾穿插英文）。
import { runRoom } from './room-base.js';
import { sortGame, findGame, stepsGame } from './kit.js';
import { createDiorama } from '../engine/diorama.js';
import { div, wait, shuffle, pick } from '../core/dom.js';
import { sfx } from '../core/audio.js';
import { turnsOn, callTurn, nextTurn, levelNow } from '../core/turns.js';
import { setHint } from '../core/session.js';
import { shanSvg } from '../art/stars.js';
import { personSvg } from '../art/more.js';
import { itemSvg } from '../art/town.js';
import { baibaiSvg, jiajiaSvg, zhuzhuSvg, ZOO, SEA, SHELLS, MISC } from '../art/world.js';

const hello = (p) => (ph) => `${p}_hello_${ph === 'night' ? 'evening' : ph === 'morning' ? 'morning' : 'day'}`;
const hardSolo = (R) => R.members.length === 1 && R.members[0] === 'yy';
const tree = (c = '#4fbf6e') => `<svg viewBox="0 0 80 110"><rect x="34" y="70" width="12" height="38" rx="5" fill="#a9744f"/><circle cx="40" cy="48" r="34" fill="${c}"/></svg>`;
const coral = (c) => `<svg viewBox="0 0 80 100"><path d="M40 100 V50 M40 70 Q20 60 18 34 M40 60 Q62 50 64 26 M18 34 Q12 22 20 14 M64 26 Q70 14 62 8" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/></svg>`;
const rock = (c = '#9aa3b5') => `<svg viewBox="0 0 100 70"><path d="M6 70 Q4 30 34 20 Q60 6 84 28 Q100 46 96 70Z" fill="${c}"/><path d="M30 30 Q44 22 56 26" stroke="#fff" stroke-width="4" opacity=".3" fill="none"/></svg>`;

// ============================== 海生館（白白） ==============================
export function mountAquarium(root, app) {
  return runRoom(root, app, {
    id: 'aquarium', host: 'baibai', back: 'town',
    build() {
      // 海底隧道：藍色的地板，四周是珊瑚和石頭，魚躲在後面（要轉一轉才看得到）
      const dio = createDiorama({ w: 760, d: 620, walls: false, zoom: 0.9, cy: 0.6, base: '#1d5a9a', rim: 26,
        floorCss: 'background: radial-gradient(circle at 50% 50%, #9fdcff 0, #5ab8ea 50%, #2f8fd0 100%)' });
      dio.addDecal({ x: 300, y: 0, w: 160, h: 620, z: 0.8, css: 'background:rgba(255,255,255,.35);border-radius:80px' });
      [[100, 120, '#ff8fbf'], [600, 140, '#ffb627'], [140, 480, '#a98bff'], [620, 470, '#ff5d73'], [380, 300, '#7ee06a']].forEach(([x, y, c]) => dio.addSprite({ x, y, w: 90, h: 110, shadow: 0.2, html: coral(c) }));
      [[220, 220], [540, 360], [200, 380]].forEach(([x, y]) => dio.addBox({ x, y, w: 90, d: 70, h: 70, color: '#7d8698' }));
      const baibai = dio.addSprite({ x: 380, y: 520, z: 30, w: 130, h: 120, html: baibaiSvg(), shadow: 0.3, tap: 'baibai' });
      const shan = dio.addSprite({ x: 380, y: 120, w: 100, h: 114, html: shanSvg(), shadow: 0.6, tap: 'shan' });
      for (let i = 0; i < 10; i++) dio.addSprite({ x: 60 + (i * 71) % 660, y: 60 + (i * 53) % 520, z: 180 + (i % 3) * 30, w: 18, h: 18, shadow: 0, cls: 'bubble', html: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/></svg>' });
      return { dio, chars: { baibai, shan } };
    },
    music: () => 'sea',
    lines: { hello: hello('aq'), pick: 'aq_pick', next: 'aq_next', allDone: [['baibai', 'aq_all_done'], ['shan', 'aq_all_done']] },
    games: [
      { id: 'tunnel', icon: SEA.whaleshark, marker: { x: 380, y: 300, z: 220 }, run: (R) => {
        const all = [
          { id: 'clownfish', x: 130, y: 160, z: 60, hidden: false },
          { id: 'jellyfish', x: 460, y: 80, z: 120, hidden: false },
          { id: 'turtle', x: 250, y: 300, z: 0, hidden: true, seenFrom: [2, 3] },
          { id: 'ray', x: 585, y: 330, z: 0, hidden: true, seenFrom: [1, 2] },
          { id: 'whaleshark', x: 620, y: 260, z: 140, hidden: false },
          { id: 'beluga', x: 120, y: 420, z: 80, hidden: true, seenFrom: [1, 2] },
        ];
        const items = (hardSolo(R) ? all : all.slice(0, 4)).map((it) => ({ w: 90, h: 80, ...it, html: SEA[it.id] }));
        return findGame(R, { host: 'baibai', intro: 'aq_tunnel_go', items, found: (id) => `aq_found_${id}`, hiddenLine: 'aq_tunnel_hidden', done: 'aq_tunnel_done' });
      } },
      { id: 'penguin', icon: ZOO.penguin, marker: { x: 600, y: 140, z: 200 }, run: penguinGame },
      { id: 'rules', icon: MISC.glassTap, marker: { x: 140, y: 480, z: 200 }, run: (R) => sortGame(R, {
        host: 'baibai', hostSvg: baibaiSvg(), intro: 'aq_rules_go',
        bins: [{ id: 'good', html: itemSvg('good') }, { id: 'bad', html: itemSvg('bad') }],
        items: shuffle([
          { k: 'glass', bin: 'bad', html: MISC.glassTap }, { k: 'flash', bin: 'bad', html: MISC.flash }, { k: 'loud', bin: 'bad', html: MISC.loud },
          { k: 'quiet', bin: 'good', html: MISC.quiet }, { k: 'adult', bin: 'good', html: personSvg('mom') },
        ]),
        wrong: (it) => `aq_rules_${it.k}`, done: 'aq_rules_done' }) },
    ],
    playful(name, R) { if (name === 'baibai') { sfx('water'); R.hop(R.set.chars.baibai.el); R.say('baibai', 'baibai_hi'); return true; } return false; },
  });
}

// 企鵝排隊：從最高的排到最矮的（愷愷：從最矮排到最高）
async function penguinGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('penguinpanel', { host: 'baibai', hostSvg: baibaiSvg() });
  const el = P.el;
  const n = hardSolo(R) ? 5 : 4;
  const sizes = [...Array(n)].map((_, i) => 90 + i * 34);   // 由小到大
  const bigFirst = hardSolo(R);
  const order = bigFirst ? sizes.map((_, i) => n - 1 - i) : sizes.map((_, i) => i);
  try {
    el.innerHTML = `<div class="ice"></div><div class="pgs">${shuffle(sizes.map((s, i) => i)).map((i) => `<button class="pg" data-i="${i}" style="--s:${sizes[i]}px">${ZOO.penguin}</button>`).join('')}</div><div class="pline">${order.map(() => '<div class="pslot"></div>').join('')}</div>`;
    const pgs = [...el.querySelectorAll('.pg')];
    const slots = [...el.querySelectorAll('.pslot')];
    await say('baibai', bigFirst ? 'aq_pg_go_big' : 'aq_pg_go_small');
    chk();
    await callTurn();
    chk();
    let k = 0, lastWrong = 0;
    const want = () => pgs.find((p) => +p.dataset.i === order[k]);
    const glow = () => pgs.forEach((p) => p.classList.toggle('glowy-2d', levelNow(R.profile) === 'easy' && p === want()));
    glow();
    setHint(() => want());
    await race(new Promise((resolve) => {
      pgs.forEach((p) => p.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (p.classList.contains('lined')) return;
        if (+p.dataset.i !== order[k]) { sfx('soft'); R.hop(p); if (Date.now() - lastWrong > 2500) { lastWrong = Date.now(); say('baibai', bigFirst ? 'aq_pg_wrong_big' : 'aq_pg_wrong_small'); } return; }
        sfx('pop');
        p.classList.add('lined');
        slots[k].appendChild(p);
        k++;
        if (turnsOn() && k < n) nextTurn({ say: false });
        glow();
        if (k === n) resolve();
      }));
    }));
    chk();
    setHint(null);
    sfx('fanfare');
    await say('baibai', 'aq_pg_done');
    await wait(300);
  } finally { setHint(null); P.close(); }
}

// ============================== 沙灘（夾夾） ==============================
export function mountBeach(root, app) {
  return runRoom(root, app, {
    id: 'beach', host: 'jiajia', back: 'town',
    build() {
      const dio = createDiorama({ w: 760, d: 600, walls: false, zoom: 0.92, cy: 0.6, base: '#3ea8e0', rim: 24,
        floorCss: 'background: linear-gradient(180deg, #f6e3b0 0 58%, #bfe9ff 58% 62%, #5ec3ee 62% 100%)' });
      dio.addSprite({ x: 220, y: 180, w: 160, h: 170, shadow: 0.5, html: `<svg viewBox="0 0 100 110"><path d="M50 106 V30" stroke="#a9744f" stroke-width="5"/><path d="M6 36 Q50 -10 94 36Z" fill="#ff5d73"/><path d="M28 36 Q50 0 72 36" fill="#fff"/></svg>` });
      dio.addDecal({ x: 120, y: 250, w: 170, h: 90, z: 0.8, css: 'background:repeating-linear-gradient(90deg,#3ec7e0 0 20px,#fff 20px 40px);border-radius:10px' });
      dio.addSprite({ x: 660, y: 120, w: 70, h: 140, shadow: 0.4, html: `<svg viewBox="0 0 80 120"><path d="M24 120 L30 30 H50 L56 120Z" fill="#fff"/><path d="M27 60 H53 M25 90 H55" stroke="#ff4a4a" stroke-width="12"/><rect x="28" y="16" width="24" height="16" fill="#ffd23f"/><path d="M24 16 L40 2 L56 16Z" fill="#ff4a4a"/></svg>` });
      dio.addSprite({ x: 520, y: 520, z: 2, w: 120, h: 90, shadow: 0, html: MISC.flags });
      [[70, 90], [560, 260]].forEach(([x, y]) => dio.addSprite({ x, y, w: 50, h: 50, shadow: 0.2, html: pick([SHELLS.fan, SHELLS.star, SHELLS.spiral]) }));
      const jiajia = dio.addSprite({ x: 420, y: 300, w: 110, h: 110, html: jiajiaSvg(), shadow: 0.5, tap: 'jiajia' });
      const shan = dio.addSprite({ x: 330, y: 220, w: 100, h: 114, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { jiajia, shan } };
    },
    music: () => 'sea',
    lines: { hello: hello('bc'), pick: 'bc_pick', next: 'bc_next', allDone: [['jiajia', 'bc_all_done'], ['shan', 'bc_all_done']] },
    games: [
      { id: 'sun', icon: MISC.sunscreen, marker: { x: 220, y: 180, z: 240 }, run: (R) => stepsGame(R, {
        host: 'jiajia', hostSvg: jiajiaSvg(), cls: 'sunpanel', intro: 'bc_sun_go', wrong: 'bc_sun_wrong', done: 'bc_sun_done',
        scene: '<div class="sunball"></div>',
        steps: [
          { t: 'cap', line: 'bc_sun_1', icon: MISC.cap },
          { t: 'cream', line: 'bc_sun_2', icon: MISC.sunscreen },
          { t: 'shoe', line: 'bc_sun_3', icon: MISC.flipflop },
          { t: 'water', line: 'bc_sun_4', icon: itemSvg('water') },
        ],
        targets: [
          { id: 'cap', x: 120, y: 240, w: 140, h: 120, html: MISC.cap },
          { id: 'cream', x: 340, y: 380, w: 110, h: 140, html: MISC.sunscreen },
          { id: 'shoe', x: 560, y: 260, w: 140, h: 140, html: MISC.flipflop },
          { id: 'water', x: 720, y: 400, w: 110, h: 130, html: itemSvg('water') },
        ],
      }) },
      { id: 'shells', icon: SHELLS.spiral, marker: { x: 80, y: 90, z: 160 }, run: (R) => {
        const kinds = ['fan', 'spiral', 'star'];
        const items = [];
        for (let i = 0; i < (hardSolo(R) ? 9 : 6); i++) items.push({ k: `${kinds[i % 3]}${i}`, bin: kinds[i % 3], html: SHELLS[kinds[i % 3]] });
        return sortGame(R, { host: 'jiajia', hostSvg: jiajiaSvg(), intro: 'bc_shell_go',
          bins: kinds.map((k) => ({ id: k, html: `<div class="bucketbin">${MISC.bucket}<i>${SHELLS[k]}</i></div>` })),
          items: shuffle(items), wrong: () => 'bc_shell_wrong', done: 'bc_shell_done' });
      } },
      { id: 'safe', icon: MISC.flags, marker: { x: 520, y: 520, z: 160 }, run: (R) => sortGame(R, {
        host: 'jiajia', hostSvg: jiajiaSvg(), intro: 'bc_safe_go',
        bins: [{ id: 'good', html: itemSvg('good') }, { id: 'bad', html: itemSvg('bad') }],
        items: shuffle([
          { k: 'flags', bin: 'good', html: MISC.flags }, { k: 'adult', bin: 'good', html: personSvg('dad') }, { k: 'pick', bin: 'good', html: MISC.bucket },
          { k: 'deep', bin: 'bad', html: MISC.deep }, { k: 'litter', bin: 'bad', html: itemSvg('wrapper') },
        ]),
        wrong: (it) => `bc_safe_${it.k}`, done: 'bc_safe_done' }) },
    ],
    playful(name, R) { if (name === 'jiajia') { sfx('click'); R.hop(R.set.chars.jiajia.el); R.say('jiajia', 'jiajia_hi'); return true; } return false; },
  });
}

// ============================== 動物園（竹竹） ==============================
export function mountZoo(root, app) {
  return runRoom(root, app, {
    id: 'zoo', host: 'zhuzhu', back: 'town',
    build() {
      const dio = createDiorama({ w: 800, d: 640, walls: false, zoom: 0.88, cy: 0.6, base: '#6fb85a', rim: 24,
        floorCss: 'background: radial-gradient(circle at 50% 50%, #b8e89a, #8fcf72)' });
      // 步道（十字）
      dio.addDecal({ x: 360, y: 0, w: 80, h: 640, z: 0.6, css: 'background:#e8cf95' });
      dio.addDecal({ x: 0, y: 290, w: 800, h: 70, z: 0.6, css: 'background:#e8cf95' });
      // 四個區：熊貓館、非洲動物區、台灣動物區、企鵝館（柵欄＋地面顏色）
      const zone = (x, y, w, d, css) => dio.addDecal({ x, y, w, d, h: d, z: 0.5, css: `border-radius:24px;${css}` });
      zone(30, 30, 300, 230, 'background:#a6e08a');
      zone(470, 30, 300, 230, 'background:#e8d88a');
      zone(30, 390, 300, 220, 'background:#7fc86a');
      zone(470, 390, 300, 220, 'background:#bfe9ff');
      dio.addBox({ x: 50, y: 40, w: 120, d: 80, h: 80, color: '#fff', faces: { s: `<svg viewBox="0 0 120 80" width="100%" height="100%" preserveAspectRatio="none"><rect x="40" y="30" width="40" height="50" rx="4" fill="#7ed36a"/></svg>` } });
      [[260, 80], [120, 220], [700, 80], [80, 560], [270, 450]].forEach(([x, y]) => dio.addSprite({ x, y, w: 80, h: 110, shadow: 0.6, html: tree(pick(['#4fbf6e', '#3f9f5a'])) }));
      [[560, 150], [640, 210], [200, 520], [600, 520]].forEach(([x, y]) => dio.addSprite({ x, y, w: 90, h: 60, shadow: 0.3, html: rock() }));
      dio.addSprite({ x: 160, y: 120, w: 60, h: 90, shadow: 0.2, html: MISC.bamboo });
      const zhuzhu = dio.addSprite({ x: 400, y: 260, w: 110, h: 118, html: zhuzhuSvg(), shadow: 0.6, tap: 'zhuzhu' });
      const shan = dio.addSprite({ x: 330, y: 380, w: 100, h: 114, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      return { dio, chars: { zhuzhu, shan } };
    },
    music: () => 'zoo',
    lines: { hello: hello('zo'), pick: 'zo_pick', next: 'zo_next', allDone: [['zhuzhu', 'zo_all_done'], ['shan', 'zo_all_done']] },
    games: [
      { id: 'find', icon: ZOO.giraffe, marker: { x: 620, y: 100, z: 220 }, run: (R) => {
        const all = [
          { id: 'panda', x: 200, y: 160, z: 0, hidden: false },
          { id: 'giraffe', x: 540, y: 90, z: 0, hidden: false, w: 100, h: 130 },
          { id: 'penguin', x: 620, y: 470, z: 0, hidden: false },
          { id: 'koala', x: 270, y: 450, z: 60, hidden: true, seenFrom: [1, 2] },
          { id: 'zebra', x: 700, y: 180, z: 0, hidden: true, seenFrom: [0, 3] },
          { id: 'lion', x: 620, y: 230, z: 0, hidden: true, seenFrom: [2, 3] },
          { id: 'blackbear', x: 110, y: 470, z: 0, hidden: false },
          { id: 'leopardcat', x: 200, y: 570, z: 0, hidden: true, seenFrom: [1, 2] },
        ];
        const items = (hardSolo(R) ? all : all.slice(0, 5)).map((it) => ({ w: 90, h: 90, ...it, html: ZOO[it.id] }));
        return findGame(R, { host: 'zhuzhu', intro: 'zo_find_go', items, found: (id) => `zo_found_${id}`, hiddenLine: 'zo_find_hidden', done: 'zo_find_done' });
      } },
      { id: 'food', icon: MISC.bamboo, marker: { x: 160, y: 120, z: 200 }, run: (R) => {
        const yy = hardSolo(R);
        const pairs = [['panda', 'bamboo'], ['koala', 'eucalyptus'], ['giraffe', 'leaves'], ['lion', 'meat'], ['penguin', 'smallfish']].slice(0, yy ? 5 : 3);
        return sortGame(R, { host: 'zhuzhu', hostSvg: zhuzhuSvg(), intro: 'zo_food_go',
          bins: pairs.map(([a]) => ({ id: a, html: ZOO[a] })),
          items: shuffle(pairs.map(([a, f]) => ({ k: f, bin: a, html: MISC[f] }))),
          wrong: (it) => `zo_food_${it.bin}`, done: 'zo_food_done' });
      } },
      { id: 'rules', icon: MISC.feedHand, marker: { x: 600, y: 520, z: 200 }, run: (R) => sortGame(R, {
        host: 'zhuzhu', hostSvg: zhuzhuSvg(), intro: 'zo_rules_go',
        bins: [{ id: 'good', html: itemSvg('good') }, { id: 'bad', html: itemSvg('bad') }],
        items: shuffle([
          { k: 'glass', bin: 'bad', html: MISC.glassTap }, { k: 'feed', bin: 'bad', html: MISC.feedHand }, { k: 'loud', bin: 'bad', html: MISC.loud },
          { k: 'path', bin: 'good', html: MISC.path }, { k: 'quiet', bin: 'good', html: MISC.quiet }, { k: 'adult', bin: 'good', html: personSvg('mom') },
        ]),
        wrong: (it) => `zo_rules_${it.k}`, done: 'zo_rules_done' }) },
    ],
    playful(name, R) { if (name === 'zhuzhu') { sfx('boing'); R.hop(R.set.chars.zhuzhu.el); R.say('zhuzhu', 'zhuzhu_hi'); return true; } return false; },
  });
}
