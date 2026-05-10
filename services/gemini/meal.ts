
import { MealAnalysis } from "../../types";
import { callAiProxy, parseJSON } from "./client";

/**
 * サービス内ヘルパー：非食品かどうか判定
 */
export const isFoodMeal = (meal: MealAnalysis): boolean => {
  return meal.category === "food" || (meal.isFood !== false && meal.category !== "non_food" && meal.category !== "blocked");
};

/**
 * ヘルパー: カロリーの数値化と正規化
 */
const normalizeKcal = (kcal: any, isFood: boolean): number | undefined => {
  if (!isFood) return undefined;
  if (typeof kcal === 'number') return Math.round(kcal);
  if (typeof kcal === 'string') {
    const parsed = parseFloat(kcal.replace(/[^0-9.]/g, ''));
    return isNaN(parsed) ? undefined : Math.round(parsed);
  }
  return undefined;
};

/**
 * たべとっと。 食事解析サービス
 */
export const analyzeMeal = async (base64Image: string): Promise<MealAnalysis> => {
  const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, "").trim();

  const systemInstruction = `あなたは食事写真解析AI「たべとっと。」です。
ユーザーの食事を解析し、アプリ用の表示データを生成してください。
ユーザーにとって「見やすく・分かりやすく・不快感のない」結果を提供することを目的とします。

【品名ルール】
- 名詞のみで簡潔に表現してください。
- 固有名詞や一般的に広く認知されている名称（例：「ザク」「ガンダム」「ピカチュウ」等）は、無理に抽象化（例：「ロボット」「キャラクター」）せず、そのまま使用してください。
- 一般ユーザーが見て自然に分かる名称を優先してください。
- 形容表現や説明文（例：「美味しそうな」「焼きたての」）は含めないでください。
- 細かすぎる型番やマニアックすぎる正式名称に寄りすぎる必要はありません。

【kcalルール】
- 推定値を出力してください。
- 不明な場合は 0 としてください。

【PFCルール】
- 可能な範囲で推定してください。

【コメントルール（最重要）】
- 食事の印象や特徴を自然な日本語で伝えてください。
- 栄養アドバイスは「必要に応じて」軽い気づきとして添える程度にし、毎回必ず入れる必要はありません。アドバイスが不要な場合は、印象や特徴だけでもよいです。
- コメントの長さは固定せず、内容に応じた自然な長さにしてください（短く済む場合は短く、少し説明が必要な場合はその長さに応じて。ただし冗長にはしないこと）。
- 説教・指導・命令（例：「〜すべきです」「〜が必要です」「〜を控えてください」）は絶対にしないでください。
- 上から目線、断定口調、医療・診断・治療のような言い方（例：「〜が足りていません」「〜はよくありません」）は禁止です。
- 相手を評価したり、指導したりする言い方にせず、やわらかい提案表現を基本にしてください。
- 品名とコメントを一体化させないでください。品名を主語にしたり、「〜が」の形で始めたりせず、単体で意味が成立する文章にしてください。

【NG例】
- 品名とコメントを一体化する（例：「ハンバーグがジューシーで美味しそうです」）
- 命令・指導・断定（例：「野菜も摂りましょう」「これは健康に悪いです」「野菜が足りていません」）
- 毎回同じようなアドバイスや、無理に短文化した不自然な文

【OK例】
- 「たんぱく質がしっかり摂れそうです。」
- 「脂質がやや多めな印象です。」
- 「バランスの良い組み合わせですね。」
- 「軽めの食事としてちょうど良さそうです。」
- 「彩りが豊かで食欲をそそります。」

【非食品（イラスト・マスコット・物体など）への対応】
1. 写真が「実在する食べ物」ではない場合（イラスト、キャラクター、食品サンプル、ぬいぐるみ、景色、人物のみ等）は、非食品として扱ってください。
2. 非食品の場合、numericCaloriesは必ず 0 にしてください。
3. 非食品へのコメントでは、食べ物や栄養、カロリーに一切触れないでください。
4. 被写体の見た目、雰囲気、存在感、まとまり、印象などを、短く自然な1文で表現してください。

【出力形式】
JSONのみ出力してください。
{
  "menuName": string, // 品名（名詞、固有名詞OK）
  "numericCalories": number, // カロリー（不明な場合は0）
  "pfcRatio": { "p": number, "f": number, "c": number }, // 合計100
  "comment": string, // コメント（自然な1〜2文、説教なし、品名と分離）
  "isFood": boolean, // 食品ならtrue
  "category": "food" | "non_food" | "blocked",
  "foodGroups": {
    "vegetables": 0 | 1 | 2,
    "fruits": 0 | 1 | 2,
    "mushrooms": 0 | 1 | 2,
    "seaweed": 0 | 1 | 2,
    "soyBeans": 0 | 1 | 2,
    "fishSeafood": 0 | 1 | 2,
    "dairy": 0 | 1 | 2,
    "nutsSeeds": 0 | 1 | 2,
    "wholeGrains": 0 | 1 | 2
  },
  "microBalance": {
    "vitamin": 0 | 1 | 2,
    "mineral": 0 | 1 | 2,
    "fiber": 0 | 1 | 2
  },
  "tagConfidence": "low" | "mid" | "high",
  "tagSchemaVersion": 1
}`;

  const promptText = `この画像を解析してJSONで出力してください。"schema": 3 で出力。品名は固有名詞もOKの名詞のみ、コメントは品名と切り離した自然な文章（長さは内容に応じて柔軟に、説教なし）でお願いします。JSONのみ出力。`;

  try {
    const res = await callAiProxy({
      kind: "food",
      text: promptText,
      systemInstruction: systemInstruction,
      images: [cleanBase64],
      wantJson: true
    });

    const raw = parseJSON<any>(res.answer);
    
    // スキーマに応じて共通形式 MealAnalysis に変換
    let normalized: MealAnalysis;

    if (raw.schema === 3) {
      // 新形式 (schema:3)
      const isNonFoodCat = raw.cat === 'non_food' || raw.cat === 'blocked';
      const isFood = raw.isFood && !isNonFoodCat;
      
      normalized = {
        menuName: raw.name || "不明な料理",
        numericCalories: normalizeKcal(raw.kcal, isFood),
        comment: (typeof raw.note === "string" && raw.note.trim() ? raw.note.trim() : typeof raw.comment === "string" && raw.comment.trim() ? raw.comment.trim() : typeof raw.advice === "string" && raw.advice.trim() ? raw.advice.trim() : typeof raw.memo === "string" && raw.memo.trim() ? raw.memo.trim() : ""),
        isFood: isFood,
        category: isNonFoodCat ? 'non_food' : 'food',
        pfcRatio: { p: 0, f: 0, c: 0 },
        foodGroups: raw.fg ? {
          vegetables: raw.fg.veg, fruits: raw.fg.fruit, mushrooms: raw.fg.mush, seaweed: raw.fg.seaweed,
          soyBeans: raw.fg.soy, fishSeafood: raw.fg.fish, dairy: raw.fg.dairy, nutsSeeds: raw.fg.nuts, wholeGrains: raw.fg.grain
        } : undefined,
        microBalance: raw.micro ? {
          vitamin: raw.micro.vit, mineral: raw.micro.min, fiber: raw.micro.fiber
        } : undefined,
        tagConfidence: raw.conf,
        tagSchemaVersion: 3
      };
    } else {
      // 旧形式 (既存ロジックを移植)
      if (raw.ok === false || raw.error) {
        throw new Error(raw.error?.message || "解析エラーが発生しました");
      }
      
      let numericCalories: number | undefined = undefined;
      if (typeof raw.numericCalories === 'number' && !isNaN(raw.numericCalories)) {
        numericCalories = Math.round(raw.numericCalories);
      } else if (typeof raw.numericCalories === 'string') {
        const parsed = parseFloat(raw.numericCalories);
        if (!isNaN(parsed)) {
          numericCalories = Math.round(parsed);
        }
      }
      
      const nonFoodKeywords = ['イラスト', 'マスコット', '絵', 'キャラクター', 'サンプル', 'ぬいぐるみ', 'おもちゃ', '解析不能'];
      const isDetectedAsNonFood = nonFoodKeywords.some(keyword => 
        (raw.menuName && raw.menuName.includes(keyword)) || 
        (raw.comment && raw.comment.includes(keyword))
      );

      let isFood = typeof raw.isFood === 'boolean' ? raw.isFood : true;

      if (isDetectedAsNonFood || (numericCalories === 0 && !isFood)) {
        numericCalories = 0;
        isFood = false; 
      }

      const pfcRatio = raw.pfcRatio || { p: 0, f: 0, c: 0 };
      const isUnanalyzable = raw.menuName === "解析できません";
      let finalComment = (isUnanalyzable || !isFood) ? (raw.comment || "") : (raw.comment || "今日も美味しくいただきましょう！");
      finalComment = finalComment.replace(/^(コメント|解説|感想)[:：]\s*/, "").trim();

      let finalMenuName = raw.menuName || "不明な料理";
      let category = raw.category;

      if (finalMenuName === "非食品" || finalMenuName === "対象外" || category === "blocked") {
        finalMenuName = "解析できません"; 
        category = "blocked";
      }

      if (!category) {
        if ((numericCalories ?? 0) > 0) category = "food";
        else if (finalMenuName === "解析できません") category = "blocked";
        else category = "non_food";
      }

      normalized = {
        menuName: finalMenuName,
        numericCalories: numericCalories,
        pfcRatio: {
          p: typeof pfcRatio.p === 'number' ? pfcRatio.p : 0,
          f: typeof pfcRatio.f === 'number' ? pfcRatio.f : 0,
          c: typeof pfcRatio.c === 'number' ? pfcRatio.c : 0,
        },
        comment: finalComment,
        isFood: isFood,
        category: category as 'food' | 'non_food' | 'blocked',
        mealType: 'lunch',
        foodGroups: raw.foodGroups,
        microBalance: raw.microBalance,
        tagConfidence: raw.tagConfidence,
        tagSchemaVersion: raw.tagSchemaVersion
      };
    }

    return normalized;
  } catch (error: any) {
    console.error("Meal analysis error:", error);
    return {
      menuName: "解析失敗",
      numericCalories: undefined,
      pfcRatio: { p: 0, f: 0, c: 0 },
      comment: "うまく見えなかったみたい。明るい場所でもう一度撮ってみてね！",
      isFood: false,
      mealType: 'lunch'
    };
  }
};
