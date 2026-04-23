
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
export const processBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

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
        reject(new Error("Canvas context creation failed"));
        return;
      }
      
      try {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', COMPRESS_QUALITY);
        const base64 = dataUrl.split(',')[1];
        canvas.width = 0;
        canvas.height = 0;
        resolve(base64);
      } catch (e) {
        reject(e);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image from blob"));
    };
    
    img.src = objectUrl;
  });
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
      if (source === CameraSource.Camera) {
          input.capture = direction === 'rear' ? 'environment' : 'user';
      }

      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
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

      input.onerror = () => reject(new Error("File input error"));
      
      // キャンセル検知（一部のブラウザでは難しいが、フォーカス戻りで判定する等）
      window.addEventListener('focus', () => {
        setTimeout(() => {
          if (!input.value) {
            // reject(new Error("CANCELLED")); // 厳密にやると誤爆するので、今回は明示的なエラーに任せる
          }
        }, 1000);
      }, { once: true });

      input.click();
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
