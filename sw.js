// 離線快取：有網路時一律抓最新版並更新快取，沒網路時用快取。
// 快取名稱用 spk-（toon-fun-party 是 tfp-，同一個網域不能撞名）。新增檔案時加進 CORE，並把版本號加一。
const CACHE = 'spk-v57';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/main.css',
  'js/main.js', 'js/config.js',
  'js/core/audio.js', 'js/core/clock.js', 'js/core/dom.js', 'js/core/session.js', 'js/core/store.js', 'js/core/sync.js', 'js/core/turns.js', 'js/core/voice.js',
  'js/engine/diorama.js', 'js/engine/glscene.js', 'js/engine/csspaint.js', 'js/data/lines.js', 'js/data/cast.js', 'js/art/stars.js', 'js/art/props.js', 'js/art/more.js',
  'js/ui/hud.js', 'js/ui/opening.js', 'js/ui/house.js', 'js/ui/rest.js', 'js/ui/parent.js', 'js/ui/timemachine.js', 'js/ui/report.js', 'js/ui/charts.js', 'js/ui/mood.js', 'js/ui/install.js', 'js/ui/gestures.js',
  'js/scenes/room-base.js', 'js/scenes/bedroom.js', 'js/scenes/bedroom-set.js', 'js/scenes/bathroom.js', 'js/scenes/kitchen.js', 'js/scenes/living.js', 'js/scenes/school.js', 'js/core/mult.js', 'js/core/stats.js', 'js/scenes/kit.js', 'js/scenes/town.js', 'js/scenes/places.js', 'js/art/town.js', 'js/art/doctor.js', 'js/art/traffic.js', 'js/art/festival.js', 'js/core/festival.js', 'js/scenes/festival.js', 'js/scenes/traffic.js', 'js/art/fun.js', 'js/scenes/fun.js', 'js/art/world.js', 'js/scenes/world.js', 'js/scenes/city.js', 'js/scenes/fame.js', 'js/scenes/nature.js', 'js/art/house.js',
  'assets/voice/manifest.json', 'assets/icons/icon-180.png', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('spk-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});
