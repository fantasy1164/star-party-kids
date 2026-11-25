// 節慶與生日（11/25）：生日（全家五個人）、春節（除夕前一週～元宵）、兒童節、母親節、端午、父親節、中秋、萬聖節、聖誕節。
// 不做清明、中元。日期一律用遊戲時鐘（可用 ?date= 或家長頁「測試時間」預覽）。
// 生日只存在設定裡（state.settings.birthdays），不寫進程式——GitHub 是公開的。
import { now } from './clock.js';
import { state, save } from './store.js';

// 農曆節日的國曆日期（查表；之後的年份要再補）。初一、端午、中秋；元宵＝初一＋14 天，除夕＝初一－1 天
const LUNAR = {
  2026: ['2026-02-17', '2026-06-19', '2026-09-25'],
  2027: ['2027-02-06', '2027-06-09', '2027-09-15'],
  2028: ['2028-01-26', '2028-05-28', '2028-10-03'],
  2029: ['2029-02-13', '2029-06-16', '2029-09-22'],
  2030: ['2030-02-03', '2030-06-05', '2030-09-12'],
  2031: ['2031-01-23', '2031-06-24', '2031-10-01'],
  2032: ['2032-02-11', '2032-06-12', '2032-09-19'],
  2033: ['2033-01-31', '2033-06-01', '2033-09-08'],
  2034: ['2034-02-19', '2034-06-20', '2034-09-27'],
  2035: ['2035-02-08', '2035-06-10', '2035-09-16'],
};
const DAY = 86400000;
const ymd = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const todayUTC = () => { const d = now(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); };
const iso = (t) => new Date(t).toISOString().slice(0, 10);
// 母親節：五月第二個星期日
function mothersDay(y) { const d = new Date(Date.UTC(y, 4, 1)); const first = (7 - d.getUTCDay()) % 7; return Date.UTC(y, 4, 1 + first + 7); }

export const PEOPLE = { yy: '岳岳', kk: '愷愷', dad: '爸爸', mom: '媽媽', grandma: '阿嬤' };
export const KIDS_IDS = ['yy', 'kk'];

// ---- 每個節慶：活動期間（相對於「正日」幾天）與優先順序（數字小的優先）----
export const FESTS = {
  birthday: { name: '生日', pri: 0 },
  cny: { name: '春節', pri: 1 },
  kids: { name: '兒童節', pri: 2 },
  mother: { name: '母親節', pri: 3 },
  dragon: { name: '端午節', pri: 2 },
  father: { name: '父親節', pri: 3 },
  moon: { name: '中秋節', pri: 2 },
  halloween: { name: '萬聖節', pri: 2 },
  xmas: { name: '聖誕節', pri: 2 },
  pbirthday: { name: '家人生日', pri: 4 },
};

// 今年（和明年初）的節慶正日；回傳 [{ id, day(UTC ms), from, to, extra }]
function calendar(y) {
  const L = LUNAR[y];
  const out = [];
  if (L) {
    const ny = ymd(L[0]);
    out.push({ id: 'cny', day: ny, from: ny - 8 * DAY, to: ny + 14 * DAY, extra: { eve: ny - DAY, lantern: ny + 14 * DAY } });
    out.push({ id: 'dragon', day: ymd(L[1]), from: ymd(L[1]) - 7 * DAY, to: ymd(L[1]) });
    out.push({ id: 'moon', day: ymd(L[2]), from: ymd(L[2]) - 7 * DAY, to: ymd(L[2]) + DAY });
  }
  out.push({ id: 'kids', day: Date.UTC(y, 3, 4), from: Date.UTC(y, 3, 1), to: Date.UTC(y, 3, 4) });
  const md = mothersDay(y);
  out.push({ id: 'mother', day: md, from: md - 6 * DAY, to: md });
  out.push({ id: 'father', day: Date.UTC(y, 7, 8), from: Date.UTC(y, 7, 2), to: Date.UTC(y, 7, 8) });
  out.push({ id: 'halloween', day: Date.UTC(y, 9, 31), from: Date.UTC(y, 9, 24), to: Date.UTC(y, 9, 31) });
  out.push({ id: 'xmas', day: Date.UTC(y, 11, 25), from: Date.UTC(y, 11, 1), to: Date.UTC(y, 11, 26) });
  return out;
}

export function birthday(id) { return state.settings.birthdays?.[id] || ''; }
export function setBirthday(id, v) { state.settings.birthdays = { ...(state.settings.birthdays || {}), [id]: v }; save(); }
export function ageOf(id) {
  const b = birthday(id);
  if (!b) return 0;
  const d = now();
  let a = d.getFullYear() - +b.slice(0, 4);
  if (d.getMonth() + 1 < +b.slice(5, 7) || (d.getMonth() + 1 === +b.slice(5, 7) && d.getDate() < +b.slice(8, 10))) a--;
  return a;
}
// 今天生日的小孩
export function birthdayKids() {
  const d = now();
  const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return KIDS_IDS.filter((id) => birthday(id).slice(5) === md);
}
// 快到生日的家人（3 天內，包含當天）：做卡片
export function familyBirthdays() {
  const t = todayUTC(), y = now().getFullYear();
  return ['dad', 'mom', 'grandma'].filter((id) => {
    const b = birthday(id);
    if (!b) return false;
    const day = Date.UTC(y, +b.slice(5, 7) - 1, +b.slice(8, 10));
    return t >= day - 3 * DAY && t <= day;
  });
}

// 現在進行中的節慶（照優先順序）：[{ id, day, phase: 'pre'|'day'|'post', offset, who?, extra }]
export function activeFests() {
  const t = todayUTC(), y = now().getFullYear();
  const list = [];
  const bk = birthdayKids();
  if (bk.length) list.push({ id: 'birthday', day: t, phase: 'day', offset: 0, who: bk });
  for (const f of [...calendar(y), ...calendar(y - 1)]) {
    if (t < f.from || t > f.to) continue;
    list.push({ ...f, offset: Math.round((t - f.day) / DAY), phase: t < f.day ? 'pre' : t === f.day ? 'day' : 'post' });
  }
  const fb = familyBirthdays();
  if (fb.length) list.push({ id: 'pbirthday', day: t, phase: 'day', offset: 0, who: fb });
  return list.sort((a, b) => FESTS[a.id].pri - FESTS[b.id].pri);
}
export const mainFest = () => activeFests()[0] || null;
export function daysUntil(f) { return Math.max(0, -f.offset); }
export const year = () => now().getFullYear();

// ---- 進度（同步時兩邊取聯集：state.fest 是「代號 → 時間」的表）----
const F = () => (state.fest ||= {});
export const has = (k) => !!F()[k];
export function mark(k) { F()[k] = Date.now(); save(); }
// 節慶相簿：每年每個節慶做完拿一張紀念貼紙
export const albumKey = (id, y = year()) => `album:${y}:${id}`;
export function album() {
  return Object.keys(F()).filter((k) => k.startsWith('album:')).map((k) => { const [, y, id] = k.split(':'); return { y: +y, id }; }).sort((a, b) => b.y - a.y);
}
// 真的禮物：家長頁打開時，生日和聖誕節拆完禮物會說「去找爸爸媽媽」
export const realGift = () => state.settings.realGift !== false;
// 家長頁：今年每個節慶的正日（預覽用）
export function yearList(y = year()) {
  const list = calendar(y).map((f) => ({ id: f.id, date: iso(f.day), name: FESTS[f.id].name }));
  for (const id of ['yy', 'kk', 'dad', 'mom', 'grandma']) {
    const b = birthday(id);
    if (b) list.push({ id: KIDS_IDS.includes(id) ? 'birthday' : 'pbirthday', date: `${y}-${b.slice(5)}`, name: `${PEOPLE[id]}生日` });
  }
  return list.sort((a, b) => a.date.localeCompare(b.date));
}
export const iso8601 = iso;
// 家長頁月曆：某一年的節慶（含活動期間）和家人生日：[{ id, name, date, from, to }]，日期都是 YYYY-MM-DD
export function festSpans(y) {
  const list = calendar(y).map((f) => ({ id: f.id, name: FESTS[f.id].name, date: iso(f.day), from: iso(f.from), to: iso(f.to) }));
  const cny = calendar(y).find((f) => f.id === 'cny');
  if (cny) for (const [t, name] of [[cny.extra.eve, '除夕'], [cny.extra.lantern, '元宵']]) list.push({ id: 'cny', name, date: iso(t), from: iso(cny.from), to: iso(cny.to) });
  for (const id of ['yy', 'kk', 'dad', 'mom', 'grandma']) {
    const b = birthday(id);
    if (!b) continue;
    const date = `${y}-${b.slice(5)}`;
    const kid = KIDS_IDS.includes(id);
    list.push({ id: kid ? 'birthday' : 'pbirthday', name: `${PEOPLE[id]}生日`, date, from: kid ? date : iso(Date.UTC(y, +b.slice(5, 7) - 1, +b.slice(8, 10)) - 3 * DAY), to: date });
  }
  return list;
}
