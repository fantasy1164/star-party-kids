// 臥室（晚晚）。三個短關卡，每個 1～2 分鐘，做完馬上有星星：
//   收玩具：把玩具拖回架子上一樣形狀的影子（空間配對）；有的玩具躲在家具後面，要轉房間才找得到（凱凱的強項）
//   換衣服：白天選外出服、晚上選睡衣（生活知識）；岳岳要照順序穿（看得見的流程表，練習照步驟做事）
//   晚晚說：聽到「晚晚說」才能做，閃閃會偷偷騙人（練習「先停一下再動」，ADHD 的衝動控制，用遊戲的方式）
// 上方的流程條是今天的臥室任務（固定的順序與畫面，讓岳岳知道還有幾件事）。房間裡的東西沒在玩的時候點了也會有反應。
import { buildBedroom, TOY_SPOTS } from './bedroom-set.js';
import { div, wait, burst, stageRect, toStage, stageW, shuffle, pick } from '../core/dom.js';
import { speak } from '../core/voice.js';
import { playMusic, sfx } from '../core/audio.js';
import { state, addStar, doneToday } from '../core/store.js';
import { phase, isDark, roomTint } from '../core/clock.js';
import { turnsOn, turnsScene, callTurn, nextTurn, whoseTurn, levelNow } from '../core/turns.js';
import { setHint, setPlaying, mountClock, timeUp } from '../core/session.js';
import { KIDS } from '../config.js';
import { kidSvg } from '../art/stars.js';
import { toySvg, clothSvg, ICON, DAY_SET, NIGHT_SET } from '../art/props.js';
import { backdrop, homeBtn, rotateBtns, jars } from '../ui/hud.js';

const GAMES = [
  { id: 'toys', icon: ICON.toys, marker: { x: 40, y: 470, z: 236 } },
  { id: 'dress', icon: ICON.dress, marker: { x: 495, y: 116, z: 290 } },
  { id: 'simon', icon: ICON.ear, marker: { x: 306, y: 74, z: 250 } },
];
const ABORT = Symbol('abort');
const TARGETS = ['pillow', 'curtain', 'lamp', 'clap'];

export async function mount(root, app) {
  const profile = app.profile;
  const members = profile.members;
  let alive = true;
  backdrop(root);
  const set = buildBedroom();
  const { dio } = set;
  root.appendChild(dio.el);
  app.onLeave(() => { alive = false; setHint(null); setPlaying(false); dio.destroy(); });

  const ph = phase(state.settings);
  const night = ph === 'evening' || ph === 'night';
  dio.setTint(roomTint());
  if (isDark()) root.classList.add('night');
  if (ph === 'morning') set.win.classList.add('closed');   // 早上窗簾還關著
  // 天黑時晚晚的光：畫在調暗的那一層上面，才會真的亮（跟著房間轉）
  let glowOn = isDark();
  const paintGlow = () => {
    if (!glowOn || !alive || !set.wan.el.isConnected) { dio.glow.style.background = ''; return; }
    const r = stageRect(set.wan.el);
    dio.glow.style.background = `radial-gradient(circle at ${r.x}px ${r.y}px, rgba(255,232,150,.42) 0, rgba(255,232,150,.18) 120px, rgba(255,232,150,0) 260px)`;
  };
  dio.onRotate(paintGlow);
  requestAnimationFrame(paintGlow);

  homeBtn(root, () => app.go('house'));
  const jar = jars(root, members);
  mountClock(root);
  const rot = rotateBtns(root, dio);
  turnsScene(root);
  setPlaying(true);
  playMusic(night ? 'lullaby' : 'bedroom');

  const chk = () => { if (!alive) throw ABORT; };
  const say = (ch, id, opt = {}) => {
    if (!alive) return Promise.resolve();
    const info = opt.group ? app.nameInfo() : nowName();
    return speak(ch, id, { ...info, node: ch === 'wan' ? set.wan.el : set.shan.el });
  };
  function nowName() {
    const id = whoseTurn() || members[0];
    return { name: KIDS[id].name, who: id };
  }

  // ---- 點擊事件：關卡用 listen()，沒在玩的時候房間裡的東西也會回應 ----
  const listeners = new Set();
  const listen = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
  const emit = (name, el) => { [...listeners].forEach((f) => f(name, el)); };
  dio.onTap((name, el) => emit(name, el));
  let busy = false;
  listen((name) => { if (!busy) playful(name); });

  function playful(name) {
    if (name === 'shan') { sfx('boing'); hop(set.shan.el); }
    else if (name === 'lamp') fx('lamp');
    else if (name === 'pillow') fx('pillow');
    else if (name === 'curtain') fx('curtain');
    else if (name.startsWith('game:')) startGame(name.slice(5));
  }
  function hop(el, cls = 'hop') { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  function fx(name) {
    if (name === 'pillow') { sfx('squish'); hop(set.bed.pillow.el, 'squish'); }
    else if (name === 'curtain') { sfx('curtain'); set.win.classList.toggle('closed'); }
    else if (name === 'lamp') { sfx('giggle'); hop(set.wan.el, 'wiggle'); }
    else if (name === 'clap') { sfx('clap'); const r = stageRect(clapBtn); burst(r.x, r.y - 40, { n: 12, spread: 120 }); }
  }

  // ---- 流程條與關卡標記 ----
  const plan = div('plan ui');
  const steps = {};
  for (const g of GAMES) {
    const b = document.createElement('button');
    b.className = 'step';
    b.innerHTML = g.icon;
    b.addEventListener('click', (e) => { e.stopPropagation(); if (!busy) startGame(g.id); });
    plan.appendChild(b);
    steps[g.id] = b;
  }
  root.appendChild(plan);
  const markers = {};
  for (const g of GAMES) {
    markers[g.id] = dio.addSprite({ ...g.marker, w: 100, h: 100, html: `<div class="inner">${g.icon}</div>`, cls: 'marker', shadow: 0, tap: `game:${g.id}` });
  }
  const nextGame = () => GAMES.find((g) => !doneToday(members, g.id))?.id || null;
  function refreshPlan() {
    const nx = nextGame();
    for (const g of GAMES) {
      const done = doneToday(members, g.id);
      steps[g.id].classList.toggle('done', done);
      steps[g.id].classList.toggle('now', g.id === nx);
      markers[g.id].el.classList.toggle('done', done);
    }
  }
  function showHub(on) {
    plan.classList.toggle('hide', !on);
    for (const m of Object.values(markers)) m.el.classList.toggle('gone', !on);
    set.shan.el.classList.toggle('dim', !on);
    if (on) {
      const nx = nextGame();
      setHint(() => (nx ? markers[nx].el : null));
    }
  }
  refreshPlan();

  // 拍手鈕（晚晚說）
  const clapBtn = document.createElement('button');
  clapBtn.className = 'clapbtn ui';
  clapBtn.innerHTML = ICON.clap;
  clapBtn.style.display = 'none';
  clapBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); emit('clap', clapBtn); });
  root.appendChild(clapBtn);

  // ---- 進場 ----
  showHub(true);
  let celebrated = GAMES.every((g) => doneToday(members, g.id));
  await wait(300);
  await say('wan', `bed_hello_${ph === 'night' ? 'evening' : ph}`, { group: true });
  if (!alive) return;
  if (!busy) say('wan', 'bed_pick');

  // ---- 跑一個關卡 ----
  async function startGame(id) {
    if (busy || !alive) return;
    busy = true;
    sfx('tap');
    showHub(false);
    let finished = false;
    try {
      await ({ toys: toysGame, dress: dressGame, simon: simonGame })[id]();
      finished = true;
    } catch (e) {
      if (e !== ABORT) console.error(e);
    }
    if (!alive) return;
    setHint(null);
    if (finished) {
      addStar(members, id);
      await jar.fly(members, { x: stageW() / 2, y: 430 });
      await say('shan', members.length > 1 ? 'star_both' : 'star');
      refreshPlan();
    }
    if (!alive) return;
    dio.lock(false);
    rot.show(true);
    playMusic(night ? 'lullaby' : 'bedroom');
    await dio.animateTo({ z: 0.98, px: 320, py: 300 }, 700);
    if (timeUp()) { app.go('rest'); return; }
    if (!celebrated && GAMES.every((g) => doneToday(members, g.id))) {
      celebrated = true;
      sfx('applause');
      burst(stageW() / 2, 360, { n: 36, spread: 320 });
      await say('wan', 'bed_all_done');
      await say('shan', 'bed_all_done');
      if (ph === 'evening') await say('wan', 'bed_go_sleep');
      else if (ph === 'morning') await say('wan', 'bed_go_out');
    } else if (alive) {
      say('wan', 'bed_next');
    }
    if (!alive) return;
    showHub(true);
    busy = false;
  }

  // ================= 收玩具 =================
  async function toysGame() {
    const hidden = new Set(['car', ...(members.includes('yy') ? ['rocket'] : [])]);
    playMusic('cleanup');
    set.slots.forEach((s) => { s.sp.el.innerHTML = toySvg(s.toy, true); s.filled = false; s.sp.el.classList.remove('filled'); });
    const toys = [];
    for (const [tid, p] of Object.entries(TOY_SPOTS)) {
      const pos = !hidden.has(tid) && p.easyAt ? p.easyAt : p;
      const t = dio.addSprite({ x: pos.x, y: pos.y, w: 78, h: 78, html: toySvg(tid), cls: 'grab glowy toy-sp', shadow: 0.6 });
      Object.assign(t, { id: tid, hidden: hidden.has(tid), placed: false });
      t.el.addEventListener('pointerdown', (e) => startDrag(e, t));
      toys.push(t);
    }
    const cleanup = () => toys.forEach((t) => t.remove());
    let dragging = null;
    let left = toys.length;
    let wrongs = 0;
    let hiddenSaid = false;
    const found = new Set();
    let done;
    const finished = new Promise((r) => { done = r; });

    const remaining = () => toys.filter((t) => !t.placed);
    setHint(() => {
      if (dragging) return null;
      const r = remaining();
      const vis = r.filter((t) => !t.hidden || found.has(t.id));
      if (vis.length) return vis[0].el;
      // 只剩躲起來的：從西北邊（衣櫃、玩具箱後面）最看得清楚，提示轉房間
      return dio.quadrant() === 2 ? r[0]?.el : rot.r;
    });

    function slotAt(cx, cy) {
      const els = document.elementsFromPoint(cx, cy);
      const hit = els.find((e) => e.closest && e.closest('[data-slot]'));
      if (hit) {
        const el = hit.closest('[data-slot]');
        const s = set.slots.find((x) => x.sp.el === el);
        if (s && !s.filled) return s;
      }
      const p = toStage(cx, cy);
      let best = null, bd = 80;
      for (const s of set.slots) {
        if (s.filled) continue;
        const r = stageRect(s.sp.el);
        const d = Math.hypot(r.x - p.x, r.y - p.y);
        if (d < bd) { bd = d; best = s; }
      }
      return best;
    }

    function startDrag(e, t) {
      if (t.placed || dragging || !alive) return;
      e.preventDefault();
      e.stopPropagation();
      const r = stageRect(t.el);
      const g = div('ghost', toySvg(t.id));
      const size = Math.max(96, r.h * 1.05);
      g.style.width = g.style.height = `${size}px`;
      const p = toStage(e.clientX, e.clientY);
      g.style.left = `${p.x}px`;
      g.style.top = `${p.y}px`;
      root.appendChild(g);
      dragging = { t, g, origin: { x: r.x, y: r.y + r.h * 0.1 }, hover: null };
      t.el.classList.add('gone');
      if (t.sh) t.sh.style.visibility = 'hidden';
      sfx('pop');
      if (t.hidden && !found.has(t.id)) { found.add(t.id); sfx('sparkle'); say('shan', 'toys_found'); rot.pulse(false); }
      // 架子在西牆：從背面看不到，拿起玩具時自動把房間轉回看得到架子的角度
      const q = dio.quadrant();
      if (q === 2) dio.faceQuadrant(1);
      if (q === 3) dio.faceQuadrant(0);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    }
    function onMove(e) {
      if (!dragging) return;
      const p = toStage(e.clientX, e.clientY);
      dragging.g.style.left = `${p.x}px`;
      dragging.g.style.top = `${p.y}px`;
      const s = slotAt(e.clientX, e.clientY);
      if (dragging.hover !== s) {
        dragging.hover?.sp.el.classList.remove('hover');
        s?.sp.el.classList.add('hover');
        dragging.hover = s;
      }
    }
    function back(d) {
      d.g.classList.add('back');
      d.g.style.left = `${d.origin.x}px`;
      d.g.style.top = `${d.origin.y}px`;
      setTimeout(() => { d.g.remove(); d.t.el.classList.remove('gone'); if (d.t.sh) d.t.sh.style.visibility = ''; }, 360);
    }
    async function onUp(e) {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      const d = dragging;
      dragging = null;
      if (!d || !alive) return;
      d.hover?.sp.el.classList.remove('hover');
      const s = slotAt(e.clientX, e.clientY);
      if (s && s.toy === d.t.id) {
        const r = stageRect(s.sp.el);
        d.g.classList.add('back');
        d.g.style.left = `${r.x}px`;
        d.g.style.top = `${r.y}px`;
        s.filled = true;
        d.t.placed = true;
        await wait(300);
        d.g.remove();
        s.sp.el.innerHTML = toySvg(s.toy);
        s.sp.el.classList.add('filled');
        hop(s.sp.el);
        d.t.remove();
        sfx('knock');
        sfx('sparkle');
        burst(r.x, r.y, { n: 12, spread: 90, stars: true, colors: ['#ffd23f', '#fff3a0'] });
        left--;
        wrongs = 0;
        if (left === 0) { await wait(400); done(); return; }
        if (left % 2 === 0) say('wan', pick(['praise1', 'praise2', 'praise3']));
        const r2 = remaining();
        if (!hiddenSaid && r2.every((t) => t.hidden && !found.has(t.id))) {
          hiddenSaid = true;
          await wait(700);
          rot.pulse(true);
          await say('wan', 'toys_hidden');
        }
        if (turnsOn()) { await wait(500); nextTurn(); }
      } else {
        back(d);
        if (s) {
          sfx('soft');
          wrongs++;
          // 凱凱（或錯兩次）：把對的影子亮起來
          const right = set.slots.find((x) => x.toy === d.t.id);
          if (levelNow(profile) === 'easy' || wrongs >= 2) { right.sp.el.classList.add('glowy'); setTimeout(() => right.sp.el.classList.remove('glowy'), 3000); }
          if (wrongs === 1 || wrongs === 3) say('wan', wrongs >= 3 ? 'toys_hint' : 'toys_wrong');
        }
      }
    }

    await say('wan', members.includes('yy') && !turnsOn() ? 'toys_go_hard' : 'toys_go');
    chk();
    await callTurn();
    chk();
    try {
      await Promise.race([finished, new Promise((_, rej) => { const t = setInterval(() => { if (!alive) { clearInterval(t); rej(ABORT); } }, 500); finished.then(() => clearInterval(t)); })]);
    } finally {
      rot.pulse(false);
      cleanup();
    }
    await say('wan', 'toys_done');
  }

  // ================= 換衣服 =================
  async function dressGame() {
    const mode = night ? 'night' : 'day';
    const want = mode === 'day' ? DAY_SET : NIGHT_SET;
    const other = mode === 'day' ? NIGHT_SET : DAY_SET;
    dio.lock(true);
    rot.show(false);
    if (dio.quadrant() !== 0) await dio.faceQuadrant(0, 600);
    await dio.animateTo({ z: 1.32, px: 430, py: 420 }, 800);
    chk();
    const spots = members.length > 1 ? { yy: { x: 340, y: 500 }, kk: { x: 530, y: 390 } } : { [members[0]]: { x: 430, y: 460 } };
    const kids = {};
    const ui = [];
    for (const id of members) {
      const big = id === 'yy';
      const sp = dio.addSprite({ x: spots[id].x, y: spots[id].y, w: big ? 120 : 104, h: big ? 226 : 192, html: kidSvg(id, []), cls: 'kid-sp', shadow: 0.6 });
      kids[id] = { sp, worn: [], done: false, hard: KIDS[id].level === 'hard', items: {} };
      sp.el.dataset.kid = id;
    }
    // 托盤：一人一份（一起玩時岳岳在左、凱凱在右）
    for (const id of members) {
      const k = kids[id];
      const side = members.length > 1 ? KIDS[id].side : 'center';
      const tray = div(`tray ui ${side === 'center' ? 'center' : `v${side}`}`);
      const list = shuffle([...want, ...shuffle(other).slice(0, 2)]);
      for (const item of list) {
        const it = div('item', clothSvg(item, id));
        it.dataset.item = item;
        it.addEventListener('pointerdown', (e) => dragCloth(e, id, item, it));
        tray.appendChild(it);
        k.items[item] = it;
      }
      const ob = div('order-box ui');
      ob.innerHTML = `<div class="order">${want.map((w) => `<div class="o" data-w="${w}">${clothSvg(w, id)}</div>`).join('')}</div>`;
      if (side === 'left') { ob.classList.add('vert'); ob.style.left = '142px'; ob.style.top = '130px'; }
      else if (side === 'right') { ob.classList.add('vert'); ob.style.right = '142px'; ob.style.top = '130px'; }
      else { ob.style.bottom = '160px'; ob.style.left = '50%'; ob.style.transform = 'translateX(-50%)'; }
      root.append(tray, ob);
      ui.push(tray, ob);
      k.tray = tray;
      k.order = ob;
    }
    const paintOrder = () => {
      for (const id of members) {
        const k = kids[id];
        const nx = want.find((w) => !k.worn.includes(w));
        k.order.querySelectorAll('.o').forEach((o) => {
          o.classList.toggle('ok', k.worn.includes(o.dataset.w));
          o.classList.toggle('next', k.hard && o.dataset.w === nx);
        });
        k.tray.classList.toggle('off', turnsOn() && whoseTurn() !== id);
      }
    };
    paintOrder();
    setHint(() => {
      const id = whoseTurn() || members[0];
      const k = kids[id];
      if (!k || k.done) return null;
      const nx = want.find((w) => !k.worn.includes(w));
      return k.items[nx];
    });

    let dragging = null;
    let done;
    const finished = new Promise((r) => { done = r; });
    let lastVoice = 0;
    const voice = (id) => { if (Date.now() - lastVoice > 2500) { lastVoice = Date.now(); say('wan', id); } };

    function dragCloth(e, id, item, it) {
      if (dragging || kids[id].done || !alive) return;
      if (turnsOn() && whoseTurn() !== id) return;
      e.preventDefault();
      e.stopPropagation();
      const g = div('ghost', clothSvg(item, id));
      g.style.width = g.style.height = '130px';
      const p = toStage(e.clientX, e.clientY);
      g.style.left = `${p.x}px`;
      g.style.top = `${p.y}px`;
      root.appendChild(g);
      const r = stageRect(it);
      dragging = { id, item, it, g, origin: { x: r.x, y: r.y } };
      it.classList.add('used');
      sfx('pop');
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    }
    function move(e) {
      if (!dragging) return;
      const p = toStage(e.clientX, e.clientY);
      dragging.g.style.left = `${p.x}px`;
      dragging.g.style.top = `${p.y}px`;
    }
    // 放到哪個小孩身上：手指在誰的範圍內（放寬一點），兩個都在就選比較近的
    function kidAt(cx, cy) {
      const p = toStage(cx, cy);
      let best = null, bd = Infinity;
      for (const id of members) {
        const r = stageRect(kids[id].sp.el);
        if (Math.abs(p.x - r.x) > r.w / 2 + 50 || Math.abs(p.y - r.y) > r.h / 2 + 40) continue;
        const d = Math.hypot(p.x - r.x, p.y - r.y);
        if (d < bd) { bd = d; best = id; }
      }
      return best;
    }
    function backC(d) {
      d.g.classList.add('back');
      d.g.style.left = `${d.origin.x}px`;
      d.g.style.top = `${d.origin.y}px`;
      setTimeout(() => { d.g.remove(); d.it.classList.remove('used'); }, 360);
    }
    async function up(e) {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      const d = dragging;
      dragging = null;
      if (!d || !alive) return;
      const target = kidAt(e.clientX, e.clientY);
      const k = kids[d.id];
      if (target !== d.id) { backC(d); return; }
      if (other.includes(d.item)) { backC(d); sfx('soft'); voice(mode === 'day' ? 'dress_not_day' : 'dress_not_night'); return; }
      const nx = want.find((w) => !k.worn.includes(w));
      if (k.hard && d.item !== nx) { backC(d); sfx('soft'); voice('dress_order_wrong'); return; }
      d.g.remove();
      k.worn.push(d.item);
      k.sp.el.querySelector('svg.kid').classList.add(`w-${d.item}`);
      sfx('pop');
      sfx('sparkle');
      const r = stageRect(k.sp.el);
      burst(r.x, r.y - 20, { n: 12, spread: 110, stars: true, colors: ['#ffd23f', '#fff3a0', KIDS[d.id].color] });
      hop(k.sp.el);
      if (k.worn.length === want.length) {
        k.done = true;
        paintOrder();
        await say('wan', mode === 'day' ? 'dress_done_day' : 'dress_done_night');
        if (members.every((m) => kids[m].done)) { done(); return; }
      }
      const otherKid = members.find((m) => m !== d.id);
      if (turnsOn() && otherKid && !kids[otherKid].done) { await wait(300); await nextTurn(); }
      paintOrder();
    }

    await say('wan', mode === 'day' ? 'dress_day' : 'dress_night');
    chk();
    if (members.includes('yy')) { await say('wan', mode === 'day' ? 'dress_order_day' : 'dress_order_night'); chk(); }
    await callTurn();
    paintOrder();
    chk();
    try {
      await Promise.race([finished, new Promise((_, rej) => { const t = setInterval(() => { if (!alive) { clearInterval(t); rej(ABORT); } }, 500); finished.then(() => clearInterval(t)); })]);
      await wait(1200);
    } finally {
      ui.forEach((x) => x.remove());
      Object.values(kids).forEach((k) => k.sp.remove());
    }
  }

  // ================= 晚晚說 =================
  async function simonGame() {
    playMusic('listen');
    dio.lock(true);
    rot.show(false);
    if (dio.quadrant() !== 0) await dio.faceQuadrant(0, 700);
    await dio.animateTo({ z: 1.12, px: 300, py: 250 }, 800);
    chk();
    set.shan.el.classList.remove('dim');
    set.shan.move(420, 330);
    clapBtn.style.display = '';
    const anyHard = members.includes('yy');
    try {
      await say('wan', anyHard && !turnsOn() ? 'simon_rule_hard' : 'simon_rule');
      chk();
      await say('shan', 'simon_shan');
      chk();
      const n = anyHard ? 8 : 6;
      const plan = [false];
      for (let i = 1; i < n; i++) {
        const run = plan.slice(-2).every(Boolean);
        plan.push(!run && Math.random() < 0.38);
      }
      if (!plan.some(Boolean)) plan[2] = true;
      let prev = null;
      for (let i = 0; i < n; i++) {
        chk();
        if (turnsOn()) { await callTurn(); chk(); }
        const hard = levelNow(profile) === 'hard';
        const cmd = pick(TARGETS.filter((t) => t !== prev));
        prev = cmd;
        const trick = plan[i];
        const speaker = trick ? (hard && Math.random() < 0.5 ? 'wan' : 'shan') : 'wan';
        const line = trick ? `t_${cmd}` : `s_${cmd}`;
        const node = speaker === 'wan' ? set.wan.el : set.shan.el;
        setHint(() => (trick ? null : targetEl(cmd)));
        const res = await round({ cmd, trick, speaker, line, node, win: hard ? 3500 : 4800 });
        chk();
        if (res === 'ok') {
          sfx('sparkle');
          if (i % 3 === 2) await say('wan', pick(['praise1', 'praise2', 'praise3']));
        } else if (res === 'got') {
          sfx('giggle');
          await say(speaker, speaker === 'wan' ? 'simon_got_wan' : 'simon_got');
        } else if (res === 'held') {
          sfx('sparkle');
          const r = stageRect(set.shan.el);
          burst(r.x, r.y, { n: 14, stars: true, colors: ['#ffd23f', '#fff3a0'] });
          await say('shan', 'simon_held');
        } else if (res === 'late') {
          await say('wan', 'simon_timeout');
          chk();
          await say('wan', `where_${cmd}`);
          chk();
          await waitTarget(cmd, 7000);
        }
        chk();
        if (turnsOn() && i < n - 1) nextTurn({ say: false });
        await wait(500);
      }
      // 最後一個口令：依時間不同
      chk();
      if (night) {
        set.wan.el.classList.add('speaker-glow');
        await say('wan', 's_light_off');
        set.wan.el.classList.remove('speaker-glow');
        setHint(() => set.wan.el);
        await waitTarget('lamp', 12000, false);
        chk();
        sfx('click');
        dio.setTint('rgba(8,12,48,.62)');
        root.classList.add('lightsoff', 'night');
        glowOn = true;
        paintGlow();
        set.wan.el.querySelector('svg').classList.add('lit', 'sleepy');
        await wait(800);
        await say('wan', 'simon_done_night', { group: true });
      } else if (ph === 'morning') {
        set.win.classList.add('closed');
        set.wan.el.classList.add('speaker-glow');
        await say('wan', 's_sun_in');
        set.wan.el.classList.remove('speaker-glow');
        setHint(() => set.win);
        await waitTarget('curtain', 12000, false);
        chk();
        set.win.classList.remove('closed');
        sfx('curtain');
        dio.setTint('rgba(255,236,170,.16)');
        burst(stageW() / 2, 300, { n: 24, colors: ['#fff3a0', '#ffd23f', '#ffb627'] });
        await say('wan', 'simon_done_morning', { group: true });
      } else {
        set.wan.el.classList.add('speaker-glow');
        await say('wan', 's_dance');
        set.wan.el.classList.remove('speaker-glow');
        setHint(() => clapBtn);
        await waitTarget('clap', 15000, false);
        chk();
        sfx('applause');
        burst(stageW() / 2, 360, { n: 30, spread: 260 });
        await say('wan', 'simon_done_day');
      }
    } finally {
      clapBtn.style.display = 'none';
      set.shan.move(560, 420);
    }
  }
  function targetEl(cmd) {
    return { pillow: set.bed.pillow.el.querySelector('.top'), curtain: set.win, lamp: set.wan.el, clap: clapBtn }[cmd];
  }
  // 一個口令：說的時候就可以點；說完再等一下
  function round({ cmd, trick, line, node, speaker, win }) {
    return new Promise((resolve) => {
      let timer = null;
      let over = false;
      const finish = (r) => { if (over) return; over = true; off(); clearTimeout(timer); node.classList.remove('speaker-glow'); resolve(r); };
      const off = listen((name) => {
        if (!TARGETS.includes(name)) return;
        fx(name);
        if (trick) finish('got');
        else if (name === cmd) finish('ok');
        else { sfx('soft'); say('wan', `where_${cmd}`); }
      });
      node.classList.add('speaker-glow');
      say(speaker, line).then(() => {
        node.classList.remove('speaker-glow');
        if (!over) timer = setTimeout(() => finish(trick ? 'held' : 'late'), win);
      });
      const watch = setInterval(() => { if (!alive) { clearInterval(watch); finish('abort'); } }, 500);
    });
  }
  function waitTarget(cmd, ms, withFx = true) {
    return new Promise((resolve) => {
      const off = listen((name) => {
        if (name !== cmd) return;
        if (withFx) { fx(name); sfx('sparkle'); }
        off(); clearTimeout(t); resolve(true);
      });
      const t = setTimeout(() => { off(); resolve(false); }, ms);
    });
  }

}
