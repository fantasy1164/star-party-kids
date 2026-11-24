// 小鎮與新地點的美術（SVG）：叭叭（遙控車）、達達（木頭小馬）、多多（存錢筒小豬）、抱抱（泰迪熊醫生）、啾啾（發條小鳥），
// 以及超市、公園、診所、農場的道具。一樣是軟膠玩具質感，不描黑邊。
import { starPolygon } from './stars.js';

let uid = 0;
const gid = (p) => `${p}t${++uid}`;
const strip = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const eyes = (lx, rx, y, r = 7) => `<g class="eyes"><ellipse cx="${lx}" cy="${y}" rx="${r}" ry="${r * 1.3}" fill="#2b2140"/><ellipse cx="${rx}" cy="${y}" rx="${r}" ry="${r * 1.3}" fill="#2b2140"/>
  <circle cx="${lx + 2.5}" cy="${y - 4}" r="${r * 0.38}" fill="#fff"/><circle cx="${rx + 2.5}" cy="${y - 4}" r="${r * 0.38}" fill="#fff"/></g>`;
const mouth = (x, y, w = 10) => `<path class="mouth" d="M${x - w} ${y} Q${x} ${y + w} ${x + w} ${y}" fill="none" stroke="#2b2140" stroke-width="4" stroke-linecap="round"/>
  <ellipse class="mouth-o" cx="${x}" cy="${y + 3}" rx="${w * 0.8}" ry="${w * 0.65}" fill="#c2344a"/>`;
const grad = (id, a, b, c) => `<radialGradient id="${id}" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;

// ---- 叭叭：紅色遙控車，擋風玻璃是眼睛 ----
export function babaSvg() {
  const g = gid('c');
  return `<svg class="char baba" viewBox="0 0 220 180" width="100%" height="100%"><defs>${grad(g, '#ffb0a0', '#ff5b5b', '#d93b3b')}</defs><g class="bob">
    <rect x="96" y="4" width="6" height="34" rx="3" fill="#4a3b6b"/><circle cx="99" cy="6" r="7" fill="#ffd23f"/>
    <circle cx="48" cy="150" r="24" fill="#2b2140"/><circle cx="172" cy="150" r="24" fill="#2b2140"/><circle cx="48" cy="150" r="9" fill="#bbb"/><circle cx="172" cy="150" r="9" fill="#bbb"/>
    <path d="M14 140 C10 104 26 92 48 90 L62 50 C66 40 76 34 88 34 H132 C144 34 154 40 158 50 L172 90 C194 92 210 104 206 140 Z" fill="url(#${g})"/>
    <path d="M70 54 C72 46 78 44 86 44 H134 C142 44 148 46 150 54 L160 88 H60 Z" fill="#dff4ff"/>
    ${eyes(92, 128, 68, 9)}
    <ellipse cx="74" cy="76" rx="7" ry="4" fill="#ff9fb0" opacity=".7"/><ellipse cx="146" cy="76" rx="7" ry="4" fill="#ff9fb0" opacity=".7"/>
    <rect x="80" y="104" width="60" height="18" rx="9" fill="#fff" opacity=".85"/>${mouth(110, 110, 12)}
    <circle cx="34" cy="112" r="10" fill="#fff6b0"/><circle cx="186" cy="112" r="10" fill="#fff6b0"/>
    <ellipse cx="60" cy="98" rx="14" ry="6" fill="#fff" opacity=".45"/></g></svg>`;
}

// ---- 達達：木頭小馬（裝輪子的玩具馬） ----
export function dadaSvg() {
  const g = gid('h');
  return `<svg class="char dada" viewBox="0 0 200 220" width="100%" height="100%"><defs>${grad(g, '#f3c58e', '#d4955f', '#a8693f')}</defs><g class="bob">
    <rect x="30" y="182" width="140" height="14" rx="7" fill="#7a4f2e"/><circle cx="46" cy="200" r="13" fill="#4a3b6b"/><circle cx="154" cy="200" r="13" fill="#4a3b6b"/>
    <rect x="50" y="130" width="18" height="56" rx="8" fill="#a8693f"/><rect x="132" y="130" width="18" height="56" rx="8" fill="#a8693f"/>
    <ellipse cx="100" cy="128" rx="66" ry="34" fill="url(#${g})"/>
    <path d="M164 118 C186 120 192 150 178 164 C176 146 170 132 160 128Z" fill="#7a4f2e"/>
    <path d="M60 110 C52 70 60 40 84 30 C110 22 132 40 130 66 C128 86 112 96 96 100 L92 124Z" fill="url(#${g})"/>
    <path d="M84 30 C70 34 58 56 62 92 C54 70 52 44 72 30 C80 24 92 24 96 28Z" fill="#7a4f2e"/>
    <ellipse cx="118" cy="72" rx="16" ry="12" fill="#f3d0a8"/><circle cx="114" cy="72" r="2.5" fill="#7a4f2e"/><circle cx="124" cy="72" r="2.5" fill="#7a4f2e"/>
    <path d="M86 24 L90 8 L100 22Z" fill="#a8693f"/>${eyes(96, 112, 50, 6)}
    <path class="mouth" d="M108 84 Q116 90 124 84" fill="none" stroke="#7a4f2e" stroke-width="3.5" stroke-linecap="round"/><ellipse class="mouth-o" cx="116" cy="86" rx="6" ry="5" fill="#c2344a"/>
    <path d="M70 120 H130" stroke="#ff5d73" stroke-width="8" stroke-linecap="round"/><circle cx="100" cy="120" r="7" fill="#ffd23f"/></g></svg>`;
}

// ---- 多多：存錢筒小豬，背上有投幣孔 ----
export function duoduoSvg() {
  const g = gid('p');
  return `<svg class="char duoduo" viewBox="0 0 200 200" width="100%" height="100%"><defs>${grad(g, '#ffe0ec', '#ffa8c8', '#f07aa6')}</defs><g class="bob">
    <rect x="52" y="150" width="20" height="34" rx="9" fill="#f07aa6"/><rect x="128" y="150" width="20" height="34" rx="9" fill="#f07aa6"/>
    <ellipse cx="100" cy="112" rx="82" ry="66" fill="url(#${g})"/>
    <path d="M40 60 L48 30 L70 54Z M160 60 L152 30 L130 54Z" fill="#f07aa6"/>
    <rect x="80" y="48" width="40" height="8" rx="4" fill="#b0447a"/>
    <circle cx="100" cy="30" r="16" fill="#ffd23f" class="coin"/><text x="100" y="36" text-anchor="middle" font-size="16" font-weight="900" fill="#c98b1f" font-family="sans-serif">$</text>
    ${eyes(72, 128, 98, 7.5)}
    <ellipse cx="100" cy="128" rx="26" ry="19" fill="#ff8fb8"/><ellipse cx="91" cy="128" rx="5" ry="7" fill="#b0447a"/><ellipse cx="109" cy="128" rx="5" ry="7" fill="#b0447a"/>
    <path class="mouth" d="M88 152 Q100 160 112 152" fill="none" stroke="#7a2e50" stroke-width="4" stroke-linecap="round"/><ellipse class="mouth-o" cx="100" cy="155" rx="8" ry="6" fill="#c2344a"/>
    <ellipse cx="62" cy="76" rx="14" ry="7" fill="#fff" opacity=".55" transform="rotate(-25 62 76)"/></g></svg>`;
}

// ---- 抱抱：泰迪熊醫生（額鏡、聽診器、白袍） ----
export function baobaoSvg() {
  const g = gid('b');
  return `<svg class="char baobao" viewBox="0 0 200 240" width="100%" height="100%"><defs>${grad(g, '#f3d0a8', '#d4955f', '#a8693f')}</defs><g class="bob">
    <ellipse cx="72" cy="224" rx="22" ry="12" fill="#a8693f"/><ellipse cx="128" cy="224" rx="22" ry="12" fill="#a8693f"/>
    <path d="M44 216 C36 160 54 128 100 128 C146 128 164 160 156 216Z" fill="#fff"/>
    <path d="M100 132 V216" stroke="#e5e5e5" stroke-width="4"/><path d="M72 140 C70 170 88 186 100 186 C112 186 130 170 128 140" fill="none" stroke="#4a3b6b" stroke-width="5"/><circle cx="100" cy="190" r="9" fill="#9fb4cc"/>
    <ellipse cx="38" cy="168" rx="14" ry="22" fill="url(#${g})"/><ellipse cx="162" cy="168" rx="14" ry="22" fill="url(#${g})"/>
    <circle cx="56" cy="40" r="20" fill="url(#${g})"/><circle cx="144" cy="40" r="20" fill="url(#${g})"/><circle cx="56" cy="40" r="10" fill="#f3d0a8"/><circle cx="144" cy="40" r="10" fill="#f3d0a8"/>
    <circle cx="100" cy="82" r="54" fill="url(#${g})"/>
    <ellipse cx="100" cy="104" rx="24" ry="17" fill="#f3d0a8"/><ellipse cx="100" cy="96" rx="9" ry="6" fill="#4a2f22"/>
    ${eyes(80, 120, 80, 6.5)}
    <path class="mouth" d="M90 108 Q100 116 110 108" fill="none" stroke="#4a2f22" stroke-width="3.5" stroke-linecap="round"/><ellipse class="mouth-o" cx="100" cy="111" rx="7" ry="5" fill="#c2344a"/>
    <path d="M52 50 C70 36 130 36 148 50" fill="none" stroke="#4a3b6b" stroke-width="5"/><circle cx="100" cy="42" r="12" fill="#dfe6ee" stroke="#9fb4cc" stroke-width="4"/>
    <ellipse cx="64" cy="98" rx="8" ry="5" fill="#ff9fb0" opacity=".6"/><ellipse cx="136" cy="98" rx="8" ry="5" fill="#ff9fb0" opacity=".6"/></g></svg>`;
}

// ---- 啾啾：發條小鳥 ----
export function jiujiuSvg() {
  const g = gid('j');
  return `<svg class="char jiujiu" viewBox="0 0 180 180" width="100%" height="100%"><defs>${grad(g, '#c9f0ff', '#6fc6f0', '#3a96d0')}</defs><g class="bob">
    <path d="M70 150 L64 172 M100 150 L106 172" stroke="#ff8a3d" stroke-width="6" stroke-linecap="round"/>
    <g class="key"><rect x="8" y="94" width="26" height="8" rx="4" fill="#c4902a"/><circle cx="6" cy="88" r="9" fill="#f6c453" stroke="#c4902a" stroke-width="3"/><circle cx="6" cy="108" r="9" fill="#f6c453" stroke="#c4902a" stroke-width="3"/></g>
    <path d="M30 100 C24 70 46 54 64 56 C66 30 90 18 112 24 C140 32 150 58 140 80 C160 92 160 130 132 148 C104 162 58 158 40 140 C32 132 30 116 30 100Z" fill="url(#${g})"/>
    <path d="M58 104 C76 90 104 96 112 116 C92 128 70 124 58 104Z" fill="#3a96d0"/>
    <path d="M140 66 L170 72 L142 84Z" fill="#ffb347"/>
    <path d="M104 22 C102 10 112 4 118 12 C114 14 110 18 108 24Z" fill="#ff5d73"/>
    ${eyes(116, 132, 54, 5.5)}
    <ellipse cx="132" cy="76" rx="7" ry="4" fill="#ff9fb0" opacity=".7"/>
    <g class="mouth"></g><path class="mouth-o" d="M142 76 L162 82 L144 90Z" fill="#e8642a"/>
    <ellipse cx="80" cy="50" rx="12" ry="6" fill="#fff" opacity=".6" transform="rotate(-25 80 50)"/></g></svg>`;
}

// ---- 道具：每個都是 100×100 的小圖 ----
const I = {
  // 超市
  icecream: `<path d="M34 46 L50 94 L66 46Z" fill="#e0a05a"/><path d="M40 52 H60 M38 60 H62" stroke="#c98451" stroke-width="3"/><circle cx="50" cy="38" r="18" fill="#ff9fc7"/><circle cx="38" cy="44" r="10" fill="#fff4d6"/><circle cx="62" cy="44" r="10" fill="#bde6a8"/>`,
  meat: `<rect x="12" y="34" width="76" height="46" rx="8" fill="#fff"/><path d="M22 44 C34 36 60 36 76 46 C78 60 66 72 44 70 C28 68 18 58 22 44Z" fill="#ff8a8a"/><path d="M30 52 C42 48 56 50 66 56" stroke="#fff" stroke-width="4" fill="none"/><rect x="12" y="34" width="76" height="46" rx="8" fill="#bfe6ff" opacity=".35"/>`,
  milk: `<path d="M28 30 L50 14 L72 30 V92 H28Z" fill="#fff"/><path d="M28 30 L72 30 L50 14Z" fill="#7fb8ff"/><rect x="34" y="50" width="32" height="22" rx="4" fill="#7fb8ff"/>`,
  yogurt: `<path d="M26 34 H74 L68 90 H32Z" fill="#fff"/><rect x="22" y="26" width="56" height="12" rx="4" fill="#ff9fc7"/><circle cx="50" cy="62" r="11" fill="#ff9fc7"/>`,
  bread: `<path d="M18 50 C14 30 30 20 50 20 C70 20 86 30 82 50 L80 86 H20Z" fill="#e0a05a"/><path d="M24 50 C22 36 34 28 50 28 C66 28 78 36 76 50 L74 80 H26Z" fill="#ffe0a8"/>`,
  cookie: `<rect x="20" y="22" width="60" height="68" rx="8" fill="#ffd23f"/><circle cx="50" cy="56" r="20" fill="#d4955f"/><circle cx="44" cy="50" r="3" fill="#6b3f1f"/><circle cx="56" cy="58" r="3" fill="#6b3f1f"/><circle cx="46" cy="64" r="3" fill="#6b3f1f"/>`,
  apple: `<path d="M50 30 C66 20 88 30 86 56 C84 80 66 92 50 86 C34 92 16 80 14 56 C12 30 34 20 50 30Z" fill="#ff5b5b"/><path d="M50 30 C50 20 54 12 60 8" stroke="#7a4f2e" stroke-width="5" stroke-linecap="round"/><path d="M54 18 C62 10 74 12 76 18 C68 24 58 24 54 18Z" fill="#4fbf6e"/>`,
  cereal: `<rect x="24" y="12" width="52" height="80" rx="6" fill="#ff8a3d"/><circle cx="50" cy="52" r="16" fill="#ffe0a8"/><circle cx="44" cy="48" r="4" fill="#e0a05a"/><circle cx="54" cy="56" r="4" fill="#e0a05a"/><rect x="30" y="20" width="40" height="10" rx="3" fill="#fff"/>`,
  // 錢幣
  coin1: `<circle cx="50" cy="50" r="40" fill="#d8dde3" stroke="#a9b2bc" stroke-width="5"/><text x="50" y="64" text-anchor="middle" font-size="42" font-weight="900" fill="#6b7480" font-family="sans-serif">1</text>`,
  coin5: `<circle cx="50" cy="50" r="42" fill="#e9eef3" stroke="#b8c2cc" stroke-width="5"/><circle cx="50" cy="50" r="32" fill="none" stroke="#c9d1d9" stroke-width="3"/><text x="50" y="64" text-anchor="middle" font-size="42" font-weight="900" fill="#5a6470" font-family="sans-serif">5</text>`,
  coin10: `<circle cx="50" cy="50" r="44" fill="#ffd98a" stroke="#d8a23a" stroke-width="5"/><text x="50" y="63" text-anchor="middle" font-size="36" font-weight="900" fill="#a8741f" font-family="sans-serif">10</text>`,
  coin50: `<circle cx="50" cy="50" r="46" fill="#ffc94d" stroke="#c98b1f" stroke-width="6"/><circle cx="50" cy="50" r="34" fill="none" stroke="#e0a83a" stroke-width="3"/><text x="50" y="63" text-anchor="middle" font-size="34" font-weight="900" fill="#8a5a10" font-family="sans-serif">50</text>`,
  // 垃圾
  bottle: `<rect x="40" y="8" width="20" height="14" rx="3" fill="#3ea8e0"/><path d="M36 22 H64 C70 30 72 40 72 50 V88 C72 92 68 94 64 94 H36 C32 94 28 92 28 88 V50 C28 40 30 30 36 22Z" fill="#bfe9ff" opacity=".9"/><rect x="28" y="50" width="44" height="20" fill="#7fd3ff"/>`,
  can: `<rect x="28" y="16" width="44" height="72" rx="10" fill="#ff5b5b"/><ellipse cx="50" cy="18" rx="22" ry="6" fill="#ddd"/><path d="M34 40 H66" stroke="#fff" stroke-width="6"/><circle cx="50" cy="60" r="8" fill="#fff"/>`,
  paperbox: `<path d="M18 36 L50 22 L84 36 V78 L50 92 L18 78Z" fill="#d9a066"/><path d="M18 36 L50 50 L84 36 M50 50 V92" stroke="#b07a46" stroke-width="3" fill="none"/>`,
  peel: `<path d="M50 30 C40 50 20 60 12 80 C30 74 40 66 50 56 C60 66 70 74 88 80 C80 60 60 50 50 30Z" fill="#ffd23f"/><path d="M46 30 L50 14 L54 30Z" fill="#8a6a2a"/>`,
  core: `<path d="M38 20 C30 30 34 40 40 50 C34 60 30 72 38 84 H62 C70 72 66 60 60 50 C66 40 70 30 62 20Z" fill="#fff4d6"/><path d="M38 20 C44 24 56 24 62 20 M38 84 C44 80 56 80 62 84" stroke="#ff5b5b" stroke-width="8" fill="none"/><path d="M50 20 V8" stroke="#7a4f2e" stroke-width="4"/>`,
  tissue: `<path d="M24 40 C30 28 44 34 50 26 C58 34 70 28 76 40 C84 52 74 62 80 74 C66 80 58 70 50 80 C40 72 30 80 22 72 C28 62 16 52 24 40Z" fill="#fff" stroke="#ddd" stroke-width="3"/>`,
  wrapper: `<path d="M14 40 L30 50 L14 60Z M86 40 L70 50 L86 60Z" fill="#a98bff"/><rect x="28" y="36" width="44" height="28" rx="10" fill="#a98bff"/><path d="M40 40 L60 60 M60 40 L40 60" stroke="#fff" stroke-width="3" opacity=".6"/>`,
  // 垃圾桶
  binTrash: `<path d="M18 30 H82 L74 94 H26Z" fill="#9aa3ad"/><rect x="12" y="20" width="76" height="14" rx="5" fill="#7d8792"/><path d="M38 44 V84 M50 44 V84 M62 44 V84" stroke="#7d8792" stroke-width="4"/>`,
  binRecycle: `<path d="M18 30 H82 L74 94 H26Z" fill="#3ea8e0"/><rect x="12" y="20" width="76" height="14" rx="5" fill="#2a86c0"/><path d="M50 46 L60 62 H40Z M36 72 L44 84 M64 72 L56 84" stroke="#fff" stroke-width="5" fill="#fff" stroke-linejoin="round"/>`,
  binFood: `<path d="M18 30 H82 L74 94 H26Z" fill="#4fbf6e"/><rect x="12" y="20" width="76" height="14" rx="5" fill="#3a9a56"/><path d="M50 50 C40 52 36 62 40 72 C46 80 58 80 62 70 C66 60 60 52 50 50Z" fill="#fff"/><path d="M50 50 C52 44 58 42 62 44" stroke="#fff" stroke-width="4" fill="none"/>`,
  // 袋子（超市）
  bagCold: `<path d="M16 34 H84 L78 92 H22Z" fill="#7fd3ff"/><path d="M34 34 C34 14 66 14 66 34" stroke="#3ea8e0" stroke-width="7" fill="none"/><path d="M50 48 V78 M38 54 L62 72 M62 54 L38 72" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,
  bagNormal: `<path d="M16 34 H84 L78 92 H22Z" fill="#ffb347"/><path d="M34 34 C34 14 66 14 66 34" stroke="#d6862a" stroke-width="7" fill="none"/><circle cx="50" cy="62" r="12" fill="#fff" opacity=".7"/>`,
  // 公園的小動物
  butterfly: `<path d="M50 50 C30 20 6 26 14 48 C20 62 40 58 50 50 C60 58 80 62 86 48 C94 26 70 20 50 50Z" fill="#ff8fbf"/><path d="M50 52 C36 64 22 78 32 86 C42 92 48 72 50 58 C52 72 58 92 68 86 C78 78 64 64 50 52Z" fill="#a98bff"/><rect x="47" y="34" width="6" height="40" rx="3" fill="#4a3b6b"/>`,
  squirrel: `<path d="M64 84 C96 80 98 40 80 26 C72 20 62 26 66 36 C78 42 80 66 62 72Z" fill="#c98b5e"/><ellipse cx="44" cy="66" rx="20" ry="24" fill="#d4955f"/><circle cx="40" cy="36" r="16" fill="#d4955f"/><path d="M30 24 L32 14 L40 22Z" fill="#d4955f"/><circle cx="36" cy="34" r="3" fill="#2b2140"/><ellipse cx="44" cy="72" rx="10" ry="12" fill="#f3d0a8"/>`,
  ladybug: `<ellipse cx="50" cy="56" rx="32" ry="28" fill="#ff5b5b"/><path d="M50 28 V84" stroke="#2b2140" stroke-width="4"/><circle cx="50" cy="30" r="14" fill="#2b2140"/><circle cx="36" cy="50" r="6" fill="#2b2140"/><circle cx="64" cy="50" r="6" fill="#2b2140"/><circle cx="38" cy="70" r="5" fill="#2b2140"/><circle cx="62" cy="70" r="5" fill="#2b2140"/>`,
  frog: `<ellipse cx="50" cy="64" rx="34" ry="24" fill="#6fd17f"/><circle cx="34" cy="38" r="12" fill="#6fd17f"/><circle cx="66" cy="38" r="12" fill="#6fd17f"/><circle cx="34" cy="38" r="5" fill="#2b2140"/><circle cx="66" cy="38" r="5" fill="#2b2140"/><path d="M38 70 Q50 78 62 70" stroke="#3a8a4c" stroke-width="4" fill="none"/>`,
  nest: `<ellipse cx="50" cy="66" rx="38" ry="18" fill="#a8693f"/><ellipse cx="50" cy="58" rx="28" ry="10" fill="#7a4f2e"/><ellipse cx="40" cy="54" rx="8" ry="10" fill="#bfe6ff"/><ellipse cx="56" cy="54" rx="8" ry="10" fill="#bfe6ff"/><path d="M14 66 L28 60 M86 66 L72 60" stroke="#c98b5e" stroke-width="4"/>`,
  // 診所
  thermo: `<rect x="44" y="8" width="12" height="66" rx="6" fill="#fff" stroke="#9fb4cc" stroke-width="3"/><rect x="47" y="34" width="6" height="40" fill="#ff5b5b"/><circle cx="50" cy="80" r="13" fill="#ff5b5b"/>`,
  stetho: `<path d="M30 12 V40 C30 58 70 58 70 40 V12" fill="none" stroke="#4a3b6b" stroke-width="7" stroke-linecap="round"/><path d="M50 56 V72 C50 84 64 86 70 80" fill="none" stroke="#4a3b6b" stroke-width="7"/><circle cx="74" cy="78" r="12" fill="#9fb4cc" stroke="#4a3b6b" stroke-width="4"/>`,
  light: `<rect x="40" y="40" width="20" height="54" rx="8" fill="#4a3b6b"/><path d="M34 22 H66 L60 42 H40Z" fill="#9fb4cc"/><path d="M38 20 L30 4 M50 18 V2 M62 20 L70 4" stroke="#ffd23f" stroke-width="5" stroke-linecap="round"/>`,
  sticker: `<circle cx="50" cy="50" r="42" fill="#fff" stroke="#ffd23f" stroke-width="6"/><polygon points="${starPolygon(50, 52, 26, 12)}" fill="#ffd23f"/>`,
  water: `<path d="M26 20 H74 L68 90 H32Z" fill="#dff4ff" stroke="#9fd6f5" stroke-width="4"/><path d="M30 44 H70 L67 86 H33Z" fill="#7fd3ff"/>`,
  sleep: `<rect x="10" y="50" width="80" height="30" rx="8" fill="#8ec1ff"/><rect x="14" y="38" width="30" height="18" rx="8" fill="#fff"/><text x="70" y="40" font-size="28" font-weight="900" fill="#a98bff" font-family="sans-serif">z</text><text x="56" y="28" font-size="20" font-weight="900" fill="#a98bff" font-family="sans-serif">z</text>`,
  medicine: `<rect x="30" y="30" width="40" height="60" rx="8" fill="#fff" stroke="#9fb4cc" stroke-width="3"/><rect x="34" y="16" width="32" height="16" rx="4" fill="#4cd07d"/><path d="M50 48 V72 M38 60 H62" stroke="#4cd07d" stroke-width="8" stroke-linecap="round"/>`,
  veggie: `<rect x="44" y="56" width="12" height="34" rx="5" fill="#8fd16a"/><circle cx="34" cy="46" r="18" fill="#3fae62"/><circle cx="66" cy="46" r="18" fill="#3fae62"/><circle cx="50" cy="32" r="20" fill="#4fbf6e"/>`,
  phone: `<rect x="28" y="8" width="44" height="84" rx="10" fill="#4a3b6b"/><rect x="33" y="16" width="34" height="62" rx="4" fill="#8fd3ff"/><path d="M58 22 C64 20 68 26 64 30" stroke="#fff" stroke-width="3" fill="none"/><path d="M56 36 A12 12 0 1 0 62 56 A9 9 0 1 1 56 36Z" fill="#ffd23f"/>`,
  candy: `<path d="M10 40 L28 50 L10 60Z M90 40 L72 50 L90 60Z" fill="#ff8fbf"/><circle cx="50" cy="50" r="24" fill="#ff5fae"/><path d="M34 40 C44 50 56 50 66 40 M34 58 C44 64 56 64 66 58" stroke="#fff" stroke-width="5" fill="none"/>`,
  good: `<circle cx="50" cy="50" r="44" fill="#c8f5d6"/><path d="M50 78 C20 58 18 34 34 28 C42 25 48 30 50 36 C52 30 58 25 66 28 C82 34 80 58 50 78Z" fill="#ff5d8f"/>`,
  bad: `<circle cx="50" cy="50" r="44" fill="#ffd6d0"/><path d="M30 30 L70 70 M70 30 L30 70" stroke="#ff5b5b" stroke-width="12" stroke-linecap="round"/>`,
  // 農場
  carrot: `<path d="M30 30 C40 24 56 28 62 36 L40 90 C36 96 30 94 30 88Z" fill="#ff8a3d" transform="rotate(-20 46 60)"/><path d="M60 22 L68 8 M64 28 L80 18 M58 26 L58 8" stroke="#4fbf6e" stroke-width="6" stroke-linecap="round"/>`,
  hay: `<path d="M14 84 C20 50 30 30 50 20 C70 30 80 50 86 84Z" fill="#ffd56a"/><path d="M30 84 L40 36 M50 84 V24 M70 84 L60 36 M22 70 L36 50 M78 70 L64 50" stroke="#e0b030" stroke-width="3"/>`,
  corn: `<path d="M50 10 C66 20 70 50 62 80 H38 C30 50 34 20 50 10Z" fill="#ffd23f"/><path d="M40 30 H60 M38 42 H62 M38 54 H62 M40 66 H60" stroke="#e0a830" stroke-width="3"/><path d="M38 80 C24 70 20 50 26 36 C34 52 38 66 44 80Z M62 80 C76 70 80 50 74 36 C66 52 62 66 56 80Z" fill="#6fd17f"/>`,
  chicken: `<ellipse cx="54" cy="62" rx="32" ry="26" fill="#fff"/><circle cx="34" cy="38" r="16" fill="#fff"/><path d="M28 22 C30 14 36 14 36 22 C38 14 44 16 42 24Z" fill="#ff5b5b"/><path d="M18 38 L8 42 L18 46Z" fill="#ffb347"/><circle cx="30" cy="36" r="3" fill="#2b2140"/><path d="M84 50 C96 44 94 66 84 64Z" fill="#fff"/><path d="M46 86 V96 M62 86 V96" stroke="#ffb347" stroke-width="4"/>`,
  rabbit: `<ellipse cx="50" cy="70" rx="28" ry="22" fill="#fff"/><circle cx="50" cy="44" r="20" fill="#fff"/><ellipse cx="40" cy="16" rx="7" ry="18" fill="#fff"/><ellipse cx="60" cy="16" rx="7" ry="18" fill="#fff"/><ellipse cx="40" cy="16" rx="3" ry="12" fill="#ffc0d4"/><ellipse cx="60" cy="16" rx="3" ry="12" fill="#ffc0d4"/><circle cx="43" cy="42" r="3" fill="#2b2140"/><circle cx="57" cy="42" r="3" fill="#2b2140"/><circle cx="50" cy="50" r="3" fill="#ff8fb8"/>`,
  cow: `<ellipse cx="50" cy="66" rx="36" ry="26" fill="#fff"/><circle cx="34" cy="60" r="9" fill="#4a3b6b"/><circle cx="66" cy="74" r="8" fill="#4a3b6b"/><circle cx="50" cy="36" r="22" fill="#fff"/><ellipse cx="50" cy="46" rx="16" ry="10" fill="#ffc0d4"/><path d="M28 22 L20 12 M72 22 L80 12" stroke="#e0a05a" stroke-width="6" stroke-linecap="round"/><circle cx="42" cy="32" r="3" fill="#2b2140"/><circle cx="58" cy="32" r="3" fill="#2b2140"/>`,
  egg: `<path d="M50 14 C70 14 82 44 82 62 C82 82 68 92 50 92 C32 92 18 82 18 62 C18 44 30 14 50 14Z" fill="#fff8ec" stroke="#e8d6b8" stroke-width="3"/><ellipse cx="40" cy="40" rx="7" ry="10" fill="#fff"/>`,
  shovel: `<rect x="46" y="8" width="8" height="52" rx="4" fill="#c98b5e"/><path d="M34 58 H66 L62 82 C58 92 42 92 38 82Z" fill="#9fb4cc"/>`,
  seeds: `<path d="M24 20 H76 L72 90 H28Z" fill="#e0b27e"/><circle cx="50" cy="50" r="14" fill="#6fd17f"/><circle cx="42" cy="74" r="4" fill="#7a4f2e"/><circle cx="54" cy="78" r="4" fill="#7a4f2e"/><circle cx="62" cy="70" r="4" fill="#7a4f2e"/>`,
  soil: `<ellipse cx="50" cy="64" rx="40" ry="22" fill="#8a5a3a"/><ellipse cx="50" cy="58" rx="30" ry="12" fill="#a8704a"/>`,
  can2: `<path d="M18 40 H62 V86 H18Z" fill="#3ec7e0"/><path d="M62 50 L90 34" stroke="#3ec7e0" stroke-width="8" stroke-linecap="round"/><path d="M30 40 C30 22 50 22 50 40" stroke="#2a86c0" stroke-width="6" fill="none"/><path d="M92 40 l4 8 M96 34 l6 6" stroke="#7fd3ff" stroke-width="3"/>`,
  sun: `<circle cx="50" cy="50" r="22" fill="#ffd23f"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M50 14 V4" stroke="#ffb627" stroke-width="6" stroke-linecap="round" transform="rotate(${a} 50 50)"/>`).join('')}`,
  sprout: `<path d="M50 90 V50" stroke="#4fbf6e" stroke-width="6"/><path d="M50 56 C30 50 24 36 30 28 C44 30 50 42 50 56Z M50 50 C66 44 76 30 70 22 C56 24 50 36 50 50Z" fill="#6fd17f"/><ellipse cx="50" cy="90" rx="30" ry="8" fill="#8a5a3a"/>`,
  cabbage: `<circle cx="50" cy="56" r="34" fill="#a6e38a"/><path d="M50 22 C40 40 40 72 50 90 M50 22 C62 40 62 72 50 90 M22 50 C38 56 62 56 78 50" stroke="#7cc75f" stroke-width="4" fill="none"/>`,
  // 圖示
  cart: `<path d="M8 20 H22 L32 66 H78 L88 32 H26" fill="none" stroke="#4a3b6b" stroke-width="7" stroke-linejoin="round"/><rect x="30" y="36" width="52" height="24" rx="4" fill="#7fd3ff"/><circle cx="38" cy="82" r="8" fill="#4a3b6b"/><circle cx="72" cy="82" r="8" fill="#4a3b6b"/>`,
  list: `<rect x="20" y="8" width="60" height="84" rx="8" fill="#fff" stroke="#c9d3de" stroke-width="3"/><circle cx="34" cy="30" r="6" fill="#ff5b5b"/><circle cx="34" cy="50" r="6" fill="#7fb8ff"/><circle cx="34" cy="70" r="6" fill="#ffd23f"/><path d="M46 30 H70 M46 50 H70 M46 70 H70" stroke="#c9d3de" stroke-width="5" stroke-linecap="round"/>`,
  slide: `<rect x="14" y="20" width="10" height="72" fill="#ff8a3d"/><rect x="34" y="20" width="10" height="72" fill="#ff8a3d"/><path d="M14 30 H44 M14 46 H44 M14 62 H44" stroke="#ff8a3d" stroke-width="5"/><path d="M44 22 C70 30 70 70 92 90 L80 94 C60 76 60 40 40 34Z" fill="#ffd23f"/>`,
  body: `<circle cx="50" cy="20" r="14" fill="#ffd9b8"/><rect x="34" y="36" width="32" height="34" rx="12" fill="#7fd3ff"/><path d="M34 42 L18 62 M66 42 L82 62 M42 70 L38 94 M58 70 L62 94" stroke="#ffd9b8" stroke-width="9" stroke-linecap="round"/>`,
  heal: `<rect x="10" y="10" width="80" height="80" rx="20" fill="#c8f5d6"/><path d="M50 26 V74 M26 50 H74" stroke="#2f9a5a" stroke-width="16" stroke-linecap="round"/>`,
  feed: `<path d="M14 60 C14 40 30 30 50 30 C70 30 86 40 86 60 Z" fill="#e0b27e"/><path d="M20 60 H80 L72 86 H28Z" fill="#c98b5e"/><circle cx="40" cy="44" r="6" fill="#ffd23f"/><circle cx="56" cy="40" r="6" fill="#ff8a3d"/><circle cx="66" cy="50" r="6" fill="#6fd17f"/>`,
  basket: `<path d="M10 44 H90 L80 90 H20Z" fill="#e0a873"/><path d="M26 44 C26 14 74 14 74 44" stroke="#c98b5e" stroke-width="7" fill="none"/><ellipse cx="40" cy="44" rx="10" ry="13" fill="#fff8ec"/><ellipse cx="60" cy="44" rx="10" ry="13" fill="#fff8ec"/>`,
  plant: `<rect x="20" y="70" width="60" height="22" rx="6" fill="#a8704a"/><path d="M50 72 V40" stroke="#4fbf6e" stroke-width="6"/><path d="M50 50 C30 44 24 30 30 22 C44 24 50 36 50 50Z M50 44 C66 38 76 24 70 16 C56 18 50 30 50 44Z" fill="#6fd17f"/>`,
  stop: `<path d="M30 6 H70 L94 30 V70 L70 94 H30 L6 70 V30Z" fill="#ff5b5b" stroke="#fff" stroke-width="5"/><rect x="24" y="44" width="52" height="12" rx="6" fill="#fff"/>`,
  arrow: `<path d="M12 50 H66 M50 26 L78 50 L50 74" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`,
  belt: `<rect x="40" y="10" width="20" height="56" rx="4" fill="#4a3b6b"/><rect x="34" y="62" width="32" height="28" rx="6" fill="#c9d3de" stroke="#9fb4cc" stroke-width="3"/><rect x="44" y="70" width="12" height="12" rx="2" fill="#ff5b5b"/>`,
  flag: `<rect x="20" y="8" width="7" height="86" rx="3" fill="#4a3b6b"/><path d="M27 12 L86 24 L27 40Z" fill="#ff5d73"/>`,
  school2: `<rect x="12" y="52" width="76" height="40" rx="4" fill="#ffe0a8"/><path d="M6 54 L50 30 L94 54Z" fill="#ff5d73"/><rect x="36" y="20" width="28" height="40" fill="#ffd28a"/><path d="M32 22 L50 6 L68 22Z" fill="#ff5d73"/><circle cx="50" cy="38" r="10" fill="#fff" stroke="#4a3b6b" stroke-width="3"/><path d="M50 38 V31 M50 38 L55 40" stroke="#4a3b6b" stroke-width="2.5" stroke-linecap="round"/><rect x="42" y="70" width="16" height="22" rx="3" fill="#a8693f"/><rect x="18" y="62" width="14" height="12" rx="2" fill="#bfe6ff"/><rect x="68" y="62" width="14" height="12" rx="2" fill="#bfe6ff"/>`,
  home2: `<path d="M10 50 L50 14 L90 50" fill="#ff8a3d"/><rect x="22" y="48" width="56" height="42" fill="#fff3e0"/><rect x="42" y="60" width="16" height="30" fill="#c98b5e"/>`,
};
export function itemSvg(k) { return `<svg class="item-svg" viewBox="0 0 100 100" width="100%" height="100%">${I[k]}</svg>`; }
export const ITEM = I;

// 幾個角色的 2D 頭像（面板左邊的小主角用整隻）
export const TOWN_CHARS = { baba: babaSvg, dada: dadaSvg, duoduo: duoduoSvg, baobao: baobaoSvg, jiujiu: jiujiuSvg };
export { strip };
