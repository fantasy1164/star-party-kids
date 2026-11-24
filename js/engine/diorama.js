// 等角立體模型屋引擎（2.5D）。
// 用 CSS 3D 把場景組成一個真的立體模型：地板底座、牆、方塊家具；角色和玩具是一直面向鏡頭的「看板」（SVG）。
// 手指左右滑可以轉房間（停在四個斜角），前面擋住視線的牆會自動消失（背面不畫），只留下一圈矮矮的牆根。
//
// 座標：世界地板是 x（往東）× y（往南），z 往上。鏡頭預設在東南方往西北看（angle 45°）。
// 方塊家具的每一面依「固定在房間裡的光」上色（光從北邊窗戶、斜上方來），轉房間時亮暗面跟著轉，看起來是真的立體。
import { div, stageW, stageScale, onFit, toStage } from '../core/dom.js';
import { createGLScene } from './glscene.js';

const LIGHT = (() => { const v = [-0.45, -0.62, 0.64]; const l = Math.hypot(...v); return v.map((x) => x / l); })();

export function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(k >= 1 ? c + (255 - c) * (k - 1) : c * k)));
  return `#${[f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
function lit(hex, nx, ny, nz) {
  const d = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
  return shade(hex, d >= 0 ? 1 + d * 0.18 : 1 + d * 0.22);
}

// 立起來的面：沿著地板上的線段 p1→p2，高 h。面朝向 (−sinθ, cosθ)。
function vpanel(x1, y1, x2, y2, h, cls = '') {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const th = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const el = div(`dio-face ${cls}`);
  el.style.cssText = `left:${x1}px;top:${y1 - h}px;width:${L}px;height:${h}px;transform:rotateZ(${th}deg) rotateX(-90deg)`;
  const r = (th * Math.PI) / 180;
  return { el, n: [-Math.sin(r), Math.cos(r), 0] };
}


// 大平面要縮小幾倍來畫：w×h×(像素密度²) 超過 budget 時才縮
export function lowRes(w, h, budget) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const px = w * h * dpr * dpr;
  return px > budget ? Math.sqrt(px / budget) : 1;
}

// ---- 4×4 矩陣（column-major，跟 WebGL 一樣）----
const I4 = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function mul(a, b) {
  const r = new Array(16);
  for (let c = 0; c < 4; c++) for (let rr = 0; rr < 4; rr++) {
    r[c * 4 + rr] = a[rr] * b[c * 4] + a[4 + rr] * b[c * 4 + 1] + a[8 + rr] * b[c * 4 + 2] + a[12 + rr] * b[c * 4 + 3];
  }
  return r;
}
const T4 = (x, y, z) => { const m = I4(); m[12] = x; m[13] = y; m[14] = z; return m; };
const S4 = (x, y, z) => { const m = I4(); m[0] = x; m[5] = y; m[10] = z; return m; };
// CSS rotateX／rotateZ（y 往下、z 朝向觀眾）
const RX = (deg) => { const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); const m = I4(); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; };
const RZ = (deg) => { const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); const m = I4(); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; };
function inv4(m) {
  const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = m;
  const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
  const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  const d = 1 / det;
  return [
    (a11 * b11 - a12 * b10 + a13 * b09) * d, (a02 * b10 - a01 * b11 - a03 * b09) * d, (a31 * b05 - a32 * b04 + a33 * b03) * d, (a22 * b04 - a21 * b05 - a23 * b03) * d,
    (a12 * b08 - a10 * b11 - a13 * b07) * d, (a00 * b11 - a02 * b08 + a03 * b07) * d, (a32 * b02 - a30 * b05 - a33 * b01) * d, (a20 * b05 - a22 * b02 + a23 * b01) * d,
    (a10 * b10 - a11 * b08 + a13 * b06) * d, (a01 * b08 - a00 * b10 - a03 * b06) * d, (a30 * b04 - a31 * b02 + a33 * b00) * d, (a21 * b02 - a20 * b04 - a23 * b00) * d,
    (a11 * b07 - a10 * b09 - a12 * b06) * d, (a00 * b09 - a01 * b07 + a02 * b06) * d, (a31 * b01 - a30 * b03 - a32 * b00) * d, (a20 * b03 - a21 * b01 + a22 * b00) * d,
  ];
}
const xf = (m, p, w = 1) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12] * w, m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13] * w, m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14] * w];
const PERSP = 2600, PO_Y = 0.3;   // 跟 CSS 的 .dio-view { perspective: 2600px; perspective-origin: 50% 30% } 一樣

export function createDiorama(opt = {}) {
  const o = {
    w: 640, d: 640, wallH: 300, tilt: 56, angle: 45, zoom: 1, cy: 0.56,
    floor: '#e9c99f', floorCss: null, wall: '#f7ead6', base: '#c98b5e', rim: 26, walls: true, rotatable: true,
    // open：戶外場景不畫「板子」的邊，地面一路延伸、淡進遠方（11/24：世界不要像一塊桌遊板）
    open: null, skirt: '#a6d987', horizon: null,
    ...opt,
  };
  if (o.open === null) o.open = !o.walls;
  o.zmin = o.zmin ?? o.zoom * 0.55;
  o.zmax = o.zmax ?? o.zoom * 1.9;
  // 結構：.dio（外框）> .dio-view（透視）> .dio-cam > .dio-world，調暗層與燈光層放在 .dio-view 外面。
  // 調暗層如果跟立體場景放在同一個透視容器裡，iPad 的 Chrome 會把它當成 z=0 的平面跟地板交錯，
  // 地板會變成一半暗一半亮（11/23 夜晚開場發現）。
  const el = div('dio');
  const viewEl = div('dio-view');
  const cam = div('dio-cam');
  const world = div('dio-world');
  world.style.width = `${o.w}px`;
  world.style.height = `${o.d}px`;
  cam.appendChild(world);
  viewEl.appendChild(cam);
  // 大場景：不會動的東西畫在 WebGL 畫布上（在 CSS 立體層的下面）；會動的角色、標記仍用 CSS 疊在上面
  let glS = null, glCanvas = null, sealed = false;
  if (o.gl) {
    glCanvas = document.createElement('canvas');
    glCanvas.className = 'dio-gl';
    try { glS = createGLScene(glCanvas); } catch { glS = null; }
    if (glS) el.appendChild(glCanvas);
  }
  const useGL = () => glS && !sealed;
  el.appendChild(viewEl);
  const tint = div('dio-tint');
  el.appendChild(tint);
  const glow = div('dio-glow');
  el.appendChild(glow);

  const view = { a: o.angle, z: o.zoom, px: o.w / 2, py: o.d / 2, t: o.tilt };
  const rotHooks = [];
  let raf = 0;

  // 轉動的效能（11/24 iPhone 轉地圖很鈍）：
  // 1. 鏡頭本身每一格都更新（只動一個元素，很便宜）。
  // 2. 看板角色面向鏡頭的角度（--ang）會讓幾百個看板全部重算，所以拖曳中每轉 10 度才更新一次（差 10 度肉眼看不出來），停下來再對準。
  // 3. 手指移動事件（iPhone 一秒 120 次）先記下來，每個畫面格只套用一次。
  const ANG_STEP = 10;
  let shownAng = null, shownLean = null, camPos = '', pending = 0;
  function apply(exact = true) {
    const pos = `${stageW() / 2}|${o.cy}`;
    if (pos !== camPos) {
      camPos = pos;
      cam.style.left = `${stageW() / 2}px`;
      cam.style.top = `${900 * o.cy}px`;
    }
    cam.style.transform = `scale(${view.z}) rotateX(${view.t}deg) rotateZ(${view.a}deg) translate3d(${-view.px}px,${-view.py}px,0)`;
    if (shownAng === null || (exact ? shownAng !== view.a : Math.abs(view.a - shownAng) >= ANG_STEP)) {
      shownAng = view.a;
      world.style.setProperty('--ang', `${view.a}deg`);
    }
    // 鏡頭往下看得更多時（學堂的「從高處看」），看板角色往後仰一點，才不會被壓扁
    const lean = Math.round((o.tilt - view.t) * 2) / 2;
    if (lean !== shownLean) { shownLean = lean; world.style.setProperty('--lean', `${lean}deg`); }
    rotHooks.forEach((f) => f(view.a));
    if (glS) renderGL();
  }
  // ---- 跟 CSS 一模一樣的鏡頭矩陣（世界 → 畫面），給 WebGL 和點擊用 ----
  function viewSize() { return [el.offsetWidth || stageW(), el.offsetHeight || 900]; }
  function camMatrix() {
    return [T4(stageW() / 2, 900 * o.cy, 0), S4(view.z, view.z, 1), RX(view.t), RZ(view.a), T4(-view.px, -view.py, 0)].reduce(mul);
  }
  function projMatrix(W, H) {
    const P = PERSP, ox = W / 2, oy = H * PO_Y, n = 60, f = P + 60000;
    const A = -(n + f) / (f - n), B = -n - A * (P - n);
    const m = new Array(16).fill(0);
    m[0] = (2 * P) / W; m[8] = 1 - (2 * ox) / W; m[12] = -P;
    m[5] = (-2 * P) / H; m[9] = (2 * oy) / H - 1; m[13] = P;
    m[10] = A; m[14] = B;
    m[11] = -1; m[15] = P;
    return m;
  }
  let glSize = '';
  function renderGL() {
    const [W, H] = viewSize();
    const ratio = stageScale() * Math.min(2, window.devicePixelRatio || 1);
    const key = `${W}|${H}|${ratio}`;
    if (key !== glSize) { glSize = key; glS.resize(W, H, ratio); }
    glS.render(mul(projMatrix(W, H), camMatrix()), view.a, o.tilt - view.t);
  }
  let glRaf = 0;
  const renderSoon = () => { if (!glS || glRaf) return; glRaf = requestAnimationFrame(() => { glRaf = 0; renderGL(); }); };
  if (glS) glS.onReady = renderSoon;
  // 螢幕上的點 → 世界裡的一條射線（起點、方向）
  function rayAt(clientX, clientY) {
    const [W, H] = viewSize();
    const p = toStage(clientX, clientY);
    const inv = inv4(camMatrix());
    const ox = W / 2, oy = H * PO_Y;
    return { o: xf(inv, [ox, oy, PERSP]), d: xf(inv, [p.x - ox, p.y - oy, -PERSP], 0) };
  }
  // 點到地面（z = 0）的哪裡
  function groundAt(clientX, clientY) {
    const { o: ro, d } = rayAt(clientX, clientY);
    if (Math.abs(d[2]) < 1e-9) return null;
    const t = -ro[2] / d[2];
    return t > 0 ? { x: ro[0] + d[0] * t, y: ro[1] + d[1] * t } : null;
  }
  // 拖曳、捏合時用：同一格畫面裡多次移動只套用一次
  function applySoon() {
    if (pending) return;
    pending = requestAnimationFrame(() => { pending = 0; apply(false); });
  }
  const offFit = onFit(() => { camPos = ''; apply(); });

  function animateTo(target, ms = 700) {
    cancelAnimationFrame(raf);
    return new Promise((res) => {
      const from = { ...view };
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / ms);
        const e = 1 - Math.pow(1 - k, 3);
        for (const key of Object.keys(target)) view[key] = from[key] + (target[key] - from[key]) * e;
        apply(k >= 1);
        if (k < 1) raf = requestAnimationFrame(step);
        else res();
      };
      raf = requestAnimationFrame(step);
    });
  }
  // 最近的斜角（45 + 90k）
  const snap = (a) => 45 + Math.round((a - 45) / 90) * 90;
  // 現在鏡頭在哪一邊：0 東南（預設）、1 東北、2 西北、3 西南
  const quadrant = () => (((Math.round((view.a - 45) / 90)) % 4) + 4) % 4;
  async function rotateBy(deg) {
    if (locked) return;
    await animateTo({ a: view.a + deg }, 650);   // 從現在的角度轉，不再對齊固定的斜角
  }
  async function faceQuadrant(q, ms = 600) {
    const cur = snap(view.a);
    let diff = ((q - quadrant()) % 4 + 4) % 4;
    if (diff === 3) diff = -1;
    if (diff === 2 && Math.random() < 0.5) diff = -2;
    if (diff === 0 && cur === view.a) return;
    await animateTo({ a: cur + diff * 90 }, ms);
  }

  // ---- 遠景：場景外圍一圈山丘、樹、樓房（看板，轉到哪都面向鏡頭），讓世界看起來沒有盡頭 ----
  const HZ = {
    hill: (c) => `<svg viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M0 100 Q50 10 100 30 Q150 0 200 100Z" fill="${c}"/></svg>`,
    peak: (c) => `<svg viewBox="0 0 200 160" preserveAspectRatio="none"><path d="M0 160 L70 30 L100 60 L140 0 L200 160Z" fill="${c}"/><path d="M128 22 L140 0 L152 24 L140 30Z" fill="#fff" opacity=".8"/></svg>`,
    tree: (c) => `<svg viewBox="0 0 80 110"><rect x="34" y="70" width="12" height="38" rx="5" fill="#8a6a4a"/><circle cx="40" cy="48" r="34" fill="${c}"/></svg>`,
    bldg: (c) => `<svg viewBox="0 0 60 140" preserveAspectRatio="none"><rect width="60" height="140" rx="4" fill="${c}"/>${[16, 40, 64, 88, 112].map((y) => `<rect x="10" y="${y}" width="14" height="12" fill="#fff" opacity=".5"/><rect x="36" y="${y}" width="14" height="12" fill="#fff" opacity=".5"/>`).join('')}</svg>`,
    wave: () => `<svg viewBox="0 0 200 40" preserveAspectRatio="none"><path d="M0 40 Q25 10 50 30 T100 30 T150 30 T200 30 V40Z" fill="#9fdcff" opacity=".7"/></svg>`,
  };
  function addHorizon(kind) {
    const cx = o.w / 2, cy = o.d / 2;
    const r0 = Math.max(o.w, o.d) * 0.62;
    const sets = {
      town: [['hill', '#9fcf8a', 520, 160], ['bldg', '#c9d6ea', 70, 210], ['tree', '#5fb86a', 110, 150], ['bldg', '#e6d6c4', 80, 170]],
      nature: [['hill', '#8fc77a', 600, 200], ['tree', '#4fa85a', 120, 170], ['hill', '#a6d987', 480, 140], ['tree', '#6cc072', 110, 150]],
      mountain: [['peak', '#6aa86a', 640, 420], ['peak', '#7fb87a', 520, 320], ['tree', '#3f9f5a', 120, 170]],
      sea: [['wave', '', 600, 60], ['hill', '#a6d987', 520, 150], ['wave', '', 480, 50]],
    }[kind] || [];
    const n = 22;
    for (let i = 0; i < n; i++) {
      const [k, c, w, h] = sets[i % sets.length];
      const ang = (i / n) * Math.PI * 2 + (i % 3) * 0.07;
      const rr = r0 + (i % 4) * 90 + (k === 'hill' || k === 'peak' ? 260 : 60);
      addSprite({ x: cx + Math.cos(ang) * rr, y: cy + Math.sin(ang) * rr, w, h, shadow: 0, cls: 'horizon', html: HZ[k](c), budget: 1.5e5 });
    }
  }

  // ---- 拉遠拉近：按鈕（zoomBy）、兩指捏合縮放＋兩指拖曳移動 ----
  const clampZ = (z) => Math.max(o.zmin, Math.min(o.zmax, z));
  const clampP = () => { view.px = Math.max(-o.w * 0.1, Math.min(o.w * 1.1, view.px)); view.py = Math.max(-o.d * 0.1, Math.min(o.d * 1.1, view.py)); };
  function zoomBy(f, ms = 350) { return animateTo({ z: clampZ(view.z * f) }, ms); }
  const pts = new Map();
  let pinch = null;
  const pinchState = () => {
    const [a, b] = [...pts.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  };
  el.addEventListener('pointerdown', (e) => {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2 && !locked) {
      drag = null;   // 兩隻手指：不轉，改成縮放與移動
      const st = pinchState();
      pinch = { ...st, z: view.z, px: view.px, py: view.py };
      lastDrag = Date.now();
    }
  }, true);
  window.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!pinch || pts.size < 2) return;
    const st = pinchState();
    view.z = clampZ(pinch.z * (st.d / Math.max(20, pinch.d)));
    const k = stageScale() * view.z;
    const sx = (st.mx - pinch.mx) / k, sy = (st.my - pinch.my) / k / Math.max(0.35, Math.cos((view.t * Math.PI) / 180));
    const a = (-view.a * Math.PI) / 180;
    view.px = pinch.px - (sx * Math.cos(a) - sy * Math.sin(a));
    view.py = pinch.py - (sx * Math.sin(a) + sy * Math.cos(a));
    clampP();
    lastDrag = Date.now();
    applySoon();
  });
  const endPt = (e) => { pts.delete(e.pointerId); if (pts.size < 2 && pinch) { pinch = null; lastDrag = Date.now(); apply(); } };
  window.addEventListener('pointerup', endPt);
  window.addEventListener('pointercancel', endPt);

  // ---- 手指轉房間 ----
  let locked = !o.rotatable;
  let drag = null;
  const isUi = (t) => t.closest('.grab, .ui, button');
  let lastDrag = 0;
  // 拖到哪就轉到哪（11/24：不再自動對齊斜角）；上下拖可以稍微抬頭、低頭；放手時順著手勢再滑一小段
  const TILT_MIN = o.tilt - 14, TILT_MAX = o.tilt + 10;
  el.addEventListener('pointerdown', (e) => {
    if (locked || isUi(e.target) || pts.size >= 2) return;
    drag = { x: e.clientX, y: e.clientY, a: view.a, t: view.t, moved: false, vx: 0, lx: e.clientX, lt: performance.now() };
    cancelAnimationFrame(raf);
  });
  const onMove = (e) => {
    if (!drag) return;
    const dx = (e.clientX - drag.x) / stageScale();
    const dy = (e.clientY - drag.y) / stageScale();
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) drag.moved = true;
    view.a = drag.a - dx * 0.38;
    if (o.tiltable !== false) view.t = Math.max(Math.min(TILT_MIN, drag.t), Math.min(Math.max(TILT_MAX, drag.t), drag.t + dy * 0.12));
    const now = performance.now();
    const dt = Math.max(1, now - drag.lt);
    drag.vx = 0.7 * drag.vx + 0.3 * (((e.clientX - drag.lx) / stageScale()) / dt);
    drag.lx = e.clientX; drag.lt = now;
    applySoon();
  };
  const onUp = () => {
    if (!drag) return;
    const { moved, vx } = drag;
    drag = null;
    if (moved) {
      lastDrag = Date.now();
      const glide = Math.max(-40, Math.min(40, -vx * 0.38 * 160));
      if (Math.abs(glide) > 1) animateTo({ a: view.a + glide }, 520);
      else apply();   // 沒有順勢滑：看板馬上對準鏡頭
    }
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  // ---- WebGL 版的建造（只在 o.gl 而且還沒 seal() 的時候用）----
  // 點擊用的替身元素：呼叫的人照樣可以設定 dataset.tap，點到時讀它
  const proxy = (tap) => { const p = document.createElement('div'); if (tap) p.dataset.tap = tap; return p; };
  const isPlain = (bg) => !bg || /^#[0-9a-f]{3,8}$/i.test(bg.trim());
  const opaque = (bg) => bg && !/transparent|rgba\(/i.test(bg);
  // 直立的面：p1→p2 是底邊，off 是從底邊到頂邊的位移（直立：[0,0,h]；屋頂斜面：往屋脊那邊）
  function glPanel(p1, p2, off, { bg = '', html = '', pick, w, h }) {
    const BL = p1, BR = p2, TL = [p1[0] + off[0], p1[1] + off[1], p1[2] + off[2]], TR = [p2[0] + off[0], p2[1] + off[1], p2[2] + off[2]];
    const pts = [BL, TL, TR, BR], uv = [[0, 1], [0, 0], [1, 0], [1, 1]];
    if (!html && isPlain(bg)) return glS.addPoly({ pts, color: bg || '#ffffff', pick });
    if (!html && !opaque(bg)) return null;
    const k = Math.min(2, 512 / Math.max(w, h));
    const tex = glS.texture({ bg, svg: html, w, h, k });
    return glS.addPoly({ pts, uv, tex, pass: opaque(bg) ? 'solid' : 'alpha', pick });
  }
  function glBox({ x, y, z, w, d, h, color, top, faces, tap }) {
    const pick = proxy(tap);
    const Z = z + h;
    const tbg = top || lit(color, 0, 0, 1);
    const tpts = [[x, y, Z], [x + w, y, Z], [x + w, y + d, Z], [x, y + d, Z]];
    if (!faces.t && isPlain(tbg)) glS.addPoly({ pts: tpts, color: tbg, pick });
    else glS.addPoly({ pts: tpts, uv: [[0, 0], [1, 0], [1, 1], [0, 1]], tex: glS.texture({ bg: tbg, svg: faces.t || '', w, h: d, k: Math.min(2, 512 / Math.max(w, d)) }), pick });
    const side = (k, x1, y1, x2, y2) => {
      const n = [-(y2 - y1), x2 - x1, 0]; const L = Math.hypot(n[0], n[1]) || 1;
      glPanel([x + x1, y + y1, z], [x + x2, y + y2, z], [0, 0, h], { bg: lit(color, n[0] / L, n[1] / L, 0), html: faces[k] || '', pick, w: L, h });
    };
    side('n', w, 0, 0, 0); side('e', w, d, w, 0); side('s', 0, d, w, d); side('w', 0, 0, 0, d);
    const fx = proxy();
    return { el: pick, faces: { t: fx, n: fx, e: fx, s: fx, w: fx } };
  }
  function glGable({ x, y, z, w, d, h, color, wallColor, ridge, over, tap, faces }) {
    const pick = proxy(tap);
    const X = x - over, Y = y - over, W = w + over * 2, D = d + over * 2;
    const half = ridge === 'x' ? D / 2 : W / 2;
    const phi = Math.atan2(h, half), sn = Math.sin(phi), cs = Math.cos(phi);
    const L = Math.hypot(half, h);
    const slope = (x1, y1, x2, y2, n, k) => {
      const th = Math.atan2(y2 - y1, x2 - x1);
      const off = [half * Math.sin(th), -half * Math.cos(th), h];
      glPanel([x1, y1, z], [x2, y2, z], off, { bg: lit(color, ...n), html: faces[k] || '', pick, w: Math.hypot(x2 - x1, y2 - y1), h: L });
    };
    const end = (x1, y1, x2, y2) => {
      const n = [-(y2 - y1), x2 - x1, 0]; const l = Math.hypot(n[0], n[1]) || 1;
      glS.addPoly({ pts: [[x1, y1, z], [(x1 + x2) / 2, (y1 + y2) / 2, z + h], [x2, y2, z]], color: lit(wallColor || color, n[0] / l, n[1] / l, 0), pick });
    };
    if (ridge === 'x') {
      slope(X, Y + D, X + W, Y + D, [0, sn, cs], 's');
      slope(X + W, Y, X, Y, [0, -sn, cs], 'n');
      end(x + w, y + d, x + w, y); end(x, y, x, y + d);
    } else {
      slope(X + W, Y + D, X + W, Y, [sn, 0, cs], 'e');
      slope(X, Y, X, Y + D, [-sn, 0, cs], 'w');
      end(x, y + d, x + w, y + d); end(x + w, y, x, y);
    }
    return { el: pick };
  }
  // 平面（地面上的、或高處的地板）：低於 3 的當「地面」，照高度順序疊、永遠在東西下面
  function glDecal({ x, y, w, h, z, html, css, cls }) {
    const pick = proxy();
    const svg = /^\s*<svg/i.test(html) ? html : '';
    const big = Math.max(w, h);
    // 只有漸層的大平面畫粗一點也看不出來；有圖（馬路、地圖）的要清楚
    const k = svg ? Math.min(big > 1500 && stageScale() < 0.6 ? 0.9 : 1.3, 4096 / big) : Math.min(1, 1024 / big);
    const ground = z < 3;
    const tex = glS.texture({ bg: css, svg, w, h, k, fade: /dio-floor open/.test(cls), ground });
    const pts = [[x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z]];
    glS.addPoly({ pts, uv: [[0, 0], [1, 0], [1, 1], [0, 1]], tex, pass: ground ? 'ground' : (opaque(css) && !/border-radius/.test(css) ? 'solid' : 'alpha'), order: z, pick, oneSided: false });
    return pick;
  }
  const SHADOW_CSS = 'background:radial-gradient(ellipse, rgba(60,30,10,.32), rgba(60,30,10,0) 70%)';
  function glSprite({ x, y, z, w, h, html, shadow, tap }) {
    const pick = proxy(tap);
    const pad = 0.12;
    const tex = glS.texture({ svg: html, w: w * (1 + pad * 2), h: h * (1 + pad * 2), k: Math.min(2, 512 / Math.max(w, h)), pad });
    const b = glS.addBillboard({ x, y, z, w: w * (1 + pad * 2), h: h * (1 + pad * 2), below: h * pad, tex, pick });
    let shm = null;
    const putShadow = () => {
      if (!shadow) return;
      const sw = w * shadow;
      shm = glS.addPoly({ pts: [[b.x - sw / 2, b.y - sw * 0.22, b.z + 1], [b.x + sw / 2, b.y - sw * 0.22, b.z + 1], [b.x + sw / 2, b.y + sw * 0.22, b.z + 1], [b.x - sw / 2, b.y + sw * 0.22, b.z + 1]],
        uv: [[0, 0], [1, 0], [1, 1], [0, 1]], tex: glS.texture({ bg: SHADOW_CSS, w: 64, h: 28, k: 1 }), pass: b.z + 1 < 3 ? 'ground' : 'alpha', order: b.z + 1, oneSided: false });
    };
    putShadow();
    const sp = {
      el: pick, sh: null, x, y, z, w, h,
      move(nx, ny, nz = sp.z) {
        sp.x = b.x = nx; sp.y = b.y = ny; sp.z = b.z = nz;
        if (shm) { shm.hidden = true; glS.markDirty(); putShadow(); }
        renderSoon();
      },
      remove() { b.hidden = true; if (shm) shm.hidden = true; glS.markDirty(); renderSoon(); },
    };
    return sp;
  }
  // 建好不會動的部分以後呼叫：之後新加的東西（角色、車、箭頭）都用 CSS，才能動、能換表情
  function seal() { sealed = true; renderSoon(); }

  // ---- 建造 ----
  function addBox({ x, y, z = 0, w, d, h, color = '#f2d0a4', top = null, faces = {}, cls = '', tap = null, parent = world }) {
    if (useGL() && parent === world) return glBox({ x, y, z, w, d, h, color, top, faces, tap });
    const g = div(`dio-box ${cls}`);
    g.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${d}px;transform:translateZ(${z}px)`;
    if (tap) g.dataset.tap = tap;
    const t = div('dio-face top');
    t.style.cssText = `left:0;top:0;width:${w}px;height:${d}px;transform:translateZ(${h}px);background:${top || lit(color, 0, 0, 1)}`;
    if (faces.t) t.innerHTML = faces.t;
    g.appendChild(t);
    const sides = {
      n: vpanel(w, 0, 0, 0, h, 'side n'),
      e: vpanel(w, d, w, 0, h, 'side e'),
      s: vpanel(0, d, w, d, h, 'side s'),
      w: vpanel(0, 0, 0, d, h, 'side w'),
    };
    for (const [k, p] of Object.entries(sides)) {
      p.el.style.background = lit(color, ...p.n);
      if (faces[k]) p.el.innerHTML = faces[k];
      g.appendChild(p.el);
    }
    parent.appendChild(g);
    return { el: g, faces: { t, ...Object.fromEntries(Object.entries(sides).map(([k, p]) => [k, p.el])) } };
  }

  // 人字形屋頂（放在方塊上面）：ridge 'x' 屋脊東西向（斜面朝南北、三角形山牆在東西），'y' 屋脊南北向
  function addGable({ x, y, z = 0, w, d, h, color = '#ff7a5a', wallColor = null, ridge = 'x', over = 0, tap = null, cls = '', faces = {} }) {
    if (useGL()) return glGable({ x, y, z, w, d, h, color, wallColor, ridge, over, tap, faces });
    const g = div(`dio-box gable ${cls}`);
    g.style.cssText = `left:0;top:0;transform:translateZ(${z}px)`;
    if (tap) g.dataset.tap = tap;
    const X = x - over, Y = y - over, W = w + over * 2, D = d + over * 2;
    const half = ridge === 'x' ? D / 2 : W / 2;
    const L = Math.hypot(half, h);
    const phi = Math.atan2(h, half);   // 斜面跟地面的角度
    const sn = Math.sin(phi), cs = Math.cos(phi);
    const slope = (x1, y1, x2, y2, n, k) => {
      const p = vpanel(x1, y1, x2, y2, L, `side roof ${k}`);
      p.el.style.transform = `rotateZ(${(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI}deg) rotateX(${-(phi * 180) / Math.PI}deg)`;
      p.el.style.background = lit(color, ...n);
      if (faces[k]) p.el.innerHTML = faces[k];
      g.appendChild(p.el);
    };
    const gableEnd = (x1, y1, x2, y2, k) => {
      const p = vpanel(x1, y1, x2, y2, h, `side gable-end ${k}`);
      p.el.style.background = lit(wallColor || color, ...p.n);
      p.el.style.clipPath = 'polygon(0 100%, 100% 100%, 50% 0)';
      if (faces[k]) p.el.innerHTML = faces[k];
      g.appendChild(p.el);
    };
    if (ridge === 'x') {
      slope(X, Y + D, X + W, Y + D, [0, sn, cs], 's');
      slope(X + W, Y, X, Y, [0, -sn, cs], 'n');
      gableEnd(x + w, y + d, x + w, y, 'e');
      gableEnd(x, y, x, y + d, 'w');
    } else {
      slope(X + W, Y + D, X + W, Y, [sn, 0, cs], 'e');
      slope(X, Y, X, Y + D, [-sn, 0, cs], 'w');
      gableEnd(x, y + d, x + w, y + d, 's');
      gableEnd(x + w, y, x, y, 'n');
    }
    world.appendChild(g);
    return { el: g };
  }

  // 看板（一直面向鏡頭）：腳底踩在 (x, y, z)
  function addSprite({ x, y, z = 0, w, h, html = '', cls = '', shadow = 0.7, tap = null, budget = 0, live = false }) {
    // 不會動的看板（樹、路燈、遠景）畫在 WebGL；標記、角色（live）用 CSS
    if (useGL() && !live && !/marker/.test(cls) && /^\s*<svg/i.test(html)) return glSprite({ x, y, z, w, h, html, shadow, tap });
    const s = div(`dio-sprite ${cls}`);
    s.style.cssText = `left:${x - w / 2}px;top:${y - h}px;width:${w}px;height:${h}px`;
    // 遠景用：縮小畫、再放大（只給不會移動的看板用，move() 不處理縮放）
    const k = budget ? lowRes(w, h, budget) : 1;
    if (k > 1) {
      s.style.cssText = `left:${x - w / 2 / k}px;top:${y - h / k}px;width:${w / k}px;height:${h / k}px`;
      s.style.setProperty('--s', k);
    }
    s.style.setProperty('--z', `${z}px`);
    s.innerHTML = html;
    if (tap) s.dataset.tap = tap;
    world.appendChild(s);
    let sh = null;
    if (shadow) {
      sh = div('dio-shadow');
      world.appendChild(sh);
    }
    const sp = {
      el: s, sh, x, y, z, w, h,
      move(nx, ny, nz = sp.z) {
        sp.x = nx; sp.y = ny; sp.z = nz;
        s.style.left = `${nx - w / 2}px`;
        s.style.top = `${ny - h}px`;
        s.style.setProperty('--z', `${nz}px`);
        if (sh) {
          const sw = w * shadow;
          sh.style.cssText = `left:${nx - sw / 2}px;top:${ny - sw * 0.22}px;width:${sw}px;height:${sw * 0.44}px;transform:translateZ(${nz + 1}px)`;
        }
      },
      remove() { s.remove(); sh?.remove(); },
    };
    sp.move(x, y, z);
    return sp;
  }

  // 貼在地板（或家具頂面高度）上的平面：地毯、影子、標記
  // 單面的直立牆片（只有從「正面」看得到；背面看會消失——娃娃屋轉到哪，靠近鏡頭的牆就不見）
  // both：兩面都看得到（例如防墜網）
  function addPanel({ x1, y1, x2, y2, z = 0, h, html = '', css = '', cls = '', both = false, tap = null }) {
    if (useGL()) {
      const pick = proxy(tap);
      const L = Math.hypot(x2 - x1, y2 - y1);
      const bg = css || '#fff3e6';
      glPanel([x1, y1, z], [x2, y2, z], [0, 0, h], { bg, html, pick, w: L, h });
      if (both) glPanel([x2, y2, z], [x1, y1, z], [0, 0, h], { bg, html, pick, w: L, h });
      return { el: pick };
    }
    const g = div(`dio-box panel3d ${cls}`);
    g.style.cssText = `left:0;top:0;transform:translateZ(${z}px)`;
    if (tap) g.dataset.tap = tap;
    const mk = (a1, b1, a2, b2) => {
      const p = vpanel(a1, b1, a2, b2, h, 'side wall');
      p.el.style.background = css || '#fff3e6';
      if (html) p.el.innerHTML = html;
      g.appendChild(p.el);
    };
    mk(x1, y1, x2, y2);
    if (both) mk(x2, y2, x1, y1);
    world.appendChild(g);
    return { el: g };
  }
  // budget：這張平面最多用多少「螢幕像素」畫。超過就用小一點的尺寸畫、再放大貼上去。
  // iPhone（像素密度 3）上一張 3000×2200 的地圖要 2 億多像素，記憶體不夠，Safari 會直接重新載入（11/24 iPhone 發現）。
  // 只給內容不怕放大的平面用（SVG、百分比漸層）；用 px 畫格線的地板不要給 budget。
  function addDecal({ x, y, w, h, z = 0.6, html = '', cls = '', css = '', budget = 0 }) {
    if (useGL()) return glDecal({ x, y, w, h, z, html, css, cls });
    const dd = div(`dio-decal ${cls}`, html);
    const k = budget ? lowRes(w, h, budget) : 1;
    const size = k > 1 ? `width:${w / k}px;height:${h / k}px;transform-origin:0 0;transform:translateZ(${z}px) scale(${k})`
      : `width:${w}px;height:${h}px;transform:translateZ(${z}px)`;
    dd.style.cssText = `left:${x}px;top:${y}px;${size};${css}`;
    world.appendChild(dd);
    return dd;
  }

  // ---- 地板底座、牆 ----
  const R = o.rim;
  let floor;
  if (o.open) {
    // 外圈地面：比場景大很多，從邊緣慢慢淡掉；場景本身的地板邊緣也柔化，看不到切口
    const SK = Math.max(o.w, o.d) * 1.6;
    // 外圈只是一片漸層，畫得很粗也看不出來
    addDecal({ x: -SK, y: -SK, w: o.w + SK * 2, h: o.d + SK * 2, z: 0.05, cls: 'dio-skirt', budget: 4e5,
      css: `background:radial-gradient(closest-side, ${o.skirt} 0, ${o.skirt} 46%, transparent 100%)` });
    const fcss = o.floorCss || `background:${o.floor}`;
    floor = addDecal({ x: 0, y: 0, w: o.w, h: o.d, z: 0.3, cls: 'dio-floor open', css: fcss, budget: /\dpx/.test(fcss) ? 0 : 1.5e6 });
    if (o.horizon) addHorizon(o.horizon);
  } else {
    addBox({ x: -R, y: -R, z: -34, w: o.w + R * 2, d: o.d + R * 2, h: 34, color: o.base, cls: 'base' });
    floor = addDecal({ x: 0, y: 0, w: o.w, h: o.d, z: 0.3, cls: 'dio-floor', css: o.floorCss || `background:${o.floor}` });
  }
  const walls = {};
  if (o.walls) {
    const H = o.wallH;
    const W = o.w, D = o.d;
    // 朝內的高牆（從外面看就消失）
    const defs = {
      n: [0, 0.4, W, 0.4], e: [W - 0.4, 0, W - 0.4, D], s: [W, D - 0.4, 0, D - 0.4], w: [0.4, D, 0.4, 0],
    };
    for (const [k, [x1, y1, x2, y2]] of Object.entries(defs)) {
      const p = vpanel(x1, y1, x2, y2, H, `wall wall-${k}`);
      p.el.style.background = `linear-gradient(to top, ${shade(o.wall, 0.93)} 0, ${shade(o.wall, 0.93)} 18px, ${o.wall} 19px, ${shade(o.wall, 1.04)} 100%)`;
      world.appendChild(p.el);
      walls[k] = p.el;
    }
    // 一圈矮牆根（被切掉的牆也看得到房間的邊）
    const t = 14, sh = 24;
    const rc = shade(o.wall, 0.86);
    addBox({ x: -t, y: -t, w: W + t * 2, d: t, h: sh, color: rc, cls: 'rim' });
    addBox({ x: -t, y: D, w: W + t * 2, d: t, h: sh, color: rc, cls: 'rim' });
    addBox({ x: -t, y: 0, w: t, d: D, h: sh, color: rc, cls: 'rim' });
    addBox({ x: W, y: 0, w: t, d: D, h: sh, color: rc, cls: 'rim' });
  }
  // 在牆上貼東西（窗戶、海報）：along 是沿著牆的位置（從牆的左端算），up 是離地多高
  function wallArt(side, { along, up, w, h, html, cls = '' }) {
    const wall = walls[side];
    const a = div(`wall-art ${cls}`, html);
    a.style.cssText = `left:${along}px;top:${o.wallH - up - h}px;width:${w}px;height:${h}px`;
    wall.appendChild(a);
    return a;
  }
  // 世界座標 → 沿著牆的位置
  const alongWall = (side, x, y) => ({ n: x, e: y, s: o.w - x, w: o.d - y }[side]);

  function setTint(css) { tint.style.background = css; }

  apply();
  const api = {
    el, cam, world, view, walls, floor, o,
    addBox, addGable, addPanel, addSprite, addDecal, wallArt, alongWall, seal, groundAt, gl: !!glS,
    animateTo, rotateBy, faceQuadrant, quadrant, snap, apply, setTint, glow, zoomBy, view,
    onRotate(fn) { rotHooks.push(fn); },
    lock(on) { locked = on; },
    // 剛剛是在轉房間（不是點東西）：點擊事件要忽略
    justDragged: () => Date.now() - lastDrag < 250,
    // 點到哪個東西（data-tap）
    onTap(fn) {
      el.addEventListener('click', (e) => {
        if (Date.now() - lastDrag < 250) return;
        let t = e.target.closest('[data-tap]');
        // 沒點到 CSS 的東西：看看有沒有點到畫布上的房子、樹
        if (!t && glS) { const r = rayAt(e.clientX, e.clientY); t = glS.pick(r.o, r.d); }
        if (t?.dataset.tap) fn(t.dataset.tap, t, e);
      });
    },
    isLocked: () => locked,
    destroy() {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(pending);
      cancelAnimationFrame(glRaf);
      glS?.destroy();
      offFit();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      el.remove();
    },
  };
  window.__dio = api;   // 測試用
  return api;
}
