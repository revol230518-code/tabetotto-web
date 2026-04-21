
const CACHE_VERSION = 'tabetotto-v' + new Date().toISOString().split('T')[0].replace(/-/g, '');
const CACHE_NAME = `tabetotto-cache-${CACHE_VERSION}`;

// キャッシュ対象の静的アセット
// 開発環境と本番環境でパスが異なる可能性があるため注意
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/tabetotto.mascot.svg',
  '/titleicon.svg',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 初期インストール時に静的アセットをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: 静的アセットをキャッシュ中');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // 新しいSWをすぐに有効化
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('tabetotto-cache-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('SW: 古いキャッシュを削除中:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// リクエストのフェッチ
self.addEventListener('fetch', (event) => {
  // POSTリクエストやAPIリクエスト (Gemini等) はキャッシュしない
  if (event.request.method !== 'GET') return;

  // AI解析リクエストなどはネットワーク優先
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュがあれば返す
      if (response) return response;

      // なければネットワークから取得
      return fetch(event.request).then((networkResponse) => {
        // 成功したレスポンスのみキャッシュに保存 (動的キャッシュ)
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // JSやCSSなどの静的ファイル、アイコン類をキャッシュに溜めていく
          if (
            event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|woff2)$/) ||
            event.request.url.includes('/assets/')
          ) {
            cache.put(event.request, responseToCache);
          }
        });

        return networkResponse;
      }).catch(() => {
        // オフライン時のフォールバック (ナビゲーションリクエストの場合のみ index.html を返す)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
