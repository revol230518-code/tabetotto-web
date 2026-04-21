
import { PostureAnalysis } from "../../types";
import { callAiProxy, parseJSON } from "./client";

/**
 * たべとっと。 姿勢解析サービス (v4.6 イラスト・非人物判定強化版)
 */
export const analyzePosture = async (
  frontImage: string, 
  sideImage: string | null
): Promise<PostureAnalysis> => {
  const cleanBase64 = (b64: string) => b64.replace(/^data:image\/[a-z]+;base64,/, "").trim();

  const images = [cleanBase64(frontImage)];
  if (sideImage) {
    images.push(cleanBase64(sideImage));
  }

  // 1枚の場合と2枚の場合でコンテキストを切り替え
  const postureContext = sideImage 
    ? "画像は最大2枚（1枚目:正面、2枚目:側面）送られます。" 
    : "正面1枚からの解析です。";

  const systemInstruction = `あなたは厳格かつユーモアのある姿勢・体型解析AIです。
${postureContext}

【最重要ルール：非実写・人間以外はユーモアで返す】
まず、画像が「実在する人間の写真」か、それ以外（イラスト・アニメ・人形・動物・物体など）」かを見極めてください。
画像が以下に該当する場合、**絶対に真面目な姿勢評価をしてはいけません**。
代わりに、**isAnalyzableをfalseにし、対象物に合わせたユーモアのあるコメント**を返してください。

1. **イラスト・アニメ・絵画・アイコン**（たとえリアルな絵でも、写真でなければNG）
2. **マネキン・フィギュア・ぬいぐるみ・ロボット**
3. **動物**（猫や犬など）
4. **ただの家具や風景、物体**
5. **PCやスマホの画面を撮影したもの**

【姿勢評価の注意点（重要）】
ユーザーは自撮りや鏡越しで撮影していることが多いため、スマホを見るために顔が前に出たり、カメラの角度によって猫背に見えたりする場合があります。
明らかな不良姿勢でない限り、「顔が前に出ている（ストレートネック）」「猫背」といった指摘は控えめにし、全体的なバランスや他の良い点（肩の水平、足の立ち方など）も評価してください。

【出力JSON形式】
Markdownタグは不要です。必ず以下のJSONのみを出力してください。

{
  "isAnalyzable": boolean, // 人間の写真ならtrue, イラストや物体ならfalse
  "postureLevel": number, // 1(悪い) 〜 5(良い)。対象外の場合は 0
  "comment": string // 解析結果、または対象外の場合のユーモアのある返答
}

【回答例：対象外の場合】
- アニメ画像 -> "comment": "二次元の住人は姿勢が完璧すぎて、私の出る幕がありません！✨"
- 猫の画像 -> "comment": "見事な猫背ですね！でも猫ちゃんはそれが正常なのでOKです🐈"
- 椅子の画像 -> "comment": "とても座り心地が良さそうですが、背骨が見当たらないので解析できません🪑"
- ガンダムのプラモ -> "comment": "メカの姿勢制御は専門外です！メンテナンスドックへどうぞ🤖"

【回答例：人間の写真の場合】
- "isAnalyzable": true
- "postureLevel": 3
- "comment": "少し右肩が下がっています。バッグをいつも同じ側で持っていませんか？"
`;

  const promptText = `この画像を判定・解析してください。人間以外（イラストや物体）の場合はユーモアで返してください。JSONのみ出力。`;

  try {
    const res = await callAiProxy({
      kind: "posture", 
      text: promptText,
      systemInstruction: systemInstruction,
      images: images,
      model: "gemini-2.5-flash-lite",
      wantJson: true
    });

    const raw = parseJSON<any>(res.answer);
    
    // server.js 側のエラーチェック
    if (raw.ok === false || raw.error) {
      throw new Error(raw.error?.message || "解析エラー");
    }

    // AIが「解析不可（非人物）」と判断した場合
    if (raw.isAnalyzable === false) {
       return {
         isAnalyzable: false, // ここをfalseにすることで、UI側で「解析できませんでした」扱いになる
         level: 'CHECK',
         point: raw.comment || "人物の写真が見当たりませんでした。",
         errorReason: raw.comment // エラー理由としてユーモアコメントを表示させる
       };
    }

    // --- ここからは解析成功（人物）の場合 ---

    // レベルマッピングのロジック
    // 2.5-flash-liteは厳しめに出る傾向があるため、少し補正
    let levelMapping: 'OK' | 'CAUTION' | 'CHECK' = 'CHECK';
    
    // 数値が入っていない場合のガード
    const levelScore = typeof raw.postureLevel === 'number' ? raw.postureLevel : 3;

    if (levelScore >= 4) levelMapping = 'OK';
    else if (levelScore >= 2) levelMapping = 'CAUTION';

    return {
      isAnalyzable: true,
      level: levelMapping,
      point: raw.comment || "素晴らしい記録です！この調子で続けていきましょう。",
    };
  } catch (error) {
    console.error("Posture analysis error:", error);
    return {
      isAnalyzable: false,
      level: 'CHECK',
      point: "うまく見えなかったみたい。明るい場所でもう一度撮ってみてね！",
    };
  }
};
