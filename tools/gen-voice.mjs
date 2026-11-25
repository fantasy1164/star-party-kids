// 批次產生角色語音（Gemini TTS），並更新 assets/voice/manifest.json。
//
// 用法（PowerShell）：
//   $env:GEMINI_API_KEY = "你的金鑰"
//   node tools/gen-voice.mjs              # 產生所有還沒有的語音（預設：同一角色多句串成一次請求再切開）
//   node tools/gen-voice.mjs --batch 20   # 每次請求串幾句（預設 10）
//   node tools/gen-voice.mjs --single     # 一句一次請求（舊方式，最穩但最耗額度）
//   node tools/gen-voice.mjs --char dudu  # 只做某個角色
//   node tools/gen-voice.mjs --line hello # 只做某一句
//   node tools/gen-voice.mjs --force      # 已存在的也重做
//   （台詞改過字的會自動重做：assets/voice/texts.json 記著每個檔案當初唸的是哪句話）
//   node tools/gen-voice.mjs --dry        # 只列出要做什麼，不呼叫 API
//   node tools/gen-voice.mjs --convert    # 把現有的 wav 轉成 mp3（需要 ffmpeg，不呼叫 API）
//   node tools/gen-voice.mjs --resplit    # 用 tools/voice-debug 裡存下來的原始語音重新切一次（不呼叫 API）
//   node tools/gen-voice.mjs --sample mian --voices Achernar,Aoede   # 試聽不同聲音（存到 tools/voice-samples，不會 push）
//   node tools/gen-voice.mjs --name-test                # 試聽「愷愷」的幾種唸法（A、B、C），存到 tools/voice-samples
//   node tools/gen-voice.mjs --match 愷愷 --pron B      # 有「愷愷」的台詞全部用 B 唸法重做
//
// 金鑰只放在環境變數，不要寫進任何檔案。
// 角色的聲音與說話風格在 tools/voice-config.json。
// 電腦有 ffmpeg 的話會自動轉成 mp3（檔案小很多）；沒有就保留 wav，遊戲兩種都能播。
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LINES } from '../js/data/lines.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VOICE_DIR = join(ROOT, 'assets', 'voice');
const cfg = JSON.parse(readFileSync(join(ROOT, 'tools', 'voice-config.json'), 'utf8'));
const API = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta/interactions';
const KEY = process.env.GEMINI_API_KEY;
const WHO = { yy: '岳岳', kk: '愷愷', both: '岳岳、愷愷' };

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const onlyChar = opt('char');
const onlyLine = opt('line');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hasFfmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
const BATCH = flag('single') ? 1 : Math.max(1, parseInt(opt('batch') || '10', 10));

// 展開成一筆一筆要產生的工作
function jobs() {
  const out = [];
  for (const [id, l] of Object.entries(LINES)) {
    if (onlyLine && id !== onlyLine) continue;
    for (const charId of Object.keys(cfg.characters)) {
      if (onlyChar && charId !== onlyChar) continue;
      // 純文字的台詞（顏色、圖案名稱等）只給嘟嘟、奇奇用，其他角色不用產生
      const t = typeof l === 'string' ? (['dudu', 'kiki'].includes(charId) ? l : null) : l[charId];
      if (!t) continue;
      if (t.includes('{name}')) {
        for (const [w, name] of Object.entries(WHO)) out.push({ charId, key: `${charId}/${id}.${w}`, text: t.replaceAll('{name}', name) });
      } else {
        out.push({ charId, key: `${charId}/${id}`, text: t });
      }
    }
  }
  return out;
}

const existing = (key) => ['mp3', 'wav'].find((ext) => existsSync(join(VOICE_DIR, `${key}.${ext}`)));

// 每個語音檔當初唸的文字；台詞改了（例如名字改了）就算過期，要重做
const TEXTS_PATH = join(VOICE_DIR, 'texts.json');
const TEXTS = existsSync(TEXTS_PATH) ? JSON.parse(readFileSync(TEXTS_PATH, 'utf8')) : {};
const stale = (j) => existing(j.key) && TEXTS[j.key] !== undefined && TEXTS[j.key] !== j.text;
const remember = (j) => { TEXTS[j.key] = j.text; writeFileSync(TEXTS_PATH, JSON.stringify(TEXTS, Object.keys(TEXTS).sort(), 1) + '\n'); };

// ---------- 名字的唸法（11/24：家裡叫「愷愷」是 ㄎㄞˇ ㄎㄞˊ，先三聲再二聲；TTS 原本兩個字都唸二聲）----------
// 用說話風格（style）提醒模型怎麼唸；哪一種最有效要用耳朵聽（--name-test），選好寫進 voice-config.json 的 "pron"
const PRON = {
  A: '名字「愷愷」一定要唸成「ㄎㄞˇ ㄎㄞˊ」：第一個字是三聲（往下再往上），第二個字是二聲（往上揚），像家人叫小名那樣。絕對不要兩個字都唸成二聲。',
  B: 'Pronunciation note: the child\'s name 愷愷 must be said as "kǎi kái" — the FIRST syllable in third tone (low dipping), the SECOND syllable in second tone (rising), like a family nickname. Never say both syllables in the second tone.',
  C: '名字「愷愷」要唸成「ㄎㄞˇ ㄎㄞˊ」（kǎi kái）：第一個字三聲、第二個字二聲，像家人叫小名那樣，不要兩個字都唸二聲。Say 愷愷 as "kǎi kái": first syllable third tone (dipping), second syllable second tone (rising).',
};
const pronKey = () => opt('pron') || cfg.pron || 'C';
function styleFor(c, text, key = pronKey()) {
  let st = c.style;
  if (text.includes('愷愷') && PRON[key]) st += PRON[key];
  if (text.includes('<long pause>')) st += '每一行台詞之間要停頓大約兩秒，同一行裡的句子正常說。';
  return st;
}

async function synth({ charId, text, pron }) {  // text 可以是很多句用停頓串起來
  const c = cfg.characters[charId];
  const body = {
    model: cfg.model,
    input: [{
      type: 'user_input',
      content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style: styleFor(c, text, pron) }] }],
    }],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice: c.voice }] },
  };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) return findAudio(await res.json());
    const msg = (await res.text()).slice(0, 600);
    // 每日額度用完：重試沒有用，直接停下整批
    if (res.status === 429 && /per day|daily/i.test(msg)) {
      const e = new Error(`今日額度已用完：${msg}`);
      e.quota = true;
      e.resetAt = quotaResetAt(msg, res.headers.get('retry-after'));
      throw e;
    }
    // 每分鐘太頻繁或伺服器忙：照伺服器建議的時間等，再試
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      const m = /retry in (?:(\d+)m)?\s*(?:(\d+(?:\.\d+)?)s)?/i.exec(msg);
      const hinted = m ? (parseInt(m[1] || '0', 10) * 60 + parseFloat(m[2] || '0')) : 0;
      const waitS = Math.ceil(hinted > 0 && hinted <= 120 ? hinted + 2 : attempt * (process.env.GEMINI_API_BASE ? 1 : 15));
      console.log(`    HTTP ${res.status}，${waitS} 秒後重試（第 ${attempt} 次）`);
      await sleep(waitS * 1000);
      continue;
    }
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
}

// 每日額度的重置時間：先看伺服器給的等待時間（訊息裡的 retry in 4h59m18s、retryDelay、Retry-After），
// 都沒有就用官方規則：美國太平洋時間午夜（台灣冬天 16:00、夏天 15:00，會自己算夏令時間）
function quotaResetAt(msg, retryAfter) {
  let sec = 0;
  const m = /retry in\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+(?:\.\d+)?)s)?/i.exec(msg);
  if (m && (m[1] || m[2] || m[3])) sec = (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
  const d = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/.exec(msg);
  if (!sec && d) sec = +d[1];
  if (!sec && retryAfter && /^\d+$/.test(retryAfter)) sec = +retryAfter;
  return sec > 0 ? new Date(Date.now() + sec * 1000) : nextPacificMidnight();
}
function nextPacificMidnight(now = new Date()) {
  const tz = 'America/Los_Angeles';
  const parts = (t) => Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
    .formatToParts(t).filter((p) => p.type !== 'literal').map((p) => [p.type, +p.value]));
  const offsetMs = (t) => { const p = parts(t); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(t.getTime() / 1000) * 1000; };
  const p = parts(now);
  const wall = Date.UTC(p.year, p.month - 1, p.day + 1, 0, 0, 0); // 明天 00:00（太平洋時間的牆上時間）
  let t = new Date(wall - offsetMs(now));
  t = new Date(wall - offsetMs(t)); // 跨夏令時間的那天再校正一次
  return t;
}
function resetText(at) {
  const p2 = (n) => String(n).padStart(2, '0');
  const r = new Date(Math.round(at.getTime() / 60000) * 60000);
  const today = new Date();
  const day = r.toDateString() === today.toDateString() ? '今天' : `${r.getMonth() + 1}/${r.getDate()}`;
  const mins = Math.max(0, Math.round((r - today) / 60000));
  return `會在${day} ${p2(r.getHours())}:${p2(r.getMinutes())}（還要 ${Math.floor(mins / 60)} 小時 ${mins % 60} 分）`;
}

// 回應格式可能調整，所以不寫死路徑：在整個回應裡找最後一段 audio 資料
function findAudio(json) {
  let found = null;
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (typeof n.data === 'string' && n.data.length > 200 && (n.type === 'audio' || String(n.mime_type || n.mimeType || '').startsWith('audio/'))) {
      found = { data: n.data, mime: n.mime_type || n.mimeType || 'audio/wav' };
    }
    Object.values(n).forEach(walk);
  })(json);
  if (!found) throw new Error(`回應裡找不到音訊：${JSON.stringify(json).slice(0, 400)}`);
  return found;
}

// 沒有 RIFF 檔頭的原始 PCM，補上 wav 檔頭（24kHz、單聲道、16 位元）
function toWav(buf) {
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF') return buf;
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + buf.length, 4); h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(24000, 24); h.writeUInt32LE(48000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(buf.length, 40);
  return Buffer.concat([h, buf]);
}

// ---------- 串接後切割 ----------
// 把回傳的音訊轉成 16 位元單聲道 PCM 樣本
function pcmOf(audio) {
  const buf = Buffer.from(audio.data, 'base64');
  let data = buf, rate = 24000;
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF') {
    rate = buf.readUInt32LE(24);
    let off = 12;
    while (off < buf.length - 8) {
      const id = buf.subarray(off, off + 4).toString('ascii');
      const size = buf.readUInt32LE(off + 4);
      if (id === 'data') { data = buf.subarray(off + 8, off + 8 + size); break; }
      off += 8 + size;
    }
  }
  return { samples: new Int16Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.length - (data.length % 2))), rate };
}

function wavOf(samples, rate) {
  const body = Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + body.length, 4); h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(body.length, 40);
  return Buffer.concat([h, body]);
}

// 找出最長的 n-1 段靜音當切點，切成 n 段。切不出合理結果就回傳 null。
// 把一段串起來的語音切回每一句。
// 方法 A：挑最長的 n-1 個停頓；方法 B：依每句字數估計句子交界的位置，挑「離估計位置近、又夠長」的停頓（同一句裡有句號、驚嘆號時比較準）。
// 兩種都要通過「每段長度跟字數相符」的檢查。回傳 { parts, how } 或 { parts: null, info }。
// 估計「念起來有多長」：中文一字算 1；英文大約 3 個字母算 1（Raincoat ≈ 3）
const charsOf = (t) => {
  const cjk = (t.match(/[\u3400-\u9fff]/g) || []).length;
  const latin = (t.match(/[A-Za-z]/g) || []).length;
  const digits = (t.match(/[0-9]/g) || []).length;
  return Math.max(1, cjk + Math.ceil(latin / 3) + digits);
};
export function splitBySilence(samples, rate, texts) {
  const n = texts.length;
  const FR = 0.02;
  const frame = Math.round(rate * FR);              // 20 毫秒一格
  const frames = Math.floor(samples.length / frame);
  let peak = 1;
  const rms = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    for (let i = f * frame; i < (f + 1) * frame; i++) sum += samples[i] * samples[i];
    rms[f] = Math.sqrt(sum / frame);
    if (rms[f] > peak) peak = rms[f];
  }
  const quiet = Math.max(120, peak * 0.03);
  const silent = Array.from(rms, (v) => v < quiet);
  const first = silent.indexOf(false);
  const last = silent.lastIndexOf(false);
  if (first < 0) return { parts: null, info: '整段都是靜音' };
  const cut = (bounds) => bounds.map(([s0, e0]) => samples.slice(Math.max(0, s0 - 4) * frame, Math.min(frames, e0 + 4) * frame));
  if (n === 1) return { parts: cut([[first, last + 1]]), how: 'single' };
  const gaps = [];
  for (let f = first; f <= last; f++) {
    if (!silent[f]) continue;
    let g = f;
    while (g <= last && silent[g]) g++;
    if (g - f >= 6) gaps.push({ start: f, end: g, len: g - f, mid: (f + g) / 2 });   // 0.12 秒以上才算停頓
    f = g;
  }
  // 「有聲音的時間」累計：用來估計位置、檢查語速（不受句子裡停頓長短影響）
  const voiced = new Int32Array(frames + 1);
  for (let f = 0; f < frames; f++) voiced[f + 1] = voiced[f] + (silent[f] ? 0 : 1);
  const info = `${gaps.length} 個停頓，長度 ${gaps.map((g) => (g.len * FR).toFixed(2)).join(' ')}`;
  if (gaps.length < n - 1) return { parts: null, info };
  const boundsOf = (chosen) => {
    const out = [];
    let a = first;
    for (const g of chosen) { out.push([a, g.start]); a = g.end; }
    out.push([a, last + 1]);
    return out;
  };
  // 每段長度要跟字數大致相符（每個字 0.08 到 0.7 秒）
  // 同一次請求裡說話速度差不多：每段「秒數／字數」不能跟中位數差太多（太短或太長多半是切錯）
  const okLen = (bounds, loose = false) => {
    const ok = bounds.every(([s0, e0], i) => {
      const sec = (e0 - s0) * FR;
      const c = charsOf(texts[i]);
      return sec >= Math.min(0.25, c * 0.08) && sec <= c * 0.7 + 2.5;
    });
    if (!ok) return false;
    const r = bounds.map(([s0, e0], i) => ({ r: (voiced[e0] - voiced[s0]) / charsOf(texts[i]), c: charsOf(texts[i]) })).filter((x) => x.c >= 4);
    if (r.length < 3) return true;
    const med = r.map((x) => x.r).sort((a, b) => a - b)[Math.floor(r.length / 2)];
    // 短句（感嘆、單字）常唸得比較慢，只檢查不能太快；長句兩邊都檢查
    // loose：停頓非常清楚（句間停頓明顯比句中停頓長很多）時，語速檢查放寬
    const lo = loose ? 0.45 : 0.6;
    const hi = loose ? 2.2 : 1.6;
    return r.every((x) => x.r > med * lo && (x.c <= 6 ? x.r < med * 2.6 : x.r < med * hi));
  };
  // 方法 A
  const byLen = gaps.slice().sort((x, y) => y.len - x.len);
  const A = byLen.slice(0, n - 1).sort((x, y) => x.start - y.start);
  const minA = Math.min(...A.map((g) => g.len));
  const nextA = byLen[n - 1]?.len || 0;
  const clearA = minA * FR >= 0.8 && minA >= nextA * 2.5;
  if (minA * FR >= 0.3 && minA >= nextA * 1.15 && okLen(boundsOf(A), clearA)) return { parts: cut(boundsOf(A)), how: 'A' };
  // 方法 B：動態規劃，依序替每個交界挑一個停頓
  const w = texts.map(charsOf);
  const W = w.reduce((x, y) => x + y, 0);
  const V = voiced[last + 1] - voiced[first];
  const expect = [];
  let acc = 0;
  for (let k = 0; k < n - 1; k++) { acc += w[k]; expect.push((V * acc) / W); }
  const G = gaps.length;
  const score = (g, k) => g.len * FR - (Math.abs(voiced[g.start] - voiced[first] - expect[k]) * FR) / 2;
  const best = Array.from({ length: n - 1 }, () => new Float64Array(G).fill(-Infinity));
  const from = Array.from({ length: n - 1 }, () => new Int32Array(G).fill(-1));
  for (let j = 0; j < G; j++) best[0][j] = score(gaps[j], 0);
  for (let k = 1; k < n - 1; k++) {
    let runMax = -Infinity;
    let runArg = -1;
    for (let j = 0; j < G; j++) {
      if (j - 1 >= 0 && best[k - 1][j - 1] > runMax) { runMax = best[k - 1][j - 1]; runArg = j - 1; }
      if (runArg >= 0) { best[k][j] = runMax + score(gaps[j], k); from[k][j] = runArg; }
    }
  }
  let j = -1;
  let bv = -Infinity;
  for (let x = 0; x < G; x++) if (best[n - 2][x] > bv) { bv = best[n - 2][x]; j = x; }
  if (j < 0) return { parts: null, info };
  const B = [];
  for (let k = n - 2; k >= 0; k--) { B.unshift(gaps[j]); j = from[k][j]; }
  const minB = Math.min(...B.map((g) => g.len));
  if (minB * FR >= 0.2 && okLen(boundsOf(B))) return { parts: cut(boundsOf(B)), how: 'B' };
  return { parts: null, info };
}

// 切不開的那段原始語音存起來，方便檢查（tools/voice-debug/，可以 push 上來給 Claude 看）
function saveDebug(batch, samples, rate, info) {
  const dir = join(ROOT, 'tools', 'voice-debug');
  mkdirSync(dir, { recursive: true });
  const name = `${batch[0].key.replace(/[\/.]/g, '_')}-${batch.length}`;
  writeFileSync(join(dir, `${name}.wav`), wavOf(samples, rate));
  writeFileSync(join(dir, `${name}.txt`), `${info}\n\n${batch.map((j) => `${j.key}\t${j.text}`).join('\n')}\n`);
  return name;
}

function saveSamples(key, samples, rate) {
  const wavPath = join(VOICE_DIR, `${key}.wav`);
  mkdirSync(dirname(wavPath), { recursive: true });
  writeFileSync(wavPath, wavOf(samples, rate));
  if (!hasFfmpeg) return 'wav';
  const mp3Path = join(VOICE_DIR, `${key}.mp3`);
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wavPath, '-ac', '1', '-b:a', '64k', mp3Path]);
  if (r.status !== 0) return 'wav';
  unlinkSync(wavPath);
  return 'mp3';
}

// 一批（同一角色）一次請求；切不開就對半再試一次，還不行就放棄這批
async function runBatch(batch, depth = 0) {
  const text = batch.map((j) => j.text).join('\n<long pause>\n');
  const audio = await synth({ charId: batch[0].charId, text });
  const { samples, rate } = pcmOf(audio);
  const { parts, how, info } = splitBySilence(samples, rate, batch.map((j) => j.text));
  if (parts) {
    if (how === 'B') console.log('    （用字數估計位置切開）');
    batch.forEach((j, i) => {
      const ext = existing(j.key); if (ext) unlinkSync(join(VOICE_DIR, `${j.key}.${ext}`));
      saveSamples(j.key, parts[i], rate);
      remember(j);
    });
    return batch.length;
  }
  const dbg = saveDebug(batch, samples, rate, info);
  console.log(`    切不開：${info}`);
  console.log(`    原始語音存在 tools/voice-debug/${dbg}.wav`);
  // 第一次切不開：對半各試一次；對半還是切不開：那幾句改成一句一次（一定切得開，但比較花額度）
  const parts2 = depth === 0 && batch.length > 3
    ? [batch.slice(0, Math.ceil(batch.length / 2)), batch.slice(Math.ceil(batch.length / 2))]
    : batch.map((j) => [j]);
  console.log(depth === 0 && batch.length > 3 ? '    切不開，對半各試一次' : `    改成一句一次（${batch.length} 次請求）`);
  let ok = 0;
  for (const part of parts2) {
    await sleep(1200);
    ok += await runBatch(part, depth + 1);
  }
  return ok;
}

function save(key, audio) {
  const wavPath = join(VOICE_DIR, `${key}.wav`);
  mkdirSync(dirname(wavPath), { recursive: true });
  writeFileSync(wavPath, toWav(Buffer.from(audio.data, 'base64')));
  if (!hasFfmpeg) return 'wav';
  const mp3Path = join(VOICE_DIR, `${key}.mp3`);
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wavPath, '-ac', '1', '-b:a', '64k', mp3Path]);
  if (r.status !== 0) return 'wav';
  unlinkSync(wavPath);
  return 'mp3';
}

// 依實際存在的檔案重寫清單，遊戲靠這份清單知道哪些句子有正式語音
function writeManifest() {
  const files = [];
  if (existsSync(VOICE_DIR)) {
    for (const d of readdirSync(VOICE_DIR, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      for (const f of readdirSync(join(VOICE_DIR, d.name))) {
        if (/\.(mp3|wav)$/.test(f)) files.push(`${d.name}/${f}`);
      }
    }
  }
  files.sort();
  writeFileSync(join(VOICE_DIR, 'manifest.json'), JSON.stringify({ files }, null, 2) + '\n');
  return files.length;
}

// ---------- 試聽「愷愷」的唸法：同幾句話用 A、B、C 三種提醒各念一次 ----------
if (flag('name-test')) {
  if (!KEY) { console.error('請先設定環境變數 GEMINI_API_KEY'); process.exit(1); }
  const charId = opt('char') || 'shan';
  const text = ['愷愷，你好！', '岳岳和愷愷，一起來玩吧！', '愷愷好棒！'].join('<long pause>');
  const dir = join(ROOT, 'tools', 'voice-samples');
  mkdirSync(dir, { recursive: true });
  for (const key of (opt('pron') || 'A,B,C').split(',')) {
    console.log(`試聽唸法 ${key}（${charId}）…`);
    const audio = await synth({ charId, text, pron: key });
    const out = join(dir, `name-${key}.wav`);
    writeFileSync(out, toWav(Buffer.from(audio.data, 'base64')));
    console.log(`  → ${out}`);
  }
  console.log('聽完選最像「ㄎㄞˇ ㄎㄞˊ」的那個，再執行：node tools/gen-voice.mjs --match 愷愷 --pron 那個字母');
  process.exit(0);
}

// ---------- 試聽：同一段話用不同的聲音各念一次，存到 tools/voice-samples（不會 push） ----------
// node tools/gen-voice.mjs --sample mian --voices Achernar,Aoede,Despina [--style "說話風格"]
// 不加 --style 用 voice-config.json 的 sampleStyle（有的話）或原本的 style
if (flag('sample')) {
  if (!KEY) { console.error('請先設定環境變數 GEMINI_API_KEY'); process.exit(1); }
  const charId = opt('sample');
  const base = cfg.characters[charId];
  if (!base) { console.error(`找不到角色 ${charId}`); process.exit(1); }
  const voices = (opt('voices') || base.voice).split(',').map((v) => v.trim()).filter(Boolean);
  const style = opt('style') || base.sampleStyle || base.style;
  const ids = Object.keys(LINES).filter((id) => typeof LINES[id] !== 'string' && LINES[id][charId]).slice(0, 40);
  const pickIds = (opt('lines') || '').split(',').filter((id) => LINES[id]?.[charId]);
  const use = (pickIds.length ? pickIds : ids.slice(0, 3)).map((id) => LINES[id][charId].replaceAll('{name}', WHO.yy));
  const text = use.join('<long pause>');
  const dir = join(ROOT, 'tools', 'voice-samples');
  mkdirSync(dir, { recursive: true });
  for (const v of voices) {
    cfg.characters[charId] = { ...base, voice: v, style };
    console.log(`試聽 ${charId}／${v} …`);
    const audio = await synth({ charId, text });
    const out = join(dir, `${charId}-${v}.wav`);
    writeFileSync(out, toWav(Buffer.from(audio.data, 'base64')));
    console.log(`  → ${out}`);
  }
  console.log('聽完告訴 Claude 要用哪一個聲音。');
  process.exit(0);
}

if (flag('convert')) {
  if (!hasFfmpeg) { console.error('找不到 ffmpeg'); process.exit(1); }
  let n = 0;
  for (const d of readdirSync(VOICE_DIR, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    for (const f of readdirSync(join(VOICE_DIR, d.name))) {
      if (!f.endsWith('.wav')) continue;
      const wav = join(VOICE_DIR, d.name, f);
      const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-b:a', '64k', wav.replace(/\.wav$/, '.mp3')]);
      if (r.status === 0) { unlinkSync(wav); n++; }
    }
  }
  console.log(`已轉換 ${n} 個檔案；清單已更新：${writeManifest()} 個語音檔`);
  process.exit(0);
}

// 用之前切不開時存下來的原始語音再切一次（切割規則改良後可以撿回來，不花額度）
if (flag('resplit')) {
  const dir = join(ROOT, 'tools', 'voice-debug');
  let n = 0;
  for (const f of existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith('.txt')) : []) {
    const wav = join(dir, f.replace(/\.txt$/, '.wav'));
    if (!existsSync(wav)) continue;
    const batch = readFileSync(join(dir, f), 'utf8').split('\n').filter((l) => l.includes('\t')).map((l) => { const [key, text] = l.split('\t'); return { key, text }; });
    if (batch.every((j) => existing(j.key))) { console.log(`  ${f}：都已經有了`); continue; }
    const b = readFileSync(wav);
    const rate = b.readUInt32LE(24);
    const samples = new Int16Array(b.buffer.slice(b.byteOffset + 44, b.byteOffset + b.length - ((b.length - 44) % 2)));
    const { parts, how, info } = splitBySilence(samples, rate, batch.map((j) => j.text));
    if (!parts) { console.log(`  ${f}：還是切不開（${info}）`); continue; }
    batch.forEach((j, i) => { if (!existing(j.key)) { saveSamples(j.key, parts[i], rate); remember(j); n++; } });
    console.log(`  ${f}：切開了（方法 ${how}），存了 ${batch.length} 句`);
  }
  console.log(`撿回 ${n} 句；清單已更新：${writeManifest()} 個語音檔`);
  process.exit(0);
}

const all = jobs();
const match = opt('match');   // 例如 --match 愷愷：台詞裡有這幾個字的全部重做
const todo = all.filter((j) => flag('force') || (match && j.text.includes(match)) || !existing(j.key) || stale(j));
if (match && opt('pron') && cfg.pron !== opt('pron')) {
  // 記住選好的唸法，之後新的台詞也用同一種
  cfg.pron = opt('pron');
  writeFileSync(join(ROOT, 'tools', 'voice-config.json'), JSON.stringify(cfg, null, 2) + '\n');
  console.log(`已記住唸法 ${cfg.pron}（寫進 tools/voice-config.json）`);
}
const nStale = all.filter(stale).length;
console.log(`共 ${all.length} 句，這次要產生 ${todo.length} 句${nStale ? `（其中 ${nStale} 句是台詞改過要重做）` : ''}（模型 ${cfg.model}，${hasFfmpeg ? '輸出 mp3' : '找不到 ffmpeg，輸出 wav'}）`);

if (flag('dry')) {
  todo.forEach((j) => console.log(`  ${j.key}  ←  ${j.text}`));
  // 預估請求次數（同一角色每 BATCH 句串成一次請求；切不開時會多用幾次）
  const est = Object.keys(cfg.characters).reduce((n, c) => n + Math.ceil(todo.filter((j) => j.charId === c).length / BATCH), 0);
  console.log(`預估 ${est} 次請求（每次最多 ${BATCH} 句）`);
} else if (todo.length) {
  if (!KEY) { console.error('請先設定環境變數 GEMINI_API_KEY'); process.exit(1); }
  // 依角色分組，每組再切成每批 BATCH 句
  const batches = [];
  for (const charId of Object.keys(cfg.characters)) {
    const mine = todo.filter((j) => j.charId === charId);
    for (let i = 0; i < mine.length; i += BATCH) batches.push(mine.slice(i, i + BATCH));
  }
  console.log(`分成 ${batches.length} 次請求（每次最多 ${BATCH} 句）`);
  let ok = 0;
  let requests = 0;
  let splitFails = 0;
  const failed = [];
  for (const [i, batch] of batches.entries()) {
    console.log(`[${i + 1}/${batches.length}] ${batch[0].charId} ${batch.length} 句：${batch[0].text}${batch.length > 1 ? ' …' : ''}`);
    try {
      ok += await runBatch(batch);
      requests++;
      splitFails = 0;
    } catch (e) {
      failed.push(...batch.map((j) => j.key));
      console.log(`    失敗：${e.message}`);
      if (e.quota) { console.log(`今天的每日額度用完了，${resetText(e.resetAt)}重置。重置後再執行一次，已完成的會自動跳過。`); break; }
      if (e.split) {
        console.log('    這批的停頓不明顯，可以之後用 --batch 5 或 --single 補做。');
        // 連續兩批都切不開：模型可能沒照停頓唸，先停下來，免得浪費額度
        if (++splitFails >= 2) { console.log('連續兩批切不開，先停下來。請改用：node tools/gen-voice.mjs --batch 5'); break; }
      }
      if (failed.length && ok === 0 && i >= 2) { console.log('連續失敗，先停下來。請把上面的錯誤訊息給 Claude 看。'); break; }
    }
    await sleep(1200);
  }
  console.log(`完成 ${ok} 句${failed.length ? `，失敗 ${failed.length} 句（再執行一次會只補做沒完成的）` : ''}`);
}
console.log(`清單已更新：${writeManifest()} 個語音檔`);
