// 節慶舞台（11/25）：城市名人堂前面的廣場，節慶期間才搭起來。生日、春節、兒童節、母親節、端午、父親節、中秋、萬聖節、聖誕節、家人生日。
// 每個節日三～四個小活動，照 ADHD 原則：一關 1～2 分鐘、有進度點、錯兩次亮答案、問題不用等講完。
// 三種活動：學習俗、學生活知識、岳岳動身體或玩音樂／愷愷觀察或排空間。全部做完拿一張紀念貼紙（節慶相簿）。
import { runRoom } from './room-base.js';
import { sortGame, findGame, stepsGame, roundDots } from './kit.js';
import { drumRound } from './living.js';
import { createDiorama } from '../engine/diorama.js';
import { div, wait, shuffle, pick, toStage, stageRect, burst, stageW } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { turnsOn, callTurn, nextTurn, whoseTurn, levelNow } from '../core/turns.js';
import { setHint } from '../core/session.js';
import { KIDS } from '../config.js';
import * as fest from '../core/festival.js';
import { shanSvg, kidSvg, kidHead } from '../art/stars.js';
import { personSvg, numSvg, kitchenItemSvg, dongSvg } from '../art/more.js';
import { itemSvg, baobaoSvg, duoduoSvg } from '../art/town.js';
import { huahuaSvg, trashBagSvg } from '../art/world.js';
import { xieSvg } from '../art/doctor.js';
import { FICON, FEST_SIGN, FEST_COLOR } from '../art/festival.js';
import { CAST, CAST_BY_ID } from '../data/cast.js';

const Y = () => fest.year();
const hardSolo = (R) => R.members.length === 1 && R.members[0] === 'yy';
const isHard = (R) => levelNow(R.profile) === 'hard';
const tree = (c = '#4fbf6e') => `<svg viewBox="0 0 80 110"><rect x="34" y="70" width="12" height="38" rx="5" fill="#a9744f"/><circle cx="40" cy="48" r="34" fill="${c}"/></svg>`;

// ======================= 共用小工具 =======================
// 選圖片（燈謎、故事問題）：錯一次拿掉一個錯的，錯兩次對的發亮（岳岳也一樣）
function picChoice(R, box, opts, ok, host) {
  return R.race(new Promise((resolve) => {
    box.innerHTML = shuffle(opts).map(([k, html]) => `<button class="fx-pick" data-k="${k}">${html}</button>`).join('');
    box.classList.add('show');
    const btns = [...box.querySelectorAll('.fx-pick')];
    const right = btns.find((b) => b.dataset.k === ok);
    let wrongs = 0;
    setHint(() => right);
    box.onpointerdown = (e) => {
      const b = e.target.closest('.fx-pick');
      if (!b || b.disabled) return;
      e.stopPropagation();
      if (b === right) { sfx('fanfare'); R.burstAt(b, { n: 16, stars: true }); b.classList.add('right'); box.onpointerdown = null; setTimeout(() => { box.classList.remove('show'); resolve(wrongs === 0); }, 700); return; }
      wrongs++;
      sfx('soft');
      b.disabled = true;
      b.classList.add('gone');
      R.say(host, 'fx_try');
      if (wrongs >= 2) right.classList.add('glowy-2d');
    };
  }));
}
// 按住吸氣、放開吐氣（打針前的深呼吸那一套）：至少按 1.6 秒才算
function breath(R, btn, { onIn, onOut, holdMs = 1600, host = 'shan', slow = 'fx_slow' } = {}) {
  return R.race(new Promise((resolve) => {
    let t0 = 0, last = 0;
    btn.classList.add('glowy-2d');
    setHint(() => btn);
    const down = (e) => { e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch { /* 沒關係 */ } t0 = Date.now(); btn.classList.add('hold'); sfx('breathIn'); onIn?.(); };
    const up = () => {
      if (!t0) return;
      const held = Date.now() - t0;
      t0 = 0;
      btn.classList.remove('hold');
      if (held >= holdMs) { btn.removeEventListener('pointerdown', down); btn.removeEventListener('pointerup', up); btn.removeEventListener('pointercancel', up); btn.classList.remove('glowy-2d'); setHint(null); sfx('breathOut'); onOut?.(); resolve(); }
      else { onOut?.(true); if (Date.now() - last > 3000) { last = Date.now(); R.say(host, slow); } }
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
  }));
}
// 跟著拍子打鼓／拍手（舞台、划龍舟、走秀、唱生日歌）：每打中一下 onHit(第幾下)
async function rhythm(R, { bpm = 92, onHit = null, icon = null, box = null } = {}) {
  const lane = div('lane fx-lane', '<div class="hit"></div>');
  const drum = document.createElement('button');
  drum.className = 'bigbtn ui fx-drum';
  drum.innerHTML = icon || `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="36" rx="38" ry="14" fill="#fff3c4"/><path d="M12 36 V70 Q50 90 88 70 V36" fill="#ff5d73"/><ellipse cx="50" cy="36" rx="38" ry="14" fill="none" stroke="#c9444f" stroke-width="4"/></svg>`;
  (box || R.root).append(lane, drum);
  try {
    const hard = isHard(R);
    return await drumRound(R, lane, drum, { bpm: hard ? bpm + 12 : bpm, win: hard ? 0.24 : 0.32, extra: hard, onHit });
  } finally { lane.remove(); drum.remove(); }
}
// 做卡片：把三張貼紙貼到卡片上（貼哪裡都可以），再按麥克風，跟著角色把祝福說出來
// occ：生日 bd、母親節 mo、父親節 fa、感謝 thx；to：給誰
const CARD_STICKERS = {
  bd: ['cake', 'balloon', 'gift', 'candle'], mo: ['carnation', 'helper', 'card', 'balloon'], fa: ['tie', 'helper', 'card', 'balloon'], thx: ['helper', 'card', 'tree', 'cookie'],
};
async function cardGame(R, { to, occ, host = 'shan', sayLine }) {
  const { say, chk, race } = R;
  const P = R.panel('cardpanel', { host, hostSvg: CAST_BY_ID[host]?.svg() || shanSvg() });
  const el = P.el;
  try {
    const face = to === 'yy' || to === 'kk' ? kidHead(to, 150) : personSvg(to);
    el.innerHTML = `<div class="fx-card"><div class="fx-card-to">${face}</div><div class="fx-card-art"></div></div>
      <div class="fx-palette">${CARD_STICKERS[occ].map((k) => `<div class="fx-st" data-k="${k}">${FICON[k]}</div>`).join('')}</div>`;
    const card = el.querySelector('.fx-card'), art = el.querySelector('.fx-card-art');
    const dots = roundDots(el, 3, 'tr');
    await say(host, `fx_card_go_${occ}`);
    chk();
    if (turnsOn()) { await callTurn(); chk(); }
    let n = 0;
    setHint(() => el.querySelector('.fx-st'));
    await race(new Promise((resolve) => {
      el.addEventListener('pointerdown', (e) => {
        const st = e.target.closest('.fx-st');
        if (!st || n >= 3) return;
        const k = st.dataset.k;
        R.drag(e, {
          html: FICON[k], size: 110, originEl: st,
          onDrop: (cx, cy) => {
            const r = stageRect(card), p = toStage(cx, cy);
            if (Math.abs(p.x - r.x) > r.w / 2 || Math.abs(p.y - r.y) > r.h / 2) return null;
            return p;
          },
          onPlaced: (p) => {
            const r = stageRect(card);
            const s = div('fx-on', FICON[k]);
            s.style.left = `${(p.x - r.left) - 45}px`; s.style.top = `${(p.y - r.top) - 45}px`;
            art.appendChild(s);
            sfx('pop'); sfx('sparkle');
            n++;
            dots.set(n);
            if (n >= 3) { setHint(null); resolve(); return; }
            if (turnsOn()) nextTurn({ say: false });
          },
        });
      });
    }));
    chk();
    // 說出祝福：點麥克風 → 角色先說一次 → 換你大聲說 → 再點一下（或 5 秒後）就好了
    const mic = div('fx-mic glowy-2d', FICON.mic);
    el.appendChild(mic);
    setHint(() => mic);
    await say(host, 'fx_card_say');
    chk();
    await race(new Promise((r) => mic.addEventListener('pointerdown', r, { once: true })));
    mic.classList.remove('glowy-2d');
    mic.classList.add('on');
    await say(host, sayLine);
    chk();
    await say(host, 'fx_card_you');
    chk();
    await race(Promise.race([wait(5000), new Promise((r) => mic.addEventListener('pointerdown', r, { once: true }))]));
    mic.classList.remove('on');
    sfx('applause');
    R.burstAt(card, { n: 26, stars: true, colors: ['#ff8fb8', '#ffd23f', '#fff3a0'] });
    dots.done();
    await say(host, 'fx_card_done');
    await wait(300);
  } finally { setHint(null); P.close(); }
}

// ======================= 生日 =======================
const cakeSvg = () => `<svg viewBox="0 0 400 260" width="100%" height="100%"><ellipse cx="200" cy="236" rx="190" ry="20" fill="#c9d3de"/>
  <rect x="40" y="110" width="320" height="120" rx="20" fill="#ffb3cf"/><ellipse cx="200" cy="110" rx="160" ry="44" fill="#fff"/><path d="M40 118 q20 22 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="#fff"/>
  ${[80, 140, 200, 260, 320].map((x) => `<circle cx="${x}" cy="180" r="12" fill="#ff5d73"/>`).join('')}</svg>`;
async function cakeGame(R, kid) {
  const { say, chk, race } = R;
  const P = R.panel('cakepanel', { host: 'dong', hostSvg: dongSvg() });
  const el = P.el;
  try {
    const need = Math.max(1, Math.min(10, fest.ageOf(kid) || (kid === 'yy' ? 8 : 5)));
    el.innerHTML = `<div class="fx-cake">${cakeSvg()}</div><div class="fx-count"></div>`;
    const cake = el.querySelector('.fx-cake'), count = el.querySelector('.fx-count');
    const dots = roundDots(el, need, 'tr');
    await say('dong', `bd_cake_go_${kid}`);
    chk();
    let n = 0;
    setHint(() => cake);
    await race(new Promise((resolve) => {
      cake.addEventListener('pointerdown', (e) => {
        if (n >= need) return;
        const r = cake.getBoundingClientRect(), k = cake.offsetWidth / r.width;
        let x = (e.clientX - r.left) * k, y = (e.clientY - r.top) * k;
        // 蠟燭只插在蛋糕上面那一圈白色奶油（蛋糕圖放大 1.5 倍：奶油在 x 105～495、y 120～195）
        x = Math.max(105, Math.min(495, x)); y = Math.max(120, Math.min(195, y));
        const c = div('fx-candle', FICON.candle);
        c.style.left = `${x - 22}px`; c.style.top = `${y - 92}px`;
        cake.appendChild(c);
        n++;
        sfx('pop');
        count.innerHTML = numSvg(n, { bg: '#fff', color: '#4a3b6b' });
        R.hop(count, 'hop');
        say('bibi', `n_${n}`);
        dots.set(n);
        if (n >= need) resolve();
      });
    }));
    chk();
    await wait(700);
    sfx('fanfare');
    R.burstAt(cake, { n: 20, stars: true });
    await say('dong', `bd_cake_done_${kid}`);
    await wait(300);
  } finally { setHint(null); P.close(); }
}
async function blowGame(R, kid) {
  const { say, chk } = R;
  const P = R.panel('cakepanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    const need = Math.max(1, Math.min(10, fest.ageOf(kid) || (kid === 'yy' ? 8 : 5)));
    el.innerHTML = `<div class="fx-cake lit">${cakeSvg()}${[...Array(need)].map((_, i) => `<div class="fx-candle" style="left:${110 + (i + 0.5) * (380 / need) - 22}px;top:${(i % 2 ? 62 : 80)}px">${FICON.candle}</div>`).join('')}</div>
      <button class="fx-breath">${FICON.wish}</button>`;
    const cake = el.querySelector('.fx-cake'), btn = el.querySelector('.fx-breath');
    // 1. 許願：按住星星，閉上眼睛想一個願望
    await say('shan', 'bd_wish');
    chk();
    await breath(R, btn, { holdMs: 2500, onIn: () => el.classList.add('wishing'), onOut: () => el.classList.remove('wishing') });
    chk();
    sfx('star');
    // 2. 吹蠟燭：按住吸一大口氣，放開「呼——」
    btn.innerHTML = FICON.balloon;
    await say('shan', 'bd_blow');
    chk();
    await breath(R, btn, { onIn: () => btn.classList.add('puff') , onOut: () => btn.classList.remove('puff') });
    chk();
    cake.classList.remove('lit');
    sfx('whoosh');
    await wait(400);
    playMusic('fest_birthday');
    sfx('applause');
    burst(stageW() / 2, 380, { n: 40, spread: 340 });
    await say('shan', `bd_blown_${kid}`);
    await wait(1500);
  } finally { setHint(null); P.close(); playMusic(R.music()); }
}
async function giftGame(R, { line = 'bd_gift_open', after = null } = {}) {
  const { say, chk, race } = R;
  const P = R.panel('giftpanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    el.innerHTML = `<div class="fx-gift">${FICON.gift}</div><div class="fx-prize"></div>`;
    const g = el.querySelector('.fx-gift'), prize = el.querySelector('.fx-prize');
    prize.innerHTML = `<svg viewBox="0 0 100 80" width="100%" height="100%"><path d="M10 70 L18 22 L36 46 L50 14 L64 46 L82 22 L90 70Z" fill="#ffd23f"/><rect x="10" y="64" width="80" height="12" rx="4" fill="#ffb627"/><circle cx="50" cy="44" r="6" fill="#ff5d73"/><circle cx="30" cy="56" r="5" fill="#3ec7e0"/><circle cx="70" cy="56" r="5" fill="#4cd07d"/></svg>`;
    await say('shan', 'bd_gift_go');
    chk();
    const dots = roundDots(el, 3, 'tr');
    // 點三下：拆緞帶、打開蓋子、拿出來
    for (let i = 0; i < 3; i++) {
      g.classList.add('glowy-2d');
      setHint(() => g);
      await race(new Promise((r) => g.addEventListener('pointerdown', r, { once: true })));
      chk();
      sfx(['scrub', 'open', 'fanfare'][i]);
      g.classList.remove('glowy-2d');
      g.classList.add(`s${i + 1}`);
      R.hop(g, 'shake');
      dots.set(i + 1);
      if (turnsOn() && i < 2) nextTurn({ say: false });
      await wait(400);
    }
    prize.classList.add('show');
    R.burstAt(prize, { n: 30, stars: true, colors: ['#ffd23f', '#fff3a0', '#ff8fb8'] });
    await say('shan', line);
    chk();
    if (after && fest.realGift()) await say('shan', after);
    await wait(600);
  } finally { setHint(null); P.close(); }
}

// ======================= 春節 =======================
// 貼春聯：門上有兩個長長的、一個橫的、一個菱形的位置，照形狀放；「福」要先點一下倒過來（福到了）
async function coupletGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('coupletpanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    const red = (w, h, inner = '') => `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%"><rect width="${w}" height="${h}" rx="6" fill="#e53935"/>${inner}</svg>`;
    const goldLines = (w, h) => [...Array(Math.round(h / w))].map((_, i) => `<path d="M${w * 0.25} ${w * (i + 0.5)} q${w * 0.25} ${-w * 0.2} ${w * 0.5} 0 M${w / 2} ${w * (i + 0.2)} v${w * 0.6}" stroke="#ffd23f" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('');
    const PIECES = {
      left: { slot: [250, 150, 80, 330], html: red(80, 330, goldLines(80, 330)) },
      right: { slot: [610, 150, 80, 330], html: red(80, 330, goldLines(80, 330)) },
      top: { slot: [330, 70, 280, 70], html: red(280, 70, [0, 1, 2, 3].map((i) => `<circle cx="${45 + i * 63}" cy="35" r="18" fill="none" stroke="#ffd23f" stroke-width="5"/>`).join('')) },
      fu: { slot: [420, 250, 100, 100], html: FICON.fu },
    };
    el.innerHTML = `<div class="fx-door">${FICON.door}</div>${Object.entries(PIECES).map(([k, p]) => `<div class="fx-slot ${k}" data-k="${k}" style="left:${p.slot[0]}px;top:${p.slot[1]}px;width:${p.slot[2]}px;height:${p.slot[3]}px"></div>`).join('')}
      <div class="fx-tray">${shuffle(Object.keys(PIECES)).map((k) => `<div class="fx-piece ${k}" data-k="${k}">${PIECES[k].html}</div>`).join('')}</div>`;
    const dots = roundDots(el, 4, 'tr');
    await say('shan', 'cn_couplet_go');
    chk();
    await callTurn();
    chk();
    let placed = 0, fuFlipped = false, wrongs = 0;
    setHint(() => el.querySelector('.fx-piece:not(.used)'));
    await race(new Promise((resolve) => {
      el.addEventListener('pointerdown', (e) => {
        const pc = e.target.closest('.fx-piece');
        if (!pc || pc.classList.contains('used')) return;
        const k = pc.dataset.k;
        // 「福」：還沒倒過來時，點一下先倒過來
        if (k === 'fu' && !fuFlipped) { fuFlipped = true; pc.classList.add('flip'); sfx('boing'); say('shan', 'cn_fu_flip'); return; }
        R.drag(e, {
          html: pc.innerHTML, size: k === 'top' ? 200 : 120, originEl: pc,
          onStart: () => pc.classList.add('dragging'),
          onDrop: (cx, cy) => {
            const p = toStage(cx, cy);
            let best = null;
            for (const s of el.querySelectorAll('.fx-slot:not(.filled)')) { const r = stageRect(s); if (Math.abs(p.x - r.x) < r.w / 2 + 40 && Math.abs(p.y - r.y) < r.h / 2 + 40) best = s; }
            if (!best) return null;
            const ok = best.dataset.k === k || (k === 'left' && best.dataset.k === 'right') || (k === 'right' && best.dataset.k === 'left');
            if (!ok) { sfx('soft'); say('shan', 'cn_couplet_shape'); if (++wrongs >= 2) el.querySelectorAll(`.fx-slot:not(.filled)`).forEach((s) => s.classList.toggle('glowy-2d', s.dataset.k === k || (k !== 'top' && k !== 'fu' && (s.dataset.k === 'left' || s.dataset.k === 'right')))); return null; }
            if (k === 'fu' && !fuFlipped) return null;
            best.classList.add('filled');
            best.innerHTML = pc.innerHTML;
            if (k === 'fu') best.classList.add('flip');
            const r = stageRect(best);
            return { x: r.x, y: r.y };
          },
          onPlaced: () => {
            pc.classList.add('used');
            el.querySelectorAll('.fx-slot').forEach((s) => s.classList.remove('glowy-2d'));
            wrongs = 0;
            sfx('pop'); sfx('sparkle');
            placed++;
            dots.set(placed);
            if (placed >= 4) { resolve(); return; }
            if (turnsOn()) nextTurn({ say: false });
          },
          onBack: () => pc.classList.remove('dragging'),
        });
      });
    }));
    chk();
    setHint(null);
    sfx('fanfare');
    burst(stageW() / 2, 400, { n: 30, colors: ['#e53935', '#ffd23f'] });
    await say('shan', 'cn_couplet_done');
    await wait(300);
  } finally { setHint(null); P.close(); }
}
// 拿紅包：阿嬤、爸爸、媽媽各給一個。先說吉祥話（按麥克風跟著說）→ 兩手接紅包 → 說謝謝 → 存進多多的存錢筒
async function redPacketGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('redpanel', { host: 'duoduo', hostSvg: duoduoSvg() });
  const el = P.el;
  try {
    const elders = ['grandma', 'dad', 'mom'];
    const dots = roundDots(el, elders.length, 'tr');
    await say('duoduo', 'cn_red_go');
    chk();
    for (let r = 0; r < elders.length; r++) {
      dots.set(r);
      if (turnsOn()) { await callTurn(); chk(); }
      const who = whoseTurn() || R.members[0];
      el.querySelectorAll('.fx-elder,.fx-red,.fx-hands,.fx-pig,.fx-mic').forEach((x) => x.remove());
      el.insertAdjacentHTML('beforeend', `<div class="fx-elder">${personSvg(elders[r])}</div><div class="fx-red">${FICON.redpacket}</div>
        <div class="fx-hands">${kidHead(who, 140)}</div><div class="fx-pig">${duoduoSvg()}</div><div class="fx-mic glowy-2d">${FICON.mic}</div>`);
      const mic = el.querySelector('.fx-mic'), red = el.querySelector('.fx-red'), hands = el.querySelector('.fx-hands'), pig = el.querySelector('.fx-pig');
      // 1. 說吉祥話
      setHint(() => mic);
      if (r === 0) say('duoduo', 'cn_red_say');
      await race(new Promise((res) => mic.addEventListener('pointerdown', res, { once: true })));
      chk();
      mic.classList.remove('glowy-2d');
      mic.classList.add('on');
      await say('shan', ['cn_greet_1', 'cn_greet_2', 'cn_greet_3'][r]);
      chk();
      await wait(1800);   // 換小孩大聲說一次
      mic.remove();
      // 2. 兩手接紅包、說謝謝
      red.classList.add('glowy-2d', 'give');
      setHint(() => red);
      await race(new Promise((res) => {
        red.addEventListener('pointerdown', (e) => {
          R.drag(e, { html: FICON.redpacket, size: 110, originEl: red,
            onStart: () => red.classList.add('used'),
            onDrop: (cx, cy) => { const p = toStage(cx, cy), h = stageRect(hands); return Math.hypot(p.x - h.x, p.y - h.y) < 150 ? { x: h.x, y: h.y } : null; },
            onPlaced: () => res(), onBack: () => red.classList.remove('used') });
        });
      }));
      chk();
      red.remove();
      sfx('sparkle');
      await say('duoduo', 'cn_red_thanks');
      chk();
      // 3. 存進存錢筒
      const coin = div('fx-coin glowy-2d', itemSvg('coin10'));
      el.appendChild(coin);
      setHint(() => coin);
      await race(new Promise((res) => {
        coin.addEventListener('pointerdown', (e) => {
          R.drag(e, { html: itemSvg('coin10'), size: 90, originEl: coin,
            onStart: () => coin.classList.add('used'),
            onDrop: (cx, cy) => { const p = toStage(cx, cy), h = stageRect(pig); return Math.hypot(p.x - h.x, p.y - h.y) < 160 ? { x: h.x, y: h.y - 30 } : null; },
            onPlaced: () => res(), onBack: () => coin.classList.remove('used') });
        });
      }));
      chk();
      coin.remove();
      sfx('ding');
      R.hop(pig, 'hop');
      R.burstAt(pig, { n: 14, stars: true, colors: ['#ffd23f', '#fff3a0'] });
      if (r === 0) { await say('duoduo', 'cn_red_save'); chk(); }
      if (turnsOn() && r < elders.length - 1) nextTurn({ say: false });
    }
    dots.done();
    await say('duoduo', 'cn_red_done');
  } finally { setHint(null); P.close(); }
}
// 元宵猜燈謎：燈籠上是剪影，聽謎語，選對的圖
const RIDDLES = [
  ['apple', () => itemSvg('apple'), [['carrot', () => itemSvg('carrot')], ['ball', () => FICON.balloon]]],
  ['rabbit', () => FICON.rabbit, [['cow', () => itemSvg('cow')], ['chicken', () => itemSvg('chicken')]]],
  ['moon', () => FICON.moon, [['sun', () => itemSvg('sun')], ['egg', () => FICON.egg]]],
  ['redpacket', () => FICON.redpacket, [['card', () => FICON.card], ['gift', () => FICON.gift]]],
];
async function riddleGame(R) {
  const { say, chk } = R;
  const P = R.panel('riddlepanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    const qs = shuffle(RIDDLES).slice(0, hardSolo(R) ? 4 : 3);
    el.innerHTML = `<div class="fx-lantern">${FICON.lantern}<div class="fx-sil"></div></div><div class="fx-picks"></div>`;
    const sil = el.querySelector('.fx-sil'), picks = el.querySelector('.fx-picks');
    const dots = roundDots(el, qs.length, 'tr');
    await say('shan', 'cn_riddle_go');
    chk();
    for (let r = 0; r < qs.length; r++) {
      dots.set(r);
      if (turnsOn()) { await callTurn(); chk(); }
      const [k, art, wrong] = qs[r];
      sil.innerHTML = art();
      sil.classList.remove('show');
      say('shan', `cn_riddle_${k}`);
      // 愷愷兩個選一個，岳岳三個選一個
      const opts = [[k, art()], ...wrong.slice(0, isHard(R) ? 2 : 1).map(([w, a]) => [w, a()])];
      await picChoice(R, picks, opts, k, 'shan');
      chk();
      sil.classList.add('show');
      sfx('sparkle');
      await wait(900);
      if (turnsOn() && r < qs.length - 1) nextTurn({ say: false });
    }
    dots.done();
    sfx('fanfare');
    await say('shan', 'cn_riddle_done');
  } finally { setHint(null); P.close(); }
}

// ======================= 端午 =======================
// 立蛋：手指按住蛋、不要動，數到三蛋就站起來（「先停一下」）
async function eggGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('eggpanel', { host: 'dong', hostSvg: dongSvg() });
  const el = P.el;
  try {
    const rounds = 3;
    const dots = roundDots(el, rounds, 'tr');
    await say('dong', 'dr_egg_go');
    chk();
    for (let r = 0; r < rounds; r++) {
      dots.set(r);
      if (turnsOn()) { await callTurn(); chk(); }
      el.querySelectorAll('.fx-egg').forEach((x) => x.remove());
      const egg = div('fx-egg tilt glowy-2d', FICON.egg);
      el.appendChild(egg);
      setHint(() => egg);
      const need = isHard(R) ? 3000 : 2200;
      let lastV = 0;
      await race(new Promise((resolve) => {
        let t0 = 0, sx = 0, sy = 0, timer = null, tick = null;
        const stop = (moved) => {
          clearTimeout(timer); clearInterval(tick);
          if (!t0) return;
          t0 = 0;
          egg.classList.remove('holding');
          egg.style.setProperty('--k', 0);
          if (moved && Date.now() - lastV > 2500) { lastV = Date.now(); sfx('soft'); say('dong', 'dr_egg_still'); }
        };
        egg.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          try { egg.setPointerCapture(e.pointerId); } catch { /* 沒關係 */ }
          t0 = Date.now(); sx = e.clientX; sy = e.clientY;
          egg.classList.add('holding');
          sfx('tick');
          tick = setInterval(() => { const k = Math.min(1, (Date.now() - t0) / need); egg.style.setProperty('--k', k); sfx('tick'); }, need / 3);
          timer = setTimeout(() => { clearInterval(tick); t0 = 0; egg.classList.remove('holding', 'tilt', 'glowy-2d'); egg.classList.add('up'); resolve(); }, need);
        });
        egg.addEventListener('pointermove', (e) => { if (t0 && Math.hypot(e.clientX - sx, e.clientY - sy) > 18) stop(true); });
        egg.addEventListener('pointerup', () => stop(false));
        egg.addEventListener('pointercancel', () => stop(false));
      }));
      chk();
      setHint(null);
      sfx('fanfare');
      R.burstAt(el.querySelector('.fx-egg'), { n: 16, stars: true });
      await say('dong', r === rounds - 1 ? 'dr_egg_done' : 'dr_egg_up');
      chk();
      if (turnsOn() && r < rounds - 1) nextTurn({ say: false });
    }
  } finally { setHint(null); P.close(); }
}
// 划龍舟：跟著鼓聲打拍子，打中一下船往前划一點
async function boatGame(R) {
  const { say, chk } = R;
  const P = R.panel('boatpanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    el.innerHTML = `<div class="fx-river"></div><div class="fx-boat">${FICON.boat}</div><div class="fx-finish"></div>`;
    const boat = el.querySelector('.fx-boat');
    await say('shan', 'dr_boat_go');
    chk();
    if (turnsOn()) { await callTurn(); chk(); }
    const hits = await rhythm(R, { box: el, bpm: 96, onHit: (n) => { boat.style.left = `${40 + Math.min(9, n) * 70}px`; sfx('whoosh'); } });
    chk();
    boat.style.left = '680px';
    sfx('fanfare');
    burst(stageW() / 2, 360, { n: 30, colors: ['#4cd07d', '#ff8a3d', '#ffd23f'] });
    await say('shan', hits >= 5 ? 'dr_boat_great' : 'dr_boat_ok');
  } finally { setHint(null); P.close(); }
}

// ======================= 中秋 =======================
async function moonStory(R) {
  const { say, chk, race } = R;
  const P = R.panel('storypanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    const panels = [[FICON.moon, FICON.rabbit], [FICON.rabbit, FICON.mooncake], [personSvg('grandma'), FICON.moon, FICON.pomelo]];
    el.innerHTML = `<div class="spanels">${panels.map((p, i) => `<div class="sp" data-i="${i}">${p.map((h) => `<span class="fx-sp">${h}</span>`).join('')}</div>`).join('')}</div><div class="squiz"></div>`;
    const sp = [...el.querySelectorAll('.sp')];
    await say('shan', 'md_story_go');
    chk();
    for (let i = 0; i < 3; i++) {
      sp[i].classList.add('glowy-2d');
      setHint(() => sp[i]);
      if (i > 0) await race(new Promise((r) => sp[i].addEventListener('pointerdown', r, { once: true })));
      chk();
      sfx('pop');
      sp[i].classList.remove('glowy-2d');
      sp[i].classList.add('on');
      await say('shan', `md_story_${i + 1}`);
      chk();
    }
    if (turnsOn()) { await callTurn(); chk(); }
    say('shan', 'md_story_q');
    await picChoice(R, el.querySelector('.squiz'), [['rabbit', FICON.rabbit], ['cow', itemSvg('cow')], ['chicken', itemSvg('chicken')]], 'rabbit', 'shan');
    chk();
    await say('shan', 'md_story_done');
  } finally { setHint(null); P.close(); }
}
// 分月餅、分柚子：每個盤子一樣多
async function shareGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('sharepanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    const fam = ['dad', 'mom', 'grandma'];
    const kidsIn = R.members.length > 1 ? R.members : [R.members[0]];
    const people = [...fam.slice(0, 4 - kidsIn.length), ...kidsIn];
    const rounds = [['mooncake', 1], ['pomelo', hardSolo(R) ? 2 : 1]];
    await say('shan', 'md_share_go');
    chk();
    for (let r = 0; r < rounds.length; r++) {
      if (turnsOn()) { await callTurn(); chk(); }
      const [food, each] = rounds[r];
      const total = people.length * each;
      el.innerHTML = '';
      roundDots(el, rounds.length, 'tr').set(r);
      el.insertAdjacentHTML('beforeend', `<div class="fx-plates">${people.map((p) => `<div class="fx-plate" data-p="${p}"><div class="fx-who">${p === 'yy' || p === 'kk' ? kidHead(p, 90) : personSvg(p)}</div><div class="fx-on-plate"></div></div>`).join('')}</div>
        <div class="fx-pile">${[...Array(total)].map(() => `<div class="fx-food">${food === 'pomelo' ? FICON.pomelo : FICON.mooncake}</div>`).join('')}</div>`);
      await say('shan', each > 1 ? 'md_share_two' : `md_share_${food}`);
      chk();
      const plates = [...el.querySelectorAll('.fx-plate')];
      let left = total, wrongs = 0;
      setHint(() => el.querySelector('.fx-food:not(.used)'));
      await race(new Promise((resolve) => {
        // 每一輪換掉監聽（不用 addEventListener 疊上去，否則第二輪會拿到上一輪的盤子）
        el.onpointerdown = (e) => {
          const f = e.target.closest('.fx-food');
          if (!f || f.classList.contains('used')) return;
          R.drag(e, { html: f.innerHTML, size: 90, originEl: f,
            onStart: () => f.classList.add('used'),
            onDrop: (cx, cy) => {
              const p = toStage(cx, cy);
              const pl = plates.find((x) => { const q = stageRect(x); return Math.abs(p.x - q.x) < q.w / 2 && Math.abs(p.y - q.y) < q.h / 2; });
              if (!pl) return null;
              if (pl.querySelectorAll('.fx-mini').length >= each) {
                sfx('soft'); say('shan', 'md_share_enough');
                if (++wrongs >= 2) plates.forEach((x) => x.classList.toggle('glowy-2d', x.querySelectorAll('.fx-mini').length < each));
                return null;
              }
              const q = stageRect(pl);
              f._pl = pl;
              return { x: q.x, y: q.y };
            },
            onPlaced: () => {
              f._pl.querySelector('.fx-on-plate').insertAdjacentHTML('beforeend', `<i class="fx-mini">${f.innerHTML}</i>`);
              f.remove();
              plates.forEach((x) => x.classList.remove('glowy-2d'));
              wrongs = 0;
              sfx('pop');
              if (--left <= 0) { el.onpointerdown = null; resolve(); }
              else if (turnsOn()) nextTurn({ say: false });
            },
            onBack: () => f.classList.remove('used') });
        };
      }));
      chk();
      sfx('fanfare');
      R.burstAt(el.querySelector('.fx-plates'), { n: 20, stars: true });
      await say('shan', 'md_share_same');
      chk();
      if (turnsOn() && r < rounds.length - 1) nextTurn({ say: false });
    }
  } finally { setHint(null); P.close(); }
}
// 月亮慢慢變圓：照順序排（愷愷 3 張，岳岳 5 張）
const moonPhase = (k) => {
  // k：0 新月 → 1 滿月；用兩個圓疊出亮的部分
  const off = 80 - k * 80;
  return `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="40" fill="#3b3480"/><clipPath id="mp${Math.round(k * 100)}"><circle cx="50" cy="50" r="40"/></clipPath>
    <g clip-path="url(#mp${Math.round(k * 100)})"><circle cx="50" cy="50" r="40" fill="#ffe27a"/><circle cx="${50 - off}" cy="50" r="40" fill="#3b3480"/></g></svg>`;
};
async function phaseGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('phasepanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    const ks = hardSolo(R) ? [0.15, 0.35, 0.55, 0.78, 1] : [0.2, 0.55, 1];
    el.innerHTML = `<div class="fx-slots">${ks.map(() => '<div class="fx-pslot"></div>').join('')}</div><div class="fx-moons">${shuffle(ks.map((k, i) => i)).map((i) => `<button class="fx-moon" data-i="${i}">${moonPhase(ks[i])}</button>`).join('')}</div>`;
    const slots = [...el.querySelectorAll('.fx-pslot')], moons = [...el.querySelectorAll('.fx-moon')];
    await say('shan', 'md_phase_go');
    chk();
    await callTurn();
    chk();
    let k = 0, wrongs = 0;
    const want = () => moons.find((m) => +m.dataset.i === k);
    setHint(() => want());
    await race(new Promise((resolve) => {
      moons.forEach((m) => m.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (m.classList.contains('lined')) return;
        if (+m.dataset.i !== k) { sfx('soft'); R.hop(m, 'shake'); if (++wrongs === 1) say('shan', 'md_phase_wrong'); if (wrongs >= 2) want().classList.add('glowy-2d'); return; }
        wrongs = 0;
        m.classList.remove('glowy-2d');
        m.classList.add('lined');
        slots[k].appendChild(m);
        sfx('pop'); sfx('sparkle');
        k++;
        if (k >= ks.length) resolve();
        else if (turnsOn()) nextTurn({ say: false });
      }));
    }));
    chk();
    sfx('fanfare');
    await say('shan', 'md_phase_done');
  } finally { setHint(null); P.close(); }
}

// ======================= 萬聖節 =======================
// 南瓜燈：把兩個眼睛、鼻子、嘴巴拖到南瓜上（放哪裡都可以），再點蠟燭點亮
async function pumpkinGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('pumpkinpanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    const PARTS = {
      eye1: '<svg viewBox="0 0 60 60"><path d="M6 50 L30 8 L54 50Z" fill="#3a2a10"/></svg>',
      eye2: '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="24" fill="#3a2a10"/></svg>',
      nose: '<svg viewBox="0 0 60 60"><path d="M30 10 L50 50 H10Z" fill="#3a2a10"/></svg>',
      mouth: '<svg viewBox="0 0 120 60"><path d="M6 10 Q60 70 114 10 L98 18 L84 8 L70 20 L56 8 L42 20 L28 8 L16 18Z" fill="#3a2a10"/></svg>',
    };
    el.innerHTML = `<div class="fx-pumpkin">${FICON.pumpkin}<div class="fx-face"></div></div><div class="fx-tray">${Object.entries(PARTS).map(([k, h]) => `<div class="fx-part ${k}" data-k="${k}">${h}</div>`).join('')}</div>`;
    const pk = el.querySelector('.fx-pumpkin'), face = el.querySelector('.fx-face');
    const dots = roundDots(el, 4, 'tr');
    await say('shan', 'hw_pumpkin_go');
    chk();
    await callTurn();
    chk();
    let n = 0;
    setHint(() => el.querySelector('.fx-part:not(.used)'));
    await race(new Promise((resolve) => {
      el.addEventListener('pointerdown', (e) => {
        const pt = e.target.closest('.fx-part');
        if (!pt || pt.classList.contains('used')) return;
        R.drag(e, { html: pt.innerHTML, size: pt.dataset.k === 'mouth' ? 150 : 90, originEl: pt,
          onStart: () => pt.classList.add('used'),
          onDrop: (cx, cy) => { const r = stageRect(pk), p = toStage(cx, cy); return Math.abs(p.x - r.x) < r.w * 0.42 && Math.abs(p.y - r.y + 10) < r.h * 0.36 ? p : null; },
          onPlaced: (p) => {
            const r = stageRect(pk);
            const d = div(`fx-onface ${pt.dataset.k}`, pt.innerHTML);
            d.style.left = `${p.x - r.left}px`; d.style.top = `${p.y - r.top}px`;
            face.appendChild(d);
            sfx('pop');
            dots.set(++n);
            if (n >= 4) resolve(); else if (turnsOn()) nextTurn({ say: false });
          },
          onBack: () => pt.classList.remove('used') });
      });
    }));
    chk();
    const candle = div('fx-light glowy-2d', FICON.candle);
    el.appendChild(candle);
    setHint(() => candle);
    say('shan', 'hw_pumpkin_light');
    await race(new Promise((r) => candle.addEventListener('pointerdown', r, { once: true })));
    chk();
    candle.remove();
    pk.classList.add('lit');
    sfx('fanfare');
    R.burstAt(pk, { n: 24, stars: true, colors: ['#ffd23f', '#ff8a3d'] });
    await say('shan', 'hw_pumpkin_done');
  } finally { setHint(null); P.close(); }
}
// 變裝走秀：選一套裝扮，跟著音樂踩拍子走過舞台
async function paradeGame(R) {
  const { say, chk } = R;
  const P = R.panel('paradepanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    const who = whoseTurn() || R.members[0];
    el.innerHTML = `<div class="fx-runway"></div><div class="fx-walker">${kidSvg(who, ['shirt', 'pants'])}<i class="fx-costume"></i></div><div class="fx-picks"></div>`;
    const walker = el.querySelector('.fx-walker'), cos = el.querySelector('.fx-costume'), picks = el.querySelector('.fx-picks');
    await say('shan', 'hw_parade_go');
    chk();
    if (turnsOn()) { await callTurn(); chk(); }
    // 選裝扮：哪一個都對（自己決定）
    picks.innerHTML = [['witch', FICON.witch], ['ghost', FICON.ghost], ['pumpkin', FICON.jack]].map(([k, h]) => `<button class="fx-pick" data-k="${k}">${h}</button>`).join('');
    picks.classList.add('show');
    setHint(() => picks.querySelector('.fx-pick'));
    const k = await R.race(new Promise((r) => { picks.onpointerdown = (e) => { const b = e.target.closest('.fx-pick'); if (b) { e.stopPropagation(); r(b.dataset.k); } }; }));
    chk();
    picks.classList.remove('show');
    cos.innerHTML = { witch: FICON.witch, ghost: FICON.ghost, pumpkin: FICON.jack }[k];
    cos.className = `fx-costume ${k}`;
    sfx('sparkle');
    await say('shan', 'hw_parade_walk');
    chk();
    playMusic('fest_halloween');
    const hits = await rhythm(R, { box: el, bpm: 92, onHit: (n) => { walker.style.left = `${120 + Math.min(9, n) * 60}px`; R.hop(walker, 'hop'); } });
    chk();
    sfx('applause');
    await say('shan', hits >= 5 ? 'hw_parade_great' : 'hw_parade_ok');
  } finally { setHint(null); P.close(); playMusic(R.music()); }
}

// ======================= 聖誕節 =======================
// 降臨月曆：24 個小門，今天的那一格（和之前漏開的）可以開；開了樹上多一個裝飾
const ADVENT_ART = ['ornament', 'cookie', 'stocking', 'gift', 'candle', 'tree'];
async function adventGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('adventpanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    const day = (() => { const t = fest.activeFests().find((f) => f.id === 'xmas'); return t ? Math.min(24, 25 + t.offset) : 24; })();
    const opened = (n) => fest.has(`advent:${Y()}:${n}`);
    const art = (n) => { const k = ADVENT_ART[n % ADVENT_ART.length]; return k === 'ornament' ? FICON.ornament(['#e53935', '#3ea8e0', '#ffd23f', '#a98bff'][n % 4]) : FICON[k]; };
    el.innerHTML = `<div class="fx-advent">${[...Array(24)].map((_, i) => { const n = i + 1; const st = opened(n) ? 'open' : n <= day ? 'can' : 'lock';
      return `<button class="fx-adoor ${st}" data-n="${n}"><span class="num">${numSvg(n, { color: '#fff' })}</span><span class="in">${art(n)}</span></button>`; }).join('')}</div>`;
    await say('shan', 'xm_advent_go');
    chk();
    const can = () => [...el.querySelectorAll('.fx-adoor.can')];
    if (!can().length) { await say('shan', 'xm_advent_all'); return; }
    can().forEach((b) => b.classList.add('glowy-2d'));
    while (can().length) {
      setHint(() => can()[0]);
      const b = await race(new Promise((r) => { el.onpointerdown = (e) => { const x = e.target.closest('.fx-adoor.can'); if (x) r(x); else if (e.target.closest('.fx-adoor.lock')) { sfx('soft'); say('shan', 'xm_advent_wait'); } }; }));
      chk();
      b.classList.remove('can', 'glowy-2d');
      b.classList.add('open');
      fest.mark(`advent:${Y()}:${b.dataset.n}`);
      sfx('open'); sfx('sparkle');
      R.burstAt(b, { n: 12, stars: true });
      if (turnsOn() && can().length) nextTurn({ say: false });
      await wait(500);
    }
    el.onpointerdown = null;
    await say('shan', day >= 24 ? 'xm_advent_24' : 'xm_advent_done');
  } finally { setHint(null); P.close(); }
}
// 裝飾聖誕樹：照顏色的規律掛下一個（愷愷 紅黃紅黃…；岳岳 紅黃藍紅黃藍…）
async function treeGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('treepanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    const hard = hardSolo(R);
    const pat = hard ? ['#e53935', '#ffd23f', '#3ea8e0'] : ['#e53935', '#ffd23f'];
    const len = hard ? 9 : 8, blanks = hard ? 3 : 2;
    const seq = [...Array(len)].map((_, i) => pat[i % pat.length]);
    el.innerHTML = `<div class="fx-xtree">${FICON.tree}</div><div class="fx-orns">${seq.map((c, i) => `<div class="fx-orn ${i >= len - blanks ? 'blank' : ''}" data-i="${i}">${i >= len - blanks ? '' : FICON.ornament(c)}</div>`).join('')}</div>
      <div class="fx-colors">${shuffle([...pat, ...(hard ? [] : ['#3ea8e0'])]).map((c) => `<button class="fx-color" data-c="${c}">${FICON.ornament(c)}</button>`).join('')}</div>`;
    const dots = roundDots(el, blanks, 'tr');
    await say('shan', 'xm_tree_go');
    chk();
    await callTurn();
    chk();
    for (let b = 0; b < blanks; b++) {
      dots.set(b);
      const i = len - blanks + b;
      const slot = el.querySelector(`.fx-orn[data-i="${i}"]`);
      slot.classList.add('now');
      const right = el.querySelector(`.fx-color[data-c="${seq[i]}"]`);
      setHint(() => right);
      let wrongs = 0;
      await race(new Promise((resolve) => {
        el.onpointerdown = (e) => {
          const c = e.target.closest('.fx-color');
          if (!c) return;
          if (c.dataset.c === seq[i]) { el.onpointerdown = null; resolve(); return; }
          wrongs++;
          sfx('soft');
          R.hop(c, 'shake');
          if (wrongs === 1) say('shan', 'xm_tree_wrong');
          if (wrongs >= 2 || levelNow(R.profile) === 'easy') right.classList.add('glowy-2d');
        };
      }));
      chk();
      right.classList.remove('glowy-2d');
      slot.classList.remove('now', 'blank');
      slot.innerHTML = FICON.ornament(seq[i]);
      sfx('ding'); sfx('sparkle');
      if (turnsOn() && b < blanks - 1) nextTurn({ say: false });
    }
    dots.done();
    el.querySelector('.fx-xtree').classList.add('lit');
    sfx('fanfare');
    await say('shan', 'xm_tree_done');
  } finally { setHint(null); P.close(); }
}

// ======================= 兒童節 =======================
// 氣球派對：閃閃說一個顏色，點那個顏色的氣球（三輪）
const BCOLORS = { red: '#ff5d73', blue: '#3ea8e0', yellow: '#ffd23f', green: '#4cd07d' };
async function balloonGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('balloonpanel', { host: 'shan', hostSvg: shanSvg() });
  const el = P.el;
  try {
    const rounds = 3;
    const dots = roundDots(el, rounds, 'tr');
    await say('shan', 'kd_balloon_go');
    chk();
    let prev = null;
    for (let r = 0; r < rounds; r++) {
      dots.set(r);
      if (turnsOn()) { await callTurn(); chk(); }
      const want = pick(Object.keys(BCOLORS).filter((c) => c !== prev));
      prev = want;
      const cols = shuffle([want, want, want, ...shuffle(Object.keys(BCOLORS).filter((c) => c !== want)).slice(0, isHard(R) ? 3 : 2)]);
      el.querySelectorAll('.fx-bal').forEach((x) => x.remove());
      cols.forEach((c, i) => {
        const b = div('fx-bal', `<svg viewBox="0 0 100 110" width="100%" height="100%"><ellipse cx="50" cy="42" rx="34" ry="40" fill="${BCOLORS[c]}"/><ellipse cx="38" cy="26" rx="8" ry="12" fill="#fff" opacity=".5"/><path d="M50 82 V108" stroke="#c9b6d8" stroke-width="2"/></svg>`);
        b.dataset.c = c;
        b.style.left = `${60 + i * (780 / cols.length)}px`;
        b.style.animationDelay = `${-(i * 0.7)}s`;
        el.appendChild(b);
      });
      say('shan', `kd_color_${want}`);
      let got = 0, wrongs = 0;
      setHint(() => el.querySelector(`.fx-bal[data-c="${want}"]:not(.pop)`));
      await race(new Promise((resolve) => {
        el.onpointerdown = (e) => {
          const b = e.target.closest('.fx-bal');
          if (!b || b.classList.contains('pop')) return;
          if (b.dataset.c !== want) { sfx('soft'); R.hop(b, 'shake'); if (++wrongs >= 2) el.querySelectorAll(`.fx-bal[data-c="${want}"]`).forEach((x) => x.classList.add('glowy-2d')); return; }
          b.classList.add('pop');
          sfx('pop'); sfx('sparkle');
          R.burstAt(b, { n: 10, stars: true, colors: [BCOLORS[want], '#fff3a0'] });
          if (++got >= 3) { el.onpointerdown = null; resolve(); }
        };
      }));
      chk();
      await wait(500);
      if (turnsOn() && r < rounds - 1) nextTurn({ say: false });
    }
    dots.done();
    sfx('fanfare');
    await say('shan', 'kd_balloon_done');
  } finally { setHint(null); P.close(); }
}

// ======================= 每個節日的設定 =======================
// 每個活動：{ id, icon, marker:{x,y,z}, run(R) }；mk(x,y,z) 標記位置（在舞台模型裡）
const mk = (x, y, z = 190) => ({ x, y, z });
const HELP_ITEMS = {
  toy: `<svg viewBox="0 0 100 100"><rect x="14" y="40" width="72" height="48" rx="8" fill="#ffb627"/><circle cx="34" cy="34" r="14" fill="#ff5d73"/><rect x="56" y="18" width="24" height="24" rx="4" fill="#3ea8e0"/></svg>`,
  bowl: `<svg viewBox="0 0 100 100"><path d="M14 44 H86 Q84 80 50 82 Q16 80 14 44Z" fill="#fff" stroke="#c9d3de" stroke-width="4"/><path d="M60 10 L80 46 M70 8 L88 42" stroke="#c98b5e" stroke-width="5"/></svg>`,
  water: itemSvg('water'),
  plant: itemSvg('plant'),
  shoes: `<svg viewBox="0 0 100 100"><path d="M10 70 Q10 50 24 48 L40 52 Q50 64 64 64 Q70 72 66 80 H12Z" fill="#3ea8e0"/><path d="M44 70 Q44 50 58 48 L74 52 Q84 64 94 66 Q98 74 94 82 H46Z" fill="#ff8a3d"/></svg>`,
  bag: `<svg viewBox="0 0 100 100"><path d="M20 36 H80 L74 92 H26Z" fill="#7ee06a"/><path d="M36 36 Q36 14 50 14 Q64 14 64 36" stroke="#4f9f3e" stroke-width="6" fill="none"/></svg>`,
  knife: kitchenItemSvg('knife'),
  pot: kitchenItemSvg('pot'),
  ladder: `<svg viewBox="0 0 100 100"><path d="M30 8 L22 94 M70 8 L78 94" stroke="#c98b5e" stroke-width="7"/><path d="M28 26 H72 M26 46 H74 M24 66 H76 M23 84 H77" stroke="#c98b5e" stroke-width="6"/></svg>`,
  drill: `<svg viewBox="0 0 100 100"><rect x="14" y="30" width="56" height="26" rx="8" fill="#ffb627"/><rect x="70" y="38" width="22" height="10" fill="#9fb4cc"/><path d="M30 56 L40 92 H58 L52 56Z" fill="#4a3b6b"/></svg>`,
  lighter: `<svg viewBox="0 0 100 100"><rect x="34" y="40" width="32" height="54" rx="6" fill="#ff5d73"/><rect x="40" y="28" width="20" height="14" fill="#9fb4cc"/><path d="M50 4 q12 14 0 24 q-12 -10 0 -24Z" fill="#ffb627"/></svg>`,
};
const helpSort = (R, host, hostSvg, intro, good, bad, wrongLine, done) => sortGame(R, { host, hostSvg, intro,
  bins: [{ id: 'good', html: itemSvg('good') }, { id: 'bad', html: itemSvg('bad') }],
  items: [...good.map((k) => ({ k, bin: 'good', html: HELP_ITEMS[k] })), ...bad.map((k) => ({ k, bin: 'bad', html: HELP_ITEMS[k] }))],
  wrong: (it) => (it.bin === 'bad' ? wrongLine : 'fx_help_good'), done });

function gamesFor(f, R0) {
  const members = R0.members;
  switch (f.id) {
    case 'birthday': {
      const bk = f.who.filter((id) => members.includes(id));
      if (bk.length) {
        const kid = bk[0];
        return [
          { id: 'bd_cake', icon: FICON.cake, marker: mk(230, 300), run: (R) => cakeGame(R, kid) },
          { id: 'bd_blow', icon: FICON.candle, marker: mk(380, 220), run: (R) => blowGame(R, kid) },
          { id: 'bd_gift', icon: FICON.gift, marker: mk(530, 300), run: (R) => giftGame(R, { line: 'bd_gift_open', after: 'bd_gift_real' }) },
        ];
      }
      // 壽星不在：偷偷幫他做生日卡、練習生日歌
      const other = f.who[0];
      return [
        { id: 'bd_card', icon: FICON.card, marker: mk(260, 300), run: async (R) => { await cardGame(R, { to: other, occ: 'bd', sayLine: `bd_wish_${other}` }); fest.mark(`card:bd:${other}:${Y()}`); await R.say('shan', `bd_secret_${other}`); } },
        { id: 'bd_song', icon: FICON.mic, marker: mk(500, 300), run: async (R) => { await R.say('shan', 'fx_song_go'); playMusic('fest_birthday'); await rhythm(R, { bpm: 84 }); await R.say('shan', 'fx_song_done'); playMusic(R.music()); } },
      ];
    }
    case 'pbirthday': {
      const p = f.who[0];
      return [
        { id: `pb_card_${p}`, icon: FICON.card, marker: mk(260, 300), run: (R) => cardGame(R, { to: p, occ: 'bd', sayLine: `pb_wish_${p}` }) },
        { id: 'pb_song', icon: FICON.mic, marker: mk(500, 300), run: async (R) => { await R.say('shan', 'fx_song_go'); playMusic('fest_birthday'); await rhythm(R, { bpm: 84 }); await R.say('shan', 'fx_song_done'); playMusic(R.music()); } },
      ];
    }
    case 'mother':
      return [
        { id: 'mo_card', icon: FICON.carnation, marker: mk(260, 300), run: (R) => cardGame(R, { to: 'mom', occ: 'mo', sayLine: 'mo_wish' }) },
        { id: 'mo_help', icon: FICON.helper, marker: mk(500, 300), run: (R) => helpSort(R, 'baobao', baobaoSvg(), 'mo_help_go', ['toy', 'bowl', 'plant', 'shoes'], ['knife', 'pot', 'ladder'], 'fx_help_bad', 'mo_help_done') },
      ];
    case 'father':
      return [
        { id: 'fa_card', icon: FICON.tie, marker: mk(260, 300), run: (R) => cardGame(R, { to: 'dad', occ: 'fa', sayLine: 'fa_wish' }) },
        { id: 'fa_help', icon: FICON.helper, marker: mk(500, 300), run: (R) => helpSort(R, 'baba', CAST_BY_ID.baba.svg(), 'fa_help_go', ['shoes', 'bag', 'water', 'toy'], ['drill', 'ladder', 'lighter'], 'fx_help_bad', 'fa_help_done') },
      ];
    case 'kids':
      return [
        { id: 'kd_balloon', icon: FICON.balloon, marker: mk(230, 300), run: balloonGame },
        { id: 'kd_gifts', icon: FICON.gift, marker: mk(380, 220), run: (R) => findGame(R, { host: 'shan', intro: 'kd_gifts_go', hiddenLine: 'kd_gifts_hidden', done: 'kd_gifts_done', list: true,
          found: () => null,
          // 兩個藏在舞台後面，要轉過去才看得到
          items: [[120, 260, false], [640, 260, false], [380, 540, false], [300, 12, true], [480, 12, true]].map(([x, y, hidden], i) => ({ id: `g${i}`, x, y, w: 64, h: 64, hidden, seenFrom: hidden ? [1, 2] : undefined, html: FICON.gift, icon: FICON.gift })) }) },
        { id: 'kd_dance', icon: FICON.mic, marker: mk(530, 300), run: async (R) => { await R.say('shan', 'kd_dance_go'); playMusic('party'); const h = await rhythm(R, { bpm: 100 }); await R.say('shan', h >= 5 ? 'kd_dance_great' : 'kd_dance_ok'); playMusic(R.music()); } },
      ];
    case 'cny': {
      const g = [
        { id: 'cn_clean', icon: FICON.broom, marker: mk(200, 300), run: (R) => stepsGame(R, { host: 'shan', hostSvg: shanSvg(), cls: 'cleanpanel', intro: 'cn_clean_go', wrong: 'cn_clean_wrong', done: 'cn_clean_done',
          steps: [{ t: 'cloth', icon: itemSvg('tissue'), line: 'cn_clean_1' }, { t: 'broom', icon: FICON.broom, line: 'cn_clean_2' }, { t: 'water', icon: itemSvg('water'), line: 'cn_clean_3' }, { t: 'bag', icon: trashBagSvg(), line: 'cn_clean_4' }],
          targets: shuffle([[120, 160], [600, 160], [120, 380], [600, 380]]).map(([x, y], i) => ({ id: ['cloth', 'broom', 'water', 'bag'][i], x, y, w: 160, h: 160, html: [itemSvg('tissue'), FICON.broom, itemSvg('water'), trashBagSvg()][i] })),
          fx: async (i) => { sfx(['scrub', 'mop', 'water', 'pop'][i]); await wait(500); } }) },
        { id: 'cn_couplet', icon: FICON.couplet, marker: mk(380, 200), run: coupletGame },
        { id: 'cn_red', icon: FICON.redpacket, marker: mk(560, 300), run: redPacketGame },
      ];
      if (f.offset >= 9) g.push({ id: 'cn_lantern', icon: FICON.lantern, marker: mk(380, 480), run: riddleGame });
      return g;
    }
    case 'dragon':
      return [
        { id: 'dr_zongzi', icon: FICON.zongzi, marker: mk(200, 300), run: (R) => stepsGame(R, { host: 'dong', hostSvg: dongSvg(), cls: 'zongpanel', intro: 'dr_zong_go', wrong: 'dr_zong_wrong', done: 'dr_zong_done',
          steps: [{ t: 'leaf', icon: FICON.zongzi, line: 'dr_zong_1' }, { t: 'rice', icon: FOODRICE, line: 'dr_zong_2' }, { t: 'egg', icon: FICON.egg, line: 'dr_zong_3' }, { t: 'rope', icon: ROPE, line: 'dr_zong_4' }, { t: 'steam', icon: STEAMER, line: 'dr_zong_5' }],
          targets: shuffle([[100, 150], [380, 150], [660, 150], [240, 380], [520, 380]]).map(([x, y], i) => ({ id: ['leaf', 'rice', 'egg', 'rope', 'steam'][i], x, y, w: 150, h: 150, html: [LEAF, FOODRICE, FICON.egg, ROPE, STEAMER][i] })),
          fx: async (i) => { sfx(['squish', 'pop', 'pop', 'click', 'water'][i]); await wait(500); } }) },
        { id: 'dr_safe', icon: FICON.sachet, marker: mk(380, 200), run: (R) => sortGame(R, { host: 'shan', hostSvg: shanSvg(), intro: 'dr_safe_go',
          bins: [{ id: 'good', html: itemSvg('good') }, { id: 'bad', html: itemSvg('bad') }],
          items: [['sachet', 'good', FICON.sachet], ['jacket', 'good', FICON.lifejacket], ['water', 'good', itemSvg('water')], ['run', 'bad', RUNWATER], ['swim', 'bad', SWIMALONE]].map(([k, bin, html]) => ({ k, bin, html })),
          wrong: (it) => `dr_safe_${it.k}`, done: 'dr_safe_done' }) },
        { id: 'dr_boat', icon: FICON.boat, marker: mk(560, 300), run: boatGame },
        { id: 'dr_egg', icon: FICON.egg, marker: mk(380, 480), run: eggGame },
      ];
    case 'moon':
      return [
        { id: 'md_story', icon: FICON.rabbit, marker: mk(200, 300), run: moonStory },
        { id: 'md_bbq', icon: FICON.bbq, marker: mk(380, 200), run: (R) => sortGame(R, { host: 'huahua', hostSvg: huahuaSvg(), intro: 'md_bbq_go',
          bins: [{ id: 'good', html: itemSvg('good') }, { id: 'bad', html: itemSvg('bad') }],
          items: [['adult', 'good', personSvg('dad')], ['tongs', 'good', TONGS], ['far', 'good', FARKID], ['coal', 'bad', COAL], ['runbbq', 'bad', RUNBBQ], ['hand', 'bad', HANDHOT]].map(([k, bin, html]) => ({ k, bin, html })),
          wrong: (it) => `md_bbq_${it.k}`, done: 'md_bbq_done' }) },
        { id: 'md_share', icon: FICON.mooncake, marker: mk(560, 300), run: shareGame },
        { id: 'md_phase', icon: FICON.moon, marker: mk(380, 480), run: phaseGame },
      ];
    case 'halloween':
      return [
        { id: 'hw_pumpkin', icon: FICON.jack, marker: mk(230, 300), run: pumpkinGame },
        { id: 'hw_trick', icon: FICON.candy, marker: mk(380, 200), run: async (R) => { await stepsGame(R, { host: 'shan', hostSvg: shanSvg(), cls: 'trickpanel', intro: 'hw_trick_go', wrong: 'hw_trick_wrong', done: 'hw_trick_done',
          steps: [{ t: 'adult', icon: personSvg('dad'), line: 'hw_trick_1' }, { t: 'door', icon: FICON.door, line: 'hw_trick_2' }, { t: 'mic', icon: FICON.mic, line: 'hw_trick_3' }, { t: 'heart', icon: itemSvg('good'), line: 'hw_trick_4' }, { t: 'candy', icon: FICON.candy, line: 'hw_trick_5' }],
          targets: shuffle([[100, 150], [380, 150], [660, 150], [240, 380], [520, 380]]).map(([x, y], i) => ({ id: ['adult', 'door', 'mic', 'heart', 'candy'][i], x, y, w: 150, h: 150, html: [personSvg('dad'), FICON.door, FICON.mic, itemSvg('good'), FICON.candy][i] })),
          fx: async (i) => { sfx(['tap', 'knock', 'giggle', 'ding', 'sparkle'][i]); await wait(400); } }); await R.say('xie', 'hw_trick_xie'); } },
        { id: 'hw_parade', icon: FICON.witch, marker: mk(530, 300), run: paradeGame },
      ];
    case 'xmas': {
      const g = [
        { id: 'xm_advent', icon: FICON.advent, marker: mk(200, 300), run: adventGame },
        { id: 'xm_tree', icon: FICON.tree, marker: mk(380, 200), run: treeGame },
        { id: 'xm_card', icon: FICON.card, marker: mk(560, 300), run: (R) => cardGame(R, { to: pick(['grandma', 'mom', 'dad']), occ: 'thx', sayLine: 'xm_thanks' }) },
      ];
      if (f.offset >= -1) g.push(f.offset <= -1
        ? { id: 'xm_eve', icon: FICON.cookie, marker: mk(380, 480), run: (R) => stepsGame(R, { host: 'shan', hostSvg: shanSvg(), cls: 'evepanel', intro: 'xm_eve_go', wrong: 'xm_eve_wrong', done: 'xm_eve_done',
          steps: [{ t: 'cookie', icon: FICON.cookie, line: 'xm_eve_1' }, { t: 'milk', icon: FICON.milk, line: 'xm_eve_2' }, { t: 'sock', icon: FICON.stocking, line: 'xm_eve_3' }, { t: 'sleep', icon: itemSvg('sleep'), line: 'xm_eve_4' }],
          targets: shuffle([[140, 170], [600, 170], [140, 390], [600, 390]]).map(([x, y], i) => ({ id: ['cookie', 'milk', 'sock', 'sleep'][i], x, y, w: 150, h: 150, html: [FICON.cookie, FICON.milk, FICON.stocking, itemSvg('sleep')][i] })) }) }
        : { id: 'xm_gift', icon: FICON.stocking, marker: mk(380, 480), run: (R) => giftGame(R, { line: 'xm_gift_open', after: 'xm_gift_real' }) });
      return g;
    }
    default: return [];
  }
}
// 端午、中秋用到的小圖
const LEAF = `<svg viewBox="0 0 100 100"><path d="M20 80 Q20 20 80 14 Q86 74 20 80Z" fill="#6fbf5a"/><path d="M22 78 L78 16" stroke="#4f9f3e" stroke-width="3"/></svg>`;
const FOODRICE = `<svg viewBox="0 0 100 100"><path d="M14 54 H86 C86 76 70 90 50 90 C30 90 14 76 14 54Z" fill="#c98b5e"/><g fill="#fffdf4" stroke="#e3d6bd" stroke-width="2.5"><circle cx="40" cy="44" r="10"/><circle cx="56" cy="40" r="12"/><circle cx="66" cy="48" r="9"/><ellipse cx="50" cy="52" rx="36" ry="12"/></g></svg>`;
const ROPE = `<svg viewBox="0 0 100 100"><path d="M10 50 Q30 20 50 50 T90 50" stroke="#c98b5e" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M10 64 Q30 34 50 64 T90 64" stroke="#e0b27e" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
const STEAMER = `<svg viewBox="0 0 100 100"><rect x="14" y="44" width="72" height="40" rx="8" fill="#e0b27e"/><rect x="10" y="36" width="80" height="12" rx="6" fill="#c98b5e"/><path d="M34 30 q-6 -10 0 -20 M50 30 q-6 -10 0 -20 M66 30 q-6 -10 0 -20" stroke="#c9d3de" stroke-width="4" fill="none"/></svg>`;
const RUNWATER = `<svg viewBox="0 0 100 100"><path d="M0 74 Q25 64 50 74 T100 74 V100 H0Z" fill="#7fd3ff"/><circle cx="56" cy="22" r="10" fill="#ffd9b8"/><path d="M56 32 L50 56 M50 56 L38 70 M50 56 L64 68 M54 40 L40 34 M54 40 L68 46" stroke="#3ea8e0" stroke-width="7" stroke-linecap="round"/><path d="M20 30 H32 M16 40 H28" stroke="#9fb4cc" stroke-width="4"/></svg>`;
const SWIMALONE = `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#5ec3ee" rx="10"/><path d="M0 40 Q25 30 50 40 T100 40" stroke="#fff" stroke-width="4" fill="none"/><circle cx="50" cy="52" r="12" fill="#ffd9b8"/><path d="M30 46 L20 34 M70 46 L80 34" stroke="#ffd9b8" stroke-width="6" stroke-linecap="round"/></svg>`;
const TONGS = `<svg viewBox="0 0 100 100"><path d="M20 90 L60 20 M34 92 L66 24" stroke="#9fb4cc" stroke-width="7" stroke-linecap="round"/><path d="M56 16 L72 26" stroke="#4a3b6b" stroke-width="10" stroke-linecap="round"/></svg>`;
const FARKID = `<svg viewBox="0 0 100 100"><rect x="60" y="56" width="34" height="8" rx="3" fill="#4a3b6b"/><path d="M66 50 q3 -8 0 -12 M82 50 q3 -8 0 -12" stroke="#ff8a3d" stroke-width="3" fill="none"/><circle cx="22" cy="40" r="10" fill="#ffd9b8"/><rect x="14" y="52" width="16" height="30" rx="7" fill="#7fd3ff"/><path d="M36 70 H54" stroke="#4cd07d" stroke-width="5" stroke-dasharray="6 6"/></svg>`;
const COAL = `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="66" rx="36" ry="18" fill="#3a3550"/><circle cx="36" cy="60" r="10" fill="#ff5d3a"/><circle cx="58" cy="64" r="9" fill="#ff8a3d"/><path d="M40 40 q6 -10 0 -18 M60 44 q6 -10 0 -18" stroke="#ff8a3d" stroke-width="4" fill="none"/></svg>`;
const RUNBBQ = `<svg viewBox="0 0 100 100"><rect x="56" y="52" width="38" height="8" rx="3" fill="#4a3b6b"/><path d="M62 46 q3 -8 0 -12 M80 46 q3 -8 0 -12" stroke="#ff8a3d" stroke-width="3" fill="none"/><circle cx="30" cy="30" r="10" fill="#ffd9b8"/><path d="M30 40 L26 62 M26 62 L14 76 M26 62 L40 74 M28 46 L14 42 M28 46 L44 52" stroke="#3ea8e0" stroke-width="7" stroke-linecap="round"/></svg>`;
const HANDHOT = `<svg viewBox="0 0 100 100"><rect x="14" y="60" width="72" height="10" rx="4" fill="#4a3b6b"/><rect x="30" y="48" width="40" height="12" rx="4" fill="#c96a3a"/><path d="M40 10 V36 Q40 44 48 44 H58 Q66 44 66 36 V18" stroke="#ffd9b8" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M80 20 L88 12 M84 32 L94 30" stroke="#ff5d3a" stroke-width="4"/></svg>`;

// 舞台上客串的角色
const GUEST = { birthday: 'dong', pbirthday: 'baobao', mother: 'baobao', father: 'baba', kids: 'jiujiu', cny: 'duoduo', dragon: 'dong', moon: 'huahua', halloween: 'xie', xmas: 'wan' };

// ======================= 舞台 =======================
export function mountFest(root, app) {
  const f = fest.mainFest();
  if (!f) { app.go('town'); return; }
  const [c1, c2] = FEST_COLOR[f.id];
  const music = { birthday: 'fest_birthday', pbirthday: 'fest_birthday', mother: 'fest_love', father: 'fest_love', kids: 'party', cny: 'fest_cny', dragon: 'fest_dragon', moon: 'fest_moon', halloween: 'fest_halloween', xmas: 'fest_xmas' }[f.id];
  return runRoom(root, app, {
    id: 'fest', host: 'shan', back: 'town',
    build() {
      const dio = createDiorama({ w: 760, d: 620, walls: false, zoom: 0.9, cy: 0.6, base: '#8fbf6a', rim: 24, skirt: '#a6d987', horizon: 'town',
        floorCss: `background: radial-gradient(circle at 50% 40%, #fff6e6 0 30%, ${c1}33 31% 32%, #f3e8d4 33%)` });
      // 舞台（後面）＋大招牌
      dio.addBox({ x: 180, y: 40, w: 400, d: 130, h: 40, color: c1, top: '#fffaf0' });
      dio.addPanel({ x1: 180, y1: 40, x2: 580, y2: 40, z: 40, h: 200, css: `background: linear-gradient(${c1}, ${c1}cc); border-radius: 20px 20px 0 0`,
        html: `<div style="position:absolute;left:50%;top:14px;width:150px;height:150px;margin-left:-75px">${FEST_SIGN[f.id]}</div>` });
      // 兩根柱子＋彩旗
      [[180, 40], [580, 40]].forEach(([x, y]) => dio.addBox({ x: x - 10, y: y - 10, w: 20, d: 20, h: 250, color: c2 }));
      const flags = [...Array(9)].map((_, i) => `<path d="M${i * 44} 0 L${i * 44 + 22} 36 L${i * 44 + 44} 0Z" fill="${i % 2 ? c1 : c2}"/>`).join('');
      dio.addPanel({ x1: 180, y1: 40, x2: 580, y2: 40, z: 210, h: 40, html: `<svg viewBox="0 0 400 40" width="100%" height="100%" preserveAspectRatio="none">${flags}</svg>` });
      // 四周的裝飾（照節日）
      const deco = { cny: FICON.lantern, dragon: FICON.zongzi, moon: FICON.mooncake, halloween: FICON.pumpkin, xmas: FICON.tree, kids: FICON.balloon, birthday: FICON.balloon, pbirthday: FICON.balloon, mother: FICON.carnation, father: FICON.tie }[f.id];
      [[90, 300], [690, 300], [90, 560], [690, 560]].forEach(([x, y]) => dio.addSprite({ x, y, w: 90, h: 90, shadow: 0.4, html: deco }));
      [[40, 120], [720, 120]].forEach(([x, y]) => dio.addSprite({ x, y, w: 100, h: 136, shadow: 0.6, html: tree() }));
      const shan = dio.addSprite({ x: 300, y: 380, w: 110, h: 126, html: shanSvg(), shadow: 0.7, tap: 'shan' });
      const g = GUEST[f.id];
      const guest = dio.addSprite({ x: 470, y: 400, w: 110, h: 126, html: CAST_BY_ID[g].svg(), shadow: 0.6, tap: g });
      return { dio, chars: { shan, [g]: guest } };
    },
    music: () => music,
    lines: { hello: () => `fx_hello_${f.id}`, pick: 'fx_pick', next: 'fx_next', allDone: [['shan', 'fx_all_done']] },
    games: gamesFor(f, app.profile),
    // 全部做完：節慶相簿多一張紀念貼紙
    onAllDone: async (R) => {
      if (!fest.has(fest.albumKey(f.id))) { fest.mark(fest.albumKey(f.id)); await R.say('shan', 'fx_album'); }
    },
    setup(R) {
      // 壽星進來：如果弟弟（哥哥）偷偷做了卡片，先拿給他看
      if (f.id === 'birthday') {
        const kid = f.who.find((id) => R.members.includes(id));
        if (kid && fest.has(`card:bd:${kid}:${Y()}`) && !fest.has(`cardseen:bd:${kid}:${Y()}`)) {
          fest.mark(`cardseen:bd:${kid}:${Y()}`);
          setTimeout(async () => {
            const P = R.panel('cardpanel', { host: 'shan', hostSvg: shanSvg() });
            P.el.innerHTML = `<div class="fx-card got"><div class="fx-card-to">${kidHead(kid === 'yy' ? 'kk' : 'yy', 150)}</div><div class="fx-card-art">${['cake', 'balloon', 'gift'].map((k, i) => `<div class="fx-on" style="left:${60 + i * 150}px;top:${120 + (i % 2) * 60}px">${FICON[k]}</div>`).join('')}</div></div>`;
            sfx('fanfare');
            await R.say('shan', `bd_gotcard_${kid}`);
            await wait(1500);
            P.close();
          }, 2500);
        }
      }
    },
  });
}
