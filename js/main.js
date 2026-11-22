// 進入點：舞台、聲音解鎖、畫面切換。
import { setupStage, stage, div, stageW } from './core/dom.js';
import { state } from './core/store.js';
import { unlock, setMusicVolume } from './core/audio.js';
import { loadVoiceManifest, primeTts, speak, hush } from './core/voice.js';
import { setupTurns, turnsScene } from './core/turns.js';
import { setupHints, resting, setHint, setPlaying } from './core/session.js';
import { phase } from './core/clock.js';
import { PROFILES, NAMES } from './config.js';
import { mount as opening } from './ui/opening.js';
import { mount as house } from './ui/house.js';
import { mount as bedroom } from './scenes/bedroom.js';
import { mount as bath } from './scenes/bathroom.js';
import { mount as kitchen } from './scenes/kitchen.js';
import { mount as living } from './scenes/living.js';
import { mountRest, mountSleep } from './ui/rest.js';
import { openParent } from './ui/parent.js';

const SCREENS = { opening, house, bedroom, bath, kitchen, living, rest: mountRest, sleep: mountSleep };
const ROOMS = ['house', 'bedroom', 'bath', 'kitchen', 'living'];
let current = null;

// 現在應該去哪：睡覺時間 → 睡覺；發條休息中 → 休息；不然回家
function route() {
  if (phase(state.settings) === 'night') return 'sleep';
  if (resting()) return 'rest';
  return 'house';
}

const app = {
  profile: null,
  stageCenter() { return { x: stageW() / 2, y: 450 }; },
  nameInfo() { const id = app.profile?.id || 'yy'; return { name: NAMES[id], who: id }; },
  async choose(id, first, node) {
    app.profile = PROFILES[id];
    setupTurns(app.profile, first);
    await speak('shan', 'welcome', { name: NAMES[id], who: id, node });
    app.go(route());
  },
  parent() { openParent(stage()); },
  go(name) {
    hush();
    setHint(null);
    setPlaying(false);
    if (current) {
      current.dead = true;
      current.leave.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    }
    turnsScene(null);
    if (!app.profile && name !== 'opening') name = 'opening';
    if (ROOMS.includes(name) && route() !== 'house') name = route();
    const root = div(`screen fade-in scr-${name}`);
    stage().innerHTML = '';
    stage().appendChild(root);
    const ctx = Object.create(app);
    ctx.leave = [];
    ctx.dead = false;
    ctx.onLeave = (f) => ctx.leave.push(f);
    ctx.alive = () => !ctx.dead;
    current = ctx;
    Promise.resolve(SCREENS[name](root, ctx)).catch((e) => console.error(e));
  },
};
window.__app = app;   // 測試用

setupStage(document.getElementById('stage'));
setupHints(stage());
setMusicVolume(state.settings.musicVol);
loadVoiceManifest();
// iOS：聲音與語音合成都要在觸碰的當下啟動
document.addEventListener('pointerdown', () => unlock(), { capture: true });
document.addEventListener('pointerup', () => { unlock(); primeTts(); }, { capture: true });
// 不要讓 iPad 把畫面捲動、縮放
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());

app.go('opening');

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
