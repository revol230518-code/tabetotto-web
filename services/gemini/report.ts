
import { getHomeComment } from "../localComments/homeComments";
import { UserProfile, DailyRecord } from "../../types";

/**
 * たべとっと。 レポート・アドバイスサービス (v5.0 ローカル生成版)
 * Cloud Run へのリクエストを廃止し、アプリ内ロジックでメッセージを生成します。
 */

export const generateWeeklyReport = async (): Promise<string> => {
    // 週次レポート機能は現状簡易メッセージを返すのみとする（AIコスト削減のため）
    return "今週もよく頑張りましたね！";
};

export const generateDailyAdvice = async (user: UserProfile, todayRecord: DailyRecord): Promise<string> => {
    // AI (Cloud Run) への通信を行わず、ローカルロジックで生成
    try {
        const comment = getHomeComment(user, todayRecord);
        return comment;
    } catch (e) {
        console.error("Local comment generation failed:", e);
        return "今日も自分らしく過ごしましょう！✨";
    }
};
