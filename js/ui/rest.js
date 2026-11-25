// 休息（閃閃的發條轉完了）與睡覺時間（玩具們都睡了）。
// 休息畫面中間是一把慢慢轉的發條鑰匙，金色的圈一點一點補滿，滿了就能再玩。家長可以長按左下的鎖。
import { div, longPress, wait } from '../core/dom.js';
import { speak } from '../core/voice.js';
import { playMusic, sfx } from '../core/audio.js';
import { state } from '../core/store.js';
import { restLeftMs, resting, clearRest, startRest } from '../core/session.js';
import { phase, isDark } from '../core/clock.js';
import { shanSvg, wanSvg } from '../art/stars.js';
import { ICON } from '../art/props.js';
import { backdrop } from './hud.js';

function lockBtn(root, app) {
  const lock = div('lockbtn ui', ICON.lock);
  root.appendChild(lock);
  longPress(lock, 3000, () => app.parent());
}

export async function mountRest(root, app) {
  // 11/25 修正：從關卡時間到跳過來時，休息還沒開始計時（restUntil 是 0），一秒後就「休息好了」；
  // 進休息畫面時如果還沒在休息，從現在開始算休息時間
  if (!resting()) startRest();
  backdrop(root);
  const card = div('rest-card');
  const ch = div('', shanSvg());
  ch.style.cssText = 'position:absolute;left:50%;top:560px;width:210px;height:240px;margin-left:-105px;z-index:22';
  ch.classList.add('sleepy');
  root.append(card, ch);
  lockBtn(root, app);
  playMusic('lullaby');
  const total = state.settings.restMin * 60000;
  let timer = 0;
  const draw = () => {
    const k = Math.min(1, 1 - restLeftMs() / total);
    const a = Math.max(0.0001, k) * Math.PI * 2;
    const x = 180 + 150 * Math.sin(a), y = 180 - 150 * Math.cos(a);
    const arc = k >= 0.999 ? '<circle cx="180" cy="180" r="150" fill="#ffd23f"/>' : `<path d="M180 180 L180 30 A150 150 0 ${a > Math.PI ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)} Z" fill="#ffd23f"/>`;
    card.innerHTML = `<svg viewBox="0 0 360 360"><circle cx="180" cy="180" r="170" fill="#fff" opacity=".9"/><circle cx="180" cy="180" r="150" fill="#f3e6c8"/>${arc}
      <g style="transform-origin:180px 180px;animation:spin 6s linear infinite"><rect x="168" y="120" width="24" height="70" rx="8" fill="#c4902a"/>
      <circle cx="150" cy="110" r="34" fill="#f6c453" stroke="#c4902a" stroke-width="8"/><circle cx="210" cy="110" r="34" fill="#f6c453" stroke="#c4902a" stroke-width="8"/></g></svg>`;
  };
  draw();
  ch.addEventListener('click', () => { sfx('windup'); speak('shan', resting() ? 'rest_wait' : 'rest_ready', { node: ch }); });
  app.onLeave(() => clearInterval(timer));
  await speak('shan', 'rest', { node: ch });
  timer = setInterval(async () => {
    draw();
    if (!resting()) {
      clearInterval(timer);
      clearRest();
      sfx('windup');
      await speak('shan', 'rest_ready', { node: ch });
      app.go('town');
    }
  }, 1000);
}

export async function mountSleep(root, app) {
  backdrop(root);
  root.classList.add('night');
  const ch = div('', wanSvg());
  ch.style.cssText = 'position:absolute;left:50%;top:180px;width:420px;height:525px;margin-left:-210px;z-index:22';
  ch.firstElementChild.classList.add('lit', 'sleepy');
  root.appendChild(ch);
  lockBtn(root, app);
  playMusic('lullaby');
  const say = () => speak('wan', 'sleep', { ...app.nameInfo(), node: ch });
  ch.addEventListener('click', say);
  await wait(400);
  await say();
  // 起床時間到了就回到開場
  const t = setInterval(() => { if (phase(state.settings) !== 'night' && !isDark()) { clearInterval(t); app.go('opening'); } }, 30000);
  app.onLeave(() => clearInterval(t));
}
