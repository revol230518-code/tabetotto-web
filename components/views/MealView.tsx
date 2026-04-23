import { getRandomTapAction } from "../../services/mascotState";
import { CameraSource } from "@capacitor/camera";
import {
  Loader2,
  X,
  Camera,
  Share2,
  Check,
  Gift,
  PlayCircle,
  BookOpen,
  Edit2,
  PenTool,
  MessageSquare,
  Save,
  ShieldAlert,
  RotateCcw,
  Calculator,
  Utensils,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  hideBanner,
  showBanner,
  hideMrec,
  showMrec,
  hideAdsForCamera,
} from "../../services/admobService";
import { takePhoto, processBlobToBase64, processPhotoResultToBase64 } from "../../services/cameraService";
import { analyzeMeal } from "../../services/gemini/meal";
import { THEME } from "../../theme";
import { getOnboardingFlags, setOnboardingFlags } from "../../services/onboardingService";
import { DailyRecord, UserProfile, MealAnalysis, MealType } from "../../types";
import { getTodayString, MEAL_TYPE_LABELS, calculateBMI } from "../../utils";
import { Button, FileInput } from "../UIComponents";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { renderMealResultToBlob } from "../../services/renderers/mealResultRenderer";
import { GallerySaver } from "../../src/plugins/GallerySaver";
import { OFFICIAL_MASCOT_SRC } from "../../constants/mascot";

import {
  savePendingCapture,
  clearPendingCapture,
  PendingCaptureState,
} from "../../services/cameraRecovery";
import { savePendingShare, clearPendingShare } from "../../services/shareRecovery";
import { prepareShareFile, cleanupShareFile } from "../../services/shareFileService";
import { scrollToTop } from "../../utils/scrollToTop";

import { motion } from 'motion/react';
import { triggerHaptic, ImpactStyle } from '../../services/haptics';

// 豆知識のリスト
const NUTRITION_TRIVIA = [
  "ブドウ糖は脳や体の燃料🔥",
  "果物には果糖が含まれるよ🍎",
  "お砂糖の主成分はショ糖🍬",
  "ビタミンCは熱に弱い🔥",
  "筋肉の材料はたんぱく質💪",
  "食物繊維でお腹スッキリ✨",
  "鉄分で貧血予防🩸",
  "カルシウムで骨太に🦴",
  "脂質も細胞には必要だよ",
  "よく噛むと消化に良いよ🦷",
  "旬の食材は栄養満点💯",
  "水分補給も忘れずに💧",
  "大豆は畑のお肉🥩",
  "青魚の脂はサラサラ🐟",
  "きのこは低カロリー🍄",
  "海藻でミネラル補給🌊",
  "発酵食品で腸活🦠",
  "彩り豊かな食事が◎🌈",
  "朝ごはんで体内時計リセット⏰",
  "塩分の摂りすぎに注意🧂",
  "ナッツは良質な脂質🥜",
  "ブドウ糖は燃料",
  "食べ過ぎても次の日で調整👌",
  "ミネラルもしっかり",
  "日光浴でビタミンＤ",
  "骨にビタミンＤ",
  "こんにゃくは低カロリー",
  "最初に温かい飲み物で消化抑えよう",
  "ベジファースト🥬",
  "バランスの良い食事🍴",
];

// 吹き出し用Portalコンポーネント
const MascotBubble: React.FC<{
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}> = ({ anchorRef, children }) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const updatePosition = useCallback(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      // マスコットの右上に配置
      setCoords({
        top: rect.top + window.scrollY + 15,
        left: rect.left + 110,
      });
    }
  }, [anchorRef]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);

    const timeout = setTimeout(updatePosition, 100);
    const timeout2 = setTimeout(updatePosition, 500);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      clearTimeout(timeout);
      clearTimeout(timeout2);
    };
  }, [updatePosition]);

  if (!coords) return null;

  return createPortal(
    <div
      className="absolute z-[110] w-max max-w-[160px] animate-in zoom-in slide-in-from-bottom-2 pointer-events-none"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

interface MealViewProps {
  user: UserProfile;
  todayRecord: DailyRecord;
  tokens: number;
  useToken: () => boolean;
  restoreTokens: () => Promise<boolean>;
  onSave: (analysis: MealAnalysis, photo: string, date: string) => void;
  onClose: () => void;
  openKeypad: (
    initialValue: string,
    unit: string,
    onConfirm: (val: string) => void,
  ) => void;
  openCalendar: (
    initialDate: string,
    onConfirm: (date: string) => void,
  ) => void;
  onOpenGuide?: () => void;
  isMenuOpen: boolean; // Added for ad control
  restoredCapture?: { data: any; pendingState: PendingCaptureState } | null;
  clearRestoredCapture?: () => void;
}

const MealView: React.FC<MealViewProps> = ({
  user,
  todayRecord,
  tokens,
  useToken,
  restoreTokens,
  onSave,
  onClose,
  onOpenGuide,
  openKeypad,
  isMenuOpen,
  restoredCapture,
  clearRestoredCapture,
}) => {
  const [step, setStep] = useState<"intro" | "ad_wait" | "preparing" | "analyze" | "manual" | "result" | "completed">(
    "intro",
  );

  const [showMealGuide, setShowMealGuide] = useState(false);
  const [showRecordGuide, setShowRecordGuide] = useState(false);

  useEffect(() => {
    const flags = getOnboardingFlags();
    if (flags.hasCompletedInitialSetup && !flags.hasSeenMealGuide) {
      setShowMealGuide(true);
    }
  }, []);

  useEffect(() => {
    if (step === "completed") {
        const flags = getOnboardingFlags();
        if (flags.hasCompletedFirstMealRecord && !flags.hasSeenFirstRecordGuide) {
            setShowRecordGuide(true);
        }
    }
  }, [step]);

  useEffect(() => {
    scrollToTop();
  }, [step]);


  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);

  // 編集用のState
  const [editedMenuName, setEditedMenuName] = useState("");
  const [editedCalories, setEditedCalories] = useState<number | undefined>(undefined);
  const [editedComment, setEditedComment] = useState("");
  const [editedMemo, setEditedMemo] = useState("");

  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
  const mealTypeRef = useRef(selectedMealType);
  useEffect(() => {
    mealTypeRef.current = selectedMealType;
  }, [selectedMealType]);

  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // 編集モード管理
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [preparedShareUri, setPreparedShareUri] = useState<string | null>(null);

  useEffect(() => {
    if (previewBlob) {
      const url = URL.createObjectURL(previewBlob);
      setPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
      setPreparedShareUri(null);
      return () => {};
    }
  }, [previewBlob]);

  // マスコット関連
  const [mascotAnimation, setMascotAnimation] = useState("");
  const [triviaMessage, setTriviaMessage] = useState<string | null>(null);
  const mascotRef = useRef<HTMLDivElement>(null);

  // ローディング中などの状態に応じたメッセージを決定
  const displayBubbleMessage = useMemo(() => {
    return triviaMessage;
  }, [triviaMessage]);

  // 処理中のマスコット演出
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "analyze") {
      setTriviaMessage("じーっ...👀");
      setMascotAnimation("animate-sway");
      interval = setInterval(() => {
        setTriviaMessage(
          NUTRITION_TRIVIA[Math.floor(Math.random() * NUTRITION_TRIVIA.length)]
        );
      }, 3000);
    } else if (step === "preparing") {
      setTriviaMessage("画像をととのえ中...✨");
      setMascotAnimation("animate-float");
    } else {
      setMascotAnimation("");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  // 復帰時の処理
  useEffect(() => {
    if (
      restoredCapture &&
      restoredCapture.pendingState.captureKind === "meal"
    ) {
      console.log("MealView: Processing restored capture");
      // 復帰直後にローディング画面へ
      setStep("preparing");

      const processRestored = async () => {
        try {
          if (
            restoredCapture.data &&
            restoredCapture.data.data &&
            restoredCapture.data.data.base64String
          ) {
            const base64 = restoredCapture.data.data.base64String;
            handleImageProcess(base64);
          } else if (
            restoredCapture.data &&
            restoredCapture.data.data &&
            restoredCapture.data.data.webPath
          ) {
            const response = await fetch(restoredCapture.data.data.webPath);
            const blob = await response.blob();
            const base64 = await processBlobToBase64(blob);
            handleImageProcess(base64);
          } else {
            setStep("intro");
          }
        } catch (e) {
          console.error("Failed to process restored capture", e);
          setStep("intro");
        } finally {
          clearPendingCapture();
          if (clearRestoredCapture) clearRestoredCapture();
        }
      };
      processRestored();
    }
  }, [restoredCapture]);

  // 初回表示時にランダムな豆知識をセット
  useEffect(() => {
    if (step === "intro" && !triviaMessage) {
      setTriviaMessage(
        NUTRITION_TRIVIA[Math.floor(Math.random() * NUTRITION_TRIVIA.length)],
      );
    }
  }, [step, triviaMessage]);

  const handleMascotTap = () => {
    const action = getRandomTapAction();
    setMascotAnimation(action);

    // タップで新しい豆知識を表示
    const newTrivia =
      NUTRITION_TRIVIA[Math.floor(Math.random() * NUTRITION_TRIVIA.length)];
    setTriviaMessage(newTrivia);

    setTimeout(() => setMascotAnimation(""), 1000);
  };

  const recordDate = getTodayString();

  // 画面遷移・ステップに応じた広告制御
  useEffect(() => {
    // メニューが開いているときはApp.tsxが全広告を消すので、ここでは何もしない
    // メニューが閉じている時だけ制御する
    if (isMenuOpen) return;

    if (step === "analyze" || step === "preparing" || step === "ad_wait") {
      // 解析中・待機中は全広告禁止
      hideAdsForCamera();
    } else if (step === "result" || step === "manual") {
      // 結果画面はMRECだとコンテンツを隠すため、通常バナーに戻す
      hideMrec();
      showBanner();
    } else {
      // intro (通常画面) は MRECを表示
      hideBanner();
      showMrec();
    }
  }, [step, isMenuOpen]);

  const handleImageProcess = async (base64: string, skipSetup: boolean = false) => {
    if (!skipSetup) {
      if (!useToken()) {
        setStep("ad_wait");
        return;
      }
      // 解析開始直前に広告を消す念押し
      await hideAdsForCamera();
    }
    
    setStep("analyze");
    setImage(base64);

    try {
      const result = await analyzeMeal(base64);
      setAnalysis(result);
      setEditedMenuName(result.menuName);
      setEditedCalories(result.numericCalories);
      setEditedComment(result.comment);
      setEditedMemo("");
      
      // 解析完了時に即時同期
      setDebouncedPreviewData({
        menuName: result.menuName,
        calories: result.numericCalories,
        comment: result.comment,
        memo: "",
      });
      
      setStep("result");
    } catch (e: any) {
      console.error("AI_FLOW_ERROR", e);

      if (e?.name === "AbortError") {
        alert("通信がタイムアウトしました。電波環境をご確認ください。");
      } else if (e?.message?.includes("fetch")) {
        alert("画像の読み込みに失敗しました。もう一度お試しください。");
      } else if (e?.message?.toLowerCase().includes("memory")) {
        alert(
          "端末のメモリ不足の可能性があります。画像サイズを縮小してください。",
        );
      } else {
        alert(`画像準備中にエラーが発生しました。\n${e?.message || ""}`);
      }
      setImage(null);
      setStep("intro");
    } finally {
      clearPendingCapture();
    }
  };

  const handleManualInput = async () => {
    // 広告制御
    await hideAdsForCamera();

    setImage(null);
    const initialAnalysis: MealAnalysis = {
      menuName: "",
      numericCalories: 0,
      pfcRatio: { p: 0, f: 0, c: 0 },
      comment: "",
      isFood: true,
      category: "food",
      mealType: "lunch",
    };
    setAnalysis(initialAnalysis);
    setEditedMenuName("");
    setEditedCalories(undefined);
    setEditedComment("");
    setEditedMemo("");
    
    setStep("manual");
  };

  const getCurrentAnalysis = useCallback((): MealAnalysis => {
    if (!analysis) throw new Error("No analysis");
    return {
      ...analysis,
      menuName: editedMenuName,
      numericCalories: editedCalories,
      comment: editedComment,
      memo: editedMemo,
      mealType: mealTypeRef.current,
    };
  }, [
    analysis,
    editedMenuName,
    editedCalories,
    editedComment,
    editedMemo,
  ]);

  // プレビュー生成用のデバウンス処理
  const [debouncedPreviewData, setDebouncedPreviewData] = useState({
    menuName: editedMenuName,
    calories: editedCalories,
    comment: editedComment,
    memo: editedMemo,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPreviewData({
        menuName: editedMenuName,
        calories: editedCalories,
        comment: editedComment,
        memo: editedMemo,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [editedMenuName, editedCalories, editedComment, editedMemo]);

  useEffect(() => {
    if (step !== "result") return;
    
    if (!image) {
      setPreviewBlob(null);
      return;
    }
    
    if (!analysis) return;
    
    // blocked以外でmenuNameが空の場合は生成を待つ
    if (analysis.category !== "blocked" && !debouncedPreviewData.menuName) return;

    const updatePreview = async () => {
      // デバウンスされたデータを使用して解析オブジェクトを作成
      const current: MealAnalysis = {
        ...analysis,
        menuName: debouncedPreviewData.menuName,
        numericCalories: debouncedPreviewData.calories,
        comment: debouncedPreviewData.comment,
        memo: debouncedPreviewData.memo,
        mealType: mealTypeRef.current,
      };
      const blob = await renderMealResultToBlob(image, current, recordDate);
      setPreviewBlob(blob);
    };
    updatePreview();
  }, [
    step,
    image,
    analysis,
    debouncedPreviewData,
    recordDate,
  ]);

  const handleStartCapture = async () => {
    if (tokens <= 0) {
      setStep("ad_wait");
      return;
    }

    // カメラ起動前にも広告を消す
    await hideAdsForCamera();

    savePendingCapture({
      captureKind: "meal",
      postureStep: null,
      startedAt: Date.now(),
      currentView: "MEAL",
      requestId: Math.random().toString(36).substring(7),
      restoreStatus: "pending",
    });

    try {
      const result = await takePhoto(CameraSource.Camera, "rear");
      clearPendingCapture();
      
      // トークン消費確認
      if (!useToken()) {
        setStep("ad_wait");
        return;
      }
      setStep("preparing");
      
      const base64 = await processPhotoResultToBase64(result);
      handleImageProcess(base64, true);
    } catch (e: any) {
      console.error("CAPTURE_ERROR", e);
      let errorMessage = "エラーが発生しました。";
      
      if (e.message === "CANCELLED") {
        // 何もしない
      } else if (e.message?.includes("画像の読み込みに失敗しました")) {
        errorMessage = e.message;
      } else if (e.message?.includes("Permission") || e.message?.includes("denied")) {
        errorMessage = "カメラの使用が許可されていないようです。ブラウザの設定でカメラを許可するか、アルバムから写真を選択してください。";
      } else if (!Capacitor.isNativePlatform()) {
        errorMessage = "カメラの起動に失敗しました。アルバムからの選択をお試しください。";
      } else {
        errorMessage = `画像の処理中にエラーが発生しました: ${e.message}`;
      }
      
      if (e.message !== "CANCELLED") alert(errorMessage);
      
      clearPendingCapture();
      setStep("intro");
    }
  };

  const handleRestore = async () => {
    await hideAdsForCamera();
    const success = await restoreTokens();
    if (success) {
      clearPendingCapture();
      setStep("intro");
    }
  };

  const handleRetake = () => {
    clearPendingCapture();
    setImage(null);
    setAnalysis(null);
    setIsEditing(false);
    setHasSaved(false);
    setStep("intro");
  };

  const performSave = async (): Promise<boolean> => {
    if (!analysis || isSaving || hasSaved) return hasSaved;
    // 画像がある場合はプレビュー生成を待つ
    if (image && !previewBlob) {
      alert("画像の準備中です。少々お待ちください。");
      return false;
    }

    setIsSaving(true);
    try {
      let fileUri = "";

      // 画像がある場合のみ、画像生成・保存処理を行う
      if (image && previewBlob) {
        const blob = previewBlob;
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(",")[1]);
          };
          reader.readAsDataURL(blob);
        });
        const base64data = await base64Promise;
        const fileName = `tabetotto_${recordDate.replace(/-/g, "")}_${Date.now()}.jpg`;

        let gallerySaved = false;
        if (Capacitor.getPlatform() === "android") {
          try {
            const res = await GallerySaver.saveImage({
              base64: base64data,
              fileName: fileName,
              album: "たべとっと。",
            });
            if (res.saved) {
              gallerySaved = true;
            }
          } catch (e) {
            console.warn("Gallery save failed:", e);
          }
        }

        if (!gallerySaved) {
          if (Capacitor.isNativePlatform()) {
            try {
              await Filesystem.writeFile({
                path: fileName,
                data: base64data,
                directory: Directory.Documents,
              });
            } catch (fsError) {
              console.error("Device documents save failed", fsError);
            }
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
          }
        }

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64data,
          directory: Directory.Data,
        });
        fileUri = savedFile.uri;
      }

      onSave(getCurrentAnalysis(), fileUri, recordDate);
      setOnboardingFlags({ hasCompletedFirstMealRecord: true });
      setHasSaved(true);
      showToast("保存しました✨");
      return true;
    } catch (e) {
      console.error("Save error:", e);
      alert("保存中にエラーが発生しました");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const performManualSave = async (): Promise<boolean> => {
    if (!analysis || isSaving || hasSaved) return hasSaved;

    // validation
    if (!editedMenuName.trim()) {
        alert("品名を入力してください");
        return false;
    }

    setIsSaving(true);
    try {
      // fileUriは空文字で保存
      onSave(getCurrentAnalysis(), "", recordDate);
      setOnboardingFlags({ hasCompletedFirstMealRecord: true });
      setHasSaved(true);
      showToast("保存しました✨");
      return true;
    } catch (e) {
      console.error("Save error:", e);
      alert("保存中にエラーが発生しました");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToApp = async () => {
    const saved = await performSave();
    if (saved) {
      setStep("completed");
    }
  };

  const handleSaveManualToApp = async () => {
    const saved = await performManualSave();
    if (saved) {
      setStep("completed");
    }
  };

  const handleContinueRecording = () => {
    triggerHaptic();
    clearPendingCapture();
    setImage(null);
    setAnalysis(null);
    setIsEditing(false);
    setHasSaved(false);
    setStep("intro");
  };

  const handleDirectShare = async () => {
    if (!analysis || isSharing) return;
    
    // 画像がない（手入力）の場合はシェア不可
    if (!image) {
      alert("写真は保存されません。手入力メモとして保存してください。");
      return;
    }

    if (!previewBlob) {
      alert("画像の準備中です。少々お待ちください。");
      return;
    }

    // 未保存なら自動保存
    if (!hasSaved) {
      const saved = await performSave();
      if (!saved) return; // 保存失敗時は中断
    }

    setIsSharing(true);
    let fallbackUri: string | null = null;

    try {
      const blob = previewBlob;

      if (Capacitor.isNativePlatform()) {
        let uriToShare = preparedShareUri;
        
        if (!uriToShare) {
          fallbackUri = await prepareShareFile(blob, 'tabetotto_share_meal_fallback');
          uriToShare = fallbackUri;
        }

        if (!uriToShare) {
          console.error('share:native:fail', 'No URI available');
          alert("シェアの準備に失敗しました");
          return;
        }

        await savePendingShare({
          shareKind: 'meal-direct',
          currentView: 'MEAL',
          recordDate: recordDate,
          selectedMealDate: null,
          selectedMealIndex: null,
          shareModalOpen: false,
          startedAt: Date.now(),
          requestId: Date.now().toString(),
          restoreStatus: 'pending'
        });

        await Share.share({
          title: "たべとっと。で食事を記録しました",
          text: "今日の食事記録です✨ #たべとっと",
          url: uriToShare,
        });
      } else if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [new File([blob], "share.jpg", { type: "image/jpeg" })],
        })
      ) {
        const file = new File([blob], "diet_record.jpg", {
          type: "image/jpeg",
        });
        
        await savePendingShare({
          shareKind: 'meal-direct',
          currentView: 'MEAL',
          recordDate: recordDate,
          selectedMealDate: null,
          selectedMealIndex: null,
          shareModalOpen: false,
          startedAt: Date.now(),
          requestId: Date.now().toString(),
          restoreStatus: 'pending'
        });

        await navigator.share({
          files: [file],
          title: "たべとっと。で食事を記録しました",
          text: "今日の食事記録です✨ #たべとっと",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tabetotto_share_${recordDate}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
        alert("画像を保存しました");
      }
    } catch (e) {
      console.error("share:native:fail", e);
    } finally {
      setIsSharing(false);
      await clearPendingShare();
      if (fallbackUri) {
        cleanupShareFile(fallbackUri);
      }
    }
  };


  return (
    <div className="flex flex-col min-h-screen pb-[250px] w-full no-scrollbar overflow-x-hidden relative">
      {showMealGuide && (
         <div className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-6" onClick={() => {
             setShowMealGuide(false);
             setOnboardingFlags({ hasSeenMealGuide: true });
         }}>
             <div className="bg-white p-6 rounded-3xl shadow-2xl animate-in fade-in zoom-in border-4 border-stone-200 w-full max-w-sm">
                 <h3 className="font-black text-lg mb-2 text-stone-700">ごはんを記録しよう！</h3>
                 <p className="text-sm text-stone-600 mb-4">写真で記録できます。<br/>写真がなくても手入力できます。</p>
                 <Button onClick={(e) => {
                     e.stopPropagation();
                     setShowMealGuide(false);
                     setOnboardingFlags({ hasSeenMealGuide: true });
                 }} className="w-full">わかった！</Button>
             </div>
         </div>
      )}
      <div className="absolute bottom-[-5%] -right-12 w-72 h-72 opacity-[0.08] pointer-events-none z-0 rotate-[-15deg]">
        <img src={OFFICIAL_MASCOT_SRC} alt="" className="w-full h-full object-contain grayscale brightness-150" />
      </div>

      <main className="mt-2 animate-in slide-in-from-bottom duration-300 relative z-10 pb-[250px]">
        {(step === "intro" || step === "analyze" || step === "preparing" || step === "manual") && (
          <div className="px-6 flex flex-col items-center space-y-2">
            
            {/* Intro / Manual mascot UI */}
            {step !== "manual" && (
                <div className="flex items-center justify-center relative w-full mb-0">
                  <div className="relative w-full flex justify-start pl-2">
                    {onOpenGuide && step === "intro" && (
                      <div className="absolute right-0 top-0 w-28 z-20">
                        <Button
                          variant="guide"
                          onClick={onOpenGuide}
                          className="btn-3d w-full px-2 py-2 text-[10px] min-h-[40px] h-auto flex flex-col items-center gap-0.5 shadow-sm transition-transform"
                        >
                          <BookOpen size={16} strokeWidth={2.5} />
                          <span className="whitespace-nowrap font-black">
                            栄養ガイド
                          </span>
                        </Button>
                      </div>
                    )}

                    <motion.div
                      ref={mascotRef}
                      whileTap={{ scale: 0.95 }}
                      className={`relative z-10 ${mascotAnimation || "animate-float"}`}
                      onClick={step === "intro" ? () => { triggerHaptic(); handleMascotTap(); } : undefined}
                      style={{
                        width: "150px",
                        height: "150px",
                        marginLeft: "-10px",
                      }}
                    >
                      <img
                        src={OFFICIAL_MASCOT_SRC}
                        className="w-full h-auto object-contain drop-shadow-lg"
                        style={{ padding: "16px" }}
                        alt="Mascot"
                      />
                    </motion.div>

                    {displayBubbleMessage && (
                      <MascotBubble anchorRef={mascotRef}>
                        <div
                          className={`bg-white px-2.5 py-1 rounded-xl rounded-bl-none shadow-md border-2 border-stone-100 text-[10px] font-black text-stone-600 relative ${mascotAnimation || "animate-float"}`}
                        >
                          {displayBubbleMessage}
                          <div className="absolute -bottom-1.5 left-2 w-2.5 h-2.5 bg-white border-b-2 border-l-2 border-stone-100 transform -rotate-12 skew-x-12"></div>
                        </div>
                      </MascotBubble>
                    )}
                  </div>
                </div>
            )}

            {step === "intro" && (
              <>
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black">ごはんを記録</h2>
                  <p className="text-[10px] font-bold opacity-50">
                    写真を撮るだけでAIがカロリー推定
                  </p>
                  <p className="text-[9px] font-bold text-stone-400 mt-0.5">
                    ※写っている料理は全て合算されます（1人前で撮影）
                  </p>
                </div>

                <div className="w-full space-y-2 pt-1">
                  <div className="relative group">
                    <Button
                      onClick={handleStartCapture}
                      className="w-full min-h-[64px] h-auto py-2 text-lg font-black shadow-xl overflow-hidden relative"
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-black/5 -skew-x-12 translate-x-4 pointer-events-none"></div>
                      <Camera size={22} className="mr-2 relative z-10 shrink-0" />{" "}
                      <span className="relative z-10">撮影をはじめる</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative group">
                      <Button
                        onClick={handleManualInput}
                        variant="neutral"
                        className="w-full h-full min-h-[56px] py-2 border-0 rounded-[20px] font-black shadow-md"
                      >
                        <PenTool size={18} className="mr-1 shrink-0" />
                        <span className="font-black text-sm">手入力</span>
                      </Button>
                    </div>
                    <div className="relative group">
                      <FileInput
                        label="アルバム"
                        onFileSelect={async (file) => {
                          try {
                            if (!useToken()) {
                              setStep("ad_wait");
                              return;
                            }
                            await hideAdsForCamera();
                            setStep("preparing");
                            const compressed = await processBlobToBase64(file);
                            handleImageProcess(compressed, true);
                          } catch (e) {
                            alert("画像の読み込みに失敗しました");
                            setStep("intro");
                          }
                        }}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {(step === "analyze" || step === "preparing") && (
              <div className="flex flex-col items-center justify-center space-y-10 py-10 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none">
                  <img src={OFFICIAL_MASCOT_SRC} alt="" className="w-40 h-40 object-contain animate-pulse" />
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <Loader2
                    className="animate-spin relative z-10"
                    style={{ color: THEME.colors.mealPrimary }}
                    size={60}
                    strokeWidth={3}
                  />
                  <p className="text-sm font-black text-stone-500 relative z-10">
                    {step === "preparing" ? "画像を準備中..." : "食事を解析中..."}
                  </p>
                </div>
              </div>
            )}
            
            {step === "manual" && (
                <div className="w-full animate-in slide-in-from-bottom duration-300 pt-4 space-y-4">
                    <div className="text-center space-y-1 pt-4">
                      <h2 className="text-xl font-black text-stone-700">手入力で記録</h2>
                      <p className="text-[11px] font-bold text-stone-400">
                        写真なしでも、食べた内容をメモできます
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* 食事区分 */}
                      <div className="bg-white p-1.5 rounded-[24px] border-2 flex justify-between gap-1 shadow-sm" style={{ borderColor: THEME.colors.border }}>
                        {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => {
                            const info = MEAL_TYPE_LABELS[type];
                            const isActive = selectedMealType === type;
                            return (
                                <button
                                    key={type}
                                    onClick={() => { triggerHaptic(ImpactStyle.Light); setSelectedMealType(type); }}
                                    className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-[20px] transition-all ${isActive ? info.activeColor + " shadow-md" : "text-stone-300"}`}
                                >
                                    <info.icon size={16} strokeWidth={2.5} className="mb-0.5" />
                                    <span className="text-[9px] font-black tracking-tight">{info.label}</span>
                                </button>
                            );
                        })}
                      </div>

                      {/* 品名 */}
                      <div className="bg-white p-5 rounded-[28px] border-2 border-stone-200 shadow-sm focus-within:border-stone-400">
                          <label className="text-[10px] font-black text-stone-400 uppercase mb-2 flex items-center gap-1.5">
                              <Utensils size={10} /> 品名
                          </label>
                          <input type="text" value={editedMenuName} onChange={(e) => setEditedMenuName(e.target.value)} placeholder="料理名を入力" className="w-full bg-transparent outline-none text-lg font-black text-stone-700 placeholder:text-stone-200" />
                      </div>
                      
                      {/* カロリー */}
                      <div className="bg-white p-5 rounded-[28px] border-2 border-stone-200 shadow-sm focus-within:border-stone-400">
                          <label className="text-[10px] font-black text-stone-400 uppercase mb-2 flex items-center gap-1.5">
                              <Calculator size={10} /> カロリー (kcal)
                          </label>
                          <input type="number" value={editedCalories ?? ""} onChange={(e) => setEditedCalories(e.target.value === "" ? undefined : Number(e.target.value))} placeholder="0" className="w-full bg-transparent outline-none text-lg font-black text-stone-700 placeholder:text-stone-200" />
                      </div>
                      
                      {/* メモ */}
                      <div className="bg-white p-5 rounded-[28px] border-2 border-stone-200 shadow-sm focus-within:border-stone-400">
                          <label className="text-[10px] font-black text-stone-400 uppercase mb-2 flex items-center gap-1.5">
                              <MessageSquare size={10} /> メモ
                          </label>
                          <textarea value={editedMemo} onChange={(e) => setEditedMemo(e.target.value)} placeholder="メモ" className="w-full bg-transparent outline-none text-sm font-bold text-stone-600 placeholder:text-stone-200 min-h-[60px]" />
                      </div>

                      {/* 確定ボタン */}
                      <button
                        onClick={handleSaveManualToApp}
                        disabled={isSaving}
                        className="btn-3d w-full min-h-[64px] h-auto py-3 text-lg font-black rounded-[28px] transition-all flex items-center justify-center gap-3 text-white shadow-lg"
                        style={{ backgroundColor: THEME.colors.mealPrimary, borderColor: THEME.colors.mealPrimary }}
                      >
                       {isSaving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                       この内容で記録する
                      </button>
                    </div>
                </div>
            )}
            
          </div>
        )}

        {step === "ad_wait" && (
          <div className="px-6 py-10 animate-in zoom-in-95">
            <div
              className="w-full p-8 rounded-[40px] bg-white border-4 shadow-xl relative overflow-hidden"
              style={{ borderColor: THEME.colors.border }}
            >
              <div
                className="absolute top-0 left-0 w-full h-2"
                style={{ backgroundColor: THEME.colors.mealPrimary }}
              ></div>
              <button
                onClick={() => {
                  clearPendingCapture();
                  setStep("intro");
                }}
                className="absolute top-4 right-4 p-2 text-stone-300"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col items-center space-y-6 text-center">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3"
                  style={{ backgroundColor: THEME.colors.mealSoft }}
                >
                  <Gift
                    size={40}
                    className="animate-bounce"
                    style={{ color: THEME.colors.mealPrimary }}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-black">記録回数がゼロです</h3>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-stone-600">
                      2時間待つと1回分回復（最大2回まで）
                    </p>
                    <p className="text-xs font-bold text-stone-600">
                      広告を見ると4回分まとめて回復（最大4回）
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleRestore}
                  variant="primary"
                  className="w-full min-h-[56px] h-auto py-3 shadow-lg font-black rounded-2xl"
                >
                  <PlayCircle size={20} className="mr-2 shrink-0" />{" "}
                  広告を見て回復
                </Button>
              </div>
            </div>
          </div>
        )}


        {step === "result" && analysis && (
          <div className="space-y-6 animate-in zoom-in-95 pb-40">
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-stone-800 text-white px-6 py-3 rounded-full text-sm font-black shadow-2xl"
              >
                {toast}
              </motion.div>
            )}

            <div className={`px-6 space-y-4 ${!image ? "pt-4" : ""}`}>
              {!image && (
                <div className="flex flex-col items-center -mb-2">
                  <motion.div
                    animate={{ 
                      y: [0, -8, 0],
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative"
                    style={{ width: "90px", height: "90px" }}
                  >
                    <img
                      src={OFFICIAL_MASCOT_SRC}
                      className="w-full h-auto object-contain drop-shadow-md"
                      alt="Mascot"
                    />
                  </motion.div>
                  <div className="bg-white px-3 py-1 rounded-full border-2 border-stone-100 shadow-sm -mt-2 relative z-10">
                    <span className="text-[10px] font-black text-stone-500">
                      {analysis.category === "blocked" ? "うーん..." : analysis.category === "non_food" ? "なになに〜？" : "おいしそう！"}
                    </span>
                  </div>
                </div>
              )}
              {image && (
                <div className="relative w-full aspect-[3/4] shadow-2xl rounded-[32px] overflow-hidden border-2 border-[#E5DDD0] bg-[#FFFDF5]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      className="w-full h-full object-contain"
                      alt="Meal Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100">
                      <Loader2
                        className="animate-spin mb-2"
                        style={{ color: THEME.colors.mealPrimary }}
                      />
                      <span className="text-xs font-bold text-stone-400">
                        カード生成中...
                      </span>
                    </div>
                  )}
                </div>
              )}

              {!isEditing && (
                <div
                  className="bg-white p-1.5 rounded-[24px] border-2 flex justify-between gap-1 shadow-sm"
                  style={{ borderColor: THEME.colors.border }}
                >
                  {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => {
                    const info = MEAL_TYPE_LABELS[type];
                    const isActive = selectedMealType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          triggerHaptic(ImpactStyle.Light);
                          setSelectedMealType(type);
                          mealTypeRef.current = type;
                        }}
                        className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-[20px] transition-all duration-300 ${isActive ? info.activeColor + " shadow-md transform scale-[1.02]" : "text-stone-300 hover:bg-stone-50 hover:text-stone-400"}`}
                      >
                        <info.icon size={16} strokeWidth={2.5} className="mb-0.5" />
                        <span className="text-[9px] font-black tracking-tight">{info.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {isEditing && (
                <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex justify-between items-center px-1">
                    <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">編集モード</h4>
                    <button onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-600">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {analysis.category === "food" && (
                      <div 
                        className="bg-white p-4 rounded-[28px] border-2 shadow-sm transition-all focus-within:border-stone-300 relative overflow-hidden" 
                        style={{ borderColor: THEME.colors.mealPrimary }}
                      >
                        <label className="text-[10px] font-black text-stone-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                          <Calculator size={10} style={{ color: THEME.colors.mealPrimary }} /> カロリー
                        </label>
                        <div className="flex items-end gap-2">
                          <input
                            type="number"
                            value={editedCalories ?? ""}
                            onChange={(e) => setEditedCalories(e.target.value === "" ? undefined : Number(e.target.value))}
                            className="w-full bg-transparent outline-none text-3xl font-black text-stone-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            style={{ color: THEME.colors.mealPrimary }}
                          />
                          <span className="text-sm font-black text-stone-400 mb-1">kcal</span>
                          <button
                            onClick={() =>
                              openKeypad((editedCalories ?? "").toString(), "kcal", (val) =>
                                setEditedCalories(val === "" ? undefined : Number(val)),
                              )
                            }
                            className="p-2 mb-0.5 bg-stone-50 rounded-full text-stone-300 hover:text-stone-500 transition-colors"
                          >
                            <PenTool size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div 
                      className="bg-white p-5 rounded-[28px] border-2 shadow-sm transition-all focus-within:border-stone-300" 
                      style={{ borderColor: THEME.colors.border }}
                    >
                      <label className="text-[10px] font-black text-stone-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                        <Utensils size={10} /> 品名
                      </label>
                      <input
                        type="text"
                        value={editedMenuName}
                        onChange={(e) => setEditedMenuName(e.target.value)}
                        placeholder="料理名を入力"
                        className="w-full bg-transparent outline-none text-xl font-black text-stone-700 placeholder:text-stone-200"
                      />
                    </div>

                    <div 
                      className="bg-white p-5 rounded-[28px] border-2 shadow-sm transition-all focus-within:border-stone-300" 
                      style={{ borderColor: THEME.colors.border }}
                    >
                      <label className="text-[10px] font-black text-stone-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                        <MessageSquare size={10} /> メモ
                      </label>
                      <textarea
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        placeholder={analysis.category === "blocked" ? "（コメントなし）" : "AIコメントを編集"}
                        className="w-full bg-transparent outline-none text-sm font-bold leading-relaxed text-stone-500 placeholder:text-stone-200 min-h-[80px] resize-none"
                      />
                    </div>

                    <div 
                      className="bg-white p-4 rounded-[24px] border-2 shadow-sm transition-all focus-within:border-stone-300" 
                      style={{ borderColor: THEME.colors.border }}
                    >
                      <label className="text-[10px] font-black text-stone-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                        <MessageSquare size={10} /> 自分メモ
                      </label>
                      <textarea
                        value={editedMemo}
                        onChange={(e) => setEditedMemo(e.target.value)}
                        placeholder="自分だけのメモ（画像には載りません）"
                        className="w-full bg-transparent outline-none text-xs font-bold text-stone-400 placeholder:text-stone-200 min-h-[40px] resize-none"
                      />
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => setIsEditing(false)}
                      className="w-full h-14 rounded-[24px] font-black shadow-lg"
                    >
                      完了
                    </Button>
                  </div>
                </div>
              )}

              {!isEditing && (
                <div className="px-6 space-y-4 pt-4">
                  <button
                    onClick={handleSaveToApp}
                    disabled={isSaving || hasSaved || !!(image && !previewBlob)}
                    className="btn-3d w-full min-h-[64px] h-auto py-3 text-lg font-black rounded-[28px] transition-all flex items-center justify-center gap-3 text-white shadow-lg"
                    style={{ backgroundColor: THEME.colors.mealPrimary, borderColor: THEME.colors.mealPrimary }}
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Save size={24} />
                    )}
                    {isSaving ? "保存中..." : "この内容で記録する"}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleRetake}
                      className="btn-3d w-full min-h-[56px] h-auto py-2 text-sm font-black rounded-[24px] transition-all flex items-center justify-center gap-2 border-2 bg-stone-50 text-stone-400"
                      style={{ borderColor: THEME.colors.border }}
                    >
                      <RotateCcw size={18} />
                      やりなおす
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-3d w-full min-h-[56px] h-auto py-2 text-sm font-black rounded-[24px] transition-all flex items-center justify-center gap-2 border-2 bg-white"
                      style={{ borderColor: THEME.colors.mealPrimary, color: THEME.colors.mealPrimary }}
                    >
                      <Edit2 size={18} />
                      編集する
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === "completed" && (
          <div className="space-y-8 animate-in zoom-in-95 pb-40 px-6">
            {showRecordGuide && (
              <div className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-6" onClick={() => {
                  setShowRecordGuide(false);
                  setOnboardingFlags({ hasSeenFirstRecordGuide: true });
              }}>
                  <div className="bg-white p-6 rounded-3xl shadow-2xl animate-in fade-in zoom-in border-4 border-stone-200 w-full max-w-sm">
                      <h3 className="font-black text-lg mb-2 text-stone-700">記録できました！</h3>
                      <p className="text-sm text-stone-600 mb-4">今日の合計に反映されました。<br/>ホームで見返せます。</p>
                      <Button onClick={(e) => {
                          e.stopPropagation();
                          setShowRecordGuide(false);
                          setOnboardingFlags({ hasSeenFirstRecordGuide: true });
                      }} className="w-full">わかった！</Button>
                  </div>
              </div>
            )}
            <div className="flex flex-col items-center justify-center space-y-4 pt-8">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: THEME.colors.mealSoft }}
              >
                <Check size={40} style={{ color: THEME.colors.mealPrimary }} strokeWidth={4} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-black text-stone-700">記録完了！</h3>
                <p className="text-sm font-bold text-stone-400">今日もナイスな食事ですね✨</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 mt-4 mx-6">
                <h4 className="font-black text-stone-700 mb-2">今日の記録はこんなかんじ✨</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-stone-50 p-3 rounded-xl">
                         <p className="text-[10px] font-bold text-stone-400">今のBMI</p>
                         <p className="text-lg font-black text-stone-700">{calculateBMI(user.height, todayRecord.weight || 0) || "--"}</p>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl">
                         <p className="text-[10px] font-bold text-stone-400">目標まで</p>
                         <p className="text-lg font-black text-primary">{(todayRecord.weight && user.targetWeight) ? (todayRecord.weight - user.targetWeight).toFixed(1) : "--"}kg</p>
                    </div>
                </div>
                <p className="text-[10px] text-stone-400 mt-4 text-center">※記録を続けるとホームでグラフが見れます</p>
            </div>

            {image && previewUrl && (
              <div className="relative w-full max-w-[280px] mx-auto aspect-[3/4] shadow-xl rounded-[24px] overflow-hidden border-2 border-[#E5DDD0]">
                <img src={previewUrl} className="w-full h-full object-contain" alt="Saved Meal" />
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleDirectShare}
                disabled={isSharing || !!(image && !previewBlob)}
                className="btn-3d w-full min-h-[64px] h-auto py-2 text-lg font-black rounded-[28px] transition-all flex items-center justify-center gap-3 text-white shadow-lg"
                style={{ backgroundColor: THEME.colors.readPrimary, borderColor: THEME.colors.readPrimary }}
              >
                {isSharing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Share2 size={24} />
                )}
                {isSharing ? "作成中..." : "シェアする"}
              </button>

              <div className="bg-stone-50 p-3 rounded-xl border border-dashed border-stone-200 flex items-center gap-2 justify-center">
                <ShieldAlert size={12} className="text-stone-400" />
                <p className="text-[9px] font-bold text-stone-400">
                  大切な記録は「シェア」から画像保存しておくと安心です✨
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleContinueRecording}
                  className="btn-3d w-full min-h-[60px] h-auto py-2 text-sm font-black rounded-[24px] transition-all flex flex-col items-center justify-center border-2 bg-white text-stone-600"
                  style={{ borderColor: THEME.colors.border }}
                >
                  <RotateCcw size={20} className="mb-1" />
                  つづけて記録
                </button>

                <button
                  onClick={onClose}
                  className="btn-3d w-full min-h-[60px] h-auto py-2 text-sm font-black rounded-[24px] transition-all flex flex-col items-center justify-center border-2 bg-stone-50 text-stone-500"
                  style={{ borderColor: THEME.colors.border }}
                >
                  <X size={20} className="mb-1" />
                  ホームへ戻る
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MealView;
