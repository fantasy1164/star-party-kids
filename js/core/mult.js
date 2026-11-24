// 九九乘法的學習紀錄與出題（給學堂用）。
// 每一題（a×b，有順序：六三 和 三六 分開記，跟背口訣的方式一樣）有一個「熟練盒」0～5：
//   答對而且夠快 → 往上一盒；答對但很慢 → 至少第 1 盒；答錯 → 回到第 0 盒。
//   第 3 盒以上算「學會了」，乘法星空上那顆星會亮。
//   每一盒隔多久再考一次（間隔重複）：0 馬上、1 五分鐘、2 一天、3 三天、4 一週、5 兩週。
// 出題：先找「目前正在練的那一排」（2→9 第一個還沒全部學會的），大部分題目從這一排出，
//       再混一點其他還不熟的、和該複習的已學會題目。岳岳 6×N 開始卡住，程度檢查會把他定位在那裡。
import { state, save } from './store.js';

const DAY = 86400000;
const GAP = [0, 5 * 60000, DAY, 3 * DAY, 7 * DAY, 14 * DAY];
export const MASTER = 3;
export const FAST_MS = 6000;

const CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
// 數字唸法：10 在口訣裡唸「一十」，單獨數數唸「十」
export function numCN(n, inChant = false) {
  if (n < 10) return CN[n];
  const t = Math.floor(n / 10), u = n % 10;
  const tens = t === 1 ? (inChant ? '一十' : '十') : `${CN[t]}十`;
  return u ? `${t === 1 ? '十' : tens}${CN[u]}` : tens;
}
// 口訣：二三得六、三四十二、二五一十、九九八十一（積小於 10 加「得」）
export function chant(a, b) {
  const p = a * b;
  return `${CN[a]}${CN[b]}${p < 10 ? `得${CN[p]}` : numCN(p, true)}`;
}
export const PRODUCTS = [...new Set([...Array(81)].map((_, i) => (Math.floor(i / 9) + 1) * ((i % 9) + 1)))].sort((x, y) => x - y);

function data() {
  if (!state.mult) state.mult = { facts: {}, checked: false, log: [] };
  return state.mult;
}
const key = (a, b) => `${a}x${b}`;
export function fact(a, b) {
  const d = data();
  if (a === 1 || b === 1) return { box: 5, ok: 0, bad: 0, seen: 0 };
  return d.facts[key(a, b)] || { box: 0, ok: 0, bad: 0, seen: 0 };
}
export const mastered = (a, b) => fact(a, b).box >= MASTER;
export const checked = () => data().checked;
export function masteredCount() {
  let n = 0;
  for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) if (mastered(a, b)) n++;
  return n;
}
export function rowDone(a) { for (let b = 1; b <= 9; b++) if (!mastered(a, b)) return false; return true; }

// 記錄一次作答。回傳 { newStar }：這題剛剛變成「學會了」
export function answer(a, b, correct, ms) {
  if (a === 1 || b === 1) return { newStar: false };
  const d = data();
  const f = { ...fact(a, b) };
  const before = f.box >= MASTER;
  if (correct) {
    f.ok++;
    f.box = ms <= FAST_MS ? Math.min(5, f.box + 1) : Math.max(1, f.box);
    // 交換律的小獎勵：會了 a×b，b×a 至少從第 1 盒開始
    const g = fact(b, a);
    if (ms <= FAST_MS && g.box < 1 && a !== b) d.facts[key(b, a)] = { ...g, box: 1 };
  } else {
    f.bad++;
    f.box = 0;
  }
  f.seen = Date.now();
  d.facts[key(a, b)] = f;
  d.log.push([Date.now(), a, b, correct ? 1 : 0, Math.round(ms)]);
  if (d.log.length > 600) d.log.splice(0, d.log.length - 600);
  save();
  return { newStar: !before && f.box >= MASTER };
}

// 程度檢查：2～5 每排一題，6～9 每排兩題（6×N 開始需要看清楚）
export function checkQuestions() {
  const qs = [];
  const r = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  for (const a of [2, 3, 4, 5]) qs.push([a, r(3, 9)]);
  for (const a of [6, 7, 8, 9]) {
    const b1 = r(2, 5), b2 = r(6, 9);
    qs.push([a, b1], [a, b2]);
  }
  return qs;
}
// 檢查的結果推到整排：全對又快 → 整排學會；對一半 → 第 1 盒；都不對 → 第 0 盒
export function applyCheck(results) {
  const d = data();
  const byRow = {};
  for (const r of results) (byRow[r.a] ||= []).push(r);
  for (const [a, rs] of Object.entries(byRow)) {
    const good = rs.filter((r) => r.correct && r.ms <= FAST_MS * 1.5).length;
    const box = good === rs.length ? MASTER : good > 0 ? 1 : 0;
    for (let b = 2; b <= 9; b++) {
      const k = key(+a, b);
      const cur = d.facts[k];
      if (!cur || cur.box < box) d.facts[k] = { box, ok: cur?.ok || 0, bad: cur?.bad || 0, seen: Date.now() - DAY };
    }
  }
  d.checked = true;
  save();
}

// 正在練的那一排
export function focusRow() {
  for (let a = 2; a <= 9; a++) if (!rowDone(a)) return a;
  return 9;
}
const due = (f, now) => now - f.seen >= GAP[f.box];
// 出 n 題（不重複）
export function pickQuestions(n = 6) {
  const now = Date.now();
  const row = focusRow();
  const all = [];
  for (let a = 2; a <= 9; a++) for (let b = 2; b <= 9; b++) all.push([a, b]);
  const weight = ([a, b]) => {
    const f = fact(a, b);
    let w = 0;
    if (a === row) w += 6 - f.box;                      // 正在練的排
    else if (f.box < MASTER && a < row + 2) w += 3 - Math.min(3, f.box);   // 其他還不熟、但不會太難的
    if (f.box >= MASTER && due(f, now)) w += 1.5;        // 該複習了
    if (f.bad > f.ok) w += 1;
    return Math.max(0, w);
  };
  const pool = all.map((q) => ({ q, w: weight(q) })).filter((x) => x.w > 0);
  const out = [];
  while (out.length < n && pool.length) {
    const sum = pool.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * sum;
    const i = pool.findIndex((x) => (r -= x.w) <= 0);
    out.push(pool[i].q);
    pool.splice(i, 1);
  }
  while (out.length < n) out.push([row, 2 + Math.floor(Math.random() * 8)]);
  return out;
}
// 一輪題目（岳岳）：大約八成是已經會的、只夾一兩題正在練的新題。
// 他失敗幾次就會想放棄，所以要一直有「我會」的感覺；新題夾在會的題目中間，最後一題一定是會的。
// 回傳兩疊：known（會的、該複習的）、hard（正在練的那一排還不熟的）；出題時再依他答得好不好決定下一題拿哪一疊。
export function pickRound(n = 6, nHard = n >= 6 ? 2 : 1) {
  const now = Date.now();
  const row = focusRow();
  const all = [];
  for (let a = 2; a <= 9; a++) for (let b = 2; b <= 9; b++) all.push([a, b]);
  const draw = (pool, k, w) => {
    const p = pool.map((q) => ({ q, w: w(q) })).filter((x) => x.w > 0);
    const out = [];
    while (out.length < k && p.length) {
      const sum = p.reduce((t, x) => t + x.w, 0);
      let r = Math.random() * sum;
      const i = p.findIndex((x) => (r -= x.w) <= 0);
      out.push(p[i].q);
      p.splice(i, 1);
    }
    return out;
  };
  const isHard = ([a, b]) => a === row && fact(a, b).box < MASTER;
  const hard = draw(all.filter(isHard), nHard, ([a, b]) => { const f = fact(a, b); return 6 - f.box + (f.bad > f.ok ? 1 : 0); });
  // 會的：已經學會（該複習的多抽一點）、或交換過來已經會的（六三會了，三六也算會）、或熟練盒 2 以上
  const knownish = ([a, b]) => {
    const f = fact(a, b);
    if (f.box >= MASTER) return due(f, now) ? 3 : 1;
    if (mastered(b, a) || f.box >= 2) return 2;
    return 0;
  };
  let known = draw(all.filter((q) => !hard.some((h) => h[0] === q[0] && h[1] === q[1])), n - hard.length, knownish);
  // 剛開始什麼都還不熟：用比較容易的補（小的排、乘以小的數）
  if (known.length < n - hard.length) {
    const easy = all.filter(([a, b]) => (a <= 5 || b <= 3) && !known.some((k) => k[0] === a && k[1] === b) && !hard.some((h) => h[0] === a && h[1] === b));
    known = known.concat(draw(easy, n - hard.length - known.length, ([a, b]) => 10 - a - b / 2));
  }
  return { known, hard };
}
// 其他學堂的小紀錄（例如今天教過「五的口訣再加」了沒、火箭發射到哪）
export function extra() { const d = data(); if (!d.extra) d.extra = {}; return d.extra; }
export const saveExtra = () => save();
// 這題最近答錯過（答對了要特別誇他「你記住了」）
export const recentlyMissed = (a, b) => { const f = fact(a, b); return f.bad > 0 && f.box === 0; };

// 愷愷：小小的分組數數（不記錄）
export function kidQuestion() {
  const a = 2 + Math.floor(Math.random() * 2);
  const b = 2 + Math.floor(Math.random() * 3);
  return [a, b];
}
// 選項：正確答案＋兩個很像的（鄰近的倍數）
// n = 4：答錯一次可以拿掉一個，還剩兩個可以想（不會一錯就只剩答案）
export function choices(a, b, n = 3) {
  const p = a * b;
  const cand = [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, p + 1, p - 1, p + 2, p + a, p - 2]
    .filter((x) => x > 0 && x !== p);
  const uniq = [...new Set(cand)].sort(() => Math.random() - 0.5).slice(0, n - 1);
  return [p, ...uniq].sort(() => Math.random() - 0.5);
}
// 家長頁：每一題的狀態
export function table() {
  const rows = [];
  for (let a = 2; a <= 9; a++) {
    const r = [];
    for (let b = 2; b <= 9; b++) r.push(fact(a, b));
    rows.push(r);
  }
  return rows;
}
