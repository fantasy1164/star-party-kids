// 家長頁（在開場或休息、睡覺畫面長按左下角的鎖 3 秒）。這裡可以有文字。
// 11/24：分頁（左邊一排分頁，右邊內容），最常用的放在「總覽」；記住上次看的分頁。
import { div } from '../core/dom.js';
import { state, save, clearAll } from '../core/store.js';
import { setMusicVolume, setQuietMode } from '../core/audio.js';
import { clearRest, resting, restLeftMs, remainingMs } from '../core/session.js';
import { TEST_KEY, testSettings, dateKey } from '../core/clock.js';
import { KIDS } from '../config.js';
import * as M from '../core/mult.js';
import { syncConfig, setSyncConfig, syncNow, syncStatus, onSyncStatus, configured, deviceName, pingCloud } from '../core/sync.js';

const NAMES = {
  'bedroom.toys': '收玩具', 'bedroom.dress': '換衣服', 'bedroom.simon': '晚晚說',
  'bath.brush': '刷牙', 'bath.wash': '洗手', 'bath.haz': '找危險',
  'kitchen.plate': '我的餐盤', 'kitchen.table': '擺餐具', 'kitchen.safe': '什麼能摸', 'kitchen.dumpling': '分水餃',
  'living.tv': '關電視', 'living.door': '誰按電鈴', 'living.stage': '明星舞台',
  'school.robot': '修理機器人', 'school.blocks': '積木排排站', 'school.hop': '跳跳口訣', 'school.song': '口訣唱唱', 'school.abc': 'ABC',
  'market.list': '購物清單', 'market.pay': '付錢', 'market.bag': '裝袋子',
  'park.trash': '垃圾分類', 'park.animals': '找小動物', 'park.queue': '溜滑梯排隊', 'park.dino': '挖恐龍化石',
  'clinic.checkup': '看醫生', 'clinic.body': '身體在哪裡', 'clinic.heal': '生病快點好',
  'farm.feed': '餵動物', 'farm.eggs': '撿雞蛋', 'farm.grow': '種菜',
  'police.traffic': '指揮交通', 'police.cross': '過馬路', 'police.lost': '走散了找誰',
  'fire.call': '打119', 'fire.escape': '火災逃生', 'fire.spray': '消防車滅火',
  'mrt.board': '進站上車', 'mrt.seat': '讓座', 'mrt.route': '看路線圖',
  'library.voice': '小聲說話', 'library.story': '聽故事', 'library.shelf': '書放回書架',
  'post.send': '寄卡片', 'post.color': '紅綠郵筒', 'post.deliver': '送信',
  'garbage.steps': '倒垃圾步驟', 'garbage.trash': '垃圾車', 'garbage.recycle': '資源回收',
  'aquarium.tunnel': '海底隧道', 'aquarium.penguin': '企鵝排隊', 'aquarium.rules': '海生館規則',
  'beach.sun': '防曬', 'beach.shells': '撿貝殼', 'beach.safe': '海邊安全',
  'zoo.find': '找動物', 'zoo.food': '餵動物吃什麼', 'zoo.rules': '動物園規則',
};
const TABS = [
  ['today', '📊', '總覽'],
  ['week', '📅', '一週紀錄'],
  ['mult', '✖️', '九九乘法'],
  ['time', '⏰', '時間與作息'],
  ['sound', '🔊', '聲音'],
  ['sync', '☁️', '雲端同步'],
  ['dev', '🛠️', '進階'],
];
const TAB_KEY = 'spk-parent-tab';
const BOXC = ['#ffd0d0', '#ffe3c4', '#fff2b8', '#c8f5d6', '#9fe6b8', '#6fd99a'];
const hm = (v) => `${Math.floor(v)}:${v % 1 ? '30' : '00'}`;
const mins = (ms) => Math.ceil(ms / 60000);
const chips = (done) => Object.entries(done || {}).map(([g, n]) => `<span class="chip">${NAMES[g] || g}${n > 1 ? ` ×${n}` : ''}</span>`).join('') || '<span class="none">還沒玩</span>';

const attr = (v) => String(v || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function syncText(st = syncStatus()) {
  const hm = (t) => new Date(t).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  const last = st.last ? `（上次同步 ${new Date(st.last).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })} ${hm(st.last)}）` : '';
  if (!configured()) return '☁️ 雲端同步還沒設定：進度只存在這台。';
  switch (st.kind) {
    case 'test': return '☁️ 測試模式中，暫停同步（回到真實時間後繼續）。';
    case 'busy': return '☁️ 同步中…';
    case 'ok': return `☁️ <b class="ok">✓ 已同步</b>${last}`;
    case 'dirty': return `☁️ 有新進度，稍後自動上傳${last}`;
    case 'error': return `☁️ <b class="bad">✗ 同步失敗：${st.msg}</b>，有網路時會自動再試${last}`;
    default: return `☁️ 已設定${last}`;
  }
}

export function openParent(root, onClose) {
  const s = state.settings;
  const test = testSettings();
  const p = div('parent');
  let tab = sessionStorage.getItem(TAB_KEY) || 'today';
  if (!TABS.some(([id]) => id === tab)) tab = 'today';

  // ---- 小元件：分段按鈕、開關 ----
  const seg = (key, opts, fmt = (v) => v) => `<div class="seg" data-key="${key}">${opts.map((v) => {
    const [val, label] = Array.isArray(v) ? v : [v, fmt(v)];
    return `<button data-v="${val}" class="${String(val) === String(s[key]) ? 'on' : ''}">${label}</button>`;
  }).join('')}</div>`;
  const sw = (key, label, hint = '') => `<label class="switch"><input type="checkbox" data-key="${key}" ${s[key] ? 'checked' : ''}><span class="knob"></span><span class="sw-text">${label}${hint ? `<small>${hint}</small>` : ''}</span></label>`;
  const field = (label, html, hint = '') => `<div class="field"><div class="flabel">${label}${hint ? `<small>${hint}</small>` : ''}</div><div class="fctl">${html}</div></div>`;

  // ---- 各分頁 ----
  const today = dateKey();
  const kidCard = (id) => {
    const k = state.kids[id];
    const n = Object.values(k.done[today] || {}).reduce((a, b) => a + b, 0);
    const extra = id === 'yy' ? `<div class="kstat"><b>${M.masteredCount()}</b>／81 題乘法學會了　正在練 ${M.focusRow()} 的乘法</div>` : '';
    return `<div class="kid-card k-${id}"><div class="kname">${KIDS[id].name}</div>
      <div class="kstat"><b>${k.stars[today] || 0}</b> 顆星星　玩了 <b>${n}</b> 關</div>${extra}
      <div class="chips">${chips(k.done[today])}</div></div>`;
  };
  const playState = () => {
    if (resting()) return `<div class="status rest">😴 休息中，還有 <b>${mins(restLeftMs())}</b> 分鐘　<button id="endRest">現在結束休息</button></div>`;
    if (s.nolimit) return '<div class="status">⏱️ 目前不限制遊玩時間（在「進階」可以改）</div>';
    return `<div class="status">⏱️ 這一輪還可以玩 <b>${mins(remainingMs())}</b> 分鐘（每次 ${s.sessionMin} 分鐘，玩完休息 ${s.restMin} 分鐘）</div>`;
  };
  const days = [];
  const d = new Date();
  for (let i = 0; i < 7; i++) { days.push(dateKey(d)); d.setDate(d.getDate() - 1); }
  const multTable = () => `<table class="mult"><tr><th></th>${[2, 3, 4, 5, 6, 7, 8, 9].map((b) => `<th>×${b}</th>`).join('')}</tr>
    ${M.table().map((row, i) => `<tr><th>${i + 2}</th>${row.map((f) => `<td style="background:${BOXC[f.box]}">${f.bad ? `✕${f.bad}` : ''}</td>`).join('')}</tr>`).join('')}</table>`;

  const PAGES = {
    today: () => `<h2>今天</h2>${playState()}<div class="status sync-st">${syncText()}</div><div class="kids">${kidCard('yy')}${kidCard('kk')}</div>
      <h3>常用</h3>
      ${field('音樂大小', seg('musicVol', [['low', '小'], ['mid', '中'], ['high', '大']]))}
      ${sw('quiet', '安靜模式', '關掉背景音樂和裝飾音效，只留角色說話和對錯的聲音')}`,
    week: () => `<h2>這一週</h2>
      <table class="week"><tr><th>日期</th><th>${KIDS.yy.name}</th><th>${KIDS.kk.name}</th></tr>
      ${days.map((day) => `<tr><td class="day">${day.slice(5)}${day === today ? '<small>今天</small>' : ''}</td>${['yy', 'kk'].map((id) => `<td><div class="wstar">⭐ ${state.kids[id].stars[day] || 0}</div><div class="chips">${chips(state.kids[id].done[day])}</div></td>`).join('')}</tr>`).join('')}</table>`,
    mult: () => `<h2>九九乘法（${KIDS.yy.name}）</h2>
      <div class="status">正在練 <b>${M.focusRow()}</b> 的乘法　已學會 <b>${M.masteredCount()}</b>／81 題${M.checked() ? '' : '<br><small>還沒做程度檢查：在學堂玩「修理機器人」會先做</small>'}</div>
      ${multTable()}
      <p class="note">顏色越綠越熟（第 3 盒以上算學會，星空會亮）；✕ 是答錯次數。</p>
      <button id="recheck" class="gray">下次重新做程度檢查</button>`,
    time: () => `<h2>時間與作息</h2>${playState()}
      ${field('每次可以玩', seg('sessionMin', [5, 10, 12, 15, 20, 25, 30], (v) => `${v} 分`))}
      ${field('玩完休息', seg('restMin', [1, 10, 20, 30, 45, 60, 90, 120], (v) => `${v} 分`))}
      ${field('睡覺時間', seg('bedtime', [19, 19.5, 20, 20.5, 21, 21.5, 22], hm), '過了這個時間，打開會直接到睡覺畫面')}
      ${field('起床時間', seg('wake', [5, 5.5, 6, 6.5, 7], hm))}`,
    sound: () => `<h2>聲音</h2>
      ${field('音樂大小', seg('musicVol', [['low', '小'], ['mid', '中'], ['high', '大']]))}
      ${sw('quiet', '安靜模式', '關掉背景音樂和裝飾音效，只留角色說話和對錯的聲音')}
      <p class="note">要動腦的題目出現時，音樂會自動淡到幾乎聽不到；一起玩時，等待的人按拍手會等答完才出聲。</p>`,
    sync: () => {
      const c = syncConfig();
      return `<h2>雲端同步</h2>
      <div class="status sync-st">${syncText()}</div>
      <p class="note">進度存到你的 Google 雲端硬碟「明星總動員存檔」資料夾（spk.json），每台裝置打開遊戲時自動載入最新進度；玩的時候、離開 app 時自動上傳。
        跟歡樂派對共用同一個雲端網址和家庭密碼，檔案分開不會互相蓋掉。第一次要先部署雲端程式，步驟在 GitHub 的 tools/sync/README.md。</p>
      ${field('雲端網址', `<input class="wide" id="syUrl" value="${attr(c.url)}" placeholder="https://script.google.com/macros/s/……/exec" autocomplete="off" autocapitalize="off" spellcheck="false">`)}
      ${field('家庭密碼', `<input class="wide" id="syKey" type="password" value="${attr(c.key)}" autocomplete="off" autocapitalize="off" spellcheck="false">`)}
      ${field('這台的名字', `<input id="syDev" value="${attr(c.dev || deviceName())}" autocomplete="off">`, '雲端記錄是哪台上傳的')}
      <div class="btnrow"><button id="sySave">儲存並同步</button><button id="syNow" class="gray">立即同步</button><button id="syPing" class="gray">測試連線</button></div>
      <h3>其他</h3>
      <button id="syPull" class="gray">用雲端進度覆蓋這台</button>
      <p class="note">兩台在沒網路時各自玩過，連上後會合併：每天的星星、玩過的關卡取多的；乘法每一題取最近一次作答的熟練度；貼紙取比較多的那一邊。
        「用雲端進度覆蓋這台」：這台的進度不要了、直接換成雲端的（例如這台之前拿來測試）。雲端硬碟的「舊版本」資料夾每天留一份，可以找回以前的進度。畫畫板的圖不同步。</p>`;
    },
    dev: () => `<h2>進階</h2>
      ${sw('nolimit', '不限制每次遊玩時間')}
      ${field('假裝現在幾點', `<input id="thour" type="number" step="0.5" min="0" max="23.5" placeholder="例如 20.5" value="${test.hour ?? ''}"><button id="applyTest">套用並重新開啟</button><button id="clearTest" class="gray">回到真實時間</button>`)}
      ${field('測試', '<button id="perf" class="gray">立體引擎效能測試</button><button id="guide" class="gray">看「加到主畫面」引導</button>')}
      <p class="note">網址參數：?hour=20.5 假裝幾點、?notts=1 不出聲、?debug=1 顯示語音事件、?guide 看安裝引導。</p>
      <h3 class="danger-h">危險區</h3>
      <button id="wipe" class="danger">清除全部進度</button>`,
  };

  p.innerHTML = `<nav class="ptabs">${TABS.map(([id, ic, label]) => `<button data-tab="${id}"><span class="ic">${ic}</span>${label}</button>`).join('')}</nav>
    <section class="pbody"></section><button class="close">✕ 關閉</button>`;
  const body = p.querySelector('.pbody');
  const $ = (id) => body.querySelector(`#${id}`);

  const apply = () => { setMusicVolume(s.musicVol); setQuietMode(s.quiet); save(); };
  const bindRest = () => { const b = $('endRest'); if (b) b.onclick = () => { clearRest(); show(tab); }; };
  function show(id) {
    tab = id;
    sessionStorage.setItem(TAB_KEY, id);
    p.querySelectorAll('.ptabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === id));
    body.innerHTML = PAGES[id]();
    body.scrollTop = 0;
    // 分段按鈕
    body.querySelectorAll('.seg').forEach((g) => g.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const key = g.dataset.key;
      s[key] = typeof s[key] === 'number' ? parseFloat(b.dataset.v) : b.dataset.v;
      g.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      apply();
      if (key === 'sessionMin' || key === 'restMin') { const st = body.querySelector('.status'); if (st) { st.outerHTML = playState(); bindRest(); } }
    }));
    // 開關
    body.querySelectorAll('.switch input').forEach((c) => c.addEventListener('change', () => { s[c.dataset.key] = c.checked; apply(); }));
    bindRest();
    if ($('sySave')) {
      const msg = (h) => { const st = body.querySelector('.sync-st'); if (st) st.innerHTML = h; };
      const run = (mode) => syncNow({ mode }).then(({ changed }) => {
        // 進度換成雲端的（或合併了）：重新開始，畫面才會是新的
        if (changed) { msg('☁️ 已載入雲端進度，重新開始…'); setTimeout(() => location.reload(), 800); }
      });
      $('sySave').onclick = () => {
        setSyncConfig({ url: $('syUrl').value, key: $('syKey').value, dev: $('syDev').value });
        if (!configured()) { msg('<b class="bad">網址要是 https://script.google.com/macros/s/……/exec，家庭密碼至少 8 碼。</b>'); return; }
        run('auto');
      };
      $('syNow').onclick = () => run('auto');
      $('syPing').onclick = async () => {
        setSyncConfig({ url: $('syUrl').value, key: $('syKey').value, dev: $('syDev').value });
        if (!configured()) { msg('<b class="bad">網址要是 https://script.google.com/macros/s/……/exec，家庭密碼至少 8 碼。</b>'); return; }
        msg('☁️ 測試中…');
        const err = await pingCloud();
        msg(err ? `<b class="bad">✗ ${err}</b>` : '<b class="ok">✓ 連得上，密碼也對</b>');
      };
      $('syPull').onclick = (e) => {
        // 按兩次才執行，避免誤按
        if (!e.target.classList.contains('armed')) { e.target.classList.add('armed'); e.target.textContent = '確定？再按一次'; msg('☁️ 這台的進度會被雲端的取代。確定的話，再按一次同一個按鈕。'); return; }
        run('pull');
      };
    }
    $('recheck') && ($('recheck').onclick = () => { state.mult = { ...(state.mult || {}), checked: false }; save(); $('recheck').textContent = '下次進學堂會重新檢查 ✓'; });
    if ($('applyTest')) {
      $('applyTest').onclick = () => {
        const h = $('thour').value;
        localStorage.setItem(TEST_KEY, JSON.stringify({ hour: h === '' ? null : parseFloat(h), setAt: Date.now() }));
        location.reload();
      };
      $('clearTest').onclick = () => { localStorage.removeItem(TEST_KEY); location.reload(); };
      $('perf').onclick = () => { location.href = 'engine-test.html?spin=1'; };
      $('guide').onclick = () => { location.href = '?guide'; };
      $('wipe').onclick = () => { if (confirm('確定清除全部進度？兩兄弟的星星、貼紙、乘法紀錄都會不見。')) { clearAll(); location.reload(); } };
    }
  }
  p.querySelector('.ptabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.tab); });
  const offSync = onSyncStatus((st) => { const el = body.querySelector('.sync-st'); if (el) el.innerHTML = syncText(st); });
  p.querySelector('.close').onclick = () => { apply(); offSync(); p.remove(); onClose?.(); };
  p.addEventListener('pointerdown', (e) => e.stopPropagation());
  root.appendChild(p);
  show(tab);
}
