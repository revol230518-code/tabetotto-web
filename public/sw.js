// 次回デプロイ時はこのバージョン文字列を更新してください
const SW_VERSION = 'web-2026-04-23-01';
const CACHE_NAME = `tabetotto-cache-${SW_VERSION}`;

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
 * 明示的なバージョン管理により、更新を確実にする
 */

// 初期インストール
self.addEventListener('install', (event) => {
  console.log('SW: install', SW_VERSION);
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
  console.log('SW: activate', SW_VERSION);
  event.waitUntil(
    caches.keys().then((allCaches) => {
      return Promise.all(
        allCaches
          .filter((name) => name.startsWith('tabetotto-cache-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('SW: old cache deleted', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// SKIP_WAITING メッセージ対応
// 統一規格： { type: 'SKIP_WAITING' }
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// リクエスト処理
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // GET以外や外部API、CloudRunへのリクエストは無視
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Navigation (HTMLページ) リクエスト: Network-First強め
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const cacheCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request) || caches.match('/index.html');
        })
    );
    return;
  }

  // それ以外の静的リクエスト: Cache-First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
        }
        return networkResponse;
      }).catch(() => {});
    })
  );
});
