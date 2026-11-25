// 開場：桌上一個會發光的禮物盒 → 點一下，蓋子打開（盒子是空心的，看得到裡面在發光），
// 閃閃和每個地方的明星一個一個跳出來圍成一圈 → 標題 → 隨機 3 位用自己的聲音歡迎、大家一起喊「歡迎岳岳、愷愷！」→ 選人。
// 每次開 app 都要先點禮物盒（iOS 規定聲音一定要在小孩觸碰之後才能開始）。第一次多一段閃閃的自我介紹。
import { createDiorama } from '../engine/diorama.js';
import { div, wait, burst, longPress, shuffle } from '../core/dom.js';
import { speak, primeTts, chorus } from '../core/voice.js';
import { unlock, playMusic, sfx } from '../core/audio.js';
import { state, markSeen, save } from '../core/store.js';
import { shanSvg, kidHead, bothHeads, starPolygon } from '../art/stars.js';
import { ICON } from '../art/props.js';
import { CAST } from '../data/cast.js';
import { gestureTipDue, practice } from './gestures.js';
import { backdrop } from './hud.js';
import { roomTint } from '../core/clock.js';
import { mainFest, daysUntil } from '../core/festival.js';
import { ACCESSORY, FEST_COLOR } from '../art/festival.js';

const TITLE = [['明', '星', '總', '動', '員'], ['歡', '樂', '派', '對']];
const COLORS = ['#ff5d8f', '#ffb627', '#3ec7e0', '#7ee06a', '#a98bff', '#ff8a3d', '#1fa7c9', '#ff5d8f', '#ffb627'];

export async function mount(root, app) {
  backdrop(root);
  // 場地放大：盒子在中間，明星們圍成一圈
  const S = 900, C = S / 2;
  const dio = createDiorama({ w: S, d: S, walls: false, zoom: 0.7, cy: 0.55, base: '#c98b5e',
    floorCss: 'background: radial-gradient(circle, #fff6e6 0 34%, #ffe2c2 34% 70%, #ffd2a8 70% 100%); border-radius: 50%' });
  root.appendChild(dio.el);
  app.onLeave(() => dio.destroy());
  dio.setTint(roomTint());

  // 節慶或生日（11/25）：禮物盒換節慶顏色、每位明星頭上戴小配件、換一段節慶的歡迎詞和音樂
  const fx = mainFest();
  const [boxC, lidC] = fx ? FEST_COLOR[fx.id] : ['#ff8fb8', '#ffd23f'];
  // 禮物盒：四面牆有厚度、中間是空的（打開蓋子看得到裡面），裡面的底在發光
  const bw = 200, bh = 150, T = 16, bx = C - bw / 2, by = C - bw / 2;
  const star = (w) => `<svg viewBox="0 0 ${w} ${bh}" width="100%" height="100%"><polygon points="${starPolygon(w / 2, 78, 42, 19)}" fill="#fff6b0" stroke="#fff6b0" stroke-width="10" stroke-linejoin="round"/></svg>`;
  const wall = { color: boxC, tap: 'box' };
  dio.addBox({ ...wall, x: bx, y: by, w: bw, d: T, h: bh, faces: { n: star(bw) } });
  dio.addBox({ ...wall, x: bx, y: by + bw - T, w: bw, d: T, h: bh, faces: { s: star(bw) } });
  dio.addBox({ ...wall, x: bx, y: by + T, w: T, d: bw - T * 2, h: bh, faces: { w: star(bw - T * 2) } });
  dio.addBox({ ...wall, x: bx + bw - T, y: by + T, w: T, d: bw - T * 2, h: bh, faces: { e: star(bw - T * 2) } });
  // 盒子裡面：深一點的粉紅底，打開後亮起來
  dio.addDecal({ x: bx + T, y: by + T, w: bw - T * 2, h: bw - T * 2, z: 2, css: 'background:#d9608f' });
  const inner = dio.addDecal({ x: bx + T, y: by + T, w: bw - T * 2, h: bw - T * 2, z: 3, cls: 'box-glow',
    css: 'background: radial-gradient(circle, #fff8c0 0, #ffd23f 40%, rgba(255,210,63,0) 75%)' });
  const lidWrap = div('dio-box lid');
  lidWrap.style.cssText = `left:${bx - 8}px;top:${by - 8}px;width:${bw + 16}px;height:${bw + 16}px;transform:translateZ(${bh}px);--bh:${bh}px`;
  dio.world.appendChild(lidWrap);
  dio.addBox({ x: 0, y: 0, w: bw + 16, d: bw + 16, h: 18, color: lidC, cls: 'soft', parent: lidWrap, tap: 'box',
    faces: { t: `<svg viewBox="0 0 216 216" width="100%" height="100%"><polygon points="${starPolygon(108, 108, 56, 24)}" fill="#fff" opacity=".8"/></svg>` } });

  // 明星們：一開始都躲在盒子裡；閃閃站在正前方，其他人圍成一圈（正前方留給閃閃和選人）
  const shanC = CAST[0];
  const shan = dio.addSprite({ x: C, y: C, z: 0, w: 150, h: 170, html: shanC.svg(), cls: 'gone', shadow: 0.7, tap: 'ch:shan' });
  const others = CAST.slice(1);
  // 「正前方」＝鏡頭那一邊（跟鏡頭一開始的角度有關）
  const front = (Math.atan2(Math.cos((dio.view.a * Math.PI) / 180), Math.sin((dio.view.a * Math.PI) / 180)) * 180) / Math.PI;
  const ring = others.map((c, i) => {
    const th = ((front + 38 + (284 * i) / (others.length - 1)) * Math.PI) / 180;   // 從右前方繞一圈到左前方，正前方留空
    return { c, x: C + Math.cos(th) * 330, y: C + Math.sin(th) * 330 };
  });
  const fr = (front * Math.PI) / 180;
  const shanAt = { x: C + Math.cos(fr) * 175, y: C + Math.sin(fr) * 175 };
  const sprites = { shan };
  ring.forEach((r) => { sprites[r.c.id] = dio.addSprite({ x: C, y: C, z: 40, w: 104, h: 112, html: r.c.svg(), cls: 'gone', shadow: 0.6, tap: `ch:${r.c.id}` }); });
  if (fx) Object.values(sprites).forEach((sp) => sp.el.insertAdjacentHTML('beforeend', `<i class="acc">${ACCESSORY[fx.id]}</i>`));

  const lock = div('lockbtn ui', ICON.lock);
  root.appendChild(lock);
  longPress(lock, 3000, () => app.parent());

  let opened = false;
  const short = !!state.seen.opening;
  const open = async () => {
    if (opened) return;
    opened = true;
    unlock();
    primeTts();
    sfx('open');
    lidWrap.classList.add('off');
    await wait(300);
    inner.classList.add('on');
    // 閃閃先跳出來，站到正前方
    shan.el.classList.remove('gone');
    sfx('boing');
    jump(shan, C, C, 40, shanAt.x, shanAt.y, 0, 700, 260);
    playMusic(fx ? { birthday: 'fest_birthday', pbirthday: 'fest_birthday', mother: 'fest_love', father: 'fest_love', kids: 'party', cny: 'fest_cny', dragon: 'fest_dragon', moon: 'fest_moon', halloween: 'fest_halloween', xmas: 'fest_xmas' }[fx.id] : 'party');
    burst(app.stageCenter().x, 380, { n: 26, spread: 260 });
    // 其他明星一個接一個跳出來，圍成一圈（「啵」不要每個都響，人多會太吵）
    ring.forEach((r, i) => setTimeout(() => {
      const sp = sprites[r.c.id];
      sp.el.classList.remove('gone');
      if (i % 3 === 0) sfx('pop');
      jump(sp, C, C, 60, r.x, r.y, 0, 620, 240);
    }, 300 + i * (short ? 70 : 110)));
    await wait(700);
    await showTitle(root, short);
    // 每次都完整喊出「明星總動員！歡樂派對！」
    await speak('shan', 'title', { node: shan.el });
    // 隨機 3 位明星用自己的聲音歡迎，再大家一起喊「歡迎岳岳、愷愷！」
    // 節慶或生日：改成閃閃說節慶的歡迎詞（還有幾天、今天就是），生日是大家一起喊生日快樂
    if (fx) {
      if (fx.id === 'birthday') {
        const crowd0 = [CAST[0], ...shuffle(others).slice(0, 5)];
        crowd0.forEach((c) => hop(sprites[c.id]));
        await chorus(crowd0.map((c) => c.id), 'bd_all', crowd0.map((c) => sprites[c.id].el));
        for (const k of fx.who) await speak('shan', `bd_hi_${k}`, { node: shan.el });
      } else {
        const d = daysUntil(fx);
        await speak('shan', fx.phase === 'pre' ? `fx_pre_${fx.id}` : `fx_day_${fx.id}`, { node: shan.el });
        if (fx.phase === 'pre' && d >= 1 && d <= 7) await speak('shan', `fx_days_${d}`, { node: shan.el });
      }
    } else for (const c of shuffle(others).slice(0, 3)) {
      const sp = sprites[c.id];
      hop(sp);
      await speak(c.id, 'hi_open', { node: sp.el });
    }
    const crowd = [CAST[0], ...shuffle(others).slice(0, 5)];
    crowd.forEach((c) => hop(sprites[c.id]));
    burst(app.stageCenter().x, 330, { n: 18, spread: 320 });
    await chorus(crowd.map((c) => c.id), 'hi_all', crowd.map((c) => sprites[c.id].el));
    if (!short) await speak('shan', 'intro', { node: shan.el });
    // 每天第一次：跟閃閃練習手勢（家長頁可以關掉）
    if (gestureTipDue()) await practice(root, dio, { node: shan.el, alive: () => app.alive() });
    if (!app.alive()) return;
    markSeen('opening');
    greeted = true;
    showPicker();
  };
  let greeted = false;
  dio.onTap((name) => {
    if (name === 'box') { open(); return; }
    // 打完招呼以後，點明星：跳一下、說自己的歡迎詞
    if (greeted && name.startsWith('ch:')) {
      const id = name.slice(3);
      hop(sprites[id]);
      speak(id, 'hi_open', { node: sprites[id].el });
    }
  });
  // 沒點到箱子也可以（小孩可能點旁邊）
  root.addEventListener('click', (e) => { if (!opened && !e.target.closest('.lockbtn')) open(); });

  async function showPicker() {
    const p = div('picker');
    const opts = [['yy', kidHead('yy', 210)], ['kk', kidHead('kk', 210)], ['both', bothHeads(210)]];
    for (const [id, html] of opts) {
      const b = document.createElement('button');
      b.className = 'pick';
      b.innerHTML = html;
      b.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (p.dataset.done) return;
        p.dataset.done = '1';
        sfx('tap');
        b.classList.add('hop');
        // 一起玩：每次換另一個人先開始
        let first = null;
        if (id === 'both') {
          first = state.seen.lastFirst === 'yy' ? 'kk' : 'yy';
          state.seen.lastFirst = first;
          save();
        }
        await app.choose(id, first, shan.el);
      });
      p.appendChild(b);
    }
    root.appendChild(p);
    await speak('shan', 'who', { node: shan.el });
  }
}

// 原地跳一下
function hop(sp) {
  if (!sp) return;
  sp.el.classList.remove('hop');
  void sp.el.offsetWidth;
  sp.el.classList.add('hop');
}

// 拋物線跳過去（z 往上再落下）
function jump(sp, x0, y0, z0, x1, y1, z1, ms, peak) {
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / ms);
    const z = z0 + (z1 - z0) * k + peak * 4 * k * (1 - k);
    sp.move(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, z);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

async function showTitle(root, short) {
  const t = div('title');
  let n = 0;
  t.innerHTML = TITLE.map((row, r) => `<span class="row row${r + 1}">${row.map((c) => `<span class="ch" style="--c:${COLORS[n++ % COLORS.length]}">${c}</span>`).join('')}</span>`).join('');
  root.appendChild(t);
  const chs = [...t.querySelectorAll('.ch')];
  for (const c of chs) {
    c.classList.add('on');
    sfx('tap');
    await wait(short ? 70 : 140);
  }
}
