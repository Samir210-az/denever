const CACHE_NAME = 'denver2-v2';
const urlsToCache = [
  '/denever/',
  '/denever/index.html'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; })
        .map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  var req = event.request;
  var accept = req.headers.get('accept') || '';
  // HTML / naviqasiya: əvvəlcə şəbəkə (həmişə ən yeni), offline-da keşə düş
  if (req.mode === 'navigate' || accept.indexOf('text/html') !== -1) {
    event.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function(c){ c.put(req, copy); });
        return res;
      }).catch(function(){
        return caches.match(req).then(function(r){ return r || caches.match('/denever/index.html'); });
      })
    );
    return;
  }
  // Digər resurslar: əvvəlcə keş, sonra şəbəkə
  event.respondWith(
    caches.match(req).then(function(r){ return r || fetch(req); })
  );
});
