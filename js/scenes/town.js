// 明星小鎮：選完人之後的主畫面，以及坐叭叭的車。
// 小鎮是一塊可以轉的立體模型：3×3 的路口、馬路、斑馬線、六個地點（家、學堂、公園、超市、診所、農場），閃閃站在中間的廣場。
// 點一個地點 → 叭叭開過來載兄弟倆去：
//   1. 上車繫安全帶（把扣環拖到扣座，「喀」一聲）
//   2. 認路：車子自己開，到路口出現地上的箭頭，選往旗子的方向（愷愷的空間能力；愷愷的對的箭頭會發亮）
//   3. 路上的安全：紅燈、有人過斑馬線，要按「停」（岳岳的「先停一下」；按太晚叭叭也會自己停、不扣分）
//   這次遊玩的第一趟走完整版，之後的路程走短版（繫安全帶＋自動開過去），轉場不會太長。
// 一起玩：愷愷認路、岳岳煞車，兩個人同時有事做。
import { createDiorama, lit } from '../engine/diorama.js';
import { div, wait, burst, stageW, shuffle, pick, toStage, stageRect } from '../core/dom.js';
import { speak } from '../core/voice.js';
import { sfx, playMusic } from '../core/audio.js';
import { isDark, roomTint, hour } from '../core/clock.js';
import { turnsOn, turnsScene, whoseTurn, nextTurn, callTurn, levelNow } from '../core/turns.js';
import { setHint, setPlaying, mountClock } from '../core/session.js';
import { KIDS, NAMES } from '../config.js';
import { shanSvg, kidHead, starPolygon } from '../art/stars.js';
import { personSvg } from '../art/more.js';
import { babaSvg, itemSvg, ITEM } from '../art/town.js';
import { VEHICLES, helmetSvg, shaoSvg } from '../art/fun.js';
import { PLACE_ICON, MISC, garbageTruckSvg, recycleTruckSvg } from '../art/world.js';
import { mountZone, worldBtn } from './world.js';
import { startTraffic } from './traffic.js';
import { stepsGame } from './kit.js';

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
// 高架捷運的軌道（東西向一直線）與火車的鐵軌（火車站後面往東）
const MRT_LINE = { y: 1212, x0: 1260, x1: 2190, z: 128 };
const TRAIN_LINE = { y: 500, stop: 2975, far: 3260 };   // 停在車站東邊的月台（停在車站正後面會被畫到屋頂上）
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
  clinic: { node: 'I', x: 2420, y: 1800, screen: 'clinic', icon: itemSvg('heal'), h: 340 },
  // 名人堂（11/24）：河邊，認識明星小鎮的每一位明星
  fame: { node: 'E', x: 1350, y: 770, screen: 'fame', icon: PLACE_ICON.fame, h: 170 },
};
export const PLACE_OF_SCREEN = Object.fromEntries(Object.entries(PLACES).map(([k, p]) => [p.screen, k]));


// ---- 每個地點的建築：形狀都不一樣，看輪廓就認得出來 ----
const win = (x, y, w = 30, h = 28, c = '#bfe6ff') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}"/><rect x="${x}" y="${y}" width="${w}" height="${h * 0.35}" rx="4" fill="#fff" opacity=".45"/>`;
const face = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none">${inner}</svg>`;
// ---- 鄰居的透天（11/24，參考大雅區龍善二街一帶）：四層樓連棟，一樓鐵捲門車庫、樓上有陽台欄杆，
// 外牆各家不一樣（二丁掛磁磚、白色現代風、洗石子＋石材、歐式拱窗），屋頂有斜屋頂、鐵皮加蓋。
// 我們家是三層樓＋屋頂水塔、橘色欄杆、插一面星星旗，一看就認得。
const TOU = {
  // 二丁掛磁磚（米色、一條一條橫線）＋紅色斜屋頂
  brick: { wall: '#ecd3ad', line: '#dcbf95', frame: '#8a6f55', glass: '#bfe6ff', rail: '#6b5a4a', roof: 'gable', roofColor: '#c9553f' },
  // 白色現代風：深灰窗框、玻璃陽台，屋頂藍色鐵皮加蓋
  modern: { wall: '#f6f6f2', frame: '#3a3f4a', glass: '#a8d8f0', rail: '#3a3f4a', glassRail: true, roof: 'shed', roofColor: '#5b8fd8' },
  // 一樓石材、樓上奶油色，咖啡色鋁窗，屋頂綠色鐵皮
  stone: { wall: '#f1eadb', base: '#9aa0a8', frame: '#7a4f2f', glass: '#cfe8f5', rail: '#7a4f2f', roof: 'shed', roofColor: '#6fb27a' },
  // 歐式：粉橘外牆、白色拱窗，深灰斜屋頂
  euro: { wall: '#f4c9b8', frame: '#ffffff', glass: '#bfe6ff', rail: '#ffffff', arch: true, roof: 'gable', roofColor: '#5a5f6e' },
};
function touHouse(dio, { x, y, w = 100, d = 100, floors = 4, style = 'brick', tap = null }) {
  const S = TOU[style];
  const FH = 40, h = floors * FH;
  const up = (i) => (floors - 1 - i) * FH;   // 第 i 層（0 是一樓）的上緣
  let art = '';
  if (S.line) for (let yy = 4; yy < h - FH; yy += 7) art += `<rect x="0" y="${yy}" width="${w}" height="1.6" fill="${S.line}"/>`;
  if (S.base) art += `<rect x="0" y="${up(0)}" width="${w}" height="${FH}" fill="${S.base}"/>${[0, 1, 2].map((r) => [...Array(5)].map((_, c) => `<rect x="${c * 22 + (r % 2) * 11 - 6}" y="${up(0) + r * 13 + 1}" width="20" height="11" rx="2" fill="#b4bac2"/>`).join('')).join('')}`;
  for (let i = 1; i < floors; i++) {
    const t = up(i);
    // 窗戶（歐式是拱形）
    const wx = w * 0.16, ww = w * 0.68, wy = t + 6, wh = FH * 0.58;
    art += S.arch
      ? `<path d="M${wx} ${wy + wh} V${wy + 10} Q${wx + ww / 2} ${wy - 8} ${wx + ww} ${wy + 10} V${wy + wh}Z" fill="${S.frame}"/><path d="M${wx + 4} ${wy + wh} V${wy + 12} Q${wx + ww / 2} ${wy - 2} ${wx + ww - 4} ${wy + 12} V${wy + wh}Z" fill="${S.glass}"/>`
      : `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="${S.frame}"/><rect x="${wx + 3}" y="${wy + 3}" width="${ww / 2 - 4.5}" height="${wh - 6}" fill="${S.glass}"/><rect x="${wx + ww / 2 + 1.5}" y="${wy + 3}" width="${ww / 2 - 4.5}" height="${wh - 6}" fill="${S.glass}"/>`;
    // 陽台欄杆（玻璃的或鐵的）
    const ry = t + FH - 12;
    art += S.glassRail
      ? `<rect x="4" y="${ry}" width="${w - 8}" height="11" fill="${S.glass}" opacity=".75"/><rect x="4" y="${ry}" width="${w - 8}" height="2.5" fill="${S.rail}"/>`
      : `<rect x="4" y="${ry}" width="${w - 8}" height="2.5" fill="${S.rail}"/>${[...Array(9)].map((_, k) => `<rect x="${6 + k * ((w - 14) / 8)}" y="${ry}" width="2" height="11" fill="${S.rail}"/>`).join('')}`;
  }
  // 一樓：鐵捲門車庫＋小門
  const g = up(0);
  art += `<rect x="${w * 0.06}" y="${g + 6}" width="${w * 0.6}" height="${FH - 6}" fill="#a7adb9"/>${[...Array(7)].map((_, k) => `<rect x="${w * 0.06}" y="${g + 9 + k * 4.6}" width="${w * 0.6}" height="1.4" fill="#c9ced8"/>`).join('')}<rect x="${w * 0.72}" y="${g + 10}" width="${w * 0.2}" height="${FH - 10}" rx="2" fill="${S.frame === '#ffffff' ? '#a8693f' : S.frame}"/>`;
  const front = face(w, h, art);
  // 側面：小窗、冷氣室外機
  const side = face(d, h, `${S.line ? [...Array(Math.floor((h - FH) / 7))].map((_, k) => `<rect x="0" y="${4 + k * 7}" width="${d}" height="1.6" fill="${S.line}"/>`).join('') : ''}<rect x="${d * 0.55}" y="${up(2) + 10}" width="${d * 0.22}" height="18" fill="${S.frame}"/><rect x="${d * 0.57}" y="${up(2) + 12}" width="${d * 0.18}" height="14" fill="${S.glass}"/><rect x="${d * 0.2}" y="${up(1) + 14}" width="22" height="16" rx="2" fill="#e8e8e8"/><circle cx="${d * 0.2 + 11}" cy="${up(1) + 22}" r="5" fill="#b8bcc6"/>`);
  dio.addBox({ x, y, w, d, h, color: S.wall, tap, faces: { s: front, n: side, e: side, w: side } });
  // 屋頂
  if (S.roof === 'gable') dio.addGable({ x, y, w, d, z: h, h: 28, over: 5, color: S.roofColor, wallColor: S.wall, ridge: 'x', tap });
  else {
    dio.addBox({ x, y: y + d - 6, z: h, w, d: 6, h: 14, color: S.wall, tap });   // 女兒牆
    dio.addBox({ x: x + w * 0.12, y: y + 8, z: h, w: w * 0.76, d: d * 0.55, h: 30, color: S.roofColor, tap });   // 鐵皮加蓋
  }
}

// ---- 醫院附近的街屋（11/24，參考清泉醫院周邊街景與空拍）：
// 三、四層樓的店面透天：一樓騎樓＋店面、遮陽棚，樓上鐵窗和冷氣室外機，牆上伸出直立招牌，屋頂鐵皮加蓋；
// 東北邊是社區大樓（金大城那樣的住宅大樓：一層一排陽台）；店門口停一排機車。
// 招牌只用圖案（藥局綠十字、醫療用品紅十字、便當碗、理髮旋轉燈、早餐杯子、水果），不用字。
const SIGN = {
  pharmacy: { c: '#2fa65a', icon: '<rect x="13" y="6" width="10" height="28" rx="2" fill="#fff"/><rect x="4" y="15" width="28" height="10" rx="2" fill="#fff"/>' },
  medical: { c: '#e53935', icon: '<rect x="13" y="6" width="10" height="28" rx="2" fill="#fff"/><rect x="4" y="15" width="28" height="10" rx="2" fill="#fff"/>' },
  bento: { c: '#ff8a3d', icon: '<path d="M5 18 H31 Q30 34 18 34 Q6 34 5 18Z" fill="#fff"/><path d="M9 14 Q18 6 27 14" stroke="#fff" stroke-width="3" fill="none"/><path d="M24 4 L30 16 M28 3 L33 14" stroke="#fff" stroke-width="2"/>' },
  salon: { c: '#3a6fd8', icon: '<rect x="12" y="4" width="12" height="32" rx="6" fill="#fff"/><path d="M12 10 L24 16 M12 18 L24 24 M12 26 L24 32" stroke="#e53935" stroke-width="3"/>' },
  breakfast: { c: '#ffb627', icon: '<path d="M9 10 H27 L24 34 H12Z" fill="#fff"/><rect x="8" y="6" width="20" height="5" rx="2" fill="#fff"/><path d="M20 6 L24 0" stroke="#fff" stroke-width="2.5"/>' },
  fruit: { c: '#7ac143', icon: '<circle cx="18" cy="22" r="12" fill="#fff"/><path d="M18 10 Q20 4 26 4" stroke="#fff" stroke-width="3" fill="none"/>' },
};
const AWNING = { pharmacy: '#2fa65a', medical: '#e53935', bento: '#ff8a3d', salon: '#3a6fd8', breakfast: '#ffd23f', fruit: '#7ac143' };
// 一間店面透天。face：正面朝哪裡（'s' 朝南、'n' 朝北）
function shopHouse(dio, { x, y, w = 80, d = 90, floors = 4, wall = '#f1e6d2', sign = 'bento', face: fc = 's', roof = '#5b8fd8', grill = '#d6dbe4' }) {
  const FH = 36, h = floors * FH;
  const S = SIGN[sign], aw = AWNING[sign];
  let art = '';
  // 樓上：每層一扇有鐵窗的窗、下面一台冷氣室外機、樓板線
  for (let f = 1; f < floors; f++) {
    const t = h - (f + 1) * FH;
    art += `<rect x="0" y="${t + FH - 3}" width="${w}" height="3" fill="#00000014"/>`
      + `<rect x="${w * 0.14}" y="${t + 6}" width="${w * 0.6}" height="${FH * 0.52}" fill="#8fb4d4"/>`
      + `<rect x="${w * 0.12}" y="${t + 4}" width="${w * 0.64}" height="${FH * 0.58}" fill="none" stroke="${grill}" stroke-width="2.5"/>`
      + [...Array(6)].map((_, k) => `<rect x="${w * 0.12 + (k + 1) * (w * 0.64 / 7)}" y="${t + 4}" width="1.6" height="${FH * 0.58}" fill="${grill}"/>`).join('')
      + `<rect x="${w * 0.12}" y="${t + 4 + FH * 0.29}" width="${w * 0.64}" height="1.6" fill="${grill}"/>`
      + `<rect x="${w * 0.8}" y="${t + FH * 0.5}" width="${w * 0.15}" height="${FH * 0.3}" rx="1.5" fill="#e8e8e8"/><circle cx="${w * 0.875}" cy="${t + FH * 0.65}" r="${FH * 0.1}" fill="#b8bcc6"/>`;
  }
  // 一樓：騎樓（暗暗的走廊）、兩邊柱子、裡面亮亮的店、遮陽棚的影子
  const g = h - FH;
  art += `<rect x="0" y="${g}" width="${w}" height="${FH}" fill="#4a4550"/><rect x="${w * 0.1}" y="${g + 8}" width="${w * 0.8}" height="${FH - 8}" fill="#fff6d8"/><rect x="${w * 0.14}" y="${g + 12}" width="${w * 0.32}" height="${FH * 0.4}" fill="${aw}" opacity=".35"/><rect x="${w * 0.54}" y="${g + 12}" width="${w * 0.32}" height="${FH * 0.4}" fill="${aw}" opacity=".25"/><rect x="0" y="${g}" width="${w * 0.07}" height="${FH}" fill="${wall}"/><rect x="${w * 0.93}" y="${g}" width="${w * 0.07}" height="${FH}" fill="${wall}"/>`;
  const front = face(w, h, art);
  const side = face(d, h, [...Array(floors - 1)].map((_, f) => `<rect x="0" y="${h - (f + 2) * FH + FH - 3}" width="${d}" height="3" fill="#00000014"/>`).join(''));
  // 背面也不是一面白牆：每層鐵窗、冷氣、熱水器，一樓後門（從預設的鏡頭角度常常看到背面）
  let backArt = '';
  for (let f = 1; f < floors; f++) {
    const t = h - (f + 1) * FH;
    backArt += `<rect x="0" y="${t + FH - 3}" width="${w}" height="3" fill="#00000014"/><rect x="${w * 0.36}" y="${t + 7}" width="${w * 0.42}" height="${FH * 0.45}" fill="#8fb4d4"/><rect x="${w * 0.34}" y="${t + 5}" width="${w * 0.46}" height="${FH * 0.5}" fill="none" stroke="${grill}" stroke-width="2.2"/>${[...Array(4)].map((_, k) => `<rect x="${w * 0.34 + (k + 1) * (w * 0.46 / 5)}" y="${t + 5}" width="1.5" height="${FH * 0.5}" fill="${grill}"/>`).join('')}<rect x="${w * 0.08}" y="${t + FH * 0.45}" width="${w * 0.18}" height="${FH * 0.32}" rx="1.5" fill="#e8e8e8"/><circle cx="${w * 0.17}" cy="${t + FH * 0.61}" r="${FH * 0.1}" fill="#b8bcc6"/>`;
  }
  backArt += `<rect x="${w * 0.6}" y="${h - FH + 8}" width="${w * 0.22}" height="${FH - 8}" fill="#8a6f55"/><rect x="${w * 0.14}" y="${h - FH + 10}" width="${w * 0.3}" height="${FH * 0.36}" fill="#8fb4d4"/><rect x="${w * 0.88}" y="${h - FH * 2.2}" width="${w * 0.08}" height="${FH * 0.5}" rx="2" fill="#f4f6fa"/>`;
  const back = face(w, h, backArt);
  const faces = fc === 's' ? { s: front, n: back, e: side, w: side } : { n: front, s: back, e: side, w: side };
  dio.addBox({ x, y, w, d, h, color: wall, faces });
  // 遮陽棚（一樓上面伸出來一片）＋上面的店招（只有圖案）
  const fy = fc === 's' ? y + d : y;
  const out = fc === 's' ? 1 : -1;
  dio.addBox({ x: x + 2, y: fc === 's' ? fy : fy - 16, z: FH - 6, w: w - 4, d: 16, h: 5, color: aw });
  dio.addPanel(fc === 's'
    ? { x1: x + 4, y1: fy + 16 * out + 0.5, x2: x + w - 4, y2: fy + 16 * out + 0.5, z: FH - 6, h: 12, css: aw, html: face(w - 8, 12, `<rect width="${w - 8}" height="12" fill="${aw}"/>${[...Array(Math.floor((w - 8) / 10))].map((_, k) => `<path d="M${k * 10} 12 Q${k * 10 + 5} 17 ${k * 10 + 10} 12" fill="${aw}"/>`).join('')}`) }
    : { x1: x + w - 4, y1: fy - 16 - 0.5, x2: x + 4, y2: fy - 16 - 0.5, z: FH - 6, h: 12, css: aw });
  // 牆上伸出來的直立招牌（兩面都有圖案）
  const sx = x + w - 6;
  const signHtml = `<svg viewBox="0 0 36 90" width="100%" height="100%" preserveAspectRatio="none"><rect width="36" height="90" rx="4" fill="${S.c}"/><rect x="3" y="3" width="30" height="84" rx="3" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/><g transform="translate(0 6)">${S.icon}</g><g transform="translate(0 48)">${S.icon}</g></svg>`;
  dio.addPanel({ x1: sx, y1: fy, x2: sx, y2: fy + 22 * out, z: FH + 8, h: FH * Math.min(2, floors - 1.5), css: S.c, html: signHtml, both: true });
  // 屋頂：鐵皮加蓋
  dio.addBox({ x: x + w * 0.1, y: y + d * 0.15, z: h, w: w * 0.8, d: d * 0.6, h: 22, color: roof });
}
// 社區住宅大樓：一層一排陽台，最下面兩層是石材、屋頂有一圈
function condo(dio, { x, y, w = 150, d = 120, floors = 12, wall = '#efe6d8', rail = '#9aa3b5' }) {
  const FH = 24, h = floors * FH;
  const f = (W) => face(W, h, `${[...Array(floors - 2)].map((_, k) => { const t = k * FH; return `<rect x="6" y="${t + 4}" width="${W - 12}" height="${FH * 0.55}" fill="#8fb4d4"/>${[...Array(Math.floor(W / 40))].map((__, c) => `<rect x="${(c + 1) * 40 - 2}" y="${t + 4}" width="4" height="${FH * 0.55}" fill="${wall}"/>`).join('')}<rect x="2" y="${t + FH * 0.62}" width="${W - 4}" height="${FH * 0.3}" fill="${wall}" stroke="${rail}" stroke-width="1.2"/>`; }).join('')}<rect x="0" y="${h - 2 * FH}" width="${W}" height="${2 * FH}" fill="#c9c2b4"/>${[...Array(Math.floor(W / 30))].map((_, c) => `<rect x="${c * 30 + 8}" y="${h - 2 * FH + 8}" width="18" height="${FH * 1.4}" fill="#6c7a8c"/>`).join('')}`);
  dio.addBox({ x, y, w, d, h, color: wall, faces: { s: f(w), n: f(w), e: f(d), w: f(d) } });
  dio.addBox({ x: x + w * 0.2, y: y + d * 0.2, z: h, w: w * 0.6, d: d * 0.6, h: 30, color: '#d9cfbd' });
  dio.addGable({ x: x + w * 0.2, y: y + d * 0.2, z: h + 30, w: w * 0.6, d: d * 0.6, h: 22, color: '#8a6a5c', ridge: 'x' });
}
const scooterSvg = (c) => `<svg viewBox="0 0 40 30"><circle cx="9" cy="24" r="5" fill="#3a3550"/><circle cx="31" cy="24" r="5" fill="#3a3550"/><path d="M8 20 H26 L30 10 H34" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="10" y="12" width="14" height="6" rx="3" fill="#3a3550"/></svg>`;
// 一排機車（停在騎樓前面）
function scooters(dio, x0, y, n) {
  const cs = ['#e53935', '#2f7fe0', '#ffffff', '#7ac143', '#ffb627', '#3a3550'];
  for (let k = 0; k < n; k++) dio.addSprite({ x: x0 + k * 18, y, w: 26, h: 20, shadow: 0.3, html: scooterSvg(cs[(k * 7 + n) % cs.length]) });
}

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
    // 我們家的記號：屋頂插一面黃色星星旗
    dio.addSprite({ x: x + 14, y: y + d - 14, z: h + 18, w: 46, h: 70, shadow: 0, tap, html: `<svg viewBox="0 0 46 70"><rect x="4" y="4" width="4" height="66" fill="#8a8fa0"/><path d="M8 6 H42 L34 18 L42 30 H8Z" fill="#ffd23f"/><polygon points="${starPolygon(22, 18, 8, 3.5)}" fill="#ff8a3d"/></svg>` });
    // 隔壁鄰居：連棟的四層樓透天（跟我們家長得不一樣）
    touHouse(dio, { x: x - 100, y: y + 4, w: 98, d: d - 4, style: 'brick' });
    touHouse(dio, { x: x - 198, y: y + 4, w: 98, d: d - 4, style: 'modern' });
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
  // 名人堂：白色大理石、金色屋頂、門口紅地毯、屋頂一顆大星星
  fame(dio, p, tap) {
    const w = 170, d = 110, h = 96;
    const x = p.x - w / 2, y = p.y - d / 2;
    const front = face(w, h, `${[12, 44, 112, 144].map((cx) => `<rect x="${cx}" y="10" width="14" height="${h - 10}" fill="#fff"/><rect x="${cx - 3}" y="6" width="20" height="8" rx="2" fill="#f0d98a"/>`).join('')}<rect x="66" y="34" width="38" height="62" rx="18" fill="#c9402f"/><rect x="72" y="40" width="26" height="56" rx="13" fill="#e0574a"/>`);
    dio.addBox({ x, y, w, d, h, color: '#fbf4e6', tap, faces: { s: front, n: front } });
    dio.addGable({ x, y, w, d, z: h, h: 44, over: 10, color: '#ffc93c', wallColor: '#fbf4e6', ridge: 'x', tap, faces: { s: face(w, 44, `<polygon points="${w / 2},8 ${w / 2 + 7},24 ${w / 2 + 24},24 ${w / 2 + 10},33 ${w / 2 + 15},44 ${w / 2},37 ${w / 2 - 15},44 ${w / 2 - 10},33 ${w / 2 - 24},24 ${w / 2 - 7},24" fill="#fff6b0"/>`) } });
    dio.addDecal({ x: p.x - 20, y: y + d, w: 40, h: 70, z: 1.2, css: 'background:#d9473b' });   // 紅地毯
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
  // 醫院（清泉醫院造型；小兒科謝醫生）
  // 醫院（11/24，照清泉醫院的照片、空拍圖、街景）：
  //  - 主大樓：正方形，面向路口（西南）的角從三樓以上整塊往內縮（L 形），兩面內縮的牆交成一條內凹的直線
  //  - 一到三樓（大廳）：佔滿整個正方形，內縮下面那個角斜切 45 度，就是大門（玻璃門、兩邊玻璃磚牆）
  //  - 「清泉醫院」招牌：45 度斜斜地立在大門外的汽車上下車雨棚上面
  //  - 雨棚：從斜角大門往左沿著西牆一路延伸到急診室門口（招牌寫急診室），往右沿著南牆延伸到建築物邊線
  clinic(dio, p, tap) {
    const CREAM = '#ebe3cf', WIN = '#3e5f8a', SILL = '#cfe0c4', MAROON = '#8a6a5c';
    const FL = 26;
    const towerFace = (w, h, { bay = false } = {}) => {
      const n = Math.floor(h / FL);
      let a = '';
      for (let f = 0; f < n; f++) {
        const y = h - (f + 1) * FL;
        const cols = Math.max(1, Math.floor((w - 10) / 34));
        for (let c = 0; c < cols; c++) {
          const x = 8 + c * ((w - 16) / cols);
          const cw = (w - 16) / cols - 8;
          a += `<rect x="${x}" y="${y + 5}" width="${cw}" height="${FL * 0.5}" fill="${WIN}"/><rect x="${x + cw / 2 - 0.8}" y="${y + 5}" width="1.6" height="${FL * 0.5}" fill="${CREAM}"/><rect x="${x - 2}" y="${y + 5 + FL * 0.5}" width="${cw + 4}" height="${FL * 0.22}" fill="${SILL}"/>`;
        }
      }
      if (bay) a += `<rect x="${w - 30}" y="0" width="22" height="${h}" fill="#a9c9b8"/><rect x="${w - 23}" y="0" width="6" height="${h}" fill="#d8ece0"/>${[...Array(n)].map((_, k) => `<rect x="${w - 30}" y="${k * FL}" width="22" height="2.5" fill="${CREAM}"/>`).join('')}`;
      return face(w, h, a);
    };
    // 大廳的牆：一層一排窗、窗下咖啡色橫帶
    const podFace = (w, h, extra = '') => face(w, h, `${[0, 1, 2].map((r) => `<rect x="0" y="${r * FL + 4}" width="${w}" height="${FL * 0.45}" fill="${WIN}"/>${[...Array(Math.floor(w / 30))].map((_, k) => `<rect x="${k * 30 + 26}" y="${r * FL + 4}" width="3" height="${FL * 0.45}" fill="${CREAM}"/>`).join('')}<rect x="0" y="${r * FL + 4 + FL * 0.45}" width="${w}" height="${FL * 0.3}" fill="${MAROON}"/>`).join('')}${extra}`);

    const X = p.x, Y = p.y;
    const S = 230, N = 110, PH = 3 * FL, TH = PH + 7 * FL, C = 64;   // 正方形邊長、內縮、大廳高、總高、斜角
    const x0 = X - S / 2, y0 = Y - S + 40;
    const yER = y0 + 26;   // 急診室門口（西牆北邊）

    // ---- 大廳（一到三樓）：整個正方形，西南角斜切 ----
    const westArt = `<rect x="8" y="${PH - 30}" width="56" height="30" fill="#6c7a8c"/><rect x="8" y="${PH - 38}" width="56" height="9" fill="#e53935"/>${[0, 1, 2].map((k) => `<rect x="${16 + k * 16}" y="${PH - 36}" width="8" height="5" rx="1" fill="#fff"/>`).join('')}`;
    dio.addBox({ x: x0, y: y0, w: S, d: S - C, h: PH, color: CREAM, tap, faces: { w: podFace(S - C, PH, westArt), n: podFace(S, PH), e: podFace(S - C, PH), s: podFace(S, PH) } });
    dio.addBox({ x: x0 + C, y: y0 + S - C, w: S - C, d: C, h: PH, color: CREAM, tap, faces: { s: podFace(S - C, PH), e: podFace(C, PH) } });
    // 斜角大門：玻璃門、兩邊玻璃磚牆
    const L = C * Math.SQRT2;
    const glassBlock = (x, w) => `<rect x="${x}" y="${PH - 34}" width="${w}" height="34" fill="#e6eef2"/>${[...Array(4)].map((_, k) => `<path d="M${x + (k + 1) * w / 5} ${PH - 34} V${PH}" stroke="#c4d2da" stroke-width="1"/>`).join('')}${[...Array(4)].map((_, k) => `<path d="M${x} ${PH - 34 + (k + 1) * 7} H${x + w}" stroke="#c4d2da" stroke-width="1"/>`).join('')}`;
    dio.addPanel({ x1: x0, y1: y0 + S - C, x2: x0 + C, y2: y0 + S, h: PH, css: CREAM, tap,
      html: face(L, PH, `<rect x="0" y="4" width="${L}" height="${FL * 0.45}" fill="${WIN}"/><rect x="0" y="${4 + FL * 0.45}" width="${L}" height="${FL * 0.3}" fill="${MAROON}"/>${glassBlock(4, 18)}<rect x="24" y="${PH - 36}" width="${L - 48}" height="36" fill="#3a4250"/><rect x="28" y="${PH - 30}" width="${L - 56}" height="30" fill="#5d6b7e"/><rect x="28" y="${PH - 36}" width="${L - 56}" height="4" fill="#ff8a3d"/>${glassBlock(L - 22, 18)}`) });
    // 斜角上方的屋頂（三角形）
    dio.addPolygon({ pts: [[x0, y0 + S - C, PH], [x0 + C, y0 + S - C, PH], [x0 + C, y0 + S, PH]], color: lit(CREAM, 0, 0, 1), tap });

    // ---- 主大樓（四到十樓）：北半邊整排＋東南塊，西南角內縮 ----
    const nd = S - N;
    dio.addBox({ x: x0, y: y0, z: PH, w: S, d: nd, h: TH - PH, color: CREAM, tap,
      faces: { s: towerFace(S, TH - PH), w: towerFace(nd, TH - PH, { bay: true }), n: towerFace(S, TH - PH), e: towerFace(nd, TH - PH) } });
    dio.addBox({ x: x0 + N, y: y0 + nd, z: PH, w: S - N, d: N, h: TH - PH, color: CREAM, tap,
      faces: { s: towerFace(S - N, TH - PH), w: towerFace(N, TH - PH), e: towerFace(N, TH - PH) } });
    // 內角後面的樓梯間／機房
    dio.addBox({ x: x0 + N - 10, y: y0 + nd - 70, z: TH, w: 70, d: 60, h: 52, color: '#e2dac4', tap, faces: { s: towerFace(70, 52), w: towerFace(60, 52) } });
    // 西牆頂端直立招牌、東南塊南牆頂端綠色大看板
    dio.addPanel({ x1: x0 - 1, y1: y0 + 14, x2: x0 - 1, y2: y0 + 54, z: TH - 120, h: 116, css: '#f4efe2', tap,
      html: `<svg viewBox="0 0 40 116" width="100%" height="100%">${['清', '泉', '醫', '院'].map((c, k) => `<text x="20" y="${26 + k * 27}" font-size="24" text-anchor="middle" fill="#2f8f9a" font-weight="700" font-family="sans-serif">${c}</text>`).join('')}</svg>` });
    dio.addPanel({ x1: x0 + N + 4, y1: y0 + S + 1, x2: x0 + S - 4, y2: y0 + S + 1, z: TH - 56, h: 56, css: '#3fae5a', tap,
      html: `<svg viewBox="0 0 112 56" width="100%" height="100%">${[12, 26, 40].map((y, k) => `<rect x="8" y="${y - 4}" width="${62 + k * 6}" height="6" rx="3" fill="#fff" opacity=".9"/>`).join('')}<rect x="86" y="8" width="18" height="40" rx="3" fill="#ff5d73"/></svg>` });

    // ---- 汽車上下車雨棚：西牆（急診室門口）→ 斜角大門 → 南牆（到建築物邊線） ----
    const o = 46, cz = 34, ct = 8;   // 伸出去多遠、高度、厚度
    const A = [x0, yER], P1 = [x0, y0 + S - C], P2 = [x0 + C, y0 + S], B = [x0 + S, y0 + S];
    const A_ = [x0 - o, yER], P1_ = [x0 - o, y0 + S - C + 0.414 * o], P2_ = [x0 + C - 0.414 * o, y0 + S + o], B_ = [x0 + S, y0 + S + o];
    const top = (a, b, c2, d2) => dio.addPolygon({ pts: [[...a, cz + ct], [...b, cz + ct], [...c2, cz + ct], [...d2, cz + ct]], color: '#ffffff', tap });
    top(A, A_, P1_, P1); top(P1, P1_, P2_, P2); top(P2, P2_, B_, B);
    const fascia = (a, b, html = '') => dio.addPanel({ x1: a[0], y1: a[1], x2: b[0], y2: b[1], z: cz, h: ct + 4, css: '#ffffff', html, tap });
    const erLen = P1_[1] - A_[1];
    fascia(A_, P1_, face(erLen, 12, `${['急', '診', '室'].map((c, k) => `<text x="${14 + k * 12}" y="10.5" font-size="10" fill="#e53935" font-weight="700" font-family="sans-serif">${c}</text>`).join('')}<text x="${erLen - 4}" y="10" font-size="8" text-anchor="end" fill="#e53935" font-weight="700" font-family="sans-serif">24</text>`));
    fascia(P1_, P2_);
    fascia(P2_, B_);
    // 雨棚的白色圓柱（斜角大門前兩根、兩側各幾根）
    for (const [cx, cy] of [[P1_[0] + 6, P1_[1] - 4], [P2_[0] + 4, P2_[1] - 6], [A_[0] + 6, A_[1] + 6], [x0 - o + 6, (yER + P1[1]) / 2], [B_[0] - 8, B_[1] - 6], [(P2[0] + B[0]) / 2, B_[1] - 6]]) {
      dio.addBox({ x: cx - 3, y: cy - 3, w: 6, d: 6, h: cz, color: '#f4f6fa', tap });
    }
    // 「清泉醫院」大招牌：45 度斜立在斜角雨棚上面
    const nx = -Math.SQRT1_2, ny = Math.SQRT1_2, off = 30, trim = 0.08;
    const q1 = [P1[0] + nx * off + (P2[0] - P1[0]) * -trim, P1[1] + ny * off + (P2[1] - P1[1]) * -trim];
    const q2 = [P2[0] + nx * off + (P2[0] - P1[0]) * trim, P2[1] + ny * off + (P2[1] - P1[1]) * trim];
    const SL = Math.hypot(q2[0] - q1[0], q2[1] - q1[1]);
    dio.addPanel({ x1: q1[0], y1: q1[1], x2: q2[0], y2: q2[1], z: cz + ct, h: 38, css: '#f4efe2', tap,
      html: `<svg viewBox="0 0 ${SL} 38" width="100%" height="100%" preserveAspectRatio="none"><rect x="2" y="2" width="${SL - 4}" height="34" fill="#f7f3e8" stroke="#d9d0bb" stroke-width="2"/><text x="${SL / 2}" y="28" font-size="22" text-anchor="middle" fill="#2f8f9a" font-weight="700" font-family="sans-serif" letter-spacing="3">清泉醫院</text></svg>` });
    // 招牌背面（從大樓那邊看也是招牌的樣子，不是透明的）
    dio.addPanel({ x1: q2[0] + nx * -2, y1: q2[1] + ny * -2, x2: q1[0] + nx * -2, y2: q1[1] + ny * -2, z: cz + ct, h: 38, css: '#e2dac4', tap });

    // ---- 急診室門口的救護車、門口的樹、東邊停車場、公車站牌 ----
    const ambulance = `<svg viewBox="0 0 110 74"><rect x="4" y="16" width="74" height="42" rx="8" fill="#fff"/><path d="M78 26 H94 L106 42 V58 H78Z" fill="#fff"/><path d="M82 30 H93 L101 42 H82Z" fill="#bfe6ff"/><rect x="4" y="40" width="102" height="6" fill="#d4e157"/><rect x="30" y="22" width="8" height="22" fill="#e53935"/><rect x="23" y="29" width="22" height="8" fill="#e53935"/><rect x="40" y="8" width="16" height="8" rx="3" fill="#ff4a4a"/><circle cx="24" cy="60" r="9" fill="#3a3550"/><circle cx="86" cy="60" r="9" fill="#3a3550"/></svg>`;
    dio.addSprite({ x: x0 - o - 40, y: yER + 40, w: 96, h: 64, shadow: 0.5, tap, html: ambulance });
    const roundTree = `<svg viewBox="0 0 80 110"><rect x="35" y="66" width="10" height="42" rx="4" fill="#7a5a3f"/><circle cx="40" cy="44" r="26" fill="#2f7a4a"/><circle cx="24" cy="56" r="16" fill="#2f7a4a"/><circle cx="56" cy="56" r="16" fill="#2f7a4a"/><circle cx="34" cy="34" r="9" fill="#4fa06a" opacity=".7"/></svg>`;
    dio.addSprite({ x: B_[0] - 40, y: B_[1] + 40, w: 70, h: 94, shadow: 0.5, html: roundTree });
    dio.addSprite({ x: B_[0] + 10, y: B_[1] + 26, w: 64, h: 86, shadow: 0.5, html: roundTree });
    const lx = x0 + S + 24, ly = y0 + 20;
    dio.addDecal({ x: lx, y: ly, w: 170, h: 170, z: 1.1, css: 'background: repeating-linear-gradient(90deg, #fff 0 4px, transparent 4px 56px), #9aa0aa' });
    const car = (c) => `<svg viewBox="0 0 80 50"><rect x="6" y="20" width="68" height="20" rx="8" fill="${c}"/><path d="M18 20 Q24 6 40 6 Q56 6 62 20Z" fill="${c}"/><path d="M24 19 Q28 10 40 10 Q52 10 56 19Z" fill="#bfe6ff"/><circle cx="20" cy="42" r="7" fill="#3a3550"/><circle cx="60" cy="42" r="7" fill="#3a3550"/></svg>`;
    dio.addSprite({ x: lx + 30, y: ly + 70, w: 60, h: 38, shadow: 0.4, html: car('#b8c4d6') });
    dio.addSprite({ x: lx + 142, y: ly + 140, w: 60, h: 38, shadow: 0.4, html: car('#ffd23f') });
    dio.addSprite({ x: B_[0] + 70, y: B_[1] + 50, w: 40, h: 110, shadow: 0.3, html: `<svg viewBox="0 0 40 110"><rect x="18" y="30" width="4" height="80" fill="#8a8fa0"/><rect x="4" y="4" width="32" height="32" rx="6" fill="#2f7fe0"/><rect x="10" y="12" width="20" height="14" rx="3" fill="#fff"/><rect x="12" y="15" width="16" height="6" fill="#2f7fe0"/><circle cx="14" cy="28" r="2.5" fill="#fff"/><circle cx="26" cy="28" r="2.5" fill="#fff"/></svg>` });
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
  // 高架捷運（11/25）：沿著市中心大馬路的南邊、跨過河；捷運站就在下面，月台有藍色屋頂
  {
    const { y: MY, x0, x1, z: MZ } = MRT_LINE;
    for (let x = x0 + 30; x <= x1 - 20; x += 116) dio.addBox({ x: x - 9, y: MY - 9, w: 18, d: 18, h: MZ, color: '#d8dde6' });
    dio.addBox({ x: x0, y: MY - 17, w: x1 - x0, d: 34, h: 12, z: MZ, color: '#e8ecf2', top: '#c9ced8' });
    const mp = PLACES.mrt;
    [[-66, -24], [62, -24], [-66, 20], [62, 20]].forEach(([dx, dy]) => dio.addBox({ x: mp.x + dx, y: MY + dy, w: 6, d: 6, h: 58, z: MZ + 12, color: '#3ea8e0' }));
    dio.addBox({ x: mp.x - 72, y: MY - 30, w: 144, d: 60, h: 6, z: MZ + 70, color: '#3ea8e0', top: '#5fbbe8' });
  }
  // 火車停靠的月台（車站東邊），月台邊一條黃線
  dio.addDecal({ x: TRAIN_LINE.stop - 120, y: TRAIN_LINE.y + 22, w: 240, h: 30, z: 1, css: 'background:linear-gradient(#ffd23f 0 4px,#d8dde6 4px)' });
  // 一般的房子、店、公寓：讓城鎮有「有人住」的感覺（不能點）
  const filler = [
    // 住宅區：一排一排透天
    ...[[180, 1360], [300, 1360], [420, 1360], [180, 760], [300, 820]].map(([x, y], i) => ['tou', x, y, ['#fff3e6', '#e6f4e8', '#e6eeff', '#fff0f0', '#fff8d6'][i % 5]]),
    ...[[820, 900], [940, 900], [300, 1560], [420, 1560]].map(([x, y], i) => ['tou', x, y, ['#e6eeff', '#fff8d6', '#fff3e6', '#e6f4e8'][i % 4]]),
    // 市中心：公寓和店面
    ...[[2200, 760], [2400, 780], [2560, 1180], [1820, 1520], [2080, 250], [1780, 300]].map(([x, y], i) => ['apt', x, y, ['#c9d6ea', '#e6d6c4', '#d6c8ff', '#ffd6a0', '#ffe0a8', '#e6eeff'][i]]),
    ...[[1820, 960], [2240, 1000]].map(([x, y], i) => ['shop', x, y, ['#ff8fbf', '#7ee06a'][i]]),
  ];
  const TOU_ORDER = ['stone', 'euro', 'modern', 'brick', 'euro', 'stone', 'brick', 'modern', 'euro'];
  let touN = 0;
  for (const [k, x, y, c] of filler) {
    if (k === 'tou') {
      touHouse(dio, { x: x - 50, y: y - 50, w: 100, d: 100, floors: 3 + (touN % 2), style: TOU_ORDER[touN++ % TOU_ORDER.length] });
    } else if (k === 'apt') {
      // 一般公寓也改成有陽台的住宅大樓（不再是一個盒子加幾格窗）
      condo(dio, { x: x - 60, y: y - 50, w: 120, d: 100, floors: 9, wall: c });
    } else {
      // 店面：三層樓店面透天，有騎樓、遮陽棚、直立招牌
      shopHouse(dio, { x: x - 45, y: y - 45, w: 90, d: 90, floors: 3, wall: '#fffaf0', sign: c === '#ff8fbf' ? 'breakfast' : 'fruit', roof: '#9aa3b5' });
    }
  }
  // ---- 醫院附近：北邊一排朝南的店面（藥局、醫療用品、便當、理髮…），南邊一排朝北的店面，東北邊社區大樓 ----
  const H = PLACES.clinic;
  const north = [['pharmacy', '#f1e6d2', '#5b8fd8', 4], ['medical', '#e8eef2', '#6fb27a', 3], ['bento', '#f4d9c4', '#9aa3b5', 4], ['salon', '#efe9f6', '#5b8fd8', 3]];
  north.forEach(([sign, wall, roof, floors], k) => shopHouse(dio, { x: H.x - 230 + k * 82, y: H.y - 330, w: 80, d: 90, floors, wall, roof, sign, face: 's' }));
  scooters(dio, H.x - 220, H.y - 222, 12);
  const south = [['breakfast', '#f6efe0', '#6fb27a', 3], ['fruit', '#e9f3e4', '#5b8fd8', 4], ['pharmacy', '#f4e2d6', '#9aa3b5', 4], ['bento', '#eef0f6', '#6fb27a', 3], ['salon', '#f6eadf', '#5b8fd8', 4]];
  south.forEach(([sign, wall, roof, floors], k) => shopHouse(dio, { x: H.x - 200 + k * 82, y: H.y + 190, w: 80, d: 90, floors, wall, roof, sign, face: 'n' }));
  scooters(dio, H.x - 180, H.y + 172, 14);
  condo(dio, { x: H.x + 120, y: H.y - 470, w: 150, d: 120, floors: 12 });
  // 路燈（晚上會亮）：每個路口旁邊一支
  for (const n of Object.values(NODES)) {
    dio.addSprite({ x: n.x + 70, y: n.y - 70, w: 40, h: 120, shadow: 0.3, cls: 'streetlight', html: `<svg viewBox="0 0 40 120"><rect x="17" y="20" width="6" height="98" fill="#4a3b6b"/><circle class="lamp" cx="20" cy="16" r="12" fill="#fff3a0"/></svg>` });
  }
  // 樹：沿著河邊一排、城市外圍幾棵
  const treeSvg = (c) => `<svg viewBox="0 0 80 110"><rect x="34" y="70" width="12" height="38" rx="5" fill="#a9744f"/><circle cx="40" cy="48" r="34" fill="${c}"/></svg>`;
  for (let y = 120; y < D; y += 260) {
    const rx = 1480 + (y / 2200) * 140;
    // 名人堂門口不要種樹（會擋住門和紅地毯）
    if (!(Math.abs(rx - 150 - PLACES.fame.x) < 130 && Math.abs(y - PLACES.fame.y) < 170))
      dio.addSprite({ x: rx - 150, y, w: 80, h: 110, shadow: 0.6, html: treeSvg('#4fbf6e') });
    dio.addSprite({ x: rx + 160, y: y + 120, w: 80, h: 110, shadow: 0.6, html: treeSvg('#5fc76a') });
  }
  for (const [x, y] of [[80, 120], [100, 1900], [900, 2100], [2900, 200], [2880, 2000], [2790, 1600], [2950, 1100], [60, 900], [1300, 120], [700, 1980]]) {
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
  // 路上的車、高架捷運、火車（11/25）：一直有車在跑，點車子閃閃會說是什麼車
  startTraffic(dio, { NODES, neighbors, edgePts, along, MRT_LINE, TRAIN_LINE, PLACES }, { alive: () => app.alive() });
  let lastVeh = 0;

  const onTapTown = async (name) => {
    if (name.startsWith('veh:')) {
      if (going || Date.now() - lastVeh < 1500) return;
      lastVeh = Date.now();
      const kind = name.slice(4);
      sfx(kind === 'mrt' || kind === 'train' ? 'ding' : kind === 'scooter' || kind === 'post' ? 'beepbeep' : 'horn');
      speak('shan', `veh_${kind}`, { node: shan.el });
      return;
    }
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
  root.classList.add('with-placebar');
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
    else if (vehicle === 'bus') await busBoard(root, app, full, () => alive);   // 公車沒有安全帶：排隊、招手、刷卡、坐好
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
      // 坐公車：快到的時候按下車鈴
      if (vehicle === 'bus' && i === segs - 1) {
        stopBtn.style.visibility = 'hidden';
        await busBell(root, app, () => alive);
        chk();
        stopBtn.style.visibility = '';
      }
      const ev = events[i];
      await drive(a, b, ev);
      chk();
    }
    stopBtn.remove();
    if (vehicle === 'bus') { await say('baba', 'bus_off', car.el); chk(); }
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
// ---- 坐公車（11/25）：在站牌排隊 → 看清楚是哪一路再招手 → 上車刷卡 → 坐好、抓好扶手；快到了按下車鈴、等車停好再一個一個下車 ----
// 用 kit.js 的「照步驟」玩法；這裡不是房間，所以自己做一個小小的 R。
function rideR(root, app, alive) {
  const nodeOv = {};
  const id = app.profile.id;
  const R = {
    profile: app.profile, members: app.profile.members,
    say: (ch, line) => (alive() ? speak(ch, line, { name: NAMES[id], who: id, node: nodeOv[ch] || null }) : Promise.resolve()),
    chk: () => { if (!alive()) throw new Error('left'); },
    race: (p) => Promise.race([p, new Promise((_, rej) => { const t = setInterval(() => { if (!alive()) { clearInterval(t); rej(new Error('left')); } }, 400); Promise.resolve(p).finally(() => clearInterval(t)); })]),
    hop(el, cls = 'hop') { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); },
    burstAt(el, opt) { const r = stageRect(el); burst(r.x, r.y, opt); },
    panel(cls = '', { host = null, hostSvg = '' } = {}) {
      const scrim = div('scrim'), pnl = div(`panel ${cls}`);
      root.append(scrim, pnl);
      let face = null;
      if (host) { face = div('panel-host', hostSvg); root.appendChild(face); nodeOv[host] = face; }
      return { el: pnl, close() { scrim.remove(); pnl.remove(); face?.remove(); delete nodeOv[host]; } };
    },
  };
  return R;
}
const BUS_ART = {
  line: `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="46" y="20" width="8" height="78" fill="#8a8fa0"/><rect x="26" y="6" width="48" height="36" rx="8" fill="#2f7fe0"/><rect x="34" y="14" width="32" height="20" rx="4" fill="#fff"/><rect x="38" y="19" width="24" height="10" fill="#ffb627"/>${[0, 1, 2].map((i) => `<ellipse cx="${22 + i * 0}" cy="${62 + i * 13}" rx="7" ry="5" fill="#ff8a3d"/><ellipse cx="${34}" cy="${66 + i * 13}" rx="7" ry="5" fill="#ff8a3d"/>`).join('')}</svg>`,
  wave: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="46" fill="#fff3c4"/><path d="M38 80 V44 Q38 38 44 38 Q50 38 50 44 V34 Q50 28 56 28 Q62 28 62 34 V40 Q62 34 68 34 Q74 34 74 40 V62 Q74 82 56 84 H48 Q38 84 34 74 L24 58 Q22 52 28 50 Q32 49 36 54Z" fill="#ffd9b8" stroke="#e0a07a" stroke-width="3"/><path d="M16 30 Q10 40 16 50 M84 30 Q90 40 84 50" stroke="#ff8a3d" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
  card: `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="30" y="8" width="44" height="84" rx="8" fill="#4a3b6b"/><rect x="36" y="16" width="32" height="22" rx="4" fill="#7fe3a0"/><circle cx="52" cy="62" r="14" fill="#ffd23f" opacity=".8"/><rect x="8" y="46" width="44" height="30" rx="6" fill="#ff8fb8" transform="rotate(-15 30 61)"/><circle cx="20" cy="62" r="5" fill="#fff" transform="rotate(-15 30 61)"/></svg>`,
  seat: `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="20" y="20" width="44" height="50" rx="10" fill="#2f7fe0"/><rect x="16" y="62" width="56" height="16" rx="6" fill="#1f5fb8"/><rect x="24" y="78" width="8" height="18" fill="#8a8fa0"/><rect x="56" y="78" width="8" height="18" fill="#8a8fa0"/><rect x="78" y="6" width="6" height="90" rx="3" fill="#ffd23f"/><path d="M70 20 H92" stroke="#ffd23f" stroke-width="6" stroke-linecap="round"/></svg>`,
};
async function busBoard(root, app, full, alive) {
  const R = rideR(root, app, alive);
  if (!full) {
    // 短版：只要刷卡
    return stepsGame(R, { host: 'baba', hostSvg: babaSvg(), cls: 'buspanel', intro: 'bus_short', wrong: 'bus_wrong', done: 'bus_ready',
      scene: `<div class="bus-side">${VEHICLES.bus}</div>`,
      steps: [{ t: 'card', icon: BUS_ART.card, line: 'bus_card' }],
      targets: [{ id: 'card', x: 600, y: 230, w: 170, h: 170, html: BUS_ART.card }] }).catch(() => {});
  }
  return stepsGame(R, { host: 'baba', hostSvg: babaSvg(), cls: 'buspanel', intro: 'bus_go', wrong: 'bus_wrong', done: 'bus_ready',
    scene: `<div class="bus-side">${VEHICLES.bus}</div>`,
    steps: [
      { t: 'line', icon: BUS_ART.line, line: 'bus_line' },
      { t: 'wave', icon: BUS_ART.wave, line: 'bus_wave' },
      { t: 'card', icon: BUS_ART.card, line: 'bus_card' },
      { t: 'seat', icon: BUS_ART.seat, line: 'bus_seat' },
    ],
    targets: [
      { id: 'card', x: 620, y: 130, w: 150, h: 150, html: BUS_ART.card },
      { id: 'line', x: 60, y: 140, w: 150, h: 150, html: BUS_ART.line },
      { id: 'seat', x: 620, y: 330, w: 150, h: 150, html: BUS_ART.seat },
      { id: 'wave', x: 60, y: 340, w: 150, h: 150, html: BUS_ART.wave },
    ],
    fx: async (i, t) => { sfx(['tap', 'boing', 'ding', 'pop'][i]); await wait(300); },
  }).catch(() => {});
}
// 下車鈴：一顆大大的紅色按鈕，按下去「叮咚」
async function busBell(root, app, alive) {
  const R = rideR(root, app, alive);
  const P = R.panel('bellpanel', { host: 'baba', hostSvg: babaSvg() });
  try {
    const bell = div('bus-bell glowy-2d', `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="46" fill="#ffd23f"/><circle cx="50" cy="50" r="32" fill="#e53935"/><circle cx="42" cy="40" r="9" fill="#fff" opacity=".5"/></svg>`);
    P.el.appendChild(bell);
    setHint(() => bell);
    R.say('baba', 'bus_bell');
    await R.race(new Promise((resolve) => bell.addEventListener('pointerdown', resolve, { once: true })));
    setHint(null);
    bell.classList.remove('glowy-2d');
    bell.classList.add('pressed');
    sfx('doorbell');
    R.burstAt(bell, { n: 14, stars: true, colors: ['#ffd23f', '#fff3a0'] });
    await wait(900);
  } catch (e) { /* 離開了 */ } finally {
    setHint(null);
    P.close();
  }
}

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
