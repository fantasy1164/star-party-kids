// 臥室的模型：家具、窗戶、玩具架。回傳之後關卡會用到的東西。
import { createDiorama, shade } from '../engine/diorama.js';
import { shanSvg, wanSvg, starPolygon } from '../art/stars.js';
import { toySvg } from '../art/props.js';
import { sky, hour } from '../core/clock.js';

export const ROOM = { w: 640, d: 600 };

// 玩具架上的六個位子（三層、每層兩個）：架子靠西牆
export const SHELF = { x: 0, y: 350, w: 74, d: 240, h: 214, levels: [10, 82, 154] };
export const SLOTS = [
  { toy: 'teddy', x: 40, y: 410, z: 10 }, { toy: 'ball', x: 40, y: 530, z: 10 },
  { toy: 'blocks', x: 40, y: 410, z: 82 }, { toy: 'dino', x: 40, y: 530, z: 82 },
  { toy: 'car', x: 40, y: 410, z: 154 }, { toy: 'rocket', x: 40, y: 530, z: 154 },
];
// 散在地上的玩具。hidden：從預設的角度看不到，要轉房間才找得到（easy 只藏一個、hard 藏兩個）
export const TOY_SPOTS = {
  teddy: { x: 420, y: 470 },
  ball: { x: 330, y: 540 },
  blocks: { x: 300, y: 400 },
  dino: { x: 520, y: 330 },
  car: { x: 495, y: 26, hidden: 'easy' },      // 衣櫃後面
  rocket: { x: 200, y: 372, hidden: 'hard', easyAt: { x: 560, y: 520 } },   // 玩具箱後面
};

function windowHtml() {
  const s = sky(hour());
  const dark = s.dark;
  return `<svg viewBox="0 0 140 130" width="100%" height="100%" class="win">
    <defs><linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.top}"/><stop offset="1" stop-color="${s.bottom}"/></linearGradient></defs>
    <rect x="6" y="6" width="128" height="112" rx="10" fill="#fff"/>
    <rect x="14" y="14" width="112" height="96" rx="6" fill="url(#wsky)"/>
    ${dark
      ? `<path d="M100 30 A16 16 0 1 0 112 54 A12 12 0 1 1 100 30Z" fill="#fff3b0"/>
         <circle cx="40" cy="34" r="2" fill="#fff"/><circle cx="62" cy="58" r="1.6" fill="#fff"/><circle cx="30" cy="76" r="1.8" fill="#fff"/><circle cx="84" cy="80" r="1.5" fill="#fff"/>`
      : `<circle cx="98" cy="40" r="14" fill="#fff3a0"/><ellipse cx="44" cy="74" rx="22" ry="9" fill="#fff" opacity=".9"/><ellipse cx="56" cy="68" rx="14" ry="9" fill="#fff" opacity=".9"/>`}
    <path d="M70 14 V110 M14 62 H126" stroke="#fff" stroke-width="6"/>
    <g class="curtain-l"><path d="M8 4 H52 C50 40 46 80 36 122 H8 Z" fill="#ff9fb8"/><path d="M18 8 C20 50 16 90 14 120 M32 8 C34 50 30 90 26 120" stroke="#ff7fa0" stroke-width="3" fill="none"/></g>
    <g class="curtain-r"><path d="M132 4 H88 C90 40 94 80 104 122 H132 Z" fill="#ff9fb8"/><path d="M122 8 C120 50 124 90 126 120 M108 8 C106 50 110 90 114 120" stroke="#ff7fa0" stroke-width="3" fill="none"/></g>
    <rect x="0" y="0" width="140" height="8" rx="4" fill="#c98b5e"/>
  </svg>`;
}

export function buildBedroom() {
  const dio = createDiorama({
    w: ROOM.w, d: ROOM.d, wallH: 300, zoom: 0.98, cy: 0.6,
    wall: '#fbe9d9', base: '#b9805a',
    floorCss: 'background: repeating-linear-gradient(90deg, #e9c493 0 62px, #ddb582 62px 64px)',
  });

  // 地毯
  dio.addDecal({ x: 290, y: 290, w: 280, h: 280, z: 0.6, css: 'border-radius:50%;background:radial-gradient(circle,#ffd5e5 0 30%,#bfe6ff 30% 52%,#fff2b8 52% 72%,#c9f2cf 72% 100%)' });

  // 床（床頭靠北牆）
  const bed = {};
  bed.head = dio.addBox({ x: 40, y: 16, w: 210, d: 18, h: 150, color: '#e7a774', cls: 'soft' });
  bed.frame = dio.addBox({ x: 40, y: 34, w: 210, d: 290, h: 40, color: '#d4955f' });
  bed.mat = dio.addBox({ x: 48, y: 38, w: 194, d: 282, h: 26, z: 40, color: '#fffaf2' });
  bed.blanket = dio.addBox({ x: 46, y: 150, w: 198, d: 174, h: 12, z: 66, color: '#8ec1ff', cls: 'soft' });
  bed.pillow = dio.addBox({ x: 72, y: 50, w: 146, d: 64, h: 22, z: 66, color: '#fff3d6', cls: 'soft pillow', tap: 'pillow' });
  // 棉被上的星星
  bed.blanket.faces.t.innerHTML = `<svg viewBox="0 0 198 174" width="100%" height="100%">${[[40, 40], [120, 30], [80, 100], [160, 120], [30, 140]].map(([x, y]) => `<polygon points="${starPolygon(x, y, 12, 5)}" fill="#fff6b0"/>`).join('')}</svg>`;

  // 床頭櫃與晚晚
  dio.addBox({ x: 270, y: 30, w: 72, d: 72, h: 92, color: '#f1c48d' });
  const wan = dio.addSprite({ x: 306, y: 74, z: 92, w: 118, h: 148, html: wanSvg(), cls: 'wan-sp', shadow: 0.55, tap: 'lamp' });

  // 衣櫃（離北牆一點點，後面可以藏玩具）
  const wardrobe = dio.addBox({
    x: 400, y: 70, w: 190, d: 92, h: 272, color: '#f4b8c9',
    faces: {
      s: `<svg viewBox="0 0 190 272" width="100%" height="100%" preserveAspectRatio="none"><rect x="10" y="14" width="80" height="240" rx="10" fill="#ffd0dc"/><rect x="100" y="14" width="80" height="240" rx="10" fill="#ffd0dc"/>
        <circle cx="82" cy="140" r="6" fill="#d4955f"/><circle cx="108" cy="140" r="6" fill="#d4955f"/></svg>`,
    },
  });

  // 玩具架（靠西牆）
  const S = SHELF;
  const wood = '#e0a873';
  dio.addBox({ x: S.x, y: S.y, w: 10, d: S.d, h: S.h, color: shade(wood, 0.9) });
  dio.addBox({ x: S.x, y: S.y, w: S.w, d: 10, h: S.h, color: wood });
  dio.addBox({ x: S.x, y: S.y + S.d - 10, w: S.w, d: 10, h: S.h, color: wood });
  dio.addBox({ x: S.x, y: S.y + 10, w: S.w, d: S.d - 20, h: 10, color: wood });
  dio.addBox({ x: S.x, y: S.y + 10, w: S.w, d: S.d - 20, h: 8, z: 74, color: wood });
  dio.addBox({ x: S.x, y: S.y + 10, w: S.w, d: S.d - 20, h: 8, z: 146, color: wood });
  dio.addBox({ x: S.x, y: S.y, w: S.w, d: S.d, h: 8, z: S.h - 8, color: wood });
  const slots = SLOTS.map((s) => {
    const sp = dio.addSprite({ x: s.x, y: s.y, z: s.z, w: 64, h: 62, html: toySvg(s.toy, true), cls: 'slot', shadow: 0 });
    sp.el.dataset.slot = s.toy;
    return { ...s, sp };
  });

  // 玩具箱（後面可以藏玩具）
  dio.addBox({ x: 170, y: 392, w: 96, d: 76, h: 86, color: '#7fd98f', cls: 'soft',
    faces: { s: `<svg viewBox="0 0 96 86" width="100%" height="100%"><polygon points="${starPolygon(48, 46, 20, 9)}" fill="#fff6b0"/></svg>` } });
  dio.addBox({ x: 166, y: 388, w: 104, d: 84, h: 10, z: 86, color: '#5fc775', cls: 'soft' });

  // 牆上的東西
  const win = dio.wallArt('n', { along: 90, up: 170, w: 150, h: 128, html: windowHtml(), cls: 'window' });
  win.dataset.tap = 'curtain';
  dio.wallArt('n', { along: 285, up: 200, w: 70, h: 70, html: `<svg viewBox="0 0 70 70" class="wallstars">${[[18, 20, 9], [48, 14, 6], [40, 46, 10], [14, 54, 5]].map(([x, y, r]) => `<polygon points="${starPolygon(x, y, r, r * 0.45)}" fill="#fff2a0"/>`).join('')}</svg>` });
  dio.wallArt('w', { along: dio.alongWall('w', 0, 200) - 60, up: 150, w: 120, h: 96, html: `<svg viewBox="0 0 120 96"><rect x="4" y="4" width="112" height="88" rx="8" fill="#fff"/><rect x="12" y="12" width="96" height="72" rx="4" fill="#bfe6ff"/>
    <path d="M12 70 L40 44 L62 64 L80 50 L108 74 V84 H12Z" fill="#7fd98f"/><circle cx="86" cy="30" r="10" fill="#ffd23f"/></svg>` });
  dio.wallArt('e', { along: 240, up: 0, w: 120, h: 230, html: `<svg viewBox="0 0 120 230"><rect x="4" y="4" width="112" height="226" rx="8" fill="#d4955f"/><rect x="16" y="18" width="88" height="90" rx="6" fill="#e7a774"/><rect x="16" y="120" width="88" height="96" rx="6" fill="#e7a774"/><circle cx="96" cy="124" r="7" fill="#ffd23f"/></svg>` });
  dio.wallArt('s', { along: 260, up: 170, w: 110, h: 110, html: `<svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="50" fill="#fff" stroke="#ff8fb0" stroke-width="8"/><path d="M55 55 V24 M55 55 L76 66" stroke="#555" stroke-width="6" stroke-linecap="round"/></svg>` });

  // 閃閃
  const shan = dio.addSprite({ x: 560, y: 420, w: 132, h: 150, html: shanSvg(), cls: 'shan-sp', shadow: 0.7, tap: 'shan' });

  return {
    dio, bed, wan, shan, wardrobe, slots, win,
    refreshWindow() { win.innerHTML = windowHtml(); },
  };
}
