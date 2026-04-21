import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export const prepareShareFile = async (blob: Blob, prefix: string): Promise<string | null> => {
  if (!Capacitor.isNativePlatform()) return null;
  const startTime = Date.now();
  console.log(`share:file:prepare:start | prefix: ${prefix}`);
  try {
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const base64data = await base64Promise;
    const fileName = `${prefix}_${Date.now()}.jpg`;

    await Filesystem.writeFile({
      path: fileName,
      data: base64data,
      directory: Directory.Cache,
    });

    const { uri } = await Filesystem.getUri({
      directory: Directory.Cache,
      path: fileName,
    });
    const elapsed = Date.now() - startTime;
    console.log(`share:file:prepare:success | uri: ${uri} | elapsed: ${elapsed}ms`);
    return uri;
  } catch (e) {
    console.error('share:file:prepare:fail', e);
    return null;
  }
};

export const prepareShareFileFromUri = async (sourceUri: string, prefix: string): Promise<string | null> => {
  if (!Capacitor.isNativePlatform()) return null;
  const startTime = Date.now();
  console.log(`share:file:prepareFromUri:start | source: ${sourceUri}`);
  try {
    const fileName = `${prefix}_${Date.now()}.jpg`;
    
    // Copy file to cache to ensure it's shareable
    await Filesystem.copy({
      from: sourceUri,
      to: fileName,
      toDirectory: Directory.Cache
    });

    const { uri } = await Filesystem.getUri({
      directory: Directory.Cache,
      path: fileName,
    });
    const elapsed = Date.now() - startTime;
    console.log(`share:file:prepareFromUri:success | uri: ${uri} | elapsed: ${elapsed}ms`);
    return uri;
  } catch (e) {
    console.error('share:file:prepareFromUri:fail', e);
    return null;
  }
};

export const cleanupShareFile = async (uri: string | null) => {
  if (!uri || !Capacitor.isNativePlatform()) return;
  console.log('share:cleanup:start', uri);
  try {
    const fileName = uri.split('/').pop();
    if (fileName) {
      await Filesystem.deleteFile({
        path: fileName,
        directory: Directory.Cache,
      });
      console.log('share:cleanup:done', fileName);
    }
  } catch (e) {
    console.error('share:cleanup:fail', e);
  }
};
