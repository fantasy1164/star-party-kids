// 玩具明星與小孩（SVG）。美術方向：軟膠玩具感——圓潤、有漸層的打光、白色亮點，不描黑邊。
// 跟 toon-fun-party 的平塗動物做出差異。
import { KIDS } from '../config.js';

let uid = 0;
const id = (p) => `${p}${++uid}`;

function starPts(cx, cy, R, r, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 ? r : R;
    const a = -Math.PI / 2 + (Math.PI * i) / n;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}
export const starPolygon = starPts;

const eyes = (lx, rx, y, rxx = 8.5, ryy = 11.5) => `
  <g class="eyes">
    <ellipse cx="${lx}" cy="${y}" rx="${rxx}" ry="${ryy}" fill="#2b2140"/><ellipse cx="${rx}" cy="${y}" rx="${rxx}" ry="${ryy}" fill="#2b2140"/>
    <circle cx="${lx + 3}" cy="${y - 5}" r="3.2" fill="#fff"/><circle cx="${rx + 3}" cy="${y - 5}" r="3.2" fill="#fff"/>
  </g>`;

// ---- 閃閃：星星造型的發條玩具，手上拿著明星麥克風 ----
export function shanSvg() {
  const g = id('sg');
  return `<svg class="char shan" viewBox="0 0 220 250" width="100%" height="100%">
  <defs>
    <radialGradient id="${g}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#fff3a6"/><stop offset=".55" stop-color="#ffd23f"/><stop offset="1" stop-color="#f5a623"/></radialGradient>
    <radialGradient id="${g}m" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#ffb3dc"/><stop offset="1" stop-color="#e83e8c"/></radialGradient>
  </defs>
  <g class="bob">
    <g class="key"><rect x="160" y="128" width="30" height="10" rx="5" fill="#c4902a"/>
      <circle cx="200" cy="120" r="12" fill="#f6c453" stroke="#c4902a" stroke-width="4"/><circle cx="200" cy="146" r="12" fill="#f6c453" stroke="#c4902a" stroke-width="4"/></g>
    <ellipse cx="64" cy="222" rx="24" ry="13" fill="#ff5d73"/><ellipse cx="156" cy="222" rx="24" ry="13" fill="#ff5d73"/>
    <ellipse cx="58" cy="217" rx="9" ry="4" fill="#fff" opacity=".5"/><ellipse cx="150" cy="217" rx="9" ry="4" fill="#fff" opacity=".5"/>
    <polygon points="${starPts(110, 126, 80, 40)}" fill="url(#${g})" stroke="url(#${g})" stroke-width="26" stroke-linejoin="round"/>
    <ellipse cx="80" cy="86" rx="18" ry="9" fill="#fff" opacity=".6" transform="rotate(-32 80 86)"/>
    <circle cx="104" cy="66" r="5" fill="#fff" opacity=".7"/>
    ${eyes(94, 128, 124)}
    <ellipse cx="78" cy="143" rx="10" ry="6" fill="#ff8fa3" opacity=".7"/><ellipse cx="144" cy="143" rx="10" ry="6" fill="#ff8fa3" opacity=".7"/>
    <path class="mouth" d="M100 146 Q111 158 122 146" fill="none" stroke="#2b2140" stroke-width="4.5" stroke-linecap="round"/>
    <ellipse class="mouth-o" cx="111" cy="151" rx="9" ry="8" fill="#c2344a"/>
    <g class="mic">
      <rect x="186" y="78" width="11" height="38" rx="5" fill="#4a3b6b" transform="rotate(18 191 97)"/>
      <circle cx="198" cy="72" r="15" fill="url(#${g}m)"/>
      <path d="M187 66 h22 M186 74 h24 M190 82 h16" stroke="#fff" stroke-width="2" opacity=".5"/>
    </g>
  </g>
</svg>`;
}

// ---- 晚晚：月亮夜燈娃娃，戴睡帽，晚上會發光 ----
export function wanSvg() {
  const g = id('wg');
  return `<svg class="char wan" viewBox="0 0 200 250" width="100%" height="100%">
  <defs>
    <radialGradient id="${g}" cx="38%" cy="34%" r="72%"><stop offset="0" stop-color="#fffbe6"/><stop offset=".6" stop-color="#ffe9a3"/><stop offset="1" stop-color="#f3c95c"/></radialGradient>
    <radialGradient id="${g}h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff2a8" stop-opacity=".95"/><stop offset=".45" stop-color="#ffe27a" stop-opacity=".45"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient>
    <linearGradient id="${g}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d8cff"/><stop offset="1" stop-color="#4a58c8"/></linearGradient>
  </defs>
  <circle class="halo" cx="100" cy="125" r="100" fill="url(#${g}h)"/>
  <g class="bob">
    <rect x="90" y="186" width="20" height="26" rx="6" fill="#b97a4c"/>
    <ellipse cx="100" cy="226" rx="48" ry="16" fill="#a8693f"/>
    <rect x="52" y="208" width="96" height="18" rx="9" fill="#c98b5e"/>
    <ellipse cx="100" cy="209" rx="46" ry="9" fill="#e3aa7a"/>
    <ellipse cx="30" cy="150" rx="13" ry="19" fill="#f3c95c" transform="rotate(25 30 150)"/>
    <ellipse cx="170" cy="150" rx="13" ry="19" fill="#f3c95c" transform="rotate(-25 170 150)"/>
    <circle cx="100" cy="124" r="72" fill="url(#${g})"/>
    <circle cx="66" cy="160" r="10" fill="#f3c95c" opacity=".55"/><circle cx="142" cy="164" r="7" fill="#f3c95c" opacity=".55"/><circle cx="150" cy="104" r="6" fill="#f3c95c" opacity=".5"/>
    <ellipse cx="68" cy="96" rx="16" ry="9" fill="#fff" opacity=".7" transform="rotate(-30 68 96)"/>
    <g class="open-eyes">${eyes(80, 120, 128, 7.5, 10)}</g>
    <g class="sleepy-eyes"><path d="M72 128 Q80 135 88 128 M112 128 Q120 135 128 128" fill="none" stroke="#2b2140" stroke-width="4.5" stroke-linecap="round"/></g>
    <ellipse cx="66" cy="146" rx="10" ry="6" fill="#ff9fb0" opacity=".7"/><ellipse cx="134" cy="146" rx="10" ry="6" fill="#ff9fb0" opacity=".7"/>
    <path class="mouth" d="M92 150 Q100 158 108 150" fill="none" stroke="#2b2140" stroke-width="4" stroke-linecap="round"/>
    <ellipse class="mouth-o" cx="100" cy="154" rx="7" ry="6" fill="#c2344a"/>
    <path d="M30 96 C42 40 104 22 146 40 C168 50 182 66 190 88 C168 78 148 74 126 74 C90 74 58 82 30 96Z" fill="url(#${g}c)"/>
    <path d="M28 98 C60 80 100 72 132 74 C154 76 174 82 190 90" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
    <circle cx="192" cy="92" r="14" fill="#fff"/>
    <polygon points="${starPts(84, 58, 8, 3.5)}" fill="#ffe27a"/><polygon points="${starPts(126, 50, 6, 2.6)}" fill="#ffe27a"/><polygon points="${starPts(60, 78, 5, 2.2)}" fill="#ffe27a"/>
  </g>
</svg>`;
}

// ---- 小孩：通用卡通臉（不畫真實長相）。穿著用 class 控制：w-shirt w-pants w-socks w-pjtop w-pjpants w-cap ----
const SKIN = '#ffd9b8';
const HAIR = '#3b2a20';
function hair(kidId) {
  if (kidId === 'yy') {
    // 岳岳：短短刺刺的頭髮
    return `<path d="M30 70 C28 34 52 18 80 18 C110 18 134 34 130 70 C126 58 120 52 114 50 L110 38 L100 48 L92 32 L84 46 L74 30 L68 46 L58 36 L54 50 C44 54 34 60 30 70Z" fill="${HAIR}"/>`;
  }
  // 凱凱：圓圓的西瓜皮
  return `<path d="M30 78 C26 40 50 20 80 20 C110 20 134 40 130 78 C124 66 116 60 104 58 C96 64 88 62 80 58 C72 64 62 62 56 58 C44 60 36 66 30 78Z" fill="${HAIR}"/>`;
}
export function kidSvg(kidId, wear = []) {
  const k = KIDS[kidId];
  const w = wear.map((x) => `w-${x}`).join(' ');
  const dots = (x0, y0, x1, y1) => {
    let s = '';
    for (let y = y0; y < y1; y += 22) for (let x = x0 + ((y / 22) % 2 ? 10 : 0); x < x1; x += 22) s += `<polygon points="${starPts(x, y, 5, 2.2)}" fill="#ffe27a"/>`;
    return s;
  };
  return `<svg class="kid kid-${kidId} ${w}" viewBox="0 0 160 300" width="100%" height="100%">
  <g class="bob">
    <rect x="56" y="200" width="20" height="78" rx="10" fill="${SKIN}"/><rect x="84" y="200" width="20" height="78" rx="10" fill="${SKIN}"/>
    <ellipse cx="64" cy="282" rx="17" ry="9" fill="${SKIN}"/><ellipse cx="96" cy="282" rx="17" ry="9" fill="${SKIN}"/>
    <rect x="26" y="128" width="22" height="70" rx="11" fill="${SKIN}" transform="rotate(8 37 128)"/>
    <rect x="112" y="128" width="22" height="70" rx="11" fill="${SKIN}" transform="rotate(-8 123 128)"/>
    <circle cx="32" cy="200" r="11" fill="${SKIN}"/><circle cx="128" cy="200" r="11" fill="${SKIN}"/>
    <rect x="44" y="120" width="72" height="88" rx="26" fill="#f3f3f3"/>
    <rect x="48" y="192" width="64" height="30" rx="10" fill="#e2e2e2"/>
    <g class="ly ly-pants"><rect x="46" y="186" width="68" height="28" rx="10" fill="#4a78c2"/>
      <rect x="54" y="204" width="24" height="64" rx="10" fill="#4a78c2"/><rect x="82" y="204" width="24" height="64" rx="10" fill="#4a78c2"/>
      <path d="M80 190 V214" stroke="#355ea3" stroke-width="3"/></g>
    <g class="ly ly-pjpants"><rect x="46" y="186" width="68" height="28" rx="10" fill="#9fc7ff"/>
      <rect x="54" y="204" width="24" height="72" rx="10" fill="#9fc7ff"/><rect x="82" y="204" width="24" height="72" rx="10" fill="#9fc7ff"/>${dots(58, 212, 104, 272)}</g>
    <g class="ly ly-socks"><rect x="53" y="256" width="26" height="22" rx="8" fill="#fff"/><rect x="81" y="256" width="26" height="22" rx="8" fill="#fff"/>
      <ellipse cx="64" cy="283" rx="18" ry="10" fill="#fff"/><ellipse cx="96" cy="283" rx="18" ry="10" fill="#fff"/>
      <rect x="53" y="260" width="26" height="5" fill="${k.color}"/><rect x="81" y="260" width="26" height="5" fill="${k.color}"/></g>
    <g class="ly ly-shirt"><rect x="40" y="116" width="80" height="84" rx="28" fill="${k.color}"/>
      <rect x="24" y="122" width="26" height="36" rx="13" fill="${k.color}" transform="rotate(8 37 122)"/><rect x="110" y="122" width="26" height="36" rx="13" fill="${k.color}" transform="rotate(-8 123 122)"/>
      <polygon points="${starPts(80, 158, 16, 7)}" fill="#fff" opacity=".9"/></g>
    <g class="ly ly-pjtop"><rect x="40" y="116" width="80" height="86" rx="28" fill="#9fc7ff"/>
      <rect x="24" y="122" width="26" height="72" rx="13" fill="#9fc7ff" transform="rotate(8 37 122)"/><rect x="110" y="122" width="26" height="72" rx="13" fill="#9fc7ff" transform="rotate(-8 123 122)"/>${dots(52, 134, 112, 196)}</g>
    <circle cx="80" cy="72" r="50" fill="${SKIN}"/>
    <circle cx="31" cy="78" r="10" fill="${SKIN}"/><circle cx="129" cy="78" r="10" fill="${SKIN}"/>
    ${hair(kidId)}
    ${eyes(64, 96, 80, 6.5, 8)}
    <ellipse cx="52" cy="96" rx="8" ry="5" fill="#ff9fb0" opacity=".7"/><ellipse cx="108" cy="96" rx="8" ry="5" fill="#ff9fb0" opacity=".7"/>
    <path class="mouth" d="M70 100 Q80 110 90 100" fill="none" stroke="#7a3b2e" stroke-width="4" stroke-linecap="round"/>
    <ellipse class="mouth-o" cx="80" cy="104" rx="7" ry="6" fill="#c2344a"/>
    <g class="ly ly-cap"><path d="M26 58 C34 18 84 6 118 22 C134 30 146 44 150 62 C132 52 112 48 90 48 C66 48 44 52 26 58Z" fill="#5b6fd6"/>
      <path d="M24 60 C54 46 96 42 152 64" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round"/><circle cx="152" cy="64" r="12" fill="#fff"/></g>
  </g>
</svg>`;
}

// 小孩頭像（選人、輪流）
export function kidHead(kidId, size = 120) {
  const k = KIDS[kidId];
  return `<svg class="khead" viewBox="0 0 120 120" width="${size}" height="${size}">
  <circle cx="60" cy="60" r="58" fill="${k.soft}"/>
  <g transform="translate(-20 0) scale(1)">
    <circle cx="80" cy="66" r="40" fill="${SKIN}"/>
    <circle cx="40" cy="72" r="8" fill="${SKIN}"/><circle cx="120" cy="72" r="8" fill="${SKIN}"/>
    <g transform="translate(16 6) scale(.8)">${hair(kidId)}</g>
    <circle cx="67" cy="72" r="5.5" fill="#2b2140"/><circle cx="93" cy="72" r="5.5" fill="#2b2140"/>
    <circle cx="69" cy="69" r="2" fill="#fff"/><circle cx="95" cy="69" r="2" fill="#fff"/>
    <ellipse cx="58" cy="86" rx="7" ry="4" fill="#ff9fb0" opacity=".7"/><ellipse cx="102" cy="86" rx="7" ry="4" fill="#ff9fb0" opacity=".7"/>
    <path d="M72 88 Q80 96 88 88" fill="none" stroke="#7a3b2e" stroke-width="3.5" stroke-linecap="round"/>
  </g>
</svg>`;
}

// 兩兄弟一起（選人用）
export function bothHeads(size = 120) {
  return `<div class="both-heads">${kidHead('yy', size * 0.78)}${kidHead('kk', size * 0.78)}</div>`;
}

// 小星星（獎勵、星星罐）
export function starIcon(size = 60, fill = '#ffd23f') {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}"><polygon points="${starPts(50, 54, 40, 19)}" fill="${fill}" stroke="${fill}" stroke-width="12" stroke-linejoin="round"/>
  <ellipse cx="38" cy="38" rx="9" ry="5" fill="#fff" opacity=".6" transform="rotate(-30 38 38)"/></svg>`;
}
