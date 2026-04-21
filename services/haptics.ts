import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { UserProfile } from '../types';

export { ImpactStyle };

const STORAGE_KEY_USER = "tabetotto_user";

export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    let hapticsEnabled = true; // デフォルトはON

    if (userStr) {
      try {
        const user: UserProfile = JSON.parse(userStr);
        if (user.hapticsEnabled !== undefined) {
          hapticsEnabled = user.hapticsEnabled;
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }

    if (hapticsEnabled) {
      await Haptics.impact({ style });
    }
  } catch (e) {
    console.warn('Haptics failed', e);
  }
};
