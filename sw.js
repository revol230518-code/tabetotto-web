
const CACHE_VERSION = 'v1.0.1-' + new Date().getTime(); // 起動毎に確実に更新（またはデプロイ毎にここを手動更新）
const CACHE_NAME = `tabetotto-cache-${CACHE_VERSION}`;

// キャッシュ対象の静的アセット
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

/**
 * Service Worker:
 * PWA 2回目起動時の白画面問題を解決するための構成
 */

// 初期インストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: プリキャッシュ開始');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// キャッシュクリーンアップ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((allCaches) => {
      return Promise.all(
        allCaches
          .filter((name) => name.startsWith('tabetotto-cache-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// リクエスト処理
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // GET以外や外部API（Gemini）は無視
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.includes('/api/')) {
    return;
  }

  // Navigation (HTMLページ) リクエスト: Network-First
  // index.html が古いキャッシュに固定されることによる白画面（アセットハッシュ不一致）を防ぐ
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 成功したらキャッシュも更新
          if (response.status === 200) {
            const cacheCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
          }
          return response;
        })
        .catch(() => {
          // オフライン時はキャッシュから返す
          return caches.match(event.request) || caches.match('/index.html');
        })
    );
    return;
  }

  // それ以外のリクエスト (JS/CSS/画像): Cache-First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // 正常なレスポンスのみキャッシュ（不完全なデータやエラーをキャッシュしない）
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
        }
        return networkResponse;
      }).catch(() => {
        // 全くネットワークが繋がらず、キャッシュにもない場合
        // 何も返さない（ブラウザにエラーを任せる）
      });
    })
  );
});
