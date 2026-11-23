// 學堂（機器人老師嗶嗶）：九九乘法。岳岳靠死背、6×N 開始沒意願，所以改成「先懂、再練、看得到進步」：
//   積木排排站：照課本的意思，a×b 是「b 個 a」：每排 a 個、排 b 排。點一下放上一整排積木（一排就是一組）；問一共幾個，
//              答完一排一排亮起來、嗶嗶跟著數（6、12、18…），再把房間轉 90 度：變成 a 個 b，積木一樣多（交換律）。
//              右上角的眼睛可以從高處往下看。凱凱：小小的題目、只要數；一起玩時凱凱放積木、岳岳回答。
//   跳跳口訣：閃閃踩著石頭跳，嗶嗶數倍數（6、12、18…）→ 換小孩點亮的石頭 → 閃閃停在某一格，選這格是多少。
//   修理機器人：嗶嗶壞掉了，聽題目選答案，每答對一題裝回一個零件。第一次是「健康檢查」（程度檢查，12 題），
//              之後依每一題的熟練度出題（js/core/mult.js：間隔重複，常錯的多出、熟的隔久複習）。
//   乘法星空：西牆上 9×9 的星星，學會一題亮一顆；點牆可以打開大星空，點星星聽口訣。
import { runRoom } from './room-base.js';
import { createDiorama } from '../engine/diorama.js';
import { div, wait, burst, stageRect, shuffle, pick } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { turnsOn, callTurn, nextTurn, whoseTurn, levelNow } from '../core/turns.js';
import { setHint } from '../core/session.js';
import { shanSvg, starPolygon } from '../art/stars.js';
import { bibiSvg, BIBI_PARTS, ICON2, numSvg } from '../art/more.js';
import * as M from '../core/mult.js';
import { roundBtn } from '../ui/hud.js';

export function mount(root, app) {
  return runRoom(root, app, {
    id: 'school',
    host: 'bibi',
    back: 'town',
    build: buildSchool,
    music: () => 'school',
    lines: {
      hello: (ph) => `sch_hello_${ph === 'night' ? 'evening' : ph}`,
      pick: 'sch_pick',
      next: 'sch_next',
      allDone: [['bibi', 'sch_all_done'], ['shan', 'sch_all_done']],
    },
    games: [
      // 修理機器人放第一個：第一次玩會先做程度檢查，之後積木和口訣才知道要練哪一排
      { id: 'robot', icon: ICON2.robot, marker: { x: 540, y: 150, z: 250 }, run: robotGame },
      { id: 'blocks', icon: ICON2.blocks, marker: { x: 312, y: 300, z: 200 }, run: blocksGame },
      { id: 'hop', icon: ICON2.hop, marker: { x: 560, y: 470, z: 200 }, run: hopGame },
    ],
    setup(R) {
      // 右上角的眼睛：從高處往下看（凱凱的空間視角），再按一次回來
      let high = false;
      R.viewBtn = roundBtn(R.root, 'blue btn-view', ICON2.eye, async () => {
        high = !high;
        await R.dio.animateTo({ t: high ? 22 : 56 }, 700);
        if (high && !R.seenTop) { R.seenTop = true; R.say('bibi', 'blocks_top'); }
      });
      R.set.refreshSky();
    },
    playful(name, R) {
      if (name === 'bibi') { sfx('boing'); R.hop(R.set.chars.bibi.el); if (Math.random() < 0.4) R.say('bibi', 'bibi_beep'); return true; }
      if (name === 'sky') { openSky(R); return true; }
      return false;
    },
  });
}

// ---------------- 模型 ----------------
const MAT = { x: 150, y: 140, cell: 36, n: 9 };
const STONES = [[110, 520], [180, 470], [250, 430], [320, 400], [390, 380], [450, 340], [500, 290], [540, 230], [570, 170]];
const ROW_COLORS = ['#ff8a3d', '#3ec7e0', '#7ee06a', '#a98bff', '#ff5d8f', '#ffd23f', '#4fb7a8', '#ff9f43', '#6b8cff'];

function skyHtml(small) {
  const c = small ? 24 : 58;
  let s = '';
  for (let a = 1; a <= 9; a++) {
    const done = M.rowDone(a);
    if (done && !small) s += `<path d="M${c * 0.5} ${(a - 0.5) * c} H${c * 8.5}" stroke="#fff3a0" stroke-width="3" opacity=".6"/>`;
    for (let b = 1; b <= 9; b++) {
      const on = M.mastered(a, b);
      s += `<polygon class="${on ? 'on' : ''}" data-ab="${a}_${b}" points="${starPolygon((b - 0.5) * c, (a - 0.5) * c, on ? c * 0.36 : c * 0.2, on ? c * 0.16 : c * 0.09)}" fill="${on ? '#ffd23f' : '#5a5f9a'}"/>`;
    }
  }
  return `<svg viewBox="0 0 ${c * 9} ${c * 9}" width="100%" height="100%">${s}</svg>`;
}

function buildSchool() {
  const dio = createDiorama({
    w: 680, d: 600, wallH: 300, zoom: 0.96, cy: 0.6, wall: '#e8f6e8', base: '#a9744f',
    floorCss: 'background: repeating-linear-gradient(90deg, #e9c493 0 60px, #ddb582 60px 62px)',
  });
  // 黑板
  dio.wallArt('n', { along: 130, up: 110, w: 330, h: 160, html: `<svg viewBox="0 0 330 160"><rect x="0" y="0" width="330" height="160" rx="10" fill="#a8693f"/><rect x="10" y="10" width="310" height="140" rx="6" fill="#2f6b4f"/>
    ${[0, 1].map((r) => [0, 1, 2].map((c) => `<circle cx="${40 + c * 26}" cy="${50 + r * 26}" r="9" fill="#fff" opacity=".85"/>`).join('')).join('')}
    <text x="150" y="80" font-family="-apple-system,sans-serif" font-weight="800" font-size="40" fill="#fff" opacity=".9">2×3=6</text>
    <polygon points="${starPolygon(280, 120, 14, 6)}" fill="#ffd23f"/><rect x="120" y="150" width="90" height="8" rx="3" fill="#d4955f"/></svg>` });
  // 西牆：乘法星空
  const skyWall = dio.wallArt('w', { along: dio.alongWall('w', 0, 330) - 115, up: 80, w: 230, h: 230, html: '' });
  skyWall.style.cssText += ';background:#2a2f6b;border-radius:18px;padding:6px;box-shadow:0 0 0 8px #ffd9a8';
  skyWall.dataset.tap = 'sky';
  dio.wallArt('n', { along: 520, up: 150, w: 110, h: 100, html: `<svg viewBox="0 0 110 100"><rect x="4" y="4" width="102" height="92" rx="10" fill="#fff"/><rect x="12" y="12" width="86" height="76" rx="6" fill="#bfe6ff"/><path d="M55 12 V88 M12 50 H98" stroke="#fff" stroke-width="5"/></svg>` });
  // 嗶嗶的講桌、學生桌
  dio.addBox({ x: 470, y: 50, w: 140, d: 70, h: 72, color: '#d4955f' });
  dio.addBox({ x: 540, y: 330, w: 90, d: 60, h: 50, color: '#ffd9a8' });
  dio.addBox({ x: 540, y: 420, w: 90, d: 60, h: 50, color: '#ffd9a8' });
  // 積木墊（9×9 的格子）
  const S = MAT.cell * MAT.n;
  dio.addDecal({ x: MAT.x - 8, y: MAT.y - 8, w: S + 16, h: S + 16, z: 0.6, css: `border-radius:16px;background:#fff6e6;background-image:linear-gradient(#e8d6b8 2px,transparent 2px),linear-gradient(90deg,#e8d6b8 2px,transparent 2px);background-size:${MAT.cell}px ${MAT.cell}px;background-position:8px 8px` });
  const bibi = dio.addSprite({ x: 540, y: 160, w: 130, h: 162, html: bibiSvg(), shadow: 0.6, tap: 'bibi' });
  const shan = dio.addSprite({ x: 90, y: 520, w: 116, h: 132, html: shanSvg(), shadow: 0.7, tap: 'shan' });
  return {
    dio, chars: { bibi, shan }, skyWall,
    refreshSky() { skyWall.innerHTML = skyHtml(true); },
  };
}

// ---------------- 積木排排站 ----------------
async function blocksGame(R) {
  const { set, dio, say, chk, race, root, members } = R;
  dio.lock(true);
  R.rot.show(false);
  if (dio.quadrant() !== 0) await dio.faceQuadrant(0, 600);
  chk();
  const yyIn = members.includes('yy');
  const facts = yyIn ? M.pickQuestions(3) : [M.kidQuestion(), M.kidQuestion(), M.kidQuestion()];
  const card = div('factcard ui');
  root.appendChild(card);
  const answers = div('answers ui');
  root.appendChild(answers);
  let cubes = [], strips = [], labels = [];
  const clear = () => { cubes.forEach((c) => c.el.remove()); strips.forEach((s) => s.remove()); labels.forEach((l) => l.remove()); cubes = []; strips = []; labels = []; };
  try {
    await say('bibi', 'blocks_go');
    chk();
    for (let f = 0; f < facts.length; f++) {
      const [a, b] = facts[f];
      const rows = b, per = a;   // a×b ＝ b 個 a：排 b 排、每排 a 個
      // 積木排在墊子中間，鏡頭對準、依大小拉近
      const ox = MAT.x + ((MAT.n - per) * MAT.cell) / 2, oy = MAT.y + ((MAT.n - rows) * MAT.cell) / 2;
      await dio.animateTo({ z: Math.max(1.15, Math.min(1.9, 2.3 - 0.13 * Math.max(rows, per))), px: ox + (per * MAT.cell) / 2, py: oy + (rows * MAT.cell) / 2 + 30 }, 700);
      chk();
      // 題目卡：a × b（藍色＝每排幾個、橘色＝幾排）
      card.innerHTML = `<span class="n" style="--c:#3ea8e0">${a}</span><span class="x">×</span><span class="n" style="--c:#ff8a3d">${b}</span>`;
      card.classList.add('show');
      // 排數、個數的標籤（站在墊子邊上，轉房間也看得到）
      labels.push(dio.addSprite({ x: ox - 30, y: oy + (rows * MAT.cell) / 2 + 20, w: 64, h: 64, html: numSvg(rows, { bg: '#fff', color: '#ff8a3d' }), shadow: 0 }).el);
      labels.push(dio.addSprite({ x: ox + (per * MAT.cell) / 2, y: oy - 14, w: 64, h: 64, html: numSvg(per, { bg: '#fff', color: '#3ea8e0' }), shadow: 0 }).el);
      // 每一排的虛線框，點了放一整排
      if (turnsOn() && whoseTurn() !== 'kk') nextTurn({ say: false });   // 一起玩：凱凱放積木、岳岳回答
      for (let r = 0; r < rows; r++) {
        const s = dio.addDecal({ x: ox + 2, y: oy + r * MAT.cell + 2, w: per * MAT.cell - 4, h: MAT.cell - 4, z: 1, cls: 'rowstrip', css: `--c:${ROW_COLORS[r]}` });
        s.dataset.tap = `row:${r}`;
        strips.push(s);
      }
      if (turnsOn()) { await callTurn(); chk(); }
      await say('bibi', 'blocks_build');
      chk();
      // 一排一排放
      let next = 0;
      const glowNext = () => strips.forEach((s, i) => s.classList.toggle('next', i === next));
      glowNext();
      setHint(() => strips[next]);
      await race(new Promise((resolve) => {
        const off = R.listen((name) => {
          if (!name.startsWith('row:')) return;
          const r = +name.slice(4);
          if (r !== next) { sfx('soft'); R.hop(strips[next], 'pulse-once'); return; }
          for (let c = 0; c < per; c++) {
            const box = dio.addBox({ x: ox + c * MAT.cell + 3, y: oy + r * MAT.cell + 3, w: MAT.cell - 6, d: MAT.cell - 6, h: MAT.cell - 6, z: 140, color: ROW_COLORS[r], cls: 'soft cube' });
            cubes.push(box);
            setTimeout(() => { box.el.style.transform = 'translateZ(0.8px)'; }, 30 + c * 40);
          }
          strips[r].classList.add('done');
          sfx('knock');
          setTimeout(() => sfx('pop'), 120);
          next++;
          glowNext();
          if (next >= rows) { off(); resolve(); }
        });
      }));
      chk();
      await wait(600);
      // 問：一共幾個？（一起玩換岳岳回答）
      if (turnsOn()) { await nextTurn(); chk(); }
      const kidMode = !yyIn || (turnsOn() ? false : levelNow(R.profile) === 'easy');
      await say('bibi', kidMode ? 'blocks_kk' : 'blocks_ask');
      chk();
      const t0 = Date.now();
      const ok = await askChoice(R, answers, M.choices(a, b), a * b);
      const ms = Date.now() - t0;
      chk();
      if (yyIn && !kidMode) recordAndSky(R, a, b, ok.firstTry, ms);
      // 一排一排亮起來，嗶嗶跟著數
      if (!ok.firstTry) { await say('bibi', 'blocks_wrong'); chk(); }
      await say('bibi', 'blocks_count');
      chk();
      for (let r = 0; r < rows; r++) {
        cubes.slice(r * per, r * per + per).forEach((c) => R.hop(c.el, 'cube-hop'));
        sfx('tick');
        await say('bibi', `n_${(r + 1) * per}`);
        chk();
      }
      await say('bibi', `c_${a}_${b}`);
      chk();
      // 轉 90 度：變成 a 排、每排 b 個（b×a）
      sfx('whoosh');
      await dio.animateTo({ a: dio.view.a + 90 }, 1100);
      card.innerHTML = `<span class="n" style="--c:#ff8a3d">${b}</span><span class="x">×</span><span class="n" style="--c:#3ea8e0">${a}</span><span class="x">=</span><span class="n" style="--c:#4cd07d">${a * b}</span>`;
      await say('bibi', 'blocks_turn');
      chk();
      if (a !== b) await say('bibi', `c_${b}_${a}`);
      chk();
      await wait(500);
      await dio.animateTo({ a: dio.view.a - 90 }, 700);
      clear();
      card.classList.remove('show');
    }
    await say('bibi', 'blocks_done');
  } finally {
    clear();
    card.remove();
    answers.remove();
    setHint(null);
  }
}

// 三個大大的答案泡泡。回傳 { firstTry }：第一次就答對？（答錯會讓他再選，直到對）
function askChoice(R, box, opts, correct) {
  return R.race(new Promise((resolve) => {
    let first = true;
    box.innerHTML = '';
    box.classList.add('show');
    for (const v of opts) {
      const b = document.createElement('button');
      b.className = 'ans';
      b.innerHTML = numSvg(v, { color: '#4a3b6b' });
      b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (b.disabled) return;
        if (v === correct) {
          sfx('fanfare');
          R.burstAt(b, { n: 18, stars: true, colors: ['#ffd23f', '#fff3a0', '#4cd07d'] });
          b.classList.add('right');
          setTimeout(() => { box.classList.remove('show'); box.innerHTML = ''; resolve({ firstTry: first }); }, 650);
        } else {
          first = false;
          sfx('soft');
          b.disabled = true;
          b.classList.add('wrong');
        }
      });
      box.appendChild(b);
    }
    setHint(() => [...box.querySelectorAll('.ans')].find((x) => !x.disabled));
  }));
}

// 記錄作答；有新的星星就讓牆上的星空閃一下
async function recordAndSky(R, a, b, correct, ms) {
  const res = M.answer(a, b, correct, ms);
  R.set.refreshSky();
  if (res.newStar) {
    R.hop(R.set.skyWall, 'sky-flash');
    sfx('star');
    await R.say('bibi', M.rowDone(a) ? 'sky_row' : 'sky_new');
  }
}

// ---------------- 跳跳口訣 ----------------
async function hopGame(R) {
  const { set, dio, say, chk, race, root, members } = R;
  dio.lock(true);
  R.rot.show(false);
  if (dio.quadrant() !== 0) await dio.faceQuadrant(0, 600);
  await dio.animateTo({ z: 1.0, px: 340, py: 340 }, 700);
  chk();
  const yyIn = members.includes('yy');
  const a = yyIn ? M.focusRow() : pick([2, 5]);
  const shan = set.chars.shan;
  const home = { x: shan.x, y: shan.y };
  const stones = STONES.map(([x, y], i) => {
    const st = dio.addDecal({ x: x - 34, y: y - 22, w: 68, h: 44, z: 0.8, cls: 'stone', css: `--c:${ROW_COLORS[i]}` });
    st.dataset.tap = `stone:${i}`;
    const num = dio.addSprite({ x, y: y + 2, z: 2, w: 66, h: 66, html: numSvg('?', { bg: '#fff', color: '#bbb' }), shadow: 0, cls: 'stone-num', tap: `stone:${i}` });
    return { st, num, x, y, v: a * (i + 1) };
  });
  const reveal = (i, on = true) => {
    stones[i].num.el.innerHTML = on ? numSvg(stones[i].v, { bg: '#fff', color: '#4a3b6b' }) : numSvg('?', { bg: '#fff', color: '#bbb' });
    stones[i].st.classList.toggle('lit', on);
  };
  const hopTo = (i) => { sfx('boing'); return jump(shan, stones[i].x, stones[i].y + 4, 0, 420); };
  const answers = div('answers ui');
  root.appendChild(answers);
  try {
    // 1. 閃閃示範：嗶嗶數倍數
    await say('bibi', 'hop_go');
    chk();
    await jump(shan, STONES[0][0] - 60, STONES[0][1] + 40, 0, 500);
    for (let i = 0; i < 9; i++) {
      await hopTo(i);
      reveal(i);
      sfx('tick');
      await say('bibi', `n_${stones[i].v}`);
      chk();
    }
    await wait(400);
    // 2. 換小孩點亮石頭
    stones.forEach((_, i) => reveal(i, false));
    await jump(shan, STONES[0][0] - 60, STONES[0][1] + 40, 0, 500);
    if (turnsOn()) { await callTurn(); chk(); }
    await say('bibi', 'hop_you');
    chk();
    for (let i = 0; i < 9; i++) {
      stones[i].st.classList.add('next');
      setHint(() => stones[i].num.el);
      await race(new Promise((resolve) => {
        const off = R.listen((name) => { if (name === `stone:${i}`) { off(); resolve(); } });
      }));
      chk();
      stones[i].st.classList.remove('next');
      reveal(i);
      hopTo(i);
      await say('bibi', `n_${stones[i].v}`);
      chk();
    }
    await say('bibi', 'hop_good');
    chk();
    // 3. 閃閃停在某一格：這格是多少？
    stones.forEach((_, i) => reveal(i, false));
    await jump(shan, STONES[0][0] - 60, STONES[0][1] + 40, 0, 500);
    if (turnsOn()) { await nextTurn(); chk(); }
    const quiz = new Set(shuffle([2, 3, 4, 5, 6, 7, 8]).slice(0, 3));
    for (let i = 0; i < 9; i++) {
      await hopTo(i);
      chk();
      if (quiz.has(i)) {
        stones[i].st.classList.add('next');
        await say('bibi', 'hop_quiz');
        chk();
        const t0 = Date.now();
        const res = await askChoice(R, answers, M.choices(a, i + 1), stones[i].v);
        chk();
        stones[i].st.classList.remove('next');
        if (yyIn && !(turnsOn() && whoseTurn() === 'kk')) recordAndSky(R, a, i + 1, res.firstTry, Date.now() - t0);
        reveal(i);
        await say('bibi', `c_${a}_${i + 1}`);
      } else {
        reveal(i);
        sfx('tick');
        await say('bibi', `n_${stones[i].v}`);
      }
      chk();
    }
    sfx('applause');
    await say('bibi', 'hop_done');
  } finally {
    stones.forEach((s) => { s.st.remove(); s.num.remove(); });
    answers.remove();
    shan.move(home.x, home.y, 0);
    setHint(null);
  }
}

function jump(sp, x1, y1, z1, ms = 500) {
  return new Promise((resolve) => {
    const { x: x0, y: y0, z: z0 } = sp;
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      sp.move(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, z0 + (z1 - z0) * k + 90 * 4 * k * (1 - k));
      if (k < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
}

// ---------------- 修理機器人 ----------------
// a 排、每排 b 個
function dotsHtml(a, b) {
  const c = 30;
  let s = '';
  for (let r = 0; r < a; r++) for (let k = 0; k < b; k++) s += `<circle class="dot r${r}" cx="${k * c + c / 2}" cy="${r * c + c / 2}" r="${c * 0.36}" fill="${ROW_COLORS[r]}"/>`;
  return `<svg viewBox="0 0 ${b * c} ${a * c}" width="${b * c}" height="${a * c}">${s}</svg>`;
}

async function robotGame(R) {
  const { say, chk, members } = R;
  const P = R.panel('robotpanel', { host: 'bibi', hostSvg: bibiSvg() });
  const el = P.el;
  const yyIn = members.includes('yy');
  const checkMode = yyIn && !turnsOn() && !M.checked();
  const missing = new Set(BIBI_PARTS);
  try {
    el.innerHTML = `<div class="robot-big">${bibiSvg([...missing])}</div><div class="qcard"></div><div class="qdots"></div><div class="answers in-panel"></div>`;
    const robot = el.querySelector('.robot-big');
    const qcard = el.querySelector('.qcard');
    const qdots = el.querySelector('.qdots');
    const answers = el.querySelector('.answers');
    const paint = () => { robot.innerHTML = bibiSvg([...missing]); };
    // 題目
    let qs;
    if (checkMode) qs = M.checkQuestions();
    else if (!yyIn) qs = [...Array(6)].map(() => M.kidQuestion());
    else if (turnsOn()) {
      const big = M.pickQuestions(3);
      qs = [];
      for (let i = 0; i < 3; i++) qs.push(big[i], M.kidQuestion());
    } else qs = M.pickQuestions(6);
    const results = [];
    await say('bibi', checkMode ? 'robot_check' : yyIn ? 'robot_broken' : 'robot_kk');
    chk();
    if (turnsOn()) { await callTurn(); chk(); }
    for (let i = 0; i < qs.length; i++) {
      const [a, b] = qs[i];
      const kidQ = !yyIn || (turnsOn() && whoseTurn() === 'kk');
      qcard.innerHTML = `<span class="n">${a}</span><span class="x">×</span><span class="n">${b}</span>`;
      qdots.innerHTML = kidQ ? dotsHtml(b, a) : '';
      qcard.classList.toggle('small', kidQ);
      if (!kidQ) { await say('bibi', `q_${a}_${b}`); chk(); }
      const t0 = Date.now();
      // 程度檢查：答錯不重選，直接告訴他口訣
      let res;
      if (checkMode) res = await askOnce(R, answers, M.choices(a, b), a * b);
      else res = await askChoice(R, answers, M.choices(a, b), a * b);
      const ms = Date.now() - t0;
      chk();
      if (checkMode) results.push({ a, b, correct: res.firstTry, ms });
      else if (!kidQ) recordAndSky(R, a, b, res.firstTry, ms);
      if (!res.firstTry && !checkMode && !kidQ) {
        // 答錯：把這題的點點排出來，一排一排數給他看
        await say('bibi', 'robot_wrong');
        chk();
        qdots.innerHTML = dotsHtml(b, a);
        for (let r = 0; r < b; r++) {
          qdots.querySelectorAll(`.r${r}`).forEach((d) => d.classList.add('lit'));
          await say('bibi', `n_${(r + 1) * a}`);
          chk();
        }
      }
      await say('bibi', `c_${a}_${b}`);
      chk();
      // 裝零件（程度檢查 12 題，兩題裝一個）
      const every = checkMode ? 2 : 1;
      if ((i + 1) % every === 0 && missing.size) {
        const part = BIBI_PARTS.find((p) => missing.has(p));
        missing.delete(part);
        paint();
        sfx('knock');
        sfx('sparkle');
        R.burstAt(robot, { n: 16, stars: true, colors: ['#7ff0c0', '#ffd23f', '#fff'] });
        if (!checkMode && res.firstTry && ms < 4000 && !kidQ) await say('bibi', 'robot_fast');
      }
      chk();
      if (turnsOn() && i < qs.length - 1) nextTurn({ say: false });
    }
    if (checkMode) {
      M.applyCheck(results);
      R.set.refreshSky();
      await say('bibi', 'robot_check_done');
      chk();
    }
    missing.clear();
    paint();
    robot.classList.add('dance');
    sfx('fanfare');
    await say('bibi', 'robot_fixed');
    await wait(400);
  } finally {
    P.close();
    setHint(null);
  }
}

// 程度檢查用：只選一次
function askOnce(R, box, opts, correct) {
  return R.race(new Promise((resolve) => {
    box.innerHTML = '';
    box.classList.add('show');
    for (const v of opts) {
      const b = document.createElement('button');
      b.className = 'ans';
      b.innerHTML = numSvg(v, { color: '#4a3b6b' });
      b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const ok = v === correct;
        sfx(ok ? 'sparkle' : 'soft');
        b.classList.add(ok ? 'right' : 'wrong');
        box.querySelectorAll('.ans').forEach((x) => { x.disabled = true; if (+x.textContent === correct) x.classList.add('right'); });
        setTimeout(() => { box.classList.remove('show'); box.innerHTML = ''; resolve({ firstTry: ok }); }, 700);
      });
      box.appendChild(b);
    }
    setHint(() => box.querySelector('.ans'));
  }));
}

// ---------------- 乘法星空（大） ----------------
async function openSky(R) {
  const P = R.panel('skypanel', { host: 'bibi', hostSvg: bibiSvg() });
  P.el.innerHTML = `<div class="skybig">${skyHtml(false)}</div><button class="closebtn">${ICON2.skip}</button>`;
  sfx('star');
  const close = () => { P.close(); };
  P.el.querySelector('.closebtn').addEventListener('click', (e) => { e.stopPropagation(); sfx('tap'); close(); });
  P.el.querySelector('.skybig').addEventListener('pointerdown', (e) => {
    const s = e.target.closest('[data-ab]');
    if (!s) return;
    const [a, b] = s.dataset.ab.split('_').map(Number);
    sfx('ding');
    s.classList.remove('tw'); void s.getBBox(); s.classList.add('tw');
    R.say('bibi', `c_${a}_${b}`);
  });
  await R.say('bibi', 'sky_open');
}
