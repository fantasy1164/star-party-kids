// 房間共用架構：每個房間都是「立體模型＋三個短關卡」。
// 這裡處理所有房間都一樣的部分：
//   背景、回家鈕、星星罐、發條時鐘、轉房間鈕、輪流、音樂、
//   上方的流程條（今天這個房間的三件事）與漂浮的關卡標記、進場打招呼、
//   跑關卡 → 星星飛進罐子 → 檢查時間 → 三個都做完就慶祝、
//   點擊事件（關卡用 listen()；沒在玩關卡時點房間裡的角色也會有反應）、
//   拖曳（R.drag）、特寫面板（R.panel：把房間調暗，畫面中間只留一件事，給岳岳專心用）。
//
// 每個房間檔案提供 spec：
//   build()        → 建好模型，回傳 set（至少有 dio、chars: { 角色id: sprite }）
//   host           → 這個房間的主角（說打招呼、下一個、完成的台詞）
//   lines          → { hello(ph), pick, next, allDone: [[角色, 台詞]], after(ph) }
//   music(night)   → 背景音樂名稱
//   games          → [{ id, icon, marker: {x,y,z}, run(R) }]
//   back           → 左上角回家鈕要回哪裡（家裡的房間回 'house'，小鎮的地點回 'town'）
//   setup(R)       → 房間自己的初始化（可省略）
//   playful(name, R) → 沒在玩關卡時點到東西的反應，處理了就回傳 true（可省略）
import { div, wait, burst, stageRect, toStage, stageW, onFit } from '../core/dom.js';
import { speak } from '../core/voice.js';
import { playMusic, sfx } from '../core/audio.js';
import { state, addStar, doneToday } from '../core/store.js';
import { showNewSticker } from './fun.js';
import { phase, isDark, roomTint } from '../core/clock.js';
import { turnsScene, whoseTurn } from '../core/turns.js';
import { setHint, setPlaying, mountClock, timeUp } from '../core/session.js';
import { KIDS } from '../config.js';
import { backdrop, homeBtn, rotateBtns, jars } from '../ui/hud.js';

export const ABORT = Symbol('abort');

export async function runRoom(root, app, spec) {
  const profile = app.profile;
  const members = profile.members;
  let alive = true;
  backdrop(root);
  const set = spec.build();
  const { dio } = set;
  root.appendChild(dio.el);
  app.onLeave(() => { alive = false; setHint(null); setPlaying(false); dio.destroy(); });

  const ph = phase(state.settings);
  const night = ph === 'evening' || ph === 'night';
  dio.setTint(roomTint());
  if (isDark()) root.classList.add('night');

  homeBtn(root, () => app.go(spec.back || 'house'));
  const jar = jars(root, members);
  mountClock(root);
  const rot = rotateBtns(root, dio);
  turnsScene(root);
  setPlaying(true);
  const roomMusic = () => spec.music(night, ph);
  playMusic(roomMusic());

  // ---- 說話 ----
  const nodeOverride = {};
  function nowName() {
    const id = whoseTurn() || members[0];
    return { name: KIDS[id].name, who: id };
  }
  const say = (ch, id, opt = {}) => {
    if (!alive) return Promise.resolve();
    const info = opt.group ? app.nameInfo() : nowName();
    return speak(ch, id, { ...info, node: nodeOverride[ch] || set.chars[ch]?.el || null });
  };

  // ---- 點擊事件 ----
  const listeners = new Set();
  const listen = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
  const emit = (name, el) => { [...listeners].forEach((f) => f(name, el)); };
  dio.onTap((name, el) => emit(name, el));

  const hop = (el, cls = 'hop') => { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const chk = () => { if (!alive) throw ABORT; };
  // 等一個 promise，但離開房間時立刻中止
  const race = (p) => Promise.race([p, new Promise((_, rej) => {
    const t = setInterval(() => { if (!alive) { clearInterval(t); rej(ABORT); } }, 400);
    Promise.resolve(p).finally(() => clearInterval(t));
  })]);

  const R = {
    app, profile, members, root, set, dio, rot, jar, ph, night,
    alive: () => alive, chk, race, say, listen, emit, hop, nowName,
    music: roomMusic,
    dragging: null,
    // 拖曳：手指上出現一個跟著走的影子。onDrop(cx, cy) 回傳落點（舞台座標）就吸過去，回傳 null 就彈回原位。
    drag(e, { html, size = 110, originEl, onStart, onMove, onDrop, onPlaced, onBack }) {
      if (R.dragging || !alive) return false;
      e.preventDefault();
      e.stopPropagation();
      const r = stageRect(originEl);
      const g = div('ghost', html);
      g.style.width = g.style.height = `${size}px`;
      const p = toStage(e.clientX, e.clientY);
      g.style.left = `${p.x}px`;
      g.style.top = `${p.y}px`;
      root.appendChild(g);
      const d = { g, origin: { x: r.x, y: r.y } };
      R.dragging = d;
      sfx('pop');
      onStart?.(d);
      const move = (ev) => {
        const q = toStage(ev.clientX, ev.clientY);
        g.style.left = `${q.x}px`;
        g.style.top = `${q.y}px`;
        onMove?.(ev.clientX, ev.clientY);
      };
      const up = async (ev) => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        R.dragging = null;
        if (!alive) { g.remove(); return; }
        const to = onDrop(ev.clientX, ev.clientY, d);
        g.classList.add('back');
        if (to) {
          g.style.left = `${to.x}px`;
          g.style.top = `${to.y}px`;
          await wait(280);
          g.remove();
          await onPlaced?.(to);
        } else {
          g.style.left = `${d.origin.x}px`;
          g.style.top = `${d.origin.y}px`;
          await wait(360);
          g.remove();
          onBack?.();
        }
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      return true;
    },
    // 特寫面板：房間調暗，中間一張大卡片。host：卡片左下角放一個會說話的主角（2D）
    panel(cls = '', { host = null, hostSvg = '' } = {}) {
      const scrim = div('scrim');
      const pnl = div(`panel ${cls}`);
      root.append(scrim, pnl);
      let face = null;
      if (host) {
        face = div('panel-host', hostSvg);
        root.appendChild(face);
        nodeOverride[host] = face;
      }
      return {
        el: pnl,
        close() {
          scrim.remove(); pnl.remove(); face?.remove();
          if (host) delete nodeOverride[host];
        },
      };
    },
    // 把 2D 的點換成面板內座標：面板固定 940×620 置中
    burstAt(el, opt) { const r = stageRect(el); burst(r.x, r.y, opt); },
  };

  // ---- 流程條與關卡標記 ----
  const plan = div('plan ui');
  const steps = {};
  for (const g of spec.games) {
    const b = document.createElement('button');
    b.className = 'step';
    b.innerHTML = g.icon;
    b.addEventListener('click', (e) => { e.stopPropagation(); if (!busy) startGame(g.id); });
    plan.appendChild(b);
    steps[g.id] = b;
  }
  root.appendChild(plan);
  // 關卡多（醫院有五個）時按鈕小一點；兩兄弟一起玩、左上有兩個星星罐時，流程條往右讓開，不要蓋住罐子
  if (spec.games.length > 4) plan.classList.add('many');
  const placePlan = () => {
    plan.style.setProperty('--plan-dx', '0px');
    const jb = root.querySelector('.jars');
    if (!jb || plan.classList.contains('hide')) return;
    const a = stageRect(jb), b = stageRect(plan);
    const need = a.left + a.w + 14 - b.left;
    if (need > 0) plan.style.setProperty('--plan-dx', `${Math.min(need, Math.max(0, stageW() - 150 - (b.left + b.w)))}px`);
  };
  requestAnimationFrame(placePlan);
  const offFit = onFit(placePlan);
  app.onLeave(offFit);
  const markers = {};
  for (const g of spec.games) {
    markers[g.id] = dio.addSprite({ ...g.marker, w: 100, h: 100, html: `<div class="inner">${g.icon}</div>`, cls: 'marker', shadow: 0, tap: `game:${g.id}` });
  }
  const nextGame = () => spec.games.find((g) => !doneToday(members, `${spec.id}.${g.id}`))?.id || null;
  function refreshPlan() {
    const nx = nextGame();
    for (const g of spec.games) {
      const done = doneToday(members, `${spec.id}.${g.id}`);
      steps[g.id].classList.toggle('done', done);
      steps[g.id].classList.toggle('now', g.id === nx);
      markers[g.id].el.classList.toggle('done', done);
    }
  }
  function showHub(on) {
    plan.classList.toggle('hide', !on);
    if (on) requestAnimationFrame(placePlan);
    for (const m of Object.values(markers)) m.el.classList.toggle('gone', !on);
    if (on) {
      const nx = nextGame();
      setHint(() => (nx ? markers[nx].el : null));
    }
  }
  R.showHub = showHub;
  refreshPlan();

  let busy = false;
  listen((name, el) => {
    if (busy) return;
    if (name.startsWith('game:')) { startGame(name.slice(5)); return; }
    if (spec.playful?.(name, R, el)) return;
    const sp = set.chars[name];
    if (sp) { sfx('boing'); hop(sp.el); }
  });
  spec.setup?.(R);

  async function startGame(id) {
    if (busy || !alive) return;
    const g = spec.games.find((x) => x.id === id);
    if (!g) return;
    busy = true;
    sfx('tap');
    showHub(false);
    // 玩關卡時，不是主角的角色先變淡、點不到（不擋住要拖的東西，也少一點干擾）
    const dimmed = Object.entries(set.chars).filter(([k]) => k !== spec.host).map(([, sp]) => sp.el);
    dimmed.forEach((el) => el.classList.add('dim'));
    let finished = false;
    try {
      await g.run(R);
      finished = true;
    } catch (e) {
      if (e !== ABORT) console.error(e);
    }
    if (!alive) return;
    dimmed.forEach((el) => el.classList.remove('dim'));
    setHint(null);
    if (finished) {
      addStar(members, `${spec.id}.${id}`);
      await jar.fly(members, { x: stageW() / 2, y: 430 });
      await say('shan', members.length > 1 ? 'star_both' : 'star');
      // 愷愷：每做完一關多一張貼紙（可以拿去貼在小鎮上）
      if (alive && members.includes('kk')) await showNewSticker(root);
      refreshPlan();
    }
    if (!alive) return;
    dio.lock(false);
    rot.show(true);
    playMusic(roomMusic());
    await dio.animateTo({ z: spec.zoom || 0.98, px: dio.o.w / 2, py: dio.o.d / 2 }, 700);
    if (timeUp()) { app.go('rest'); return; }
    if (!celebrated && spec.games.every((x) => doneToday(members, `${spec.id}.${x.id}`))) {
      celebrated = true;
      sfx('applause');
      burst(stageW() / 2, 360, { n: 36, spread: 320 });
      for (const [ch, line] of spec.lines.allDone) await say(ch, line);
      const after = spec.lines.after?.(ph);
      if (after) await say(spec.host, after);
      if (spec.onAllDone) await spec.onAllDone(R);   // 例：節慶舞台全部做完 → 相簿多一張
    } else if (alive) {
      say(spec.host, spec.lines.next);
    }
    if (!alive) return;
    showHub(true);
    busy = false;
  }
  R.startGame = startGame;

  // ---- 進場 ----
  showHub(true);
  let celebrated = spec.games.every((g) => doneToday(members, `${spec.id}.${g.id}`));
  await wait(300);
  await say(spec.host, spec.lines.hello(ph), { group: true });
  if (alive && !busy) say(spec.host, spec.lines.pick);
  return R;
}
