
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface PhotoResult {
  base64?: string;
  webPath?: string;
  mimeType: string;
  format: string;
  source: 'camera' | 'file';
  width: number;
  height: number;
}

const MAX_LONG_SIDE = 768; 
const COMPRESS_QUALITY = 0.5;

/**
 * 共通前処理関数: Blob または File を受け取り、リサイズ・圧縮して Base64 を返す
 */
/**
 * 共通前処理関数: Blob または File を受け取り、リサイズ・圧縮して Base64 を返す
 */
export const processBlobToBase64 = async (blob: Blob): Promise<string> => {
    let imageBitmap: ImageBitmap | null = null;
    let url: string | null = null;

    // Strategy 1: createImageBitmap
    try {
        console.log("processBlobToBase64: Trying Strategy 1: createImageBitmap");
        imageBitmap = await createImageBitmap(blob);
    } catch (e1) {
        console.warn("processBlobToBase64: Strategy 1 failed", e1);

        // Strategy 2: URL.createObjectURL + Image.decode()
        try {
            console.log("processBlobToBase64: Trying Strategy 2: ObjectURL + Image");
            url = URL.createObjectURL(blob);
            const img = new Image();
            img.src = url;
            await img.decode();
            imageBitmap = await createImageBitmap(img);
        } catch (e2) {
            console.warn("processBlobToBase64: Strategy 2 failed", e2);

            // Strategy 3: FileReader + DataURL + Image
            try {
                console.log("processBlobToBase64: Trying Strategy 3: FileReader + DataURL");
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });

                const img = new Image();
                img.src = dataUrl;
                await img.decode();
                imageBitmap = await createImageBitmap(img);
            } catch (e3) {
                console.error("processBlobToBase64: All strategies failed", e3);
                throw new Error("画像の読み込みに失敗しました。撮り直しや別の写真をお試しください。");
            }
        } finally {
            if (url) URL.revokeObjectURL(url);
        }
    }

    if (!imageBitmap) throw new Error("画像デコードに失敗しました。");

    // リサイズ処理 (共有化)
    let width = imageBitmap.width;
    let height = imageBitmap.height;

    // リサイズ計算
    if (width > height) {
        if (width > MAX_LONG_SIDE) {
            height = Math.round((height * MAX_LONG_SIDE) / width);
            width = MAX_LONG_SIDE;
        }
    } else {
        if (height > MAX_LONG_SIDE) {
            width = Math.round((width * MAX_LONG_SIDE) / height);
            height = MAX_LONG_SIDE;
        }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) {
        imageBitmap.close();
        throw new Error("Canvas context creation failed");
    }

    ctx.drawImage(imageBitmap, 0, 0, width, height);
    imageBitmap.close(); // メモリ解放

    const dataUrl = canvas.toDataURL('image/jpeg', COMPRESS_QUALITY);
    return dataUrl.split(',')[1];
};

export const processPhotoResultToBase64 = async (result: PhotoResult): Promise<string> => {
  if (result.base64) return result.base64;
  if (!result.webPath) throw new Error("No image source available");
  const response = await fetch(result.webPath);
  const blob = await response.blob();
  return processBlobToBase64(blob);
};

export const takePhoto = async (source: CameraSource = CameraSource.Prompt, direction: 'front' | 'rear' = 'rear'): Promise<PhotoResult> => {
  if (Capacitor.isNativePlatform()) {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: source,
        direction: direction === 'front' ? CameraDirection.Front : CameraDirection.Rear,
        correctOrientation: true,
        width: 768,
      });

      const imagePath = image.webPath;
      if (!imagePath) throw new Error("No image path available");

      return {
        webPath: imagePath,
        mimeType: 'image/jpeg',
        format: 'jpeg',
        source: 'camera',
        width: 0,
        height: 0
      };
    } catch (e: any) {
      if (e.message?.includes("User cancelled") || e.message === "CANCELLED") {
         throw new Error("CANCELLED");
      }
      throw new Error(`Camera Error: ${e.message}`);
    }
  } else {
    // Web環境でのフォールバック: input type="file" を使用
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none'; // 表示させない
      
      if (source === CameraSource.Camera) {
          input.capture = direction === 'rear' ? 'environment' : 'user';
      }

      const cleanup = () => {
          if (document.body.contains(input)) {
            document.body.removeChild(input);
          }
      };

      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        cleanup();
        
        if (!file) {
          reject(new Error("CANCELLED"));
          return;
        }

        const objectUrl = URL.createObjectURL(file);
        resolve({
          webPath: objectUrl,
          mimeType: file.type || 'image/jpeg',
          format: file.type?.split('/')[1] || 'jpeg',
          source: source === CameraSource.Camera ? 'camera' : 'file',
          width: 0,
          height: 0
        });
      };

      input.onerror = () => {
        cleanup();
        reject(new Error("File input error"));
      };
      
      document.body.appendChild(input);
      input.click();
      
      // ユーザーがキャンセルする場合を想定し、フォーカス戻りで後始末
      window.addEventListener('focus', () => { setTimeout(cleanup, 500); }, { once: true });
    });
  }
};

/**
 *画像をブラウザでダウンロードするヘルパー (Web用)
 */
export const downloadImageWeb = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};
