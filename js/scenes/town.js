// 明星小鎮：選完人之後的主畫面，以及坐叭叭的車。
// 小鎮是一塊可以轉的立體模型：3×3 的路口、馬路、斑馬線、六個地點（家、學堂、公園、超市、診所、農場），閃閃站在中間的廣場。
// 點一個地點 → 叭叭開過來載兄弟倆去：
//   1. 上車繫安全帶（把扣環拖到扣座，「喀」一聲）
//   2. 認路：車子自己開，到路口出現地上的箭頭，選往旗子的方向（愷愷的空間能力；愷愷的對的箭頭會發亮）
//   3. 路上的安全：紅燈、有人過斑馬線，要按「停」（岳岳的「先停一下」；按太晚叭叭也會自己停、不扣分）
//   這次遊玩的第一趟走完整版，之後的路程走短版（繫安全帶＋自動開過去），轉場不會太長。
// 一起玩：愷愷認路、岳岳煞車，兩個人同時有事做。
import { createDiorama } from '../engine/diorama.js';
import { div, wait, burst, stageW, shuffle, pick, toStage, stageRect } from '../core/dom.js';
import { speak } from '../core/voice.js';
import { sfx, playMusic } from '../core/audio.js';
import { isDark, roomTint, hour } from '../core/clock.js';
import { turnsOn, turnsScene, whoseTurn, nextTurn, callTurn, levelNow } from '../core/turns.js';
import { setHint, setPlaying, mountClock } from '../core/session.js';
import { KIDS } from '../config.js';
import { shanSvg, kidHead } from '../art/stars.js';
import { personSvg } from '../art/more.js';
import { babaSvg, itemSvg, ITEM } from '../art/town.js';
import { VEHICLES, helmetSvg, shaoSvg } from '../art/fun.js';
import { PLACE_ICON, MISC, garbageTruckSvg, recycleTruckSvg } from '../art/world.js';
import { mountZone, worldBtn } from './world.js';

// 垃圾車來的時間（台灣通常傍晚到晚上）：16:00～21:00 在小區路口
export const garbageTime = () => hour() >= 16 && hour() < 21;
import { mountStickerBook, drawPlacedStickers } from './fun.js';
import { backdrop, homeBtn, rotateBtns, jars, roundBtn, zoomBtns } from '../ui/hud.js';
import { ICON2 } from '../art/more.js';

// ---- 路網（11/24 改版）：彎彎的馬路、一條河、三個區（住宅區、市中心、公共設施區），城市比畫面大 ----
// 路口（節點）與馬路（邊）；ctrl 是彎曲的控制點（二次曲線）
const W = 3000, D = 2200;
const NODES = {
  A: { x: 520, y: 470 }, B: { x: 520, y: 1160 }, C: { x: 560, y: 1820 }, D: { x: 1120, y: 380 }, E: { x: 1140, y: 1140 },
  F: { x: 2020, y: 1120 }, G: { x: 2020, y: 460 }, H: { x: 2620, y: 780 }, I: { x: 2060, y: 1800 }, J: { x: 1180, y: 1840 },
};
const EDGES = [
  ['A', 'B', [430, 820]], ['B', 'C', [600, 1500]], ['A', 'D', [820, 330]], ['B', 'E', [830, 1250]], ['C', 'J', [860, 1960]],
  ['D', 'E', [1230, 760]], ['E', 'F', [1580, 1060]], ['D', 'G', [1570, 300]], ['G', 'F', [2140, 790]], ['F', 'H', [2400, 1060]],
  ['G', 'H', [2380, 520]], ['F', 'I', [2120, 1460]], ['J', 'I', [1620, 1980]], ['E', 'J', [1080, 1500]],
];
// 河：從北邊彎到南邊
const RIVER = 'M1480 -60 Q1620 500 1520 1000 T1640 2260';
Object.entries(NODES).forEach(([id, n]) => { n.id = id; });
const qpt = (p0, c, p1, t) => ({ x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * c[0] + t * t * p1.x, y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * c[1] + t * t * p1.y });
// 一條馬路的折線（a → b 方向），以及各點的累積長度
const edgeCache = {};
function edgePts(a, b) {
  const key = `${a}-${b}`;
  if (edgeCache[key]) return edgeCache[key];
  const e = EDGES.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const p0 = NODES[a], p1 = NODES[b];
  const pts = [];
  for (let i = 0; i <= 24; i++) pts.push(qpt(p0, e[2], p1, i / 24));
  // 曲線是 e[0]→e[1] 畫的；反方向時控制點一樣，所以直接用 a→b 取樣即可
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return (edgeCache[key] = { pts, acc, len: acc.at(-1) });
}
function along(E, t) {
  const target = t * E.len;
  let i = 1;
  while (i < E.acc.length - 1 && E.acc[i] < target) i++;
  const k = (target - E.acc[i - 1]) / Math.max(0.001, E.acc[i] - E.acc[i - 1]);
  const p = E.pts[i - 1], q = E.pts[i];
  return { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k, dx: q.x - p.x, dy: q.y - p.y };
}
const neighbors = (n) => EDGES.filter(([a, b]) => a === n.id || b === n.id).map(([a, b]) => NODES[a === n.id ? b : a]);
// 最短路線（看路的長度）；同樣長的話隨機
function route(from, to) {
  const dist = { [from]: 0 }, prev = {};
  const todo = new Set(Object.keys(NODES));
  while (todo.size) {
    let u = null;
    for (const k of todo) if (dist[k] !== undefined && (u === null || dist[k] < dist[u])) u = k;
    if (u === null || u === to) break;
    todo.delete(u);
    for (const m of shuffle(neighbors(NODES[u]))) {
      const d = dist[u] + edgePts(u, m.id).len;
      if (dist[m.id] === undefined || d < dist[m.id]) { dist[m.id] = d; prev[m.id] = u; }
    }
  }
  const path = [];
  for (let k = to; k; k = prev[k]) path.unshift(NODES[k]);
  return path;
}
function badgeIcon() {
  return `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M50 6 L86 20 Q86 64 50 94 Q14 64 14 20Z" fill="#2f5fbf"/><path d="M50 26 l7 14 h15 l-12 10 5 15 -15 -9 -15 9 5 -15 -12 -10 h15z" fill="#ffd23f"/></svg>`;
}
export const PLACES = {
  // 住宅區（河的西邊）
  home: { node: 'B', x: 300, y: 1020, screen: 'house', icon: itemSvg('home2'), h: 200 },
  garbage: { node: 'B', x: 640, y: 1290, screen: 'garbage', icon: PLACE_ICON.garbage, h: 30 },
  school: { node: 'A', x: 860, y: 600, screen: 'school', icon: itemSvg('school2'), h: 230 },
  park: { node: 'A', x: 300, y: 560, screen: 'park', color: null, icon: itemSvg('slide'), h: 0 },
  // 市中心（河的東邊）
  market: { node: 'G', x: 1800, y: 760, screen: 'market', icon: itemSvg('cart'), h: 140 },
  library: { node: 'G', x: 2330, y: 300, screen: 'library', icon: PLACE_ICON.library, h: 150 },
  mrt: { node: 'F', x: 1800, y: 1300, screen: 'mrt', icon: PLACE_ICON.mrt, h: 130 },
  post: { node: 'F', x: 2340, y: 1290, screen: 'post', icon: PLACE_ICON.post, h: 130 },
  train: { node: 'H', x: 2780, y: 600, screen: 'world', icon: PLACE_ICON.train, h: 150 },
  // 公共設施區（南邊）
  fire: { node: 'J', x: 880, y: 1640, screen: 'fire', icon: PLACE_ICON.fire, h: 190 },
  police: { node: 'J', x: 1330, y: 1640, screen: 'police', icon: badgeIcon(), h: 140 },
  clinic: { node: 'I', x: 2320, y: 1760, screen: 'clinic', icon: itemSvg('heal'), h: 140 },
};
export const PLACE_OF_SCREEN = Object.fromEntries(Object.entries(PLACES).map(([k, p]) => [p.screen, k]));


// ---- 每個地點的建築：形狀都不一樣，看輪廓就認得出來 ----
const win = (x, y, w = 30, h = 28, c = '#bfe6ff') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}"/><rect x="${x}" y="${y}" width="${w}" height="${h * 0.35}" rx="4" fill="#fff" opacity=".45"/>`;
const face = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none">${inner}</svg>`;
const BUILD = {
  // 學堂：長長的兩層樓＋中間高高的鐘塔＋紅屋頂
  school(dio, p, tap) {
    const w = 200, d = 120, h = 96;
    const x = p.x - w / 2, y = p.y - d / 2;
    const row = (yy) => [12, 46, 124, 158].map((wx) => win(wx, yy)).join('');
    const side = face(w, h, `${row(14)}${row(56)}<rect x="${w / 2 - 20}" y="${h - 46}" width="40" height="46" rx="6" fill="#a8693f"/>`);
    dio.addBox({ x, y, w, d, h, color: '#ffe0a8', tap, faces: { s: side, n: side } });
    dio.addGable({ x, y, w, d, z: h, h: 44, over: 10, color: '#ff5d73', wallColor: '#ffe0a8', ridge: 'x', tap });
    // 鐘塔
    const tw = 62, th = 120;
    const clock = face(tw, th, `<circle cx="31" cy="34" r="22" fill="#fff"/><circle cx="31" cy="34" r="22" fill="none" stroke="#4a3b6b" stroke-width="4"/><path d="M31 34 V20 M31 34 L41 39" stroke="#4a3b6b" stroke-width="4" stroke-linecap="round"/>`);
    dio.addBox({ x: p.x - tw / 2, y: p.y - tw / 2, z: h, w: tw, d: tw, h: th - 20, color: '#ffd28a', tap, faces: { s: clock, e: clock, n: clock, w: clock } });
    dio.addGable({ x: p.x - tw / 2, y: p.y - tw / 2, z: h + th - 20, w: tw, d: tw, h: 36, over: 6, color: '#ff5d73', wallColor: '#ffd28a', ridge: 'y', tap });
    // 旗桿
    dio.addSprite({ x: x + w + 22, y: y + d + 10, w: 60, h: 170, shadow: 0.2, tap, html: `<svg viewBox="0 0 60 170"><rect x="6" y="6" width="5" height="162" fill="#8a8fa0"/><path d="M11 10 H56 L46 26 L56 42 H11Z" fill="#ffd23f"/></svg>` });
  },
  // 超市：又寬又矮、整面玻璃、紅白條紋遮雨棚、屋頂上有大招牌（購物車）
  market(dio, p, tap) {
    const w = 250, d = 150, h = 72;
    const x = p.x - w / 2, y = p.y - d / 2;
    const front = face(w, h, `<rect x="10" y="12" width="${w - 20}" height="${h - 12}" rx="4" fill="#bfe6ff"/><path d="M60 12 V${h} M120 12 V${h} M180 12 V${h}" stroke="#fff" stroke-width="5"/><rect x="${w / 2 - 26}" y="${h - 48}" width="52" height="48" fill="#8fd3ff" stroke="#fff" stroke-width="4"/>`);
    dio.addBox({ x, y, w, d, h, color: '#eaf6ff', tap, faces: { s: front, n: front, e: face(d, h, win(20, 18, 40, 30) + win(90, 18, 40, 30)), w: face(d, h, win(20, 18, 40, 30) + win(90, 18, 40, 30)) } });
    // 遮雨棚（南邊、北邊各一條）
    const stripes = 'repeating-linear-gradient(90deg,#ff5d73 0 22px,#fff 22px 44px)';
    dio.addBox({ x: x - 6, y: y + d - 4, z: h - 18, w: w + 12, d: 30, h: 8, color: '#ff5d73', top: stripes, tap });
    dio.addBox({ x: x - 6, y: y - 26, z: h - 18, w: w + 12, d: 30, h: 8, color: '#ff5d73', top: stripes, tap });
    // 屋頂招牌
    const sign = face(150, 60, `<rect width="150" height="60" rx="12" fill="#3ea8e0"/><g transform="translate(48 2) scale(.56)">${ITEM.cart}</g>`);
    dio.addBox({ x: p.x - 75, y: p.y - 8, z: h, w: 150, d: 16, h: 60, color: '#3ea8e0', tap, faces: { s: sign, n: sign } });
    // 門口的購物車
    for (const cx of [x + 30, x + 66]) dio.addSprite({ x: cx, y: y + d + 44, w: 46, h: 46, shadow: 0.4, tap, html: itemSvg('cart') });
  },
  // 家：透天厝（三層樓、每層有陽台、屋頂有水塔），旁邊還有一間鄰居的透天
  home(dio, p, tap) {
    const w = 100, d = 110, h = 176;
    const x = p.x - w / 2, y = p.y - d / 2;
    const floor = (yy) => `${win(12, yy + 8, 30, 26, '#ffe9a8')}${win(58, yy + 8, 30, 26, '#ffe9a8')}<rect x="6" y="${yy + 40}" width="${w - 12}" height="6" rx="3" fill="#c9ced8"/>`;
    const front = face(w, h, `${floor(4)}${floor(62)}<rect x="0" y="120" width="${w}" height="56" fill="#ffd9b0"/><rect x="34" y="126" width="34" height="50" rx="4" fill="#9aa3b5"/><path d="M34 136 H68 M34 146 H68 M34 156 H68 M34 166 H68" stroke="#c9ced8" stroke-width="3"/>`);
    const side = face(d, h, `${win(40, 20, 30, 26, '#ffe9a8')}${win(40, 80, 30, 26, '#ffe9a8')}`);
    dio.addBox({ x, y, w, d, h, color: '#fff3e6', tap, faces: { s: front, n: side, e: side, w: side } });
    // 屋頂欄杆與水塔
    dio.addBox({ x, y: y + d - 8, z: h, w, d: 8, h: 18, color: '#ff8a3d', tap });
    dio.addBox({ x: x + w - 8, y, z: h, w: 8, d, h: 18, color: '#ff8a3d', tap });
    dio.addSprite({ x: x + 34, y: y + 40, z: h, w: 44, h: 54, shadow: 0, tap, html: `<svg viewBox="0 0 44 54"><rect x="6" y="34" width="4" height="20" fill="#8a8fa0"/><rect x="34" y="34" width="4" height="20" fill="#8a8fa0"/><rect x="2" y="6" width="40" height="30" rx="8" fill="#3ea8e0"/><ellipse cx="22" cy="7" rx="20" ry="5" fill="#7fd3ff"/></svg>` });
    // 鄰居
    const nb = face(80, 150, `${win(10, 14, 24, 24, '#e0f0ff')}${win(46, 14, 24, 24, '#e0f0ff')}${win(10, 70, 24, 24, '#e0f0ff')}${win(46, 70, 24, 24, '#e0f0ff')}<rect x="0" y="110" width="80" height="40" fill="#cfe7d2"/>`);
    dio.addBox({ x: x + w + 6, y: y + 6, w: 80, d: d - 6, h: 150, color: '#e6f4e8', faces: { s: nb } });
  },
  // 消防局：紅色、三個大車庫門、旁邊一座高高的瞭望塔
  fire(dio, p, tap) {
    const w = 150, d = 120, h = 96;
    const x = p.x - w / 2, y = p.y - d / 2;
    const front = face(w, h, `<rect width="${w}" height="16" fill="#c92a2a"/>${[10, 56, 102].map((gx) => `<rect x="${gx}" y="30" width="38" height="66" rx="4" fill="#fff"/><path d="M${gx} 46 H${gx + 38} M${gx} 62 H${gx + 38} M${gx} 78 H${gx + 38}" stroke="#d0d4dc" stroke-width="3"/>`).join('')}`);
    dio.addBox({ x, y, w, d, h, color: '#ff4a4a', tap, faces: { s: front, n: front } });
    dio.addBox({ x: x + w - 36, y: y + 10, z: h, w: 34, d: 34, h: 70, color: '#ff6a5a', tap, faces: { s: face(34, 70, win(6, 8, 22, 18)) } });
    dio.addBox({ x: x + w - 40, y: y + 6, z: h + 70, w: 42, d: 42, h: 10, color: '#c92a2a', tap });
    dio.addSprite({ x: x + 34, y: y + d + 30, w: 90, h: 76, shadow: 0.5, tap, html: VEHICLES.fire });
  },
  // 捷運站／公車站：透明玻璃的拱形入口＋公車亭
  mrt(dio, p, tap) {
    const w = 150, d = 90, h = 60;
    const x = p.x - w / 2, y = p.y - d / 2;
    const glass = face(w, h, `<rect width="${w}" height="${h}" fill="#bfe6ff" opacity=".9"/><path d="M0 14 H${w}" stroke="#3ea8e0" stroke-width="10"/><rect x="${w / 2 - 22}" y="24" width="44" height="36" fill="#8fd3ff"/>`);
    dio.addBox({ x, y, w, d, h, color: '#dff2ff', tap, faces: { s: glass, n: glass } });
    dio.addGable({ x, y, w, d, z: h, h: 34, over: 8, color: '#3ea8e0', ridge: 'x', tap });
    dio.addSprite({ x: x + 20, y: y + d + 40, w: 80, h: 90, shadow: 0.3, tap, html: `<svg viewBox="0 0 80 90"><rect x="6" y="6" width="68" height="8" rx="4" fill="#ffb627"/><rect x="8" y="14" width="4" height="74" fill="#8a8fa0"/><rect x="68" y="14" width="4" height="74" fill="#8a8fa0"/><rect x="16" y="56" width="48" height="8" rx="3" fill="#3ea8e0"/><rect x="60" y="20" width="16" height="22" rx="4" fill="#fff"/><rect x="62" y="24" width="12" height="6" fill="#ffb627"/></svg>` });
  },
  // 圖書館：米色、門口四根柱子、三角形屋頂
  library(dio, p, tap) {
    const w = 150, d = 110, h = 92;
    const x = p.x - w / 2, y = p.y - d / 2;
    const front = face(w, h, `${[14, 46, 96, 128].map((cx) => `<rect x="${cx - 6}" y="8" width="14" height="${h - 8}" fill="#fffaf0"/>`).join('')}<rect x="60" y="40" width="30" height="52" rx="4" fill="#a8693f"/>`);
    dio.addBox({ x, y, w, d, h, color: '#f1e2c4', tap, faces: { s: front, n: front } });
    dio.addGable({ x, y, w, d, z: h, h: 40, over: 8, color: '#c9a87a', wallColor: '#f1e2c4', ridge: 'x', tap, faces: { s: face(w, 40, `<rect x="${w / 2 - 22}" y="16" width="44" height="18" rx="3" fill="#ff5d73"/>`) } });
  },
  // 郵局：綠色房子，門口一紅一綠兩個郵筒
  post(dio, p, tap) {
    const w = 120, d = 100, h = 84;
    const x = p.x - w / 2, y = p.y - d / 2;
    const front = face(w, h, `<rect width="${w}" height="14" fill="#238a49"/>${win(10, 26, 30, 26)}${win(80, 26, 30, 26)}<rect x="44" y="34" width="32" height="50" rx="4" fill="#1d5a33"/><rect x="38" y="16" width="44" height="12" rx="2" fill="#fff"/>`);
    dio.addBox({ x, y, w, d, h, color: '#3cbf6a', tap, faces: { s: front, n: front } });
    dio.addSprite({ x: x - 10, y: y + d + 26, w: 40, h: 56, shadow: 0.3, tap, html: MISC.mailRed });
    dio.addSprite({ x: x + 30, y: y + d + 26, w: 40, h: 56, shadow: 0.3, tap, html: MISC.mailGreen });
  },
  // 火車站：長長的車站、中間有大時鐘、後面有月台和鐵軌
  train(dio, p, tap) {
    const w = 160, d = 80, h = 76;
    const x = p.x - w / 2, y = p.y - d / 2;
    const front = face(w, h, `${win(10, 22, 34, 30)}${win(116, 22, 34, 30)}<rect x="60" y="30" width="40" height="46" rx="4" fill="#a8693f"/><circle cx="80" cy="16" r="12" fill="#fff" stroke="#4a3b6b" stroke-width="3"/>`);
    dio.addBox({ x, y, w, d, h, color: '#ffe6c9', tap, faces: { s: front } });
    dio.addGable({ x, y, w, d, z: h, h: 36, over: 8, color: '#ff8a3d', wallColor: '#ffe6c9', ridge: 'x', tap });
    dio.addDecal({ x: x - 20, y: y - 46, w: w + 40, h: 30, z: 0.9, css: 'background:repeating-linear-gradient(90deg,#8a6a4a 0 6px,transparent 6px 22px),linear-gradient(#bfc4cf 0 18%,transparent 18% 82%,#bfc4cf 82%)' });
  },
  // 垃圾車停靠點（小區路口）：一塊站牌；傍晚垃圾車、資源回收車會停在這裡
  garbage(dio, p, tap) {
    dio.addSprite({ x: p.x, y: p.y, w: 40, h: 90, shadow: 0.3, tap, html: `<svg viewBox="0 0 40 90"><rect x="17" y="30" width="6" height="58" fill="#8a8fa0"/><rect x="2" y="2" width="36" height="32" rx="6" fill="#ffd23f"/><path d="M12 22 L20 12 L28 22 M20 12 V28" stroke="#3a9a55" stroke-width="4" fill="none"/></svg>` });
    if (garbageTime()) {
      dio.addSprite({ x: p.x + 60, y: p.y + 48, w: 110, h: 90, shadow: 0.5, tap, cls: 'gtruck', html: garbageTruckSvg() });
      dio.addSprite({ x: p.x + 60, y: p.y - 30, w: 110, h: 90, shadow: 0.5, tap, cls: 'gtruck', html: recycleTruckSvg() });
    }
  },
  // 診所：白色方方的、屋頂上一個大大的綠色十字（四面都看得到）
  clinic(dio, p, tap) {
    const w = 170, d = 130, h = 92;
    const x = p.x - w / 2, y = p.y - d / 2;
    const front = face(w, h, `<rect x="0" y="0" width="${w}" height="12" fill="#4cd07d"/>${win(14, 26)}${win(w - 44, 26)}<rect x="${w / 2 - 22}" y="${h - 52}" width="44" height="52" rx="4" fill="#bfe6ff" stroke="#fff" stroke-width="4"/>`);
    const sideF = face(d, h, `<rect x="0" y="0" width="${d}" height="12" fill="#4cd07d"/>${win(20, 30)}${win(d - 50, 30)}`);
    dio.addBox({ x, y, w, d, h, color: '#ffffff', tap, faces: { s: front, n: front, e: sideF, w: sideF } });
    const cw = 30, cl = 100, ch = 30;
    dio.addBox({ x: p.x - cl / 2, y: p.y - cw / 2, z: h, w: cl, d: cw, h: ch, color: '#4cd07d', tap });
    dio.addBox({ x: p.x - cw / 2, y: p.y - cl / 2, z: h, w: cw, d: cl, h: ch, color: '#4cd07d', tap });
  },
  // 警察局：深藍色、屋頂上有紅藍警示燈、門口一個大大的星星徽章、停著一台警車
  police(dio, p, tap) {
    const w = 130, d = 110, h = 92;
    const x = p.x - w / 2, y = p.y - d / 2;
    const front = face(w, h, `<rect width="${w}" height="16" fill="#2f5fbf"/>${win(12, 28, 26, 24)}${win(w - 38, 28, 26, 24)}<rect x="${w / 2 - 18}" y="${h - 48}" width="36" height="48" rx="4" fill="#1d3f8a"/><circle cx="${w / 2}" cy="30" r="12" fill="#ffd23f"/>`);
    const sideF = face(d, h, `<rect width="${d}" height="16" fill="#2f5fbf"/>${win(16, 30, 26, 24)}${win(d - 42, 30, 26, 24)}`);
    dio.addBox({ x, y, w, d, h, color: '#e3ebff', tap, faces: { s: front, n: front, e: sideF, w: sideF } });
    dio.addBox({ x: p.x - 24, y: p.y - 10, z: h, w: 22, d: 20, h: 22, color: '#ff4a4a', cls: 'siren-r', tap });
    dio.addBox({ x: p.x + 2, y: p.y - 10, z: h, w: 22, d: 20, h: 22, color: '#3ea8e0', cls: 'siren-b', tap });
    dio.addSprite({ x: x + w + 24, y: y + d + 4, w: 72, h: 60, shadow: 0.5, tap, html: VEHICLES.police });
  },
  // 農場：紅色穀倉（尖屋頂、白色大門）、旁邊高高的圓筒倉、乾草堆
  farm(dio, p, tap) {
    const w = 140, d = 150, h = 84;
    const x = p.x - w / 2 - 55, y = p.y - d / 2;
    const door = face(w, h, `<rect x="${w / 2 - 34}" y="${h - 62}" width="68" height="62" fill="#fff"/><rect x="${w / 2 - 28}" y="${h - 56}" width="56" height="56" fill="#c9503a"/><path d="M${w / 2 - 28} ${h - 56} L${w / 2 + 28} ${h} M${w / 2 + 28} ${h - 56} L${w / 2 - 28} ${h}" stroke="#fff" stroke-width="6"/>`);
    dio.addBox({ x, y, w, d, h, color: '#e0503a', tap, faces: { s: door, n: door } });
    dio.addGable({ x, y, w, d, z: h, h: 70, over: 10, color: '#7a3b30', wallColor: '#e0503a', ridge: 'y', tap,
      faces: { s: face(w, 70, `<circle cx="${w / 2}" cy="44" r="12" fill="#fff"/>`), n: face(w, 70, `<circle cx="${w / 2}" cy="44" r="12" fill="#fff"/>`) } });
    // 圓筒倉（圓柱從哪個方向看都一樣，所以用一直面向鏡頭的看板）
    dio.addSprite({ x: x + w + 27, y: y + 50, w: 56, h: 200, shadow: 0.5, tap, html: `<svg viewBox="0 0 70 200"><defs><linearGradient id="silo" x1="0" x2="1"><stop offset="0" stop-color="#9aa3b5"/><stop offset=".4" stop-color="#e6ebf3"/><stop offset="1" stop-color="#8a93a5"/></linearGradient></defs><rect x="6" y="40" width="58" height="160" fill="url(#silo)"/><path d="M6 42 C6 4 64 4 64 42Z" fill="#c9503a"/><path d="M6 80 H64 M6 120 H64 M6 160 H64" stroke="#7d8698" stroke-width="2" opacity=".5"/></svg>` });
    dio.addSprite({ x: x + w + 25, y: y + d + 10, w: 60, h: 44, shadow: 0.4, tap, html: itemSvg('hay') });
  },
};

// ---- 小鎮模型（小鎮地圖和坐車都用） ----
export function buildTown() {
  const dio = createDiorama({ gl: true, w: W, d: D, walls: false, zoom: 0.8, zmin: 0.34, zmax: 1.5, cy: 0.58, skirt: '#a6d987', horizon: 'town',
    floorCss: 'background: radial-gradient(ellipse at 25% 30%, #b8e89a 0, transparent 40%), radial-gradient(ellipse at 75% 70%, #b0e392 0, transparent 45%), #a6d987' });
  // 地面一張大圖：河、馬路、中線、斑馬線（都是彎的）
  const roadPath = EDGES.map(([a, b, c]) => `M${NODES[a].x} ${NODES[a].y} Q${c[0]} ${c[1]} ${NODES[b].x} ${NODES[b].y}`).join(' ');
  const crossings = [];
  let zebra = '';
  EDGES.forEach(([a, b], i) => {
    if (i % 3 === 2) return;   // 不是每條路都有斑馬線
    const E = edgePts(a, b);
    const m = along(E, 0.5);
    const ang = (Math.atan2(m.dy, m.dx) * 180) / Math.PI;
    zebra += `<g transform="translate(${m.x} ${m.y}) rotate(${ang})">${[-36, -18, 0, 18, 36].map((o) => `<rect x="-6" y="${o - 5}" width="44" height="10" fill="#fff" opacity=".9" transform="translate(-16 0)"/>`).join('')}</g>`;
    crossings.push({ a: NODES[a], b: NODES[b], x: m.x, y: m.y, t: 0.5, ang });
  });
  // 橋：馬路跨過河的地方（E-F、D-G、J-I）
  const bridges = ['E-F', 'D-G', 'J-I'].map((k) => { const [a, b] = k.split('-'); const E = edgePts(a, b); let best = 0.5, bd = 1e9; for (let t = 0.2; t <= 0.8; t += 0.02) { const p = along(E, t); const rx = 1480 + (p.y / 2200) * 140; const d = Math.abs(p.x - rx); if (d < bd) { bd = d; best = t; } } const p = along(E, best); return { ...p, ang: (Math.atan2(p.dy, p.dx) * 180) / Math.PI }; });
  const ground = `<svg viewBox="0 0 ${W} ${D}" width="100%" height="100%">
    <path d="${RIVER}" stroke="#7fd3ff" stroke-width="170" fill="none" stroke-linecap="round"/><path d="${RIVER}" stroke="#5ec3ee" stroke-width="110" fill="none"/>
    <path d="${roadPath}" stroke="#c9ced8" stroke-width="118" fill="none" stroke-linecap="round"/>
    <path d="${roadPath}" stroke="#8a8fa0" stroke-width="96" fill="none" stroke-linecap="round"/>
    <path d="${roadPath}" stroke="#fff" stroke-width="5" fill="none" stroke-dasharray="34 34"/>
    ${bridges.map((p) => `<g transform="translate(${p.x} ${p.y}) rotate(${p.ang})"><rect x="-120" y="-62" width="240" height="10" rx="5" fill="#c98b5e"/><rect x="-120" y="52" width="240" height="10" rx="5" fill="#c98b5e"/></g>`).join('')}
    ${zebra}
    ${Object.values(NODES).map((n) => `<circle cx="${n.x}" cy="${n.y}" r="56" fill="#8a8fa0"/>`).join('')}
  </svg>`;
  dio.addDecal({ x: 0, y: 0, w: W, h: D, z: 0.8, cls: 'road', html: ground, budget: 6e6 });
  // 地點
  const markers = {};
  for (const [id, p] of Object.entries(PLACES)) {
    if (id === 'park') {
      dio.addDecal({ x: p.x - 170, y: p.y - 150, w: 340, h: 300, z: 0.9, css: 'border-radius:46% 54% 40% 60% / 50% 40% 60% 50%;background:#7fd06a', cls: 'place' }).dataset.tap = `go:${id}`;
      for (const [tx, ty] of [[p.x - 100, p.y - 80], [p.x + 100, p.y - 90], [p.x - 90, p.y + 80], [p.x + 20, p.y - 120]]) dio.addSprite({ x: tx, y: ty, w: 90, h: 120, shadow: 0.6, tap: `go:${id}`, html: `<svg viewBox="0 0 80 110"><rect x="34" y="70" width="12" height="38" rx="5" fill="#a9744f"/><circle cx="40" cy="48" r="34" fill="#4fbf6e"/><circle cx="28" cy="36" r="10" fill="#8fe39a" opacity=".7"/></svg>` });
      dio.addSprite({ x: p.x + 40, y: p.y + 50, w: 120, h: 110, shadow: 0.5, html: itemSvg('slide'), tap: `go:${id}` });
    } else {
      BUILD[id](dio, p, `go:${id}`);
    }
    markers[id] = dio.addSprite({ x: p.x, y: p.y, z: (p.h || 40) + 70, w: 130, h: 130, html: `<div class="inner">${p.icon}</div>`, cls: 'marker place-mark', shadow: 0, tap: `go:${id}` });
  }
  // 火車站後面的鐵軌，往東邊一直延伸出去（去郊區、海邊、山上）
  dio.addDecal({ x: 2560, y: 480, w: 1400, h: 40, z: 0.9, css: 'background:repeating-linear-gradient(90deg,#8a6a4a 0 8px,transparent 8px 26px),linear-gradient(#bfc4cf 0 18%,transparent 18% 82%,#bfc4cf 82%)' });
  // 一般的房子、店、公寓：讓城鎮有「有人住」的感覺（不能點）
  const filler = [
    // 住宅區：一排一排透天
    ...[[180, 1360], [300, 1360], [420, 1360], [180, 760], [300, 820]].map(([x, y], i) => ['tou', x, y, ['#fff3e6', '#e6f4e8', '#e6eeff', '#fff0f0', '#fff8d6'][i % 5]]),
    ...[[820, 900], [940, 900], [300, 1560], [420, 1560]].map(([x, y], i) => ['tou', x, y, ['#e6eeff', '#fff8d6', '#fff3e6', '#e6f4e8'][i % 4]]),
    // 市中心：公寓和店面
    ...[[2200, 760], [2400, 780], [2560, 1180], [2560, 1420], [1820, 1520], [2340, 1500], [2080, 250], [1780, 300]].map(([x, y], i) => ['apt', x, y, ['#c9d6ea', '#e6d6c4', '#d6c8ff', '#c8f0d6', '#ffd6a0', '#bfe6ff', '#ffe0a8', '#e6eeff'][i]]),
    ...[[1820, 960], [2240, 1000]].map(([x, y], i) => ['shop', x, y, ['#ff8fbf', '#7ee06a'][i]]),
  ];
  for (const [k, x, y, c] of filler) {
    if (k === 'tou') {
      dio.addBox({ x: x - 50, y: y - 50, w: 100, d: 100, h: 150, color: c, faces: { s: `<svg viewBox="0 0 100 150" width="100%" height="100%" preserveAspectRatio="none">${[14, 66].map((yy) => `<rect x="12" y="${yy}" width="30" height="26" rx="4" fill="#bfe6ff"/><rect x="58" y="${yy}" width="30" height="26" rx="4" fill="#bfe6ff"/>`).join('')}<rect x="26" y="110" width="48" height="40" fill="#9aa3b5"/></svg>` } });
    } else if (k === 'apt') {
      dio.addBox({ x: x - 60, y: y - 50, w: 120, d: 100, h: 230, color: c, faces: { s: `<svg viewBox="0 0 120 230" width="100%" height="100%" preserveAspectRatio="none">${[14, 58, 102, 146, 190].map((yy) => [12, 48, 84].map((xx) => `<rect x="${xx}" y="${yy}" width="24" height="26" rx="3" fill="#fff" opacity=".7"/>`).join('')).join('')}</svg>` } });
    } else {
      dio.addBox({ x: x - 60, y: y - 40, w: 120, d: 80, h: 80, color: '#fffaf0', faces: { s: `<svg viewBox="0 0 120 80" width="100%" height="100%" preserveAspectRatio="none"><rect width="120" height="22" fill="${c}"/><path d="M0 22 ${[...Array(6)].map((_, i) => `Q${i * 20 + 10} 34 ${i * 20 + 20} 22`).join(' ')}" fill="${c}"/><rect x="14" y="36" width="92" height="44" fill="#bfe6ff"/></svg>` } });
    }
  }
  // 路燈（晚上會亮）：每個路口旁邊一支
  for (const n of Object.values(NODES)) {
    dio.addSprite({ x: n.x + 70, y: n.y - 70, w: 40, h: 120, shadow: 0.3, cls: 'streetlight', html: `<svg viewBox="0 0 40 120"><rect x="17" y="20" width="6" height="98" fill="#4a3b6b"/><circle class="lamp" cx="20" cy="16" r="12" fill="#fff3a0"/></svg>` });
  }
  // 樹：沿著河邊一排、城市外圍幾棵
  const treeSvg = (c) => `<svg viewBox="0 0 80 110"><rect x="34" y="70" width="12" height="38" rx="5" fill="#a9744f"/><circle cx="40" cy="48" r="34" fill="${c}"/></svg>`;
  for (let y = 120; y < D; y += 260) {
    const rx = 1480 + (y / 2200) * 140;
    dio.addSprite({ x: rx - 150, y, w: 80, h: 110, shadow: 0.6, html: treeSvg('#4fbf6e') });
    dio.addSprite({ x: rx + 160, y: y + 120, w: 80, h: 110, shadow: 0.6, html: treeSvg('#5fc76a') });
  }
  for (const [x, y] of [[80, 120], [100, 1900], [900, 2100], [2900, 200], [2880, 2000], [2700, 1700], [2950, 1100], [60, 900], [1300, 120], [700, 1980]]) {
    dio.addSprite({ x, y, w: 90, h: 120, shadow: 0.6, html: treeSvg(pick(['#4fbf6e', '#3f9f5a', '#6cc072'])) });
  }
  dio.seal();   // 之後加的（閃閃、叭叭、坐車時的車子和行人）用 CSS，才能動
  return { dio, markers, crossings };
}

// ======================= 小鎮地圖 =======================
export async function mountTown(root, app) {
  // 不在城市（郊區、海邊、山上）：畫那一區的地圖
  if (app.trip.zone && app.trip.zone !== 'city') return mountZone(root, app);
  backdrop(root);
  const T = buildTown();
  const { dio } = T;
  root.appendChild(dio.el);
  app.onLeave(() => { setHint(null); setPlaying(false); dio.destroy(); });
  dio.setTint(roomTint());
  if (isDark()) root.classList.add('night');
  // 閃閃和叭叭在現在的位置旁邊；鏡頭從這裡開始（城市比畫面大，要看別的地方可以拉遠、兩指移動、或點上面的地點列）
  const here = PLACES[app.trip.location] || PLACES.home;
  const hn = NODES[here.node];
  const shan = dio.addSprite({ x: hn.x - 60, y: hn.y + 70, z: 1, w: 120, h: 136, html: shanSvg(), shadow: 0.7, tap: 'shan' });
  const car = dio.addSprite({ x: hn.x + 40, y: hn.y + 30, z: 1, w: 120, h: 98, html: babaSvg(), shadow: 0.6, tap: 'baba' });
  dio.view.px = (here.x + hn.x) / 2; dio.view.py = (here.y + hn.y) / 2; dio.view.z = 0.8; dio.apply();
  T.markers[app.trip.location].el.classList.add('here');

  homeBtn(root, () => app.go('opening'));
  jars(root, app.profile.members);
  mountClock(root);
  rotateBtns(root, dio);
  zoomBtns(root, dio);
  turnsScene(root);
  setPlaying(true);
  playMusic(isDark() ? 'lullaby' : 'town');
  // 愷愷的貼紙本（貼在小鎮上）、岳岳的畫畫板
  if (app.profile.members.includes('kk')) mountStickerBook(root, dio, { onOpen: () => { going = true; }, onClose: () => { going = false; } });
  else drawPlacedStickers(dio);
  if (app.profile.members.includes('yy')) roundBtn(root, 'btn-draw', DRAW_ICON, () => { setPlaying(false); app.go('draw'); });
  worldBtn(root, app);
  let going = false;
  // 地點列：點一下鏡頭飛過去（標記會跳），再點一次就出發
  placeBar(root, dio, PLACES, T.markers, app.trip.location, (id) => { if (!going) dio.el.dispatchEvent(new CustomEvent('tapname', { detail: `go:${id}` })); }, shan.el);
  setHint(() => document.querySelector('.placebar button'));

  const onTapTown = async (name) => {
    if (name.startsWith('go:')) {
      if (going) return;
      const to = name.slice(3);
      going = true;
      sfx('tap');
      T.markers[to].el.classList.add('hop');
      setPlaying(false);
      if (to === (app.trip.location)) {
        await speak('shan', `town_go_${to}`, { node: shan.el });
        if (app.alive()) app.go(PLACES[to].screen);
      } else {
        await speak('shan', `town_go_${to}`, { node: shan.el });
        if (!app.alive()) return;
        const vehicle = await pickVehicle(root, app);
        if (!vehicle) { going = false; setPlaying(true); T.markers[to].el.classList.remove('hop'); return; }
        if (app.alive()) app.go('ride', { to, vehicle });
      }
    } else if (name === 'shan') {
      sfx('boing');
      shan.el.classList.remove('hop'); void shan.el.offsetWidth; shan.el.classList.add('hop');
      speak('shan', 'town_pick', { node: shan.el });
    } else if (name === 'baba') {
      sfx('boing');
      car.el.classList.remove('hop'); void car.el.offsetWidth; car.el.classList.add('hop');
      speak('baba', 'baba_hi', { node: car.el });
    }
  };
  dio.onTap(onTapTown);
  dio.el.addEventListener('tapname', (e) => onTapTown(e.detail));
  if (!app.trip.seenTown) {
    app.trip.seenTown = true;
    await speak('shan', 'town_hello', { node: shan.el });
  }
  // 傍晚垃圾車來了：放垃圾車的音樂、提醒一次（每次遊戲一次）
  if (garbageTime() && !app.trip.heardGarbage && app.alive()) {
    app.trip.heardGarbage = true;
    playMusic('garbage');
    T.markers.garbage.el.classList.add('glowy');
    await speak('shan', 'garbage_coming', { node: shan.el });
  }
  if (app.alive()) speak('shan', 'town_pick', { node: shan.el });
}

// ---- 地點列（城市比畫面大，不用到處找）：點一下鏡頭飛到那裡、標記跳一下；同一個再點一次就出發 ----
export function placeBar(root, dio, places, markers, here, go, node = null) {
  const bar = div('placebar ui', Object.entries(places).map(([id, p]) => `<button data-id="${id}" class="${id === here ? 'here' : ''}">${p.icon}</button>`).join(''));
  root.appendChild(bar);
  let sel = null;
  // 不要讓按地點列時順便轉到小鎮；用 click（手指放開且沒滑動）才選，左右滑地點列時不會誤選
  bar.addEventListener('pointerdown', (e) => e.stopPropagation());
  bar.addEventListener('click', (e) => {
    e.stopPropagation();
    const b = e.target.closest('button');
    if (!b) return;
    const id = b.dataset.id;
    sfx('tap');
    if (sel === id) { go(id); return; }
    sel = id;
    bar.querySelectorAll('button').forEach((x) => x.classList.toggle('sel', x === b));
    speak('shan', `place_${id}`, { node });   // 說出地點的中文和英文
    const p = places[id];
    dio.animateTo({ px: p.x, py: p.y, z: Math.max(dio.view.z, 0.75) }, 700);
    const m = markers[id]?.el;
    if (m) { m.classList.remove('hop'); void m.offsetWidth; m.classList.add('hop'); }
  });
  return bar;
}

const DRAW_ICON = `<svg viewBox="0 0 100 100"><rect x="14" y="18" width="72" height="60" rx="10" fill="#fff"/><path d="M24 64 Q40 30 56 52 T80 40" stroke="#3ea8e0" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="66" cy="34" r="8" fill="#ffd23f"/><rect x="44" y="78" width="12" height="14" fill="#c98b5e"/></svg>`;

// ---- 要坐什麼去？叭叭、公車、警車、消防車、腳踏車（一個人玩才能騎腳踏車）----
function pickVehicle(root, app) {
  const solo = app.profile.members.length === 1;
  const color = KIDS[app.profile.members[0]].color;
  const opts = [['baba', babaSvg()], ['bus', VEHICLES.bus], ['police', VEHICLES.police], ['fire', VEHICLES.fire], ...(solo ? [['bike', VEHICLES.bike(color)]] : [])];
  return new Promise((resolve) => {
    const scrim = div('scrim');
    const box = div('vpick ui', opts.map(([k, html]) => `<button class="vopt" data-v="${k}">${html}</button>`).join('') + `<button class="vback">${ICON2.skip}</button>`);
    root.append(scrim, box);
    speak('baba', 'pick_vehicle');
    const done = (v) => { scrim.remove(); box.remove(); resolve(v); };
    box.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const b = e.target.closest('.vopt');
      if (b) { sfx('tap'); b.classList.add('hop'); setTimeout(() => done(b.dataset.v), 250); return; }
      if (e.target.closest('.vback')) { sfx('tap'); done(null); }
    });
    scrim.addEventListener('pointerdown', (e) => { e.stopPropagation(); done(null); });
  });
}

// ======================= 坐叭叭的車 =======================
export async function mountRide(root, app) {
  const to = app.params?.to || 'school';
  const from = app.trip.location;
  const full = !app.trip.rides;
  app.trip.rides += 1;
  let alive = true;
  backdrop(root);
  const T = buildTown();
  const { dio } = T;
  root.appendChild(dio.el);
  app.onLeave(() => { alive = false; setHint(null); setPlaying(false); dio.destroy(); });
  dio.setTint(roomTint());
  if (isDark()) root.classList.add('night');
  dio.lock(true);
  turnsScene(root);
  mountClock(root);
  setPlaying(true);
  playMusic('drive');
  const say = (ch, id, node) => (alive ? speak(ch, id, { node: node || null }) : Promise.resolve());
  const chk = () => { if (!alive) throw new Error('left'); };

  const path = route(PLACES[from].node, PLACES[to].node);
  const vehicle = app.params?.vehicle || 'baba';
  const vhtml = vehicle === 'baba' ? babaSvg() : vehicle === 'bike' ? VEHICLES.bike(KIDS[app.profile.members[0]].color) : VEHICLES[vehicle];
  const car = dio.addSprite({ x: path[0].x, y: path[0].y, z: 1, w: vehicle === 'bus' || vehicle === 'fire' ? 130 : 110, h: vehicle === 'bus' || vehicle === 'fire' ? 110 : 90, html: vhtml, shadow: 0.6 });
  drawPlacedStickers(dio);
  const flag = dio.addSprite({ x: path[path.length - 1].x + 30, y: path[path.length - 1].y - 30, z: 1, w: 90, h: 240, shadow: 0.4,
    html: `<svg viewBox="0 0 90 240"><rect x="10" y="10" width="7" height="228" rx="3" fill="#8a8fa0"/><path d="M17 14 H84 L70 40 L84 66 H17Z" fill="#ff5d73"/><circle cx="13" cy="10" r="8" fill="#ffd23f"/></svg>` });
  flag.el.classList.add('goal-flag');
  T.markers[to].el.classList.add('target');
  dio.el.classList.add('riding');   // 坐車時：只留目的地的標記，其他東西點不到（不擋住地上的箭頭）

  // 轉小鎮的按鈕：只有在路口選方向時出現（可以轉一轉找旗子，不用靠記憶）
  const rot = rotateBtns(root, dio);
  rot.show(false);
  // 鏡頭跟著車
  let following = true;
  const follow = () => { if (!following) return; dio.view.px = car.x; dio.view.py = car.y; dio.apply(); };
  dio.view.z = 1.25;
  follow();

  try {
    // 1. 繫安全帶
    if (vehicle === 'bike') await helmet(root, app, () => alive);
    else await seatbelt(root, app, full, () => alive);
    chk();
    // 2. 開車
    const stopBtn = document.createElement('button');
    stopBtn.className = 'bigbtn stopbtn ui';
    stopBtn.innerHTML = itemSvg('stop');
    stopBtn.style.cssText = 'left:calc(50% - 75px);bottom:24px;display:none';
    root.appendChild(stopBtn);
    let stopPressed = null;
    let lastNoNeed = 0;
    stopBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      sfx('click');
      if (stopPressed) stopPressed();
      else if (Date.now() - lastNoNeed > 3000) { lastNoNeed = Date.now(); say('baba', 'ride_go_ok', car.el); }
    });
    await say('baba', full ? 'ride_start' : 'ride_start_short', car.el);
    chk();
    if (full) stopBtn.style.display = '';
    // 這一趟要遇到的狀況：紅燈一次、行人一次（完整版才有）
    const segs = path.length - 1;
    const events = {};
    if (full && segs >= 1) {
      const order = shuffle([...Array(segs).keys()]);
      events[order[0]] = 'light';
      if (segs >= 2) events[order[1]] = 'walker';
      else events[order[0]] = pick(['light', 'walker']);
    }
    const speed = full ? 260 : 520;   // 每秒幾個單位
    for (let i = 0; i < segs; i++) {
      const a = path[i], b = path[i + 1];
      // 路口選方向（完整版、而且這裡有岔路）
      if (full && i > 0 && neighbors(a).length > 2) {
        await chooseDirection(a, b);
        chk();
      }
      const ev = events[i];
      await drive(a, b, ev);
      chk();
    }
    stopBtn.remove();
    // 3. 到了
    sfx('fanfare');
    burst(stageW() / 2, 400, { n: 24, spread: 220 });
    await say('baba', full ? `ride_arrive_${to}` : 'ride_arrive_short', car.el);
    chk();
    if (full) { await say('baba', 'ride_lookback', car.el); chk(); }
    app.trip.location = to;
    app.go(PLACES[to].screen);

    // ---- 開一段路；ev：'light' 紅燈、'walker' 行人 ----
    async function drive(a, b, ev) {
      const E = edgePts(a.id, b.id);
      const len = E.len;
      const dur = (len / speed) * 1000;
      let t = 0, last = performance.now(), paused = false;
      let evState = ev ? 'wait' : null;  // wait → active → stopped → done
      let light = null, walker = null, cross = null;
      if (ev === 'light') { const lp = along(E, 0.86); const nl = Math.hypot(lp.dx, lp.dy) || 1; light = dio.addSprite({ x: lp.x - (lp.dy / nl) * 80, y: lp.y + (lp.dx / nl) * 80, w: 46, h: 120, shadow: 0.3, html: lightSvg('green') }); }
      if (ev === 'walker') {
        const tp = along(E, 0.5); const nl = Math.hypot(tp.dx, tp.dy) || 1;
        cross = { x: tp.x, y: tp.y, nx: -tp.dy / nl, ny: tp.dx / nl };
      }
      // 停的位置：紅燈在路口前；行人在斑馬線前
      const stopAt = ev === 'light' ? 0.8 : cross ? Math.max(0.2, Math.min(0.85, (len * 0.5 - 80) / len)) : 1;
      const trigger = Math.max(0.1, stopAt - 0.35);
      if (turnsOn() && ev && whoseTurn() !== 'yy') nextTurn({ say: false });
      await new Promise((resolve) => {
        const step = async (now) => {
          if (!alive) return resolve();
          const dt = now - last;
          last = now;
          if (!paused) t = Math.min(1, t + dt / dur);
          { const cp = along(E, t); car.move(cp.x, cp.y, 1); }
          follow();
          if (evState === 'wait' && t >= trigger) {
            evState = 'active';
            if (ev === 'light') { light.el.innerHTML = lightSvg('red'); sfx('ding'); say('baba', 'ride_red', car.el); }
            else {
              walker = dio.addSprite({ x: cross.x - cross.nx * 75, y: cross.y - cross.ny * 75, w: 60, h: 116, shadow: 0.5, html: personSvg(pick(['dad', 'mom', 'grandma', 'uncle', 'auntie'])) });
              say('baba', 'ride_walker', car.el);
            }
            setHint(() => stopBtn);
            stopPressed = () => { if (evState === 'active') { evState = 'stopping'; stopPressed = null; } };
          }
          if ((evState === 'active' || evState === 'stopping') && t >= stopAt) {
            const late = evState === 'active';
            evState = 'stopped';
            paused = true;
            stopPressed = null;
            setHint(null);
            (async () => {
              sfx(late ? 'soft' : 'sparkle');
              if (!late) burst(stageRect(stopBtn).x, stageRect(stopBtn).y - 60, { n: 14, stars: true, colors: ['#ffd23f', '#fff3a0'] });
              await say('baba', late ? (ev === 'light' ? 'ride_red_late' : 'ride_walker_late') : 'ride_stop_good', car.el);
              if (ev === 'walker') {
                // 行人走過斑馬線
                const sx = walker.x, sy = walker.y, t0 = performance.now();
                await new Promise((res) => {
                  const w = (n2) => {
                    const k = Math.min(1, (n2 - t0) / 2200);
                    walker.move(sx + cross.nx * 150 * k, sy + cross.ny * 150 * k, Math.abs(Math.sin(k * 12)) * 6);
                    if (k < 1 && alive) requestAnimationFrame(w); else res();
                  };
                  requestAnimationFrame(w);
                });
                walker.remove();
              } else {
                await wait(2200);
                light.el.innerHTML = lightSvg('green');
              }
              if (!alive) return;
              sfx('ding');
              await say('baba', 'ride_green', car.el);
              evState = 'done';
              paused = false;
              last = performance.now();
            })();
          }
          if (t >= 1 && !paused) { light?.remove(); return resolve(); }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }

    // ---- 路口：地上出現箭頭，選往旗子的方向 ----
    async function chooseDirection(a, b) {
      if (turnsOn() && whoseTurn() !== 'kk') nextTurn({ say: false });
      const opts = neighbors(a);
      const destP = PLACES[to];
      const zt = Math.max(0.42, Math.min(0.85, 700 / Math.max(1, Math.hypot(destP.x - a.x, destP.y - a.y))));
      const AS = 90 * Math.max(1, 0.8 / zt);   // 鏡頭拉遠時箭頭跟著變大，手指才點得到
      const shadows = [];
      const arrows = opts.map((n) => {
        const Ea = edgePts(a.id, n.id);
        const q = along(Ea, Math.min(1, 130 / Ea.len));
        const ql = Math.hypot(q.x - a.x, q.y - a.y) || 1;
        const dx = (q.x - a.x) / ql, dy = (q.y - a.y) / ql;
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;
        // 箭頭浮在屋頂上方（不會被房子擋住），地上留一個小圓點表示是哪條路
        const gx = a.x + dx * (60 + AS * 0.6), gy = a.y + dy * (60 + AS * 0.6);
        shadows.push(dio.addDecal({ x: gx - 22, y: gy - 22, w: 44, h: 44, z: 2, cls: 'road-dot' }));
        const d = dio.addDecal({ x: gx - AS / 2, y: gy - AS / 2, w: AS, h: AS, z: 150, cls: 'road-arrow', html: `<div style="transform:rotate(${ang}deg);width:100%;height:100%">${itemSvg('arrow')}</div>` });
        d.dataset.tap = `dir:${n.id}`;
        if (n.id === b.id) d.dataset.ok = '1';
        return d;
      });
      const right = arrows.find((d) => d.dataset.ok);
      if (levelNow(app.profile) === 'easy' || (turnsOn() && whoseTurn() === 'kk')) right.classList.add('glow');
      // 拉遠一點，車子和旗子都在畫面裡；這時候可以轉小鎮，從哪個角度看都可以
      following = false;
      const dest = PLACES[to];
      dio.lock(false);
      rot.show(true);
      stopBtn.style.visibility = 'hidden';   // 選方向時用不到停車鈕，讓出位置給轉小鎮的按鈕
      dio.animateTo({ z: zt, px: (a.x + dest.x) / 2, py: (a.y + dest.y) / 2 }, 700);
      setHint(() => right);
      say('baba', 'ride_which', car.el);   // 不等說完：說的時候就可以點
      let lastWrong = 0;
      let wrongs = 0;
      // 一陣子沒選、或選錯兩次：提醒可以轉一轉找旗子
      const lookTimer = setTimeout(() => { if (alive) { rot.pulse(true); say('baba', 'ride_turn_look', car.el); } }, 9000);
      await new Promise((resolve) => {
        const handler = (e) => {
          if (dio.justDragged()) return;   // 剛剛是在轉小鎮，不是點箭頭
          const t = e.target.closest('[data-tap^="dir:"]');
          if (!t) return;
          if (t.dataset.ok) { dio.el.removeEventListener('click', handler); sfx('tap'); resolve(); return; }
          sfx('soft');
          R2(t);
          wrongs++;
          if (wrongs === 2) { rot.pulse(true); say('baba', 'ride_turn_look', car.el); lastWrong = Date.now(); }
          else if (Date.now() - lastWrong > 3000) { lastWrong = Date.now(); say('baba', 'ride_wrong_way', car.el); }
        };
        const R2 = (el) => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
        dio.el.addEventListener('click', handler);
        const watch = setInterval(() => { if (!alive) { clearInterval(watch); resolve(); } }, 400);
      });
      clearTimeout(lookTimer);
      setHint(null);
      arrows.forEach((d) => d.remove());
      shadows.forEach((d) => d.remove());
      // 回到跟著車子；角度留在小孩轉到的地方，車子往前開的方向跟他看到的一樣
      rot.pulse(false);
      rot.show(false);
      stopBtn.style.visibility = '';
      dio.lock(true);
      await dio.animateTo({ z: 1.25, px: car.x, py: car.y }, 600);
      following = true;
      if (alive) say('baba', 'ride_right_way', car.el);
    }
  } catch (e) {
    if (alive) console.error(e);
  }
}

function lightSvg(state) {
  return `<svg viewBox="0 0 46 120" width="100%" height="100%"><rect x="20" y="50" width="6" height="68" fill="#4a3b6b"/><rect x="6" y="4" width="34" height="54" rx="10" fill="#2f2a44"/>
    <circle cx="23" cy="18" r="9" fill="${state === 'red' ? '#ff4a4a' : '#5a3a3a'}"/><circle cx="23" cy="42" r="9" fill="${state === 'green' ? '#4cff8a' : '#2f4a3a'}"/></svg>`;
}

// ---- 騎腳踏車：先把安全帽拖到頭上 ----
async function helmet(root, app, alive) {
  const id = app.profile.members[0];
  const scrim = div('scrim');
  const pnl = div('panel helmetpanel');
  root.append(scrim, pnl);
  pnl.innerHTML = `<div class="hkid">${kidHead(id, 260)}<div class="hspot"></div></div><div class="hhelmet">${helmetSvg()}</div>`;
  const node = div('panel-host', babaSvg());
  root.appendChild(node);
  try {
    await speak('baba', 'helmet_go', { node });
    if (!alive()) return;
    const hel = pnl.querySelector('.hhelmet'), spot = pnl.querySelector('.hspot');
    setHint(() => hel);
    await new Promise((resolve) => {
      hel.addEventListener('pointerdown', (e) => {
        e.preventDefault(); e.stopPropagation();
        const pr = pnl.getBoundingClientRect();
        const k = pnl.offsetWidth / pr.width;
        const mv = (ev) => { hel.style.left = `${(ev.clientX - pr.left) * k - 80}px`; hel.style.top = `${(ev.clientY - pr.top) * k - 60}px`; };
        const up = (ev) => {
          window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
          const r = spot.getBoundingClientRect();
          if (Math.hypot(ev.clientX - (r.left + r.width / 2), ev.clientY - (r.top + r.height / 2)) < 120 / k) {
            hel.classList.add('on'); hel.style.left = ''; hel.style.top = '';
            sfx('click'); sfx('sparkle');
            const rr = stageRect(spot); burst(rr.x, rr.y, { n: 14, stars: true });
            resolve();
          } else { hel.style.left = ''; hel.style.top = ''; sfx('soft'); }
        };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
      });
      const watch = setInterval(() => { if (!alive()) { clearInterval(watch); resolve(); } }, 400);
    });
    setHint(null);
    if (alive()) await speak('baba', 'helmet_done', { node });
  } finally {
    scrim.remove(); pnl.remove(); node.remove();
  }
}

// ---- 繫安全帶：把扣環拖到扣座 ----
export async function seatbelt(root, app, full, alive) {
  const members = app.profile.members;
  const scrim = div('scrim');
  const pnl = div('panel beltpanel2');
  root.append(scrim, pnl);
  pnl.innerHTML = `<div class="carseat-bg"></div>`;
  const node = div('panel-host', babaSvg());
  root.appendChild(node);
  try {
    const belts = members.map((id, i) => {
      const x = members.length > 1 ? (i === 0 ? 120 : 520) : 320;
      const seat = div('seat', `<div class="seat-back"></div><div class="seat-kid">${kidHead(id, 200)}</div>
        <div class="belt-strap"></div><div class="buckle" data-kid="${id}">${itemSvg('belt')}</div><div class="clasp"></div>`);
      seat.style.left = `${x}px`;
      pnl.appendChild(seat);
      return { id, seat, buckle: seat.querySelector('.buckle'), clasp: seat.querySelector('.clasp'), done: false };
    });
    await speak('baba', full ? 'belt_go' : 'belt_short', { node });
    if (!alive()) return;
    setHint(() => belts.find((b) => !b.done)?.buckle);
    await new Promise((resolve) => {
      for (const b of belts) {
        b.buckle.addEventListener('pointerdown', (e) => {
          if (b.done) return;
          e.preventDefault();
          e.stopPropagation();
          b.buckle.classList.add('dragging');
          const sr = b.seat.getBoundingClientRect();
          const scale = b.seat.offsetWidth / sr.width;
          const mv = (ev) => {
            b.buckle.style.left = `${(ev.clientX - sr.left) * scale - 45}px`;
            b.buckle.style.top = `${(ev.clientY - sr.top) * scale - 45}px`;
          };
          const up = (ev) => {
            window.removeEventListener('pointermove', mv);
            window.removeEventListener('pointerup', up);
            b.buckle.classList.remove('dragging');
            const c = b.clasp.getBoundingClientRect();
            const cx = c.left + c.width / 2, cy = c.top + c.height / 2;
            if (Math.hypot(ev.clientX - cx, ev.clientY - cy) < 90 / (1 / (sr.width / b.seat.offsetWidth))) {
              b.done = true;
              b.seat.classList.add('buckled');
              b.buckle.style.left = ''; b.buckle.style.top = '';
              sfx('click');
              sfx('sparkle');
              const r = stageRect(b.clasp);
              burst(r.x, r.y, { n: 14, stars: true, colors: ['#ffd23f', '#fff3a0'] });
              if (belts.every((x) => x.done)) resolve();
            } else {
              b.buckle.style.left = ''; b.buckle.style.top = '';
              sfx('soft');
            }
          };
          window.addEventListener('pointermove', mv);
          window.addEventListener('pointerup', up);
        });
      }
      const watch = setInterval(() => { if (!alive()) { clearInterval(watch); resolve(); } }, 400);
    });
    setHint(null);
    if (!alive()) return;
    await speak('baba', 'belt_done', { node });
  } finally {
    scrim.remove(); pnl.remove(); node.remove();
  }
}
