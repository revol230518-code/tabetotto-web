const SW_VERSION = 'web-2026-04-24-01';
const CACHE_NAME = `tabetotto-cache-${SW_VERSION}`;

// キャッシュ対象の静的なベースアセット
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/tabetotto.mascot.svg',
  '/titleicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

/**
 * Service Worker: 更新とキャッシュ管理の強化版
 */

// 1. インストール: STATIC_ASSETS をキャッシュ
self.addEventListener('install', (event) => {
  console.log('SW: install', SW_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: プリキャッシュ中...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // インストール後、待機せずにアクティブ化を促すが、
  // ユーザーの画面遷移を優先するため SKIP_WAITING はメッセージ経由で制御するのが望ましい。
  // self.skipWaiting(); 
});

// 2. アクティベート: 古いキャッシュの整理
self.addEventListener('activate', (event) => {
  console.log('SW: activate', SW_VERSION);
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // 「tabetotto-cache-」で始まる古いキャッシュのみ削除
          if (key.startsWith('tabetotto-cache-') && key !== CACHE_NAME) {
            console.log('SW: 古いキャッシュを削除:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      // アクティブ化したらすぐに制御を開始
      return self.clients.claim();
    })
  );
});

// 3. メッセージ待ち受け: SKIP_WAITING 指示に対応
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('SW: SKIP_WAITINGを受信');
    self.skipWaiting();
  }
});

// 4. フェッチ処理
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // GETリクエスト以外、または自ドメイン以外、またはAPIリクエスト (/api/ や /v1/ai/) はキャッシュ対象外
  if (
    event.request.method !== 'GET' || 
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/v1/ai/')
  ) {
    return;
  }

  // ページ遷移 (HTML) は Network-First (最新を優先)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request) || caches.match('/index.html');
        })
    );
    return;
  }

  // ハッシュ付きアセット (/assets/) は Cache-First (ハッシュが変われば別URLになるため)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((network) => {
          if (network.ok) {
            const copy = network.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return network;
        });
      })
    );
    return;
  }

  // その他の静的ファイル (アイコンなど) は Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((network) => {
        if (network.ok) {
          const copy = network.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return network;
      }).catch(() => null);

      return cached || networkFetch;
    })
  );
});
