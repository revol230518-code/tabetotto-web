import { Preferences } from '@capacitor/preferences';
import { STORAGE_KEY_PENDING_SHARE } from '../utils';

export interface PendingShareState {
  shareKind: 'meal-direct' | 'share-preview';
  currentView: string;
  recordDate: string | null;
  selectedMealDate: string | null;
  selectedMealIndex: number | null;
  shareModalOpen: boolean;
  startedAt: number;
  requestId: string;
  restoreStatus: 'pending';
}

export const savePendingShare = async (state: PendingShareState) => {
  try {
    await Preferences.set({ key: STORAGE_KEY_PENDING_SHARE, value: JSON.stringify(state) });
  } catch (e) {
    console.error('Failed to save pending share', e);
  }
};

export const getPendingShare = async (): Promise<PendingShareState | null> => {
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEY_PENDING_SHARE });
    if (!value) return null;
    
    const parsed = JSON.parse(value) as PendingShareState;
    
    // Check if stale (e.g., older than 10 minutes)
    if (Date.now() - parsed.startedAt > 10 * 60 * 1000) {
      await clearPendingShare();
      return null;
    }
    
    return parsed;
  } catch (e) {
    console.error('Failed to get pending share', e);
    return null;
  }
};

export const clearPendingShare = async () => {
  try {
    await Preferences.remove({ key: STORAGE_KEY_PENDING_SHARE });
  } catch (e) {
    console.error('Failed to clear pending share', e);
  }
};
