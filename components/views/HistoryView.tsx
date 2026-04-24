import React from "react";
import {
  Utensils,
  Calendar,
  Camera,
  ChevronRight,
  History as HistoryIcon,
  ArrowDown,
  Calculator,
  Flag,
  AlertTriangle,
  Stethoscope,
  Dumbbell,
  AlertCircle,
  CheckCircle2,
  Leaf,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Tooltip,
  Area,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { DailyRecord, MealAnalysis, UserProfile } from "../../types";
import { THEME } from "../../theme";
import { Button } from "../UIComponents";
import { OFFICIAL_MASCOT_SRC } from "../../constants/mascot";
import {
  calculateCalorieTarget,
  calculateBMI,
  toLocalDateString,
} from "../../utils";
import { showMrec, showBanner } from "../../services/admobService";
import { generateWeeklyReport } from "../../services/weeklyReport";
import { Capacitor } from "@capacitor/core";

import { motion } from 'motion/react';
import { triggerHaptic } from '../../services/haptics';

interface HistoryViewProps {
  records: DailyRecord[];
  user: UserProfile;
  onMealClick: (
    meal: MealAnalysis,
    photo: string,
    date: string,
    index: number,
  ) => void;
  onPostureClick: (record: DailyRecord) => void;
  isMenuOpen: boolean; // 広告制御のため追加
}

// Memoized Record Item for performance
const RecordItem = React.memo(({ record, onPostureClick, onMealClick }: { 
  record: DailyRecord, 
  onPostureClick: (r: DailyRecord) => void, 
  onMealClick: (m: MealAnalysis, p: string, d: string, i: number) => void 
}) => {
  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      className="bg-white border-2 border-b-4 p-5 shadow-sm organic-card rounded-[32px]"
      style={{ borderColor: THEME.colors.border }}
    >
      <div
        className="flex items-center justify-between mb-4 border-b border-dashed pb-3"
        style={{ borderColor: THEME.colors.border }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-stone-400" />
          <span
            className="text-xs font-black"
            style={{ color: THEME.colors.textPrimary }}
          >
            {record.date}
          </span>
        </div>
        {record.weight && (
          <div
            className="flex items-baseline gap-1 bg-stone-50 px-3 py-1 rounded-full border shadow-inner"
            style={{ borderColor: THEME.colors.border }}
          >
            <span
              className="text-sm font-black"
              style={{ color: THEME.colors.posturePrimary }}
            >
              {record.weight}
            </span>
            <span className="text-[8px] font-bold text-stone-400">
              kg
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {record.postureAnalysis && (
          <button
            onClick={() => { triggerHaptic(); onPostureClick(record); }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100 group active:bg-stone-100 active:scale-[0.98] transition-[transform,background-color]"
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl shadow-sm"
                style={{
                  backgroundColor: THEME.colors.postureSoft,
                }}
              >
                <Camera
                  size={16}
                  style={{ color: THEME.colors.posturePrimary }}
                />
              </div>
              <div className="text-left">
                <p
                  className="text-[11px] font-black flex items-center gap-2"
                  style={{ color: THEME.colors.textPrimary }}
                >
                  姿勢チェック
                  {record.isPostureComparisonAnchor && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: THEME.colors.posturePrimary }}>
                      基準
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-md text-white"
                    style={{
                      backgroundColor:
                        record.postureAnalysis.level === "OK"
                          ? THEME.colors.success
                          : THEME.colors.posturePrimary,
                    }}
                  >
                    {record.postureAnalysis.level}
                  </span>
                  <p className="text-[9px] font-bold text-stone-400 truncate max-w-[150px]">
                    {record.postureAnalysis.point}
                  </p>
                </div>
              </div>
            </div>
            <ChevronRight
              size={16}
              className="text-stone-300 group-active:translate-x-1 transition-transform"
            />
          </button>
        )}

        {record.mealAnalyses.length > 0 && (
          <div className="space-y-2">
            {record.mealAnalyses.map((meal, idx) => (
              <button
                key={`${record.id}-meal-${idx}`}
                onClick={() => {
                  triggerHaptic();
                  onMealClick(
                    meal,
                    record.mealPhotoUrls[idx],
                    record.date,
                    idx,
                  );
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100 group active:bg-stone-100 active:scale-[0.98] transition-[transform,background-color]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: THEME.colors.mealSoft,
                    }}
                  >
                    <Utensils
                      size={16}
                      style={{ color: THEME.colors.mealPrimary }}
                    />
                  </div>
                  <div className="text-left">
                    <p
                      className="text-[11px] font-black"
                      style={{ color: THEME.colors.textPrimary }}
                    >
                      {meal.menuName}
                    </p>
                    <p className="text-[9px] font-bold text-stone-400">
                      {meal.category === 'food' || (meal.isFood !== false && meal.category !== 'non_food' && meal.category !== 'blocked') 
                        ? (meal.numericCalories !== undefined ? `${meal.numericCalories} kcal` : '—') 
                        : '——'}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-stone-300 group-active:translate-x-1 transition-transform"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});

const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  user,
  onMealClick,
  onPostureClick,
  isMenuOpen,
}) => {
  const [range, setRange] = React.useState<"7d" | "1m" | "3m" | "all">("1m");
  const [page, setPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;
  const MAX_RECORDS = 300;

  const weeklyReport = React.useMemo(() => {
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    return generateWeeklyReport(sorted);
  }, [records]);

  // バナー⇄MREC切替ロジック (方式B)
  const bottomSentinelRef = React.useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(false);
  const [isAtBottomStable, setIsAtBottomStable] = React.useState(false);
  const stableTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // IntersectionObserverで最下部検知
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtBottom(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    if (bottomSentinelRef.current) {
      observer.observe(bottomSentinelRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // 到達後の安定化タイマー (300-500ms滞在で切替)
  React.useEffect(() => {
    if (isAtBottom) {
      stableTimerRef.current = setTimeout(() => {
        setIsAtBottomStable(true);
      }, 500);
    } else {
      if (stableTimerRef.current) clearTimeout(stableTimerRef.current);
      setIsAtBottomStable(false);
    }
    return () => {
      if (stableTimerRef.current) clearTimeout(stableTimerRef.current);
    };
  }, [isAtBottom]);

  // 広告切替実行 (メニューが開いているときは何もしない=App側で消す)
  React.useEffect(() => {
    if (isMenuOpen) {
      // メニュー展開中はApp.tsxが全消去するので、ここでは何もしない
      // (または明示的にタイマーリセットなどしても良いが、useEffectの依存関係により再評価される)
      return;
    }

    if (isAtBottomStable) {
      // 最下部で安定 -> Banner消してMREC表示
      showMrec();
    } else {
      // それ以外 -> MREC消してBanner表示
      // ※showBannerは内部でhideMrecを呼ぶが、明示的に呼ぶほうが安全
      showBanner();
    }

    // アンマウント時はBannerに戻す(App.tsxにお任せでも良いが安全策)
    return () => {
      // コンポーネントが消えるとき = 別タブへ移動など
      // cleanupでは何もしない（次の画面のuseEffectに任せる）
    };
  }, [isAtBottomStable, isMenuOpen]);

  const { targetRange, targetDateStr, dietSimulation } = React.useMemo(() => {
    const tRange = calculateCalorieTarget(user);
    const tDate = user.dietMode?.targetDate
      ? user.dietMode.targetDate.slice(5).replace("-", "/")
      : undefined;

    // ダイエットシミュレーション (減量モードのみ)
    let sim = null;
    if (
      user.dietMode?.enabled &&
      user.dietMode.goal === "loss" &&
      user.targetWeight &&
      user.dietMode.targetDate
    ) {
      // 最新の体重を取得
      const sorted = [...records].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      const latestWeight = sorted.find((r) => r.weight)?.weight || 0;

      if (latestWeight > 0) {
        const weightDiff = latestWeight - user.targetWeight;
        // 1kg = 7400kcal換算
        const totalKcalToBurn = Math.max(0, weightDiff * 7400);

        const today = new Date();
        const target = new Date(user.dietMode.targetDate);
        const daysLeft = Math.ceil(
          (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        // 目標BMI計算
        const targetBMI = calculateBMI(user.height, user.targetWeight);

        if (daysLeft > 0 && totalKcalToBurn > 0) {
          const dailyBurn = Math.round(totalKcalToBurn / daysLeft);
          sim = {
            latestWeight,
            weightDiff,
            daysLeft,
            dailyBurn,
            targetBMI,
            isImpossible: dailyBurn > 1000, // 1000kcal以上は無謀
            isHard: dailyBurn > 500, // 500kcal以上はきつい
            isLowBMI: targetBMI < 18.5, // 低体重目標
          };
        }
      }
    }

    return {
      targetRange: tRange,
      targetDateStr: tDate,
      dietSimulation: sim,
    };
  }, [user, records]);

  const sortedRecords = React.useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, MAX_RECORDS);
  }, [records]);

  const pagedRecords = React.useMemo(() => {
    return sortedRecords.slice(0, page * ITEMS_PER_PAGE);
  }, [sortedRecords, page]);

  const chartData = React.useMemo(() => {
    const sorted = [...records].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    if (sorted.length === 0) return [];
    const now = new Date();
    let cutoff = new Date(now);
    if (range === "7d") cutoff.setDate(now.getDate() - 7);
    else if (range === "1m") cutoff.setMonth(now.getMonth() - 1);
    else if (range === "3m") cutoff.setMonth(now.getMonth() - 3);
    else cutoff = new Date(1970, 0, 1);

    // UTCではなくJST(ローカル時間)基準で比較
    const cutoffStr = toLocalDateString(cutoff);
    const filtered = sorted.filter((r) => r.date >= cutoffStr);

    const getCals = (r: DailyRecord) =>
      r.mealAnalyses
        ? r.mealAnalyses.reduce((acc, m) => acc + (m.numericCalories ?? 0), 0)
        : 0;
    return filtered.map((r) => ({
      date: r.date.slice(5).replace("-", "/"), // MM/DD
      fullDate: r.date,
      weight: r.weight,
      calories: getCals(r) > 0 ? getCals(r) : undefined,
    }));
  }, [records, range]);

  // 体重グラフのドメインと3色ゾーンの計算
  const weightDomain = React.useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const weights = chartData
      .map((d) => d.weight)
      .filter((w) => w !== null && w !== undefined && typeof w === "number" && !isNaN(w)) as number[];
    
    let min = weights.length > 0 ? Math.min(...weights) : 50;
    let max = weights.length > 0 ? Math.max(...weights) : 60;
    
    if (user.targetWeight && typeof user.targetWeight === "number" && !isNaN(user.targetWeight)) {
      min = Math.min(min, user.targetWeight);
      max = Math.max(max, user.targetWeight);
    }
    
    // 上下に少しバッファを持たせる
    return [Math.floor(min - 2), Math.ceil(max + 2)];
  }, [chartData, user.targetWeight]);

  return (
    <div className="flex flex-col min-h-screen pb-72 w-full no-scrollbar overflow-x-hidden relative">
      {/* Background Mascot (Watermark) */}
      <div className="absolute bottom-[-5%] -right-12 w-72 h-72 opacity-[0.08] pointer-events-none z-0 rotate-[-15deg]">
        <img src={OFFICIAL_MASCOT_SRC} alt="" className="w-full h-full object-contain grayscale brightness-150" />
      </div>

      {/* Background Decor */}
      <div
        className="organic-blob w-80 h-80 top-20 -left-40 animate-float-slow will-change-transform"
        style={{ backgroundColor: THEME.colors.readSoft }}
      ></div>
      <div
        className="organic-blob w-64 h-64 bottom-60 -right-32 animate-float-slow will-change-transform"
        style={{
          backgroundColor: THEME.colors.readSoft,
          animationDelay: "1s",
        }}
      ></div>

      <main className="space-y-4 mt-4 animate-in slide-in-from-bottom duration-300 relative z-10">
        <div
          className="mx-6 py-10 px-6 border-2 border-b-4 shadow-md overflow-hidden bg-white organic-card rounded-[32px]"
          style={{ borderColor: THEME.colors.border }}
        >
          <div className="flex justify-center mb-8">
            <div
              className="bg-stone-50 border-2 px-6 py-1.5 rounded-full transform rotate-1 shadow-sm"
              style={{ borderColor: THEME.colors.border }}
            >
              <span
                className="font-black text-[10px] tracking-widest uppercase"
                style={{ color: THEME.colors.textLight }}
              >
                Weight & Calories推移
              </span>
            </div>
          </div>
          <div className="flex justify-center gap-2 mb-10 w-full">
            {(["7d", "1m", "3m", "all"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  triggerHaptic();
                  setRange(r);
                  setPage(1);
                }}
                className={`btn-3d text-[9px] font-black px-1 py-2 rounded-2xl transition-all border-2 border-b-4 flex-1 shadow-sm ${range === r ? "text-white" : "bg-white"}`}
                style={
                  range === r
                    ? {
                        backgroundColor: THEME.colors.readPrimary,
                        borderColor: THEME.colors.readPrimary,
                        borderBottomColor: "rgba(0,0,0,0.1)",
                      }
                    : {
                        color: THEME.colors.textLight,
                        borderColor: THEME.colors.border,
                        borderBottomColor: "#d1d5db",
                      }
                }
              >
                {r === "7d"
                  ? "7日"
                  : r === "1m"
                    ? "1ヶ月"
                    : r === "3m"
                      ? "3ヶ月"
                      : "全期間"}
              </button>
            ))}
          </div>
          <div className="h-60 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: -15, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="weightGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={THEME.colors.posturePrimary}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={THEME.colors.posturePrimary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="6 6"
                  stroke="#F0EBE3"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 9,
                    fill: THEME.colors.textLight,
                    fontWeight: 900,
                  }}
                  stroke="#E5DDD0"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />

                <YAxis
                  yAxisId="weight"
                  domain={weightDomain}
                  orientation="left"
                  tick={{
                    fontSize: 9,
                    fill: THEME.colors.posturePrimary,
                    fontWeight: 900,
                  }}
                  stroke={THEME.colors.posturePrimary}
                  width={35}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  yAxisId="calories"
                  domain={[0, "auto"]}
                  orientation="right"
                  tick={{
                    fontSize: 9,
                    fill: THEME.colors.mealPrimary,
                    fontWeight: 900,
                  }}
                  stroke={THEME.colors.mealPrimary}
                  width={35}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 10px 30px -5px rgba(0,0,0,0.15)",
                    fontWeight: 900,
                    fontSize: "11px",
                    backgroundColor: "white",
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === "weight") return [`${value}kg`, "体重"];
                    if (name === "calories")
                      return [`${value}kcal`, "カロリー"];
                    return [value, name];
                  }}
                />

                {targetRange && (
                  <ReferenceArea
                    yAxisId="calories"
                    y1={targetRange.min}
                    y2={targetRange.max}
                    fill={THEME.colors.mealPrimary}
                    fillOpacity={0.1}
                  />
                )}

                {targetDateStr && (
                  <ReferenceLine
                    x={targetDateStr}
                    stroke={THEME.colors.readPrimary}
                    strokeDasharray="3 3"
                    label={{
                      position: "top",
                      value: "目標日",
                      fontSize: 9,
                      fill: THEME.colors.readPrimary,
                      fontWeight: 900,
                    }}
                  />
                )}

                {user.targetWeight && (
                  <ReferenceLine
                    yAxisId="weight"
                    y={user.targetWeight}
                    stroke={THEME.colors.readPrimary}
                    strokeDasharray="5 5"
                    strokeOpacity={0.8}
                    label={{
                      position: "right",
                      value: `目標:${user.targetWeight}kg`,
                      fontSize: 8,
                      fill: THEME.colors.readPrimary,
                      fontWeight: 900,
                      offset: 10,
                    }}
                  />
                )}

                <Bar
                  yAxisId="calories"
                  dataKey="calories"
                  name="calories"
                  fill={THEME.colors.mealPrimary}
                  radius={[4, 4, 0, 0]}
                  opacity={0.3}
                  barSize={12}
                />
                <Area
                  yAxisId="weight"
                  type="monotone"
                  dataKey="weight"
                  fill="url(#weightGradient)"
                  stroke="none"
                  connectNulls
                />
                <Line
                  yAxisId="weight"
                  type="monotone"
                  dataKey="weight"
                  name="weight"
                  stroke={THEME.colors.posturePrimary}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "white",
                    strokeWidth: 2,
                    stroke: THEME.colors.posturePrimary,
                  }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: THEME.colors.posturePrimary }}
              ></div>
              <span className="text-[8px] font-black opacity-50">
                体重 (kg)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: THEME.colors.mealPrimary,
                  opacity: 0.3,
                }}
              ></div>
              <span className="text-[8px] font-black opacity-50">
                摂取カロリー (kcal)
              </span>
            </div>
            {targetRange && (
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: THEME.colors.mealPrimary,
                    opacity: 0.1,
                  }}
                ></div>
                <span className="text-[8px] font-black opacity-50">目安帯</span>
              </div>
            )}
          </div>
        </div>

        {/* 1週間ふり返りレポート詳細カード */}
        <div className="mx-6 p-6 bg-white border-2 border-b-4 shadow-md organic-card rounded-[32px]" style={{ borderColor: THEME.colors.border }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50">
                <Sparkles size={20} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-black text-stone-700">1週間のふり返り</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-stone-400">REPORT</p>
              <p className="text-[10px] font-black text-stone-400 leading-none">V5.1</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Headline & Comment */}
            <div className="bg-amber-50/50 p-4 rounded-2xl border-2 border-dashed border-amber-100 relative">
              <div className="absolute -top-3 -left-2">
                <img src={OFFICIAL_MASCOT_SRC} alt="" className="w-10 h-10 object-contain drop-shadow-sm" />
              </div>
              <div className="pl-6">
                <h4 className="text-sm font-black text-amber-700 mb-2 leading-tight">
                  {weeklyReport.weeklyHeadline}
                </h4>
                <p className="text-xs font-bold text-stone-600 leading-relaxed">
                  {weeklyReport.weeklyComment}
                </p>
              </div>
            </div>

            {/* Basic Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                <p className="text-[10px] font-black text-stone-400 mb-1">平均摂取カロリー</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-stone-700">{weeklyReport.avgCalories}</span>
                  <span className="text-[10px] font-bold text-stone-400">kcal</span>
                </div>
              </div>
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                <p className="text-[10px] font-black text-stone-400 mb-1">体重の変化</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black" style={{ color: THEME.colors.posturePrimary }}>
                    {weeklyReport.weightDelta !== null ? `${weeklyReport.weightDelta > 0 ? '+' : ''}${weeklyReport.weightDelta}` : '--'}
                  </span>
                  <span className="text-[10px] font-bold text-stone-400">kg</span>
                </div>
              </div>
            </div>

            {/* PFC Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Utensils size={14} className="text-stone-400" />
                <span className="text-[11px] font-black text-stone-500">PFCバランスの傾向</span>
              </div>
              <div className="bg-white border-2 border-stone-100 p-3 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-black text-stone-600">{weeklyReport.pfcSummary}</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400" title="Protein"></div>
                  <div className="w-2 h-2 rounded-full bg-red-400" title="Fat"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400" title="Carbs"></div>
                </div>
              </div>
            </div>

            {/* Nutrients Tendency */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Stethoscope size={14} className="text-stone-400" />
                <span className="text-[11px] font-black text-stone-500">栄養素の充足傾向</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'ビタミン', level: weeklyReport.vitaminLevel, ratio: weeklyReport.vitaminRatio, icon: <Zap size={12} /> },
                  { label: 'ミネラル', level: weeklyReport.mineralLevel, ratio: weeklyReport.mineralRatio, icon: <Sparkles size={12} /> },
                  { label: '食物繊維', level: weeklyReport.fiberLevel, ratio: weeklyReport.fiberRatio, icon: <Leaf size={12} /> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-2">
                      <div className="text-stone-400">{item.icon}</div>
                      <span className="text-xs font-bold text-stone-600">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${Math.min(100, item.ratio * 100)}%`,
                            backgroundColor: item.ratio > 0.7 ? THEME.colors.success : item.ratio > 0.4 ? THEME.colors.mealPrimary : '#cbd5e1'
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-black min-w-[60px] text-right" style={{ 
                        color: item.level === 'しっかり摂れています' ? THEME.colors.success : item.level === '不足気味かもしれません' ? '#94a3b8' : THEME.colors.mealPrimary 
                      }}>
                        {item.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {!weeklyReport.hasEnoughTags && (
                <p className="text-[9px] font-bold text-stone-400 text-center">
                  ※AI解析データがたまると、より詳しく分析できます
                </p>
              )}
            </div>

            {/* Next Action */}
            <div className="bg-stone-800 p-4 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full"></div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-amber-400" />
                <span className="text-[10px] font-black text-amber-400 tracking-wider">NEXT ACTION</span>
              </div>
              <p className="text-xs font-bold text-white leading-relaxed">
                {weeklyReport.nextActionTip}
              </p>
            </div>
          </div>
        </div>

        {/* Diet Mode Simulation Card */}
        {dietSimulation && (
          <div className="mx-6 p-6 bg-[#F0FAF5] border-2 border-b-4 border-[#7ED3AE] shadow-sm relative overflow-hidden organic-card">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#7ED3AE] rounded-bl-full opacity-10"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Flag size={20} className="text-[#7ED3AE]" />
                <h3 className="text-sm font-black text-stone-700">
                  目標までの道のり
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-2xl border border-[#7ED3AE]">
                  <p className="text-[9px] font-bold text-stone-400 mb-1">
                    あと
                  </p>
                  <p className="text-xl font-black text-[#7ED3AE]">
                    {dietSimulation.weightDiff.toFixed(1)}{" "}
                    <span className="text-xs">kg</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#7ED3AE]">
                  <p className="text-[9px] font-bold text-stone-400 mb-1">
                    目標日まで
                  </p>
                  <p className="text-xl font-black text-[#7ED3AE]">
                    {dietSimulation.daysLeft}{" "}
                    <span className="text-xs">日</span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-[#7ED3AE]">
                <p className="text-[10px] font-black text-stone-600 mb-2 flex items-center gap-1">
                  <Calculator size={12} /> 1日あたりの調整目安
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-black text-[#7ED3AE]">
                    約{dietSimulation.dailyBurn}
                  </span>
                  <span className="text-xs font-bold text-stone-400">
                    kcal / 日
                  </span>
                </div>
                <p className="text-[10px] font-bold text-stone-400 leading-relaxed">
                  (脂肪1kgを7,400kcalとして計算)
                </p>
              </div>

              {/* アラート・アドバイス表示エリア */}
              {dietSimulation.isImpossible ? (
                <div className="flex items-start gap-2 bg-[#FFEBEE] p-3 rounded-xl border border-[#FFCDD2]">
                  <AlertCircle
                    size={20}
                    className="text-[#D32F2F] shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-[10px] font-black text-[#C62828] mb-1">
                      設定に無理がある可能性があります（要確認）
                    </p>
                    <div className="text-[9px] font-bold text-[#C62828] leading-relaxed space-y-1">
                      <p>
                        計算上、1日{" "}
                        <strong>-{dietSimulation.dailyBurn}kcal</strong>{" "}
                        の調整が必要です。これは「1ヶ月で10kg減」のような極端なペースです。
                      </p>
                      <p>
                        ⚠️ <strong>データ入力の間違いはありませんか？</strong>
                        （目標体重や日付の再確認を推奨）
                      </p>
                      <p>
                        極端な食事制限（摂取800kcal未満など）は、医師や専門家の指導なしに行うと危険です。代謝が落ち、リバウンドの原因にもなります。
                      </p>
                      <p>
                        「設定」から目標日を延ばし、運動を併用した健康的な計画に修正してください。
                      </p>
                    </div>
                  </div>
                </div>
              ) : dietSimulation.isLowBMI ? (
                <div className="flex items-start gap-2 bg-[#E3F2FD] p-3 rounded-xl border border-[#BBDEFB]">
                  <Dumbbell
                    size={16}
                    className="text-[#1976D2] shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-[10px] font-black text-[#1565C0] mb-1">
                      引き締め・ボディメイクのフェーズです
                    </p>
                    <p className="text-[9px] font-bold text-[#1976D2] leading-tight">
                      目標BMIが18.5未満（{dietSimulation.targetBMI}
                      ）です。これ以上の食事制限は健康を損なう可能性があります。
                      <br />
                      しっかり食べて運動し、筋肉をつけてボディラインを整えることを意識しましょう。
                    </p>
                  </div>
                </div>
              ) : dietSimulation.isHard ? (
                <div className="flex items-start gap-2 bg-[#FFF3E0] p-3 rounded-xl border border-[#FFE0B2]">
                  <AlertTriangle
                    size={16}
                    className="text-[#F57C00] shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-[10px] font-black text-[#EF6C00] mb-1">
                      かなりハードなペースです（1日 -{dietSimulation.dailyBurn}
                      kcal）
                    </p>
                    <p className="text-[9px] font-bold text-[#EF6C00] leading-tight">
                      食事を減らすだけでなく、
                      <strong>運動（筋トレや有酸素運動）</strong>
                      を組み合わせないと、筋肉が落ちてリバウンドしやすくなります。
                      <br />
                      無理なく続けるために、目標日を少し先に延ばすことも検討してください。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 bg-[#F1F8E9] p-3 rounded-xl border border-[#DCEDC8]">
                  <Stethoscope
                    size={16}
                    className="text-[#689F38] shrink-0 mt-0.5"
                  />
                  <p className="text-[9px] font-bold text-[#558B2F] leading-tight">
                    無理のない良いペースです。ご飯1杯分程度の調整や、運動で達成可能な範囲です✨
                    <br />
                    体調に合わせて継続していきましょう！
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <section className="px-6 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <HistoryIcon size={18} className="text-stone-400" />
              <h2
                className="text-sm font-black"
                style={{ color: THEME.colors.textPrimary }}
              >
                きろく。
              </h2>
            </div>
            <span className="text-[9px] font-black opacity-30 tracking-widest uppercase">
              Max 300 Days
            </span>
          </div>

          {pagedRecords.length === 0 ? (
            <div
              className="py-16 text-center bg-white border-2 border-dashed"
              style={{
                borderColor: THEME.colors.border,
                borderRadius: THEME.shapes.card,
              }}
            >
              <p className="text-xs font-bold text-stone-300">
                まだ記録がありません
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pagedRecords.map((record) => (
                <RecordItem
                  key={record.id}
                  record={record}
                  onPostureClick={onPostureClick}
                  onMealClick={onMealClick}
                />
              ))}

              {sortedRecords.length > pagedRecords.length && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    className="w-full min-h-[56px] h-auto py-3 !rounded-3xl !border-dashed opacity-60 hover:opacity-100 flex items-center justify-center gap-2"
                  >
                    <ArrowDown size={16} className="animate-bounce" />
                    もっと前の記録を見る
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="pt-10 pb-20">
          <div className="px-6 mb-4 flex items-center gap-3 opacity-30">
            <div className="h-[1px] flex-1 bg-stone-400"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">
              End of History
            </span>
            <div className="h-[1px] flex-1 bg-stone-400"></div>
          </div>
          <div className="flex justify-center mb-8 opacity-50">
            <img
              src="/tabetotto.mascot.svg"
              alt=""
              className="w-16 h-16 object-contain animate-sway"
            />
          </div>
          {/* Sentinel for MREC triggering & MREC space reservation */}
          <div
            ref={bottomSentinelRef}
            style={{ height: Capacitor.isNativePlatform() ? "300px" : "0px", width: "100%" }}
          />
        </div>
      </main>
    </div>
  );
};

export default HistoryView;
