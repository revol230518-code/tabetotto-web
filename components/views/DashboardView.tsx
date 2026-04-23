import { PenTool, Utensils, Calendar } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";
import { UserProfile, DailyRecord, AppView } from "../../types";
import { calculateBMI, calculateCalorieTarget } from "../../utils";
import { THEME } from "../../theme";
import { getOnboardingFlags, setOnboardingFlags } from "../../services/onboardingService";
import { Button } from "../UIComponents";
import {
  determineMascotState,
  getRandomTapMessage,
} from "../../services/mascotState";
import { OFFICIAL_MASCOT_SRC } from "../../constants/mascot";
import { motion } from "motion/react";
import { triggerHaptic, ImpactStyle } from "../../services/haptics";

import { generateWeeklyReport } from "../../services/weeklyReport";

interface DashboardProps {
  user: UserProfile;
  todayRecord: DailyRecord;
  records: Record<string, DailyRecord>;
  setView: (v: AppView) => void;
  onWeightUpdate: (w: number) => void;
  openKeypad: (
    initialValue: string,
    unit: string,
    onConfirm: (val: string) => void,
  ) => void;
}

// 吹き出し用Portalコンポーネント
const MascotBubble: React.FC<{
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}> = ({ anchorRef, children }) => {
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(
    null,
  );

  const updatePosition = React.useCallback(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      // 修正: キャラが小さくなったため、位置を微調整
      setCoords({
        top: rect.top + window.scrollY - 38,
        left: rect.left + 42,
      });
    }
  }, [anchorRef]);

  React.useEffect(() => {
    // 初回位置合わせ
    updatePosition();

    // イベントリスナー
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);

    // 画像読み込み等でレイアウトが変わる可能性があるので、少し遅延しても実行
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
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute z-[110] w-max max-w-[160px] pointer-events-none"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
    >
      {children}
    </motion.div>,
    document.body,
  );
};

const DashboardView: React.FC<DashboardProps> = ({
  user,
  todayRecord,
  records,
  setView,
  onWeightUpdate,
  openKeypad,
}) => {
  const bmi = calculateBMI(user.height, todayRecord.weight || 0);

  const [showHomeGuide, setShowHomeGuide] = React.useState(false);

  React.useEffect(() => {
    const flags = getOnboardingFlags();
    if (flags.hasCompletedInitialSetup && !flags.hasSeenHomeGuide) {
      setShowHomeGuide(true);
    }
  }, []);

  // タップ時の一時メッセージ
  const [tapMessage, setTapMessage] = React.useState<string | null>(null);

  // マスコットの表示位置を参照するためのRef
  const mascotRef = React.useRef<HTMLDivElement>(null);

  // Calculate Calories
  const totalCalories = React.useMemo(() => {
    return todayRecord.mealAnalyses.reduce(
      (acc, meal) => acc + (meal.numericCalories ?? 0),
      0,
    );
  }, [todayRecord]);

  const targetRange = React.useMemo(() => calculateCalorieTarget(user), [user]);

  const weeklyReport = React.useMemo(() => {
    const sortedRecords = Object.values(records).sort((a, b) => a.date.localeCompare(b.date));
    return generateWeeklyReport(sortedRecords);
  }, [records]);

  // マスコットの状態判定 (タップメッセージがあればそちらを優先表示)
  const { condition: mascotCondition } = React.useMemo(() => {
    return determineMascotState(todayRecord, records, user);
  }, [todayRecord, records, user]);

  const shortAdvice = React.useMemo(() => {
    if (mascotCondition === "fat") return "ちょっと多めかもですね💦";
    if (mascotCondition === "tired") return "少しお疲れ気味ですか？🍵";
    if (mascotCondition === "hungry") return "しっかり食べてエネルギー補給！🍙";
    if (totalCalories > 0) return "いい流れです🌸";
    return "今日もゆるくいきましょう✨";
  }, [mascotCondition, totalCalories]);

  const displayMessage = tapMessage || shortAdvice;

  // アニメーションクラスの決定
  const animationClass = React.useMemo(() => {
    if (mascotCondition === "fat") return "animate-slight-wobble";
    if (mascotCondition === "tired") return "animate-subtle-bounce";
    if (mascotCondition === "hungry") return "animate-tiny-scale";
    return "animate-float";
  }, [mascotCondition]);

  const displayImage = OFFICIAL_MASCOT_SRC;

  const handleMascotClick = (e: React.MouseEvent) => {
    // 親要素への伝播を防ぐ（必要に応じて）
    e.stopPropagation();
    triggerHaptic(ImpactStyle.Medium);

    const newMsg = getRandomTapMessage();
    setTapMessage(newMsg);

    // 3秒後に元のメッセージに戻す
    setTimeout(() => {
      setTapMessage(null);
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen pb-32 w-full no-scrollbar relative overflow-x-hidden">
      {/* Background Decor */}
      <div
        className="organic-blob w-80 h-80 -top-40 -right-40"
        style={{ backgroundColor: THEME.colors.mealSoft }}
      ></div>
      <div
        className="organic-blob w-64 h-64 top-1/2 -left-32"
        style={{ backgroundColor: THEME.colors.postureSoft }}
      ></div>

      {/* Background Mascot (Watermark) */}
      <div className="absolute bottom-[-5%] -right-12 w-72 h-72 opacity-[0.08] pointer-events-none z-0 rotate-[-15deg]">
        <img src={OFFICIAL_MASCOT_SRC} alt="" className="w-full h-full object-contain grayscale brightness-150" />
      </div>

      <main 
        className="space-y-6 no-scrollbar relative z-10 animate-in slide-in-from-bottom duration-300 w-full max-w-[376px] mx-auto"
        style={{ marginTop: '15px' }}
      >
        <section 
          className="px-6 flex items-start justify-between gap-2"
          style={{ marginTop: '10px' }}
        >
          <div className="flex items-center gap-3 w-full">
            <div
              className="relative shrink-0"
              ref={mascotRef}
              onClick={handleMascotClick}
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                className={`flex items-center justify-center cursor-pointer transition-transform ${animationClass}`}
                style={{ 
                  width: "clamp(90px, 20vw, 120px)", 
                  height: "auto",
                  fontSize: '11px',
                  lineHeight: '22px',
                  marginTop: '-2px',
                  marginLeft: '-3px',
                  marginRight: '-5px',
                  marginBottom: '13px',
                }}
              >
                <img
                  src={displayImage}
                  className="object-contain drop-shadow-md"
                  alt="Mascot"
                  style={{
                    width: '95px',
                    height: '91.5078px',
                    marginLeft: '-18px',
                    marginTop: '0px',
                    paddingTop: '0px',
                    paddingLeft: '0px',
                    marginRight: '8px',
                    marginBottom: '2px',
                    fontSize: '10px',
                    lineHeight: '10px',
                  }}
                />
              </motion.div>

              {/* 吹き出し表示 (Portal経由でBody直下にレンダリングし、ヘッダーより手前に表示) */}
              {displayMessage && (
                <MascotBubble anchorRef={mascotRef}>
                  <div
                    className={`bg-white px-3 py-2 rounded-2xl rounded-bl-none shadow-lg border-2 border-stone-100 text-xs font-black text-stone-600 relative max-w-[140px] leading-snug ${animationClass}`}
                  >
                    {displayMessage}
                    <div className="absolute -bottom-2 left-0 w-3 h-3 bg-white border-b-2 border-l-2 border-stone-100 transform -rotate-12 skew-x-12"></div>
                  </div>
                </MascotBubble>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <h2
                className="text-lg font-black tracking-tighter whitespace-nowrap"
                style={{ 
                  color: THEME.colors.textPrimary,
                  paddingTop: '0px',
                  marginLeft: '-9px',
                  marginTop: '-2px',
                  paddingLeft: '0px',
                  marginRight: '-16px',
                  marginBottom: '4px',
                }}
              >
                {user.nickname || "ゲスト"}さん
              </h2>
              <div
                className="flex items-center justify-center px-3 py-0.5 rounded-full border-2 bg-white/50 shadow-sm text-[10px] font-black tracking-wider opacity-60"
                style={{ 
                  borderColor: THEME.colors.border, 
                  color: THEME.colors.textPrimary,
                  marginLeft: '-12px',
                }}
              >
                {new Date().toLocaleDateString("ja-JP", {
                  month: "2-digit",
                  day: "2-digit",
                  weekday: "short",
                })}
              </div>
            </div>
          </div>

          {/* Top Right Card: Remaining Weight & BMI */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="bg-white px-4 py-3 border-2 shadow-xl flex flex-col items-end justify-center shrink-0 relative overflow-hidden animate-float-slow gap-1"
            style={{
              borderRadius: '25px',
              borderColor: THEME.colors.border,
              animationDelay: "1s",
              minWidth: "100px",
              marginRight: '3px',
              marginBottom: '6px',
              marginLeft: '-15px',
              marginTop: '-4px',
              height: '77px',
            }}
          >
            <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-full"></div>

            <div className="flex items-baseline gap-1">
              <span className="text-[9px] font-black opacity-50">あと</span>
              <span
                className="text-2xl font-black leading-none"
                style={{ color: THEME.colors.posturePrimary }}
              >
                {todayRecord.weight && user.targetWeight
                  ? (todayRecord.weight - user.targetWeight).toFixed(1)
                  : "--"}
              </span>
              <span className="text-[10px] font-bold opacity-60">kg</span>
            </div>

            <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md">
              <span className="text-[8px] font-black opacity-50">BMI</span>
              <span
                className={`text-xs font-black ${bmi > 0 && bmi < 18.5 ? "text-red-500" : "text-stone-600"}`}
              >
                {bmi > 0 ? bmi : "--.-"}
              </span>
            </div>
          </motion.div>
        </section>

        <div className="px-6 grid grid-cols-2 gap-3">
          {/* Weight Card */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerHaptic(ImpactStyle.Light);
              openKeypad(
                todayRecord.weight ? todayRecord.weight.toString() : "",
                "kg",
                (val) => onWeightUpdate(parseFloat(val)),
              );
            }}
            className="bg-white p-4 border shadow-xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden"
            style={{
              borderRadius: '20px',
              borderColor: THEME.colors.border,
              paddingTop: '12px',
              marginTop: '-5px',
            }}
          >
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: THEME.colors.posturePrimary }}
            ></div>
            <span
              className="text-[10px] font-black px-3 py-1 rounded-full mb-3 transform -rotate-1 bg-stone-50 text-center break-words"
              style={{ color: THEME.colors.textLight }}
            >
              今日の体重
            </span>
            <div className="flex items-baseline mb-3">
              <span
                className="text-3xl sm:text-4xl font-black"
                style={{ 
                  color: THEME.colors.textPrimary,
                  fontSize: '25px',
                  lineHeight: '33px',
                }}
              >
                {todayRecord.weight ? todayRecord.weight.toFixed(1) : "--.-"}
              </span>
              <span className="text-xs font-bold ml-1 text-stone-400">kg</span>
            </div>
            <div
              className="px-4 rounded-full border-2 text-[11px] font-black flex items-center justify-center shadow-sm text-center break-words"
              style={{
                color: THEME.colors.posturePrimary,
                borderColor: THEME.colors.postureSoft,
                backgroundColor: THEME.colors.postureSoft,
                marginTop: '2px',
                marginBottom: '-1px',
                marginLeft: '0px',
                marginRight: '0px',
                paddingTop: '4px',
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingBottom: '5px',
              }}
            >
              <PenTool size={14} className="mr-1 shrink-0" /> 記録する
            </div>
          </motion.div>

          {/* Calorie Card (Replaces BMI Card) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="bg-white p-4 border shadow-xl flex flex-col items-center justify-center relative overflow-hidden cursor-pointer transition-all"
            onClick={() => {
              triggerHaptic(ImpactStyle.Light);
              setView(AppView.MEAL);
            }}
            style={{
              borderRadius: '20px',
              borderColor: THEME.colors.border,
              marginRight: '0px',
              marginLeft: '0px',
              marginTop: '-5px',
            }}
          >
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: THEME.colors.mealPrimary }}
            ></div>
            <span
              className="text-[10px] font-black px-3 rounded-full bg-stone-50 text-center break-words"
              style={{ 
                color: THEME.colors.mealPrimary,
                paddingTop: '4px',
                marginLeft: '0px',
                marginTop: '-10px',
                marginRight: '0px',
                marginBottom: '-4px',
                paddingLeft: '12px',
              }}
            >
              今日のエネルギー
            </span>

            <div 
              className="flex items-baseline mb-2"
              style={{
                marginLeft: '0px',
                paddingTop: '0px',
                marginTop: '23px',
                marginBottom: '2px',
              }}
            >
              <span
                className="text-2xl sm:text-3xl font-black"
                style={{ color: THEME.colors.mealPrimary }}
              >
                {totalCalories}
              </span>
              <span className="text-xs font-bold ml-1 text-stone-400">
                kcal
              </span>
            </div>

            {targetRange ? (
              <div className="text-center w-full">
                <div 
                  className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-1 relative"
                  style={{
                    marginLeft: '-3px',
                    marginRight: '-20px',
                    marginBottom: '3px',
                    marginTop: '11px',
                  }}
                >
                  <div
                    className="absolute h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, (totalCalories / targetRange.max) * 100)}%`,
                      backgroundColor:
                        mascotCondition === "fat"
                          ? THEME.colors.danger
                          : THEME.colors.mealPrimary,
                    }}
                  />
                </div>
                <span className="text-[9px] font-bold text-stone-400 block text-center break-words">
                  目安: {targetRange.min}~{targetRange.max}
                </span>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic(ImpactStyle.Light);
                  setView(AppView.SETTINGS);
                }}
                className="text-[9px] font-bold text-stone-400 border border-stone-200 px-2 rounded-lg bg-stone-50 active:bg-stone-100 hover:bg-stone-100 transition-colors text-center break-words"
                style={{
                  paddingTop: '4px',
                  marginLeft: '0px',
                  marginRight: '0px',
                  marginTop: '18px',
                }}
              >
                設定で目安を表示
              </button>
            )}

            {mascotCondition === "normal" && totalCalories > 0 && (
              <div className="absolute top-2 right-2 text-lg animate-pulse-soft">
                🌸
              </div>
            )}
            {mascotCondition === "fat" && (
              <div className="absolute top-2 right-2 text-lg animate-bounce">
                ⚠️
              </div>
            )}
          </motion.div>
        </div>

        <div 
          className="flex flex-col px-6 pb-8 gap-3"
          style={{ 
            height: 'auto',
            marginLeft: '0px',
            marginTop: '27px',
          }}
        >
          {/* ごはんきろく（主役） */}
          <button
            onClick={() => {
              triggerHaptic(ImpactStyle.Medium);
              setView(AppView.MEAL);
            }}
            className="btn-3d mx-auto font-black flex items-center justify-center gap-2 text-white w-full max-w-[328px]"
            style={{ 
              backgroundColor: THEME.colors.mealPrimary,
              height: 'auto',
              minHeight: '72px',
              paddingLeft: '16px',
              paddingBottom: '15px',
              paddingRight: '16px',
              paddingTop: '16px',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: '4px',
              marginBottom: '0px',
              borderRadius: '15px',
            }}
          >
            <span className="text-center break-words" style={{ fontSize: '18px', lineHeight: '21px' }}>ごはんをきろく</span> <Utensils size={24} className="animate-sway shrink-0" style={{ fontSize: '18px', lineHeight: '25px' }} />
          </button>

          {/* 下部2ボタン（横並び） */}
          <div className="grid grid-cols-2 gap-3">
            {/* 活動量シミュレーター（補助） */}
            <button
              onClick={() => {
                triggerHaptic(ImpactStyle.Light);
                setView(AppView.MOVE_GUIDE);
              }}
              className="btn-3d flex items-center justify-center w-full"
              style={{ 
                backgroundColor: THEME.colors.readPrimary, 
                height: 'auto',
                minHeight: '59px',
                borderRadius: '15px',
                marginLeft: '0px',
                marginTop: '11px',
              }}
            >
              <span className="text-sm font-bold text-center break-words text-white py-2">運動量を見る</span>
            </button>

            {/* 姿勢チェック（分析） */}
            <button
              onClick={() => {
                triggerHaptic(ImpactStyle.Light);
                setView(AppView.POSTURE);
              }}
              className="btn-3d flex items-center justify-center w-full text-white"
              style={{ 
                backgroundColor: THEME.colors.posturePrimary, 
                height: 'auto',
                minHeight: '59px',
                borderRadius: '14px',
                borderWidth: '0px',
                marginTop: '11px',
              }}
            >
              <span className="text-sm font-bold text-center break-words py-2">姿勢を見る</span>
            </button>
          </div>

          {/* 今週のレポート要約カード */}
          <motion.div
            whileTap={{ scale: 0.99 }}
            className="p-5 border-2 shadow-sm flex flex-col relative overflow-hidden mt-2"
            style={{
              borderRadius: '24px',
              borderColor: THEME.colors.readBorder,
              backgroundColor: THEME.colors.cardBg,
            }}
          >
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: THEME.colors.readPrimary }}
            ></div>
            
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-[10px] font-black px-3 py-1 rounded-full text-center break-words"
                style={{ 
                  color: THEME.colors.readPrimary,
                  backgroundColor: THEME.colors.readSoft,
                }}
              >
                今週のレポート
              </span>
              <div className="flex items-center gap-1 opacity-60">
                <Calendar size={12} className="text-stone-400" />
                <span className="text-[10px] font-black text-stone-400">直近7日間</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <h3 className="text-sm font-black leading-tight" style={{ color: THEME.colors.textPrimary }}>
                {weeklyReport.weeklyHeadline}
              </h3>
              
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="bg-white/50 p-2 rounded-xl border border-stone-100">
                  <p className="text-[9px] font-black text-stone-400 mb-0.5">記録日数</p>
                  <p className="text-sm font-black" style={{ color: THEME.colors.textPrimary }}>
                    {weeklyReport.recordDays} <span className="text-[10px]">日</span>
                  </p>
                </div>
                <div className="bg-white/50 p-2 rounded-xl border border-stone-100">
                  <p className="text-[9px] font-black text-stone-400 mb-0.5">体重変化</p>
                  <p className="text-sm font-black" style={{ color: THEME.colors.posturePrimary }}>
                    {weeklyReport.weightDelta !== null ? `${weeklyReport.weightDelta > 0 ? '+' : ''}${weeklyReport.weightDelta}kg` : '--'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-1 bg-white/40 p-2 rounded-xl">
                <img src={OFFICIAL_MASCOT_SRC} alt="" className="w-6 h-6 object-contain shrink-0 opacity-80" />
                <p className="text-[11px] font-bold leading-relaxed" style={{ color: THEME.colors.textMuted }}>
                  {weeklyReport.weeklyComment.length > 45 ? weeklyReport.weeklyComment.slice(0, 45) + '...' : weeklyReport.weeklyComment}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic(ImpactStyle.Light);
                setView(AppView.HISTORY);
              }}
              className="btn-3d w-full flex items-center justify-center rounded-xl"
              style={{
                minHeight: '52px',
                height: 'auto',
                padding: '12px 16px',
                backgroundColor: THEME.colors.readSoft,
                color: THEME.colors.readPrimary,
                border: `2px solid ${THEME.colors.readBorder}`,
              }}
            >
              <span className="text-sm font-bold whitespace-normal break-words text-center">
                レポートを詳しくみる
              </span>
            </button>
          </motion.div>
        </div>
      </main>
      {showHomeGuide && (
         <div className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-6" onClick={() => {
             setShowHomeGuide(false);
             setOnboardingFlags({ hasSeenHomeGuide: true });
         }}>
             <div className="bg-white p-6 rounded-3xl shadow-2xl animate-in fade-in zoom-in border-4 border-stone-200 w-full max-w-sm">
                 <h3 className="font-black text-lg mb-2 text-stone-700">たべとっと。へようこそ！</h3>
                 <p className="text-sm text-stone-600 mb-4">ここに体重やBMIが表示されます。<br/>ここからごはん記録ができます。</p>
                 <Button onClick={(e) => {
                     e.stopPropagation();
                     setShowHomeGuide(false);
                     setOnboardingFlags({ hasSeenHomeGuide: true });
                 }} className="w-full">記録してみる</Button>
             </div>
         </div>
      )}
    </div>
  );
};

export default DashboardView;
