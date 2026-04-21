
import { AdMob, BannerAdOptions, BannerAdPosition, BannerAdSize, RewardInterstitialAdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

/**
 * 【重要】本番リリース時は必ず true に設定
 */
const isProd = true; 

// 正式版IDに差し替え (旧IDは完全除去)
const IDS = {
  android: {
    app: 'ca-app-pub-3081007845343649~1937834329',
    banner: 'ca-app-pub-3081007845343649/9389266164',
    rewardedInterstitial: 'ca-app-pub-3081007845343649/7505338854',
    native: 'ca-app-pub-3081007845343649/4718543353',
    mrec: 'ca-app-pub-3081007845343649/6184695931'
  },
  test: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    rewardedInterstitial: 'ca-app-pub-3940256099942544/5354046379',
    mrec: 'ca-app-pub-3940256099942544/6300978111' // TestはバナーIDを流用可能
  }
};

// 多重呼び出し防止用フラグ
let isBannerVisible = false;
let isMrecVisible = false;

// MREC表示状態のリスナー
type MrecListener = (isVisible: boolean) => void;
const mrecListeners: MrecListener[] = [];

export const onMrecVisibilityChange = (listener: MrecListener) => {
  mrecListeners.push(listener);
  listener(isMrecVisible);
  return () => {
    const index = mrecListeners.indexOf(listener);
    if (index > -1) mrecListeners.splice(index, 1);
  };
};

const notifyMrecListeners = () => {
  mrecListeners.forEach(listener => listener(isMrecVisible));
};

// 初期化プロミスを保持（シングルトン化して、後続の呼び出しが待機できるようにする）
let initPromise: Promise<void> | null = null;

export const initAdMob = () => {
  if (!isNative) return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await AdMob.initialize({
        initializeForTesting: !isProd,
      });
      console.log('AdMob Initialized');
    } catch (e) {
      console.warn('AdMob Init skipped or failed.', e);
    }
  })();

  return initPromise;
};

/**
 * ポリシー遵守のため、標準的な画面下部固定表示を使用します。
 */
export const showBanner = async () => {
  if (!isNative) return;
  
  // 初期化が終わっていなければ待つ（これにより、App.tsxで非同期に呼んでも安全かつ最速で表示される）
  await initAdMob();

  // MRECが出ていたら消す
  if (isMrecVisible) await hideMrec();

  // バナーが表示済みなら何もしない
  if (isBannerVisible) return;
  
  const options: BannerAdOptions = {
    adId: isProd ? IDS.android.banner : IDS.test.banner,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER, // 常に画面下部に固定
    margin: 0,
    isTesting: !isProd,
    npa: false
  };
  try {
    await AdMob.showBanner(options);
    isBannerVisible = true;
  } catch (e) {
    console.error('Banner Show Error:', e);
    isBannerVisible = false;
  }
};

/**
 * MREC（レクタングル 300x250）を表示します。
 * Meal/Posture画面で使用します。
 * 既存のバナー広告は自動的に非表示になります（差し替え）。
 */
export const showMrec = async (position: BannerAdPosition = BannerAdPosition.BOTTOM_CENTER) => {
  if (!isNative) return;
  
  // 初期化を待つ
  await initAdMob();

  // バナーが出ていたら消す
  if (isBannerVisible) await hideBanner();

  // MRECが表示済みなら何もしない
  if (isMrecVisible) return;
  
  const options: BannerAdOptions = {
    adId: isProd ? IDS.android.mrec : IDS.test.mrec, 
    adSize: BannerAdSize.MEDIUM_RECTANGLE, // 必ず 300x250 サイズ指定
    position: position,
    margin: 0,
    isTesting: !isProd,
    npa: false
  };
  try {
    await AdMob.showBanner(options);
    isMrecVisible = true;
    notifyMrecListeners();
  } catch (e) {
    console.error('MREC Show Error:', e);
    isMrecVisible = false;
    notifyMrecListeners();
  }
};

/**
 * カメラ撮影時は、誤クリックやコンテンツの隠蔽を防ぐため
 * 広告を完全に非表示にします。
 */
export const hideAdsForCamera = async () => {
  if (!isNative) return;
  await hideBanner(); 
  await hideMrec();
};

export const hideBanner = async () => {
  if (!isNative) return;
  // 【重要】表示されていないのに remove を呼ぶとクラッシュする可能性があるためガード
  if (!isBannerVisible) return;

  try {
    await AdMob.removeBanner();
    isBannerVisible = false;
  } catch (e) {
    // Ignore error but ensure flag is reset if deemed appropriate, 
    // though usually keeping it sync with reality is best.
    console.warn("hideBanner failed", e);
    // 失敗しても、次回show時に支障が出ないようフラグはfalseにしておくのが無難
    isBannerVisible = false; 
  }
};

export const hideMrec = async () => {
  if (!isNative) return;
  // 【重要】MRECもBannerとして扱われるため、表示フラグを見てガード
  if (!isMrecVisible) return;

  try {
    // MRECもremoveBannerで消せる（最後に表示したバナー系が対象になるため）
    await AdMob.removeBanner();
    isMrecVisible = false;
    notifyMrecListeners();
  } catch (e) {
    console.error("hideMrec failed", e);
    isMrecVisible = false;
    notifyMrecListeners();
  }
};

export const showRewardedInterstitialAd = async (): Promise<boolean> => {
  if (!isNative) return true;
  
  try {
    await initAdMob(); // Ensure init
    const options: RewardInterstitialAdOptions = {
      adId: isProd ? IDS.android.rewardedInterstitial : IDS.test.rewardedInterstitial,
    };
    
    await AdMob.prepareRewardInterstitialAd(options);
    const reward = await AdMob.showRewardInterstitialAd();
    
    // 報酬額が正の場合のみ成功とする
    return !!(reward && reward.amount > 0);
  } catch (e: any) {
    // 【重要】失敗時はトークンを与えないように false を返す
    console.error("Reward Ad Failed:", e);
    return false; 
  }
};
