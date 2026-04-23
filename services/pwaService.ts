
import { Capacitor } from '@capacitor/core';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const BUILD_VERSION = 'web-2026-04-23-01';
const SW_URL = `/sw.js?v=${BUILD_VERSION}`;
const RESET_PARAM = 'resetPwa';
const RELOAD_FLAG = 'tabetotto-pwa-controller-reloaded';

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let controllerReloadHandled = false;

const removeResetParamFromUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete(RESET_PARAM);
  window.history.replaceState({}, '', url.toString());
};

const resetPwaIfRequested = async (): Promise<boolean> => {
  if (Capacitor.isNativePlatform()) return false;

  const url = new URL(window.location.href);
  if (url.searchParams.get(RESET_PARAM) !== '1') return false;

  console.log('PWA: resetPwa requested');

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter((key) => key.startsWith('tabetotto-cache-') || key.includes('tabetotto'))
          .map((key) => caches.delete(key))
      );
    }

    sessionStorage.removeItem(RELOAD_FLAG);
    removeResetParamFromUrl();
    window.location.reload();
    return true;
  } catch (error) {
    console.error('PWA: resetPwa failed', error);
    removeResetParamFromUrl();
    window.location.reload();
    return true;
  }
};

const attachInstallingWorkerListener = (
  registration: ServiceWorkerRegistration,
  worker: ServiceWorker | null
) => {
  if (!worker) return;

  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed') {
      console.log('PWA: new worker installed');

      if (navigator.serviceWorker.controller) {
        window.dispatchEvent(
          new CustomEvent('pwa-update-ready', {
            detail: { version: BUILD_VERSION, registration },
          })
        );
      }
    }
  });
};

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;

  try {
    console.log('PWA: register start');

    const registration = await navigator.serviceWorker.register(SW_URL, {
      updateViaCache: 'none',
    });

    console.log('PWA: register success', registration.scope);
    console.log('PWA: update check start');

    attachInstallingWorkerListener(registration, registration.installing);

    registration.addEventListener('updatefound', () => {
      console.log('PWA: update found');
      attachInstallingWorkerListener(registration, registration.installing);
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('PWA: controller changed');

      if (controllerReloadHandled) return;
      if (sessionStorage.getItem(RELOAD_FLAG) === '1') return;

      controllerReloadHandled = true;
      sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.reload();
    });

    window.addEventListener('pwa-apply-update', () => {
      applyUpdate(registration);
    });

    await registration.update();
  } catch (error) {
    console.error('PWA: ServiceWorker register failed', error);
  }
};

/**
 * PWAの更新を適用する
 */
export const applyUpdate = (registration: ServiceWorkerRegistration) => {
    if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
        window.location.reload();
    }
};

/**
 * PWAの初期化処理
 * Service Workerの登録と、インストールイベント待機を行う
 */
export const initPWA = () => {
  if (Capacitor.isNativePlatform()) return;

  void (async () => {
    const didReset = await resetPwaIfRequested();
    if (didReset) return;

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPrompt = event as BeforeInstallPromptEvent;
      window.dispatchEvent(new CustomEvent('pwa-installable'));
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA: アプリがインストールされました');
      deferredPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });

// ...既存の処理
    window.addEventListener('pwa-update-ready', (event: any) => {
      const alreadyPrompted = sessionStorage.getItem('tabetotto-pwa-update-prompted') === '1';
      if (alreadyPrompted) return;

      sessionStorage.setItem('tabetotto-pwa-update-prompted', '1');
      const { registration } = event.detail;
      const shouldReload = window.confirm('新しい版があります。再読み込みして更新しますか？');

      if (shouldReload) {
        applyUpdate(registration);
      }
    });

    // iPhone復帰時のSWチェック
    const checkForUpdate = async () => {
        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            await reg.update();
        }
    };
    
    // pageshow (persisted)、visibilitychange、online
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) checkForUpdate();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // デバウンスを考慮して短時間遅延
            setTimeout(checkForUpdate, 1000);
        }
    });
    window.addEventListener('online', checkForUpdate);

    if (document.readyState === 'complete') {
// ...
      await registerServiceWorker();
    } else {
      window.addEventListener('load', () => {
        void registerServiceWorker();
      });
    }
  })();
};

/**
 * 保存されたインストールプロンプトイベントを返す
 */
export const getDeferredPrompt = () => deferredPrompt;

/**
 * インストールを実行する
 */
export const triggerInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) return false;

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: インストール結果: ${outcome}`);
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('PWA: インストール実行エラー:', error);
    return false;
  }
};

/**
 * すでにスタンドアロン（ホーム画面追加済み）で起動しているか判定
 */
export const isStandalone = (): boolean => {
  if (Capacitor.isNativePlatform()) return true;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
};

/**
 * iOS かどうか判定
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Safari かどうか判定
 */
export const isSafari = (): boolean => {
  const userAgent = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(userAgent);
};
