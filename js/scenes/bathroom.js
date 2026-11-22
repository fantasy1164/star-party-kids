// 廁所（橡皮小鴨呱呱）。三個短關卡：
//   刷牙：大嘴巴特寫，牙齒一區一區亮起來，用手指拿牙刷來回刷，把細菌小怪獸刷掉。
//         一次只亮一區（岳岳不會亂刷，凱凱看得清楚）；早上和晚上做完會開 2 分鐘刷牙歌，陪他們真的刷牙。
//   洗手：濕、抹肥皂、搓（手指真的在螢幕上來回搓，搓夠久才算）、沖、擦。上方是步驟圖；岳岳沒有發光提示，要照步驟圖做。
//   找危險：浴室藏了三個危險（地上有水、肥皂掉在地上、吹風機在水旁邊），一個躲在浴缸後面，要轉房間才找得到。
import { runRoom, ABORT } from './room-base.js';
import { createDiorama } from '../engine/diorama.js';
import { div, wait, burst, stageRect, toStage, shuffle } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { turnsOn, callTurn, nextTurn, levelNow } from '../core/turns.js';
import { setHint } from '../core/session.js';
import { shanSvg, starPolygon } from '../art/stars.js';
import { guaSvg, ICON2, HAZ, germSvg, toothbrushSvg } from '../art/more.js';

export function mount(root, app) {
  return runRoom(root, app, {
    id: 'bath',
    host: 'gua',
    build: buildBathroom,
    music: () => 'bath',
    lines: {
      hello: (ph) => `bath_hello_${ph === 'night' ? 'evening' : ph}`,
      pick: 'bath_pick',
      next: 'bath_next',
      allDone: [['gua', 'bath_all_done'], ['shan', 'bath_all_done']],
      after: (ph) => (ph === 'morning' || ph === 'evening' ? 'bath_go_brush' : null),
    },
    games: [
      { id: 'brush', icon: ICON2.brush, marker: { x: 165, y: 20, z: 250 }, run: brushGame },
      { id: 'wash', icon: ICON2.wash, marker: { x: 46, y: 325, z: 230 }, run: washGame },
      { id: 'haz', icon: ICON2.look, marker: { x: 390, y: 126, z: 230 }, run: hazardGame },
    ],
    playful(name, R) {
      if (name === 'gua') { sfx('bubble'); sfx('boing'); R.hop(R.set.chars.gua.el); if (Math.random() < 0.4) R.say('gua', 'gua_quack'); return true; }
      if (name === 'tub') { sfx('bubble'); sfx('bubble'); return true; }
      return false;
    },
  });
}

// ---------------- 模型 ----------------
function buildBathroom() {
  const dio = createDiorama({
    w: 600, d: 560, wallH: 300, zoom: 0.98, cy: 0.6, wall: '#e3f4fa', base: '#8fb1c4',
    floorCss: 'background: repeating-conic-gradient(#d4eef8 0 25%, #f4fbff 0 50%) 0 0/60px 60px',
  });
  // 浴墊
  dio.addDecal({ x: 300, y: 250, w: 160, h: 90, z: 0.6, css: 'border-radius:30px;background:repeating-linear-gradient(90deg,#ffb8d0 0 20px,#ffd0e0 20px 40px)' });
  // 浴缸（獨立式，後面有空間藏東西）
  dio.addBox({ x: 240, y: 56, w: 300, d: 140, h: 92, color: '#ffffff', cls: 'soft', tap: 'tub' });
  dio.addDecal({ x: 256, y: 70, w: 268, h: 112, z: 93, css: 'border-radius:40px;background:radial-gradient(circle at 30% 40%,#e9fbff 0 10%,#9fdcff 11% 100%)', html: `<svg viewBox="0 0 268 112" width="100%" height="100%">${[[40, 30, 12], [70, 70, 9], [200, 40, 14], [230, 80, 8], [150, 90, 10]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".85"/>`).join('')}</svg>` }).dataset.tap = 'tub';
  const soapDish = { x: 262, y: 74, z: 93 };
  dio.addBox({ x: 246, y: 60, w: 34, d: 28, h: 6, z: 92, color: '#ff9fc7' });
  const gua = dio.addSprite({ x: 440, y: 150, z: 88, w: 116, h: 128, html: guaSvg(), shadow: 0, tap: 'gua' });
  // 馬桶
  dio.addBox({ x: 6, y: 34, w: 32, d: 88, h: 120, color: '#ffffff' });
  dio.addBox({ x: 38, y: 44, w: 76, d: 68, h: 48, color: '#fafafa', cls: 'soft' });
  dio.addBox({ x: 38, y: 44, w: 76, d: 68, h: 6, z: 48, color: '#ffc0d4', cls: 'soft' });
  // 牙刷杯的小架子
  dio.addBox({ x: 130, y: 2, w: 72, d: 36, h: 8, z: 150, color: '#e0a873' });
  dio.addSprite({ x: 166, y: 24, z: 158, w: 54, h: 64, shadow: 0, html: `<svg viewBox="0 0 60 70" width="100%" height="100%"><rect x="12" y="30" width="36" height="38" rx="8" fill="#7fd3ff"/>
    <rect x="18" y="4" width="7" height="40" rx="3" fill="#ff8a3d" transform="rotate(-10 21 24)"/><rect x="34" y="6" width="7" height="40" rx="3" fill="#3ec7e0" transform="rotate(10 37 26)"/></svg>` });
  // 洗手台（靠西牆）
  dio.addBox({ x: 6, y: 260, w: 80, d: 130, h: 86, color: '#ffd9a8' });
  dio.addBox({ x: 14, y: 282, w: 64, d: 86, h: 12, z: 86, color: '#ffffff', cls: 'soft' });
  dio.addSprite({ x: 20, y: 325, z: 98, w: 44, h: 44, shadow: 0, html: ICON2.faucet });
  // 牆上：鏡子、窗戶、毛巾
  dio.wallArt('w', { along: dio.alongWall('w', 0, 325) - 70, up: 130, w: 140, h: 120, html: `<svg viewBox="0 0 140 120"><rect x="4" y="4" width="132" height="112" rx="50" fill="#ffd9a8"/><rect x="14" y="14" width="112" height="92" rx="44" fill="#dff4ff"/><path d="M40 30 L70 80 M60 26 L90 76" stroke="#fff" stroke-width="8" opacity=".7"/></svg>` });
  dio.wallArt('n', { along: 300, up: 170, w: 120, h: 100, html: `<svg viewBox="0 0 120 100"><rect x="4" y="4" width="112" height="92" rx="10" fill="#fff"/><rect x="12" y="12" width="96" height="76" rx="6" fill="#bfe6ff"/><path d="M60 12 V88 M12 50 H108" stroke="#fff" stroke-width="5"/></svg>` });
  dio.wallArt('n', { along: 450, up: 120, w: 110, h: 110, html: ICON2.towel });
  dio.wallArt('s', { along: 200, up: 160, w: 90, h: 90, html: ICON2.duck });
  const shan = dio.addSprite({ x: 470, y: 440, w: 120, h: 136, html: shanSvg(), shadow: 0.7, tap: 'shan' });
  return { dio, chars: { gua, shan }, soapDish };
}

// ---------------- 刷牙 ----------------
function mouthSvg() {
  const up = [], down = [];
  for (let i = 0; i < 8; i++) {
    const x = 150 + i * 80;
    const lift = Math.abs(i - 3.5) * 9;
    up.push(`<rect x="${x}" y="${150 + lift}" width="72" height="${96 - lift * 0.4}" rx="22" fill="#fffef8"/>`);
    down.push(`<rect x="${x}" y="${410 - lift * 0.3}" width="72" height="${92 - lift * 0.4}" rx="22" fill="#fffef8"/>`);
  }
  return `<svg class="mouth-svg" viewBox="0 0 940 640"><ellipse cx="470" cy="330" rx="430" ry="280" fill="#ff8fa3"/>
    <ellipse cx="470" cy="330" rx="390" ry="240" fill="#9b2d4a"/><ellipse cx="470" cy="470" rx="190" ry="80" fill="#ff7a8a"/>
    <rect x="130" y="118" width="680" height="70" rx="30" fill="#ff9fb0"/><rect x="130" y="474" width="680" height="70" rx="30" fill="#ff9fb0"/>
    ${up.join('')}${down.join('')}</svg>`;
}
function zonesFor(level) {
  const rows = [[130, 250], [395, 515]];
  const cols = level === 'hard' ? [[130, 350], [350, 590], [590, 810]] : [[130, 470], [470, 810]];
  const z = [];
  for (const [y0, y1] of rows) for (const [x0, x1] of cols) z.push({ x0, x1, y0, y1 });
  return z;
}

async function brushGame(R) {
  const { say, chk, root, race, ph } = R;
  const P = R.panel('brushpanel', { host: 'gua', hostSvg: guaSvg() });
  const el = P.el;
  try {
    const lvl = levelNow(R.profile);
    const zones = zonesFor(R.members.includes('yy') && !turnsOn() ? 'hard' : lvl);
    el.innerHTML = mouthSvg();
    const zoneEl = div('zone');
    el.appendChild(zoneEl);
    const brush = div('tbrush', toothbrushSvg);
    brush.style.left = '760px';
    brush.style.top = '580px';
    el.appendChild(brush);
    // 每區 3 隻細菌
    const colors = ['#7fd36a', '#b58bff', '#ffb347'];
    zones.forEach((z, zi) => {
      z.germs = [];
      for (let i = 0; i < 3; i++) {
        const g = div('germ', germSvg(colors[(zi + i) % 3]));
        g.style.left = `${z.x0 + 40 + ((z.x1 - z.x0 - 80) * (i + 0.5)) / 3 + (Math.random() * 20 - 10)}px`;
        g.style.top = `${(z.y0 + z.y1) / 2 + (Math.random() * 30 - 15)}px`;
        el.appendChild(g);
        z.germs.push(g);
      }
    });
    let zi = 0;
    const showZone = () => {
      const z = zones[zi];
      Object.assign(zoneEl.style, { left: `${z.x0 - 10}px`, top: `${z.y0 - 10}px`, width: `${z.x1 - z.x0 + 20}px`, height: `${z.y1 - z.y0 + 20}px` });
    };
    showZone();
    setHint(() => zoneEl);
    await say('gua', 'brush_go');
    chk();
    await callTurn();
    chk();

    const need = lvl === 'hard' ? 330 : 260;
    let acc = 0, last = null, lastScrub = 0, down = false;
    let done;
    const finished = new Promise((r) => { done = r; });
    const local = (cx, cy) => {
      const r = el.getBoundingClientRect();
      const p = toStage(cx, cy), q = toStage(r.left, r.top);
      return { x: p.x - q.x, y: p.y - q.y };
    };
    const onDown = (e) => { down = true; last = local(e.clientX, e.clientY); move(e); };
    const onUp = () => { down = false; last = null; };
    const move = (e) => {
      if (!down || zi >= zones.length) return;
      const p = local(e.clientX, e.clientY);
      brush.style.left = `${p.x}px`;
      brush.style.top = `${p.y}px`;
      const z = zones[zi];
      const inside = p.x > z.x0 - 30 && p.x < z.x1 + 30 && p.y > z.y0 - 30 && p.y < z.y1 + 30;
      if (last && inside) {
        const d = Math.hypot(p.x - last.x, p.y - last.y);
        acc += d;
        if (Date.now() - lastScrub > 130) { lastScrub = Date.now(); sfx('scrub'); }
        if (Math.random() < d / 60) {
          const f = div('foam-bit');
          const s = 18 + Math.random() * 26;
          Object.assign(f.style, { left: `${p.x - 60 + Math.random() * 40}px`, top: `${p.y - 20 + Math.random() * 30}px`, width: `${s}px`, height: `${s}px` });
          el.appendChild(f);
          setTimeout(() => f.remove(), 1400);
        }
        if (acc >= need) {
          acc = 0;
          const g = z.germs.find((x) => !x.classList.contains('gone'));
          if (g) { g.classList.add('gone'); sfx('pop'); sfx('bubble'); }
          if (z.germs.every((x) => x.classList.contains('gone'))) zoneDone();
        }
      }
      last = p;
    };
    const zoneDone = async () => {
      const z = zones[zi];
      const r = el.getBoundingClientRect();
      const q = toStage(r.left, r.top);
      burst(q.x + (z.x0 + z.x1) / 2, q.y + (z.y0 + z.y1) / 2, { n: 14, stars: true, colors: ['#fff', '#ffd23f', '#bfe9ff'] });
      sfx('sparkle');
      zi++;
      if (zi >= zones.length) { zoneEl.remove(); done(); return; }
      showZone();
      if (turnsOn()) nextTurn();
      else if (zi % 2 === 1) say('gua', 'brush_next');
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', onUp);
    try { await race(finished); } finally {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', onUp);
    }
    setHint(null);
    await say('gua', 'brush_done');
    chk();
    // 早上、晚上：陪他們真的刷牙 2 分鐘
    if (ph === 'morning' || ph === 'evening' || ph === 'night') await realBrush(R, el);
  } finally {
    P.close();
  }
}

async function realBrush(R, el) {
  const { say, chk, race } = R;
  await say('gua', 'brush_real');
  chk();
  el.innerHTML = '';
  const ring = div('timer-ring');
  el.appendChild(ring);
  const skip = document.createElement('button');
  skip.className = 'skipbtn';
  skip.innerHTML = ICON2.skip;
  el.appendChild(skip);
  playMusic('brush');
  const total = 120000;
  const t0 = Date.now();
  const cues = [[0, 'brush_real_up'], [30000, 'brush_real_down'], [60000, 'brush_real_in'], [95000, 'brush_real_tongue']];
  let skipped = false;
  skip.addEventListener('click', () => { skipped = true; });
  const draw = (k) => {
    const a = Math.max(0.0001, k) * Math.PI * 2;
    const x = 210 + 190 * Math.sin(a), y = 210 - 190 * Math.cos(a);
    ring.innerHTML = `<svg viewBox="0 0 420 420"><circle cx="210" cy="210" r="200" fill="#fff"/><circle cx="210" cy="210" r="190" fill="#e6f7ff"/>
      ${k >= 0.999 ? '<circle cx="210" cy="210" r="190" fill="#7fd3ff"/>' : `<path d="M210 210 L210 20 A190 190 0 ${a > Math.PI ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)} Z" fill="#7fd3ff"/>`}
      <g transform="translate(110 150) scale(.9)">${toothbrushSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g></svg>`;
  };
  await race(new Promise((resolve) => {
    const tick = setInterval(() => {
      const t = Date.now() - t0;
      draw(Math.min(1, t / total));
      while (cues.length && t >= cues[0][0]) say('gua', cues.shift()[1]);
      if (!R.alive() || skipped || t >= total) { clearInterval(tick); resolve(); }
    }, 250);
  }));
  playMusic(R.music());
  if (!skipped) { sfx('fanfare'); await say('gua', 'brush_real_done'); }
}

// ---------------- 洗手 ----------------
function handsSvg() {
  const hand = (flip) => `<g transform="${flip ? 'translate(280 0) scale(-1 1)' : ''}"><path d="M40 250 C28 200 30 150 48 128 C54 120 64 122 64 132 V160 M64 132 V92 C64 80 82 80 82 92 V156 M82 96 V80 C82 68 100 68 100 80 V156 M100 86 C100 74 118 74 118 86 V178 C118 222 104 250 80 250Z" fill="#ffd9b8" stroke="#e0a87a" stroke-width="4"/></g>`;
  return `<svg viewBox="0 0 280 260">${hand(false)}${hand(true)}
    <g class="wet">${[[60, 150], [96, 120], [190, 140], [220, 190], [80, 210]].map(([x, y]) => `<path d="M${x} ${y} c-6 10 -6 16 0 18 c6 -2 6 -8 0 -18z" fill="#7fd3ff"/>`).join('')}</g>
    <g class="foamy">${[[80, 150, 30], [120, 120, 26], [160, 130, 30], [200, 160, 28], [110, 190, 32], [170, 200, 30], [140, 160, 34]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#bfe9ff" stroke-width="4"/>`).join('')}</g>
    <g class="clean">${[[40, 60], [240, 70], [140, 30]].map(([x, y]) => `<polygon points="${starPolygon(x, y, 16, 6)}" fill="#ffd23f"/>`).join('')}</g></svg>`;
}

async function washGame(R) {
  const { say, chk, race } = R;
  const P = R.panel('washpanel', { host: 'gua', hostSvg: guaSvg() });
  const el = P.el;
  try {
    const STEPS = [
      { t: 'faucet', icon: ICON2.faucet, line: 'wash_s1' },
      { t: 'soap', icon: ICON2.soap, line: 'wash_s2' },
      { t: 'hands', icon: ICON2.bubbles, line: 'wash_s3', rub: true },
      { t: 'faucet', icon: ICON2.rinse, line: 'wash_s4' },
      { t: 'towel', icon: ICON2.towel, line: 'wash_s5' },
    ];
    el.innerHTML = `
      <div class="steps">${STEPS.map((s) => `<div class="s">${s.icon}</div>`).join('')}</div>
      <svg style="left:150px;top:420px;width:640px;height:220px" viewBox="0 0 640 220"><ellipse cx="320" cy="60" rx="300" ry="56" fill="#fff"/><ellipse cx="320" cy="64" rx="250" ry="40" fill="#cfeefc"/><rect x="40" y="60" width="560" height="160" fill="#ffd9a8"/></svg>
      <div class="stream"></div>
      <div class="wtap" data-w="faucet" style="left:370px;top:96px;width:200px;height:130px">${ICON2.faucet}</div>
      <div class="wtap" data-w="soap" style="left:700px;top:250px;width:150px;height:170px">${ICON2.soap}</div>
      <div class="wtap towel-fly" data-w="towel" style="left:60px;top:200px;width:170px;height:190px">${ICON2.towel}</div>
      <div class="wtap hands" data-w="hands">${handsSvg()}</div>
      <svg class="rubring" viewBox="0 0 340 320"><circle cx="170" cy="160" r="150" fill="none" stroke="#e6f7ff" stroke-width="16"/>
        <circle class="prog" cx="170" cy="160" r="150" fill="none" stroke="#7fd3ff" stroke-width="16" stroke-linecap="round" stroke-dasharray="0 943" transform="rotate(-90 170 160)"/></svg>`;
    el.querySelectorAll('.wtap svg').forEach((s) => { s.setAttribute('width', '100%'); s.setAttribute('height', '100%'); });
    const stepEls = [...el.querySelectorAll('.steps .s')];
    const hands = el.querySelector('.hands');
    const stream = el.querySelector('.stream');
    const prog = el.querySelector('.rubring .prog');
    prog.parentElement.style.display = 'none';
    await say('gua', 'wash_go');
    chk();
    await callTurn();
    chk();
    let lastWrong = 0;
    for (let i = 0; i < STEPS.length; i++) {
      const s = STEPS[i];
      stepEls.forEach((x, k) => { x.classList.toggle('now', k === i); x.classList.toggle('ok', k < i); });
      const target = el.querySelector(`[data-w="${s.t}"]`);
      const easy = levelNow(R.profile) === 'easy';
      if (easy) target.classList.add('glowy-2d');
      setHint(() => target);
      say('gua', s.line);
      if (s.rub) {
        // 搓：手指在手上來回搓，搓夠久才算
        prog.parentElement.style.display = '';
        const need = easy ? 2400 : 3400;
        let acc = 0, last = null, half = false, lastSfx = 0;
        await race(new Promise((resolve) => {
          const local = (e) => toStage(e.clientX, e.clientY);
          const dn = (e) => { if (e.target.closest('[data-w="hands"]') || e.target.closest('.rubring')) last = local(e); else wrongTap(e); };
          const mv = (e) => {
            if (!last) return;
            const p = local(e);
            const hr = stageRect(hands);
            if (Math.abs(p.x - hr.x) > hr.w * 0.75 || Math.abs(p.y - hr.y) > hr.h * 0.75) { last = p; return; }
            acc += Math.hypot(p.x - last.x, p.y - last.y);
            last = p;
            const k = Math.min(1, acc / need);
            prog.setAttribute('stroke-dasharray', `${(943 * k).toFixed(0)} 943`);
            hands.style.setProperty('--foam', (0.3 + k * 0.8).toFixed(2));
            if (Date.now() - lastSfx > 150) { lastSfx = Date.now(); sfx('bubble'); }
            if (!half && k > 0.5) { half = true; say('gua', 'wash_s3_more'); }
            if (k >= 1) { cleanup(); resolve(); }
          };
          const upx = () => { last = null; };
          const cleanup = () => { el.removeEventListener('pointerdown', dn); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', upx); };
          el.addEventListener('pointerdown', dn);
          window.addEventListener('pointermove', mv);
          window.addEventListener('pointerup', upx);
        }));
        prog.parentElement.style.display = 'none';
        sfx('sparkle');
      } else {
        await race(new Promise((resolve) => {
          const dn = (e) => {
            const w = e.target.closest('[data-w]')?.dataset.w;
            if (w === s.t) { el.removeEventListener('pointerdown', dn); resolve(); }
            else wrongTap(e);
          };
          el.addEventListener('pointerdown', dn);
        }));
      }
      chk();
      target.classList.remove('glowy-2d');
      // 動作的效果
      if (i === 0 || i === 3) {
        sfx('water');
        stream.classList.add('on');
        await wait(1300);
        stream.classList.remove('on');
        if (i === 0) { hands.classList.add('is-wet'); await wait(200); await say('gua', 'wash_s1_off'); }
        else { hands.classList.remove('is-foamy'); hands.classList.add('is-wet'); }
      } else if (i === 1) {
        sfx('pump');
        R.hop(target, 'shake');
        hands.style.setProperty('--foam', '0.3');
        hands.classList.add('is-foamy');
      } else if (i === 4) {
        const t = target;
        t.style.left = '370px'; t.style.top = '250px';
        sfx('mop');
        await wait(600);
        hands.classList.remove('is-wet');
        hands.classList.add('is-clean');
        t.style.left = '60px'; t.style.top = '200px';
        sfx('sparkle');
      }
      chk();
      if (turnsOn() && i < STEPS.length - 1) await nextTurn();
    }
    stepEls.forEach((x) => { x.classList.remove('now'); x.classList.add('ok'); });
    R.burstAt(hands, { n: 22, stars: true, colors: ['#ffd23f', '#fff3a0', '#bfe9ff'] });
    await say('gua', 'wash_done');
    function wrongTap(e) {
      if (!e.target.closest('[data-w]')) return;
      sfx('soft');
      if (Date.now() - lastWrong > 3500) { lastWrong = Date.now(); say('gua', 'wash_wrong'); }
    }
  } finally {
    P.close();
  }
}

// ---------------- 找危險 ----------------
async function hazardGame(R) {
  const { set, dio, say, chk, listen, race, rot } = R;
  const hz = {
    puddle: dio.addDecal({ x: 250, y: 360, w: 170, h: 96, z: 0.9, html: HAZ.puddle, css: 'transition:opacity .8s' }),
    soap: dio.addSprite({ x: 400, y: 28, w: 60, h: 42, html: HAZ.soap, shadow: 0.5, tap: 'hz:soap' }),
    dryer: dio.addSprite({ x: 44, y: 384, z: 86, w: 78, h: 78, html: HAZ.dryer, shadow: 0.5, tap: 'hz:dryer' }),
  };
  hz.puddle.dataset.tap = 'hz:puddle';
  const fixed = new Set();
  const cleanup = () => { hz.puddle.remove(); hz.soap.remove(); hz.dryer.remove(); rot.pulse(false); };
  try {
    await say('gua', 'haz_go');
    chk();
    await callTurn();
    chk();
    let hiddenSaid = false;
    setHint(() => {
      const left = ['puddle', 'dryer'].filter((k) => !fixed.has(k));
      if (left.length) return left[0] === 'puddle' ? hz.puddle : hz.dryer.el;
      if (!fixed.has('soap')) return [1, 2].includes(dio.quadrant()) ? hz.soap.el : rot.r;
      return null;
    });
    await race(new Promise((resolve) => {
      const off = listen(async (name) => {
        if (!name.startsWith('hz:')) return;
        const k = name.slice(3);
        if (fixed.has(k)) return;
        fixed.add(k);
        rot.pulse(false);
        if (k === 'puddle') { sfx('mop'); hz.puddle.style.opacity = '0'; }
        else if (k === 'soap') { sfx('boing'); jump(hz.soap, set.soapDish.x, set.soapDish.y, set.soapDish.z); }
        else if (k === 'dryer') { sfx('click'); jump(hz.dryer, 166, 20, 158); }
        R.burstAt(k === 'puddle' ? hz.puddle : hz[k].el, { n: 14, stars: true, colors: ['#ffd23f', '#fff3a0', '#7fd3ff'] });
        sfx('sparkle');
        await say('gua', `haz_${k}`);
        if (fixed.size === 3) { off(); resolve(); return; }
        if (!hiddenSaid && !fixed.has('soap') && fixed.size === 2) {
          hiddenSaid = true;
          rot.pulse(true);
          await say('gua', 'haz_hidden');
        }
        if (turnsOn()) nextTurn();
      });
    }));
    await wait(400);
    await say('gua', 'haz_done');
  } finally {
    await wait(300);
    cleanup();
  }
}

function jump(sp, x1, y1, z1, ms = 650) {
  const { x: x0, y: y0, z: z0 } = sp;
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / ms);
    sp.move(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, z0 + (z1 - z0) * k + 160 * 4 * k * (1 - k));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
export { jump };
