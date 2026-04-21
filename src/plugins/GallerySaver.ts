
import { registerPlugin } from '@capacitor/core';

export interface GallerySaverPlugin {
  saveImage(options: {
    base64: string;
    fileName: string;
    album?: string;
  }): Promise<{ saved: boolean; uri?: string; error?: string }>;
}

export const GallerySaver = registerPlugin<GallerySaverPlugin>('GallerySaver');
