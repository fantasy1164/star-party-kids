// 廁所、廚房、客廳用到的美術（SVG）：呱呱、咚咚、家人與陌生人人偶、食物、餐具、浴室用品、圖示。
// 一樣是軟膠玩具質感：漸層打光、白色亮點、不描黑邊。家人只畫成玩具人偶，不畫真實長相。
import { starPolygon } from './stars.js';

let uid = 0;
const id = (p) => `${p}m${++uid}`;
const eyes = (lx, rx, y, rx2 = 7, ry2 = 9.5) => `<g class="eyes">
  <ellipse cx="${lx}" cy="${y}" rx="${rx2}" ry="${ry2}" fill="#2b2140"/><ellipse cx="${rx}" cy="${y}" rx="${rx2}" ry="${ry2}" fill="#2b2140"/>
  <circle cx="${lx + 2.5}" cy="${y - 4}" r="2.8" fill="#fff"/><circle cx="${rx + 2.5}" cy="${y - 4}" r="2.8" fill="#fff"/></g>`;

// ---- 呱呱：橡皮小鴨，戴浴帽 ----
export function guaSvg() {
  const g = id('g');
  return `<svg class="char gua" viewBox="0 0 200 220" width="100%" height="100%">
  <defs><radialGradient id="${g}" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#fff6a8"/><stop offset=".6" stop-color="#ffd84a"/><stop offset="1" stop-color="#f4b223"/></radialGradient></defs>
  <g class="bob">
    <circle cx="30" cy="70" r="9" fill="#bfe9ff" opacity=".8"/><circle cx="20" cy="46" r="6" fill="#bfe9ff" opacity=".7"/><circle cx="178" cy="40" r="7" fill="#bfe9ff" opacity=".7"/>
    <path d="M24 150 C20 112 60 104 92 112 C120 118 150 112 176 104 C190 130 182 196 120 204 C64 210 28 192 24 150Z" fill="url(#${g})"/>
    <path d="M150 118 C176 112 186 96 184 88 C196 104 192 128 168 136Z" fill="#f4b223"/>
    <path d="M60 150 C80 134 112 136 124 152 C108 166 78 168 60 150Z" fill="#ffc933"/>
    <circle cx="96" cy="78" r="50" fill="url(#${g})"/>
    <ellipse cx="74" cy="56" rx="14" ry="8" fill="#fff" opacity=".65" transform="rotate(-30 74 56)"/>
    ${eyes(84, 116, 80)}
    <ellipse cx="70" cy="98" rx="9" ry="5" fill="#ff9f7a" opacity=".6"/>
    <g class="mouth"><path d="M118 92 C140 86 160 92 162 100 C150 108 132 108 118 102Z" fill="#ff8a3d"/></g>
    <g class="mouth-o"><path d="M118 88 C140 80 160 84 162 92 C150 96 132 96 118 94Z" fill="#ff8a3d"/><path d="M118 100 C136 104 152 106 158 112 C146 118 128 116 118 108Z" fill="#e8642a"/></g>
    <path d="M46 52 C50 18 140 14 150 52 C130 44 70 44 46 52Z" fill="#ff8fbf"/>
    <path d="M40 54 C60 42 136 40 156 54" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-dasharray="1 14"/>
    <circle cx="80" cy="34" r="5" fill="#fff" opacity=".8"/><circle cx="112" cy="30" r="5" fill="#fff" opacity=".8"/>
  </g></svg>`;
}

// ---- 咚咚：戴廚師帽、圍裙的小恐龍 ----
export function dongSvg() {
  const g = id('d');
  return `<svg class="char dong" viewBox="0 0 200 250" width="100%" height="100%">
  <defs><radialGradient id="${g}" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#b6f0a8"/><stop offset=".6" stop-color="#6fd17f"/><stop offset="1" stop-color="#3fae62"/></radialGradient></defs>
  <g class="bob">
    <path d="M150 196 C182 196 196 176 190 160 C178 176 164 178 146 176Z" fill="#4fbf6e"/>
    <ellipse cx="74" cy="232" rx="22" ry="11" fill="#3fae62"/><ellipse cx="126" cy="232" rx="22" ry="11" fill="#3fae62"/>
    <ellipse cx="100" cy="172" rx="58" ry="62" fill="url(#${g})"/>
    <path d="M64 136 H136 V214 C120 224 80 224 64 214Z" fill="#fff"/>
    <path d="M90 170 C90 160 100 158 100 166 C100 158 110 160 110 170 C110 178 100 184 100 186 C100 184 90 178 90 170Z" fill="#ff6b8b"/>
    <ellipse cx="42" cy="160" rx="12" ry="20" fill="#5fc775" transform="rotate(30 42 160)"/><ellipse cx="158" cy="160" rx="12" ry="20" fill="#5fc775" transform="rotate(-30 158 160)"/>
    <path d="M58 56 L66 40 L74 54 L84 36 L92 52" fill="#ffd23f"/>
    <circle cx="100" cy="88" r="54" fill="url(#${g})"/>
    <ellipse cx="100" cy="108" rx="34" ry="22" fill="#a7ecb0"/>
    <circle cx="90" cy="102" r="3" fill="#3a8a4c"/><circle cx="110" cy="102" r="3" fill="#3a8a4c"/>
    <ellipse cx="76" cy="62" rx="14" ry="8" fill="#fff" opacity=".55" transform="rotate(-30 76 62)"/>
    ${eyes(80, 120, 80, 8, 10.5)}
    <ellipse cx="62" cy="100" rx="9" ry="5" fill="#ff9fb0" opacity=".6"/><ellipse cx="138" cy="100" rx="9" ry="5" fill="#ff9fb0" opacity=".6"/>
    <path class="mouth" d="M86 116 Q100 128 114 116" fill="none" stroke="#2b5d36" stroke-width="4.5" stroke-linecap="round"/>
    <g class="mouth-o"><ellipse cx="100" cy="120" rx="12" ry="9" fill="#b8324a"/><path d="M92 113 L95 119 L98 113 M102 113 L105 119 L108 113" fill="#fff"/></g>
    <rect x="64" y="22" width="72" height="22" rx="6" fill="#fff"/>
    <circle cx="76" cy="18" r="16" fill="#fff"/><circle cx="100" cy="10" r="19" fill="#fff"/><circle cx="124" cy="18" r="16" fill="#fff"/>
    <rect x="64" y="36" width="72" height="8" fill="#eee"/>
  </g></svg>`;
}

// ---- 人偶（玩具木頭人偶風格）：家人與陌生人 ----
const SKIN = '#ffd9b8';
const PEOPLE = {
  dad: { body: '#4a78c2', hair: 'M34 46 C34 18 86 18 86 46 C80 34 70 30 60 32 C50 30 40 34 34 46Z', hairColor: '#3b2a20', extra: '<rect x="44" y="52" width="13" height="10" rx="4" fill="none" stroke="#3b2a20" stroke-width="3"/><rect x="63" y="52" width="13" height="10" rx="4" fill="none" stroke="#3b2a20" stroke-width="3"/><path d="M57 57 H63" stroke="#3b2a20" stroke-width="3"/>' },
  mom: { body: '#ff8fb8', hair: 'M30 62 C26 16 94 16 90 62 C88 80 96 96 86 100 C84 80 84 60 80 44 C70 36 50 36 40 44 C36 60 36 80 34 100 C24 96 32 80 30 62Z', hairColor: '#4a2f22', extra: '<circle cx="60" cy="16" r="10" fill="#4a2f22"/>' },
  grandma: { body: '#a98bff', hair: 'M32 54 C30 22 90 22 88 54 C84 40 72 34 60 34 C48 34 36 40 32 54Z', hairColor: '#d9d9e3', extra: '<circle cx="60" cy="20" r="13" fill="#d9d9e3"/><circle cx="50" cy="58" r="7.5" fill="none" stroke="#8a6c3a" stroke-width="3"/><circle cx="70" cy="58" r="7.5" fill="none" stroke="#8a6c3a" stroke-width="3"/><path d="M57.5 58 H62.5" stroke="#8a6c3a" stroke-width="3"/>' },
  uncle: { body: '#8a9099', hair: 'M30 46 C34 22 86 22 90 46 L100 48 L100 54 H28Z', hairColor: '#2f6b3a', extra: '<path d="M48 74 C54 70 66 70 72 74" stroke="#5a4636" stroke-width="5" stroke-linecap="round" fill="none"/>' },
  auntie: { body: '#4fb7a8', hair: 'M8 46 C20 38 40 34 60 34 C80 34 100 38 112 46 C100 52 20 52 8 46Z M36 42 C36 14 84 14 84 42Z', hairColor: '#e8c36a', extra: '<path d="M38 42 H82" stroke="#ff7f7f" stroke-width="5"/>' },
  courier: { body: '#c98b5e', hair: 'M32 46 C34 22 86 22 88 46 L104 50 L102 56 H30Z', hairColor: '#7a4f2e', extra: '' },
};
export const FAMILY = ['dad', 'mom', 'grandma'];
export const STRANGERS = ['uncle', 'auntie', 'courier'];
export function personSvg(kind) {
  const p = PEOPLE[kind];
  const box = kind === 'courier' ? '<rect x="30" y="118" width="60" height="44" rx="4" fill="#d9a066"/><path d="M30 132 H90 M60 118 V162" stroke="#b07a46" stroke-width="4"/>' : '';
  return `<svg class="char person ${kind}" viewBox="0 0 120 230" width="100%" height="100%">
  <g class="bob">
    <rect x="34" y="96" width="52" height="118" rx="26" fill="${p.body}"/>
    <ellipse cx="46" cy="214" rx="13" ry="8" fill="#5a4636"/><ellipse cx="74" cy="214" rx="13" ry="8" fill="#5a4636"/>
    <rect x="22" y="104" width="16" height="56" rx="8" fill="${p.body}"/><rect x="82" y="104" width="16" height="56" rx="8" fill="${p.body}"/>
    <circle cx="30" cy="162" r="8" fill="${SKIN}"/><circle cx="90" cy="162" r="8" fill="${SKIN}"/>
    <ellipse cx="48" cy="112" rx="8" ry="5" fill="#fff" opacity=".35"/>
    <circle cx="60" cy="58" r="32" fill="${SKIN}"/>
    <path d="${p.hair}" fill="${p.hairColor}"/>
    <circle cx="49" cy="58" r="4" fill="#2b2140"/><circle cx="71" cy="58" r="4" fill="#2b2140"/>
    <ellipse cx="42" cy="70" rx="6" ry="3.5" fill="#ff9fb0" opacity=".6"/><ellipse cx="78" cy="70" rx="6" ry="3.5" fill="#ff9fb0" opacity=".6"/>
    <path d="M52 74 Q60 80 68 74" fill="none" stroke="#7a3b2e" stroke-width="3" stroke-linecap="round"/>
    ${p.extra}${box}
  </g></svg>`;
}

// ---- 食物（我的餐盤） ----
// 分類：veg 蔬菜、grain 全穀雜糧（主食）、protein 豆魚蛋肉、fruit 水果、junk 零食（不是正餐）
export const FOODS = {
  broccoli: { cat: 'veg', svg: `<rect x="44" y="56" width="12" height="34" rx="5" fill="#8fd16a"/><circle cx="34" cy="46" r="18" fill="#3fae62"/><circle cx="66" cy="46" r="18" fill="#3fae62"/><circle cx="50" cy="32" r="20" fill="#4fbf6e"/><circle cx="44" cy="28" r="5" fill="#8fe39a" opacity=".7"/>` },
  carrot: { cat: 'veg', svg: `<path d="M30 30 C40 24 56 28 62 36 L40 90 C36 96 30 94 30 88Z" fill="#ff8a3d" transform="rotate(-20 46 60)"/><path d="M60 22 L68 8 M64 28 L80 18 M58 26 L58 8" stroke="#4fbf6e" stroke-width="6" stroke-linecap="round"/>` },
  cabbage: { cat: 'veg', svg: `<circle cx="50" cy="56" r="34" fill="#a6e38a"/><path d="M50 22 C40 40 40 72 50 90 M50 22 C62 40 62 72 50 90 M22 50 C38 56 62 56 78 50" stroke="#7cc75f" stroke-width="4" fill="none"/>` },
  rice: { cat: 'grain', svg: `<path d="M14 54 H86 C86 76 70 90 50 90 C30 90 14 76 14 54Z" fill="#ff8fb8"/><g fill="#fffdf4" stroke="#e3d6bd" stroke-width="2.5"><circle cx="40" cy="44" r="10"/><circle cx="56" cy="40" r="12"/><circle cx="66" cy="48" r="9"/><ellipse cx="50" cy="52" rx="36" ry="12"/></g>` },
  bread: { cat: 'grain', svg: `<path d="M18 50 C14 30 30 20 50 20 C70 20 86 30 82 50 L80 86 H20Z" fill="#e0a05a"/><path d="M24 50 C22 36 34 28 50 28 C66 28 78 36 76 50 L74 80 H26Z" fill="#ffe0a8"/>` },
  potato: { cat: 'grain', svg: `<ellipse cx="50" cy="58" rx="38" ry="24" fill="#b05a8a" transform="rotate(-15 50 58)"/><circle cx="36" cy="54" r="3" fill="#7a3a60"/><circle cx="58" cy="62" r="3" fill="#7a3a60"/>` },
  egg: { cat: 'protein', svg: `<path d="M50 14 C70 14 82 44 82 62 C82 82 68 92 50 92 C32 92 18 82 18 62 C18 44 30 14 50 14Z" fill="#fff8ec" stroke="#e8d6b8" stroke-width="3"/><circle cx="50" cy="62" r="14" fill="#ffd23f" opacity=".55"/><ellipse cx="40" cy="40" rx="7" ry="10" fill="#fff" opacity=".9"/>` },
  fish: { cat: 'protein', svg: `<path d="M12 54 C30 30 64 30 78 54 C64 78 30 78 12 54Z" fill="#7fb8ff"/><path d="M76 54 L94 38 L94 70Z" fill="#5a9ae8"/><circle cx="28" cy="50" r="4" fill="#2b2140"/>` },
  tofu: { cat: 'protein', svg: `<path d="M18 40 L50 26 L84 40 L84 74 L52 88 L18 74Z" fill="#fff6dc"/><path d="M18 40 L52 54 L84 40 M52 54 V88" stroke="#e9dcb8" stroke-width="3" fill="none"/>` },
  apple: { cat: 'fruit', svg: `<path d="M50 30 C66 20 88 30 86 56 C84 80 66 92 50 86 C34 92 16 80 14 56 C12 30 34 20 50 30Z" fill="#ff5b5b"/><path d="M50 30 C50 20 54 12 60 8" stroke="#7a4f2e" stroke-width="5" stroke-linecap="round"/><path d="M54 18 C62 10 74 12 76 18 C68 24 58 24 54 18Z" fill="#4fbf6e"/><ellipse cx="34" cy="44" rx="7" ry="10" fill="#fff" opacity=".45"/>` },
  banana: { cat: 'fruit', svg: `<path d="M18 30 C20 70 50 90 84 76 C88 72 86 68 82 68 C56 74 36 60 30 30 C28 24 20 24 18 30Z" fill="#ffd23f"/><path d="M18 30 L14 22" stroke="#7a5a2a" stroke-width="5" stroke-linecap="round"/>` },
  grape: { cat: 'fruit', svg: `${[[38, 36], [58, 36], [48, 52], [30, 52], [66, 52], [40, 68], [58, 68], [49, 84]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#9b6bd6"/>`).join('')}<path d="M48 26 L52 12" stroke="#7a4f2e" stroke-width="4"/>` },
  candy: { cat: 'junk', svg: `<path d="M10 40 L28 50 L10 60Z M90 40 L72 50 L90 60Z" fill="#ff8fbf"/><circle cx="50" cy="50" r="24" fill="#ff5fae"/><path d="M34 40 C44 50 56 50 66 40 M34 58 C44 64 56 64 66 58" stroke="#fff" stroke-width="5" fill="none"/>` },
  cake: { cat: 'junk', svg: `<path d="M16 50 L84 38 L84 84 L16 84Z" fill="#ffd9a8"/><path d="M16 50 L84 38 L84 54 L16 62Z" fill="#ff8fbf"/><circle cx="66" cy="32" r="8" fill="#ff5b5b"/>` },
};
export function foodSvg(k) { return `<svg class="food" viewBox="0 0 100 100" width="100%" height="100%">${FOODS[k].svg}</svg>`; }

// 我的餐盤：一個圓盤分四格（蔬菜最大），每格淡淡的提示圖案
export const PLATE_CATS = {
  veg: { color: '#c8f0b8', hint: 'broccoli' },
  grain: { color: '#fff0b8', hint: 'rice' },
  protein: { color: '#ffd6d0', hint: 'egg' },
  fruit: { color: '#ffe0c0', hint: 'apple' },
};

// ---- 餐具（擺餐具：從上面看下去的樣子；sil=true 畫成桌上的虛線輪廓） ----
const UT = {
  bowl: (c, sil) => `<circle cx="50" cy="50" r="38" fill="${sil ? 'none' : '#fff'}" stroke="${c}" stroke-width="${sil ? 5 : 8}" ${sil ? 'stroke-dasharray="8 7"' : ''}/>${sil ? '' : '<circle cx="50" cy="50" r="24" fill="#bfe6ff"/><circle cx="40" cy="40" r="6" fill="#fff" opacity=".7"/>'}`,
  chopsticks: (c, sil) => `<rect x="34" y="6" width="9" height="88" rx="4" fill="${sil ? 'none' : '#c98b5e'}" stroke="${sil ? c : 'none'}" stroke-width="4" ${sil ? 'stroke-dasharray="7 6"' : ''}/><rect x="56" y="6" width="9" height="88" rx="4" fill="${sil ? 'none' : '#c98b5e'}" stroke="${sil ? c : 'none'}" stroke-width="4" ${sil ? 'stroke-dasharray="7 6"' : ''}/>`,
  spoon: (c, sil) => `<ellipse cx="50" cy="28" rx="16" ry="20" fill="${sil ? 'none' : '#e3e9f0'}" stroke="${sil ? c : 'none'}" stroke-width="4" ${sil ? 'stroke-dasharray="7 6"' : ''}/><rect x="45" y="44" width="10" height="50" rx="5" fill="${sil ? 'none' : '#e3e9f0'}" stroke="${sil ? c : 'none'}" stroke-width="4" ${sil ? 'stroke-dasharray="7 6"' : ''}/>`,
};
export function utensilSvg(k, sil = false) {
  return `<svg class="utensil" viewBox="0 0 100 100" width="100%" height="100%">${UT[k](sil ? '#9a7a5a' : '#ff8fb8', sil)}</svg>`;
}

// ---- 廚房裡的東西（什麼能摸？）：safe 可以拿、danger 不能碰 ----
export const KITCHEN_ITEMS = {
  apple: { safe: true, svg: FOODS.apple.svg },
  bread: { safe: true, svg: FOODS.bread.svg },
  banana: { safe: true, svg: FOODS.banana.svg },
  milk: { safe: true, svg: `<path d="M28 30 L50 14 L72 30 V92 H28Z" fill="#fff"/><path d="M28 30 L72 30 L50 14Z" fill="#7fb8ff"/><rect x="34" y="50" width="32" height="22" rx="4" fill="#7fb8ff"/>` },
  pot: { safe: false, line: 'k_hot_pot', svg: `<g class="steam"><path d="M36 30 C30 22 42 18 36 8 M52 28 C46 20 58 16 52 6 M68 30 C62 22 74 18 68 8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/></g><rect x="12" y="38" width="76" height="50" rx="10" fill="#8a96a8"/><rect x="2" y="44" width="16" height="8" rx="4" fill="#4a3b6b"/><rect x="82" y="44" width="16" height="8" rx="4" fill="#4a3b6b"/><rect x="12" y="38" width="76" height="10" rx="5" fill="#ff7a5a"/>` },
  knife: { safe: false, line: 'k_knife', svg: `<path d="M14 70 L74 22 C84 16 92 22 86 32 L30 82Z" fill="#dfe6ee"/><path d="M14 70 L30 82 L18 94 C10 98 4 92 8 84Z" fill="#4a3b6b"/>` },
  kettle: { safe: false, line: 'k_hot_kettle', svg: `<g class="steam"><path d="M80 26 C74 18 86 14 80 4 M90 30 C84 22 96 18 90 8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g><path d="M20 90 C14 60 24 40 50 40 C76 40 86 60 80 90Z" fill="#ff8a3d"/><path d="M78 56 L94 36" stroke="#ff8a3d" stroke-width="10" stroke-linecap="round"/><path d="M34 40 C34 24 66 24 66 40" stroke="#4a3b6b" stroke-width="6" fill="none"/>` },
};
export function kitchenItemSvg(k) { return `<svg class="kitem" viewBox="0 0 100 100" width="100%" height="100%">${KITCHEN_ITEMS[k].svg}</svg>`; }

// ---- 浴室：危險（找找浴室的危險） ----
export const HAZ = {
  puddle: `<svg viewBox="0 0 160 90" width="100%" height="100%"><path d="M20 46 C10 20 60 8 86 18 C120 6 156 26 140 52 C150 78 100 86 76 74 C40 90 6 74 20 46Z" fill="#3fa9f5" opacity=".9"/><path d="M34 46 C30 30 64 22 84 28 C110 20 136 34 126 50 C132 66 98 70 80 62 C52 72 28 62 34 46Z" fill="#7fcbff"/><ellipse cx="60" cy="36" rx="18" ry="6" fill="#fff" opacity=".85"/><ellipse cx="104" cy="54" rx="10" ry="4" fill="#fff" opacity=".7"/></svg>`,
  soap: `<svg viewBox="0 0 100 70" width="100%" height="100%"><rect x="10" y="20" width="80" height="40" rx="18" fill="#ff9fc7"/><ellipse cx="40" cy="30" rx="14" ry="5" fill="#fff" opacity=".7"/><circle cx="84" cy="14" r="7" fill="#bfe9ff"/><circle cx="72" cy="8" r="4" fill="#bfe9ff"/></svg>`,
  dryer: `<svg viewBox="0 0 120 120" width="100%" height="100%"><path d="M20 30 H80 C96 30 96 60 80 60 H20Z" fill="#a98bff"/><circle cx="34" cy="45" r="10" fill="#7d62e0"/><rect x="50" y="56" width="18" height="40" rx="6" fill="#a98bff"/>
    <path d="M60 96 C60 110 90 112 100 100" stroke="#555" stroke-width="5" fill="none"/><rect x="96" y="92" width="14" height="14" rx="3" fill="#ddd"/><path d="M14 38 L2 34 M14 46 L2 46 M14 54 L2 58" stroke="#ff7a5a" stroke-width="4" stroke-linecap="round"/></svg>`,
};

// ---- 圖示 ----
export const ICON2 = {
  duck: `<svg viewBox="0 0 200 220">${guaSvg().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>`,
  brush: `<svg viewBox="0 0 100 100"><rect x="44" y="34" width="12" height="62" rx="6" fill="#3ec7e0" transform="rotate(30 50 60)"/><rect x="38" y="6" width="24" height="34" rx="6" fill="#fff" stroke="#3ec7e0" stroke-width="4" transform="rotate(30 50 23)"/><path d="M40 10 V36 M48 8 V38 M56 10 V36" stroke="#bfe9ff" stroke-width="4" transform="rotate(30 50 23)"/></svg>`,
  wash: `<svg viewBox="0 0 100 100"><path d="M30 92 C20 70 22 46 34 36 C38 32 44 34 44 40 V54 M44 40 V24 C44 18 54 18 54 24 V52 M54 26 V18 C54 12 64 12 64 18 V52 M64 24 C64 18 74 18 74 24 V60 C74 80 66 92 54 92Z" fill="#ffd9b8" stroke="#c98b5e" stroke-width="3"/><circle cx="24" cy="22" r="9" fill="#bfe9ff"/><circle cx="82" cy="34" r="7" fill="#bfe9ff"/><circle cx="16" cy="44" r="5" fill="#bfe9ff"/></svg>`,
  look: `<svg viewBox="0 0 100 100"><circle cx="42" cy="42" r="26" fill="#bfe9ff" stroke="#4a3b6b" stroke-width="8"/><path d="M62 62 L86 86" stroke="#4a3b6b" stroke-width="12" stroke-linecap="round"/><ellipse cx="34" cy="34" rx="8" ry="5" fill="#fff" opacity=".8"/></svg>`,
  plate: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#fff" stroke="#e5d6c0" stroke-width="4"/><path d="M50 50 L50 8 A42 42 0 0 1 92 50Z" fill="#c8f0b8"/><path d="M50 50 L92 50 A42 42 0 0 1 50 92Z" fill="#fff0b8"/><path d="M50 50 L50 92 A42 42 0 0 1 8 50Z" fill="#ffd6d0"/><path d="M50 50 L8 50 A42 42 0 0 1 50 8Z" fill="#ffe0c0"/></svg>`,
  table: `<svg viewBox="0 0 100 100"><circle cx="40" cy="56" r="26" fill="#fff" stroke="#ff8fb8" stroke-width="6"/><circle cx="40" cy="56" r="14" fill="#bfe6ff"/><rect x="72" y="20" width="7" height="70" rx="3" fill="#c98b5e"/><rect x="84" y="20" width="7" height="70" rx="3" fill="#c98b5e"/></svg>`,
  hot: `<svg viewBox="0 0 100 100"><path d="M36 34 C30 24 42 20 36 8 M52 32 C46 22 58 18 52 6 M68 34 C62 24 74 20 68 8" stroke="#ff7a5a" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="14" y="44" width="72" height="44" rx="10" fill="#8a96a8"/><rect x="14" y="44" width="72" height="10" rx="5" fill="#ff7a5a"/></svg>`,
  tv: `<svg viewBox="0 0 100 100"><rect x="8" y="22" width="84" height="58" rx="10" fill="#4a3b6b"/><rect x="16" y="30" width="68" height="42" rx="5" fill="#8fd3ff"/><path d="M36 92 H64 M40 8 L50 22 L60 8" stroke="#4a3b6b" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="50" cy="52" r="9" fill="#ffd23f"/></svg>`,
  door: `<svg viewBox="0 0 100 100"><rect x="22" y="8" width="56" height="86" rx="6" fill="#c98b5e"/><circle cx="50" cy="32" r="8" fill="#bfe6ff" stroke="#7a4f2e" stroke-width="3"/><circle cx="66" cy="56" r="5" fill="#ffd23f"/></svg>`,
  drum: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="40" rx="38" ry="14" fill="#fff4dc"/><path d="M12 40 V72 C12 88 88 88 88 72 V40" fill="#ff5b5b"/><path d="M12 40 C12 56 88 56 88 40" fill="none" stroke="#c93c3c" stroke-width="4"/><path d="M24 52 L36 82 M50 56 V86 M76 52 L64 82" stroke="#ffd23f" stroke-width="4"/><path d="M70 8 L56 32 M84 14 L64 34" stroke="#c98b5e" stroke-width="6" stroke-linecap="round"/></svg>`,
  remote: `<svg viewBox="0 0 100 100"><rect x="30" y="6" width="40" height="88" rx="14" fill="#4a3b6b"/><circle cx="50" cy="28" r="12" fill="#ff5b5b"/><path d="M50 20 V28 M44 23 A9 9 0 1 0 56 23" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="42" cy="54" r="5" fill="#8fd3ff"/><circle cx="58" cy="54" r="5" fill="#8fd3ff"/><circle cx="42" cy="70" r="5" fill="#8fd3ff"/><circle cx="58" cy="70" r="5" fill="#8fd3ff"/></svg>`,
  openDoor: `<svg viewBox="0 0 100 100"><rect x="18" y="8" width="64" height="86" rx="4" fill="#5a3a20"/><path d="M22 12 L62 20 V88 L22 92Z" fill="#e0a873"/><circle cx="54" cy="56" r="4" fill="#ffd23f"/><path d="M68 50 H96 M86 40 L96 50 L86 60" stroke="#4cd07d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  getAdult: `<svg viewBox="0 0 100 100"><circle cx="64" cy="20" r="12" fill="#ffd9b8"/><rect x="52" y="34" width="24" height="44" rx="12" fill="#4a78c2"/><rect x="54" y="76" width="8" height="18" rx="4" fill="#4a78c2"/><rect x="66" y="76" width="8" height="18" rx="4" fill="#4a78c2"/>
    <circle cx="28" cy="46" r="10" fill="#ffd9b8"/><rect x="18" y="58" width="20" height="28" rx="10" fill="#ff8a3d"/><path d="M36 62 L54 52" stroke="#ffd9b8" stroke-width="7" stroke-linecap="round"/></svg>`,
  faucet: `<svg viewBox="0 0 100 100"><path d="M20 40 H60 C74 40 80 50 80 62 V70 H66 V62 C66 56 62 54 58 54 H20Z" fill="#c9d3de"/><rect x="34" y="24" width="12" height="18" fill="#c9d3de"/><rect x="24" y="18" width="32" height="10" rx="5" fill="#7fb8ff"/></svg>`,
  soap: `<svg viewBox="0 0 100 100"><rect x="26" y="40" width="48" height="54" rx="14" fill="#ff9fc7"/><rect x="44" y="20" width="12" height="22" fill="#fff"/><path d="M44 22 H76 V30 H56" fill="#fff"/><circle cx="50" cy="66" r="10" fill="#fff" opacity=".6"/></svg>`,
  bubbles: `<svg viewBox="0 0 100 100"><circle cx="36" cy="58" r="22" fill="#e6f7ff" stroke="#8fd3ff" stroke-width="4"/><circle cx="66" cy="40" r="16" fill="#e6f7ff" stroke="#8fd3ff" stroke-width="4"/><circle cx="70" cy="76" r="12" fill="#e6f7ff" stroke="#8fd3ff" stroke-width="4"/><circle cx="30" cy="50" r="5" fill="#fff"/></svg>`,
  rinse: `<svg viewBox="0 0 100 100"><path d="M16 22 H56 C68 22 72 30 72 40 V46 H60 V40 C60 36 58 34 54 34 H16Z" fill="#c9d3de"/><path d="M66 52 V92 M58 58 V88 M74 58 V88" stroke="#8fd3ff" stroke-width="6" stroke-linecap="round"/></svg>`,
  towel: `<svg viewBox="0 0 100 100"><rect x="14" y="14" width="72" height="12" rx="6" fill="#c98b5e"/><path d="M22 22 H78 V86 C78 92 72 94 66 90 L50 80 L34 90 C28 94 22 92 22 86Z" fill="#7fd98f"/><path d="M22 70 H78" stroke="#fff" stroke-width="6"/></svg>`,
  skip: `<svg viewBox="0 0 100 100"><path d="M18 22 L50 50 L18 78Z M50 22 L82 50 L50 78Z" fill="#fff"/></svg>`,
  basket: `<svg viewBox="0 0 100 100"><path d="M10 44 H90 L80 90 H20Z" fill="#e0a873"/><path d="M26 44 C26 14 74 14 74 44" stroke="#c98b5e" stroke-width="7" fill="none"/><path d="M18 58 H82 M22 74 H78" stroke="#c98b5e" stroke-width="4"/></svg>`,
  star: `<svg viewBox="0 0 100 100"><polygon points="${starPolygon(50, 54, 40, 18)}" fill="#ffd23f" stroke="#ffd23f" stroke-width="10" stroke-linejoin="round"/></svg>`,
};

// ---- 刷牙：大嘴巴與細菌 ----
export const germSvg = (c = '#7fd36a') => `<svg viewBox="0 0 60 60" width="100%" height="100%"><path d="M30 6 C44 6 54 16 54 30 C54 46 44 54 30 54 C16 54 6 46 6 30 C6 16 16 6 30 6Z" fill="${c}"/>
  <path d="M10 18 L4 10 M50 18 L56 10 M30 6 V0" stroke="${c}" stroke-width="5" stroke-linecap="round"/><circle cx="22" cy="28" r="5" fill="#fff"/><circle cx="38" cy="28" r="5" fill="#fff"/><circle cx="23" cy="29" r="2.5" fill="#2b2140"/><circle cx="39" cy="29" r="2.5" fill="#2b2140"/>
  <path d="M22 40 Q30 46 38 40" stroke="#2b2140" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
export const toothbrushSvg = `<svg viewBox="0 0 220 80" width="100%" height="100%"><rect x="70" y="30" width="150" height="20" rx="10" fill="#3ec7e0"/><rect x="6" y="22" width="80" height="34" rx="10" fill="#fff" stroke="#3ec7e0" stroke-width="5"/>
  <path d="M16 6 V24 M28 6 V24 M40 6 V24 M52 6 V24 M64 6 V24 M76 6 V24" stroke="#bfe9ff" stroke-width="6" stroke-linecap="round"/><ellipse cx="44" cy="8" rx="36" ry="8" fill="#fff" opacity=".9"/></svg>`;

// ---- 嗶嗶：機器人老師。零件分開畫（修理機器人時一個一個裝回去）----
export const BIBI_PARTS = ['wheels', 'armL', 'armR', 'chest', 'head', 'antenna'];
export function bibiSvg(missing = []) {
  const g = id('b');
  return `<svg class="char bibi ${missing.map((m) => `miss-${m}`).join(' ')}" viewBox="0 0 200 250" width="100%" height="100%">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bff0ff"/><stop offset=".6" stop-color="#7fd3f5"/><stop offset="1" stop-color="#4fb3e0"/></linearGradient></defs>
  <g class="bob">
    <g class="part part-wheels"><rect x="44" y="206" width="112" height="34" rx="17" fill="#4a3b6b"/>
      <circle cx="64" cy="223" r="11" fill="#8a7fb0"/><circle cx="100" cy="223" r="11" fill="#8a7fb0"/><circle cx="136" cy="223" r="11" fill="#8a7fb0"/></g>
    <rect class="body-core" x="50" y="118" width="100" height="92" rx="22" fill="url(#${g})"/>
    <g class="part part-chest"><rect x="66" y="134" width="68" height="50" rx="10" fill="#2f3a5a"/>
      <circle cx="84" cy="152" r="7" fill="#ff5d73"/><circle cx="100" cy="152" r="7" fill="#ffd23f"/><circle cx="116" cy="152" r="7" fill="#4cd07d"/>
      <rect x="78" y="166" width="44" height="8" rx="4" fill="#7fd3f5"/></g>
    <g class="part part-armL"><rect x="20" y="126" width="30" height="16" rx="8" fill="#ff9f43"/><rect x="14" y="134" width="16" height="50" rx="8" fill="#ff9f43"/>
      <path d="M10 184 L22 196 L34 184" fill="none" stroke="#4a3b6b" stroke-width="6" stroke-linecap="round"/></g>
    <g class="part part-armR"><rect x="150" y="126" width="30" height="16" rx="8" fill="#ff9f43"/><rect x="170" y="134" width="16" height="50" rx="8" fill="#ff9f43"/>
      <path d="M166 184 L178 196 L190 184" fill="none" stroke="#4a3b6b" stroke-width="6" stroke-linecap="round"/></g>
    <g class="part part-head"><rect x="86" y="104" width="28" height="18" rx="6" fill="#8a7fb0"/>
      <rect x="40" y="34" width="120" height="78" rx="26" fill="url(#${g})"/>
      <rect x="54" y="48" width="92" height="52" rx="16" fill="#2f3a5a"/>
      <g class="eyes"><rect x="72" y="60" width="16" height="20" rx="8" fill="#7ff0c0"/><rect x="112" y="60" width="16" height="20" rx="8" fill="#7ff0c0"/></g>
      <path class="mouth" d="M88 88 Q100 96 112 88" fill="none" stroke="#7ff0c0" stroke-width="4" stroke-linecap="round"/>
      <ellipse class="mouth-o" cx="100" cy="91" rx="9" ry="6" fill="#7ff0c0"/>
      <circle cx="38" cy="72" r="9" fill="#ff9f43"/><circle cx="162" cy="72" r="9" fill="#ff9f43"/>
      <ellipse cx="62" cy="42" rx="12" ry="5" fill="#fff" opacity=".6"/></g>
    <g class="part part-antenna"><rect x="96" y="12" width="8" height="24" rx="4" fill="#8a7fb0"/><circle class="blink" cx="100" cy="12" r="10" fill="#ff5d73"/></g>
  </g></svg>`;
}

// 學堂的圖示
Object.assign(ICON2, {
  school: `<svg viewBox="0 0 100 100"><path d="M10 44 L50 16 L90 44Z" fill="#ff5d73"/><rect x="18" y="44" width="64" height="46" fill="#ffe0a8"/><rect x="42" y="62" width="16" height="28" fill="#a8693f"/>
    <rect x="24" y="52" width="12" height="12" fill="#bfe6ff"/><rect x="64" y="52" width="12" height="12" fill="#bfe6ff"/><circle cx="50" cy="34" r="6" fill="#ffd23f"/></svg>`,
  blocks: `<svg viewBox="0 0 100 100">${[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${10 + c * 21}" y="${22 + r * 21}" width="18" height="18" rx="4" fill="${['#ff8a3d', '#3ec7e0', '#7ee06a'][r]}"/>`).join('')).join('')}</svg>`,
  hop: `<svg viewBox="0 0 100 100"><path d="M14 78 Q30 40 46 70 Q62 40 78 66" fill="none" stroke="#ffd23f" stroke-width="5" stroke-dasharray="6 6" stroke-linecap="round"/>
    ${[[14, 82], [46, 74], [78, 70]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="6" fill="#a98bff"/>`).join('')}<polygon points="${starPolygon(78, 44, 14, 6)}" fill="#ffd23f"/></svg>`,
  song: `<svg viewBox="0 0 100 100">${[0, 1, 2, 3, 4].map((i) => `<rect x="${10 + i * 17}" y="${20 + i * 7}" width="13" height="${62 - i * 9}" rx="5" fill="${['#ff5d73', '#ffb627', '#7ee06a', '#3ec7e0', '#a98bff'][i]}"/>`).join('')}<path d="M18 92 L84 70" stroke="#a9744f" stroke-width="5" stroke-linecap="round"/><circle cx="70" cy="16" r="8" fill="#4a3b6b"/><path d="M78 16 V-4" stroke="#4a3b6b" stroke-width="4"/></svg>`,
  robot: `<svg viewBox="0 0 200 250">${bibiSvg().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>`,
  eye: `<svg viewBox="0 0 100 100"><path d="M8 50 C26 22 74 22 92 50 C74 78 26 78 8 50Z" fill="#fff"/><circle cx="50" cy="50" r="17" fill="#3ea8e0"/><circle cx="50" cy="50" r="8" fill="#2b2140"/><circle cx="56" cy="44" r="4" fill="#fff"/></svg>`,
  sky: `<svg viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" rx="16" fill="#2a2f6b"/>${[[30, 30], [52, 24], [72, 40], [36, 60], [62, 70], [48, 46]].map(([x, y]) => `<polygon points="${starPolygon(x, y, 8, 3.5)}" fill="#ffd23f"/>`).join('')}</svg>`,
});

// 大數字（3D 地板的數字格、卡片）
export function numSvg(n, { color = '#4a3b6b', bg = null, size = 100 } = {}) {
  return `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%">${bg ? `<rect x="3" y="3" width="${size - 6}" height="${size - 6}" rx="${size * 0.22}" fill="${bg}"/>` : ''}
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system,'PingFang TC',sans-serif" font-weight="900" font-size="${String(n).length > 1 ? size * 0.52 : size * 0.62}" fill="${color}">${n}</text></svg>`;
}
