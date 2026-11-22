// 廚房（小恐龍主廚咚咚）。三個短關卡：
//   我的餐盤：把食物拖進餐盤對的那一格（蔬菜、主食、豆魚蛋肉、水果，國健署「我的餐盤」分類）。
//            凱凱：格子裡有淡淡的提示圖；岳岳：沒有提示，還會混進零食（放上餐盤咚咚會說明零食不是正餐）。
//   擺餐具：照桌上的虛線，幫爸爸、媽媽、阿嬤擺碗和筷子（岳岳一個人玩時再加湯匙）。空間配對，凱凱的強項。
//   什麼能摸：檯面上的東西滑過來，可以吃的點一下放進籃子；熱鍋、刀子、熱水壺不要碰（用眼睛判斷的「先停一下」）。
import { runRoom } from './room-base.js';
import { createDiorama } from '../engine/diorama.js';
import { div, wait, burst, stageRect, toStage, shuffle } from '../core/dom.js';
import { sfx } from '../core/audio.js';
import { turnsOn, callTurn, nextTurn, levelNow, whoseTurn } from '../core/turns.js';
import { setHint } from '../core/session.js';
import { KIDS } from '../config.js';
import { shanSvg } from '../art/stars.js';
import { dongSvg, personSvg, foodSvg, FOODS, PLATE_CATS, utensilSvg, kitchenItemSvg, KITCHEN_ITEMS, ICON2 } from '../art/more.js';

export function mount(root, app) {
  return runRoom(root, app, {
    id: 'kitchen',
    host: 'dong',
    build: buildKitchen,
    music: () => 'kitchen',
    lines: {
      hello: (ph) => `kit_hello_${ph === 'night' ? 'evening' : ph}`,
      pick: 'kit_pick',
      next: 'kit_next',
      allDone: [['dong', 'kit_all_done'], ['shan', 'kit_all_done']],
    },
    games: [
      { id: 'plate', icon: ICON2.plate, marker: { x: 345, y: 375, z: 230 }, run: plateGame },
      { id: 'table', icon: ICON2.table, marker: { x: 160, y: 470, z: 200 }, run: tableGame },
      { id: 'safe', icon: ICON2.hot, marker: { x: 450, y: 44, z: 260 }, run: safeGame },
    ],
    playful(name, R) {
      if (name === 'dong') { sfx('boing'); R.hop(R.set.chars.dong.el); if (Math.random() < 0.4) R.say('dong', 'dong_hungry'); return true; }
      if (['dad', 'mom', 'grandma'].includes(name)) { sfx('giggle'); R.hop(R.set.family[name].el); return true; }
      return false;
    },
  });
}

// ---------------- 模型 ----------------
const TABLE = { x: 210, y: 290, w: 270, d: 170, z: 70 };
// 三個座位的餐墊（世界座標）與上面的位子：碗、筷子、湯匙
const SEATS = {
  dad: { person: { x: 345, y: 276 }, mat: { x: 290, y: 294, w: 110, h: 60 }, slots: { spoon: [306, 324], bowl: [345, 324], chopsticks: [384, 324] } },
  mom: { person: { x: 186, y: 378 }, mat: { x: 214, y: 314, w: 60, h: 138 }, slots: { spoon: [244, 336], bowl: [244, 377], chopsticks: [244, 422] } },
  grandma: { person: { x: 504, y: 378 }, mat: { x: 416, y: 314, w: 60, h: 138 }, slots: { spoon: [446, 422], bowl: [446, 377], chopsticks: [446, 334] } },
};
const SLOT_SIZE = { bowl: [42, 42], chopsticks: [22, 52], spoon: [20, 42] };

function buildKitchen() {
  const dio = createDiorama({
    w: 640, d: 600, wallH: 300, zoom: 0.98, cy: 0.6, wall: '#fff0d9', base: '#b9805a',
    floorCss: 'background: repeating-linear-gradient(45deg, #f2d4a4 0 34px, #e9c58f 34px 68px)',
  });
  // 流理台（靠北牆）
  dio.addBox({ x: 120, y: 0, w: 510, d: 84, h: 92, color: '#f7efe2',
    faces: { s: `<svg viewBox="0 0 510 92" width="100%" height="100%" preserveAspectRatio="none">${[0, 1, 2, 3, 4].map((i) => `<rect x="${8 + i * 101}" y="12" width="92" height="70" rx="8" fill="#ffe6c4"/><rect x="${44 + i * 101}" y="20" width="20" height="6" rx="3" fill="#c98b5e"/>`).join('')}</svg>` } });
  dio.addBox({ x: 116, y: -2, w: 518, d: 90, h: 8, z: 92, color: '#e2cdb0' });
  dio.addDecal({ x: 180, y: 14, w: 100, h: 60, z: 100.6, css: 'border-radius:14px;background:radial-gradient(circle,#dff4ff,#9fd6f5)' });
  dio.addDecal({ x: 400, y: 12, w: 110, h: 64, z: 100.6, html: `<svg viewBox="0 0 110 64" width="100%" height="100%"><rect width="110" height="64" rx="8" fill="#3a3550"/><circle cx="30" cy="32" r="18" fill="none" stroke="#ff7a5a" stroke-width="5"/><circle cx="80" cy="32" r="18" fill="none" stroke="#6b6585" stroke-width="5"/></svg>` });
  dio.addSprite({ x: 430, y: 48, z: 100, w: 66, h: 60, shadow: 0, html: kitchenItemSvg('pot') });
  // 吊櫃、窗戶
  dio.wallArt('n', { along: 140, up: 150, w: 200, h: 90, html: `<svg viewBox="0 0 200 90"><rect x="2" y="2" width="96" height="86" rx="8" fill="#ffd9a8"/><rect x="102" y="2" width="96" height="86" rx="8" fill="#ffd9a8"/><rect x="80" y="40" width="8" height="18" rx="3" fill="#c98b5e"/><rect x="112" y="40" width="8" height="18" rx="3" fill="#c98b5e"/></svg>` });
  dio.wallArt('n', { along: 400, up: 150, w: 130, h: 100, html: `<svg viewBox="0 0 130 100"><rect x="4" y="4" width="122" height="92" rx="10" fill="#fff"/><rect x="12" y="12" width="106" height="76" rx="6" fill="#bfe6ff"/><path d="M65 12 V88 M12 50 H118" stroke="#fff" stroke-width="5"/></svg>` });
  // 冰箱（靠西牆）
  dio.addBox({ x: 0, y: 30, w: 96, d: 150, h: 240, color: '#eaf4ff',
    faces: { e: `<svg viewBox="0 0 150 240" width="100%" height="100%" preserveAspectRatio="none"><path d="M6 92 H144" stroke="#c9d8ea" stroke-width="4"/><rect x="18" y="30" width="10" height="44" rx="5" fill="#9fb4cc"/><rect x="18" y="112" width="10" height="60" rx="5" fill="#9fb4cc"/><circle cx="110" cy="40" r="10" fill="#ff8fb8"/><rect x="90" y="140" width="34" height="24" rx="4" fill="#ffd23f"/></svg>` } });
  // 餐桌
  const T = TABLE;
  for (const [x, y] of [[T.x + 8, T.y + 8], [T.x + T.w - 18, T.y + 8], [T.x + 8, T.y + T.d - 18], [T.x + T.w - 18, T.y + T.d - 18]]) dio.addBox({ x, y, w: 10, d: 10, h: T.z, color: '#c98b5e' });
  dio.addBox({ x: T.x, y: T.y, w: T.w, d: T.d, h: 12, z: T.z, color: '#e7a774', cls: 'soft' });
  const top = T.z + 12;
  for (const s of Object.values(SEATS)) dio.addDecal({ ...s.mat, z: top + 0.4, css: 'border-radius:12px;background:#fff6e6' });
  // 家人（玩具人偶）
  const family = {};
  for (const [k, s] of Object.entries(SEATS)) family[k] = dio.addSprite({ x: s.person.x, y: s.person.y, w: 70, h: 134, html: personSvg(k), shadow: 0.6, tap: k });
  const dong = dio.addSprite({ x: 560, y: 160, w: 112, h: 140, html: dongSvg(), shadow: 0.6, tap: 'dong' });
  const shan = dio.addSprite({ x: 560, y: 500, w: 116, h: 132, html: shanSvg(), shadow: 0.7, tap: 'shan' });
  return { dio, chars: { dong, shan }, family, tableTop: top };
}

// ---------------- 我的餐盤 ----------------
const SECTORS = { veg: [0, 130], grain: [130, 220], protein: [220, 300], fruit: [300, 360] };
const PC = { x: 250, y: 250, r: 236 };   // 餐盤在自己的 500×500 SVG 裡的圓心與半徑
function sectorPath(a0, a1, r) {
  const rad = (a) => ((a - 90) * Math.PI) / 180;
  const p = (a) => `${(PC.x + r * Math.cos(rad(a))).toFixed(1)} ${(PC.y + r * Math.sin(rad(a))).toFixed(1)}`;
  return `M${PC.x} ${PC.y} L${p(a0)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)} Z`;
}
function plateSvg(hints) {
  return `<svg viewBox="0 0 500 500"><circle cx="250" cy="250" r="248" fill="#fff" stroke="#e8dcc8" stroke-width="4"/>
    ${Object.entries(SECTORS).map(([k, [a0, a1]]) => `<path d="${sectorPath(a0, a1, 226)}" fill="${PLATE_CATS[k].color}" stroke="#fff" stroke-width="8"/>`).join('')}
    ${hints ? Object.entries(SECTORS).map(([k, [a0, a1]]) => {
      const a = ((a0 + a1) / 2 - 90) * Math.PI / 180;
      return `<g opacity=".28" transform="translate(${PC.x + 150 * Math.cos(a) - 40} ${PC.y + 150 * Math.sin(a) - 40}) scale(.8)">${FOODS[PLATE_CATS[k].hint].svg}</g>`;
    }).join('') : ''}</svg>`;
}

async function plateGame(R) {
  const { say, chk, race, members } = R;
  const P = R.panel('platepanel', { host: 'dong', hostSvg: dongSvg() });
  const el = P.el;
  try {
    const hard = members.includes('yy') && !turnsOn();
    const real = hard ? ['broccoli', 'carrot', 'rice', 'bread', 'egg', 'fish', 'apple', 'grape'] : ['broccoli', 'carrot', 'rice', 'egg', 'apple', 'banana'];
    const items = shuffle([...real, ...(hard ? ['candy', 'cake'] : [])]);
    const easyHints = levelNow(R.profile) === 'easy' || turnsOn();
    el.innerHTML = `<div class="plate-wrap">${plateSvg(easyHints)}</div><div class="food-tray"></div>`;
    const wrap = el.querySelector('.plate-wrap');
    const tray = el.querySelector('.food-tray');
    const placed = { veg: 0, grain: 0, protein: 0, fruit: 0 };
    const needs = {};
    for (const k of real) needs[FOODS[k].cat] = (needs[FOODS[k].cat] || 0) + 1;
    const onPlate = [];
    let left = real.length;
    let lastVoice = 0;
    let done;
    const finished = new Promise((r) => { done = r; });
    const voice = (id) => { if (Date.now() - lastVoice > 2500) { lastVoice = Date.now(); say('dong', id); } };
    // 餐盤座標：舞台座標 → SVG 座標
    const toPlate = (cx, cy) => {
      const r = stageRect(wrap);
      const p = toStage(cx, cy);
      const k = 500 / r.w;
      return { x: (p.x - r.left) * k, y: (p.y - r.top) * k, k, r };
    };
    const slotFor = (cat, n) => {
      const [a0, a1] = SECTORS[cat];
      const total = needs[cat] || 1;
      const a = ((a0 + ((a1 - a0) * (n + 1)) / (total + 1)) - 90) * Math.PI / 180;
      const rr = total > 1 && n % 2 ? 120 : 165;
      return { x: PC.x + rr * Math.cos(a), y: PC.y + rr * Math.sin(a) };
    };
    for (const k of items) {
      const it = div('item', foodSvg(k));
      it.dataset.food = k;
      tray.appendChild(it);
      it.addEventListener('pointerdown', (e) => {
        if (turnsOn() && R.dragging) return;
        R.drag(e, {
          html: foodSvg(k), size: 120, originEl: it,
          onStart: () => it.classList.add('used'),
          onDrop: (cx, cy) => {
            const q = toPlate(cx, cy);
            const dx = q.x - PC.x, dy = q.y - PC.y;
            if (Math.hypot(dx, dy) > PC.r + 20) return null;
            const cat = FOODS[k].cat;
            if (cat === 'junk') { sfx('soft'); voice('plate_junk'); it.dataset.junk = '1'; return null; }
            let ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
            if (ang < 0) ang += 360;
            const sec = Object.keys(SECTORS).find((s) => ang >= SECTORS[s][0] && ang < SECTORS[s][1]);
            if (sec !== cat) { sfx('soft'); voice(`plate_is_${cat}`); return null; }
            const slot = slotFor(cat, placed[cat]);
            placed[cat]++;
            return { x: q.r.left + slot.x / q.k, y: q.r.top + slot.y / q.k, slot };
          },
          onPlaced: async (to) => {
            const f = div('on-plate', foodSvg(k));
            f.style.left = `${wrap.offsetLeft + to.slot.x * (wrap.offsetWidth / 500)}px`;
            f.style.top = `${wrap.offsetTop + to.slot.y * (wrap.offsetHeight / 500)}px`;
            el.appendChild(f);
            onPlate.push(f);
            sfx('pop');
            sfx('sparkle');
            left--;
            if (left === 0) { done(); return; }
            if (turnsOn()) nextTurn();
          },
          onBack: () => { if (it.dataset.junk) { it.classList.add('used'); sfx('whoosh'); } else it.classList.remove('used'); },
        });
      });
    }
    setHint(() => [...tray.querySelectorAll('.item:not(.used)')].find((x) => FOODS[x.dataset.food].cat !== 'junk'));
    await say('dong', hard ? 'plate_go_hard' : 'plate_go');
    chk();
    await callTurn();
    chk();
    await race(finished);
    setHint(null);
    await wait(400);
    // 咚咚開動
    say('dong', 'plate_eat');
    for (const f of onPlate) { await wait(300); f.classList.add('eaten'); sfx('chomp'); }
    await wait(500);
    sfx('burp');
    await wait(400);
    sfx('giggle');
    await say('dong', 'plate_done');
  } finally {
    P.close();
  }
}

// ---------------- 擺餐具 ----------------
async function tableGame(R) {
  const { set, dio, say, chk, race, root, members } = R;
  const hard = members.includes('yy') && !turnsOn();
  const kinds = hard ? ['bowl', 'chopsticks', 'spoon'] : ['bowl', 'chopsticks'];
  dio.lock(true);
  R.rot.show(false);
  if (dio.quadrant() !== 0) await dio.faceQuadrant(0, 600);
  await dio.animateTo({ z: 2.05, px: 365, py: 420 }, 800);
  chk();
  // 桌上的虛線位子
  const slots = [];
  for (const [who, s] of Object.entries(SEATS)) {
    for (const k of kinds) {
      const [x, y] = s.slots[k];
      const [w, h] = SLOT_SIZE[k];
      const d = dio.addDecal({ x: x - w / 2, y: y - h / 2, w, h, z: set.tableTop + 0.8, html: utensilSvg(k, true) });
      slots.push({ who, k, d, filled: false });
    }
  }
  // 托盤：一疊碗、一把把筷子、湯匙
  const tray = div('utray ui');
  const stacks = {};
  for (const k of kinds) {
    const st = div('stack', `${utensilSvg(k)}<span class="n">3</span>`);
    st.dataset.k = k;
    stacks[k] = { el: st, n: 3 };
    tray.appendChild(st);
    st.addEventListener('pointerdown', (e) => {
      if (stacks[k].n <= 0) return;
      R.drag(e, {
        html: utensilSvg(k), size: 100, originEl: st,
        onDrop: (cx, cy) => {
          const p = toStage(cx, cy);
          let best = null, bd = 95;
          for (const s of slots) {
            if (s.filled) continue;
            const r = stageRect(s.d);
            const dd = Math.hypot(r.x - p.x, r.y - p.y);
            if (dd < bd) { bd = dd; best = s; }
          }
          if (!best) return null;
          if (best.k !== k) { sfx('soft'); if (Date.now() - (tableGame.lv || 0) > 2500) { tableGame.lv = Date.now(); say('dong', 'table_wrong'); } return null; }
          best.filled = true;
          const r = stageRect(best.d);
          pending = best;
          return { x: r.x, y: r.y };
        },
        onPlaced: async () => {
          const s = pending;
          s.d.innerHTML = utensilSvg(s.k);
          stacks[k].n--;
          st.querySelector('.n').textContent = stacks[k].n;
          st.classList.toggle('empty', stacks[k].n <= 0);
          sfx('knock');
          R.burstAt(s.d, { n: 10, stars: true, colors: ['#ffd23f', '#fff3a0'] });
          if (slots.filter((x) => x.who === s.who).every((x) => x.filled)) { sfx('giggle'); R.hop(set.family[s.who].el); }
          if (slots.every((x) => x.filled)) { done(); return; }
          if (turnsOn()) nextTurn();
        },
      });
    });
  }
  let pending = null;
  root.appendChild(tray);
  let done;
  const finished = new Promise((r) => { done = r; });
  setHint(() => {
    const s = slots.find((x) => !x.filled);
    return s ? stacks[s.k].el : null;
  });
  try {
    await say('dong', hard ? 'table_go_hard' : 'table_go');
    chk();
    await callTurn();
    chk();
    await race(finished);
    setHint(null);
    sfx('fanfare');
    Object.values(set.family).forEach((f, i) => setTimeout(() => R.hop(f.el), i * 150));
    await say('dong', 'table_done');
    await wait(600);
  } finally {
    tray.remove();
    slots.forEach((s) => s.d.remove());
  }
}

// ---------------- 什麼能摸 ----------------
async function safeGame(R) {
  const { say, chk, race, members } = R;
  const P = R.panel('beltpanel', { host: 'dong', hostSvg: dongSvg() });
  const el = P.el;
  try {
    const hard = members.includes('yy') && !turnsOn();
    const safe = ['apple', 'bread', 'banana', 'milk'];
    const danger = ['pot', 'knife', 'kettle'];
    const n = hard ? 10 : 8;
    const nd = hard ? 4 : 3;
    // 第一個一定是安全的；危險的不會連續三個
    let seq;
    for (let tries = 0; tries < 50; tries++) {
      seq = shuffle([...Array(n - nd)].map((_, i) => safe[i % safe.length]).concat([...Array(nd)].map((_, i) => danger[i % danger.length])));
      const bad = !KITCHEN_ITEMS[seq[0]].safe || seq.some((x, i) => i >= 2 && !KITCHEN_ITEMS[x].safe && !KITCHEN_ITEMS[seq[i - 1]].safe && !KITCHEN_ITEMS[seq[i - 2]].safe);
      if (!bad) break;
    }
    el.innerHTML = `<div class="belt"></div><div class="belt-basket">${ICON2.basket}</div>`;
    const basket = el.querySelector('.belt-basket');
    basket.querySelector('svg').setAttribute('width', '100%');
    const dur = hard ? 3400 : 4400;
    await say('dong', 'safe_go');
    chk();
    await callTurn();
    chk();
    let skipGood = 0;
    for (let i = 0; i < seq.length; i++) {
      chk();
      const k = seq[i];
      const info = KITCHEN_ITEMS[k];
      const it = div('kitem-sp', kitchenItemSvg(k));
      if (turnsOn()) { it.classList.add('turn-c'); it.style.setProperty('--tc', KIDS[whoseTurn()].color); }
      it.style.left = '960px';
      el.appendChild(it);
      void it.offsetWidth;
      it.style.transition = `left ${dur}ms linear`;
      it.style.left = '-170px';
      sfx('slide');
      setHint(() => (info.safe ? it : null));
      const res = await race(new Promise((resolve) => {
        let touched = false;
        const t = setTimeout(() => resolve(touched ? 'touched' : 'passed'), dur + 50);
        it.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          if (info.safe) {
            clearTimeout(t);
            const cur = it.getBoundingClientRect();
            const pr = el.getBoundingClientRect();
            const sc = el.offsetWidth / pr.width;
            it.style.transition = 'none';
            it.style.left = `${(cur.left - pr.left) * sc}px`;
            void it.offsetWidth;
            it.style.transition = 'left .45s ease, top .45s ease, transform .45s';
            it.style.left = '30px';
            it.style.top = '230px';
            it.style.transform = 'scale(.6)';
            resolve('got');
          } else if (!touched) {
            touched = true;
            it.classList.add('danger-hit');
            sfx('soft');
            say('dong', info.line);
          }
        });
      }));
      if (res === 'got') {
        sfx('pop');
        sfx('sparkle');
        R.burstAt(basket, { n: 12, stars: true, colors: ['#ffd23f', '#fff3a0'] });
        await wait(480);
        it.remove();
      } else {
        it.remove();
        if (res === 'passed' && !info.safe) {
          sfx('sparkle');
          if (skipGood++ % 2 === 0) say('dong', 'safe_skip_good');
        }
      }
      if (turnsOn() && i < seq.length - 1) nextTurn({ say: false });
      await wait(350);
    }
    setHint(null);
    await wait(500);
    await say('dong', 'safe_done');
  } finally {
    P.close();
  }
}
