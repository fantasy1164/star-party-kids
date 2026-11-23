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
import { backdrop, homeBtn, rotateBtns, jars } from './hud.js';

const W = 900, D = 760;
const ROOMS = {
  bedroom: { x: 0, y: 0, w: 450, d: 380, open: true, floor: 'repeating-linear-gradient(90deg, #f1cfa2 0 44px, #e6c093 44px 46px)' },
  bath: { x: 450, y: 0, w: 450, d: 380, floor: 'repeating-conic-gradient(#d9f1fb 0 25%, #f4fbff 0 50%) 0 0/44px 44px' },
  living: { x: 0, y: 380, w: 450, d: 380, floor: 'repeating-linear-gradient(0deg, #e9c493 0 44px, #dcb27f 44px 46px)' },
  kitchen: { x: 450, y: 380, w: 450, d: 380, floor: 'repeating-conic-gradient(#fff 0 25%, #ffe0e6 0 50%) 0 0/50px 50px' },
};

export async function mount(root, app) {
  backdrop(root);
  const dio = createDiorama({ w: W, d: D, wallH: 190, zoom: 0.76, cy: 0.6, wall: '#fff3e3', base: '#a9744f', floorCss: 'background:#e9d2b0' });
  root.appendChild(dio.el);
  app.onLeave(() => { setHint(null); setPlaying(false); dio.destroy(); });
  dio.setTint(roomTint());
  if (isDark()) root.classList.add('night');

  for (const [id, r] of Object.entries(ROOMS)) {
    dio.addDecal({ x: r.x + 4, y: r.y + 4, w: r.w - 8, h: r.d - 8, z: 0.8, css: `background:${r.floor};border-radius:6px`, cls: 'room-floor' }).dataset.tap = id;
  }
  // 隔間牆（矮矮的，中間留門）
  const wall = '#f3dcc0';
  dio.addBox({ x: 444, y: 0, w: 12, d: 140, h: 80, color: wall });
  dio.addBox({ x: 444, y: 250, w: 12, d: 260, h: 80, color: wall });
  dio.addBox({ x: 444, y: 620, w: 12, d: 140, h: 80, color: wall });
  dio.addBox({ x: 0, y: 374, w: 160, d: 12, h: 80, color: wall });
  dio.addBox({ x: 280, y: 374, w: 330, d: 12, h: 80, color: wall });
  dio.addBox({ x: 740, y: 374, w: 160, d: 12, h: 80, color: wall });

  // 臥室：小床、床頭櫃上的晚晚
  dio.addBox({ x: 30, y: 20, w: 150, d: 16, h: 90, color: '#e7a774', tap: 'bedroom' });
  dio.addBox({ x: 30, y: 36, w: 150, d: 200, h: 44, color: '#fffaf2', tap: 'bedroom' });
  dio.addBox({ x: 28, y: 120, w: 154, d: 116, h: 8, z: 44, color: '#8ec1ff', tap: 'bedroom' });
  dio.addBox({ x: 200, y: 24, w: 56, d: 56, h: 60, color: '#f1c48d', tap: 'bedroom' });
  dio.addBox({ x: 300, y: 40, w: 120, d: 60, h: 170, color: '#f4b8c9', tap: 'bedroom' });
  const wan = dio.addSprite({ x: 228, y: 56, z: 60, w: 84, h: 105, html: wanSvg(), shadow: 0.5, tap: 'bedroom' });
  // 廁所：浴缸、洗手台、呱呱
  dio.addBox({ x: 600, y: 30, w: 270, d: 120, h: 60, color: '#ffffff', cls: 'soft', tap: 'bath' });
  dio.addBox({ x: 480, y: 30, w: 70, d: 70, h: 80, color: '#e9f6fb', tap: 'bath' });
  dio.addSprite({ x: 740, y: 100, z: 56, w: 70, h: 78, html: guaSvg(), shadow: 0, tap: 'bath' });
  // 客廳：沙發、電視櫃（閃閃在這裡）
  dio.addBox({ x: 40, y: 600, w: 250, d: 100, h: 50, color: '#a98bff', cls: 'soft', tap: 'living' });
  dio.addBox({ x: 40, y: 660, w: 250, d: 40, h: 100, color: '#9478f0', cls: 'soft', tap: 'living' });
  dio.addBox({ x: 40, y: 420, w: 180, d: 50, h: 60, color: '#d4955f', tap: 'living' });
  // 廚房：餐桌、冰箱、咚咚
  dio.addBox({ x: 600, y: 520, w: 160, d: 120, h: 70, color: '#ffd9a8', tap: 'kitchen' });
  dio.addBox({ x: 820, y: 400, w: 70, d: 80, h: 190, color: '#e8f4ff', tap: 'kitchen' });
  dio.addSprite({ x: 560, y: 600, w: 96, h: 120, html: dongSvg(), shadow: 0.6, tap: 'kitchen' });
  // 每個房間上面漂著一個標記；今天這個房間三件事都做完，標記變綠
  const ROOM_MARK = {
    bedroom: { x: 230, y: 230, icon: ICON.moon, games: ['toys', 'dress', 'simon'] },
    bath: { x: 680, y: 240, icon: ICON2.brush, games: ['brush', 'wash', 'haz'] },
    living: { x: 330, y: 470, icon: ICON2.tv, games: ['tv', 'door', 'stage'] },
    kitchen: { x: 680, y: 660, icon: ICON2.plate, games: ['plate', 'table', 'safe'] },
  };
  const markers = {};
  for (const [id, m] of Object.entries(ROOM_MARK)) {
    markers[id] = dio.addSprite({ x: m.x, y: m.y, z: 130, w: 104, h: 104, html: `<div class="inner">${m.icon}</div>`, cls: 'marker', shadow: 0, tap: id });
    if (m.games.every((g) => doneToday(app.profile.members, `${id}.${g}`))) markers[id].el.classList.add('done');
  }
  const firstOpen = Object.keys(ROOM_MARK).find((id) => !markers[id].el.classList.contains('done')) || 'bedroom';
  const marker = markers[firstOpen];
  const shan = dio.addSprite({ x: 330, y: 560, w: 130, h: 148, html: shanSvg(), shadow: 0.7, tap: 'shan' });

  let going = false;
  homeBtn(root, () => app.go('town'));
  jars(root, app.profile.members);
  mountClock(root);
  const rot = rotateBtns(root, dio);
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
