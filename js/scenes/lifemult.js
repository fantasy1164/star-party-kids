// 生活裡的九九乘法（11/26）：開發這個遊戲的初衷——岳岳從 6×N 開始卡住、靠死背、越來越不想背。
// 在各個地方（超市、公園、海生館、家裡…）做完第一關後，嗶嗶跑出來問一題「生活裡天生就是一組一組的東西」：
//   一盒雞蛋 6 顆、昆蟲 6 隻腳、一星期 7 天、彩虹 7 種顏色、章魚 8 隻腳、一盒月餅 8 個、九宮格糖果盒 9 顆…
// 規則（照 ADHD 的把關）：
//   - 只在岳岳有一起玩的時候出；每去一個地方最多一題；30 秒內結束；右下角可以跳過。
//   - 題目照學堂的熟練盒出（js/core/mult.js：大部分是正在練的那一排），答完一樣記進乘法星空。
//   - 依熟練度先幫他數一部分：還不熟 → 先亮到前一盒（6、12、18…），他只要想最後一步；快學會 → 亮一半；學會了 → 不提示。
//     每亮一盒一個音，一串往上爬的音階（岳岳喜歡音樂）。答錯不扣分，一盒一盒亮起來陪他數，最後嗶嗶唸口訣。
//   - 一起玩、輪到愷愷：先請愷愷數「有幾盒」，再換岳岳算一共幾個。
import { div, wait, burst, stageRect, shuffle, pick } from '../core/dom.js';
import { sfx, playNote, think } from '../core/audio.js';
import { turnsOn, turnTo } from '../core/turns.js';
import { setHint } from '../core/session.js';
import { askChoice } from './kit.js';
import { bibiSvg } from '../art/more.js';
import * as M from '../core/mult.js';

const S = (inner) => `<svg viewBox="0 0 160 120" width="100%" height="100%">${inner}</svg>`;
const wheel = (x, y, r = 18) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3a3550"/><circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="#c9ced8"/>`;
// 每一種「一組」的樣子（一組裡面剛好 a 個）
const ART = {
  bike: () => S(`<path d="M40 84 L72 52 L104 84 M72 52 H96 M60 84 L72 52" stroke="#3ea8e0" stroke-width="7" fill="none" stroke-linecap="round"/>${wheel(40, 84, 24)}${wheel(120, 84, 24)}<path d="M96 52 L120 84" stroke="#3ea8e0" stroke-width="7"/>`),
  trike: () => S(`<path d="M50 80 L80 46 H104 L118 80" stroke="#ff5d73" stroke-width="7" fill="none" stroke-linecap="round"/>${wheel(80, 40, 18)}${wheel(40, 86, 20)}${wheel(124, 86, 20)}`),
  car: () => S(`<rect x="34" y="20" width="92" height="80" rx="22" fill="#ff8a3d"/><rect x="48" y="34" width="64" height="26" rx="8" fill="#bfe6ff"/>${[[30, 36], [130, 36], [30, 84], [130, 84]].map(([x, y]) => `<rect x="${x - 9}" y="${y - 14}" width="18" height="28" rx="6" fill="#3a3550"/>`).join('')}`),
  hand: () => S(`<rect x="52" y="58" width="60" height="54" rx="22" fill="#f6c9a0"/>${[[54, 30, -14], [70, 14, -4], [86, 12, 4], [102, 22, 12]].map(([x, y, r]) => `<rect x="${x}" y="${y}" width="15" height="52" rx="7.5" fill="#f6c9a0" transform="rotate(${r} ${x + 7} ${y + 50})"/>`).join('')}<rect x="28" y="66" width="15" height="40" rx="7.5" fill="#f6c9a0" transform="rotate(-50 36 100)"/>`),
  egg: () => S(`<rect x="10" y="22" width="140" height="84" rx="16" fill="#ffd99a" stroke="#c9933a" stroke-width="5"/>${[0, 1, 2].flatMap((c) => [0, 1].map((r) => `<ellipse cx="${38 + c * 42}" cy="${46 + r * 36}" rx="16" ry="14" fill="#fffaf0" stroke="#e8d4a8" stroke-width="3"/>`)).join('')}`),
  bug: () => S(`${[[-1, 40], [-1, 62], [-1, 84], [1, 40], [1, 62], [1, 84]].map(([s, y]) => `<path d="M${80 + s * 24} ${y} L${80 + s * 56} ${y - 8 + (y - 62) * 0.4}" stroke="#3a3550" stroke-width="6" stroke-linecap="round"/>`).join('')}<ellipse cx="80" cy="64" rx="32" ry="40" fill="#e83a3a"/><path d="M80 24 V104" stroke="#3a3550" stroke-width="4"/><circle cx="80" cy="22" r="16" fill="#3a3550"/>${[[64, 52], [96, 52], [62, 82], [98, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#3a3550"/>`).join('')}`),
  week: () => S(`<rect x="6" y="26" width="148" height="70" rx="10" fill="#fff" stroke="#c9ced8" stroke-width="4"/><rect x="6" y="26" width="148" height="16" rx="8" fill="#3ea8e0"/>${[...Array(7)].map((_, i) => `<rect x="${12 + i * 20.5}" y="50" width="16" height="38" rx="4" fill="${i === 0 ? '#ffb3b3' : i === 6 ? '#b3d9ff' : '#ffe9a8'}"/>`).join('')}`),
  rainbow: () => S(`${['#ff4a4a', '#ff9a2e', '#ffd23f', '#4cd07d', '#3ea8e0', '#4f5fd8', '#a98bff'].map((c, i) => `<path d="M${14 + i * 9} 104 A${66 - i * 9} ${66 - i * 9} 0 0 1 ${146 - i * 9} 104" stroke="${c}" stroke-width="9" fill="none"/>`).join('')}`),
  octopus: () => S(`${[...Array(8)].map((_, i) => { const x = 30 + i * 14.3; return `<path d="M${x} 66 Q${x + (i % 2 ? 8 : -8)} 92 ${x + (i < 4 ? -6 : 6)} 112" stroke="#ff7aa8" stroke-width="9" fill="none" stroke-linecap="round"/>`; }).join('')}<ellipse cx="80" cy="46" rx="48" ry="38" fill="#ff8fb5"/><circle cx="64" cy="46" r="7" fill="#3a3550"/><circle cx="96" cy="46" r="7" fill="#3a3550"/>`),
  mooncake: () => S(`<rect x="8" y="22" width="144" height="80" rx="12" fill="#c9302c" stroke="#ffd23f" stroke-width="4"/>${[0, 1, 2, 3].flatMap((c) => [0, 1].map((r) => `<circle cx="${30 + c * 33}" cy="${44 + r * 36}" r="14" fill="#e8a64a" stroke="#b9772a" stroke-width="3"/>`)).join('')}`),
  candy: () => S(`<rect x="22" y="6" width="116" height="108" rx="14" fill="#fff0f6" stroke="#ff7aa8" stroke-width="5"/>${[0, 1, 2].flatMap((c) => [0, 1, 2].map((r) => `<circle cx="${48 + c * 32}" cy="${32 + r * 32}" r="12" fill="${['#ff5d73', '#ffb627', '#4cd07d', '#3ea8e0', '#a98bff'][(c + r * 3) % 5]}"/>`)).join('')}`),
};
// 每一排有哪些「一組」（a = 一組有幾個），以及比較適合出現在哪些地方
const THEMES = {
  2: [{ id: 'bike', at: ['park', 'police', 'garbage', 'post'] }],
  3: [{ id: 'trike', at: ['park', 'living', 'bedroom'] }],
  4: [{ id: 'car', at: ['police', 'fire', 'mrt', 'garbage', 'post'] }],
  5: [{ id: 'hand', at: ['clinic', 'bath', 'kitchen', 'library'] }],
  6: [{ id: 'egg', at: ['market', 'kitchen', 'farm'] }, { id: 'bug', at: ['park', 'farm', 'zoo', 'garbage'] }],
  7: [{ id: 'week', at: ['bedroom', 'living', 'library', 'school', 'post', 'clinic'] }, { id: 'rainbow', at: ['park', 'beach', 'farm', 'zoo'] }],
  8: [{ id: 'octopus', at: ['aquarium', 'beach'] }, { id: 'mooncake', at: ['market', 'kitchen', 'living'] }],
  9: [{ id: 'candy', at: ['market', 'kitchen', 'living', 'fame'] }],
};
const NOTES = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'D6'];
// 不出題的地方：學堂本來就在練乘法；節慶舞台是過節
const SKIP_ROOMS = new Set(['school', 'fest']);
const seenThisVisit = new Set();
export function resetLifeVisit(id) { seenThisVisit.delete(id); }

// 要不要出題（每去一個地方最多一題；岳岳要在）
export function lifeMultReady(R, roomId) {
  return R.members.includes('yy') && !SKIP_ROOMS.has(roomId) && !seenThisVisit.has(roomId) && M.checked();
}

export async function lifeMult(R, roomId) {
  seenThisVisit.add(roomId);
  const { say, chk, members } = R;
  const [a, b] = M.pickQuestions(1)[0];
  const pool = THEMES[a] || THEMES[6];
  const theme = pool.find((t) => t.at.includes(roomId)) || pick(pool);
  const box = M.fact(a, b).box;
  const pre = box <= 1 ? b - 1 : box === 2 ? Math.floor(b / 2) : 0;   // 先幫他數幾盒
  const P = R.panel('lifepanel', { host: 'bibi', hostSvg: bibiSvg() });
  const el = P.el;
  const skip = document.createElement('button');
  skip.className = 'life-skip';
  skip.innerHTML = '⏭';
  let skipped = false;
  const skipP = new Promise((res) => skip.addEventListener('pointerdown', (e) => { e.stopPropagation(); sfx('tap'); skipped = true; res('skip'); }, { once: true }));
  const t0 = Date.now();   // 給除錯用
  try {
    const perRow = b <= 5 ? b : Math.ceil(b / 2);
    const cw = Math.min(170, (860 - (perRow - 1) * 16) / perRow), ch = cw * 0.75;
    const rows = Math.ceil(b / perRow);
    const top = rows === 1 ? 150 : 70;
    el.innerHTML = `<div class="life-groups">${[...Array(b)].map((_, i) => {
      const r = Math.floor(i / perRow), c = i % perRow, inRow = Math.min(perRow, b - r * perRow);
      const x = (940 - (inRow * cw + (inRow - 1) * 16)) / 2 + c * (cw + 16);
      return `<div class="life-g" style="left:${x}px;top:${top + r * (ch + 50)}px;width:${cw}px;height:${ch}px">${ART[theme.id]()}<span class="cnt">?</span></div>`;
    }).join('')}</div><div class="answers in-panel life-ans"></div>`;
    el.appendChild(skip);
    const groups = [...el.querySelectorAll('.life-g')];
    const ans = el.querySelector('.life-ans');
    const light = async (n, gap = 380) => {
      for (let i = 0; i < n; i++) {
        const g = groups[i];
        if (g.classList.contains('lit')) continue;
        g.classList.add('lit');
        g.querySelector('.cnt').textContent = a * (i + 1);
        playNote(NOTES[i] || 'D6');
        await wait(gap);
      }
    };
    const race = (p) => Promise.race([p, skipP]);
    // ADHD 健檢（11/26）：提示的幾組跟題目一起亮，不要等說完才開始（少等 3 秒）
    const both = turnsOn() && members.includes('kk');
    const litP = !both && pre ? light(pre) : null;
    await race(say('bibi', `life_${theme.id}`));
    if (skipped) return;
    chk();
    // 一起玩、輪到愷愷：先請愷愷數有幾盒
    if (both) {
      await race(turnTo('kk'));
      if (skipped) return;
      groups.forEach((g) => g.classList.add('peek'));
      await race(say('bibi', 'life_kk_count'));
      if (skipped) return;
      const r = await race(askChoice(R, ans, shuffle([b, b + 1, Math.max(1, b - 1)].filter((v, i, s) => s.indexOf(v) === i)), b, { host: 'bibi' }));
      if (r === 'skip') return;
      groups.forEach((g) => g.classList.remove('peek'));
      await race(turnTo('yy'));
      if (skipped) return;
    }
    if (pre) await (litP || light(pre));
    const qT = Date.now();
    const res = await race(askChoice(R, ans, M.choices(a, b, 3), a * b, { host: 'bibi', demo: async () => { groups.forEach((g) => { g.classList.remove('lit'); g.querySelector('.cnt').textContent = '?'; }); await light(b, 520); } }));
    if (res === 'skip') return;
    const ms = Date.now() - qT;
    chk();
    await light(b, 160);
    const r2 = M.answer(a, b, res.firstTry, ms);
    burst(470, 200, { n: 20, stars: true, colors: ['#ffd23f', '#fff3a0'] });
    await say('bibi', `c_${a}_${b}`);
    chk();
    if (r2.newStar) { sfx('star'); await say('bibi', 'life_star'); }
    else await say('bibi', res.firstTry ? 'life_good' : 'life_together');
  } finally {
    setHint(null);
    think(false);
    P.close();
    void t0;
  }
}
