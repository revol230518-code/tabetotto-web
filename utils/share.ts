
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { isIOS as checkIsIOS } from './platform';
import { prepareShareFile, cleanupShareFile } from '../services/shareFileService';

export interface ShareData {
  title: string;
  text: string;
  blob: Blob;
  filename: string;
}

export type ShareResult = 'success' | 'canceled' | 'fallback' | 'error';

/**
 * 共有機能の統合ラッパー
 * 1. Native (Capacitor) 共有を優先
 * 2. Web (navigator.share) を次善策として試行
 * 3. 失敗時、または非対応時は 'fallback' を返す（呼び出し元で長押し案内などを出す）
 */
export async function executeShare(data: ShareData): Promise<ShareResult> {
  const isIOS = checkIsIOS();
  let tempUri: string | null = null;

  try {
    // A. Native Platform (iOS/Android App)
    if (Capacitor.isNativePlatform()) {
      tempUri = await prepareShareFile(data.blob, data.filename);
      if (!tempUri) throw new Error('Failed to prepare native share file');

      await Share.share({
        title: data.title,
        text: data.text,
        url: tempUri,
      });
      
      return 'success';
    }

    // B. Web Strategy
    // navigator.share が存在する場合、files共有を試みる
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        const file = new File([data.blob], data.filename, { type: data.blob.type });
        
        // canShare のチェックは参考程度とし、try-catch で囲んで実行を優先する
        // (iOS PWAなどで canShare が不安定なケースがあるため)
        const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });

        if (canShareFiles || isIOS) {
          await navigator.share({
            files: [file],
            title: data.title,
            text: data.text,
          });
          return 'success';
        }
      } catch (webShareError: any) {
        if (webShareError.name === 'AbortError') {
          return 'canceled';
        }
        console.warn('Web share failed, falling back:', webShareError);
      }
    }

    // C. Fallback
    // シェア非対応、または失敗した場合は呼び出し元に fallback を伝える
    return 'fallback';

  } catch (error: any) {
    console.error('Share execution error:', error);
    if (error.name === 'AbortError' || error.message?.includes('canceled')) {
      return 'canceled';
    }
    return 'error';
  } finally {
    if (tempUri) {
      cleanupShareFile(tempUri);
    }
  }
}

/**
 * 従来の a.click() によるダウンロードを実行する
 * iOS Safariでは blob URL への遷移になる可能性があるため注意して使用
 */
export function executeDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Revoke は少し送らせるか、呼び出し元で管理するのが安全
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
