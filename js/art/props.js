// 道具（SVG）：玩具、衣服、圖示。sil=true 時畫成架子上的影子（只有形狀、沒有顏色）。
import { KIDS } from '../config.js';
import { starPolygon } from './stars.js';

const SIL = '#5c4632';
const wrap = (body, sil, cls = '') => `<svg class="prop ${cls} ${sil ? 'sil' : ''}" viewBox="0 0 100 100" width="100%" height="100%">${body}</svg>`;

const TOYS = {
  ball: (c) => `
    <circle cx="50" cy="58" r="38" fill="${c('#ff5b5b')}"/>
    <path d="M50 20 C34 40 34 76 50 96 C66 76 66 40 50 20Z" fill="${c('#ffffff')}"/>
    <path d="M14 46 C30 52 70 52 86 46 C88 52 88 64 86 70 C70 64 30 64 14 70 C12 62 12 52 14 46Z" fill="${c('#3ec7e0')}" opacity=".95"/>
    <ellipse cx="36" cy="38" rx="9" ry="5" fill="${c('#ffffff')}" opacity=".7" transform="rotate(-30 36 38)"/>`,
  blocks: (c) => `
    <rect x="10" y="56" width="38" height="38" rx="7" fill="${c('#ff9f43')}"/><rect x="52" y="56" width="38" height="38" rx="7" fill="${c('#3ec7e0')}"/>
    <rect x="31" y="16" width="38" height="38" rx="7" fill="${c('#7ee06a')}"/>
    <circle cx="29" cy="75" r="8" fill="${c('#ffffff')}" opacity=".8"/><rect x="63" y="67" width="16" height="16" rx="3" fill="${c('#ffffff')}" opacity=".8"/>
    <polygon points="${starPolygon(50, 36, 10, 4.5)}" fill="${c('#ffffff')}" opacity=".85"/>`,
  dino: (c) => `
    <path d="M14 90 C14 66 30 50 52 50 C62 50 66 40 64 28 C62 16 72 8 82 12 C92 16 94 30 86 36 C80 40 78 46 80 54 C86 70 84 90 76 90 L66 90 L64 78 L44 78 L42 90 Z" fill="${c('#5fcf72')}"/>
    <path d="M30 54 L34 42 L40 52 L46 40 L52 50" fill="${c('#ffd23f')}"/>
    <path d="M14 82 C4 82 2 72 8 66 C10 74 14 76 20 76Z" fill="${c('#5fcf72')}"/>
    <circle cx="80" cy="22" r="4" fill="${c('#2b2140')}"/><ellipse cx="54" cy="66" rx="10" ry="6" fill="${c('#a7ecb0')}"/>`,
  teddy: (c) => `
    <circle cx="28" cy="24" r="12" fill="${c('#b5794b')}"/><circle cx="72" cy="24" r="12" fill="${c('#b5794b')}"/>
    <ellipse cx="50" cy="74" rx="30" ry="24" fill="${c('#b5794b')}"/>
    <circle cx="50" cy="40" r="26" fill="${c('#c98b5e')}"/>
    <ellipse cx="50" cy="48" rx="11" ry="8" fill="${c('#f1d2b0')}"/><circle cx="50" cy="45" r="3.5" fill="${c('#2b2140')}"/>
    <circle cx="40" cy="36" r="3.5" fill="${c('#2b2140')}"/><circle cx="60" cy="36" r="3.5" fill="${c('#2b2140')}"/>
    <ellipse cx="50" cy="78" rx="14" ry="11" fill="${c('#f1d2b0')}"/>
    <circle cx="26" cy="92" r="9" fill="${c('#b5794b')}"/><circle cx="74" cy="92" r="9" fill="${c('#b5794b')}"/>`,
  car: (c) => `
    <path d="M8 72 L14 54 C16 48 22 46 28 46 L34 46 L42 30 C44 26 48 24 52 24 L70 24 C74 24 78 26 80 30 L88 46 C94 48 96 52 96 58 L96 72 Z" fill="${c('#ff5b5b')}"/>
    <path d="M46 32 L40 46 L62 46 L62 32 Z M66 32 L66 46 L82 46 L76 32 Z" fill="${c('#bfeaff')}"/>
    <circle cx="28" cy="76" r="13" fill="${c('#2b2140')}"/><circle cx="76" cy="76" r="13" fill="${c('#2b2140')}"/>
    <circle cx="28" cy="76" r="5" fill="${c('#cfcfcf')}"/><circle cx="76" cy="76" r="5" fill="${c('#cfcfcf')}"/>
    <rect x="86" y="56" width="10" height="6" rx="3" fill="${c('#ffe27a')}"/>`,
  rocket: (c) => `
    <path d="M50 6 C66 18 72 38 70 62 L30 62 C28 38 34 18 50 6Z" fill="${c('#f4f4f4')}"/>
    <path d="M50 6 C58 12 63 20 66 28 L34 28 C37 20 42 12 50 6Z" fill="${c('#ff5b5b')}"/>
    <circle cx="50" cy="42" r="9" fill="${c('#3ec7e0')}"/><circle cx="50" cy="42" r="4" fill="${c('#bfeaff')}"/>
    <path d="M30 50 L16 72 L30 70 Z M70 50 L84 72 L70 70 Z" fill="${c('#ff5b5b')}"/>
    <path d="M38 62 L42 80 L50 72 L58 80 L62 62 Z" fill="${c('#ffb347')}"/>
    <path d="M44 78 L50 96 L56 78 Z" fill="${c('#ffd23f')}"/>`,
};
export const TOY_IDS = Object.keys(TOYS);
export function toySvg(toyId, sil = false) {
  const c = (col) => (sil ? SIL : col);
  return wrap(TOYS[toyId](c), sil, `toy toy-${toyId}`);
}

// 衣服。白天：上衣（小孩的代表色）、褲子、襪子；睡覺：睡衣、睡褲、睡帽
const dots = (x0, y0, x1, y1) => {
  let s = '';
  for (let y = y0; y < y1; y += 18) for (let x = x0 + ((y / 18) % 2 ? 9 : 0); x < x1; x += 18) s += `<polygon points="${starPolygon(x, y, 4.5, 2)}" fill="#ffe27a"/>`;
  return s;
};
const CLOTHES = {
  shirt: (k) => `<path d="M30 18 L42 12 C46 20 54 20 58 12 L70 18 L92 34 L82 50 L72 44 L72 92 L28 92 L28 44 L18 50 L8 34 Z" fill="${k.color}"/>
    <polygon points="${starPolygon(50, 58, 12, 5.5)}" fill="#fff" opacity=".9"/>`,
  pants: () => `<path d="M24 10 L76 10 L80 92 L58 92 L50 38 L42 92 L20 92 Z" fill="#4a78c2"/><path d="M24 20 H76" stroke="#355ea3" stroke-width="4"/><path d="M50 12 V36" stroke="#355ea3" stroke-width="3"/>`,
  socks: (k) => `<path d="M14 10 H36 V58 C36 64 40 66 46 68 C52 70 54 76 50 82 C46 88 38 88 28 86 C18 84 14 78 14 70 Z" fill="#fff" stroke="#e5e5e5" stroke-width="2"/>
    <path d="M56 10 H78 V58 C78 64 82 66 88 68 C94 70 96 76 92 82 C88 88 80 88 70 86 C60 84 56 78 56 70 Z" fill="#fff" stroke="#e5e5e5" stroke-width="2"/>
    <rect x="14" y="18" width="22" height="7" fill="${k.color}"/><rect x="56" y="18" width="22" height="7" fill="${k.color}"/>`,
  pjtop: () => `<path d="M30 18 L42 12 C46 20 54 20 58 12 L70 18 L94 60 L82 68 L72 48 L72 92 L28 92 L28 48 L18 68 L6 60 Z" fill="#9fc7ff"/>${dots(34, 30, 70, 90)}`,
  pjpants: () => `<path d="M24 10 L76 10 L80 94 L58 94 L50 38 L42 94 L20 94 Z" fill="#9fc7ff"/><path d="M24 20 H76" stroke="#7aaef0" stroke-width="5"/>${dots(28, 34, 76, 92)}`,
  cap: () => `<path d="M10 80 C18 36 56 16 80 30 C88 36 90 48 88 58 C76 50 60 50 46 56 C32 62 20 70 10 80Z" fill="#5b6fd6"/>
    <path d="M8 82 C30 64 58 56 86 60" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><circle cx="88" cy="60" r="10" fill="#fff"/>
    <polygon points="${starPolygon(52, 40, 6, 2.6)}" fill="#ffe27a"/>`,
};
export const DAY_SET = ['shirt', 'pants', 'socks'];
export const NIGHT_SET = ['pjtop', 'pjpants', 'cap'];
export function clothSvg(item, kidId) {
  return wrap(CLOTHES[item](KIDS[kidId]), false, `cloth cloth-${item}`);
}

// ---- 介面圖示 ----
export const ICON = {
  home: `<svg viewBox="0 0 100 100"><path d="M14 50 L50 18 L86 50" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M26 46 V84 H74 V46" fill="#fff"/><rect x="42" y="60" width="16" height="24" rx="4" fill="#ff8a3d"/></svg>`,
  left: `<svg viewBox="0 0 100 100"><path d="M70 30 A28 28 0 1 0 74 62" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M58 20 L76 30 L60 44 Z" fill="#fff"/></svg>`,
  right: `<svg viewBox="0 0 100 100"><path d="M30 30 A28 28 0 1 1 26 62" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M42 20 L24 30 L40 44 Z" fill="#fff"/></svg>`,
  clap: `<svg viewBox="0 0 100 100"><g fill="#ffd9b8" stroke="#c98b5e" stroke-width="3"><rect x="22" y="30" width="24" height="50" rx="12" transform="rotate(-18 34 55)"/><rect x="54" y="30" width="24" height="50" rx="12" transform="rotate(18 66 55)"/></g>
    <path d="M50 8 V20 M30 14 L36 24 M70 14 L64 24" stroke="#ffd23f" stroke-width="6" stroke-linecap="round"/></svg>`,
  lock: `<svg viewBox="0 0 100 100"><rect x="24" y="44" width="52" height="40" rx="8" fill="#fff" opacity=".85"/><path d="M34 44 V32 A16 16 0 0 1 66 32 V44" fill="none" stroke="#fff" stroke-width="8" opacity=".85"/></svg>`,
  toys: `<svg viewBox="0 0 100 100">${TOYS.blocks((x) => x)}</svg>`,
  dress: `<svg viewBox="0 0 100 100">${CLOTHES.shirt({ color: '#ff8fbf' })}</svg>`,
  ear: `<svg viewBox="0 0 100 100"><path d="M60 14 C40 14 28 28 28 46 C28 58 36 62 38 72 C40 82 46 90 56 90 C66 90 72 82 72 74" fill="none" stroke="#8a6cf0" stroke-width="9" stroke-linecap="round"/>
    <path d="M44 46 C44 36 50 30 58 30 C66 30 72 36 72 46 C72 54 62 56 62 64" fill="none" stroke="#8a6cf0" stroke-width="8" stroke-linecap="round"/>
    <path d="M80 30 C88 38 88 54 80 62" fill="none" stroke="#ffb627" stroke-width="6" stroke-linecap="round"/></svg>`,
  check: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#4cd07d"/><path d="M28 52 L44 68 L74 36" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  hand: `<svg viewBox="0 0 100 100"><g transform="rotate(-25 50 50)"><rect x="40" y="6" width="18" height="52" rx="9" fill="#fff" stroke="#555" stroke-width="3"/>
    <rect x="26" y="44" width="50" height="46" rx="18" fill="#fff" stroke="#555" stroke-width="3"/></g></svg>`,
  cone: `<svg viewBox="0 0 100 100"><path d="M38 14 H62 L80 84 H20 Z" fill="#ff8a3d"/><path d="M33 36 H67 L71 52 H29 Z M26 64 H74 L77 76 H23 Z" fill="#fff"/><rect x="10" y="82" width="80" height="12" rx="4" fill="#d96a24"/></svg>`,
  moon: `<svg viewBox="0 0 100 100"><path d="M64 12 A40 40 0 1 0 88 66 A32 32 0 1 1 64 12Z" fill="#ffe27a"/></svg>`,
};
