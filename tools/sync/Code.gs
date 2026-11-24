/**
 * 明星總動員歡樂派對：雲端存檔中繼站（Google Apps Script）
 *
 * 部署在家長自己的 Google 帳號底下，進度存在自己的 Google 雲端硬碟「明星總動員存檔」資料夾：
 *   progress.json   ← 歡樂派對（2～5 歲，toon-fun-party）：不帶 app 參數
 *   spk.json        ← 明星小鎮（5～8 歲，star-party-kids）：app = 'spk'
 *   舊版本／        ← 每天第一次存檔前留一份「當天開始時」的進度，每個遊戲各保留 30 天
 * 兩個遊戲可以共用同一個部署（同一個網址、同一組家庭密碼），檔案分開，不會互相蓋掉。
 *
 * 部署步驟見同資料夾的 README.md。
 * 唯一要改的是下面這行：家庭密碼（8 碼以上，英數混合）。
 */
const FAMILY_PASS = '請改成你的家庭密碼';

const FOLDER = '明星總動員存檔';
const OLD_FOLDER = '舊版本';
const KEEP = 30;          // 舊版本保留幾天
const MAX_FAILS = 10;     // 10 分鐘內密碼錯幾次就暫停
const MAX_BYTES = 2e6;    // 存檔上限 2 MB

function doGet(e) {
  return run(e && e.parameter ? e.parameter : {});
}

// 網頁端用 Content-Type: text/plain 送 JSON（避免瀏覽器的 CORS 預檢）
function doPost(e) {
  let q = {};
  try { q = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, err: 'badjson' }); }
  return run(q);
}

function run(q) {
  try {
    return out(handle(q));
  } catch (err) {
    return out({ ok: false, err: 'server', msg: String(err && err.message || err) });
  }
}

function handle(q) {
  if (FAMILY_PASS.indexOf('請改成') === 0 || FAMILY_PASS.length < 8) return { ok: false, err: 'nopass' };
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get('fails') || 0);
  if (fails >= MAX_FAILS) return { ok: false, err: 'locked' };
  if (q.key !== FAMILY_PASS) {
    cache.put('fails', String(fails + 1), 600);
    return { ok: false, err: 'key' };
  }

  const op = q.op;
  if (op === 'ping') return { ok: true, t: Date.now() };

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    // 哪個遊戲：沒帶 app 是歡樂派對（舊版相容）；明星小鎮帶 app: 'spk'
    const app = /^[a-z0-9-]{1,40}$/.test(String(q.app || '')) ? String(q.app) : '';
    const base = app || 'progress';
    const slot = q.slot === 'test' ? (app ? app + '-test.json' : 'sync-test.json') : base + '.json';
    const folder = getFolder(FOLDER, DriveApp.getRootFolder());

    if (op === 'load') {
      const f = findFile(folder, slot);
      if (!f) return { ok: true, data: null, t: 0 };
      return { ok: true, data: f.getBlob().getDataAsString('UTF-8'), t: f.getLastUpdated().getTime() };
    }

    if (op === 'save') {
      const text = typeof q.data === 'string' ? q.data : JSON.stringify(q.data);
      if (!text || text.length > MAX_BYTES) return { ok: false, err: 'size' };
      const f = findFile(folder, slot);
      if (f) {
        if (slot === base + '.json') keepOld(folder, f, base);
        f.setContent(text);
      } else {
        folder.createFile(slot, text, 'application/json');
      }
      return { ok: true, t: Date.now() };
    }

    if (op === 'remove') {
      const f = findFile(folder, slot);
      if (f) f.setTrashed(true);
      return { ok: true };
    }

    return { ok: false, err: 'op' };
  } finally {
    lock.releaseLock();
  }
}

// 每天第一次覆蓋前，把舊的複製一份到「舊版本」（＝當天開始時的進度），每個遊戲只留最近 KEEP 天
function keepOld(folder, file, base) {
  const old = getFolder(OLD_FOLDER, folder);
  const name = base + '-' + Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd') + '.json';
  if (old.getFilesByName(name).hasNext()) return;
  file.makeCopy(name, old);
  const all = [];
  const it = old.getFiles();
  const re = new RegExp('^' + base + '-\\d{4}-\\d{2}-\\d{2}\\.json$');
  while (it.hasNext()) { const f = it.next(); if (re.test(f.getName())) all.push(f); }
  all.sort((a, b) => b.getName() < a.getName() ? -1 : 1);
  all.slice(KEEP).forEach((f) => f.setTrashed(true));
}

function getFolder(name, parent) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function findFile(folder, name) {
  const it = folder.getFilesByName(name);
  return it.hasNext() ? it.next() : null;
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 部署前可在編輯器裡選這個函式按「執行」，用來觸發一次授權並建立資料夾
function setup() {
  const folder = getFolder(FOLDER, DriveApp.getRootFolder());
  getFolder(OLD_FOLDER, folder);
  Logger.log('資料夾已就緒：' + folder.getUrl());
}
