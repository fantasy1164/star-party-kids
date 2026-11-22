// 台詞表。{name} 會換成正在玩的小孩名字。
// 每句是 { 角色: 台詞 }。語音檔放 assets/voice/<角色>/<台詞id>.mp3；含 {name} 的句子檔名為 <台詞id>.<yy|kk|both>.mp3。
// 角色：shan 閃閃（星星發條玩具、主持人）、wan 晚晚（月亮夜燈娃娃、臥室）
export const LINES = {
  // ---- 開場、選人 ----
  knock: { shan: '叩叩叩！玩具箱裡有人喔！' },
  title: { shan: '明星總動員！歡樂派對！' },
  intro: { shan: '我是閃閃！明星小鎮的主持人！' },
  who: { shan: '今天誰要來玩呢？' },
  welcome: { shan: '{name}，歡迎來到明星小鎮！' },
  short_hi: { shan: '派對開始囉！' },

  // ---- 家 ----
  house_pick: { shan: '要去哪個房間呢？點點看！' },
  house_spin: { shan: '用手指轉轉看，房子會轉喔！' },
  house_bedroom: { shan: '去臥室！找晚晚！' },
  house_bath: { shan: '去浴室！找呱呱！' },
  house_kitchen: { shan: '去廚房！找咚咚！' },
  house_living: { shan: '去客廳！閃閃的舞台！' },

  // ---- 臥室：打招呼、選關卡 ----
  bed_hello_morning: { wan: '早安，{name}。我是夜燈晚晚。我們一起準備出門吧。' },
  bed_hello_day: { wan: '{name}，你好。我是夜燈晚晚。來臥室玩吧。' },
  bed_hello_evening: { wan: '{name}，晚上好。快要睡覺囉，我們一起準備。' },
  bed_pick: { wan: '要先做哪一個呢？' },
  bed_next: { wan: '下一個要做什麼呢？' },
  bed_all_done: { wan: '臥室的事情全部做完了，好厲害。', shan: '你是今天的大明星！' },
  bed_go_sleep: { wan: '現在去真的刷牙、上廁所，上床睡覺吧。晚安。' },
  bed_go_out: { wan: '現在去真的換衣服，準備出門吧。' },

  // ---- 收玩具 ----
  toys_go: { wan: '玩具們玩累了。把它們送回架子上的家。' },
  toys_go_hard: { wan: '把玩具送回架子上。要放在一樣形狀的影子上喔。' },
  toys_wrong: { wan: '形狀不一樣喔，再找找看。' },
  toys_hint: { wan: '看看架子上，哪個影子跟它一樣？' },
  toys_hidden: { wan: '咦？還有玩具躲起來了。轉轉房間，找找看！' },
  toys_found: { shan: '找到了！眼睛好厲害！' },
  toys_done: { wan: '玩具都回家了，房間好整齊。' },

  // ---- 換衣服 ----
  dress_day: { wan: '要換衣服囉！選白天穿的衣服。' },
  dress_night: { wan: '要睡覺囉！換上睡衣。' },
  dress_order_day: { wan: '照順序穿喔：先穿上衣，再穿褲子，最後穿襪子。' },
  dress_order_night: { wan: '照順序穿喔：先穿睡衣，再穿睡褲，最後戴睡帽。' },
  dress_not_day: { wan: '這是睡覺穿的喔。現在是白天。' },
  dress_not_night: { wan: '這是白天穿的喔。睡覺要穿睡衣。' },
  dress_order_wrong: { wan: '還不是這件。看看上面亮亮的是哪一件？' },
  dress_done_day: { wan: '穿好了，好帥氣！' },
  dress_done_night: { wan: '換好睡衣了，好舒服。' },

  // ---- 晚晚說 ----
  simon_rule: { wan: '我們來玩晚晚說。聽到「晚晚說」，才可以做喔！' },
  simon_rule_hard: { wan: '我們來玩晚晚說。一定要聽到「晚晚說」才可以做。我沒有說，也不算喔！' },
  simon_shan: { shan: '嘿嘿，閃閃也要玩！我會偷偷騙你喔！' },
  s_pillow: { wan: '晚晚說，拍拍枕頭。' },
  t_pillow: { shan: '拍拍枕頭！', wan: '拍拍枕頭。' },
  s_curtain: { wan: '晚晚說，拉拉窗簾。' },
  t_curtain: { shan: '拉拉窗簾！', wan: '拉拉窗簾。' },
  s_lamp: { wan: '晚晚說，摸摸晚晚。' },
  t_lamp: { shan: '摸摸晚晚！', wan: '摸摸晚晚。' },
  s_clap: { wan: '晚晚說，拍拍手。' },
  t_clap: { shan: '拍拍手！', wan: '拍拍手。' },
  s_light_off: { wan: '晚晚說，關燈。' },
  s_sun_in: { wan: '晚晚說，打開窗簾，讓太陽進來。' },
  s_dance: { wan: '晚晚說，站起來轉一圈，再拍拍手。' },
  simon_held: { shan: '哇！沒有被騙到！耳朵好厲害！' },
  simon_got: { shan: '哈哈，被我騙到了！沒關係，再來！' },
  simon_got_wan: { wan: '嘻嘻，我剛剛沒有說「晚晚說」喔。再來！' },
  simon_timeout: { wan: '剛剛晚晚有說喔。' },
  where_pillow: { wan: '枕頭在床上喔。' },
  where_curtain: { wan: '窗簾在窗戶旁邊喔。' },
  where_lamp: { wan: '晚晚在這裡喔。' },
  where_clap: { wan: '點下面的小手，拍拍手。' },
  simon_done_night: { wan: '好暗喔，星星亮起來了。晚安，{name}。' },
  simon_done_morning: { wan: '太陽進來了！早安，{name}！' },
  simon_done_day: { wan: '好好玩！你的耳朵最棒了。' },

  // ================= 廁所（呱呱） =================
  bath_hello_morning: { gua: '呱呱！早安，{name}！我是浴室的小鴨呱呱，一起變乾淨吧！' },
  bath_hello_day: { gua: '呱呱！{name}，我是浴室的小鴨呱呱，歡迎來浴室！' },
  bath_hello_evening: { gua: '呱呱！{name}，晚上好！睡覺前要洗得香香的喔！' },
  bath_pick: { gua: '要先做哪一個呢？呱呱！' },
  bath_next: { gua: '下一個要做什麼呢？' },
  bath_all_done: { gua: '浴室的事情都做完了！你是愛乾淨的明星！', shan: '香香的大明星！' },
  bath_go_brush: { gua: '現在去真的刷牙、洗手吧，呱呱！' },
  gua_quack: { gua: '呱呱！' },
  // 刷牙
  brush_go: { gua: '牙齒上有細菌小怪獸！拿起牙刷，來回刷刷，把它們刷掉！' },
  brush_here: { gua: '刷刷亮亮的地方！' },
  brush_next: { gua: '這邊乾淨了，換那邊！' },
  brush_done: { gua: '牙齒亮晶晶！細菌都跑光了！' },
  brush_real: { gua: '現在去拿真的牙刷，跟呱呱一起刷兩分鐘喔！' },
  brush_real_up: { gua: '先刷上面的牙齒，一顆一顆慢慢刷。' },
  brush_real_down: { gua: '換刷下面的牙齒。' },
  brush_real_in: { gua: '裡面也要刷喔，還有大牙。' },
  brush_real_tongue: { gua: '最後輕輕刷一下舌頭。' },
  brush_real_done: { gua: '刷好了！漱漱口，牙齒好乾淨！' },
  // 洗手
  wash_go: { gua: '我們來洗手！上面的圖是洗手的步驟喔。' },
  wash_s1: { gua: '先打開水，把手弄濕。' },
  wash_s1_off: { gua: '抹肥皂的時候，先把水關起來，比較省水。' },
  wash_s2: { gua: '擠一點肥皂。' },
  wash_s3: { gua: '搓搓搓！在手上來回搓，搓出好多泡泡！' },
  wash_s3_more: { gua: '手心、手背、指縫，都要搓喔！' },
  wash_s4: { gua: '打開水，把泡泡沖乾淨。' },
  wash_s5: { gua: '最後用毛巾擦乾。' },
  wash_wrong: { gua: '還不是這個喔，看看上面亮亮的步驟。' },
  wash_done: { gua: '洗好了！小手香香的！' },
  // 找危險
  haz_go: { gua: '浴室裡藏了三個危險的東西！找出來，點一下就會變安全。' },
  haz_puddle: { gua: '地上有水，踩到會滑倒！擦乾就安全了。' },
  haz_soap: { gua: '肥皂掉在地上，踩到會滑倒！放回肥皂盒。' },
  haz_dryer: { gua: '吹風機不能放在水旁邊，會觸電！拔掉插頭收好。' },
  haz_hidden: { gua: '還有一個危險躲起來了！轉轉房間，找找看！' },
  haz_done: { gua: '浴室變安全了！你的眼睛好厲害！' },

  // ================= 廚房（咚咚） =================
  kit_hello_morning: { dong: '咚咚！早安，{name}！我是小廚師咚咚，早餐要吃得好喔！' },
  kit_hello_day: { dong: '咚咚！{name}，我是小廚師咚咚，歡迎來廚房！' },
  kit_hello_evening: { dong: '咚咚！{name}，晚餐時間到了！我好餓喔！' },
  kit_pick: { dong: '要先做哪一個呢？' },
  kit_next: { dong: '下一個呢？咚咚！' },
  kit_all_done: { dong: '廚房的事情都做完了！你是好棒的小幫手！', shan: '廚房小明星！' },
  dong_hungry: { dong: '肚子餓了，咕嚕咕嚕。' },
  // 我的餐盤
  plate_go: { dong: '幫我裝一盤營養的餐點！把食物放進餐盤裡對的那一格。' },
  plate_go_hard: { dong: '幫我裝一盤營養的餐點！蔬菜、主食、豆魚蛋肉、水果，每一格都要有喔。' },
  plate_is_veg: { dong: '這是蔬菜喔，放到綠色的那一格。' },
  plate_is_grain: { dong: '這是主食喔，放到黃色的那一格。' },
  plate_is_protein: { dong: '這是豆魚蛋肉喔，放到粉紅色的那一格。' },
  plate_is_fruit: { dong: '這是水果喔，放到橘色的那一格。' },
  plate_junk: { dong: '這是零食，不是正餐喔。偶爾吃一點點就好。' },
  plate_eat: { dong: '我要開動了！啊嗚啊嗚，好好吃！' },
  plate_done: { dong: '吃飽飽！有蔬菜、有主食、有肉、有水果，身體好健康！' },
  // 擺餐具
  table_go: { dong: '爸爸、媽媽、阿嬤要來吃飯了！幫他們擺碗和筷子。照桌上的虛線放喔。' },
  table_go_hard: { dong: '爸爸、媽媽、阿嬤要來吃飯了！每個人都要有碗、筷子和湯匙。照桌上的虛線放喔。' },
  table_wrong: { dong: '形狀不一樣喔，看看桌上的虛線。' },
  table_done: { dong: '擺好了！開飯囉！謝謝你幫忙！' },
  // 什麼能摸
  safe_go: { dong: '檯子上的東西會滑過來。可以吃的，點一下放進籃子；熱的、尖尖的，不要碰！' },
  k_hot_pot: { dong: '燙燙！鍋子很熱，不能摸！' },
  k_knife: { dong: '小心！刀子很利，不能拿！' },
  k_hot_kettle: { dong: '燙燙！熱水壺很燙，不能碰！' },
  safe_skip_good: { dong: '沒有碰，好棒！' },
  safe_done: { dong: '籃子裡都是好吃的！你知道什麼能摸，好安全！' },

  // ================= 客廳（閃閃） =================
  liv_hello_morning: { shan: '早安，{name}！這裡是客廳，閃閃的舞台！' },
  liv_hello_day: { shan: '{name}，歡迎來到客廳！這裡是閃閃的舞台！' },
  liv_hello_evening: { shan: '{name}，晚上好！客廳時間到囉！' },
  liv_pick: { shan: '要先玩哪一個呢？' },
  liv_next: { shan: '下一個玩什麼呢？' },
  liv_all_done: { shan: '客廳的挑戰全部完成！你是今天的超級明星！' },
  // 關電視
  tv_go: { shan: '我們來練習：看電視的時候，鬧鐘一響，就用遙控器把電視關掉！門鈴、電話響不算喔！' },
  tv_not_yet: { shan: '鬧鐘還沒響喔，再看一下下。' },
  tv_good: { shan: '時間到就關電視，好厲害！' },
  tv_good2: { shan: '說關就關，真是守約定的明星！' },
  tv_late: { shan: '鬧鐘響了，要關電視喔！' },
  tv_doorbell: { shan: '那是門鈴，不是鬧鐘喔。' },
  tv_phone: { shan: '那是電話，不是鬧鐘喔。' },
  tv_held: { shan: '沒有被騙到！耳朵好靈！' },
  tv_again: { shan: '再開一下下，繼續練習。' },
  tv_done: { shan: '真的看電視的時候，鬧鐘響了也要自己關掉喔！' },
  // 誰按電鈴
  door_go: { shan: '叮咚！有人按電鈴。先從門上的小洞看看是誰。認識的家人可以開門；不認識的人不開門，要去找大人！' },
  door_ring: { shan: '叮咚！是誰呢？' },
  door_dad: { shan: '是爸爸！可以開門！' },
  door_mom: { shan: '是媽媽！可以開門！' },
  door_grandma: { shan: '是阿嬤！可以開門！' },
  door_family_adult: { shan: '去找大人也很好！不過是家人喔，可以開門。' },
  door_stranger_good: { shan: '對！不認識的人不開門，要去找大人！' },
  door_courier_good: { shan: '對！送東西的人也一樣，要請大人來開門。' },
  door_stranger_stop: { shan: '等一下！不認識的人，不可以開門喔！要去找大人。' },
  door_done: { shan: '你會保護自己，好棒！家人都到齊了！' },
  // 明星舞台
  stage_go: { shan: '歡迎來到明星舞台！先跟著閃閃做動作，再跟著拍子打鼓！' },
  move_up: { shan: '跟我做！雙手舉高高！' },
  move_jump: { shan: '跟我做！原地跳三下！' },
  move_spin: { shan: '跟我做！轉一圈！' },
  move_squat: { shan: '跟我做！蹲下來，再站起來！' },
  move_good: { shan: '做得好！' },
  drum_go: { shan: '跟著拍子打鼓！球掉到鼓上的時候，咚！' },
  drum_great: { shan: '拍子好準！你是鼓手明星！' },
  drum_ok: { shan: '打得好開心！' },
  stage_done: { shan: '表演結束！大家給你拍拍手！' },

  // ---- 通用 ----
  praise1: { shan: '好棒！', wan: '好棒喔。' },
  praise2: { shan: '超厲害！', wan: '做得真好。' },
  praise3: { shan: '耶！成功了！', wan: '你好厲害。' },
  star: { shan: '得到一顆星星！' },
  star_both: { shan: '兩個人都得到星星！' },

  // ---- 輪流 ----
  turn_first: { shan: '{name}，換你囉！' },
  turn_next: { shan: '換{name}！' },
  cheer_thanks: { shan: '謝謝啦啦隊！' },

  // ---- 時間 ----
  one_more: { shan: '我的發條快轉完了，再玩一個就休息囉。' },
  rest: { shan: '發條轉完了，閃閃要休息一下。等鑰匙轉好，再一起玩！你也去動一動吧！' },
  rest_wait: { shan: '還沒轉好喔，再等一下下。' },
  rest_ready: { shan: '發條轉好了！可以玩囉！' },
  sleep: { wan: '噓，玩具們都睡著了。{name}也去睡覺吧，晚安。' },
};

export function lineText(id, charId, name = '') {
  const l = LINES[id];
  const t = typeof l === 'string' ? l : l?.[charId];
  return t ? t.replaceAll('{name}', name) : '';
}
export function lineHasName(id, charId) {
  const l = LINES[id];
  const t = typeof l === 'string' ? l : l?.[charId];
  return !!t && t.includes('{name}');
}
