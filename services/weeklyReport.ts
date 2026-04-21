
import { DailyRecord } from "../types";

export interface WeeklyReport {
  recordDays: number;
  mealCount: number;
  avgCalories: number;
  weightDelta: number | null;
  pfcSummary: string;
  vitaminRatio: number;
  mineralRatio: number;
  fiberRatio: number;
  vitaminLevel: string;
  mineralLevel: string;
  fiberLevel: string;
  weeklyHeadline: string;
  weeklyComment: string;
  nextActionTip: string;
  hasEnoughData: boolean;
  hasEnoughTags: boolean;
}

const getLevel = (ratio: number): string => {
  if (ratio <= 0.33) return "少なめかも";
  if (ratio <= 0.66) return "まずまず";
  return "取り入れられている";
};

export const generateWeeklyReport = (records: DailyRecord[]): WeeklyReport => {
  // 直近7日分に絞る（引数ですでに絞られている想定だが念のため）
  const last7Days = records.slice(-7);
  
  const recordDays = last7Days.length;
  let mealCount = 0;
  let totalCalories = 0;
  let vitaminSum = 0;
  let mineralSum = 0;
  let fiberSum = 0;
  let taggableMealCount = 0;
  
  let totalP = 0;
  let totalF = 0;
  let totalC = 0;

  last7Days.forEach(record => {
    record.mealAnalyses.forEach(meal => {
      if (meal.isFood !== false) {
        mealCount++;
        totalCalories += (meal.numericCalories ?? 0);
        
        if (meal.pfcRatio) {
          totalP += meal.pfcRatio.p;
          totalF += meal.pfcRatio.f;
          totalC += meal.pfcRatio.c;
        }

        if (meal.microBalance) {
          taggableMealCount++;
          vitaminSum += meal.microBalance.vitamin || 0;
          mineralSum += meal.microBalance.mineral || 0;
          fiberSum += meal.microBalance.fiber || 0;
        }
      }
    });
  });

  const avgCalories = mealCount > 0 ? Math.round(totalCalories / recordDays) : 0;
  
  // 体重変化
  let weightDelta: number | null = null;
  const weightRecords = last7Days.filter(r => r.weight !== undefined && r.weight !== null);
  if (weightRecords.length >= 2) {
    const firstWeight = weightRecords[0].weight!;
    const lastWeight = weightRecords[weightRecords.length - 1].weight!;
    weightDelta = Math.round((lastWeight - firstWeight) * 10) / 10;
  }

  // PFC傾向
  let pfcSummary = "バランス良好";
  if (mealCount > 0) {
    const pAvg = totalP / mealCount;
    const fAvg = totalF / mealCount;
    const cAvg = totalC / mealCount;
    
    if (cAvg > 65) pfcSummary = "炭水化物寄り";
    else if (fAvg > 35) pfcSummary = "脂質やや多め";
    else if (pAvg < 13) pfcSummary = "たんぱく質やや少なめ";
    else if (pAvg > 25) pfcSummary = "たんぱく質しっかり";
    else pfcSummary = "まずまずのバランス";
  }

  // 栄養傾向 (0〜2 の値を 7日分で合算。理論最大値は 2 * mealCount)
  // ただし taggableMealCount が 0 の場合は 0
  const maxPossible = taggableMealCount * 2;
  const vitaminRatio = maxPossible > 0 ? vitaminSum / maxPossible : 0;
  const mineralRatio = maxPossible > 0 ? mineralSum / maxPossible : 0;
  const fiberRatio = maxPossible > 0 ? fiberSum / maxPossible : 0;

  const vitaminLevel = getLevel(vitaminRatio);
  const mineralLevel = getLevel(mineralRatio);
  const fiberLevel = getLevel(fiberRatio);

  const hasEnoughData = mealCount >= 3;
  const hasEnoughTags = taggableMealCount >= 3;

  // メッセージ生成
  let weeklyHeadline = "今週もお疲れ様でした！";
  let weeklyComment = "記録を続けることが健康への第一歩です。";
  let nextActionTip = "来週も無理なく続けていきましょう。";

  if (!hasEnoughData) {
    weeklyHeadline = "まずは記録から始めましょう";
    weeklyComment = "食生活の傾向を知るために、まずは3食以上の記録を目指してみませんか？";
    nextActionTip = "明日の食事を1つ撮ってみることからスタート！";
  } else {
    // 体重変化に応じたコメント
    if (weightDelta !== null) {
      if (Math.abs(weightDelta) < 0.5) {
        weeklyComment = "今週の体重は大きな変動なく推移しました。安定していますね。";
      } else if (weightDelta < 0) {
        weeklyComment = "今週は少し動きがありました。良い変化が見えてきています。";
      } else {
        weeklyComment = "今週は少しずつ変化が見えてきました。焦らずマイペースに進みましょう。";
      }
    }

    // 栄養バランスに応じたヘッドライン
    if (vitaminRatio > 0.6 && mineralRatio > 0.6 && fiberRatio > 0.6) {
      weeklyHeadline = "素晴らしいバランスの1週間でした！";
      nextActionTip = "この調子で、旬の食材も取り入れてみてください。";
    } else if (vitaminRatio < 0.4 || mineralRatio < 0.4 || fiberRatio < 0.4) {
      weeklyHeadline = "栄養の伸びしろが見つかりました";
      if (fiberRatio < 0.4) {
        nextActionTip = "来週は、海藻やきのこを少し足してみるのがおすすめです。";
      } else if (vitaminRatio < 0.4) {
        nextActionTip = "来週は、色の濃い野菜を意識するとさらに良くなりますよ。";
      } else {
        nextActionTip = "来週は、お味噌汁や乳製品でミネラルを補ってみましょう。";
      }
    } else {
      weeklyHeadline = "安定した食生活が送れていますね";
      nextActionTip = "よく噛んで食べることで、満足感もアップしますよ。";
    }
  }

  if (hasEnoughData && !hasEnoughTags) {
    weeklyComment += " (今週は詳細データが少なめだったので、来週の解析結果も楽しみにしていてくださいね)";
  }

  return {
    recordDays,
    mealCount,
    avgCalories,
    weightDelta,
    pfcSummary,
    vitaminRatio,
    mineralRatio,
    fiberRatio,
    vitaminLevel,
    mineralLevel,
    fiberLevel,
    weeklyHeadline,
    weeklyComment,
    nextActionTip,
    hasEnoughData,
    hasEnoughTags
  };
};
