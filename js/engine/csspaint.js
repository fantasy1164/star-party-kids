// 把簡單的 CSS 背景（純色、linear／radial／repeating-linear-gradient、圓角）畫到 canvas 上，
// 給 WebGL 當貼圖用。只支援這個遊戲用得到的寫法；看不懂的就用裡面出現的第一個顏色。

const NAMED = { transparent: [0, 0, 0, 0], white: [255, 255, 255, 1], black: [0, 0, 0, 1] };

export function parseColor(s) {
  s = s.trim().toLowerCase();
  if (NAMED[s]) return NAMED[s].slice();
  if (s[0] === '#') {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1;
    return [n >> 16, (n >> 8) & 255, n & 255, a];
  }
  const m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    return [p[0], p[1], p[2], p[3] ?? 1];
  }
  return null;
}
const css = (c) => `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`;

// 以最外層的逗號切開
function splitTop(s, sep = ',') {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === sep && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// 從 "background:...;border-radius:..." 取出各屬性
function decls(cssText) {
  const o = {};
  for (const part of splitTop(cssText, ';')) {
    const i = part.indexOf(':');
    if (i < 0) continue;
    o[part.slice(0, i).trim().toLowerCase()] = part.slice(i + 1).trim();
  }
  return o;
}

// 色標："#fff 0 30px" → [{c, pos}, {c, pos}]；pos 以 px（長度 L 上）表示，沒有就是 null
function parseStops(parts, L, k) {
  const stops = [];
  for (const p of parts) {
    const m = p.match(/^(#[0-9a-f]+|rgba?\([^)]*\)|[a-z]+)\s*(.*)$/i);
    if (!m) continue;
    const c = parseColor(m[1]);
    if (!c) continue;
    const ps = m[2].trim() ? m[2].trim().split(/\s+/) : [];
    const toPx = (v) => (v.endsWith('%') ? (parseFloat(v) / 100) * L : parseFloat(v) * k);
    if (!ps.length) stops.push({ c, pos: null });
    else ps.forEach((v) => stops.push({ c, pos: toPx(v) }));
  }
  if (!stops.length) return stops;
  // 補位置（規格：第一個 0、最後一個 L、中間平均；後面的不能比前面小）
  if (stops[0].pos === null) stops[0].pos = 0;
  if (stops[stops.length - 1].pos === null) stops[stops.length - 1].pos = L;
  for (let i = 1; i < stops.length; i++) if (stops[i].pos !== null && stops[i].pos < stops[i - 1].pos) stops[i].pos = stops[i - 1].pos;
  for (let i = 1; i < stops.length; i++) {
    if (stops[i].pos !== null) continue;
    let j = i;
    while (stops[j].pos === null) j++;
    const a = stops[i - 1].pos, b = stops[j].pos;
    for (let t = i; t < j; t++) stops[t].pos = a + ((b - a) * (t - i + 1)) / (j - i + 1);
  }
  // transparent 用旁邊的顏色、透明度 0（避免漸層中間變灰）
  stops.forEach((s, i) => {
    if (s.c[3] === 0 && s.c[0] === 0 && s.c[1] === 0 && s.c[2] === 0) {
      const nb = stops[i - 1]?.c[3] ? stops[i - 1] : stops[i + 1];
      if (nb) s.c = [nb.c[0], nb.c[1], nb.c[2], 0];
    }
  });
  return stops;
}

function addStops(g, stops, L) {
  for (const s of stops) g.addColorStop(Math.max(0, Math.min(1, L ? s.pos / L : 0)), css(s.c));
}

function linear(ctx, args, w, h, k, repeating) {
  const parts = splitTop(args);
  let ang = 180;   // 預設往下
  const first = parts[0].trim();
  if (/deg$/.test(first)) { ang = parseFloat(first); parts.shift(); }
  else if (/^to /.test(first)) {
    const d = first.slice(3).trim();
    ang = { top: 0, right: 90, bottom: 180, left: 270, 'top right': 45, 'right top': 45, 'bottom right': 135, 'right bottom': 135, 'bottom left': 225, 'left bottom': 225, 'top left': 315, 'left top': 315 }[d] ?? 180;
    parts.shift();
  }
  const r = (ang * Math.PI) / 180;
  const L = Math.abs(w * Math.sin(r)) + Math.abs(h * Math.cos(r));
  const cx = w / 2, cy = h / 2;
  const dx = (Math.sin(r) * L) / 2, dy = (-Math.cos(r) * L) / 2;
  let stops = parseStops(parts, L, k);
  if (!stops.length) return;
  if (repeating) {
    const p0 = stops[0].pos, period = stops[stops.length - 1].pos - p0;
    if (period > 0.5) {
      const rep = [];
      for (let off = p0 - Math.ceil(p0 / period) * period; off < L; off += period) stops.forEach((s) => rep.push({ c: s.c, pos: s.pos - p0 + off }));
      stops = rep.filter((s) => s.pos >= -period && s.pos <= L + period);
      // 線段拉長到包含全部色標：位置 p 的點 = 起點 + 方向 × p/L
      const lo = Math.min(0, stops[0].pos), hi = Math.max(L, stops[stops.length - 1].pos);
      const sx = cx - dx, sy = cy - dy, vx = 2 * dx, vy = 2 * dy;
      const g = ctx.createLinearGradient(sx + (vx * lo) / L, sy + (vy * lo) / L, sx + (vx * hi) / L, sy + (vy * hi) / L);
      const span = hi - lo;
      for (const s of stops) g.addColorStop(Math.max(0, Math.min(1, (s.pos - lo) / span)), css(s.c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      return;
    }
  }
  const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  addStops(g, stops, L);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function radial(ctx, args, w, h, k) {
  const parts = splitTop(args);
  let shape = 'ellipse', size = 'farthest-corner', px = 0.5, py = 0.5;
  const head = parts[0];
  if (!parseColor(head.split(/\s+/)[0])) {
    parts.shift();
    const m = head.match(/at\s+([\d.]+)%\s+([\d.]+)%/);
    if (m) { px = +m[1] / 100; py = +m[2] / 100; }
    if (/circle/.test(head)) shape = 'circle';
    const sz = head.match(/(closest-side|closest-corner|farthest-side|farthest-corner)/);
    if (sz) size = sz[1];
  }
  const cx = px * w, cy = py * h;
  const sx = [cx, w - cx], sy = [cy, h - cy];
  let rx, ry;
  if (size === 'closest-side') { rx = Math.min(...sx); ry = Math.min(...sy); }
  else if (size === 'farthest-side') { rx = Math.max(...sx); ry = Math.max(...sy); }
  else { rx = Math.max(...sx) * Math.SQRT2; ry = Math.max(...sy) * Math.SQRT2; }
  if (shape === 'circle') { const r = size.startsWith('closest') ? Math.min(rx, ry) : Math.hypot(Math.max(...sx), Math.max(...sy)); rx = ry = r; }
  rx = Math.max(rx, 0.5); ry = Math.max(ry, 0.5);
  const stops = parseStops(parts, rx, k);
  if (!stops.length) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  addStops(g, stops, rx);
  ctx.fillStyle = g;
  ctx.fillRect(-cx, (-cy * rx) / ry, w, (h * rx) / ry);
  ctx.restore();
}

// 在 (0,0,w,h) 畫出 CSS 背景。k：每 1 個 CSS px 等於幾個貼圖像素
export function paintBackground(ctx, cssText, w, h, k = 1) {
  const d = cssText.includes(':') ? decls(cssText) : { background: cssText };
  const bg = d.background ?? d['background-color'] ?? '';
  ctx.save();
  // 圓角：很大的百分比（例如公園草地）當成橢圓，其他用圓角矩形
  const br = d['border-radius'];
  if (br) {
    const v = br.split(/[\s/]+/)[0];
    ctx.beginPath();
    if (v.endsWith('%') && parseFloat(v) >= 35) ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    else { const r = Math.min(w, h) / 2, rr = Math.min(r, parseFloat(v) * k || 0); ctx.roundRect ? ctx.roundRect(0, 0, w, h, rr) : ctx.rect(0, 0, w, h); }
    ctx.clip();
  }
  const layers = splitTop(bg).reverse();   // CSS 第一層在最上面
  for (const L of layers) {
    const m = L.match(/^(repeating-)?(linear|radial|conic)-gradient\((.*)\)\s*(.*)$/s);
    try {
      if (m && m[2] === 'linear') linear(ctx, m[3], w, h, k, !!m[1]);
      else if (m && m[2] === 'radial') radial(ctx, m[3], w, h, k);
      else if (m) { const c = m[3].match(/#[0-9a-f]+/i); if (c) { ctx.fillStyle = c[0]; ctx.fillRect(0, 0, w, h); } }
      else { const c = parseColor(L.split(/\s+/)[0]); if (c) { ctx.fillStyle = css(c); ctx.fillRect(0, 0, w, h); } }
    } catch { /* 畫不出來就略過這一層 */ }
  }
  ctx.restore();
}

// 邊緣淡出（戶外地板的 mask：四邊 7% 漸漸透明）
export function fadeEdges(ctx, w, h, f = 0.07) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  let g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(f, '#000'); g.addColorStop(1 - f, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(f, '#000'); g.addColorStop(1 - f, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
