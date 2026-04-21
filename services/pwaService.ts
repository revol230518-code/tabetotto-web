
import { Capacitor } from '@capacitor/core';

let deferredPrompt: any = null;

/**
 * PWAの初期化処理
 * Service Workerの登録と、インストールプロンプトのイベント待機を行う
 */
export const initPWA = () => {
  // Native環境ではPWA処理を行わない
  if (Capacitor.isNativePlatform()) return;

  // インストール可能イベントの待機
  window.addEventListener('beforeinstallprompt', (e) => {
    // Chrome/Android等のデフォルトプロンプトを抑制し、独自UIを出す準備をする
    e.preventDefault();
    deferredPrompt = e;
    
    // システム全体に通知 (コンポーネント側で検知可能にする)
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA: アプリがインストールされました');
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });

  // Service Worker の登録
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // sw.js は public/ 直下またはルートに配置されている想定
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('PWA: ServiceWorker 登録成功:', registration.scope);
      }).catch(error => {
        console.error('PWA: ServiceWorker 登録失敗:', error);
      });
    });
  }
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
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: インストール結果: ${outcome}`);
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (err) {
    console.error('PWA: インストール実行エラー:', err);
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
    (window.navigator as any).standalone === true
  );
};

/**
 * iOS かどうか判定
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

/**
 * Safari かどうか判定
 */
export const isSafari = (): boolean => {
  const userAgent = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(userAgent);
};
