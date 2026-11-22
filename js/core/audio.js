// 聲音引擎：音樂與音效全部用 Web Audio 即時合成，不需要音檔。
// 底層（解鎖、iOS 中斷恢復、說話時壓低音樂）沿用 toon-fun-party 的做法；
// 樂器換成玩具音色（木琴、音樂盒、玩具鋼琴），跟參考專案做出聽覺上的差異。旋律皆為本專案原創。
let ctx = null;
let musicBus, sfxBus, voiceBus;
let noiseBuf = null;

export function getCtx() { return ctx; }
export function getVoiceBus() { return voiceBus; }

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -8; lim.knee.value = 6; lim.ratio.value = 8;
    lim.attack.value = 0.004; lim.release.value = 0.2;
    master.connect(lim).connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = musicBase(); musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(master);
    voiceBus = ctx.createGain(); voiceBus.gain.value = 1; voiceBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    ctx.addEventListener('statechange', () => {
      if (ctx.state !== 'running' && !document.hidden) setTimeout(resumeAudio, 300);
    });
    if (pendingMusic) { const n = pendingMusic; pendingMusic = null; playMusic(n); }
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
}
export function resumeAudio() {
  if (ctx && ctx.state !== 'running' && !document.hidden) ctx.resume().catch(() => {});
}
['touchend', 'pointerup'].forEach((t) => document.addEventListener(t, resumeAudio, { capture: true, passive: true }));
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend().catch(() => {});
  else ctx.resume().catch(() => {});
});

const MUSIC_VOL = { low: 0.4, mid: 0.7, high: 1.1 };
let musicVol = 'mid';
let ducked = false;
function musicBase() { return MUSIC_VOL[musicVol] || MUSIC_VOL.mid; }
export function setMusicVolume(v) {
  musicVol = MUSIC_VOL[v] ? v : 'mid';
  if (ctx) musicBus.gain.setTargetAtTime(musicBase() * (ducked ? duckFactor() : 1), ctx.currentTime, 0.1);
}
const DUCK = { song: 0.6, bg: 0.45, quiet: 0.55 };
function duckFactor() { return DUCK[music && TRACKS[music.name]?.style] ?? DUCK.bg; }
export function duck(on) {
  ducked = on;
  if (!ctx) return;
  musicBus.gain.setTargetAtTime(musicBase() * (on ? duckFactor() : 1), ctx.currentTime, 0.15);
}

// ---------- 基本合成 ----------
function osc(c, dest, freq, t, dur, { type = 'sine', gain = 0.2, attack = 0.01, release = null, lp = 0, to = null } = {}) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  if (release == null) g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  else { g.gain.setValueAtTime(gain, t + Math.max(attack, dur - release)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  let node = o;
  if (lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; f.Q.value = 0.5; o.connect(f); node = f; }
  node.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function hiss(c, nb, dest, t, dur, { freq = 2000, q = 1, gain = 0.2, type = 'bandpass', to = null } = {}) {
  const s = c.createBufferSource();
  s.buffer = nb; s.loop = true;
  const f = c.createBiquadFilter();
  f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + Math.min(0.02, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(dest);
  s.start(t, Math.random());
  s.stop(t + dur + 0.05);
}
const tone = (f, t, dur, o = {}) => osc(ctx, o.dest || sfxBus, f, t, dur, o);
const noise = (t, dur, o = {}) => hiss(ctx, noiseBuf, o.dest || sfxBus, t, dur, o);

// 玩具樂器
const INST = {
  // 木琴：短短的基音＋很快消失的高泛音
  marimba(c, dest, f, t, g) {
    osc(c, dest, f, t, 0.45, { gain: g, attack: 0.004 });
    osc(c, dest, f * 4, t, 0.07, { gain: g * 0.35, attack: 0.002 });
    osc(c, dest, f * 2, t, 0.2, { type: 'triangle', gain: g * 0.18, attack: 0.003 });
  },
  // 音樂盒：高八度、長尾音、亮亮的
  musicbox(c, dest, f, t, g) {
    osc(c, dest, f * 2, t, 1.1, { gain: g * 0.8, attack: 0.003 });
    osc(c, dest, f * 4, t, 0.35, { gain: g * 0.2, attack: 0.002 });
    osc(c, dest, f * 6.01, t, 0.12, { gain: g * 0.08, attack: 0.002 });
  },
  // 玩具鋼琴：有點叮叮的金屬感
  toypiano(c, dest, f, t, g) {
    osc(c, dest, f, t, 0.6, { type: 'triangle', gain: g, attack: 0.004 });
    osc(c, dest, f * 2, t, 0.25, { type: 'square', gain: g * 0.12, attack: 0.003, lp: 3200 });
    osc(c, dest, f * 3.98, t, 0.1, { gain: g * 0.15, attack: 0.002 });
  },
};

// ---------- 音效 ----------
const SFX = {
  tap: (t) => INST.marimba(ctx, sfxBus, 784, t, 0.28),
  pop: (t) => tone(900 + Math.random() * 400, t, 0.09, { to: 260, gain: 0.3 }),
  sparkle: (t) => [1568, 1976, 2349, 3136].forEach((f, i) => tone(f, t + i * 0.06, 0.35, { gain: 0.12 })),
  star: (t) => [784, 988, 1175, 1568, 1976].forEach((f, i) => INST.musicbox(ctx, sfxBus, f / 2, t + i * 0.07, 0.2)),
  fanfare: (t) => {
    [523, 659, 784, 1047].forEach((f, i) => INST.toypiano(ctx, sfxBus, f, t + i * 0.12, 0.3));
    [1047, 1319, 1568].forEach((f) => INST.toypiano(ctx, sfxBus, f, t + 0.55, 0.22));
  },
  soft: (t) => { tone(440, t, 0.18, { type: 'triangle', to: 360, gain: 0.18 }); tone(392, t + 0.16, 0.24, { type: 'triangle', to: 330, gain: 0.15 }); },
  whoosh: (t) => noise(t, 0.4, { freq: 400, to: 3000, q: 0.7, gain: 0.2 }),
  boing: (t) => tone(260, t, 0.4, { to: 880, gain: 0.22 }),
  clap: (t) => [0, 0.012, 0.024].forEach((d) => noise(t + d, 0.06, { freq: 1500, q: 0.9, gain: 0.45 })),
  applause: (t) => { for (let i = 0; i < 36; i++) noise(t + Math.random() * 1.4, 0.05, { freq: 1500 + Math.random() * 2500, q: 1.2, gain: 0.14 }); },
  click: (t) => { tone(1800, t, 0.03, { type: 'square', gain: 0.08 }); noise(t, 0.03, { freq: 3000, q: 2, gain: 0.2 }); },
  curtain: (t) => noise(t, 0.6, { freq: 900, to: 2400, q: 0.6, gain: 0.22 }),
  // 上發條：喀喀喀
  windup: (t) => { for (let i = 0; i < 8; i++) { noise(t + i * 0.07, 0.025, { freq: 4200, q: 5, gain: 0.25 }); tone(2400, t + i * 0.07, 0.02, { type: 'square', gain: 0.03 }); } },
  // 玩具放上木頭架子
  knock: (t) => { tone(420, t, 0.12, { to: 300, gain: 0.35 }); noise(t, 0.05, { freq: 1200, q: 2, gain: 0.25 }); },
  squish: (t) => { noise(t, 0.25, { freq: 500, to: 250, q: 1, gain: 0.3 }); tone(200, t, 0.2, { to: 120, gain: 0.15 }); },
  ding: (t) => { INST.musicbox(ctx, sfxBus, 659, t, 0.28); INST.musicbox(ctx, sfxBus, 523, t + 0.22, 0.25); },
  giggle: (t) => [0, 0.09, 0.18, 0.27].forEach((d, i) => tone(900 + i * 80, t + d, 0.07, { to: 1200 + i * 80, gain: 0.08 })),
  open: (t) => { tone(220, t, 0.25, { to: 520, gain: 0.15 }); noise(t, 0.2, { freq: 800, q: 1, gain: 0.15 }); },
};
export function sfx(name) {
  if (!ctx || ctx.state !== 'running') return;
  SFX[name]?.(ctx.currentTime + 0.005);
}

// ---------- 音樂 ----------
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function hz(name) {
  const m = /^([A-G])(#?)(\d)$/.exec(name);
  const semi = NOTE[m[1]] + (m[2] ? 1 : 0) + (parseInt(m[3], 10) + 1) * 12;
  return 440 * Math.pow(2, (semi - 69) / 12);
}
const seq = (s) => s.trim().split(/\s+/);

// 每格是八分音符，'.' 是休止。style：song 活動歌（鼓明顯）、bg 背景（輕鼓）、quiet 安靜（不打鼓）
const TRACKS = {
  // 開場、派對：玩具鋼琴
  party: {
    style: 'song', bpm: 128, inst: 'toypiano', gain: 0.24,
    melody: seq('C5 C5 E5 G5 . G5 A5 G5 E5 . C5 . D5 E5 D5 .  F5 F5 A5 C6 . A5 G5 E5 D5 . G5 . C5 . . .'),
    bass: seq('C3 . G2 . C3 . G2 . A2 . E2 . G2 . G2 .  F2 . C3 . F2 . C3 . G2 . D3 . C3 . . .'),
  },
  // 家：木琴
  house: {
    style: 'bg', bpm: 108, inst: 'marimba', gain: 0.26,
    melody: seq('C5 . E5 G5 . E5 A5 . G5 . E5 . D5 . C5 .  D5 . F5 A5 . F5 G5 . E5 . C5 . D5 . . .  C5 . E5 G5 . E5 C6 . A5 . G5 . E5 . D5 .  C5 . D5 E5 . G5 E5 . D5 . C5 . . . . .'),
    bass: seq('C3 . . . G2 . . . F2 . . . C3 . . .  D3 . . . A2 . . . G2 . . . G2 . . .  C3 . . . E3 . . . F2 . . . G2 . . .  F2 . . . G2 . . . C3 . . . . . . .'),
  },
  // 臥室白天：音樂盒
  bedroom: {
    style: 'quiet', bpm: 88, inst: 'musicbox', gain: 0.2,
    melody: seq('G4 . C5 . E5 . D5 C5 D5 . . . G4 . . .  A4 . D5 . F5 . E5 D5 E5 . . . . . . .  G4 . C5 . E5 . G5 . A5 . G5 . E5 . . .  F5 . E5 . D5 . B4 . C5 . . . . . . .'),
    bass: seq('C3 . . . . . . . G2 . . . . . . .  D3 . . . . . . . A2 . . . . . . .  C3 . . . . . . . F2 . . . . . . .  G2 . . . . . . . C3 . . . . . . .'),
  },
  // 晚上、休息：慢慢的音樂盒搖籃曲
  lullaby: {
    style: 'quiet', bpm: 62, inst: 'musicbox', gain: 0.17,
    melody: seq('E5 . . D5 C5 . . . D5 . . E5 G5 . . .  E5 . . D5 C5 . . . A4 . . G4 C5 . . .'),
    bass: seq('C3 . . . . . . . G2 . . . . . . .  A2 . . . . . . . F2 . . . G2 . . .'),
  },
  // 收玩具歌：木琴＋鼓
  cleanup: {
    style: 'song', bpm: 122, inst: 'marimba', gain: 0.28,
    melody: seq('G5 E5 G5 E5 C5 . D5 E5 F5 D5 F5 D5 B4 . C5 D5  E5 C5 E5 G5 A5 . G5 E5 D5 . G4 . C5 . . .'),
    bass: seq('C3 . G3 . C3 . G3 . G2 . D3 . G2 . D3 .  A2 . E3 . F2 . C3 . G2 . G2 . C3 . . .'),
  },
  // 晚晚說：很輕，讓小孩聽得清楚口令
  listen: {
    style: 'quiet', bpm: 76, inst: 'marimba', gain: 0.12,
    melody: seq('C5 . . . G4 . . . A4 . . . E4 . . .  F4 . . . C5 . . . D5 . . . G4 . . .'),
    bass: seq('C3 . . . . . . . A2 . . . . . . .  F2 . . . . . . . G2 . . . . . . .'),
  },
};

const STYLE = {
  song: { pad: 0.06, bass: 0.24, kick: 0.8, clap: 0.28, hat: 0.06 },
  bg: { pad: 0.05, bass: 0.22, kick: 0.45, clap: 0.12, hat: 0.04 },
  quiet: { pad: 0.06, bass: 0.17, kick: 0, clap: 0, hat: 0 },
};

function kick(c, dest, t, gain) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.setValueAtTime(160, t);
  o.frequency.exponentialRampToValueAtTime(48, t + 0.13);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g).connect(dest);
  o.start(t); o.stop(t + 0.25);
  osc(c, dest, 330, t, 0.05, { type: 'triangle', gain: gain * 0.25, attack: 0.002 });
}
function clapHit(c, nb, dest, t, gain) {
  [0, 0.011, 0.022].forEach((d) => hiss(c, nb, dest, t + d, 0.03, { freq: 1500, q: 0.9, gain }));
  hiss(c, nb, dest, t + 0.03, 0.14, { freq: 1300, q: 0.7, gain: gain * 0.6 });
}

function scheduleStep(c, nb, dest, tr, i, t, stepDur) {
  const st = STYLE[tr.style] || STYLE.bg;
  const n = tr.melody[i % tr.melody.length];
  const b = tr.bass[i % tr.bass.length];
  if (n !== '.') INST[tr.inst](c, dest, hz(n), t, tr.gain);
  if (b !== '.') {
    const f = hz(b);
    osc(c, dest, f, t, stepDur * 1.9, { type: 'triangle', gain: st.bass });
    osc(c, dest, f * 2, t, stepDur * 1.5, { type: 'sine', gain: st.bass * 0.4 });
  }
  if (i % 4 === 0 && b !== '.') {
    let root = hz(b);
    while (root < 220) root *= 2;
    const len = stepDur * 4;
    [1, 1.5, 2].forEach((m, k) => osc(c, dest, root * m, t, len, { type: 'triangle', gain: st.pad * (k === 0 ? 1 : 0.7), attack: 0.06, release: 0.12, lp: 1600 }));
  }
  const pos = i % 8;
  if (st.kick && (pos === 0 || pos === 4)) kick(c, dest, t, st.kick);
  if (st.clap && (pos === 2 || pos === 6)) clapHit(c, nb, dest, t, st.clap);
  if (st.hat && pos % 2 === 1) hiss(c, nb, dest, t, 0.045, { freq: 8000, q: 0.8, gain: st.hat, type: 'highpass' });
}

let music = null;
let pendingMusic = null;
export function playMusic(name) {
  if (!ctx) { pendingMusic = name; return; }
  if (music?.name === name) return;
  stopMusic();
  const tr = TRACKS[name];
  if (!tr) return;
  const bus = ctx.createGain();
  bus.gain.value = 0.0001;
  bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.8);
  bus.connect(musicBus);
  const stepDur = 60 / tr.bpm / 2;
  const m = { name, bus, step: 0, next: ctx.currentTime + 0.1, timer: null };
  const tick = () => {
    if (m.next < ctx.currentTime - 0.2) m.next = ctx.currentTime + 0.05;
    while (m.next < ctx.currentTime + 0.25) {
      scheduleStep(ctx, noiseBuf, bus, tr, m.step, m.next, stepDur);
      m.step++;
      m.next += stepDur;
    }
  };
  m.timer = setInterval(tick, 80);
  tick();
  music = m;
  if (ducked) duck(true);
}
export function stopMusic() {
  pendingMusic = null;
  if (!music) return;
  const m = music;
  music = null;
  clearInterval(m.timer);
  m.bus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
  setTimeout(() => m.bus.disconnect(), 1500);
}
