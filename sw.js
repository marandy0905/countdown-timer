// Offline support. HTML is network-first (so deploys show up immediately); audio and icons are cache-first.
const CACHE = 'countdown-v2';
const clips = [
  ...Array.from({ length: 60 }, (_, i) => `audio/n${i + 1}.mp3`),
  'audio/timeup.mp3', 'audio/go.mp3',
  ...Array.from({ length: 99 }, (_, i) => `audio/ready${i + 1}.mp3`),
];
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon.svg', 'icons/apple-touch-icon.png',
               'icons/icon-192.png', 'icons/icon-512.png', ...clips];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put('index.html', copy));
      return res;
    }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
