// 等角立體模型屋引擎（2.5D）。
// 用 CSS 3D 把場景組成一個真的立體模型：地板底座、牆、方塊家具；角色和玩具是一直面向鏡頭的「看板」（SVG）。
// 手指左右滑可以轉房間（停在四個斜角），前面擋住視線的牆會自動消失（背面不畫），只留下一圈矮矮的牆根。
//
// 座標：世界地板是 x（往東）× y（往南），z 往上。鏡頭預設在東南方往西北看（angle 45°）。
// 方塊家具的每一面依「固定在房間裡的光」上色（光從北邊窗戶、斜上方來），轉房間時亮暗面跟著轉，看起來是真的立體。
import { div, stageW, stageScale, onFit } from '../core/dom.js';

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
  el.appendChild(viewEl);
  const tint = div('dio-tint');
  el.appendChild(tint);
  const glow = div('dio-glow');
  el.appendChild(glow);

  const view = { a: o.angle, z: o.zoom, px: o.w / 2, py: o.d / 2, t: o.tilt };
  const rotHooks = [];
  let raf = 0;

  function apply() {
    cam.style.left = `${stageW() / 2}px`;
    cam.style.top = `${900 * o.cy}px`;
    cam.style.transform = `scale(${view.z}) rotateX(${view.t}deg) rotateZ(${view.a}deg) translate3d(${-view.px}px,${-view.py}px,0)`;
    world.style.setProperty('--ang', `${view.a}deg`);
    // 鏡頭往下看得更多時（學堂的「從高處看」），看板角色往後仰一點，才不會被壓扁
    world.style.setProperty('--lean', `${o.tilt - view.t}deg`);
    rotHooks.forEach((f) => f(view.a));
  }
  const offFit = onFit(apply);

  function animateTo(target, ms = 700) {
    cancelAnimationFrame(raf);
    return new Promise((res) => {
      const from = { ...view };
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / ms);
        const e = 1 - Math.pow(1 - k, 3);
        for (const key of Object.keys(target)) view[key] = from[key] + (target[key] - from[key]) * e;
        apply();
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
      addSprite({ x: cx + Math.cos(ang) * rr, y: cy + Math.sin(ang) * rr, w, h, shadow: 0, cls: 'horizon', html: HZ[k](c) });
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
    apply();
  });
  const endPt = (e) => { pts.delete(e.pointerId); if (pts.size < 2 && pinch) { pinch = null; lastDrag = Date.now(); } };
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
    apply();
  };
  const onUp = () => {
    if (!drag) return;
    const { moved, vx } = drag;
    drag = null;
    if (moved) {
      lastDrag = Date.now();
      const glide = Math.max(-40, Math.min(40, -vx * 0.38 * 160));
      if (Math.abs(glide) > 1) animateTo({ a: view.a + glide }, 520);
    }
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  // ---- 建造 ----
  function addBox({ x, y, z = 0, w, d, h, color = '#f2d0a4', top = null, faces = {}, cls = '', tap = null, parent = world }) {
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
  function addSprite({ x, y, z = 0, w, h, html = '', cls = '', shadow = 0.7, tap = null }) {
    const s = div(`dio-sprite ${cls}`);
    s.style.cssText = `left:${x - w / 2}px;top:${y - h}px;width:${w}px;height:${h}px`;
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
  function addDecal({ x, y, w, h, z = 0.6, html = '', cls = '', css = '' }) {
    const dd = div(`dio-decal ${cls}`, html);
    dd.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:translateZ(${z}px);${css}`;
    world.appendChild(dd);
    return dd;
  }

  // ---- 地板底座、牆 ----
  const R = o.rim;
  let floor;
  if (o.open) {
    // 外圈地面：比場景大很多，從邊緣慢慢淡掉；場景本身的地板邊緣也柔化，看不到切口
    const SK = Math.max(o.w, o.d) * 1.6;
    addDecal({ x: -SK, y: -SK, w: o.w + SK * 2, h: o.d + SK * 2, z: 0.05, cls: 'dio-skirt',
      css: `background:radial-gradient(closest-side, ${o.skirt} 0, ${o.skirt} 46%, transparent 100%)` });
    floor = addDecal({ x: 0, y: 0, w: o.w, h: o.d, z: 0.3, cls: 'dio-floor open', css: o.floorCss || `background:${o.floor}` });
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
  return {
    el, cam, world, view, walls, floor, o,
    addBox, addGable, addPanel, addSprite, addDecal, wallArt, alongWall,
    animateTo, rotateBy, faceQuadrant, quadrant, snap, apply, setTint, glow, zoomBy, view,
    onRotate(fn) { rotHooks.push(fn); },
    lock(on) { locked = on; },
    // 剛剛是在轉房間（不是點東西）：點擊事件要忽略
    justDragged: () => Date.now() - lastDrag < 250,
    // 點到哪個東西（data-tap）
    onTap(fn) {
      el.addEventListener('click', (e) => {
        if (Date.now() - lastDrag < 250) return;
        const t = e.target.closest('[data-tap]');
        if (t) fn(t.dataset.tap, t, e);
      });
    },
    isLocked: () => locked,
    destroy() {
      cancelAnimationFrame(raf);
      offFit();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      el.remove();
    },
  };
}
