
import { Capacitor } from '@capacitor/core';

/**
 * Web広告（AdSense想定）の設定と表示制御を管理するサービス
 */

export interface WebAdConfig {
  publisherId: string | null;
  slots: {
    banner: string | null;
    mrec: string | null;
  };
}

// 環境変数から設定を取得 (VITE_ プレフィックスが必要)
const config: WebAdConfig = {
  publisherId: (import.meta as any).env.VITE_ADSENSE_PUBLISHER_ID || null,
  slots: {
    banner: (import.meta as any).env.VITE_ADSENSE_SLOT_BANNER || null,
    mrec: (import.meta as any).env.VITE_ADSENSE_SLOT_MREC || null,
  }
};

/**
 * 広告を表示してはいけない状態の判定
 */
class WebAdService {
  private adDisabledViews: string[] = ['MEAL', 'POSTURE', 'NUTRITION_GUIDE', 'MOVE_GUIDE', 'POSTURE_POINTS'];
  private globalDisabled: boolean = false;

  constructor() {
    this.globalDisabled = Capacitor.isNativePlatform(); // NativeはAdMobがあるためWeb広告は無効
  }

  getConfig(): WebAdConfig {
    return config;
  }

  /**
   * 現在のViewや状態で広告を表示すべきか判定
   */
  shouldShowAd(view: string): boolean {
    if (this.globalDisabled) return false;
    
    // 特定のViewでは非表示
    if (this.adDisabledViews.includes(view)) return false;

    // TODO: ここで「解析中フラグ」などのグローバルステートも参照可能にする
    
    return true;
  }
}

export const webAdService = new WebAdService();
