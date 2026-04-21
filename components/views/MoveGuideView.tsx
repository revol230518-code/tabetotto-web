import React, { useState, useMemo } from "react";
import { Activity, Utensils, Info, AlertCircle } from "lucide-react";
import { THEME } from "../../theme";
import { Card, Button } from "../UIComponents";
import { UserProfile, DailyRecord } from "../../types";

interface MoveGuideViewProps {
  user: UserProfile;
  todayRecord: DailyRecord;
  records: DailyRecord[];
  onBack?: () => void;
}

const ACTIVITIES = [
  { label: "散歩", met: 3.5 },
  { label: "早歩き", met: 4.3 },
  { label: "軽いジョグ", met: 6.0 },
  { label: "筋トレ", met: 5.5 },
  { label: "水泳", met: 6.0 },
  { label: "水泳（やや速い）", met: 8.0 },
  { label: "サイクリング", met: 7.0 },
  { label: "家事", met: 3.0 },
  { label: "掃除機がけ", met: 3.3 },
  { label: "床拭き", met: 3.8 },
  { label: "風呂掃除", met: 4.0 },
  { label: "テニス", met: 7.0 },
  { label: "サッカー", met: 7.0 },
  { label: "バスケットボール", met: 8.0 },
];

const MoveGuideView: React.FC<MoveGuideViewProps> = ({
  user,
  todayRecord,
  records,
  onBack,
}) => {
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(0);
  const [minutes, setMinutes] = useState(30);

  // 体重取得ロジックの改善
  const { weight, isEstimated } = useMemo(() => {
    // 1. 今日の体重
    if (todayRecord.weight && todayRecord.weight > 0) {
      return { weight: todayRecord.weight, isEstimated: false };
    }

    // 2. 過去の最新体重
    // 日付降順にソートして探す
    const sorted = [...records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const latest = sorted.find((r) => r.weight !== undefined && r.weight > 0);
    if (latest && latest.weight) {
      return { weight: latest.weight, isEstimated: false };
    }

    // 3. 仮定 (50kg)
    return { weight: 50, isEstimated: true };
  }, [todayRecord.weight, records]);

  const activity = ACTIVITIES[selectedActivityIndex];

  // 今日の間食カロリー合計
  const snackCalories = useMemo(() => {
    return todayRecord.mealAnalyses
      .filter((m) => m.mealType === "snack")
      .reduce((acc, m) => acc + (m.numericCalories ?? 0), 0);
  }, [todayRecord]);

  // 消費カロリー計算: METs * kg * hour
  const burnedCalories = Math.round(activity.met * weight * (minutes / 60));

  // 間食分を消費するのに必要な時間 (分)
  const defaultWalkMet = 3.5;
  const minutesWalkToBurn =
    snackCalories > 0
      ? Math.round((snackCalories / (defaultWalkMet * weight)) * 60)
      : 0;

  const minutesToBurnSnack =
    snackCalories > 0
      ? Math.round((snackCalories / (activity.met * weight)) * 60)
      : 0;

  // ダイエット目標に基づく調整目安
  const dietAdvice = useMemo(() => {
    if (
      user.dietMode?.enabled &&
      user.dietMode.goal === "loss" &&
      user.targetWeight &&
      user.dietMode.targetDate &&
      todayRecord.weight
    ) {
      const diff = todayRecord.weight - user.targetWeight;
      if (diff <= 0) return null;

      const totalKcal = diff * 7200; // 脂肪1kg = 7200kcalで計算
      const today = new Date();
      const target = new Date(user.dietMode.targetDate);
      const daysLeft = Math.ceil(
        (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      // 残り日数が計算できない、または過ぎている場合は30日で計算
      const effectiveDays = daysLeft > 0 ? daysLeft : 30;
      const dailyBurn = Math.round(totalKcal / effectiveDays);

      return {
        dailyBurn,
        days: effectiveDays,
      };
    }
    return null;
  }, [user, todayRecord.weight]);

  return (
    <div className="flex flex-col min-h-screen pb-44 w-full no-scrollbar overflow-x-hidden relative">
      {/* Background Decor */}
      <div
        className="organic-blob w-80 h-80 top-20 -right-40 animate-float-slow will-change-transform"
        style={{ backgroundColor: THEME.colors.readSoft }}
      ></div>
      <div
        className="organic-blob w-64 h-64 bottom-60 -left-32 animate-float-slow will-change-transform"
        style={{
          backgroundColor: THEME.colors.readSoft,
          animationDelay: "2s",
        }}
      ></div>

      <main className="px-6 pt-6 pb-32 space-y-8 animate-in slide-in-from-right duration-300 relative z-10">
        {/* トップ強調表示エリア */}
        <div
          className="bg-white p-8 rounded-[40px] border-2 border-b-4 shadow-lg relative overflow-hidden text-center space-y-5 organic-card"
          style={{ borderColor: THEME.colors.readPrimary }}
        >
          <div
            className="absolute top-0 left-0 w-full h-2"
            style={{ backgroundColor: THEME.colors.readPrimary }}
          ></div>
          <div className="absolute -top-6 -right-6 opacity-[0.03] pointer-events-none motion-safe:animate-breathe-subtle">
            <img
              src="/tabetotto.mascot.svg"
              alt=""
              className="w-40 h-40 object-contain transform -rotate-12"
            />
          </div>

          {snackCalories > 0 ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
                <div className="space-y-2 text-center flex-1">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-10 h-10 bg-[#FFF0F0] rounded-xl flex items-center justify-center shadow-sm border-2 border-b-4 border-[#FFCDD2]">
                      <span className="text-xl animate-bounce">🍰</span>
                    </div>
                    <span className="text-xs font-black text-stone-500">
                      今日の間食
                    </span>
                  </div>
                  <div className="text-4xl font-black text-[#5D5745] tracking-tight">
                    {snackCalories}{" "}
                    <span className="text-base font-bold text-[#A0937D]">
                      kcal
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center justify-center gap-2 text-stone-300">
                  <div className="h-[2px] w-8 sm:w-[2px] sm:h-8 bg-stone-200 rounded-full"></div>
                  <span className="text-[10px] font-black tracking-widest opacity-50">
                    EQUALS
                  </span>
                  <div className="h-[2px] w-8 sm:w-[2px] sm:h-8 bg-stone-200 rounded-full"></div>
                </div>

                <div className="space-y-2 text-center flex-1">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border-2 border-b-4" style={{ backgroundColor: THEME.colors.readSoft, borderColor: THEME.colors.readPrimary }}>
                      <span className="text-xl animate-sway">🚶</span>
                    </div>
                    <span className="text-xs font-black text-stone-500">
                      散歩なら
                    </span>
                  </div>
                  <div
                    className="text-4xl font-black tracking-tight"
                    style={{ color: THEME.colors.readPrimary }}
                  >
                    約 {minutesWalkToBurn}{" "}
                    <span className="text-base font-bold text-[#A0937D]">
                      分
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="bg-stone-50 py-3 px-5 rounded-[20px] border-2 border-b-4 border-dashed inline-block w-full"
                style={{ borderColor: THEME.colors.readPrimary }}
              >
                <p className="text-[11px] font-bold text-stone-500 leading-relaxed">
                  ※この間食は、散歩約{minutesWalkToBurn}分くらいに相当します。
                  <br />
                  無理のない範囲で体を動かしてみましょう。
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 bg-stone-50 rounded-[24px] flex items-center justify-center mx-auto shadow-inner border-2 border-b-4 border-dashed border-stone-200">
                <Utensils size={32} className="text-stone-300" />
              </div>
              <p className="text-sm font-bold text-stone-500 leading-relaxed">
                まだ間食の記録がありません。
                <br />
                おやつを食べたら記録してみましょう！
              </p>
            </div>
          )}

          <p className="text-[9px] font-bold text-stone-300 absolute bottom-3 right-6">
            ※目安です
          </p>
        </div>

        {/* シミュレーター */}
        <Card
          className="!p-8 bg-white border-2 border-b-4 space-y-8 organic-card"
          style={{ borderColor: THEME.colors.readPrimary }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border-2 border-b-4" style={{ backgroundColor: THEME.colors.readSoft, borderColor: THEME.colors.readPrimary }}>
                <Activity size={22} style={{ color: THEME.colors.readPrimary }} />
              </div>
              <h3
                className="text-base font-black"
                style={{ color: THEME.colors.textPrimary }}
              >
                活動量シミュレーター
              </h3>
            </div>
            {isEstimated && (
              <div className="flex items-center self-start sm:self-auto gap-1.5 bg-[#FFF3E0] px-3 py-1.5 rounded-xl border-2 border-b-4 border-[#FFE0B2] shadow-sm">
                <AlertCircle size={12} className="text-[#F57C00]" />
                <span className="text-[10px] font-black text-[#EF6C00]">
                  50kgで仮計算中
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                活動の種類
              </label>
              <div className="relative">
                <select
                  value={selectedActivityIndex}
                  onChange={(e) =>
                    setSelectedActivityIndex(Number(e.target.value))
                  }
                  className="w-full p-4 rounded-2xl bg-stone-50 border-2 border-b-4 font-black text-sm appearance-none outline-none transition-all shadow-inner"
                  style={{
                    borderColor: THEME.colors.readPrimary,
                    color: THEME.colors.textPrimary,
                  }}
                >
                  {ACTIVITIES.map((act, idx) => (
                    <option key={idx} value={idx}>
                      {act.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300">
                  ▼
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  時間
                </label>
                <span
                  className="text-sm font-black"
                  style={{ color: THEME.colors.readPrimary }}
                >
                  {minutes}分
                </span>
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full h-3 bg-stone-100 rounded-full appearance-none cursor-pointer shadow-inner"
                  style={{ accentColor: THEME.colors.readPrimary }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-stone-300 px-2">
                <span>5分</span>
                <span>60分</span>
                <span>120分</span>
                <span>180分</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[32px] border-2 border-b-4 text-center space-y-2 relative shadow-inner" style={{ backgroundColor: THEME.colors.readSoft, borderColor: THEME.colors.readPrimary }}>
            <p className="text-xs font-black opacity-70" style={{ color: THEME.colors.textPrimary }}>
              消費エネルギー
            </p>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl font-black tracking-tight" style={{ color: THEME.colors.readPrimary }}>
                約 {burnedCalories}
              </span>
              <span className="text-sm font-bold" style={{ color: THEME.colors.textPrimary }}>kcal</span>
            </div>
            <p className="text-[10px] font-bold opacity-60 mt-1" style={{ color: THEME.colors.textPrimary }}>
              ※体重 {weight}kg で計算した目安です
              {isEstimated && (
                <span className="block text-[9px] mt-1">
                  （体重記録を入れるとより正確になります）
                </span>
              )}
            </p>
          </div>

          {snackCalories > 0 && (
            <div className="pt-4 border-t-2 border-dashed border-stone-100">
              <div className="flex items-start gap-3 bg-stone-50 p-4 rounded-2xl border-2 border-b-4 border-stone-100">
                <div
                  className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border-2 border-b-4"
                  style={{ borderColor: THEME.colors.border }}
                >
                  <Info size={18} className="text-[#FF9800]" />
                </div>
                <p className="text-xs font-bold text-stone-600 leading-relaxed">
                  今日の間食{" "}
                  <span className="text-[#FF9800] font-black">
                    {snackCalories}kcal
                  </span>{" "}
                  分を消費するには、
                  <span className="text-[#6BC99D] font-black">
                    {" "}
                    {activity.label}
                  </span>{" "}
                  なら
                  <span className="text-[#6BC99D] font-black text-base">
                    {" "}
                    約 {minutesToBurnSnack} 分
                  </span>{" "}
                  相当の運動が必要です。
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* ダイエット目標アドバイス */}
        {dietAdvice && (
          <div className="bg-[#FFF8F0] p-8 rounded-[40px] border-2 border-b-4 border-[#FFE0B2] relative overflow-hidden shadow-lg organic-card">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFECB3] rounded-bl-full opacity-30"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border-2 border-b-4"
                  style={{ borderColor: "#FFE0B2" }}
                >
                  <img
                    src="/tabetotto.mascot.svg"
                    alt="たべとっと"
                    className="w-8 h-8 object-contain motion-safe:animate-breathe-subtle"
                  />
                </div>
                <h3 className="text-sm font-black text-[#5D4037]">
                  目標達成へのヒント
                </h3>
              </div>
              <p className="text-sm font-bold text-[#8D6E63] leading-relaxed">
                目標体重に向けて、1日あたり
                <br />
                <span className="text-2xl font-black text-[#FF9800] tracking-tight">
                  約 {dietAdvice.dailyBurn} kcal
                </span>
                <br />
                の調整（食事を減らす or 運動で消費）が目安です。
              </p>
              <div className="bg-white/50 p-3 rounded-2xl border-2 border-b-4 border-[#FFE0B2]">
                <p className="text-[10px] font-bold text-[#A1887F]">
                  ※残り{dietAdvice.days}日で計算した場合の単純計算値です。
                  <br />
                  体調に合わせて無理なく進めましょう。
                </p>
              </div>
            </div>
          </div>
        )}

        {onBack && (
          <div className="flex flex-col items-center mt-8 relative">
            <div className="absolute -top-10 left-8 pointer-events-none animate-sway z-0">
              <img
                src="/tabetotto.mascot.svg"
                alt=""
                className="w-12 h-12 object-contain transform -rotate-12 opacity-80"
              />
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full max-w-xs shadow-sm relative z-10 bg-white"
            >
              姿勢チェックにもどる
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MoveGuideView;
