// 家長頁（在開場或休息、睡覺畫面長按左下角的鎖 3 秒）。這裡可以有文字。
import { div } from '../core/dom.js';
import { state, save, clearAll } from '../core/store.js';
import { setMusicVolume, setQuietMode } from '../core/audio.js';
import { clearRest } from '../core/session.js';
import { TEST_KEY, testSettings, dateKey } from '../core/clock.js';
import { KIDS } from '../config.js';
import * as M from '../core/mult.js';

export function openParent(root, onClose) {
  const s = state.settings;
  const test = testSettings();
  const p = div('parent');
  const days = [];
  const d = new Date();
  for (let i = 0; i < 7; i++) { days.push(dateKey(d)); d.setDate(d.getDate() - 1); }
  const NAMES = {
    'bedroom.toys': '收玩具', 'bedroom.dress': '換衣服', 'bedroom.simon': '晚晚說',
    'bath.brush': '刷牙', 'bath.wash': '洗手', 'bath.haz': '找危險',
    'kitchen.plate': '我的餐盤', 'kitchen.table': '擺餐具', 'kitchen.safe': '什麼能摸',
    'living.tv': '關電視', 'living.door': '誰按電鈴', 'living.stage': '明星舞台',
    'school.robot': '修理機器人', 'school.blocks': '積木排排站', 'school.hop': '跳跳口訣',
  };
  // 九九乘法：每一題的熟練度（顏色）與答錯次數
  const BOXC = ['#ffd0d0', '#ffe3c4', '#fff2b8', '#c8f5d6', '#9fe6b8', '#6fd99a'];
  const multTable = `<table class="mult"><tr><th></th>${[2, 3, 4, 5, 6, 7, 8, 9].map((b) => `<th>×${b}</th>`).join('')}</tr>
    ${M.table().map((row, i) => `<tr><th>${i + 2}</th>${row.map((f) => `<td style="background:${BOXC[f.box]}">${f.bad ? `✕${f.bad}` : ''}</td>`).join('')}</tr>`).join('')}</table>`;
  const row = (id, day) => {
    const k = state.kids[id];
    const done = k.done[day] || {};
    return `<td>${k.stars[day] || 0}</td><td>${Object.entries(done).map(([g, n]) => `${NAMES[g] || g}×${n}`).join('、') || '－'}</td>`;
  };
  p.innerHTML = `
    <button class="close">關閉</button>
    <h2>家長設定</h2>
    <h3>這一週</h3>
    <table><tr><th>日期</th><th>${KIDS.yy.name} 星星</th><th>完成</th><th>${KIDS.kk.name} 星星</th><th>完成</th></tr>
      ${days.map((day) => `<tr><td>${day.slice(5)}</td>${row('yy', day)}${row('kk', day)}</tr>`).join('')}</table>
    <h3>九九乘法（岳岳）</h3>
    <p class="note">正在練：${M.focusRow()} 的乘法　已學會 ${M.masteredCount()}／81 題　${M.checked() ? '' : '（還沒做程度檢查：在學堂玩「修理機器人」會先做）'}<br>
      顏色越綠越熟（第 3 盒以上算學會，星空會亮）；✕ 是答錯次數。</p>
    ${multTable}
    <div class="row"><button id="recheck" class="gray">下次重新做程度檢查</button></div>
    <h3>遊玩時間</h3>
    <div class="row"><label>每次可以玩（分鐘）</label><select id="sessionMin">${[5, 10, 12, 15, 20, 25, 30].map((v) => `<option ${v === s.sessionMin ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
    <div class="row"><label>玩完休息（分鐘）</label><select id="restMin">${[1, 10, 20, 30, 45, 60, 90, 120].map((v) => `<option ${v === s.restMin ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
    <div class="row"><label>睡覺時間</label><select id="bedtime">${[19, 19.5, 20, 20.5, 21, 21.5, 22].map((v) => `<option value="${v}" ${v === s.bedtime ? 'selected' : ''}>${Math.floor(v)}:${v % 1 ? '30' : '00'}</option>`).join('')}</select>
      <label style="min-width:auto">起床</label><select id="wake">${[5, 5.5, 6, 6.5, 7].map((v) => `<option value="${v}" ${v === s.wake ? 'selected' : ''}>${Math.floor(v)}:${v % 1 ? '30' : '00'}</option>`).join('')}</select></div>
    <div class="row"><button id="endRest">現在結束休息</button></div>
    <h3>聲音</h3>
    <div class="row"><label>音樂大小</label><select id="musicVol">${[['low', '小'], ['mid', '中'], ['high', '大']].map(([v, t]) => `<option value="${v}" ${v === s.musicVol ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    <div class="row"><label><input type="checkbox" id="quiet" ${s.quiet ? 'checked' : ''}> 安靜模式（關掉背景音樂和裝飾音效，只留角色說話和對錯的聲音）</label></div>
    <p class="note">要動腦的題目出現時，音樂會自動淡到幾乎聽不到；一起玩時，等待的人按拍手會等答完才出聲。</p>
    <h3>開發測試</h3>
    <div class="row"><label>假裝現在幾點</label><input id="thour" type="number" step="0.5" min="0" max="23.5" placeholder="例如 20.5" value="${test.hour ?? ''}"><button id="applyTest">套用並重新開啟</button><button id="clearTest" class="gray">回到真實時間</button></div>
    <div class="row"><label><input type="checkbox" id="nolimit" ${s.nolimit ? 'checked' : ''}> 不限制每次遊玩時間</label></div>
    <div class="row"><button id="perf" class="gray">立體引擎效能測試</button></div>
    <div class="row"><button id="wipe" class="gray">清除全部進度</button></div>
    <p class="note">網址參數：?hour=20.5 假裝幾點、?notts=1 不出聲、?debug=1 顯示語音事件。</p>`;
  const $ = (id) => p.querySelector(`#${id}`);
  const num = (id) => parseFloat($(id).value);
  const commit = () => {
    s.sessionMin = num('sessionMin'); s.restMin = num('restMin'); s.bedtime = num('bedtime'); s.wake = num('wake');
    s.musicVol = $('musicVol').value; s.nolimit = $('nolimit').checked; s.quiet = $('quiet').checked;
    setMusicVolume(s.musicVol);
    setQuietMode(s.quiet);
    save();
  };
  p.querySelectorAll('select, input[type=checkbox]').forEach((el) => el.addEventListener('change', commit));
  $('endRest').onclick = () => { clearRest(); $('endRest').textContent = '已結束休息 ✓'; };
  $('applyTest').onclick = () => {
    const h = $('thour').value;
    localStorage.setItem(TEST_KEY, JSON.stringify({ hour: h === '' ? null : parseFloat(h), setAt: Date.now() }));
    location.reload();
  };
  $('clearTest').onclick = () => { localStorage.removeItem(TEST_KEY); location.reload(); };
  $('perf').onclick = () => { location.href = 'engine-test.html?spin=1'; };
  $('recheck').onclick = () => { state.mult = { ...(state.mult || {}), checked: false }; save(); $('recheck').textContent = '下次進學堂會重新檢查 ✓'; };
  $('wipe').onclick = () => { if (confirm('確定清除全部進度？')) { clearAll(); location.reload(); } };
  p.querySelector('.close').onclick = () => { commit(); p.remove(); onClose?.(); };
  p.addEventListener('pointerdown', (e) => e.stopPropagation());
  root.appendChild(p);
}
