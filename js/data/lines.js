// 台詞表。{name} 會換成正在玩的小孩名字。
// 每句是 { 角色: 台詞 }。語音檔放 assets/voice/<角色>/<台詞id>.mp3；含 {name} 的句子檔名為 <台詞id>.<yy|kk|both>.mp3。
// 角色：shan 閃閃（星星發條玩具、主持人）、wan 晚晚（月亮夜燈娃娃、臥室）
export const LINES = {
  // ---- 開場、選人 ----
  knock: { shan: '叩叩叩！玩具箱裡有人喔！' },
  title: { shan: '明星總動員！歡樂派對！' },
  intro: { shan: '我是閃閃！玩具屋的明星主持人！' },
  who: { shan: '今天誰要來玩呢？' },
  welcome: { shan: '{name}，歡迎來到玩具屋！' },
  short_hi: { shan: '派對開始囉！' },

  // ---- 玩具屋（家） ----
  house_pick: { shan: '要去哪個房間呢？點點看！' },
  house_spin: { shan: '用手指轉轉看，房子會轉喔！' },
  house_bedroom: { shan: '去臥室！找晚晚！' },
  locked: { shan: '這個房間還在準備中，下次再來喔！' },

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
