// 共用關卡工具：新地點的關卡大多是這三種玩法，資料不同而已。
//   sortGame  分類：把東西拖進對的籃子（垃圾分類、餵動物、冰的放保冷袋、生病時好/不好）
//   findGame  尋找：在立體場景裡找東西，有的躲在後面要轉房間（購物清單、找小動物、撿雞蛋）
//   stepsGame 照步驟：上面是步驟圖，照順序點東西（看醫生、種菜）
// 都遵守同樣的原則：做錯不扣分、角色說明為什麼、愷愷（easy）的下一步會發亮、一起玩每一步輪流。
import { div, wait, toStage, stageRect, shuffle, pick } from '../core/dom.js';
import { sfx, think } from '../core/audio.js';
import { numSvg } from '../art/more.js';
import { turnsOn, callTurn, nextTurn, levelNow } from '../core/turns.js';
import { setHint } from '../core/session.js';

// ---------------- 回合進度（ADHD：看得到還剩幾題）----------------
// 一排小圓點放在面板（或畫面）上方正中間：roundDots(容器, 幾題, 'tr'右上／'bl'左下) → { set(做到第幾題), done(), remove() }
export function roundDots(box, n, where = '') {
  const el = div(`round-dots ui ${where}`, '<i></i>'.repeat(n));
  box.appendChild(el);
  const ds = [...el.children];
  const set = (i) => ds.forEach((d, k) => { d.classList.toggle('ok', k < i); d.classList.toggle('now', k === i); });
  set(0);
  return { set, done: () => set(n), remove: () => el.remove() };
}

// ---------------- 分類 ----------------
// opt: { host, hostSvg, intro, bins: [{ id, html }], items: [{ k, bin, html }], wrong(item) → 台詞, done, placedLine?(item) }
export async function sortGame(R, opt) {
  const { say, chk, race } = R;
  const P = R.panel('sortpanel', { host: opt.host, hostSvg: opt.hostSvg });
  const el = P.el;
  try {
    el.innerHTML = `<div class="sort-items"></div><div class="sort-bins"></div>`;
    const itemsBox = el.querySelector('.sort-items');
    const binsBox = el.querySelector('.sort-bins');
    const bins = {};
    for (const b of opt.bins) {
      const be = div('sbin', `${b.html}<span class="n">0</span>`);
      be.dataset.bin = b.id;
      binsBox.appendChild(be);
      bins[b.id] = { el: be, n: 0 };
    }
    let left = opt.items.length;
    let lastVoice = 0;
    let done;
    const finished = new Promise((r) => { done = r; });
    for (const it of shuffle(opt.items)) {
      const ie = div('sitem', it.html);
      ie.dataset.bin = it.bin;
      itemsBox.appendChild(ie);
      ie.addEventListener('pointerdown', (e) => {
        R.drag(e, {
          html: it.html, size: 120, originEl: ie,
          onStart: () => ie.classList.add('used'),
          onDrop: (cx, cy) => {
            const p = toStage(cx, cy);
            let best = null, bd = 140;
            for (const [id, b] of Object.entries(bins)) {
              const r = stageRect(b.el);
              const d = Math.hypot(r.x - p.x, r.y - p.y);
              if (d < bd) { bd = d; best = id; }
            }
            if (!best) return null;
            if (best !== it.bin) {
              sfx('soft');
              R.hop(bins[best].el, 'shake');
              if (Date.now() - lastVoice > 2500) { lastVoice = Date.now(); say(opt.host, opt.wrong(it)); }
              // 同一個東西放錯兩次（岳岳也一樣）：之後拿起它，對的籃子會發亮；現在先亮 3 秒
              it.wrongs = (it.wrongs || 0) + 1;
              if (it.wrongs >= 2) { ie.dataset.help = '1'; bins[it.bin].el.classList.add('glowy-2d'); setTimeout(() => bins[it.bin].el.classList.remove('glowy-2d'), 3000); }
              return null;
            }
            const r = stageRect(bins[best].el);
            return { x: r.x, y: r.y - 10 };
          },
          onPlaced: async () => {
            const b = bins[it.bin];
            b.n++;
            b.el.querySelector('.n').textContent = b.n;
            R.hop(b.el, 'hop');
            sfx('pop');
            sfx('sparkle');
            R.burstAt(b.el, { n: 10, stars: true, colors: ['#ffd23f', '#fff3a0'] });
            ie.remove();
            left--;
            if (opt.placedLine) { const l = opt.placedLine(it); if (l) say(opt.host, l); }
            if (left === 0) { done(); return; }
            if (turnsOn()) nextTurn({ say: false });
          },
          onBack: () => ie.classList.remove('used'),
        });
      });
    }
    setHint(() => {
      const first = itemsBox.querySelector('.sitem:not(.used)');
      return first || null;
    });
    await say(opt.host, opt.intro);
    chk();
    await callTurn();
    chk();
    // 愷愷：拿起東西時，對的籃子會發亮
    const glow = (on, bin) => Object.values(bins).forEach((b) => b.el.classList.toggle('glowy-2d', on && b.el.dataset.bin === bin));
    const onDown = (e) => { const s = e.target.closest('.sitem'); if (s && (levelNow(R.profile) === 'easy' || s.dataset.help)) glow(true, s.dataset.bin); };
    const onUp = () => glow(false);
    el.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointerup', onUp);
    try { await race(finished); } finally { window.removeEventListener('pointerup', onUp); }
    setHint(null);
    sfx('fanfare');
    await say(opt.host, opt.done);
    await wait(300);
  } finally {
    P.close();
  }
}

// ---------------- 尋找 ----------------
// opt: { host, intro, items: [{ id, x, y, z, w, h, html, hidden }], found(id) → 台詞, hiddenLine, done, list: true 顯示上方清單 }
export async function findGame(R, opt) {
  const { dio, say, chk, race, rot, root } = R;
  const sprites = {};
  for (const it of opt.items) {
    const sp = dio.addSprite({ x: it.x, y: it.y, z: it.z || 0, w: it.w || 70, h: it.h || 70, html: it.html, shadow: it.shadow ?? 0.5, tap: `find:${it.id}`, cls: 'findable' });
    sprites[it.id] = sp;
  }
  let list = null;
  if (opt.list) {
    list = div('findlist ui');
    list.innerHTML = opt.items.map((it) => `<div class="fl" data-id="${it.id}">${it.icon || it.html}</div>`).join('');
    root.appendChild(list);
  }
  const found = new Set();
  try {
    await say(opt.host, opt.intro);
    chk();
    await callTurn();
    chk();
    let hiddenSaid = false;
    setHint(() => {
      const left = opt.items.filter((it) => !found.has(it.id));
      const vis = left.filter((it) => !it.hidden || (it.seenFrom || [1, 2]).includes(dio.quadrant()));
      if (vis.length) return sprites[vis[0].id].el;
      return left.length ? rot.r : null;
    });
    await race(new Promise((resolve) => {
      const off = R.listen(async (name) => {
        if (!name.startsWith('find:')) return;
        const id = name.slice(5);
        if (found.has(id)) return;
        found.add(id);
        rot.pulse(false);
        const sp = sprites[id];
        R.hop(sp.el, 'hop');
        sfx('sparkle');
        sfx('pop');
        R.burstAt(sp.el, { n: 14, stars: true, colors: ['#ffd23f', '#fff3a0'] });
        list?.querySelector(`[data-id="${id}"]`)?.classList.add('ok');
        setTimeout(() => sp.el.classList.add('found'), 700);
        const l = opt.found?.(id);
        if (l) await say(opt.host, l);
        if (found.size === opt.items.length) { off(); resolve(); return; }
        const left = opt.items.filter((it) => !found.has(it.id));
        if (!hiddenSaid && left.every((it) => it.hidden)) {
          hiddenSaid = true;
          rot.pulse(true);
          await say(opt.host, opt.hiddenLine);
        }
        if (turnsOn()) nextTurn({ say: false });
      });
    }));
    setHint(null);
    sfx('fanfare');
    await say(opt.host, opt.done);
    await wait(300);
  } finally {
    Object.values(sprites).forEach((s) => s.remove());
    list?.remove();
    rot.pulse(false);
  }
}

// ---------------- 照步驟 ----------------
// opt: { host, hostSvg, intro, scene: 背景 html, targets: [{ id, html, x, y, w, h }], steps: [{ t, icon, line, who? }], wrong, done, fx(i, el, panel) }
export async function stepsGame(R, opt) {
  const { say, chk, race } = R;
  const P = R.panel(`stepspanel ${opt.cls || ''}`, { host: opt.host, hostSvg: opt.hostSvg });
  const el = P.el;
  try {
    el.innerHTML = `${opt.scene || ''}<div class="steps">${opt.steps.map((s) => `<div class="s">${s.icon}</div>`).join('')}</div>
      ${opt.targets.map((t) => `<div class="wtap" data-w="${t.id}" style="left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px">${t.html}</div>`).join('')}`;
    const stepEls = [...el.querySelectorAll('.steps .s')];
    await say(opt.host, opt.intro);
    chk();
    await callTurn();
    chk();
    let lastWrong = 0;
    for (let i = 0; i < opt.steps.length; i++) {
      const s = opt.steps[i];
      stepEls.forEach((x, k) => { x.classList.toggle('now', k === i); x.classList.toggle('ok', k < i); });
      const target = el.querySelector(`[data-w="${s.t}"]`);
      if (levelNow(R.profile) === 'easy') target.classList.add('glowy-2d');
      setHint(() => target);
      say(s.who || opt.host, s.line);
      await race(new Promise((resolve) => {
        const dn = (e) => {
          const w = e.target.closest('[data-w]')?.dataset.w;
          if (!w) return;
          if (w === s.t) { el.removeEventListener('pointerdown', dn); resolve(); return; }
          sfx('soft');
          if (Date.now() - lastWrong > 3500) { lastWrong = Date.now(); say(opt.host, opt.wrong); }
          // 錯兩次（岳岳也一樣）：對的東西發亮
          if (++wrongHere >= 2) target.classList.add('glowy-2d');
        };
        let wrongHere = 0;
        el.addEventListener('pointerdown', dn);
      }));
      chk();
      target.classList.remove('glowy-2d');
      sfx('pop');
      R.hop(target, 'hop');
      await opt.fx?.(i, target, el);
      sfx('sparkle');
      chk();
      if (turnsOn() && i < opt.steps.length - 1) await nextTurn({ say: false });
    }
    stepEls.forEach((x) => { x.classList.remove('now'); x.classList.add('ok'); });
    setHint(null);
    sfx('fanfare');
    await say(opt.host, opt.done);
    await wait(300);
  } finally {
    P.close();
  }
}

// 選答案（岳岳很容易「錯幾次就放棄」，所以不讓他連錯三次）：
//   錯第一次：再拿掉一個錯的選項，嗶嗶鼓勵他再想一次
//   錯第二次：嗶嗶示範（排點點、唱口訣；六以上用「五的口訣再加」），對的答案發亮，跟著點
// 題目出來到答完之間是「思考時間」：音樂幾乎聽不到、等待的人拍手先不出聲。
// 回傳 { firstTry, wrongs }
export function askChoice(R, box, opts, correct, { demo = null, glow = false, host = 'bibi' } = {}) {
  think(true);
  return R.race(new Promise((resolve) => {
    let wrongs = 0;
    let busy = false;
    box.innerHTML = '';
    box.classList.add('show');
    const btns = opts.map((v) => {
      const b = document.createElement('button');
      b.className = 'ans';
      b.dataset.v = v;
      b.innerHTML = numSvg(v, { color: '#4a3b6b' });
      b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (b.disabled || busy) return;
        if (v === correct) {
          sfx('fanfare');
          R.burstAt(b, { n: 18, stars: true, colors: ['#ffd23f', '#fff3a0', '#4cd07d'] });
          b.classList.add('right');
          think(false);
          setTimeout(() => { box.classList.remove('show'); box.innerHTML = ''; resolve({ firstTry: wrongs === 0, wrongs }); }, 650);
          return;
        }
        wrongs++;
        sfx('soft');
        b.disabled = true;
        b.classList.add('wrong');
        const left = () => btns.filter((x) => !x.disabled && +x.dataset.v !== correct);
        if (wrongs === 1) {
          // 第一次錯：鼓勵再想一次；選項還多的話少一個，比較好想
          if (left().length > 1) {
            const g = pick(left());
            g.disabled = true;
            g.classList.add('gone');
            R.say(host, 'try_2');
          } else R.say(host, pick(['try_1', 'try_3']));
        } else {
          // 一起看：示範，答案發亮
          left().forEach((x) => { x.disabled = true; x.classList.add('gone'); });
          busy = true;
          (async () => {
            await R.say(host, 'try_show');
            if (demo) await demo();
            busy = false;
            const ok = btns.find((x) => +x.dataset.v === correct);
            ok.classList.add('glowy-2d');
            setHint(() => ok);
            R.say(host, 'try_tap');
          })().catch(() => {});
        }
      });
      box.appendChild(b);
      if (glow && v === correct) b.classList.add('glowy-2d');
      return b;
    });
    setHint(() => btns.find((x) => !x.disabled));
  })).finally(() => think(false));
}

