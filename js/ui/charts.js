// 家長頁的圖表（11/25）：自己畫的 SVG，不用外部套件、可以離線。
// 原則：細線、圓角的長條、格線很淡；兩條以上的線一定有圖例；顏色以外還有形狀或文字（心情用臉，不只靠顏色）。
// 每個標記都有 <title>，iPad 長按、電腦滑過去會顯示數值。

export const C = {
  s1: '#257de0',   // 第一組（例：玩前、自己完成、這週）
  s2: '#f47230',   // 第二組（例：玩後）
  s4: '#f2a600',   // 靠提示
  gray: '#8a8378', // 中途離開、上週（中性灰，表示「比較不重要」）
  grid: '#eee6d8',
  ink: '#333',
  ink2: '#8a7a5a',
};

// ---- 心情：仿捷運廁所滿意度按鈕（綠 → 紅、笑臉 → 哭臉），5 很開心 … 1 很難過 ----
export const MOOD_COLOR = { 5: '#2fb45a', 4: '#8ccf3e', 3: '#ffc21a', 2: '#ff8a2a', 1: '#e8453c' };
export const MOOD_NAME = { 5: '很開心', 4: '開心', 3: '普通', 2: '不開心', 1: '很難過' };
// 臉（viewBox 0 0 100 100）：嘴巴的彎度跟著心情，1 有眼淚
export function moodFaceInner(v, { stroke = '#3a2a1a' } = {}) {
  const mouth = { 5: 'M28 58 Q50 84 72 58', 4: 'M32 62 Q50 76 68 62', 3: 'M34 66 H66', 2: 'M34 70 Q50 58 66 70', 1: 'M30 74 Q50 54 70 74' }[v];
  const brows = v === 1 ? '<path d="M26 32 L40 36 M74 32 L60 36" stroke-width="5"/>' : '';
  const eyes = v === 5 ? '<path d="M28 44 Q36 34 44 44 M56 44 Q64 34 72 44" stroke-width="6" fill="none"/>'
    : `<circle cx="36" cy="44" r="6" fill="${stroke}" stroke="none"/><circle cx="64" cy="44" r="6" fill="${stroke}" stroke="none"/>`;
  const tear = v === 1 ? '<path d="M30 52 Q26 62 30 66 Q34 62 30 52Z" fill="#7fc8ff" stroke="none"/>' : '';
  const blush = v >= 4 ? '<ellipse cx="24" cy="58" rx="7" ry="4" fill="#fff" opacity=".35" stroke="none"/><ellipse cx="76" cy="58" rx="7" ry="4" fill="#fff" opacity=".35" stroke="none"/>' : '';
  return `<circle cx="50" cy="50" r="46" fill="${MOOD_COLOR[v]}"/><g stroke="${stroke}" stroke-linecap="round" fill="none">${eyes}${brows}<path d="${mouth}" stroke-width="6"/></g>${tear}${blush}`;
}
export const moodFace = (v, size = 56) => `<svg class="mood-face" viewBox="0 0 100 100" width="${size}" height="${size}">${moodFaceInner(v)}</svg>`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const legend = (items) => `<div class="chart-legend">${items.map((i) => `<span><i style="background:${i.color}${i.dash ? `;background:repeating-linear-gradient(90deg,${i.color} 0 6px,transparent 6px 10px)` : ''}"></i>${esc(i.name)}</span>`).join('')}</div>`;
const W = 860;

// 心情曲線：x 是日期、y 是 1～5（左邊用小臉當刻度）。沒打卡的日子斷開；低落（≤2）的日子底下淡淡標出來
export function moodChart({ labels, series, today = -1 }) {
  const H = 300, L = 70, R = 20, T = 18, B = 40;
  const n = labels.length;
  const x = (i) => L + ((W - L - R) * (n === 1 ? 0.5 : i / (n - 1)));
  const y = (v) => T + (H - T - B) * (5 - v) / 4;
  let low = '';
  for (let i = 0; i < n; i++) {
    const m = Math.min(...series.map((s) => s.vals[i] ?? 9));
    if (m <= 2) { const w = (W - L - R) / Math.max(1, n - 1); low += `<rect x="${x(i) - w / 2}" y="${T - 6}" width="${w}" height="${H - T - B + 12}" fill="#ffe4dc" rx="6"><title>${labels[i]} 心情比較低</title></rect>`; }
  }
  const grid = [1, 2, 3, 4, 5].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${C.grid}" stroke-width="1.5"/><g transform="translate(${L - 52} ${y(v) - 17})"><svg width="34" height="34" viewBox="0 0 100 100">${moodFaceInner(v)}</svg></g>`).join('');
  const xs = labels.map((l, i) => `<text x="${x(i)}" y="${H - 12}" text-anchor="middle" font-size="16" fill="${i === today ? C.ink : C.ink2}" font-weight="${i === today ? 700 : 400}">${esc(l)}</text>`).join('');
  // 兩條線同一天同一格時點會疊在一起：左右錯開一點
  const lines = series.map((s, si) => {
    const dx = series.length > 1 ? (si - (series.length - 1) / 2) * 7 : 0;
    let d = '', pen = false;
    s.vals.forEach((v, i) => { if (v == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(i) + dx} ${y(v)} `; pen = true; });
    const dots = s.vals.map((v, i) => (v == null ? '' : `<circle cx="${x(i) + dx}" cy="${y(v)}" r="7" fill="${s.color}" stroke="#fff" stroke-width="2.5"><title>${labels[i]} ${s.name}：${MOOD_NAME[v]}</title></circle>`)).join('');
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="3" ${s.dash ? 'stroke-dasharray="8 6"' : ''} stroke-linejoin="round" stroke-linecap="round"/>${dots}`;
  }).join('');
  return `${legend(series)}<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%">${low}${grid}${xs}${lines}</svg>`;
}

// 長條（一組數字）：sub 是每根下面的小字（例：完成率）
export function barChart({ labels, vals, color = C.s1, unit = '', sub = null, today = -1, fmt = (v) => v }) {
  const H = 280, L = 20, R = 20, T = 34, B = sub ? 62 : 40;
  const n = labels.length, max = Math.max(1, ...vals.map((v) => v || 0));
  const bw = Math.min(64, ((W - L - R) / n) * 0.56);
  const x = (i) => L + ((W - L - R) / n) * (i + 0.5);
  const h = (v) => ((H - T - B) * (v || 0)) / max;
  const base = H - B;
  const bars = vals.map((v, i) => {
    const hh = Math.max(v ? 4 : 0, h(v));
    const r = Math.min(6, hh / 2);
    const top = base - hh;
    const path = hh ? `M${x(i) - bw / 2} ${base} V${top + r} Q${x(i) - bw / 2} ${top} ${x(i) - bw / 2 + r} ${top} H${x(i) + bw / 2 - r} Q${x(i) + bw / 2} ${top} ${x(i) + bw / 2} ${top + r} V${base}Z` : '';
    return `${path ? `<path d="${path}" fill="${color}" opacity="${i === today ? 1 : 0.8}"><title>${labels[i]}：${fmt(v)}${unit}</title></path>` : ''}
      ${v ? `<text x="${x(i)}" y="${top - 8}" text-anchor="middle" font-size="17" font-weight="700" fill="${C.ink}">${fmt(v)}</text>` : ''}
      <text x="${x(i)}" y="${base + 24}" text-anchor="middle" font-size="16" fill="${i === today ? C.ink : C.ink2}" font-weight="${i === today ? 700 : 400}">${esc(labels[i])}</text>
      ${sub ? `<text x="${x(i)}" y="${base + 48}" text-anchor="middle" font-size="15" fill="${C.ink2}">${esc(sub[i] ?? '')}</text>` : ''}`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%"><line x1="${L}" x2="${W - R}" y1="${base}" y2="${base}" stroke="${C.grid}" stroke-width="2"/>${bars}</svg>`;
}

// 堆疊長條（每天：自己完成／靠提示／中途離開），段和段之間留 2px 白縫
export function stackChart({ labels, segs, today = -1 }) {
  const H = 280, L = 20, R = 20, T = 30, B = 40;
  const n = labels.length;
  const tot = labels.map((_, i) => segs.reduce((t, s) => t + (s.vals[i] || 0), 0));
  const max = Math.max(1, ...tot);
  const bw = Math.min(64, ((W - L - R) / n) * 0.56);
  const x = (i) => L + ((W - L - R) / n) * (i + 0.5);
  const base = H - B;
  const k = (H - T - B) / max;
  const cols = labels.map((lab, i) => {
    let y0 = base, out = '';
    segs.forEach((s, j) => {
      const v = s.vals[i] || 0;
      if (!v) return;
      const hh = v * k;
      const top = y0 - hh;
      const last = segs.slice(j + 1).every((s2) => !(s2.vals[i] || 0));
      const r = last ? Math.min(6, hh / 2) : 0;
      out += `<path d="M${x(i) - bw / 2} ${y0} V${top + r} ${r ? `Q${x(i) - bw / 2} ${top} ${x(i) - bw / 2 + r} ${top} H${x(i) + bw / 2 - r} Q${x(i) + bw / 2} ${top} ${x(i) + bw / 2} ${top + r}` : `H${x(i) + bw / 2}`} V${y0}Z" fill="${s.color}" stroke="#fff" stroke-width="2"><title>${lab} ${s.name}：${v} 關</title></path>`;
      y0 = top;
    });
    return `${out}${tot[i] ? `<text x="${x(i)}" y="${y0 - 8}" text-anchor="middle" font-size="17" font-weight="700" fill="${C.ink}">${tot[i]}</text>` : ''}
      <text x="${x(i)}" y="${base + 24}" text-anchor="middle" font-size="16" fill="${i === today ? C.ink : C.ink2}" font-weight="${i === today ? 700 : 400}">${esc(lab)}</text>`;
  }).join('');
  return `${legend(segs)}<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%"><line x1="${L}" x2="${W - R}" y1="${base}" y2="${base}" stroke="${C.grid}" stroke-width="2"/>${cols}</svg>`;
}

// 橫向成對長條（生活領域：這週 vs 上週）
export function pairedChart({ cats, a, b }) {
  const rowH = 58, L = 210, R = 70, T = 6;
  const H = T + cats.length * rowH + 6;
  const max = Math.max(1, ...a.vals, ...b.vals);
  const w = (v) => ((W - L - R) * v) / max;
  const rows = cats.map((c, i) => {
    const y0 = T + i * rowH;
    const bar = (v, y, color, name) => (v ? `<rect x="${L}" y="${y}" width="${Math.max(6, w(v))}" height="18" rx="5" fill="${color}"><title>${c.name} ${name}：${v} 關</title></rect><text x="${L + Math.max(6, w(v)) + 8}" y="${y + 15}" font-size="15" fill="${C.ink}">${v}</text>` : `<text x="${L + 4}" y="${y + 15}" font-size="15" fill="${C.ink2}">0</text>`);
    return `<text x="${L - 14}" y="${y0 + 30}" text-anchor="end" font-size="19" fill="${C.ink}">${c.icon} ${esc(c.name)}</text>
      ${bar(a.vals[i], y0 + 6, a.color, a.name)}${bar(b.vals[i], y0 + 28, b.color, b.name)}`;
  }).join('');
  return `${legend([a, b])}<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%">${rows}</svg>`;
}

// 一條線（乘法學會題數）：最後一點標數字
export function lineChart({ labels, vals, max, color = C.s1, unit = '' }) {
  const H = 240, L = 50, R = 40, T = 24, B = 40;
  const n = labels.length;
  const x = (i) => L + ((W - L - R) * (n === 1 ? 0.5 : i / (n - 1)));
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const ticks = [0, Math.round(max / 20) * 10, max].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${C.grid}" stroke-width="1.5"/><text x="${L - 10}" y="${y(v) + 5}" text-anchor="end" font-size="15" fill="${C.ink2}">${Math.round(v)}</text>`).join('');
  let d = '', pen = false;
  vals.forEach((v, i) => { if (v == null) return; d += `${pen ? 'L' : 'M'}${x(i)} ${y(v)} `; pen = true; });
  const lastI = vals.map((v, i) => (v == null ? -1 : i)).filter((i) => i >= 0).pop();
  const step = Math.max(1, Math.ceil(n / 7));
  const xs = labels.map((l, i) => (i % step === 0 || i === n - 1 ? `<text x="${x(i)}" y="${H - 12}" text-anchor="middle" font-size="15" fill="${C.ink2}">${esc(l)}</text>` : '')).join('');
  const dots = vals.map((v, i) => (v == null ? '' : `<circle cx="${x(i)}" cy="${y(v)}" r="${i === lastI ? 7 : 4}" fill="${color}" stroke="#fff" stroke-width="2"><title>${labels[i]}：${v}${unit}</title></circle>`)).join('');
  const lab = lastI != null ? `<text x="${x(lastI)}" y="${y(vals[lastI]) - 14}" text-anchor="middle" font-size="18" font-weight="700" fill="${C.ink}">${vals[lastI]}${unit}</text>` : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%">${ticks}${xs}<path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>${dots}${lab}</svg>`;
}
