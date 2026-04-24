
import React from 'react';
import { Capacitor } from '@capacitor/core';

interface AdProps {
    className?: string;
    slot?: 'banner' | 'mrec';
}

/**
 * WebAdUnit: 
 * AdSense等のWeb向け広告を表示するコンポーネント。
 */
export const WebAdUnit: React.FC<AdProps> = () => {
    return null;
};

/**
 * AdBelt: 
 * Native環境: AdMobバナーが画面最下部に固定されるため、コンテンツが隠れないよう透明なスペーサーを配置します。
 * Web環境: 非表示（AdSense自動広告に任せる）
 */
export const AdBelt: React.FC<AdProps> = () => {
    const isNative = Capacitor.isNativePlatform();
    
    if (isNative) {
        return <div style={{ width: '100%', height: '80px', backgroundColor: 'transparent', flexShrink: 0 }} aria-hidden="true" />;
    }

    return null;
};

/**
 * NativeAdCard:
 * Web: 非表示（AdSense自動広告に任せる）
 * Native: 非表示（HistoryView等での不要な表示を避ける）
 */
export const NativeAdCard: React.FC<AdProps> = () => {
    return null;
};
