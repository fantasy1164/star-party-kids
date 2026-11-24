// 各畫面共用的介面：背景、回家鈕、轉房間鈕、星星罐、飛星星。
import { div, burst, stageRect, wait } from '../core/dom.js';
import { sky, hour, isDark } from '../core/clock.js';
import { starsToday } from '../core/store.js';
import { sfx } from '../core/audio.js';
import { ICON } from '../art/props.js';
import { kidHead, starIcon } from '../art/stars.js';

// 模型屋後面的背景：白天暖暖的、晚上深藍有星星
export function backdrop(root) {
  const b = div('backdrop');
  const h = hour();
  const s = sky(h);
  const dark = isDark(h);
  b.classList.toggle('dark', dark);
  b.innerHTML = `<div class="sky" style="background:${dark
    ? `radial-gradient(ellipse at 50% 110%, #3b3f86 0, ${s.top} 70%)`
    : `radial-gradient(ellipse at 50% 120%, #fff4e0 0, #ffd9b8 45%, ${h >= 16.5 ? '#f4a98a' : '#bfe3ff'} 100%)`}"></div>
    <div class="table"></div><div class="twinkles">${Array.from({ length: 26 }, () => `<i style="left:${Math.random() * 100}%;top:${Math.random() * 55}%;animation-delay:${(Math.random() * 3).toFixed(2)}s"></i>`).join('')}</div>`;
  root.appendChild(b);
  return b;
}

export function roundBtn(root, cls, icon, onTap) {
  const b = document.createElement('button');
  b.className = `round-btn ui ${cls}`;
  b.innerHTML = icon;
  b.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
  b.addEventListener('click', (e) => { e.stopPropagation(); sfx('tap'); onTap(); });
  root.appendChild(b);
  return b;
}
export function homeBtn(root, onTap) { return roundBtn(root, 'btn-home', ICON.home, onTap); }
export function rotateBtns(root, dio) {
  const l = roundBtn(root, 'blue btn-rot-l', ICON.left, () => { sfx('whoosh'); dio.rotateBy(-90); });
  const r = roundBtn(root, 'blue btn-rot-r', ICON.right, () => { sfx('whoosh'); dio.rotateBy(90); });
  return {
    l, r,
    pulse(on) { l.classList.toggle('pulse', on); r.classList.toggle('pulse', on); },
    show(on) { l.style.display = r.style.display = on ? '' : 'none'; },
  };
}

// 星星罐：一個人玩一個，一起玩兩個（各自的顏色）
// 拉遠、拉近（也可以用兩隻手指捏合）
export function zoomBtns(root, dio) {
  const mk = (cls, sign, f) => roundBtn(root, cls, `<svg viewBox="0 0 100 100"><circle cx="44" cy="44" r="28" fill="none" stroke="#fff" stroke-width="10"/><path d="M64 64 L86 86" stroke="#fff" stroke-width="12" stroke-linecap="round"/><path d="M30 44 H58${sign === '+' ? ' M44 30 V58' : ''}" stroke="#fff" stroke-width="9" stroke-linecap="round"/></svg>`, () => dio.zoomBy(f));
  return [mk('btn-zoom-in', '+', 1.35), mk('btn-zoom-out', '-', 1 / 1.35)];
}
export function jars(root, members) {
  const box = div('jars');
  const map = {};
  for (const id of members) {
    const j = div('jar');
    j.innerHTML = `<span class="who">${members.length > 1 ? kidHead(id, 64) : starIcon(64)}</span><span class="n">${starsToday(id)}</span>`;
    if (members.length > 1) j.insertAdjacentHTML('beforeend', starIcon(48));
    box.appendChild(j);
    map[id] = j;
  }
  root.appendChild(box);
  return {
    async fly(ids, from) {
      sfx('star');
      await Promise.all(ids.map(async (id, i) => {
        const j = map[id];
        if (!j) return;
        const s = div('flystar', starIcon(120));
        s.style.left = `${from.x + i * 40}px`;
        s.style.top = `${from.y}px`;
        root.appendChild(s);
        burst(from.x, from.y, { n: 16, stars: true, colors: ['#ffd23f', '#fff3a0', '#ffb627'] });
        await wait(350 + i * 150);
        const r = stageRect(j);
        s.style.left = `${r.left + 50}px`;
        s.style.top = `${r.y}px`;
        s.style.width = s.style.height = '60px';
        await wait(950);
        s.remove();
        j.querySelector('.n').textContent = starsToday(id);
        j.classList.remove('bump'); void j.offsetWidth; j.classList.add('bump');
        sfx('pop');
      }));
    },
  };
}
