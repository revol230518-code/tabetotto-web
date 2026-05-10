
import React from 'react';
import { Capacitor } from '@capacitor/core';

interface AdProps {
    className?: string;
    slot?: 'banner' | 'mrec';
}

/**
 * WebAdUnit: 
 * AdSense等のWeb向け広告を表示するコンポーネント。
 * 手動広告ユニットを配置するためのコンテナを提供します。
 */
export const WebAdUnit: React.FC<AdProps> = ({ className, slot = 'banner' }) => {
    const isNative = Capacitor.isNativePlatform();
    if (isNative) return null;

    return (
        <div className={`flex flex-col items-center justify-center my-8 overflow-hidden bg-stone-50/50 rounded-2xl border border-dashed border-stone-200 min-h-[100px] ${className}`}>
            <span className="text-[10px] text-stone-300 font-black tracking-widest mb-2 uppercase">Advertisement</span>
            <div className="w-full flex justify-center">
                <div 
                    className="adsbygoogle"
                    style={{ 
                        display: 'block', 
                        textAlign: 'center',
                        width: '100%',
                        minWidth: '250px',
                        minHeight: slot === 'mrec' ? '250px' : '100px'
                    }}
                    data-ad-client="ca-pub-3081007845343649"
                    data-ad-slot={slot === 'mrec' ? '1234567890' : '0987654321'}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                />
            </div>
        </div>
    );
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
