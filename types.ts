
export interface UserProfile {
  height: number; // cm
  targetWeight?: number; // kg
  nickname?: string;
  age?: number; // Moved from dietMode in v2.1
  theme?: 'default' | 'matte-blue'; // テーマ設定
  hasSeenStorageNotice?: boolean; // 端末内保存の案内を見たかどうか
  hapticsEnabled?: boolean; // バイブ設定
  
  // v2.0 Profile Extensions
  gender?: 'female' | 'male';
  activityLevel?: 'low' | 'normal' | 'high';
  dietMode?: {
    enabled: boolean;
    goal: 'loss' | 'maintain' | 'gain';
    intensity?: 'loose' | 'strict';
    targetDate?: string; // YYYY-MM-DD
  };
}

export interface PostureAnalysis {
  isAnalyzable: boolean;
  level: 'OK' | 'CAUTION' | 'CHECK';
  point: string; // 改善ポイント1つ
  errorReason?: string;
}

export interface PostureComparison {
  targetDate: string; // 比較相手の日付
  feeling: 'positive' | 'neutral' | 'negative' | 'none';
  note?: string;
  createdAt: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealAnalysis {
  menuName: string;
  numericCalories?: number; 
  pfcRatio: {
    p: number;
    f: number;
    c: number;
  };
  comment: string;
  isFood?: boolean; // 飲食物かどうかの判定フラグ
  category?: 'food' | 'non_food' | 'blocked'; // 解析カテゴリー
  mealType?: MealType; 
  memo?: string;
  externalUrl?: string; // SNS投稿URLやカレンダーURLの記録用

  // v5.1 Weekly Report Extensions
  foodGroups?: {
    vegetables: 0 | 1 | 2;
    fruits: 0 | 1 | 2;
    mushrooms: 0 | 1 | 2;
    seaweed: 0 | 1 | 2;
    soyBeans: 0 | 1 | 2;
    fishSeafood: 0 | 1 | 2;
    dairy: 0 | 1 | 2;
    nutsSeeds: 0 | 1 | 2;
    wholeGrains: 0 | 1 | 2;
  };
  microBalance?: {
    vitamin: 0 | 1 | 2;
    mineral: 0 | 1 | 2;
    fiber: 0 | 1 | 2;
  };
  tagConfidence?: "low" | "mid" | "high";
  tagSchemaVersion?: number;
}

export interface DailyRecord {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  weight?: number;
  posturePhotoUrl?: string; 
  postureSidePhotoUrl?: string; 
  postureAnalysis?: PostureAnalysis;
  postureComparison?: PostureComparison; // 比較メモ
  isPostureComparisonAnchor?: boolean; // 比較基準フラグ
  postureAnchorSetAt?: number; // 比較基準設定日時
  mealPhotoUrls: string[]; 
  mealAnalyses: MealAnalysis[];
  weeklySummary?: string; 
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  MEAL = 'MEAL',
  HISTORY = 'HISTORY',
  POSTURE = 'POSTURE',
  SETTINGS = 'SETTINGS',
  POSTURE_POINTS = 'POSTURE_POINTS',
  NUTRITION_GUIDE = 'NUTRITION_GUIDE',
  MOVE_GUIDE = 'MOVE_GUIDE',
  USAGE = 'USAGE',
  FAQ = 'FAQ',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS',
  INFO = 'INFO'
}