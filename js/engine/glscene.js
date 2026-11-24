// 大場景用的 WebGL 畫布（11/24：iPhone 上城市有 375 張 CSS 3D 圖層，轉動很鈍、手機發燙）。
// 房子、樹、路、遠景這些「不會動」的東西全部畫在一張畫布上，一次交給 GPU；畫面不動時完全不重畫。
// 座標系跟 CSS 版完全一樣（x 往東、y 往南、z 往上），鏡頭矩陣也照 CSS 的 transform 算，
// 所以疊在上面的 CSS 角色（閃閃、標記、車子）會跟畫布對得剛好。
import { paintBackground, fadeEdges, parseColor } from './csspaint.js';

const VS = `
attribute vec3 aPos; attribute vec2 aUv; attribute vec4 aCol;
uniform mat4 uMvp; varying vec2 vUv; varying vec4 vCol;
void main() { gl_Position = uMvp * vec4(aPos, 1.0); vUv = aUv; vCol = aCol; }`;
const FS = `
precision mediump float;
uniform sampler2D uTex; uniform float uCut; varying vec2 vUv; varying vec4 vCol;
void main() { vec4 t = texture2D(uTex, vUv) * vCol; if (t.a < uCut) discard; gl_FragColor = t; }`;

const STRIDE = 9;   // x y z u v r g b a

// SVG 字串 → 指定大小的 <svg>（補 xmlns、寬高）
function svgSized(html, w, h, pad = 0) {
  let s = html.trim();
  if (!/^<svg/i.test(s)) return null;
  const head = s.match(/^<svg[^>]*>/i)[0];
  let nh = head.replace(/\s(width|height)="[^"]*"/gi, '');
  if (!/xmlns=/.test(nh)) nh = nh.replace(/^<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  if (pad) {
    // 看板的圖常常畫到 viewBox 外面（CSS 版是 overflow: visible）：外框放大一點，不要被切掉
    const vb = nh.match(/viewBox="([^"]+)"/i);
    if (vb) {
      const [x, y, vw, vh] = vb[1].split(/[\s,]+/).map(Number);
      const px = vw * pad, py = vh * pad;
      nh = nh.replace(vb[0], `viewBox="${x - px} ${y - py} ${vw + px * 2} ${vh + py * 2}"`);
    }
  }
  nh = nh.replace(/^<svg/i, `<svg width="${w}" height="${h}"`);
  return nh + s.slice(head.length);
}
function loadSvg(svg) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

export function createGLScene(canvas) {
  const opts = { alpha: true, premultipliedAlpha: true, antialias: true, depth: true, powerPreference: 'low-power' };
  const gl = canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts);
  if (!gl) return null;
  const gl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  const maxTex = Math.min(4096, gl.getParameter(gl.MAX_TEXTURE_SIZE));
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic');

  // 程式、緩衝區都在 init() 建：iOS 切到背景時可能把 WebGL 收回，回來時要重建
  let prog, aPos, aUv, aCol, uMvp, uCut, white, sbuf, dbuf;
  function init() {
    const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return x; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    aPos = gl.getAttribLocation(prog, 'aPos'); aUv = gl.getAttribLocation(prog, 'aUv'); aCol = gl.getAttribLocation(prog, 'aCol');
    uMvp = gl.getUniformLocation(prog, 'uMvp'); uCut = gl.getUniformLocation(prog, 'uCut');
    gl.uniform1i(gl.getUniformLocation(prog, 'uTex'), 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    white = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, white);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    sbuf = gl.createBuffer();
    dbuf = gl.createBuffer();
  }
  init();
  let lost = false;
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false;
    init();
    staticDirty = true;
    for (const slot of texCache.values()) { slot.tex = null; paint(slot); }
  });

  let onReady = () => {};
  let dead = false;

  // ---- 貼圖 ----
  const texCache = new Map();
  function upload(cv, ground) {
    if (dead || lost) return null;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
    const pot = (n) => (n & (n - 1)) === 0;
    const mip = gl2 || (pot(cv.width) && pot(cv.height));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    if (mip) gl.generateMipmap(gl.TEXTURE_2D);
    if (aniso && ground) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    return t;
  }
  // 貼圖：背景（CSS）＋上面一張 SVG。w、h 是世界大小，k 是解析度（每單位幾個像素）
  // 同樣內容只畫一次
  let pendingTex = 0;
  function texture({ bg = '', svg = '', w, h, k = 1.5, pad = 0, fade = false, ground = false }) {
    const key = `${bg}|${svg}|${Math.round(w)}|${Math.round(h)}|${k}|${pad}|${fade}`;
    if (texCache.has(key)) return texCache.get(key);
    const slot = { tex: null, args: { bg, svg, w, h, k, pad, fade, ground } };
    texCache.set(key, slot);
    paint(slot);
    return slot;
  }
  async function paint(slot) {
    const { bg, svg, w, h, k, pad, fade, ground } = slot.args;
    let kk = Math.min(k, maxTex / Math.max(w, h));
    const tw = Math.max(2, Math.round(w * kk)), th = Math.max(2, Math.round(h * kk));
    kk = tw / w;
    pendingTex++;
    const cv = document.createElement('canvas');
    cv.width = tw; cv.height = th;
    const ctx = cv.getContext('2d');
    if (bg) paintBackground(ctx, bg, tw, th, kk);
    if (svg) {
      const s2 = svgSized(svg, tw, th, pad);
      const img = s2 && await loadSvg(s2);
      if (img) ctx.drawImage(img, 0, 0, tw, th);
    }
    if (fade) fadeEdges(ctx, tw, th);
    if (!lost) slot.tex = upload(cv, ground);
    cv.width = cv.height = 0;   // 畫完就丟掉，省記憶體（iOS 對 canvas 總量有限制）
    pendingTex--;
    onReady();
  }

  // ---- 幾何：每個「片」是一個四邊形或三角形 ----
  // pass：ground（貼在地上，照順序畫、不寫深度）、solid（不透明）、alpha（有透明的：看板、網子）
  const meshes = [];
  const sprites = [];
  let staticDirty = true;
  const colorOf = (c) => { const p = typeof c === 'string' ? parseColor(c) : c; const a = p ? p[3] : 1; return p ? [(p[0] / 255) * a, (p[1] / 255) * a, (p[2] / 255) * a, a] : [1, 1, 1, 1]; };

  // pts：3 或 4 個世界座標點（逆時針面向 normal 那一側）；uv 對應每個點
  function addPoly({ pts, uv = null, color = '#ffffff', tex = null, pass = 'solid', oneSided = true, order = 0, pick = null }) {
    const n = (() => {
      const [a, b, c] = pts;
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    })();
    const m = { pts, uv: uv || pts.map(() => [0, 0]), col: colorOf(tex ? '#ffffff' : color), tex, pass, oneSided, order, pick, n, hidden: false };
    meshes.push(m);
    staticDirty = true;
    return m;
  }
  // 看板：腳底 (x, y, z)，寬 w、高 h
  function addBillboard({ x, y, z = 0, w, h, below = 0, tex, pick = null }) {
    const s = { x, y, z, w, h, below, tex, pick, hidden: false };
    sprites.push(s);
    return s;
  }

  // ---- 緩衝區 ----
  let groups = [];   // { first, count, tex, pass, oneSided, order }
  function tris(m) {
    // 四邊形 → 兩個三角形
    const idx = m.pts.length === 4 ? [0, 1, 2, 0, 2, 3] : [0, 1, 2];
    return idx;
  }
  function pushVerts(arr, m) {
    for (const i of tris(m)) {
      const p = m.pts[i], t = m.uv[i];
      arr.push(p[0], p[1], p[2], t[0], t[1], m.col[0], m.col[1], m.col[2], m.col[3]);
    }
  }
  function buildStatic() {
    const arr = [];
    groups = [];
    const live = meshes.filter((m) => !m.hidden);
    // 地面：照 order（高度）排；純色的不透明面合成一批；有貼圖的一片一批
    const ground = live.filter((m) => m.pass === 'ground').sort((a, b) => a.order - b.order);
    const solidPlain = (one) => live.filter((m) => m.pass === 'solid' && !m.tex && m.oneSided === one);
    const solidTex = live.filter((m) => m.pass === 'solid' && m.tex);
    const alpha = live.filter((m) => m.pass === 'alpha');
    const addGroup = (list, extra) => {
      if (!list.length) return;
      const first = arr.length / STRIDE;
      list.forEach((m) => pushVerts(arr, m));
      groups.push({ first, count: arr.length / STRIDE - first, ...extra });
    };
    ground.forEach((m) => addGroup([m], { pass: 'ground', tex: m.tex, oneSided: false }));
    addGroup(solidPlain(true), { pass: 'solid', tex: null, oneSided: true });
    addGroup(solidPlain(false), { pass: 'solid', tex: null, oneSided: false });
    solidTex.forEach((m) => addGroup([m], { pass: 'solid', tex: m.tex, oneSided: m.oneSided }));
    alpha.forEach((m) => addGroup([m], { pass: 'alpha', tex: m.tex, oneSided: m.oneSided }));
    gl.bindBuffer(gl.ARRAY_BUFFER, sbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
    staticDirty = false;
  }
  function bindAttribs(buf) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const B = STRIDE * 4;
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, B, 0);
    gl.enableVertexAttribArray(aUv); gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, B, 12);
    gl.enableVertexAttribArray(aCol); gl.vertexAttribPointer(aCol, 4, gl.FLOAT, false, B, 20);
  }

  // 看板四個角（跟 CSS：translateZ(z) rotateZ(-a) rotateX(-90° + lean)，以腳底為中心）
  function spriteCorners(s, a, lean) {
    const ra = (-a * Math.PI) / 180, th = ((-90 + lean) * Math.PI) / 180;
    const ca = Math.cos(ra), sa = Math.sin(ra), ct = Math.cos(th), st = Math.sin(th);
    const P = (u, v) => {
      const y1 = v * ct, z1 = v * st;
      return [s.x + u * ca - y1 * sa, s.y + u * sa + y1 * ca, s.z + z1];
    };
    const hw = s.w / 2;
    const bot = s.below || 0, topv = -(s.h - bot);
    return [P(-hw, bot), P(hw, bot), P(hw, topv), P(-hw, topv)];   // 左下、右下、右上、左上
  }

  // ---- 畫 ----
  let mvp = null, lastA = 0, lastLean = 0;
  function render(m, a, lean) {
    if (dead || lost) return;
    mvp = m; lastA = a; lastLean = lean;
    if (staticDirty) buildStatic();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniformMatrix4fv(uMvp, false, m);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.frontFace(gl.CW);   // 鏡頭矩陣把 y 往下翻，從正面看是順時針
    gl.cullFace(gl.BACK);
    bindAttribs(sbuf);
    const draw = (g) => {
      const t = g.tex ? g.tex.tex : white;
      if (g.tex && !t) return;   // 貼圖還沒好
      gl.bindTexture(gl.TEXTURE_2D, t);
      if (g.oneSided) gl.enable(gl.CULL_FACE); else gl.disable(gl.CULL_FACE);
      gl.drawArrays(gl.TRIANGLES, g.first, g.count);
    };
    // 1. 地面（不寫深度，照高度順序疊上去）
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.uniform1f(uCut, 0.0);
    groups.filter((g) => g.pass === 'ground').forEach(draw);
    // 2. 不透明的方塊、牆
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    groups.filter((g) => g.pass === 'solid').forEach(draw);
    // 3. 透明的：網子、看板（由遠到近）
    gl.uniform1f(uCut, 0.02);
    groups.filter((g) => g.pass === 'alpha').forEach(draw);
    const live = sprites.filter((s) => !s.hidden && s.tex.tex);
    if (live.length) {
      const wOf = (p) => m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
      const order = live.map((s) => ({ s, d: wOf([s.x, s.y, s.z]) })).sort((p, q) => q.d - p.d);
      const arr = [];
      const uvs = [[0, 1], [1, 1], [1, 0], [0, 0]];
      for (const { s } of order) {
        const c = spriteCorners(s, a, lean);
        for (const i of [0, 1, 2, 0, 2, 3]) arr.push(...c[i], ...uvs[i], 1, 1, 1, 1);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, dbuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.DYNAMIC_DRAW);
      bindAttribs(dbuf);
      gl.disable(gl.CULL_FACE);
      order.forEach(({ s }, i) => { gl.bindTexture(gl.TEXTURE_2D, s.tex.tex); gl.drawArrays(gl.TRIANGLES, i * 6, 6); });
    }
  }

  // ---- 點擊：從鏡頭射一條線（世界座標），找最近、而且是正面朝向鏡頭的片 ----
  function pick(o, d) {
    let best = null, bt = Infinity;
    const test = (pts, oneSided, n, tap) => {
      if (oneSided && n[0] * d[0] + n[1] * d[1] + n[2] * d[2] >= 0) return;   // 背面看不到
      const idx = pts.length === 4 ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 2]];
      for (const [i, j, k] of idx) {
        const t = rayTri(o, d, pts[i], pts[j], pts[k]);
        if (t !== null && t < bt) { bt = t; best = tap; }
      }
    };
    for (const m of meshes) if (!m.hidden) test(m.pts, m.oneSided && m.pass !== 'ground', m.n, m.pick);
    for (const s of sprites) if (!s.hidden) test(spriteCorners(s, lastA, lastLean), false, null, s.pick);
    return best;
  }

  function resize(w, h, ratio) {
    canvas.width = Math.max(1, Math.round(w * ratio));
    canvas.height = Math.max(1, Math.round(h * ratio));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }
  function destroy() {
    dead = true;
    try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* 忽略 */ }
  }

  return {
    gl, texture, addPoly, addBillboard, render, pick, resize, destroy,
    markDirty() { staticDirty = true; },
    set onReady(f) { onReady = f; },
    get pending() { return pendingTex; },
  };
}

// 射線與三角形（Möller–Trumbore）
function rayTri(o, d, a, b, c) {
  const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const p = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]];
  const det = e1[0] * p[0] + e1[1] * p[1] + e1[2] * p[2];
  if (Math.abs(det) < 1e-9) return null;
  const inv = 1 / det;
  const s = [o[0] - a[0], o[1] - a[1], o[2] - a[2]];
  const u = (s[0] * p[0] + s[1] * p[1] + s[2] * p[2]) * inv;
  if (u < 0 || u > 1) return null;
  const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]];
  const v = (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]) * inv;
  if (v < 0 || u + v > 1) return null;
  const t = (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) * inv;
  return t > 0 ? t : null;
}
