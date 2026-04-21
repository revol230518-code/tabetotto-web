import { App as CapacitorApp, RestoredListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { STORAGE_KEY_PENDING_CAPTURE, STORAGE_KEY_TEMP_FRONT_IMAGE } from '../utils';

export interface PendingCaptureState {
  captureKind: 'meal' | 'posture';
  postureStep: 'front' | 'side' | null;
  startedAt: number;
  currentView: string;
  requestId: string;
  restoreStatus: 'pending';
}

export const savePendingCapture = (state: PendingCaptureState) => {
  try {
    localStorage.setItem(STORAGE_KEY_PENDING_CAPTURE, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save pending capture', e);
  }
};

export const getPendingCapture = (): PendingCaptureState | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PENDING_CAPTURE);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to get pending capture', e);
    return null;
  }
};

export const clearPendingCapture = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_PENDING_CAPTURE);
  } catch (e) {
    console.error('Failed to clear pending capture', e);
  }
};

export const saveTempFrontImage = (base64: string) => {
  try {
    localStorage.setItem(STORAGE_KEY_TEMP_FRONT_IMAGE, base64);
  } catch (e) {
    console.error('Failed to save temp front image', e);
  }
};

export const getTempFrontImage = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY_TEMP_FRONT_IMAGE);
  } catch (e) {
    console.error('Failed to get temp front image', e);
    return null;
  }
};

export const clearTempFrontImage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_TEMP_FRONT_IMAGE);
  } catch (e) {
    console.error('Failed to clear temp front image', e);
  }
};

export const setupCameraRecovery = (
  onRestore: (result: RestoredListenerEvent, pendingState: PendingCaptureState) => void
) => {
  if (Capacitor.getPlatform() !== 'android') return () => {};

  const listener = CapacitorApp.addListener('appRestoredResult', (data: RestoredListenerEvent) => {
    console.log('camera:restore:start', data);
    const pendingState = getPendingCapture();
    
    if (pendingState) {
      if (data.pluginId === 'Camera' && data.methodName === 'getPhoto' && data.success) {
        console.log('camera:restore:success');
        onRestore(data, pendingState);
      } else {
        console.error('camera:restore:fail', data.error);
        clearPendingCapture();
      }
    } else {
      console.log('camera:restore:ignored (no pending state)');
    }
  });

  return () => {
    listener.then(l => l.remove());
  };
};
