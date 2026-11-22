// 開場：桌上一個會發光的玩具箱 → 點一下，蓋子打開，閃閃跳出來，玩具一個一個飛出來，標題一個字一個字跳出來 → 選人。
// 每次開 app 都要先點玩具箱（iOS 規定聲音一定要在小孩觸碰之後才能開始）。第一次是長版，之後是短版。
import { createDiorama } from '../engine/diorama.js';
import { div, wait, burst, longPress } from '../core/dom.js';
import { speak, primeTts } from '../core/voice.js';
import { unlock, playMusic, sfx } from '../core/audio.js';
import { state, markSeen, save } from '../core/store.js';
import { shanSvg, kidHead, bothHeads, starPolygon } from '../art/stars.js';
import { toySvg, ICON, TOY_IDS } from '../art/props.js';
import { backdrop } from './hud.js';
import { roomTint } from '../core/clock.js';

const TITLE = [['明', '星', '總', '動', '員'], ['歡', '樂', '派', '對']];
const COLORS = ['#ff5d8f', '#ffb627', '#3ec7e0', '#7ee06a', '#a98bff', '#ff8a3d', '#1fa7c9', '#ff5d8f', '#ffb627'];

export async function mount(root, app) {
  backdrop(root);
  const dio = createDiorama({ w: 520, d: 520, walls: false, zoom: 1.05, cy: 0.66, base: '#c98b5e',
    floorCss: 'background: radial-gradient(circle, #fff6e6 0 40%, #ffe2c2 40% 100%); border-radius: 20px' });
  root.appendChild(dio.el);
  app.onLeave(() => dio.destroy());
  dio.setTint(roomTint());

  // 玩具箱：箱子＋可以打開的蓋子
  const bx = 170, by = 170, bw = 180, bd = 180, bh = 140;
  const star = `<svg viewBox="0 0 180 140" width="100%" height="100%"><polygon points="${starPolygon(90, 74, 40, 18)}" fill="#fff6b0" stroke="#fff6b0" stroke-width="10" stroke-linejoin="round"/></svg>`;
  dio.addBox({ x: bx, y: by, w: bw, d: bd, h: bh, color: '#ff8fb8', cls: 'soft', faces: { s: star, e: star }, tap: 'box' });
  const lidWrap = div('dio-box lid');
  lidWrap.style.cssText = `left:${bx - 8}px;top:${by - 8}px;width:${bw + 16}px;height:${bd + 16}px;transform:translateZ(${bh}px)`;
  dio.world.appendChild(lidWrap);
  dio.addBox({ x: 0, y: 0, w: bw + 16, d: bd + 16, h: 18, color: '#ffd23f', cls: 'soft', parent: lidWrap, tap: 'box',
    faces: { t: `<svg viewBox="0 0 196 196" width="100%" height="100%"><polygon points="${starPolygon(98, 98, 50, 22)}" fill="#fff" opacity=".8"/></svg>` } });

  const shan = dio.addSprite({ x: 260, y: 260, z: 0, w: 150, h: 170, html: shanSvg(), cls: 'gone', shadow: 0.7 });
  const toys = TOY_IDS.map((t) => dio.addSprite({ x: 260, y: 260, z: 20, w: 72, h: 72, html: toySvg(t), cls: 'gone', shadow: 0.6 }));

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
    // 閃閃跳出來
    shan.el.classList.remove('gone');
    sfx('boing');
    jump(shan, 260, 260, 0, 260, 380, 0, 700, 260);
    playMusic('party');
    burst(app.stageCenter().x, 380, { n: 26, spread: 260 });
    // 玩具飛出來，散在周圍
    const spots = [[90, 130], [430, 90], [70, 340], [470, 250], [190, 470], [290, 50]];
    toys.forEach((t, i) => setTimeout(() => {
      t.el.classList.remove('gone');
      sfx('pop');
      jump(t, 260, 260, 60, spots[i][0], spots[i][1], 0, 650, 220);
    }, (short ? 120 : 260) * i + 300));
    await wait(700);
    await showTitle(root, short);
    if (!short) {
      await speak('shan', 'title', { node: shan.el });
      await speak('shan', 'intro', { node: shan.el });
    } else {
      speak('shan', 'short_hi', { node: shan.el });
      await wait(1200);
    }
    markSeen('opening');
    showPicker();
  };
  dio.onTap((name) => { if (name === 'box') open(); });
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
