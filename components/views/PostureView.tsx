import { getRandomTapAction } from "../../services/mascotState";
import { CameraSource } from "@capacitor/camera";
import {
  Camera,
  Loader2,
  X,
  Check,
  CalendarPlus,
  Share2,
  Activity,
  Gift,
  PlayCircle,
  ArrowLeftRight,
} from "lucide-react";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  hideBanner,
  showBanner,
  hideMrec,
  showMrec,
  hideAdsForCamera,
} from "../../services/admobService";
import { takePhoto, processBlobToBase64, processPhotoResultToBase64 } from "../../services/cameraService";
import { analyzePosture } from "../../services/gemini/posture";
import { THEME } from "../../theme";
import { PostureAnalysis } from "../../types";
import { getTodayString, addToCalendar } from "../../utils";
import { Button, FileInput, Card } from "../UIComponents";
import { PostureResultCarousel } from "../SharedModals";
import { GallerySaver } from "../../src/plugins/GallerySaver";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { OFFICIAL_MASCOT_SRC } from "../../constants/mascot";

import {
  savePendingCapture,
  clearPendingCapture,
  getTempFrontImage,
  saveTempFrontImage,
  clearTempFrontImage,
  PendingCaptureState,
} from "../../services/cameraRecovery";

import { motion } from 'motion/react';
import { triggerHaptic, ImpactStyle } from '../../services/haptics';
import { scrollToTop } from "../../utils/scrollToTop";

const SELF_RECORD_MESSAGES = [
  "姿勢は筋肉から",
  "筋力は身体を支えてる",
  "体幹は土台",
  "呼吸にも姿勢から",
  "歩きも運動だよ",
  "家事も運動だよ",
  "どんな動きもカロリー使ってる",
  "日常の散歩も運動だよ",
  "どんな活動でも身体使ってる",
  "変化を知るにはきろくから",
  "体調もヒントだよ",
  "回復も大事だよ",
  "睡眠も大事な要素💤",
  "休みも大事",
  "記録も大事",
  "消費カロリーも知る事から",
  "記録だけでも大きな一歩",
  "今日も一歩前進だね",
  "小さな変化も積み重ね🌸",
  "気づきも大事だよ",
  "無理せずいこう",
  "焦らなくて大丈夫",
  "少しずつで大丈夫",
];

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

interface PostureViewProps {
  tokens: number;
  useToken: () => boolean;
  restoreTokens: () => Promise<boolean>;
  onSave: (
    photo: string,
    analysis: PostureAnalysis,
    date: string,
    sidePhoto?: string | null,
    isAnchor?: boolean,
  ) => void;
  onClose: () => void;
  openCalendar: (
    initialDate: string,
    onConfirm: (date: string) => void,
  ) => void;
  onCompare?: () => void;
  onOpenMoveGuide?: () => void;
  isMenuOpen: boolean;
  restoredCapture?: { data: any; pendingState: PendingCaptureState } | null;
  clearRestoredCapture?: () => void;
}

const PostureView: React.FC<PostureViewProps> = ({
  tokens,
  useToken,
  restoreTokens,
  onSave,
  onClose,
  onCompare,
  onOpenMoveGuide,
  isMenuOpen,
  restoredCapture,
  clearRestoredCapture,
}) => {
  const [step, setStep] = useState<
    "intro" | "ad_wait" | "side_wait" | "analyze" | "result"
  >("intro");

  useEffect(() => {
    scrollToTop();
  }, [step]);

  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PostureAnalysis | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isAnchor, setIsAnchor] = useState(false);
  const [mascotAnimation, setMascotAnimation] = useState("");
  const [triviaMessage, setTriviaMessage] = useState("");
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
          SELF_RECORD_MESSAGES[Math.floor(Math.random() * SELF_RECORD_MESSAGES.length)]
        );
      }, 3000);
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
      restoredCapture.pendingState.captureKind === "posture"
    ) {
      console.log(
        "PostureView: Processing restored capture",
        restoredCapture.pendingState.postureStep,
      );

      const processRestored = async () => {
        try {
          let base64ToProcess = "";
          if (
            restoredCapture.data &&
            restoredCapture.data.data &&
            restoredCapture.data.data.base64String
          ) {
            base64ToProcess = restoredCapture.data.data.base64String;
          } else if (
            restoredCapture.data &&
            restoredCapture.data.data &&
            restoredCapture.data.data.webPath
          ) {
            const response = await fetch(restoredCapture.data.data.webPath);
            const blob = await response.blob();
            base64ToProcess = await processBlobToBase64(blob);
          }

          if (base64ToProcess) {
            if (restoredCapture.pendingState.postureStep === "front") {
              setFrontImage(base64ToProcess);
              saveTempFrontImage(base64ToProcess);
              setStep("side_wait");
            } else if (restoredCapture.pendingState.postureStep === "side") {
              const tempFront = getTempFrontImage();
              if (tempFront) {
                setFrontImage(tempFront);
                startAnalysis(base64ToProcess, tempFront);
              } else {
                console.warn("Cannot restore side image without front image context.");
                setStep("intro");
              }
            }
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

      if (restoredCapture.pendingState.postureStep === "front" || restoredCapture.pendingState.postureStep === "side") {
        processRestored();
      } else {
        clearPendingCapture();
        if (clearRestoredCapture) clearRestoredCapture();
        setStep("intro");
      }
    }
  }, [restoredCapture]);

  useEffect(() => {
    setTriviaMessage(
      SELF_RECORD_MESSAGES[
        Math.floor(Math.random() * SELF_RECORD_MESSAGES.length)
      ],
    );
  }, []);

  const handleMascotTap = () => {
    const action = getRandomTapAction();
    setMascotAnimation(action);

    let newMessage;
    do {
      newMessage =
        SELF_RECORD_MESSAGES[
          Math.floor(Math.random() * SELF_RECORD_MESSAGES.length)
        ];
    } while (newMessage === triviaMessage && SELF_RECORD_MESSAGES.length > 1);
    setTriviaMessage(newMessage);

    setTimeout(() => setMascotAnimation(""), 1000);
  };

  useEffect(() => {
    if (isMenuOpen) return;

    if (step === "analyze" || step === "ad_wait" || step === "side_wait") {
      hideAdsForCamera();
    } else if (step === "result") {
      hideMrec();
      showBanner();
    } else {
      hideBanner();
      showMrec();
    }
  }, [step, isMenuOpen]);

  const handleStartFront = async () => {
    if (tokens <= 0) {
      setStep("ad_wait");
      return;
    }
    await hideAdsForCamera();

    savePendingCapture({
      captureKind: "posture",
      postureStep: "front",
      startedAt: Date.now(),
      currentView: "POSTURE",
      requestId: Math.random().toString(36).substring(7),
      restoreStatus: "pending",
    });

    try {
      const result = await takePhoto(CameraSource.Camera, "rear");
      clearPendingCapture();
      // すぐに遷移
      setStep("side_wait");
      // 重い画像処理
      const base64 = await processPhotoResultToBase64(result);
      setFrontImage(base64);
      saveTempFrontImage(base64);
    } catch (e: any) {
      console.error("CAPTURE_ERROR_FRONT", e);
      if (e.message === "CANCELLED") {
        // 何もしない
      } else if (e.message?.includes("Permission") || e.message?.includes("denied")) {
        alert("カメラの使用が許可されていないようです。ブラウザの設定でカメラを許可するか、アルバムから写真を選択してください。");
      } else if (!Capacitor.isNativePlatform()) {
        alert("カメラの起動に失敗しました。ブラウザによってはカメラが使えない場合があります。アルバムからの選択をお試しください。");
      } else {
        alert(`エラーが発生しました: ${e.message}`);
      }
      clearPendingCapture();
    }
  };

  const startAnalysis = async (sImg: string | null = null, fImg: string | null = null, skipSetup: boolean = false) => {
    const targetFrontImage = fImg || frontImage;
    if (!targetFrontImage) return;
    
    if (!skipSetup) {
      if (!useToken()) {
        setStep("ad_wait");
        return;
      }
      await hideAdsForCamera();
      setStep("analyze");
    }

    setSideImage(sImg);
    try {
      const result = await analyzePosture(targetFrontImage, sImg);
      setAnalysis(result);
      setStep("result");
    } catch (e: any) {
      console.error("POSTURE_ANALYSIS_ERROR", e);
      alert("解析に失敗しました。");
      setFrontImage(null);
      setSideImage(null);
      setStep("intro");
    } finally {
      clearPendingCapture();
      clearTempFrontImage();
    }
  };

  const handleStartSide = async () => {
    await hideAdsForCamera();

    savePendingCapture({
      captureKind: "posture",
      postureStep: "side",
      startedAt: Date.now(),
      currentView: "POSTURE",
      requestId: Math.random().toString(36).substring(7),
      restoreStatus: "pending",
    });

    try {
      const result = await takePhoto(CameraSource.Camera, "rear");
      clearPendingCapture();
      if (!useToken()) {
        setStep("ad_wait");
        return;
      }
      setStep("analyze");
      
      const base64 = await processPhotoResultToBase64(result);
      startAnalysis(base64, null, true);
    } catch (e: any) {
      console.error("CAPTURE_ERROR_SIDE", e);
      if (e.message === "CANCELLED") {
        // 何もしない
      } else if (e.message?.includes("Permission") || e.message?.includes("denied")) {
        alert("カメラの使用が許可されていないようです。ブラウザの設定でカメラを許可するか、アルバムから写真を選択してください。");
      } else if (!Capacitor.isNativePlatform()) {
        alert("カメラの起動に失敗しました。ブラウザによってはカメラが使えない場合があります。アルバムからの選択をお試しください。");
      } else {
        alert(`エラーが発生しました: ${e.message}`);
      }
      clearPendingCapture();
      clearTempFrontImage();
    }
  };

  const handleRestore = async () => {
    await hideAdsForCamera();
    const success = await restoreTokens();
    if (success) {
      clearPendingCapture();
      clearTempFrontImage();
      setStep("intro");
    }
  };

  const handleSaveAll = async () => {
    if (frontImage && analysis && !isSaving && !hasSaved) {
      setIsSaving(true);
      try {
        const date = getTodayString();
        const fileName = `tabetotto_posture_${date.replace(/-/g, "")}_${Date.now()}.jpg`;

        let gallerySaved = false;
        if (Capacitor.getPlatform() === "android") {
          try {
            const res = await GallerySaver.saveImage({
              base64: frontImage,
              fileName: fileName,
              album: "たべとっと。",
            });
            if (res.saved) gallerySaved = true;
          } catch (e) {
            console.warn("Gallery save failed:", e);
          }
        }

        if (!gallerySaved && Capacitor.isNativePlatform()) {
          try {
            await Filesystem.writeFile({
              path: fileName,
              data: frontImage,
              directory: Directory.Documents,
            });
          } catch (fsError) {
            console.error("Device documents save failed", fsError);
          }
        }

        onSave(frontImage, analysis, date, sideImage, isAnchor);
        setHasSaved(true);
      } catch (e) {
        setIsSaving(false);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-[250px] w-full no-scrollbar overflow-x-hidden relative">
      {/* Background Decor */}
      <div
        className="organic-blob w-80 h-80 top-20 -left-40 animate-float-slow will-change-transform"
        style={{ backgroundColor: THEME.colors.postureSoft }}
      ></div>
      <div
        className="organic-blob w-64 h-64 bottom-60 -right-32 animate-float-slow will-change-transform"
        style={{
          backgroundColor: THEME.colors.readSoft,
          animationDelay: "1s",
        }}
      ></div>

      {/* Background Mascot (Watermark) */}
      <div className="absolute bottom-[-5%] -right-12 w-72 h-72 opacity-[0.08] pointer-events-none z-0 rotate-[-15deg]">
        <img src={OFFICIAL_MASCOT_SRC} alt="" className="w-full h-full object-contain grayscale brightness-150" />
      </div>

      <main className="mt-2 animate-in slide-in-from-bottom duration-300 relative z-10 pb-[250px]">
        {(step === "intro" || step === "analyze") && (
          <div className="px-6 flex flex-col items-center space-y-2">
            {/* アイコン（MealViewと高さを合わせるための余白調整含む） */}
            <div className="flex items-center justify-center relative w-full mb-0">
              <div className="relative w-full flex justify-center">
                <motion.div
                  ref={mascotRef}
                  whileTap={{ scale: 0.95 }}
                  className={`relative z-10 ${mascotAnimation || "animate-float"}`}
                  onClick={step === "intro" ? () => { triggerHaptic(); handleMascotTap(); } : undefined}
                  style={{ width: "180px", height: "180px" }}
                >
                  <img
                    src={OFFICIAL_MASCOT_SRC}
                    className="w-full h-auto object-contain drop-shadow-lg"
                    style={{ padding: "16px" }} // 大幅に余白を確保してクリッピングを防止
                    alt="Mascot"
                  />
                </motion.div>

                {/* 吹き出し */}
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

            {step === "intro" && (
              <>
                <div className="flex flex-col items-center text-center space-y-1">
                  <h2 className="text-xl font-black">正面から撮影 🧍</h2>
                  <p className="text-[10px] font-bold opacity-50">
                    AIが姿勢と体型をチェックします
                  </p>
                  <p className="text-[9px] font-bold text-stone-400 mt-0.5">
                    ※壁を背にして、全身が写るように撮影してください
                  </p>
                </div>

                {/* MealViewと同一構造のボタンレイアウト */}
                <div className="w-full space-y-2 pt-1">
                  <div className="relative group">
                    <Button
                      onClick={handleStartFront}
                      className="w-full min-h-[64px] h-auto py-2 text-lg font-black shadow-xl overflow-hidden relative"
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-black/5 -skew-x-12 translate-x-4 pointer-events-none"></div>
                      <Camera size={22} className="mr-2 relative z-10 shrink-0" />{" "}
                      <span className="relative z-10">正面を撮影する</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative group">
                      {onOpenMoveGuide ? (
                        <Button
                          variant="guide"
                          onClick={onOpenMoveGuide}
                          className="w-full h-full min-h-[56px] py-2"
                        >
                          <Activity size={18} className="mr-1 shrink-0" />
                          <span style={{ lineHeight: 1.2 }} className="text-sm">
                            うごきの
                            <br />
                            目安
                          </span>
                        </Button>
                      ) : (
                        <div className="w-full h-full"></div>
                      )}
                    </div>
                    <div className="relative group">
                      <FileInput
                        label="アルバム"
                        onFileSelect={async (file) => {
                          try {
                            const compressed = await processBlobToBase64(file);
                            setFrontImage(compressed);
                            setStep("side_wait");
                          } catch (e) {
                            alert("画像の読み込みに失敗しました");
                          }
                        }}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === "analyze" && (
              <div className="flex flex-col items-center justify-center space-y-10 py-10 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none">
                  <img src={OFFICIAL_MASCOT_SRC} alt="" className="w-40 h-40 object-contain animate-pulse" />
                </div>
                <Loader2
                  className="animate-spin relative z-10"
                  style={{ color: THEME.colors.posturePrimary }}
                  size={60}
                  strokeWidth={3}
                />
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
                style={{ backgroundColor: THEME.colors.posturePrimary }}
              ></div>
              <button
                onClick={() => {
                  clearPendingCapture();
                  clearTempFrontImage();
                  setStep("intro");
                }}
                className="absolute top-4 right-4 p-2 text-stone-300"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col items-center space-y-6 text-center">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3"
                  style={{ backgroundColor: THEME.colors.postureSoft }}
                >
                  <Gift
                    size={40}
                    className="animate-bounce"
                    style={{ color: THEME.colors.posturePrimary }}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-black">チェック回数がゼロです</h3>
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

        {step === "side_wait" && (
          <div className="px-6 space-y-6 text-center pt-10 pb-20">
            <div className="space-y-2">
              <h3 className="text-2xl font-black">次は側面（真横）から 🧍</h3>
              <p className="text-xs font-bold opacity-50">
                横向きの姿勢もチェックしましょう
              </p>
            </div>

            <div className="w-full space-y-4 pt-2">
              {/* カメラ撮影 */}
              <div className="relative group">
                <Button
                  onClick={handleStartSide}
                  className="w-full min-h-[80px] h-auto py-2 text-xl font-black shadow-xl overflow-hidden relative"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-black/5 -skew-x-12 translate-x-4 pointer-events-none"></div>
                  <Camera size={26} className="mr-3 relative z-10 shrink-0" />{" "}
                  <span className="relative z-10">側面を撮影する</span>
                </Button>
              </div>

              {/* アルバム選択 */}
              <div className="relative group">
                <FileInput
                  label="アルバムから選ぶ"
                  onFileSelect={async (file) => {
                    try {
                      const compressed = await processBlobToBase64(file);
                      startAnalysis(compressed);
                    } catch (e) {
                      alert("画像の読み込みに失敗しました");
                    }
                  }}
                  className="w-full"
                />
              </div>
            </div>

            {/* 区切り線とスキップボタン */}
            <div className="relative py-4">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-stone-300 border-dashed"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#fdfbf7] px-2 text-[10px] font-bold text-stone-400">
                  または
                </span>
              </div>
            </div>

            <Button
              onClick={() => startAnalysis(null)}
              variant="outline"
              className="w-full min-h-[64px] h-auto py-2 font-black text-stone-500 border-2 border-stone-300 bg-white"
            >
              スキップして解析へ進む
            </Button>
          </div>
        )}



        {step === "result" && analysis && frontImage && (
          <div className="animate-in zoom-in-95 pb-40">
            <div className="px-6 space-y-6">
              <PostureResultCarousel
                frontPhoto={frontImage}
                sidePhoto={sideImage}
                analysis={analysis}
              />

              <Card
                className="!p-6 bg-white border-2 border-dashed"
                style={{ borderColor: THEME.colors.border }}
              >
                <p
                  className="font-black text-xs mb-2 flex items-center"
                  style={{ color: THEME.colors.posturePrimary }}
                >
                  <span className="mr-1">✨</span> 解析結果
                </p>
                <p className="text-xs font-bold leading-relaxed break-words whitespace-normal">
                  {analysis.point}
                </p>
              </Card>

              {hasSaved && onCompare && (
                <div className="flex flex-col items-end animate-in fade-in slide-in-from-bottom-2">
                  <div className="mb-2 text-[10px] font-bold animate-pulse" style={{ color: THEME.colors.posturePrimary }}>
                    前回と比べて、どう感じますか？
                  </div>
                  <Button
                    onClick={onCompare}
                    variant="outline"
                    className="min-h-[48px] h-auto py-2 text-xs px-6 bg-white shadow-sm"
                    style={{ borderColor: THEME.colors.posturePrimary, color: THEME.colors.posturePrimary }}
                  >
                    <ArrowLeftRight size={16} className="mr-2 shrink-0" />{" "}
                    前回と見比べる
                  </Button>
                </div>
              )}

              <div className="space-y-4 pt-4">
                {!hasSaved && (
                  <motion.label 
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 cursor-pointer active:bg-stone-100 transition-colors"
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isAnchor ? "text-white" : "bg-white border-stone-300"}`}
                      style={isAnchor ? { backgroundColor: THEME.colors.posturePrimary, borderColor: THEME.colors.posturePrimary } : {}}
                    >
                      {isAnchor && <Check size={14} strokeWidth={3} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-stone-700">
                        比較用として残す
                      </p>
                      <p className="text-[9px] font-bold text-stone-400 mt-0.5">
                        基準写真は1件まで保存されます
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isAnchor}
                      onChange={(e) => { triggerHaptic(); setIsAnchor(e.target.checked); }}
                    />
                  </motion.label>
                )}
                <button
                  onClick={() => { triggerHaptic(ImpactStyle.Medium); handleSaveAll(); }}
                  disabled={isSaving || hasSaved}
                  className={`btn-3d w-full min-h-[96px] h-auto py-2 text-2xl font-black rounded-[32px] transition-all flex items-center justify-center text-white`}
                  style={
                    hasSaved
                      ? { backgroundColor: THEME.colors.success }
                      : { backgroundColor: THEME.colors.posturePrimary }
                  }
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin mr-2 shrink-0" />
                  ) : hasSaved ? (
                    <Check className="mr-2 shrink-0" />
                  ) : null}
                  {isSaving
                    ? "保存中..."
                    : hasSaved
                      ? "記録しました。✨"
                      : "アプリにきろくする ✨"}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      triggerHaptic();
                      addToCalendar("posture", getTodayString(), analysis);
                    }}
                    className="btn-3d flex flex-col items-center py-5 border-2 rounded-[28px] bg-white shadow-sm transition-all"
                    style={{ borderColor: THEME.colors.border }}
                  >
                    <CalendarPlus
                      size={22}
                      style={{ color: THEME.colors.readPrimary }}
                    />
                    <span className="text-[10px] font-black mt-1">
                      カレンダー
                    </span>
                  </button>
                  <button
                    onClick={() => { triggerHaptic(); alert("Posture photos are private."); }}
                    className="btn-3d flex flex-col items-center py-5 border-2 rounded-[28px] bg-white shadow-sm opacity-30"
                    style={{ borderColor: THEME.colors.border }}
                  >
                    <Share2 size={22} />
                    <span className="text-[10px] font-black mt-1">
                      共有不可
                    </span>
                  </button>
                </div>

                {hasSaved && (
                  <Button
                    variant="cancel"
                    onClick={onClose}
                    className="btn-3d w-full min-h-[72px] h-auto py-2 text-xl font-black rounded-[28px] shadow-xl transition-all flex items-center justify-center border-2"
                  >
                    とじる
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PostureView;
