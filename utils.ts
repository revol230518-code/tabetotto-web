
import { Sunset, Sun, Moon, Coffee } from 'lucide-react';
import { MealAnalysis, MealType, UserProfile } from './types';
import { Capacitor } from '@capacitor/core';
import { renderMealResultToBlob } from './services/renderers/mealResultRenderer';

export const APP_VERSION = "5.2.0";

export const BUILD_ID = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BUILD_ID) || 
  new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

export const STORAGE_KEY_USER = 'tabetotto_user';
export const STORAGE_KEY_RECORDS = 'tabetotto_records';
export const STORAGE_KEY_TOKENS = 'tabetotto_tokens';
export const STORAGE_KEY_LAST_RECOVERY = 'tabetotto_last_recovery';
export const STORAGE_KEY_PENDING_CAPTURE = 'tabetotto_pending_capture';
export const STORAGE_KEY_TEMP_FRONT_IMAGE = 'tabetotto_temp_front_image';
export const STORAGE_KEY_PENDING_SHARE = 'tabetotto_pending_share';

export const STORAGE_KEY_ICON_TOKENS = 'tabetotto_icon_tokens';
export const STORAGE_KEY_ICON_LAST_RECOVERY = 'tabetotto_icon_last_recovery';
export const MAX_ICON_TOKENS = 3;
export const ICON_RECOVERY_TIME_MS = 10 * 60 * 1000;

// トークン仕様（v2.0確定版）
export const MAX_TOKENS = 4;
export const AUTO_MAX_TOKENS = 2;
export const REWARD_TOKENS = 4;
export const RECOVERY_TIME_MS = 2 * 60 * 60 * 1000;

export const MEAL_TYPE_LABELS: Record<MealType, { label: string, icon: any, color: string, activeColor: string }> = {
  breakfast: { label: 'あさ', icon: Sunset, color: 'text-[#FFAD60] bg-[#FFF3E0] border-[#FFE0B2]', activeColor: 'bg-[#FFAD60] text-white border-[#FFAD60]' },
  lunch: { label: 'ひる', icon: Sun, color: 'text-[#FFD93D] bg-[#FFFDE7] border-[#FFF9C4]', activeColor: 'bg-[#FFD93D] text-white border-[#FFD93D]' },
  dinner: { label: 'よる', icon: Moon, color: 'text-[#6C5CE7] bg-[#EDE7F6] border-[#D1C4E9]', activeColor: 'bg-[#6C5CE7] text-white border-[#6C5CE7]' },
  snack: { label: '間食', icon: Coffee, color: 'text-[#FF6B6B] bg-[#FFEBEE] border-[#FFCDD2]', activeColor: 'bg-[#FF6B6B] text-white border-[#FF6B6B]' },
};

export const PFC_COLORS = {
  p: '#F88D8D', 
  f: '#FFD93D', 
  c: '#FFC175', 
};

export const calculateBMI = (heightCm: number, weightKg: number) => {
  if (!heightCm || !weightKg) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
};

// 日本肥満学会の判定基準に基づく
export const getBMILabel = (bmi: number): { label: string; color: string } => {
  if (bmi === 0) return { label: '-', color: '#A0937D' };
  // 18.5未満: 「やせ」は健康リスクがあるため、ポジティブな緑ではなく注意の黄色に変更
  if (bmi < 18.5) return { label: '低体重 (やせ)', color: '#FFD93D' }; 
  // 18.5以上25未満: 最も病気になりにくい範囲なので、健康的な緑色を採用
  if (bmi < 25) return { label: '普通体重', color: '#6BC99D' };
  // 25以上: 肥満 (赤)
  return { label: '肥満', color: '#B85A5A' };
};

// --- Calorie Target Calculation (v2.1 MHLW 2020 Compliant) ---
// 厚生労働省「日本人の食事摂取基準（2020年版）」推定エネルギー必要量(kcal/日)に基づく
// 身体活動レベル: I(低い), II(ふつう), III(高い)

type AgeGroup = '15-17' | '18-29' | '30-49' | '50-64' | '65-74' | '75+';

const EER_TABLE = {
  male: {
    '15-17': { low: 2500, normal: 2800, high: 3150 },
    '18-29': { low: 2300, normal: 2650, high: 3050 },
    '30-49': { low: 2300, normal: 2700, high: 3050 },
    '50-64': { low: 2200, normal: 2600, high: 2950 },
    '65-74': { low: 2050, normal: 2400, high: 2750 },
    '75+':   { low: 1800, normal: 2100, high: 2450 }, // 参考値
  },
  female: {
    '15-17': { low: 2050, normal: 2300, high: 2550 },
    '18-29': { low: 1700, normal: 2000, high: 2300 },
    '30-49': { low: 1750, normal: 2050, high: 2350 },
    '50-64': { low: 1650, normal: 1950, high: 2250 },
    '65-74': { low: 1550, normal: 1850, high: 2100 },
    '75+':   { low: 1400, normal: 1650, high: 1950 }, // 参考値
  }
};

const getAgeGroup = (age: number): AgeGroup => {
  if (age < 18) return '15-17'; // 簡易的に15-17歳枠を使用（15歳未満は対象外とする運用）
  if (age < 30) return '18-29';
  if (age < 50) return '30-49';
  if (age < 65) return '50-64';
  if (age < 75) return '65-74';
  return '75+';
};

export const calculateCalorieTarget = (user: UserProfile): { min: number, max: number, label: string } | null => {
  // 必須項目がない場合は計算しない
  if (!user.gender || !user.activityLevel) return null;

  // 年齢が未設定の場合は、最も人口の多い層（30-49歳）をデフォルトとする
  const ageGroup = user.age ? getAgeGroup(user.age) : '30-49';
  
  // 基準値の取得
  const baseEER = EER_TABLE[user.gender][ageGroup][user.activityLevel];
  
  // 範囲を持たせる（±5%程度を適正範囲とする）
  let targetMin = Math.round(baseEER * 0.95);
  let targetMax = Math.round(baseEER * 1.05);
  let label = "目安（維持）";

  // 2. ダイエットモード補正
  // 厚労省の保健指導では、極端な制限ではなく「今の摂取量から-200kcal」程度が推奨されることが多い
  if (user.dietMode?.enabled && user.dietMode.goal) {
    const isStrict = user.dietMode.intensity === 'strict';
    // strictでも最大-300kcal程度に留めるのが安全（月1~1.5kg減ペース）
    const adjustment = isStrict ? 350 : 200;

    switch (user.dietMode.goal) {
      case 'loss':
        targetMin -= adjustment;
        targetMax -= adjustment;
        label = "目安（減量）";
        break;
      case 'gain':
        targetMin += adjustment;
        targetMax += adjustment;
        label = "目安（増量）";
        break;
      case 'maintain':
      default:
        // No adjustment
        break;
    }
  }

  // 安全装置: 基礎代謝を下回りすぎる設定（女性1200kcal未満など）は健康リスクがあるため下限を設ける
  // (簡易的に、女性1200kcal, 男性1500kcalを下回らないようにクリップ)
  const SAFETY_MIN = user.gender === 'female' ? 1200 : 1500;
  if (targetMin < SAFETY_MIN) {
      targetMin = SAFETY_MIN;
      // maxもバランスを取って引き上げ
      if (targetMax < targetMin + 200) targetMax = targetMin + 200;
  }

  return { min: targetMin, max: targetMax, label };
};


// JST(ローカル時間)基準の日付文字列(YYYY-MM-DD)を生成する
// toISOString().split('T')[0] だとUTC基準になり、日本時間の午前0~9時に前日の日付になってしまう問題を修正
export const toLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayString = () => toLocalDateString();

export const addToCalendar = (type: 'meal' | 'weight' | 'posture', date: string, data: any) => {
  const dateStr = date.replace(/-/g, '');
  let title = "";
  let details = "";

  if (type === 'meal') {
    title = `🍽 食事: ${data.menuName}`;
    details = `約${data.numericCalories}kcal\nアドバイス: ${data.comment}`;
  } else if (type === 'weight') {
    title = `⚖️ 体重: ${data}kg`;
  } else if (type === 'posture') {
    title = `🧍 姿勢チェック`;
    details = `判定: ${data.level}\nポイント: ${data.point}`;
  }

  const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent(details)}`;
  window.open(googleUrl, '_blank');
};

/**
 * 保存された画像データ（Base64 または URI）を適切なsrc属性値に変換するヘルパー
 */
export const resolveMealImageSrc = (photo: string | null | undefined): string => {
  if (!photo) return '';
  
  // 既にURI形式（file://, content://, https:// 等）または dataスキーム付きの場合はそのまま返す
  if (photo.startsWith('file:') || photo.startsWith('content:') || photo.startsWith('data:') || photo.startsWith('http')) {
    if (Capacitor.isNativePlatform()) {
      return Capacitor.convertFileSrc(photo);
    }
    return photo;
  }
  
  // 旧仕様のBase64文字列（ヘッダーなし）の場合はヘッダーを付与
  return `data:image/jpeg;base64,${photo}`;
};

/**
 * シェア用画像を生成 (Unified Rendererへ委譲)
 */
export const generateShareImageBlob = async (
  photoBase64: string, 
  meal: MealAnalysis, 
  date: string
): Promise<Blob | null> => {
  return renderMealResultToBlob(photoBase64, meal, date);
};
