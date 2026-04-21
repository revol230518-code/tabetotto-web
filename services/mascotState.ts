
import { DailyRecord, UserProfile } from '../types';
import { calculateCalorieTarget, getTodayString, toLocalDateString } from '../utils';
import { MascotCondition } from './gemini/character';

// 配列からランダムに1つ選ぶヘルパー
const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const determineMascotState = (
  todayRecord: DailyRecord,
  records: Record<string, DailyRecord>,
  user: UserProfile
): { condition: MascotCondition; message?: string } => {
  const todayCalories = todayRecord.mealAnalyses.reduce((acc, m) => acc + (m.numericCalories ?? 0), 0);
  const mealCount = todayRecord.mealAnalyses.length;
  const target = calculateCalorieTarget(user);
  
  const now = new Date();
  const hour = now.getHours();

  // --- ストリーク計算 (連続記録日数) ---
  const todayStr = getTodayString();
  const sortedDates = Object.keys(records).sort().reverse().filter(d => d < todayStr);
  let streak = 0;
  
  // 昨日以前の連続記録をチェック
  let currentCheckDate = new Date();
  currentCheckDate.setDate(currentCheckDate.getDate() - 1); // 昨日からチェック開始

  for (let i = 0; i < sortedDates.length; i++) {
    // UTCではなくJST(ローカル時間)基準で日付文字列を生成
    const checkStr = toLocalDateString(currentCheckDate);
    if (records[checkStr] && records[checkStr].mealAnalyses.length > 0) {
        streak++;
        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
        break;
    }
  }
  if (mealCount > 0) streak++;

  // --- 状態判定ロジック ---

  // 1. 未入力 (Hungry判定)
  if (mealCount === 0 || todayCalories === 0) {
    // 時間帯によってメッセージを変える
    if (hour < 10) {
        // 朝: 爽やかに促す
        return { condition: 'normal', message: pick(['おはよう！', '朝ごはん食べた？', '今日もよろしくね✨', '起きてる〜？']) };
    } else if (hour < 19) {
        // 昼〜夕方: お腹を空かせる (12時間経過イメージ)
        return { condition: 'hungry', message: pick(['ぐ〜…', 'おなかへった…', 'なにかたべよ？', '記録まってる…', 'エネルギー切れ…']) };
    } else {
        // 夜: 優しく確認
        return { condition: 'hungry', message: pick(['今日の記録は？', 'ごはん食べた？', '忘れずに記録してね', 'おなかぺこぺこ…']) };
    }
  }

  if (!target) return { condition: 'normal' };

  // 2. 食べ過ぎ (Fat判定)
  // 目標 + 300kcal超過
  if (todayCalories > target.max + 300) {
    const msgs = [
        'おなかいっぱい…',
        '満足まんぞく♪',
        '明日は調整しよう',
        '苦しいかも…',
        'よく食べたね〜'
    ];
    return { condition: 'fat', message: pick(msgs) };
  }

  // 3. 夜の入力促進 (入力回数が少ない場合)
  // 夜19時以降で、記録が1回以下の場合
  if (hour >= 19 && mealCount <= 1) {
      const promptMsgs = [
          '夜ごはんは？',
          '入力忘れはない？',
          '今日もお疲れさま',
          '記録して休もう💤'
      ];
      // 表情はnormalで優しく
      return { condition: 'normal', message: pick(promptMsgs) };
  }

  // 4. 通常 (Normal) - 時間帯別の挨拶と応援
  
  // 記念ストリーク
  if ([10, 25, 50, 100, 150, 200, 300, 365].includes(streak)) {
      return { condition: 'normal', message: `${streak}日連続すごい！🎉` };
  }

  let normalMsgs: string[] = [];

  // 時間帯別の挨拶
  if (hour >= 5 && hour < 11) {
      normalMsgs.push('おはよう！', 'いい天気かな？', '今日も元気に！', '朝の深呼吸〜', '背筋のばして♪');
  } else if (hour >= 11 && hour < 17) {
      normalMsgs.push('こんにちは！', '午後もファイト', '調子はどう？', '休憩も大事だよ', '水分とってる？');
  } else if (hour >= 17 && hour < 22) {
      normalMsgs.push('こんばんは🌙', 'おつかれさま', 'リラックスしてね', '今日どうだった？', 'ゆっくり休もう');
  } else {
      normalMsgs.push('おやすみ💤', '夜更かしダメ', '寝るのが一番', '良い夢みてね');
  }

  return { condition: 'normal', message: pick(normalMsgs) };
};

/**
 * タップ時に表示するランダムメッセージリスト
 * 挨拶、健康アドバイス、励ましなど
 */
export const getRandomTapMessage = (): string => {
    const messages = [
        // 励まし・肯定
        "その調子！",
        "えらいえらい👏",
        "見守ってるよ",
        "マイペースでOK！",
        "ナイスファイト！",
        "自分を褒めてこ！",
        
        // 健康・美容アクション
        "背筋ピーン！",
        "お水飲んだ？",
        "肩の力抜いて〜",
        "深呼吸しよう🍃",
        "口角上げてこ！",
        "軽くストレッチ！",
        "目は疲れてない？",
        "姿勢、崩れてない？",
        
        // ゆるい会話
        "なでなで…",
        "呼んだ？",
        "お腹すいた？",
        "いつもありがとう✨",
        "明日も頑張ろう！"
    ];
    return pick(messages);
};

// タップ時のアクションクラスをランダムに返す
export const getRandomTapAction = (): string => {
    const actions = [
        "animate-bounce",
        "animate-shake",
        "animate-jump",
        "animate-spin-fast",
        "animate-pulse",
        "animate-slight-wobble",
        "animate-tiny-scale",
        "animate-sway"
    ];
    return pick(actions);
};
