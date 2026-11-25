// 學習紀錄（11/25）：給家長頁畫圖用。只存在這台裝置和家長自己的雲端同步檔。
// 每人每天一筆（用真實的日期，家長用「假裝現在幾點」測試時也記在今天）：
//   kids[id].log[日期] = { m: [[幾點幾分(分鐘), 心情 1~5, 's' 玩之前 | 'e' 玩之後]], g: { 關卡: [玩幾次, 毫秒, 自己完成, 靠提示, 中途離開] } }
// 「靠提示」：這一關錯了兩次以上（錯的時候都會出 'soft' 聲音），或停太久出現了手指提示。
// 乘法：state.multHist[日期] = 學會幾題（每天記一次，畫進步曲線）。
import { state, save } from './store.js';
import { dateKey } from './clock.js';
import { masteredCount } from './mult.js';
import { onSfx } from './audio.js';

const realDay = (d = new Date()) => dateKey(d);
const LOG_DAYS = 60;

function logOf(id) { const k = state.kids[id]; return k ? (k.log ||= {}) : null; }
function dayOf(id, day = realDay()) { const L = logOf(id); if (!L) return null; return (L[day] ||= { m: [], g: {} }); }

// ---- 一關從開始到結束 ----
let cur = null;
const nowMs = () => performance.now();
document.addEventListener('visibilitychange', () => {
  if (!cur) return;
  if (document.hidden) { cur.ms += nowMs() - cur.since; cur.since = 0; }
  else cur.since = nowMs();
});
export function gameBegin(ids, key) {
  cur = { ids: [...ids], key, ms: 0, since: document.hidden ? 0 : nowMs(), wrongs: 0, hand: false };
}
export function noteWrong() { if (cur) cur.wrongs++; }
onSfx((name) => { if (name === 'soft') noteWrong(); });
export function noteHand() { if (cur) cur.hand = true; }
export function gameEnd(done) {
  if (!cur) return;
  const c = cur;
  cur = null;
  if (c.since) c.ms += nowMs() - c.since;
  const ms = Math.min(20 * 60000, Math.round(c.ms));
  if (!done && ms < 4000) return;   // 一進去馬上就出來：不算
  const help = c.wrongs >= 2 || c.hand;
  for (const id of c.ids) {
    const d = dayOf(id);
    if (!d) continue;
    const r = (d.g[c.key] ||= [0, 0, 0, 0, 0]);
    r[0] += 1; r[1] += ms;
    if (!done) r[4] += 1; else if (help) r[3] += 1; else r[2] += 1;
  }
  snapMult();
  save();
}

// ---- 心情 ----
export function addMood(id, v, when) {
  const d = dayOf(id);
  if (!d) return;
  const t = new Date();
  d.m.push([t.getHours() * 60 + t.getMinutes(), v, when]);
  save();
}
// 30 分鐘內已經問過同一種（例如重新打開 app）就不再問
export function askedRecently(id, when, mins = 30) {
  const d = logOf(id)?.[realDay()];
  if (!d) return false;
  const t = new Date(), now = t.getHours() * 60 + t.getMinutes();
  return d.m.some(([m, , w]) => w === when && now - m >= 0 && now - m < mins);
}

export function snapMult() {
  const n = masteredCount();
  state.multHist ||= {};
  const day = realDay();
  if ((state.multHist[day] || 0) < n) state.multHist[day] = n;
}

export function pruneLogs() {
  const keep = new Set();
  const d = new Date();
  for (let i = 0; i < LOG_DAYS; i++) { keep.add(realDay(d)); d.setDate(d.getDate() - 1); }
  for (const k of Object.values(state.kids)) for (const day of Object.keys(k.log || {})) if (!keep.has(day)) delete k.log[day];
  for (const day of Object.keys(state.multHist || {})) if (!keep.has(day)) delete state.multHist[day];
}

// ---- 生活領域：每個關卡歸一類（沒寫到的照場景） ----
export const DOMAINS = [
  ['care', '🪥', '自理'], ['safe', '🚦', '安全'], ['health', '🥦', '飲食健康'],
  ['social', '🤝', '情緒與社交'], ['learn', '✖️', '學習'], ['space', '🧭', '空間與觀察'],
];
const BY_GAME = {
  'bedroom.toys': 'care', 'bedroom.dress': 'care', 'bedroom.simon': 'social', 'bath.brush': 'care', 'bath.wash': 'care', 'bath.haz': 'safe',
  'kitchen.plate': 'health', 'kitchen.table': 'care', 'kitchen.safe': 'safe', 'kitchen.dumpling': 'social',
  'living.tv': 'care', 'living.door': 'safe', 'living.stage': 'social',
  'school.blocks': 'space',
  'market.list': 'learn', 'market.pay': 'learn', 'market.bag': 'space',
  'park.trash': 'care', 'park.animals': 'space', 'park.queue': 'social', 'park.dino': 'space',
  'farm.feed': 'health', 'farm.eggs': 'space', 'farm.grow': 'health',
  'mrt.board': 'safe', 'mrt.seat': 'social', 'mrt.route': 'space',
  'library.voice': 'social', 'library.story': 'learn', 'library.shelf': 'space',
  'post.send': 'social', 'post.color': 'space', 'post.deliver': 'space',
  'garbage.steps': 'care', 'garbage.trash': 'care', 'garbage.recycle': 'care', 'garbage.big': 'safe',
  'aquarium.tunnel': 'space', 'aquarium.penguin': 'social', 'aquarium.rules': 'safe',
  'beach.sun': 'health', 'beach.shells': 'space', 'beach.safe': 'safe',
  'zoo.find': 'space', 'zoo.food': 'health', 'zoo.rules': 'safe',
  'pier.vest': 'care', 'pier.board': 'safe', 'pier.row': 'social', 'pier.mirror': 'space', 'thao.pestle': 'learn', 'thao.safe': 'safe',
  'airport.checkin': 'care', 'airport.security': 'safe', 'airport.gate': 'learn', 'airport.carousel': 'space',
  'penghu.weir': 'space', 'penghu.basalt': 'space', 'penghu.tide': 'safe', 'penghu.turtle': 'care',
  'huadong.gorge': 'safe', 'huadong.bike': 'safe', 'huadong.balloon': 'space', 'huadong.whale': 'learn',
  'hehuan.layers': 'health', 'hehuan.snowman': 'space', 'hehuan.walk': 'health', 'hehuan.stars': 'learn',
  'fest.cn_clean': 'care', 'fest.mo_help': 'care', 'fest.fa_help': 'care', 'fest.dr_safe': 'safe', 'fest.md_bbq': 'safe',
  'ride.route': 'space',
  'fest.cn_lantern': 'learn', 'fest.md_story': 'learn', 'fest.md_phase': 'space', 'fest.dr_egg': 'space', 'fest.xm_tree': 'space', 'fest.xm_advent': 'learn',
};
const BY_SCENE = { bedroom: 'care', bath: 'care', kitchen: 'health', living: 'care', school: 'learn', market: 'learn', park: 'space', clinic: 'health', farm: 'health', police: 'safe', fire: 'safe', mrt: 'safe', library: 'learn', post: 'social', garbage: 'care', fest: 'social' };
// 坐車認路最近有沒有一直卡住：最近 7 天坐了 3 趟以上，靠提示＋中途離開占六成以上 → 給多一點幫忙
export function rideStruggle(id) {
  let n = 0, bad = 0;
  for (const day of lastDays(7)) { const r = state.kids[id]?.log?.[day]?.g?.['ride.route']; if (r) { n += r[0]; bad += r[3] + r[4]; } }
  return n >= 3 && bad / n >= 0.6;
}
export const domainOf = (key) => BY_GAME[key] || BY_SCENE[key.split('.')[0]] || 'learn';

// ---- 統計 ----
export function dayStats(id, day) {
  const d = state.kids[id]?.log?.[day];
  const o = { tries: 0, ms: 0, solo: 0, help: 0, quit: 0, done: 0, moodS: null, moodE: null, games: {} };
  if (!d) return o;
  for (const [k, r] of Object.entries(d.g || {})) {
    o.tries += r[0]; o.ms += r[1]; o.solo += r[2]; o.help += r[3]; o.quit += r[4];
    o.games[k] = r;
  }
  o.done = o.solo + o.help;
  // 同一天打卡好幾次：玩之前取第一次（剛來的心情）、玩之後取最後一次
  const s = (d.m || []).filter((x) => x[2] === 's').sort((a, b) => a[0] - b[0]);
  const e = (d.m || []).filter((x) => x[2] === 'e').sort((a, b) => a[0] - b[0]);
  o.moodS = s.length ? s[0][1] : null;
  o.moodE = e.length ? e[e.length - 1][1] : null;
  return o;
}
export const avgFocusMin = (st) => (st.tries ? st.ms / st.tries / 60000 : null);
export function lastDays(n, end = new Date()) {
  const out = [];
  const d = new Date(end);
  for (let i = 0; i < n; i++) { out.unshift(realDay(d)); d.setDate(d.getDate() - 1); }
  return out;
}
export const today = () => realDay();
export function rangeStats(id, days) {
  const t = { tries: 0, ms: 0, solo: 0, help: 0, quit: 0, done: 0, dom: Object.fromEntries(DOMAINS.map(([k]) => [k, 0])), playDays: 0 };
  for (const day of days) {
    const s = dayStats(id, day);
    if (s.tries) t.playDays++;
    t.tries += s.tries; t.ms += s.ms; t.solo += s.solo; t.help += s.help; t.quit += s.quit; t.done += s.done;
    for (const [k, r] of Object.entries(s.games)) t.dom[domainOf(k)] += r[2] + r[3];
  }
  return t;
}
