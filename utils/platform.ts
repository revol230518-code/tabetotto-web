import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isIOS = () => Capacitor.getPlatform() === 'ios';
export const isWeb = () => !isNativePlatform();

/**
 * 端末のセーフエリアを考慮したパディングが必要なプラットフォームか
 */
export const needsSafeArea = () => isNativePlatform();

/**
 * 共有機能が利用可能か
 */
export const canShare = () => {
  if (isNativePlatform()) return true;
  return typeof navigator !== 'undefined' && !!navigator.share;
};

/**
 * カメラ機能がブラウザでサポートされているか
 */
export const hasWebCamera = () => {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
};

