import React, { Suspense, lazy } from 'react';
import { UserProfile, DailyRecord, AppView, PostureAnalysis, MealAnalysis, PostureComparison } from './types';
import { InitialSetupData } from './components/onboarding/InitialSetupFlow';
import { CuteKeypad, CuteCalendar } from './components/UIComponents';
import SideMenu from './components/SideMenu';
import { PostureDetailModal, MealDetailModal, SharePreviewModal, CompareModal } from './components/SharedModals';
import { Menu, Home, ArrowUp, Utensils, ShieldAlert, Loader2 } from 'lucide-react';
import { AdBelt } from './components/AdComponents'; // AdBelt追加
import { Modal, Button } from './components/UIComponents';
import { getOnboardingFlags, setOnboardingFlags } from './services/onboardingService';
import { OnboardingWrapper } from './components/onboarding/OnboardingWrapper';

const DashboardView = lazy(() => import('./components/views/DashboardView'));
const MealView = lazy(() => import('./components/views/MealView'));
const PostureView = lazy(() => import('./components/views/PostureView'));
const HistoryView = lazy(() => import('./components/views/HistoryView'));
const SettingsView = lazy(() => import('./components/views/SettingsView'));
const PosturePointsView = lazy(() => import('./components/views/PosturePointsView'));
const NutritionGuideView = lazy(() => import('./components/views/NutritionGuideView'));
const MoveGuideView = lazy(() => import('./components/views/MoveGuideView'));
const StaticPageView = lazy(() => import('./components/views/StaticPageView'));

import { 
  STORAGE_KEY_USER, 
  STORAGE_KEY_RECORDS, 
  STORAGE_KEY_TOKENS, 
  STORAGE_KEY_LAST_RECOVERY,
  getTodayString, 
  toLocalDateString,
  MAX_TOKENS, 
  AUTO_MAX_TOKENS,
  REWARD_TOKENS, 
  RECOVERY_TIME_MS 
} from './utils';
import { isNativePlatform } from './utils/platform';
import { initAdMob, showRewardedInterstitialAd, showBanner, hideBanner, hideMrec, onMrecVisibilityChange } from './services/admobService';
import { THEME } from './theme';
import { App as CapacitorApp } from '@capacitor/app';
import { setupCameraRecovery, PendingCaptureState, clearPendingCapture } from './services/cameraRecovery';
import { getPendingShare, clearPendingShare } from './services/shareRecovery';
import { webAdService } from './services/webAdService';

import { motion } from 'motion/react';
import { triggerHaptic } from './services/haptics';
import { scrollToTop } from './utils/scrollToTop';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

const App = () => {
  const [view, setView] = React.useState<AppView>(AppView.DASHBOARD);
  const [user, setUser] = React.useState<UserProfile>({ 
    height: 160, 
    targetWeight: 50, 
    nickname: 'ゲスト', 
    theme: 'default',
    hapticsEnabled: true
  });
  const [records, setRecords] = React.useState<Record<string, DailyRecord>>({});
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isOnboarding, setIsOnboarding] = React.useState(false);
  
  const [tokens, setTokens] = React.useState<number>(MAX_TOKENS);
  const [lastRecovery, setLastRecovery] = React.useState<number>(Date.now());

  const [selectedMeal, setSelectedMeal] = React.useState<{ analysis: MealAnalysis, photo: string, date: string, index: number } | null>(null);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);
  const [preGeneratedBlob, setPreGeneratedBlob] = React.useState<Blob | null>(null);

  const [isPostureModalOpen, setIsPostureModalOpen] = React.useState(false);
  const [showingPostureDate, setShowingPostureDate] = React.useState<string | null>(null);
  
  // Compare Modal
  const [isCompareModalOpen, setIsCompareModalOpen] = React.useState(false);
  const [comparingDate, setComparingDate] = React.useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSaveSetup = (data: InitialSetupData) => {
    setUser({
        ...user,
        nickname: data.nickname,
        gender: data.gender,
        age: data.age,
        height: data.height,
        targetWeight: data.targetWeight,
        activityLevel: data.activityLevel
    });

    const newRecords = { ...records };
    const today = getTodayString();
    const record = newRecords[today] || { id: today, date: today, mealPhotoUrls: [], mealAnalyses: [] };
    
    newRecords[today] = {
        ...record,
        weight: data.weight
    };
    
    setRecords(newRecords);
  }
  const [touchStart, setTouchStart] = React.useState<{x: number, y: number, isNoSwipeZone: boolean} | null>(null);

  const [keypadConfig, setKeypadConfig] = React.useState<{
    initialValue: string;
    unit: string;
    onConfirm: (val: string) => void;
  } | null>(null);

  const [calendarConfig, setCalendarConfig] = React.useState<{
    initialDate: string;
    onConfirm: (date: string) => void;
  } | null>(null);

  const [restoredCapture, setRestoredCapture] = React.useState<{ data: any, pendingState: PendingCaptureState } | null>(null);
  
  const [isMrecVisible, setIsMrecVisible] = React.useState(false);
  const [showStorageNotice, setShowStorageNotice] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onMrecVisibilityChange((visible) => {
      setIsMrecVisible(visible);
    });
    return unsubscribe;
  }, []);

  const openKeypad = React.useCallback((initialValue: string, unit: string, onConfirm: (val: string) => void) => {
    setKeypadConfig({ initialValue, unit, onConfirm });
  }, []);

  const openCalendar = React.useCallback((initialDate: string, onConfirm: (date: string) => void) => {
    setCalendarConfig({ initialDate, onConfirm });
  }, []);

  React.useEffect(() => { 
    const initApp = async () => {
      try {
        // 広告初期化を待たずに開始する（並列処理）
        // admobService側でisNative判定をしているため、そのまま呼んでも安全
        initAdMob(); 
        
        const flags = getOnboardingFlags();
        if (!flags.hasSeenOnboarding) {
          setIsOnboarding(true);
        }

        const loadedUser = localStorage.getItem(STORAGE_KEY_USER);
        if (loadedUser) {
          try {
            const parsedUser = JSON.parse(loadedUser);
            if (parsedUser.hapticsEnabled === undefined) {
              parsedUser.hapticsEnabled = true;
            }
            setUser(parsedUser);
            if (!parsedUser.hasSeenStorageNotice) {
              setShowStorageNotice(true);
            }
          } catch (e) {
            console.error("Failed to parse user data", e);
          }
        } else {
          // 初回起動時
          setShowStorageNotice(true);
        }
        const loadedRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
        if (loadedRecords) {
          try {
            setRecords(JSON.parse(loadedRecords));
          } catch (e) {
            console.error("Failed to parse records data", e);
          }
        }
        const storedTokens = localStorage.getItem(STORAGE_KEY_TOKENS);
        const storedLastRecovery = localStorage.getItem(STORAGE_KEY_LAST_RECOVERY);
        if (storedTokens !== null && storedLastRecovery !== null) {
          let t = parseInt(storedTokens);
          let last = parseInt(storedLastRecovery);
          const now = Date.now();
          if (t < AUTO_MAX_TOKENS) {
            const elapsed = now - last;
            const recoveredAmount = Math.floor(elapsed / RECOVERY_TIME_MS);
            if (recoveredAmount > 0) {
              t = Math.min(AUTO_MAX_TOKENS, t + recoveredAmount);
              last = last + (recoveredAmount * RECOVERY_TIME_MS);
              if (t >= AUTO_MAX_TOKENS) last = now;
            }
          }
          setTokens(t);
          setLastRecovery(last);
        }
      } catch (e) {
        console.warn("Storage loading failed", e);
      } finally {
        setIsLoaded(true);
      }
    };
    initApp();

    const cleanupRecovery = setupCameraRecovery((data, pendingState) => {
      setRestoredCapture({ data, pendingState });
      if (pendingState.currentView) {
        setView(pendingState.currentView as AppView);
      }
      clearPendingCapture();
    });

    // Share Recovery
    const handleShareRecovery = async () => {
      if (!isNativePlatform()) return;
      
      const pendingShare = await getPendingShare();
      if (pendingShare) {
        if (pendingShare.currentView) {
          setView(pendingShare.currentView as AppView);
        }
        
        // Restore selected meal if applicable
        if (pendingShare.selectedMealDate && pendingShare.selectedMealIndex !== null) {
          const recordsStr = localStorage.getItem(STORAGE_KEY_RECORDS);
          if (recordsStr) {
            try {
              const parsedRecords = JSON.parse(recordsStr);
              const record = parsedRecords[pendingShare.selectedMealDate];
              if (record && record.mealAnalyses && record.mealAnalyses[pendingShare.selectedMealIndex]) {
                const analysis = record.mealAnalyses[pendingShare.selectedMealIndex];
                setSelectedMeal({
                  analysis: analysis,
                  photo: record.mealPhotoUrls?.[pendingShare.selectedMealIndex] || '',
                  date: pendingShare.selectedMealDate,
                  index: pendingShare.selectedMealIndex
                });
              }
            } catch (e) {
              console.error("Failed to restore selected meal for share", e);
            }
          }
        }

        if (pendingShare.shareModalOpen) {
          setShareModalOpen(true);
        }
        
        // Clear it after restoring the UI state so it doesn't get restored again
        await clearPendingShare();
      }
    };

    // Check on startup
    handleShareRecovery();

    let appStateListener: any = null;
    if (isNativePlatform()) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          handleShareRecovery();
        }
      }).then(listener => {
        appStateListener = listener;
      });
    }

    return () => {
      cleanupRecovery();
      if (appStateListener) {
        appStateListener.remove();
      }
    };
  }, []);

  // 広告制御: メニュー開閉時およびページ遷移時
  React.useEffect(() => {
    if (!isNativePlatform()) return;

    if (isMenuOpen) {
        // メニューが開いているときは全広告OFF
        hideBanner();
        hideMrec();
    } else {
        // メニューが閉じている時の制御
        if ([AppView.DASHBOARD, AppView.HISTORY, AppView.SETTINGS, AppView.NUTRITION_GUIDE, AppView.MOVE_GUIDE].includes(view)) {
            // Home / History / Settings / NutritionGuide / MoveGuide は通常バナー
            hideMrec();
            showBanner();
        } else if ([AppView.MEAL, AppView.POSTURE].includes(view)) {
            // Meal / Posture は MREC だが、step制御（撮影中など）が優先されるため、
            // ここで強制的に showMrec() を呼ぶとタイミングによっては不都合が生じる。
            // したがって、App.tsxでは「他画面のバナーを消す」処理までを行い、
            // 表示復帰は各Viewの useEffect（isMenuOpen依存）に任せる。
            hideBanner();
        }
    }
  }, [isMenuOpen, view]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', user.theme || 'default');
  }, [user.theme]);

  const recordsSaveTimeoutRef = React.useRef<number | null>(null);
  const pendingRecordsRef = React.useRef<Record<string, DailyRecord> | null>(null);

  const flushRecordsSave = React.useCallback(() => {
    if (recordsSaveTimeoutRef.current !== null) {
      clearTimeout(recordsSaveTimeoutRef.current);
      recordsSaveTimeoutRef.current = null;
    }
    if (pendingRecordsRef.current) {
      const recordsToSave = pendingRecordsRef.current;
      try {
        localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(recordsToSave));
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          const sortedDates = Object.keys(recordsToSave).sort();
          if (sortedDates.length > 3) { 
            sortedDates.slice(0, 5).forEach(date => {
              recordsToSave[date].mealPhotoUrls = recordsToSave[date].mealPhotoUrls.map(() => "");
              if (recordsToSave[date].isPostureComparisonAnchor !== true) {
                recordsToSave[date].posturePhotoUrl = undefined;
                recordsToSave[date].postureSidePhotoUrl = undefined;
              }
            });
            try {
               localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(recordsToSave));
            } catch(retryE) {
               console.error("Storage full even after cleanup", retryE);
            }
          }
        }
      }
      pendingRecordsRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushRecordsSave();
      }
    };
    window.addEventListener('beforeunload', flushRecordsSave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', flushRecordsSave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      flushRecordsSave();
    };
  }, [flushRecordsSave]);

  const safeSaveRecords = React.useCallback((newRecords: Record<string, DailyRecord>) => {
    if (!isLoaded) return;
    
    // 10日以上前の写真データを削除する処理
    const CLEANUP_DAYS = 10;
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - CLEANUP_DAYS);
    // UTCではなくローカル時間基準の日付文字列を使用
    const cutoffStr = toLocalDateString(cutoffDate);

    const recordsToSave = { ...newRecords };

    Object.keys(recordsToSave).forEach(date => {
        if (date < cutoffStr) {
            const record = recordsToSave[date];

            if (record.mealPhotoUrls && record.mealPhotoUrls.some(url => url !== "")) {
                record.mealPhotoUrls = record.mealPhotoUrls.map(() => "");
            }
            if (record.posturePhotoUrl && record.isPostureComparisonAnchor !== true) {
                record.posturePhotoUrl = undefined;
            }
            if (record.postureSidePhotoUrl && record.isPostureComparisonAnchor !== true) {
                record.postureSidePhotoUrl = undefined;
            }
        }
    });

    pendingRecordsRef.current = recordsToSave;

    if (recordsSaveTimeoutRef.current !== null) {
      clearTimeout(recordsSaveTimeoutRef.current);
    }

    recordsSaveTimeoutRef.current = window.setTimeout(() => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => flushRecordsSave());
      } else {
        flushRecordsSave();
      }
    }, 300);
  }, [isLoaded, flushRecordsSave]);

  React.useEffect(() => {
    if (isLoaded) localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }, [user, isLoaded]);

  React.useEffect(() => {
    if (isLoaded) {
      safeSaveRecords(records);
    }
  }, [records, isLoaded]);

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_TOKENS, tokens.toString());
      localStorage.setItem(STORAGE_KEY_LAST_RECOVERY, lastRecovery.toString());
    }
  }, [tokens, lastRecovery, isLoaded]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (tokens < AUTO_MAX_TOKENS) {
        const now = Date.now();
        if (now - lastRecovery >= RECOVERY_TIME_MS) {
          setTokens(prev => Math.min(AUTO_MAX_TOKENS, prev + 1));
          setLastRecovery(prev => prev + RECOVERY_TIME_MS);
        }
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [tokens, lastRecovery]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // モーダル表示中や入力中はスワイプを無効化
    if (isAnyModalOpen) return;
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) return;

    // 特定の要素（グラフ、カルーセルなど）の上でのスワイプを抑制するための判定
    const target = e.target as HTMLElement;
    const isNoSwipeZone = !!target.closest('.no-swipe') || !!target.closest('.recharts-wrapper') || !!target.closest('.swiper');

    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY, isNoSwipeZone });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || isAnyModalOpen || touchStart.isNoSwipeZone) {
      setTouchStart(null);
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStart.x - endX;
    const diffY = touchStart.y - endY;

    // 誤爆防止ロジック強化:
    // 1. 横移動が一定以上かつ、縦移動が少ない(横の半分以下)
    // 2. 画面端(左右50px以内)からの開始は感度を高く、中央からは低く設定
    const screenWidth = window.innerWidth;
    const isFromEdge = touchStart.x < 50 || touchStart.x > screenWidth - 50;
    const minDiffX = isFromEdge ? 60 : 120; // 端からは60px、中央からは120px必要
    
    const isHorizontalSwipe = Math.abs(diffX) > minDiffX && Math.abs(diffY) < Math.abs(diffX) * 0.4;
    
    if (isHorizontalSwipe) {
      const mainViews = [AppView.DASHBOARD, AppView.HISTORY, AppView.MEAL, AppView.POSTURE, AppView.SETTINGS];
      const currentIndex = mainViews.indexOf(view);
      
      if (currentIndex !== -1) {
        if (diffX > 0) { 
           // 右から左へスワイプ (次へ)
           const next = mainViews[currentIndex + 1];
           if (next) {
             triggerHaptic();
             setView(next);
           }
        } else { 
           // 左から右へスワイプ (前へ)
           const prev = mainViews[currentIndex - 1];
           if (prev) {
             triggerHaptic();
             setView(prev);
           }
        }
      } else if (view === AppView.NUTRITION_GUIDE || view === AppView.MOVE_GUIDE) {
        // ガイド画面からの戻りスワイプは左端からのみ許可
        if (touchStart.x <= 80 && diffX < -50) {
          triggerHaptic();
          setView(view === AppView.NUTRITION_GUIDE ? AppView.MEAL : AppView.POSTURE);
        }
      }
    }
    setTouchStart(null);
  };

  const useToken = React.useCallback((): boolean => {
    if (tokens > 0) {
      setTokens(prev => {
        const next = prev - 1;
        if (prev >= AUTO_MAX_TOKENS && next < AUTO_MAX_TOKENS) {
          setLastRecovery(Date.now());
        }
        return next;
      });
      return true;
    }
    return false;
  }, [tokens]);

  const restoreTokens = async (): Promise<boolean> => {
    const success = await showRewardedInterstitialAd();
    if (success) {
      setTokens(prev => Math.min(MAX_TOKENS, prev + REWARD_TOKENS));
      setLastRecovery(Date.now());
      return true;
    }
    return false;
  };

  const todayKey = getTodayString();
  const todayRecord = React.useMemo(() => records[todayKey] || { id: todayKey, date: todayKey, mealPhotoUrls: [], mealAnalyses: [] }, [records, todayKey]);

  React.useEffect(() => {
    scrollToTop();
  }, [view]);

  React.useEffect(() => {
    if (selectedMeal || isPostureModalOpen || isCompareModalOpen || shareModalOpen) {
      scrollToTop();
    }
  }, [selectedMeal, isPostureModalOpen, isCompareModalOpen, shareModalOpen]);

  const handleWeightUpdate = (weight: number) => {
    setRecords(prev => ({ ...prev, [todayKey]: { ...todayRecord, weight } }));
  };

  const handleMealSave = (analysis: MealAnalysis, photo: string, date: string) => {
    setRecords(prev => {
      const targetRecord = prev[date] || { id: date, date, mealPhotoUrls: [], mealAnalyses: [] };
      return { ...prev, [date]: { ...targetRecord, mealPhotoUrls: [...targetRecord.mealPhotoUrls, photo], mealAnalyses: [...targetRecord.mealAnalyses, analysis] } };
    });
  };

  const handleUpdateExternalUrl = (url: string) => {
    if (!selectedMeal) return;
    setRecords(prev => {
        const r = { ...prev[selectedMeal.date] };
        r.mealAnalyses[selectedMeal.index].externalUrl = url;
        return { ...prev, [selectedMeal.date]: r };
    });
  };

  const clearPostureAnchor = (recordsObj: Record<string, DailyRecord>) => {
    Object.keys(recordsObj).forEach(d => {
      if (recordsObj[d].isPostureComparisonAnchor) {
        recordsObj[d] = { ...recordsObj[d], isPostureComparisonAnchor: false, postureAnchorSetAt: undefined };
      }
    });
  };

  const handlePostureSave = (photo: string, analysis: PostureAnalysis, date: string, sidePhoto?: string | null, isAnchor?: boolean) => {
    setRecords(prev => {
      const newRecords = { ...prev };
      if (isAnchor) clearPostureAnchor(newRecords);

      const targetRecord = newRecords[date] || { id: date, date: date, mealPhotoUrls: [], mealAnalyses: [] };
      newRecords[date] = { 
        ...targetRecord, 
        posturePhotoUrl: photo, 
        postureSidePhotoUrl: sidePhoto || undefined, 
        postureAnalysis: analysis,
        ...(isAnchor !== undefined ? { isPostureComparisonAnchor: isAnchor, postureAnchorSetAt: isAnchor ? Date.now() : undefined } : {})
      };
      return newRecords;
    });
  };

  const handleSetPostureAnchor = (date: string, isAnchor: boolean) => {
    setRecords(prev => {
      const newRecords = { ...prev };
      if (isAnchor) clearPostureAnchor(newRecords);

      const targetRecord = newRecords[date];
      if (targetRecord) {
        newRecords[date] = { 
          ...targetRecord, 
          isPostureComparisonAnchor: isAnchor,
          postureAnchorSetAt: isAnchor ? Date.now() : undefined
        };
      }
      return newRecords;
    });
  };

  const handleComparisonSave = (comparison: PostureComparison) => {
    if (!comparingDate) return;
    setRecords(prev => {
        const targetRecord = prev[comparingDate];
        if (!targetRecord) return prev;
        return {
            ...prev,
            [comparingDate]: {
                ...targetRecord,
                postureComparison: comparison
            }
        };
    });
  };

  const renderContent = () => {
    if (!isLoaded) return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="w-16 h-16 bg-primary rounded-2xl animate-sway flex items-center justify-center text-white text-2xl font-black">🍱</div>
        <p className="font-black text-primary animate-pulse">読み込み中...</p>
      </div>
    );

    const fallback = <div className="flex-1 flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-stone-300" /></div>;

    switch (view) {
      case AppView.DASHBOARD:
        return <Suspense fallback={fallback}><DashboardView user={user} todayRecord={todayRecord} records={records} setView={setView} onWeightUpdate={handleWeightUpdate} openKeypad={openKeypad} /></Suspense>;
      case AppView.MEAL:
        return <Suspense fallback={fallback}><MealView user={user} todayRecord={todayRecord} tokens={tokens} useToken={useToken} restoreTokens={restoreTokens} onSave={handleMealSave} onClose={() => setView(AppView.DASHBOARD)} openKeypad={openKeypad} openCalendar={openCalendar} onOpenGuide={() => setView(AppView.NUTRITION_GUIDE)} isMenuOpen={isMenuOpen} restoredCapture={restoredCapture} clearRestoredCapture={() => setRestoredCapture(null)} /></Suspense>;
      case AppView.HISTORY:
        return <Suspense fallback={fallback}><HistoryView records={recordsList} user={user} onMealClick={(m, p, d, i) => { setPreGeneratedBlob(null); setSelectedMeal({ analysis: m, photo: p, date: d, index: i }); }} onPostureClick={(r) => { setShowingPostureDate(r.date); setIsPostureModalOpen(true); }} isMenuOpen={isMenuOpen} /></Suspense>;
      case AppView.POSTURE:
        return <Suspense fallback={fallback}><PostureView tokens={tokens} useToken={useToken} restoreTokens={restoreTokens} onSave={handlePostureSave} onClose={() => setView(AppView.DASHBOARD)} openCalendar={openCalendar} onCompare={() => { setComparingDate(getTodayString()); setIsCompareModalOpen(true); }} onOpenMoveGuide={() => setView(AppView.MOVE_GUIDE)} isMenuOpen={isMenuOpen} restoredCapture={restoredCapture} clearRestoredCapture={() => setRestoredCapture(null)} /></Suspense>;
      case AppView.SETTINGS:
        return <Suspense fallback={fallback}><SettingsView user={user} onSave={setUser} openKeypad={openKeypad} setView={setView} /></Suspense>;
      case AppView.POSTURE_POINTS:
        return <Suspense fallback={fallback}><PosturePointsView onBack={() => setView(AppView.POSTURE)} /></Suspense>;
      case AppView.NUTRITION_GUIDE:
        return <Suspense fallback={fallback}><NutritionGuideView onBack={() => setView(AppView.MEAL)} /></Suspense>;
      case AppView.MOVE_GUIDE:
        return <Suspense fallback={fallback}><MoveGuideView user={user} todayRecord={todayRecord} records={recordsList} onBack={() => setView(AppView.POSTURE)} /></Suspense>;
      case AppView.USAGE:
      case AppView.FAQ:
      case AppView.PRIVACY:
      case AppView.TERMS:
      case AppView.INFO:
        return <Suspense fallback={fallback}><StaticPageView view={view} onBack={() => setView(AppView.SETTINGS)} /></Suspense>;
      default:
        console.warn(`Unexpected view encountered: ${view}. Redirecting to Dashboard.`);
        return <Suspense fallback={fallback}><DashboardView user={user} todayRecord={todayRecord} records={records} setView={setView} onWeightUpdate={handleWeightUpdate} openKeypad={openKeypad} /></Suspense>;
    }
  };

  const showGlobalHeader = ![AppView.USAGE, AppView.FAQ, AppView.PRIVACY, AppView.TERMS, AppView.INFO, AppView.NUTRITION_GUIDE, AppView.MOVE_GUIDE, AppView.POSTURE_POINTS].includes(view);
  
  const recordsList = React.useMemo(() => Object.values(records), [records]);

  const isAnyModalOpen = !!selectedMeal || shareModalOpen || isPostureModalOpen || isCompareModalOpen || !!keypadConfig || !!calendarConfig;

  // 広告表示可否の判定 (WebAdServiceを使用)
  const shouldShowWebAd = !isNativePlatform() && webAdService.shouldShowAd(view);

  // モーダル表示時に背景スクロールを固定
  React.useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isAnyModalOpen]);

  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 500) {
            setShowScrollTop(true);
          } else {
            setShowScrollTop(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    scrollToTop();
  };

  return (
    <div 
        className="min-h-screen font-zen-maru pb-safe selection:text-white overflow-x-hidden relative w-full flex justify-center items-start" 
        style={{ color: THEME.colors.textPrimary, backgroundColor: THEME.colors.appBg }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
    >
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40" 
           style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="relative z-10 w-full min-h-screen shadow-xl md:max-w-md bg-transparent flex flex-col overflow-x-hidden">
          
          {showGlobalHeader && (
             <header className="sticky top-0 z-[100] pt-safe backdrop-blur-md border-b w-full shadow-sm" style={{ backgroundColor: `${THEME.colors.appBg}E6`, borderColor: 'rgba(0,0,0,0.08)' }}>
               <div className="px-5 py-3 flex items-center justify-between" style={{ marginTop: '-2px' }}>
                   <div 
                     className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
                     onClick={() => {
                       if (view === AppView.DASHBOARD) {
                         scrollToTop();
                       } else {
                         setView(AppView.DASHBOARD);
                       }
                     }}
                   >
                        <div 
                          className="rounded-xl p-1.5 shadow-sm border border-stone-100 animate-sway flex items-center justify-center"
                          style={{ 
                            color: THEME.colors.mealPrimary,
                            width: '37px',
                            height: '37px',
                            marginTop: '-4px',
                            backgroundColor: '#e97b8d',
                            marginLeft: '-13px'
                          }}
                        >
                          <Utensils 
                            size={22} 
                            strokeWidth={2.5} 
                            style={{
                              paddingTop: '-1px',
                              paddingLeft: '1px',
                              marginLeft: '0px',
                              marginTop: '0px',
                              marginBottom: '0px',
                              marginRight: '-5px',
                              paddingBottom: '0px',
                              paddingRight: '0px',
                              borderColor: '#ebeae5',
                              color: '#f9eff0'
                            }}
                          />
                        </div>
                       <div className="flex flex-col justify-center min-w-0 shrink">
                         <svg 
                           viewBox="0 0 1000 220" 
                           fill="none" 
                           xmlns="http://www.w3.org/2000/svg" 
                           className="max-w-full block"
                           style={{ 
                             fontSize: '25px', 
                             height: '46px', 
                             width: '213px', 
                             paddingLeft: '2px', 
                             marginTop: '-15px', 
                             marginLeft: '-14px', 
                             marginRight: '-18px', 
                             marginBottom: '-16px', 
                             paddingBottom: '-1px', 
                             paddingTop: '0px', 
                             paddingRight: '-2px', 
                             lineHeight: '25px', 
                             textAlign: 'left' 
                           }}
                         >
                           <g>
                             <text
                               x="18"
                               y="160"
                               fill="#F08D8D"
                               fontFamily="'Zen Maru Gothic', sans-serif"
                               fontSize="88"
                               fontWeight="700"
                               letterSpacing="1.5"
                               paintOrder="stroke fill"
                               style={{ fontSize: '120px', lineHeight: '30px' }}
                             >
                               たべとっと。
                             </text>
                           </g>
                         </svg>
                       </div>
                    </div>
                   <motion.button 
                      whileTap={{ scale: 0.92 }}
                      onClick={() => { triggerHaptic(); setIsMenuOpen(true); }} 
                      className="pl-3 pr-2 py-1.5 shadow-md transition-all flex items-center gap-1.5 border-2 border-double text-white"
                      style={{ backgroundColor: THEME.colors.mealPrimary, borderColor: THEME.colors.border, borderRadius: '15px' }}
                   >
                       <span className="text-sm font-black tracking-wide w-[39.2656px]">Menu</span>
                       <Menu size={18} strokeWidth={2.5} />
                   </motion.button>
               </div>
             </header>
          )}

          {/* PWAインストール案内 */}
          <PWAInstallPrompt />
          
          {isOnboarding && <OnboardingWrapper 
            onFinished={() => setIsOnboarding(false)} 
            onSaveSetup={handleSaveSetup} 
            onSkip={() => {
                setOnboardingFlags({ hasSeenOnboarding: true });
                setIsOnboarding(false);
            }} 
          />}

          {renderContent()}
          
          {/* フローティングボタン群 (右下固定) */}
          {!isAnyModalOpen && (
            <div 
              className="fixed z-[90] flex flex-col items-center gap-4 transition-all duration-300"
              style={{
                bottom: isMrecVisible 
                  ? 'calc(env(safe-area-inset-bottom, 20px) + 270px)' 
                  : isNativePlatform() 
                    ? 'calc(env(safe-area-inset-bottom, 20px) + 100px)'
                    : 'calc(env(safe-area-inset-bottom, 20px) + 160px)',
                right: '20px',
              }}
            >
              {/* 先頭へ戻るボタン */}
              {showScrollTop && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => { triggerHaptic(); handleScrollToTop(); }}
                  className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg active:scale-90 transition-all bg-white/80 backdrop-blur-sm border-2"
                  style={{
                    borderColor: THEME.colors.border,
                    color: THEME.colors.textLight
                  }}
                >
                  <ArrowUp size={20} strokeWidth={3} />
                </motion.button>
              )}

              {/* ホームボタン */}
              <button
                onClick={() => {
                  triggerHaptic();
                  if (view === AppView.DASHBOARD) {
                    scrollToTop();
                  } else {
                    setView(AppView.DASHBOARD);
                  }
                }}
                className="flex items-center justify-center w-[50px] h-[50px] rounded-full shadow-xl active:scale-95 transition-all font-['Courier_New']"
                style={{
                  backgroundColor: '#fef9f9',
                  color: '#9f9272',
                  border: '3px double #a69a7a',
                  boxShadow: `0 6px 16px rgba(0,0,0,0.15)`
                }}
                aria-label="ホームへ戻る"
              >
                <Home size={29} color="#9f9272" strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* 下固定バナー用スペース確保 */}
          {(isNativePlatform() || shouldShowWebAd) && <AdBelt />}
      </div>

      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} currentView={view} setView={setView} />

      {/* ... (Modals omitted for brevity, identical to previous) ... */}
      {selectedMeal && (
        <MealDetailModal isOpen={!!selectedMeal} onClose={() => setSelectedMeal(null)} recordDate={selectedMeal.date} meal={selectedMeal.analysis} photoBase64={selectedMeal.photo} onDelete={() => { if(confirm('この記録を削除しますか？')){ setRecords(prev => { const r = { ...prev[selectedMeal.date] }; r.mealPhotoUrls.splice(selectedMeal.index, 1); r.mealAnalyses.splice(selectedMeal.index, 1); return { ...prev, [selectedMeal.date]: r }; }); setSelectedMeal(null); } }} onShare={() => setShareModalOpen(true)} onUpdateExternalUrl={handleUpdateExternalUrl} />
      )}
      
      {shareModalOpen && (selectedMeal || (view === AppView.MEAL)) && (
          <SharePreviewModal 
            isOpen={shareModalOpen} 
            onClose={() => setShareModalOpen(false)} 
            mealAnalysis={selectedMeal ? selectedMeal.analysis : (selectedMeal || { menuName: '解析中', numericCalories: 0, pfcRatio: {p:0, f:0, c:0}, comment: '' } as any)} 
            photoBase64={selectedMeal ? selectedMeal.photo : ''} 
            dateStr={selectedMeal ? selectedMeal.date : getTodayString()} 
            initialBlob={preGeneratedBlob}
            currentView={view}
            selectedMealIndex={selectedMeal ? selectedMeal.index : null}
          />
      )}

      <PostureDetailModal 
         isOpen={isPostureModalOpen} 
         onClose={() => setIsPostureModalOpen(false)} 
         analysis={showingPostureDate ? records[showingPostureDate]?.postureAnalysis || null : null} 
         photoBase64={showingPostureDate ? records[showingPostureDate]?.posturePhotoUrl || null : null} 
         sidePhotoBase64={showingPostureDate ? records[showingPostureDate]?.postureSidePhotoUrl : null}
         isAnchor={showingPostureDate ? records[showingPostureDate]?.isPostureComparisonAnchor : false}
         onToggleAnchor={(isAnchor) => showingPostureDate && handleSetPostureAnchor(showingPostureDate, isAnchor)}
         onCompare={() => {
            setComparingDate(showingPostureDate);
            setIsCompareModalOpen(true);
            setIsPostureModalOpen(false);
         }}
      />

      {isCompareModalOpen && comparingDate && records[comparingDate] && (
          <CompareModal 
              isOpen={isCompareModalOpen}
              onClose={() => setIsCompareModalOpen(false)}
              currentRecord={records[comparingDate]}
              records={records}
              onSaveNote={handleComparisonSave}
          />
      )}

      {showStorageNotice && (
        <Modal 
          isOpen={showStorageNotice} 
          onClose={() => {
            triggerHaptic();
            const newUser = { ...user, hasSeenStorageNotice: true };
            setUser(newUser);
            setShowStorageNotice(false);
          }} 
          title="データの保存について"
        >
          <div className="space-y-6">
            <div className="flex justify-center mb-2">
              <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center border-2 border-amber-200">
                <ShieldAlert size={40} className="text-amber-500" />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-black text-stone-700 text-center leading-relaxed">
                「たべとっと。」はプライバシーを重視し、<br/>
                <span className="text-amber-600 underline">データをお客様の端末内にのみ保存</span>します。
              </p>
              <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 space-y-3">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-xs font-bold text-stone-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>アプリを削除すると記録もすべて消去されます。</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs font-bold text-stone-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>機種変更時のデータ移行機能はありません。</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs font-bold text-stone-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>大切な記録は「共有」から画像保存してください。</span>
                  </li>
                </ul>
              </div>
              <p className="text-[10px] font-bold text-stone-400 text-center leading-relaxed">
                ※10日以上前の写真は自動整理されますが、<br/>解析結果のテキストデータは永続的に残ります。
              </p>
            </div>
            <Button 
              onClick={() => {
                triggerHaptic();
                const newUser = { ...user, hasSeenStorageNotice: true };
                setUser(newUser);
                setShowStorageNotice(false);
              }} 
              className="w-full shadow-lg"
            >
              了解しました
            </Button>
          </div>
        </Modal>
      )}
      
      {keypadConfig && (
        <CuteKeypad initialValue={keypadConfig.initialValue} unit={keypadConfig.unit} onConfirm={(val) => { keypadConfig.onConfirm(val); setKeypadConfig(null); }} onCancel={() => setKeypadConfig(null)} />
      )}
      
      {calendarConfig && (
        <CuteCalendar initialDate={calendarConfig.initialDate} onConfirm={(date) => { calendarConfig.onConfirm(date); setCalendarConfig(null); }} onCancel={() => setCalendarConfig(null)} />
      )}
    </div>
  );
};

export default App;