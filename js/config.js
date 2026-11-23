// 全域設定。家長頁可調的項目存在 store.settings，這裡是預設值。
export const STAGE_H = 900;          // 舞台高度固定 900，寬度依螢幕比例（至少 1200）
export const KEY = 'spk';           // localStorage 前綴：跟 toon-fun-party（tfp-）同網域，不能重複

export const DEFAULT_SETTINGS = {
  sessionMin: 15,   // 每次可以玩幾分鐘（閃閃的發條轉完）
  restMin: 60,      // 發條轉完要休息幾分鐘
  bedtime: 21,      // 幾點後玩具都睡了
  wake: 6,          // 幾點起床
  musicVol: 'mid',  // 音樂大小：low、mid、high
  nolimit: false,   // 測試用：不限制遊玩時間
};

// 兩兄弟。代表色是暫定（11/23 John：之後再調整）
export const KIDS = {
  yy: { id: 'yy', name: '岳岳', age: 8, level: 'hard', color: '#ff8a3d', soft: '#ffe0c7', side: 'left' },
  kk: { id: 'kk', name: '凱凱', age: 5, level: 'easy', color: '#1fa7c9', soft: '#c9f0fa', side: 'right' },
};
export const PROFILES = {
  yy: { id: 'yy', members: ['yy'], level: 'hard' },
  kk: { id: 'kk', members: ['kk'], level: 'easy' },
  both: { id: 'both', members: ['yy', 'kk'], level: 'easy' },
};
export const NAMES = { yy: '岳岳', kk: '凱凱', both: '岳岳、凱凱' };

// 玩具明星。tts 是還沒有語音檔時，裝置內建語音的音高與語速
export const CHARACTERS = {
  shan: { id: 'shan', name: '閃閃', tts: { pitch: 1.6, rate: 1.12 } },   // 星星發條玩具，主持人
  wan: { id: 'wan', name: '晚晚', tts: { pitch: 1.15, rate: 0.85 } },    // 月亮夜燈娃娃，臥室
  gua: { id: 'gua', name: '呱呱', tts: { pitch: 1.45, rate: 1.05 } },   // 橡皮小鴨，廁所
  dong: { id: 'dong', name: '咚咚', tts: { pitch: 0.75, rate: 0.92 } },  // 小恐龍主廚，廚房
  bibi: { id: 'bibi', name: '嗶嗶', tts: { pitch: 1.0, rate: 0.95 } },   // 機器人老師，學堂
};
