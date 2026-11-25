// 全域設定。家長頁可調的項目存在 store.settings，這裡是預設值。
export const STAGE_H = 900;          // 舞台高度固定 900，寬度依螢幕比例（至少 1200）
export const KEY = 'spk';           // localStorage 前綴：跟 toon-fun-party（tfp-）同網域，不能重複

export const DEFAULT_SETTINGS = {
  sessionMin: 15,   // 每次可以玩幾分鐘（閃閃的發條轉完）
  restMin: 60,      // 發條轉完要休息幾分鐘
  bedtime: 21,      // 幾點後玩具都睡了
  wake: 6,          // 幾點起床
  musicVol: 'mid',  // 音樂大小：low、mid、high
  quiet: false,     // 安靜模式：關掉背景音樂和裝飾音效，只留角色說話和對錯的聲音
  nolimit: false,   // 測試用：不限制遊玩時間
  traffic: true,
  birthdays: {},    // 生日（11/25）：{ yy, kk, dad, mom, grandma: 'YYYY-MM-DD' }，只在家長頁輸入，不寫進程式
  realGift: true,   // 生日、聖誕節拆完遊戲裡的禮物，提醒「去找爸爸媽媽，還有一個真的禮物」    // 城市路上有車在跑（11/25）；覺得會分心可以在家長頁關掉
  gestureTip: true, // 每天第一次打開時，跟閃閃練習手勢（轉、拉近拉遠、移動）
};

// 兩兄弟。代表色（11/24）：岳岳喜歡藍色、白色；愷愷喜歡紅色、橘色、黃色。
export const KIDS = {
  yy: { id: 'yy', name: '岳岳', age: 8, level: 'hard', color: '#2f7fe0', soft: '#e3efff', side: 'left' },
  kk: { id: 'kk', name: '愷愷', age: 5, level: 'easy', color: '#ff6a2b', soft: '#ffefb0', side: 'right' },
};
export const PROFILES = {
  yy: { id: 'yy', members: ['yy'], level: 'hard' },
  kk: { id: 'kk', members: ['kk'], level: 'easy' },
  both: { id: 'both', members: ['yy', 'kk'], level: 'easy' },
};
export const NAMES = { yy: '岳岳', kk: '愷愷', both: '岳岳、愷愷' };

// 玩具明星。tts 是還沒有語音檔時，裝置內建語音的音高與語速
export const CHARACTERS = {
  shan: { id: 'shan', name: '閃閃', tts: { pitch: 1.6, rate: 1.12 } },   // 星星發條玩具，主持人
  wan: { id: 'wan', name: '晚晚', tts: { pitch: 1.15, rate: 0.85 } },    // 月亮夜燈娃娃，臥室
  gua: { id: 'gua', name: '呱呱', tts: { pitch: 1.45, rate: 1.05 } },   // 橡皮小鴨，廁所
  dong: { id: 'dong', name: '咚咚', tts: { pitch: 0.75, rate: 0.92 } },  // 小恐龍主廚，廚房
  bibi: { id: 'bibi', name: '嗶嗶', tts: { pitch: 1.0, rate: 0.95 } },   // 機器人老師，學堂
  baba: { id: 'baba', name: '叭叭', tts: { pitch: 1.3, rate: 1.08 } },   // 遙控車，載大家去各個地方
  dada: { id: 'dada', name: '達達', tts: { pitch: 1.1, rate: 1.0 } },    // 木頭小馬，農場
  duoduo: { id: 'duoduo', name: '多多', tts: { pitch: 1.35, rate: 1.0 } },// 存錢筒小豬，超市
  baobao: { id: 'baobao', name: '抱抱', tts: { pitch: 0.95, rate: 0.9 } },// 泰迪熊護理師，醫院（謝醫生的小幫手）
  xie: { id: 'xie', name: '謝醫生', tts: { pitch: 0.85, rate: 0.9 } },      // 小兒科醫生，醫院裡唯一的人類角色
  jiujiu: { id: 'jiujiu', name: '啾啾', tts: { pitch: 1.7, rate: 1.1 } },  // 發條小鳥，公園
  shao: { id: 'shao', name: '哨哨', tts: { pitch: 1.0, rate: 1.0 } },     // 玩具警察狗，警察局（原創角色）
  huahua: { id: 'huahua', name: '嘩嘩', tts: { pitch: 0.9, rate: 1.0 } },   // 玩具消防栓，消防局
  xiuxiu: { id: 'xiuxiu', name: '咻咻', tts: { pitch: 1.4, rate: 1.1 } },   // 玩具捷運車廂，捷運站
  gugu: { id: 'gugu', name: '咕咕', tts: { pitch: 1.1, rate: 0.9 } },       // 戴眼鏡的貓頭鷹，圖書館
  xinxin: { id: 'xinxin', name: '信信', tts: { pitch: 1.2, rate: 1.0 } },   // 綠色郵筒，郵局
  baibai: { id: 'baibai', name: '白白', tts: { pitch: 1.4, rate: 1.0 } },   // 玩具白鯨，海生館
  jiajia: { id: 'jiajia', name: '夾夾', tts: { pitch: 1.6, rate: 1.15 } },  // 玩具小螃蟹，沙灘
  zhuzhu: { id: 'zhuzhu', name: '竹竹', tts: { pitch: 1.2, rate: 0.95 } },  // 玩具熊貓，動物園
};
