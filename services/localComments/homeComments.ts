
import { UserProfile, DailyRecord } from "../../types";
import { calculateCalorieTarget } from "../../utils";

/**
 * 擬似乱数生成器 (Mulberry32)
 * シード値を指定することで、同じシードからは常に同じ乱数列が生成される
 */
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

/**
 * 日付ベースのシード値を生成 (YYYYMMDD)
 */
function getDateSeed(): number {
    const now = new Date();
    return parseInt(`${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`);
}

/**
 * ホーム画面用のコメントを生成する
 * 通信を行わず、ルールベースとランダム要素で決定する
 */
export function getHomeComment(user: UserProfile, todayRecord: DailyRecord): string {
    const now = new Date();
    const hour = now.getHours();
    const seed = getDateSeed();
    
    // カロリー情報の取得
    const totalCalories = todayRecord.mealAnalyses.reduce((acc, m) => acc + (m.numericCalories ?? 0), 0);
    const mealCount = todayRecord.mealAnalyses.length;
    const targetRange = calculateCalorieTarget(user); // { min, max, label } | null

    let candidates: string[] = [];

    // --- 1. 時間帯ベースの基本挨拶 ---
    if (hour >= 5 && hour < 11) {
        candidates.push(
            "おはようございます！今日も良い1日を。",
            "朝ごはんはしっかり食べましたか？",
            "新しい1日の始まりですね！",
            "深呼吸して、リラックスしていきましょう。",
            "今日も自分らしく過ごしましょう✨"
        );
    } else if (hour >= 11 && hour < 16) {
        candidates.push(
            "こんにちは！お昼ご飯はなんでしょう？",
            "午後も無理せずいきましょう。",
            "水分補給も忘れないでくださいね。",
            "ちょっと一息つきませんか？",
            "ランチタイムを楽しんでくださいね🍱"
        );
    } else if (hour >= 16 && hour < 19) {
        candidates.push(
            "お疲れ様です！そろそろ夕食の時間ですね。",
            "今日の振り返りをしてみましょう。",
            "小腹が空いたらナッツなどがおすすめです。",
            "夕暮れ時、少しリラックスしましょう。"
        );
    } else if (hour >= 19 && hour < 23) {
        candidates.push(
            "こんばんは。今日も1日お疲れ様でした。",
            "ゆっくりお風呂に入って温まりましょう。",
            "明日のためにリラックスタイムを。",
            "夜更かしはほどほどに…🌙",
            "今日あった良いことを思い出してみましょう。"
        );
    } else { // 深夜 (23:00 - 04:59)
        candidates.push(
            "夜遅くまでお疲れ様です。無理しないでくださいね。",
            "しっかり睡眠をとることも大切です。",
            "おやすみなさい、良い夢を。",
            "明日も良い日になりますように💤"
        );
    }

    // --- 2. 状態ベースのコメント追加（優先度高） ---
    
    // 未入力 (食事回数0)
    if (mealCount === 0) {
        // 未入力時は入力を促すメッセージの比率を増やす
        const promptMessages = [
            "まずは1回、食事を記録してみませんか？",
            "「おなかへった…」記録待ってます！",
            "今日の食事を写真に撮ってみましょう。",
            "何を食べましたか？教えてください！",
            "記録をつけると、変化が見えてきますよ。"
        ];
        candidates = [...candidates, ...promptMessages, ...promptMessages]; // 比重を重くする
    } 
    // 目標設定ありの場合の判定
    else if (targetRange) {
        if (totalCalories > targetRange.max + 200) {
            // 食べ過ぎ
            candidates.push(
                "美味しく食べられましたか？明日は調整モードでいきましょう！",
                "食べすぎちゃっても大丈夫。長い目で見れば誤差です。",
                "エネルギー満タンですね！明日消費しましょう。",
                "明日は少し野菜を多めにしてみると良いかも？",
                "罪悪感は持たなくてOK。美味しく食べたなら勝ちです！"
            );
        } else if (totalCalories < targetRange.min - 400 && hour > 19) {
            // 夜なのにカロリー大幅不足
            candidates.push(
                "今日は少しエネルギー不足かも？無理な制限は禁物です。",
                "もう少し食べても大丈夫ですよ。",
                "栄養バランス、足りてますか？",
                "明日の朝はしっかり食べましょうね。"
            );
        } else if (totalCalories >= targetRange.min && totalCalories <= targetRange.max) {
            // 適正範囲
            candidates.push(
                "ナイスバランス！いい感じです。",
                "目標範囲内です。素晴らしい！",
                "この調子で続けていきましょう。",
                "自分を褒めてあげてくださいね！🌸",
                "理想的な食事リズムですね。"
            );
        }
    }

    // --- 3. 継続への励まし（常に候補に入れる） ---
    candidates.push(
        "自分らしく、マイペースに。",
        "記録することが第一歩です。",
        "焦らず、少しずつ変化を楽しみましょう。",
        "「たべとっと。」はいつでも応援しています。",
        "姿勢を正すと、気分も変わりますよ！"
    );

    // シードに「時間帯（hour）」を加算することで、
    // 同じ日でも時間帯が変わればメッセージが変わるようにする。
    // かつ、リロード連打では変わらない安定性を持たせる。
    const timeSeed = seed + hour;
    const random = mulberry32(timeSeed);
    
    const index = Math.floor(random() * candidates.length);
    return candidates[index];
}
