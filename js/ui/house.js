// 家：明星小鎮裡的一站（之後的小鎮地圖會連到學堂、農場等）。四個房間的立體模型，手指可以轉，點房間就進去。
import { createDiorama } from '../engine/diorama.js';
import { div } from '../core/dom.js';
import { speak } from '../core/voice.js';
import { playMusic, sfx } from '../core/audio.js';
import { state, markSeen, doneToday } from '../core/store.js';
import { roomTint, isDark } from '../core/clock.js';
import { turnsScene } from '../core/turns.js';
import { setHint, setPlaying, mountClock } from '../core/session.js';
import { shanSvg, wanSvg } from '../art/stars.js';
import { guaSvg, dongSvg, ICON2 } from '../art/more.js';
import { ICON } from '../art/props.js';
import { backdrop, homeBtn, rotateBtns, jars, zoomBtns } from './hud.js';
import { babaSvg } from '../art/town.js';
import { ropeNet, streetWindow } from '../art/house.js';

// 後牆上的窗戶（看得到外面的街景）
const streetWindowWall = (night) => `<div style="position:absolute;left:60px;top:24px;width:130px;height:96px">${streetWindow(night)}</div><div style="position:absolute;left:260px;top:24px;width:130px;height:96px">${streetWindow(night)}</div>`;

// 透天厝娃娃屋（11/24）：一樓車庫、二樓客廳＋廚房、三樓臥室＋廁所；Z 字型樓梯從一樓貫穿到三樓，
// 扶手在欄杆那一側，Z 字中間掛著童軍繩編的防墜網。前面的牆剖開，轉到哪個角度，靠近鏡頭的牆都會消失。
const W = 920, D = 760;
const X0 = 200, Y0 = 220, BW = 520, BD = 300, FH = 170;   // 房子的位置與大小、每層樓高
const RX = 600;   // 房間區 X0..RX，樓梯區 RX..X0+BW
const FLOORS = [
  { z: 0, floor: 'repeating-linear-gradient(90deg,#c9ced8 0 60px,#bfc4cf 60px 62px)', wall: '#eef0f4' },
  { z: FH, floor: 'repeating-linear-gradient(90deg,#e9c493 0 40px,#dcb27f 40px 42px)', wall: '#fff3e3' },
  { z: FH * 2, floor: 'repeating-linear-gradient(90deg,#f1cfa2 0 40px,#e6c093 40px 42px)', wall: '#fdf0f6' },
];

export async function mount(root, app) {
  backdrop(root);
  const dio = createDiorama({ gl: true, w: W, d: D, walls: false, tilt: 70, angle: 22, zoom: 0.78, zmin: 0.5, zmax: 1.6, cy: 0.84, skirt: '#a6d987', horizon: 'town',
    floorCss: 'background: radial-gradient(ellipse at 50% 40%, #b8e89a, #a6d987)' });
  root.appendChild(dio.el);
  app.onLeave(() => { setHint(null); setPlaying(false); dio.destroy(); });
  dio.setTint(roomTint());
  if (isDark()) root.classList.add('night');
  // 門口的馬路
  dio.addDecal({ x: 0, y: 600, w: W, h: 110, z: 0.6, css: 'background:#8a8fa0' });
  dio.addDecal({ x: 0, y: 652, w: W, h: 6, z: 0.8, css: 'background:repeating-linear-gradient(90deg,#fff 0 30px,transparent 30px 60px)' });
  dio.addDecal({ x: X0, y: Y0 + BD, w: RX - X0, h: 600 - Y0 - BD, z: 0.7, css: 'background:#d6d9e0' });
  // 每一層：地板、四面朝內的牆（靠近鏡頭的那面自動消失）
  for (const [i, F] of FLOORS.entries()) {
    if (i > 0) dio.addBox({ x: X0, y: Y0, z: F.z - 12, w: BW, d: BD, h: 12, color: '#d9c7ad' });
    dio.addDecal({ x: X0, y: Y0, w: BW, h: BD, z: F.z + 0.5, css: `background:${F.floor}` });
    const H = FH - 12, c = F.wall;
    dio.addPanel({ x1: X0, y1: Y0, x2: X0 + BW, y2: Y0, z: F.z, h: H, css: c, html: i ? streetWindowWall(isDark()) : '' });
    dio.addPanel({ x1: X0 + BW, y1: Y0, x2: X0 + BW, y2: Y0 + BD, z: F.z, h: H, css: c });
    dio.addPanel({ x1: X0 + BW, y1: Y0 + BD, x2: X0, y2: Y0 + BD, z: F.z, h: H, css: c });
    dio.addPanel({ x1: X0, y1: Y0 + BD, x2: X0, y2: Y0, z: F.z, h: H, css: c });
    // 房間中間的矮隔間（二樓、三樓）
    if (i > 0) dio.addPanel({ x1: 400, y1: Y0, x2: 400, y2: Y0 + BD - 80, z: F.z, h: 70, css: '#f3dcc0', both: true });
  }
  // 屋頂：像娃娃屋一樣打開（看得到三樓）；只在樓梯上方留一小塊屋頂和水塔
  dio.addBox({ x: RX, y: Y0, z: FH * 3 - 12, w: X0 + BW - RX, d: BD, h: 12, color: '#d9c7ad', tap: 'stairs' });
  dio.addBox({ x: RX, y: Y0, z: FH * 3, w: X0 + BW - RX, d: 8, h: 26, color: '#ff8a3d' });
  dio.addSprite({ x: RX + 60, y: Y0 + 150, z: FH * 3, w: 80, h: 96, shadow: 0, html: `<svg viewBox="0 0 44 54"><rect x="6" y="34" width="4" height="20" fill="#8a8fa0"/><rect x="34" y="34" width="4" height="20" fill="#8a8fa0"/><rect x="2" y="6" width="40" height="30" rx="8" fill="#3ea8e0"/><ellipse cx="22" cy="7" rx="20" ry="5" fill="#7fd3ff"/></svg>` });
  // Z 字型樓梯：每層兩段，第一段往北爬到平台，第二段往南爬到上一層；扶手在中間（欄杆側），中間掛防墜網
  const N = 8, rise = FH / 2 / N, run = (BD - 110) / N;
  for (const F of FLOORS.slice(0, 2)) {
    for (let k = 0; k < N; k++) {
      dio.addBox({ x: RX + 10, y: Y0 + BD - 20 - (k + 1) * run, z: F.z + k * rise, w: 48, d: run, h: rise, color: '#c98b5e', tap: 'stairs' });
      dio.addBox({ x: RX + 62, y: Y0 + 90 + k * run, z: F.z + FH / 2 + k * rise, w: 48, d: run, h: rise, color: '#b9784e', tap: 'stairs' });
    }
    dio.addBox({ x: RX + 10, y: Y0 + 10, z: F.z + FH / 2 - 8, w: 100, d: 80, h: 8, color: '#d9a272', tap: 'stairs' });
    // 欄杆側：扶手＋童軍繩防墜網（兩面都看得到）
    const L = BD - 110;
    const rail = `<svg viewBox="0 0 ${L} ${FH}" width="100%" height="100%" preserveAspectRatio="none"><g opacity=".9">${ropeNet(L, FH).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
      <path d="M0 ${FH - 34} L${L} ${FH / 2 - 34}" stroke="#8a5a3a" stroke-width="7" stroke-linecap="round"/><path d="M${L} ${FH / 2 - 34} L0 ${-34 + 4}" stroke="#8a5a3a" stroke-width="7" stroke-linecap="round"/></svg>`;
    dio.addPanel({ x1: RX + 60, y1: Y0 + BD - 20, x2: RX + 60, y2: Y0 + 90, z: F.z, h: FH, css: 'transparent', html: rail, both: true, cls: 'ropenet', tap: 'stairs' });
  }
  // ---- 一樓：車庫（叭叭停在這裡，點它就出門）----
  const car = dio.addSprite({ x: 300, y: 400, z: 0, w: 150, h: 120, html: babaSvg(), shadow: 0.6, tap: 'car', live: true });
  dio.addSprite({ x: 470, y: 330, z: 0, w: 90, h: 80, shadow: 0.4, html: `<svg viewBox="0 0 100 80"><circle cx="22" cy="58" r="16" fill="none" stroke="#3a3550" stroke-width="5"/><circle cx="78" cy="58" r="16" fill="none" stroke="#3a3550" stroke-width="5"/><path d="M22 58 L40 32 L64 32 L78 58 M40 32 L50 58 L64 32" stroke="#2f7fe0" stroke-width="5" fill="none"/></svg>` });
  dio.addBox({ x: 520, y: 240, w: 70, d: 40, h: 90, color: '#c98b5e' });
  dio.addBox({ x: X0, y: Y0 + BD - 6, z: FH - 40, w: RX - X0, d: 6, h: 26, color: '#9aa3b5' });   // 捲起來的鐵捲門
  // ---- 二樓：客廳（沙發、電視）＋廚房（流理台、冰箱、餐桌）----
  const z2 = FH;
  dio.addBox({ x: 220, y: 400, z: z2, w: 150, d: 60, h: 40, color: '#a98bff', cls: 'soft', tap: 'living' });
  dio.addBox({ x: 220, y: 440, z: z2, w: 150, d: 20, h: 70, color: '#9478f0', cls: 'soft', tap: 'living' });
  dio.addBox({ x: 230, y: 236, z: z2, w: 130, d: 30, h: 50, color: '#d4955f', tap: 'living' });
  dio.addBox({ x: 250, y: 228, z: z2 + 50, w: 90, d: 10, h: 54, color: '#3a3550', tap: 'living' });
  dio.addBox({ x: 420, y: 236, z: z2, w: 150, d: 50, h: 64, color: '#ffd9a8', tap: 'kitchen' });
  dio.addBox({ x: 540, y: 300, z: z2, w: 50, d: 60, h: 130, color: '#e8f4ff', tap: 'kitchen' });
  dio.addBox({ x: 430, y: 360, z: z2, w: 100, d: 80, h: 50, color: '#e0b080', tap: 'kitchen' });
  dio.addSprite({ x: 500, y: 470, z: z2, w: 80, h: 100, html: dongSvg(), shadow: 0.5, tap: 'kitchen' });
  // ---- 三樓：臥室（床、晚晚）＋廁所（浴缸、呱呱）----
  const z3 = FH * 2;
  dio.addBox({ x: 220, y: 236, z: z3, w: 120, d: 150, h: 34, color: '#fffaf2', tap: 'bedroom' });
  dio.addBox({ x: 218, y: 320, z: z3 + 34, w: 124, d: 66, h: 8, color: '#8ec1ff', tap: 'bedroom' });
  const wan = dio.addSprite({ x: 360, y: 300, z: z3, w: 70, h: 88, html: wanSvg(), shadow: 0.5, tap: 'bedroom' });
  dio.addBox({ x: 430, y: 236, z: z3, w: 150, d: 70, h: 44, color: '#ffffff', cls: 'soft', tap: 'bath' });
  dio.addBox({ x: 540, y: 400, z: z3, w: 44, d: 50, h: 46, color: '#e9f6fb', tap: 'bath' });
  dio.addSprite({ x: 500, y: 280, z: z3 + 44, w: 60, h: 66, html: guaSvg(), shadow: 0, tap: 'bath' });
  // 兩旁的鄰居透天（矮一點，不擋住）
  dio.addBox({ x: 20, y: Y0 + 20, w: 150, d: BD - 20, h: 300, color: '#e6f4e8' });
  dio.addBox({ x: 760, y: Y0 + 20, w: 140, d: BD - 20, h: 330, color: '#e6eeff' });
  dio.seal();
  const ROOM_MARK = {
    living: { x: 300, y: 340, z: z2 + 120, icon: ICON2.tv, games: ['tv', 'door', 'stage'] },
    kitchen: { x: 500, y: 340, z: z2 + 120, icon: ICON2.plate, games: ['plate', 'table', 'safe', 'dumpling'] },
    bedroom: { x: 300, y: 340, z: z3 + 120, icon: ICON.moon, games: ['toys', 'dress', 'simon'] },
    bath: { x: 500, y: 340, z: z3 + 120, icon: ICON2.brush, games: ['brush', 'wash', 'haz'] },
  };
  const markers = {};
  for (const [id, m] of Object.entries(ROOM_MARK)) {
    markers[id] = dio.addSprite({ x: m.x, y: m.y, z: m.z, w: 96, h: 96, html: `<div class="inner">${m.icon}</div>`, cls: 'marker', shadow: 0, tap: id });
    if (m.games.every((g) => doneToday(app.profile.members, `${id}.${g}`))) markers[id].el.classList.add('done');
  }
  const firstOpen = Object.keys(ROOM_MARK).find((id) => !markers[id].el.classList.contains('done')) || 'bedroom';
  const marker = markers[firstOpen];
  const shan = dio.addSprite({ x: 660, y: 590, w: 120, h: 136, html: shanSvg(), shadow: 0.7, tap: 'shan' });

  let going = false;
  homeBtn(root, () => app.go('town'));
  jars(root, app.profile.members);
  mountClock(root);
  const rot = rotateBtns(root, dio);
  zoomBtns(root, dio);
  turnsScene(root);
  setPlaying(true);
  playMusic(isDark() ? 'lullaby' : 'house');
  setHint(() => marker.el);

  const GO = { bedroom: 'house_bedroom', bath: 'house_bath', kitchen: 'house_kitchen', living: 'house_living' };
  dio.onTap(async (name) => {
    if (GO[name]) {
      if (going) return;
      going = true;
      sfx('tap');
      markers[name].el.classList.add('hop');
      setPlaying(false);
      await speak('shan', GO[name], { node: shan.el });
      if (app.alive()) app.go(name);
    } else if (name === 'car') {
      if (going) return;
      going = true;
      sfx('boing');
      car.el.classList.add('hop');
      setPlaying(false);
      await speak('shan', 'house_car', { node: shan.el });
      if (app.alive()) app.go('town');
    } else if (name === 'stairs') {
      sfx('tap');
      speak('shan', 'house_stairs', { node: shan.el });
    } else if (name === 'shan') {
      sfx('boing');
      shan.el.classList.remove('hop'); void shan.el.offsetWidth; shan.el.classList.add('hop');
      speak('shan', 'house_pick', { node: shan.el });
    }
  });

  if (!state.seen.houseSpin) {
    rot.pulse(true);
    await speak('shan', 'house_spin', { node: shan.el });
    setTimeout(() => rot.pulse(false), 4000);
    markSeen('houseSpin');
  }
  if (app.alive()) speak('shan', 'house_pick', { node: shan.el });
}
