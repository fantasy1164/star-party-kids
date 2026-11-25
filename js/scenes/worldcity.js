// 世界地圖上的城市（11/26）：台北盆地（有 101）和台中（明星小鎮，有台中火車站）。
// 以前只是幾個素色方塊，太幾何；現在每棟樓有自己的樣子：
//   玻璃帷幕辦公大樓（直的窗框、斜的反光、頂樓縮一層＋天線或直升機坪）、
//   住宅大樓（一層一層的窗、陽台欄杆、冷氣、一樓店面的雨遮、頂樓的水塔和樓梯間）、
//   透天厝一排（每間不同顏色、一樓店面、鐵窗）。晚上窗戶會亮。
// 都是不會動的東西：用 WebGL 畫一次，畫面不動就不重畫（省電）。同樣大小、顏色的面共用貼圖。
import { lit } from '../engine/diorama.js';

const F = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none">${inner}</svg>`;
// 固定的亂數（每次進來長一樣）
const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const S = (inner, vb) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const TANK = [
  S('<path d="M10 40 V48 M30 40 V48" stroke="#7d8796" stroke-width="3"/><rect x="4" y="12" width="32" height="30" rx="5" fill="#d5dce5"/><rect x="4" y="22" width="32" height="2.5" fill="#aab3bf"/><rect x="4" y="32" width="32" height="2.5" fill="#aab3bf"/><ellipse cx="20" cy="12" rx="16" ry="5" fill="#f2f5f8"/><rect x="8" y="14" width="5" height="26" rx="2" fill="#fff" opacity=".6"/>', '0 0 40 48'),
  S('<path d="M10 40 V48 M30 40 V48" stroke="#7d8796" stroke-width="3"/><rect x="4" y="12" width="32" height="30" rx="8" fill="#3ea8e0"/><ellipse cx="20" cy="12" rx="16" ry="5" fill="#7fcaf0"/><rect x="9" y="15" width="5" height="24" rx="2" fill="#fff" opacity=".35"/>', '0 0 40 48'),
];

// ---- 牆面 ----
function glassFace(w, h, { night, seed, band = '#ffffff' }) {
  const cols = Math.max(3, Math.round(w / 7)), fl = 9;
  let s = '';
  for (let i = 1; i < cols; i++) s += `<rect x="${(i * w) / cols - 0.6}" y="0" width="1.2" height="${h}" fill="#fff" opacity=".45"/>`;
  for (let y = 10; y < h - 4; y += fl) s += `<rect x="0" y="${y}" width="${w}" height="1" fill="#1d3550" opacity=".16"/>`;
  if (night) {
    for (let y = 10, r = 0; y < h - 8; y += fl, r++) for (let c = 0; c < cols; c++) if (rnd(seed + r * 13 + c) < 0.45) s += `<rect x="${(c * w) / cols + 1}" y="${y + 1.5}" width="${w / cols - 2}" height="${fl - 3}" fill="#ffe28a" opacity=".9"/>`;
  } else {
    s += `<path d="M${w * 0.15} ${h} L${w * 0.75} 0 H${w * 0.95} L${w * 0.35} ${h}Z" fill="#fff" opacity=".22"/>`;
  }
  s += `<rect x="0" y="0" width="${w}" height="3" fill="${band}" opacity=".7"/>`;
  return F(w, h, s);
}
function resiFace(w, h, { night, seed, shop = true, awn = '#ff8a3d' }) {
  const bays = Math.max(2, Math.round(w / 13)), bw = w / bays, fl = 12, base = shop ? 15 : 4;
  let s = '';
  for (let y = 6, r = 0; y < h - base - 8; y += fl, r++) {
    for (let c = 0; c < bays; c++) {
      const x = c * bw + bw * 0.18, ww = bw * 0.64, on = night && rnd(seed + r * 7 + c) < 0.55;
      s += `<rect x="${x}" y="${y}" width="${ww}" height="7" rx="1" fill="${on ? '#ffe28a' : '#e6f4ff'}"/>`;
      s += `<rect x="${x}" y="${y}" width="${ww}" height="7" fill="none" stroke="#6b7a90" stroke-width=".6" opacity=".55"/>`;   // 鐵窗
      if (rnd(seed + r * 5 + c * 3) < 0.3) s += `<rect x="${x + ww - 4}" y="${y + 7.5}" width="5" height="3" rx=".6" fill="#f4f6f8" stroke="#9aa4b2" stroke-width=".5"/>`;   // 冷氣
    }
    s += `<rect x="0" y="${y + 8.6}" width="${w}" height="1.4" fill="#fff" opacity=".75"/>`;   // 陽台欄杆
  }
  if (shop) {
    s += `<rect x="0" y="${h - 15}" width="${w}" height="15" fill="#5b5f73" opacity=".55"/>`;
    for (let c = 0; c < bays; c++) {
      const x = c * bw + 1;
      s += `<path d="M${x} ${h - 15} h${bw - 2} l-1.5 4 h${-(bw - 5)}Z" fill="${c % 2 ? '#fff' : awn}"/>`;
      s += `<rect x="${x + 1.5}" y="${h - 9}" width="${bw - 5}" height="9" fill="${night ? '#ffd76a' : '#cfe9ff'}" opacity=".9"/>`;
    }
  }
  return F(w, h, s);
}
// 一排透天（正面）：每間不同顏色、一樓店面、樓上鐵窗
const ROW_COLORS = ['#ffd6a0', '#f4f1ea', '#bfe0f5', '#ffc2b8', '#d8efc8', '#efe1ff', '#ffe9a8'];
const AWN = ['#ff6a5a', '#3ea8e0', '#46b46a', '#ffb02e', '#8a6ad8'];
function rowFace(n, w, h, { night, seed }) {
  const u = w / n;
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = i * u, c = ROW_COLORS[Math.floor(rnd(seed + i) * ROW_COLORS.length)];
    s += `<rect x="${x}" y="0" width="${u}" height="${h}" fill="${c}"/><rect x="${x}" y="0" width="0.8" height="${h}" fill="#000" opacity=".12"/>`;
    for (let y = 5; y < h - 13; y += 9) s += `<rect x="${x + u * 0.2}" y="${y}" width="${u * 0.6}" height="5.5" fill="${night && rnd(seed + i * 3 + y) < 0.6 ? '#ffe28a' : '#e6f4ff'}" stroke="#6b7a90" stroke-width=".5"/>`;
    s += `<path d="M${x + 0.5} ${h - 11} h${u - 1} l-1 3 h${-(u - 3)}Z" fill="${AWN[Math.floor(rnd(seed + i * 5) * AWN.length)]}"/>`;
    s += `<rect x="${x + u * 0.15}" y="${h - 7.5}" width="${u * 0.7}" height="7.5" fill="${night ? '#ffd76a' : '#5b5f73'}" opacity="${night ? 0.9 : 0.5}"/>`;
    if (rnd(seed + i * 9) < 0.5) s += `<rect x="${x + u - 2.6}" y="${h - 26}" width="2.2" height="10" fill="${AWN[(i + 2) % AWN.length]}"/>`;   // 直立招牌（只有顏色）
  }
  return F(w, h, s);
}
const helipad = (w, d) => F(w, d, `<rect width="${w}" height="${d}" fill="#7d8796"/><circle cx="${w / 2}" cy="${d / 2}" r="${Math.min(w, d) * 0.36}" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M${w / 2 - 3} ${d / 2 - 4} v8 M${w / 2 + 3} ${d / 2 - 4} v8 M${w / 2 - 3} ${d / 2} h6" stroke="#ffd23f" stroke-width="1.6"/>`);

export function buildCities(dio, { gz, avoid, tree, night }) {
  const on = (x, y, w, d) => gz(x + w / 2, y + d / 2) - 1;
  const box = (o) => dio.addBox(o);
  const tank = (x, y, z, i) => dio.addSprite({ x, y, z, w: 9, h: 11, shadow: 0, html: TANK[i % 2] });
  let seed = 1;

  // 玻璃帷幕大樓：一樓大廳 → 大樓 → 頂樓縮一層 → 天線或直升機坪
  function glass(x, y, w, d, h, color, tap) {
    const z = on(x, y, w, d), sd = seed++;
    box({ x: x - 2, y: y - 2, z, w: w + 4, d: d + 4, h: 10, color: '#ece6da', tap, faces: Object.fromEntries(['n', 'e', 's', 'w'].map((k) => [k, F(10, 10, '<rect x="2" y="3" width="6" height="7" fill="#9fc7e6"/>')])) });
    const mh = h - 22, fc = (fw) => glassFace(fw, mh, { night, seed: sd });
    box({ x, y, z: z + 10, w, d, h: mh, color, tap, faces: { n: fc(w), s: fc(w), e: fc(d), w: fc(d) } });
    const cw = w - 6, cd = d - 6, cf = (fw) => glassFace(fw, 12, { night, seed: sd + 5, band: '#ffffff' });
    box({ x: x + 3, y: y + 3, z: z + 10 + mh, w: cw, d: cd, h: 12, color: lit(color, 0, 0, 1), tap, faces: { n: cf(cw), s: cf(cw), e: cf(cd), w: cf(cd), t: sd % 2 ? helipad(cw, cd) : '' } });
    if (!(sd % 2)) box({ x: x + w / 2 - 1, y: y + d / 2 - 1, z: z + h, w: 2, d: 2, h: 20, color: '#8a94a3', tap });
  }
  // 住宅大樓：窗、陽台、冷氣、一樓店面；頂樓樓梯間＋水塔
  function resi(x, y, w, d, h, color, tap, awn) {
    const z = on(x, y, w, d), sd = seed++;
    const fc = (fw, shop) => resiFace(fw, h, { night, seed: sd, shop, awn });
    box({ x, y, z, w, d, h, color, tap, top: '#c9c3b8', faces: { s: fc(w, true), n: fc(w, false), e: fc(d, true), w: fc(d, false) } });
    box({ x: x + w * 0.55, y: y + d * 0.15, z: z + h, w: w * 0.3, d: d * 0.35, h: 8, color, tap });
    tank(x + w * 0.3, y + d * 0.55, z + h, sd);
    if (w > 34) tank(x + w * 0.7, y + d * 0.8, z + h, sd + 1);
  }
  // 一排透天（屋頂上也有水塔）
  function row(x, y, n, h, tap, ew = false) {
    const u = 11, w = ew ? 20 : n * u, d = ew ? n * u : 20, z = on(x, y, w, d), sd = seed++;
    const front = rowFace(n, n * u, h, { night, seed: sd }), side = F(20, h, `<rect width="20" height="${h}" fill="#e8dfd0"/><rect x="6" y="6" width="8" height="5" fill="#e6f4ff" stroke="#6b7a90" stroke-width=".5"/>`);
    box({ x, y, z, w, d, h, color: '#e8dfd0', tap, top: '#d7cfc2', faces: ew ? { e: front, w: front, n: side, s: side } : { s: front, n: front, e: side, w: side } });
    for (let i = 0; i < n; i += 2) tank(ew ? x + 10 : x + u * (i + 0.5), ew ? y + u * (i + 0.5) : y + 10, z + h, sd + i);
  }
  const ok = (x, y, w, d) => !avoid(x + w / 2, y + d / 2, Math.max(w, d) / 2 + 6);   // 不要蓋在國道、鐵路上

  // ======== 台中（明星小鎮） ========
  const TC = 'zone:city';
  const tcBig = [
    // 東邊：七期的玻璃大樓、住宅大樓
    ['g', 650, 880, 34, 34, 175, '#7fb6e0'], ['g', 700, 905, 30, 30, 140, '#8fd0c8'], ['r', 660, 935, 36, 30, 120, '#f2e6d0'],
    ['r', 712, 960, 32, 28, 100, '#e6eef8'], ['g', 655, 990, 30, 30, 150, '#a7b9e8'], ['r', 700, 1010, 34, 30, 90, '#ffe3c4'],
    ['r', 650, 1045, 30, 28, 70, '#f4dede'], ['g', 740, 925, 26, 26, 110, '#9cc9ef'],
    // 西邊（鐵路的另一邊）：老市區，住宅大樓比較矮
    ['r', 500, 900, 32, 28, 95, '#f0e2c8'], ['r', 520, 950, 30, 26, 75, '#e4ecf6'], ['g', 495, 1000, 28, 28, 120, '#8fc0e8'], ['r', 520, 1070, 32, 26, 65, '#f6dcc8'],
  ];
  for (const [t, x, y, w, d, h, c] of tcBig) if (ok(x, y, w, d)) (t === 'g' ? glass : resi)(x, y, w, d, h, c, TC, AWN[seed % AWN.length]);
  [[620, 1060, 4], [665, 1085, 5], [720, 1050, 3], [470, 950, 3], [448, 1062, 4], [735, 870, 3]].forEach(([x, y, n]) => { if (ok(x, y, n * 11, 20)) row(x, y, n, 30, TC); });
  [[545, 880, 4], [745, 1000, 4], [455, 990, 3]].forEach(([x, y, n]) => { if (ok(x, y, 20, n * 11)) row(x, y, n, 28, TC, true); });
  // 台中火車站：紅磚、白色線條、中間的鐘塔
  {
    const x = 496, y = 1030, w = 44, d = 20, z = on(x, y, w, d);
    const brick = F(w, 22, `<rect width="${w}" height="22" fill="#c9553a"/>${[5, 12].map((yy) => `<rect x="0" y="${yy}" width="${w}" height="1.4" fill="#fff" opacity=".85"/>`).join('')}${[4, 12, 28, 36].map((xx) => `<path d="M${xx} 22 v-7 a3 3 0 0 1 6 0 v7Z" fill="#fff3d6"/>`).join('')}<path d="M18 22 v-9 a4 4 0 0 1 8 0 v9Z" fill="#fff3d6"/>`);
    if (ok(x, y, w, d)) {
      box({ x, y, z, w, d, h: 22, color: '#c9553a', tap: TC, faces: { s: brick, n: brick } });
      const tw = 12, clock = F(tw, 20, `<rect width="${tw}" height="20" fill="#c9553a"/><circle cx="6" cy="8" r="4.2" fill="#fff"/><path d="M6 8 V5 M6 8 h2.4" stroke="#3a3550" stroke-width="1"/><rect x="0" y="16" width="${tw}" height="1.4" fill="#fff"/>`);
      box({ x: x + 16, y: y + 4, z: z + 22, w: tw, d: tw, h: 20, color: '#c9553a', tap: TC, faces: { s: clock, n: clock, e: clock, w: clock } });
      dio.addGable({ x: x + 15, y: y + 3, z: z + 42, w: tw + 2, d: tw + 2, h: 10, color: '#4f8a6a', ridge: 'x', over: 1, tap: TC });
    }
  }
  [[600, 1095], [640, 1110], [560, 1110], [760, 1080], [460, 1100], [700, 860]].forEach(([x, y], i) => dio.addSprite({ x, y, z: gz(x, y) - 1, w: 22, h: 30, shadow: 0, html: tree(i % 2 ? '#4fbf6e' : '#3f9f5a') }));

  // ======== 台北盆地（101） ========
  const TP = 'zone:mountain';
  const tpBig = [
    ['g', 868, 212, 28, 28, 120, '#8fc0e8'], ['r', 842, 255, 30, 26, 85, '#f0e2c8'], ['g', 952, 222, 26, 26, 135, '#7fb6e0'],
    ['r', 858, 300, 28, 26, 60, '#ffe3c4'], ['g', 1000, 245, 26, 26, 125, '#a7b9e8'], ['r', 972, 282, 30, 26, 80, '#e4ecf6'],
    ['r', 1012, 300, 28, 24, 60, '#f4dede'], ['r', 905, 205, 26, 22, 55, '#e6eef8'],
  ];
  for (const [t, x, y, w, d, h, c] of tpBig) if (ok(x, y, w, d)) (t === 'g' ? glass : resi)(x, y, w, d, h, c, TP, AWN[seed % AWN.length]);
  [[880, 335, 4], [990, 195, 4], [1040, 270, 3]].forEach(([x, y, n]) => { if (ok(x, y, n * 11, 20)) row(x, y, n, 28, TP); });
  taipei101(dio, 915, 262, on(903, 250, 24, 24), TP);
  [[950, 215], [1000, 225], [860, 225], [1050, 320]].forEach(([x, y], i) => dio.addSprite({ x, y, z: gz(x, y) - 1, w: 22, h: 30, shadow: 0, html: tree(i % 2 ? '#4fbf6e' : '#3f9f5a') }));
}

// ---- 台北 101 ----
// 基座（往上收）→ 八節（每節往外開，像竹節、像一層層的寶塔）→ 頂上兩層小方塊 → 尖塔。
// 每節上面有一圈亮的邊；顏色是 101 的藍綠玻璃。
function frustum(dio, cx, cy, z, h, b0, b1, color, tap) {
  const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const P = (b, zz) => c.map(([sx, sy]) => [cx + (sx * b) / 2, cy + (sy * b) / 2, zz]);
  const lo = P(b0, z), hi = P(b1, z + h);
  const slope = (b1 - b0) / 2;   // 往外開是正的
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    const mx = (c[i][0] + c[j][0]) / 2, my = (c[i][1] + c[j][1]) / 2;   // 這一面朝外的方向
    const L = Math.hypot(h, slope), nz = -slope / L, nh = h / L;
    dio.addPolygon({ pts: [lo[i], lo[j], hi[j], hi[i]], color: lit(color, mx * nh, my * nh, nz), tap });
  }
  dio.addPolygon({ pts: hi, color: lit(color, 0, 0, 1), tap });
}
function taipei101(dio, cx, cy, z, tap) {
  const glass = '#5fae9e', rim = '#d9fff4', B = (b, zz, h, col) => dio.addBox({ x: cx - b / 2, y: cy - b / 2, z: zz, w: b, d: b, h, color: col, tap });
  // 裙樓（101 購物中心）
  dio.addBox({ x: cx - 30, y: cy - 4, z, w: 60, d: 26, h: 16, color: '#cfe3dc', tap, faces: { s: F(60, 16, '<rect width="60" height="16" fill="#cfe3dc"/><rect x="0" y="4" width="60" height="7" fill="#7fb8a8" opacity=".7"/>') } });
  let zz = z;
  frustum(dio, cx, cy, zz, 50, 30, 22, glass, tap); zz += 50;   // 基座往上收
  for (let i = 0; i < 8; i++) {
    frustum(dio, cx, cy, zz, 20, 21, 27, i % 2 ? glass : '#68b8a8', tap);
    B(28, zz + 20, 1.6, rim);   // 每節上面亮的邊
    zz += 21.6;
  }
  B(18, zz, 10, glass); zz += 10;
  B(12, zz, 9, '#7cc4b4'); zz += 9;
  B(3, zz, 46, '#c9d3dc');   // 尖塔
}
