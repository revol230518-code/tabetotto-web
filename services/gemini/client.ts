
/**
 * たべとっと。 AI Proxy Client (v2.2.3 Multi-Image Support)
 */

const DEFAULT_PROXY_BASE = 'https://tabetotto-ai-proxy-reset-973912868650.asia-northeast1.run.app';
const BASE_ORIGIN = ((import.meta as any).env?.VITE_API_BASE_URL ?? DEFAULT_PROXY_BASE).trim().replace(/\/+$/, "");
export const CLOUD_RUN_CHAT_URL = `${BASE_ORIGIN}/v1/ai/chat`;

const PREFERRED_MODEL = "gemini-2.5-flash-lite";

/**
 * 堅牢なJSONパース: Markdownタグや余計なテキストを除去して解析
 */
export const parseJSON = <T>(text: string): T => {
  if (!text || typeof text !== 'string') {
    throw new Error("解析データが空です");
  }

  try {
    // 1. Markdownのコードブロック（```json ... ```）があれば中身を抽出
    let jsonContent = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    // 2. 制御文字などの不可視文字を削除してクリーンアップ
    const cleaned = jsonContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch (e: any) {
    console.error("[AI Parse Error] Data Preview:", text.substring(0, 100));
    throw new Error("解析データの形式が正しくありません (Invalid JSON)");
  }
};

export interface CallAiProxyParams {
  text: string;
  kind?: "food" | "meal" | "posture" | "pose" | "home" | "comment" | "cheer";
  systemInstruction?: string;
  model?: string;
  images?: string[]; 
  responseMimeType?: string;
  wantJson?: boolean;
  signal?: AbortSignal;
}

export const callAiProxy = async (params: CallAiProxyParams, retries = 1): Promise<{ answer: string; image?: string }> => {
  if (!window.navigator.onLine) {
    throw new Error("ネットワークに接続されていません。");
  }

  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const combinedSignal = params.signal;
    // タイムアウトを90秒に延長 (複数画像のアップロード・解析時間を考慮)
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const payload = {
        kind: params.kind || "home",
        text: params.text,
        // 後方互換性のため imageBase64 も残すが、サーバー側が images 配列に対応していればそちらを優先させる想定
        imageBase64: params.images && params.images.length > 0 ? params.images[0] : undefined,
        images: params.images, // ここで全画像を配列として送信
        mimeType: params.responseMimeType || "image/jpeg",
        wantJson: params.wantJson ?? (["food", "meal", "posture", "pose"].includes(params.kind || "")),
        model: params.model ?? PREFERRED_MODEL,
        systemInstruction: params.systemInstruction // systemInstructionも明示的に送信
      };

      const response = await fetch(CLOUD_RUN_CHAT_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: combinedSignal || controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Proxy error (${response.status})`);
      }

      const data = await response.json();
      
      if (!data || typeof data.answer !== 'string') {
        throw new Error("サーバーからの応答形式が不正です");
      }

      return { answer: data.answer, image: data.image };

    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') throw new Error("解析がタイムアウトしました。画像のサイズが大きいか、電波が不安定な可能性があります。");
      
      if (i < retries) {
        console.warn(`Retry ${i + 1}/${retries} due to error:`, error);
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }
      throw error;
    }
  }
  throw new Error("通信に失敗しました");
};

export const testAiConnection = async (): Promise<string> => {
  try {
    const res = await callAiProxy({ text: "Say OK", kind: "home", wantJson: false });
    return res.answer;
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
};

export const isApiKeyValid = (): { valid: boolean; reason?: string } => ({ valid: true });
export const getCurrentModelName = () => PREFERRED_MODEL;
