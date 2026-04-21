
import React from 'react';
import { Capacitor } from '@capacitor/core';
import { webAdService } from '../services/webAdService';

interface AdProps {
    className?: string;
    slot?: 'banner' | 'mrec';
}

/**
 * WebAdUnit: 
 * AdSense等のWeb向け広告を表示するコンポーネント。
 * 設定がない場合や、表示禁止Viewの場合はプレースホルダーを表示します。
 */
export const WebAdUnit: React.FC<AdProps> = ({ className = "", slot = 'banner' }) => {
    const isNative = Capacitor.isNativePlatform();
    if (isNative) return null;

    const config = webAdService.getConfig();
    const hasConfig = !!config.publisherId && !!config.slots[slot];

    // 本番環境かつ設定がある場合は実際のタグを出力 (今回は土台のみ)
    // Reactでscriptタグを扱う場合、dangerouslySetInnerHTML等が必要になるが、
    // 審査前は「広告枠」が見えることが重要。
    
    return (
        <div className={`web-ad-container my-4 flex flex-col items-center overflow-hidden ${className}`}>
            <div className="text-[8px] text-stone-300 font-black mb-1 uppercase tracking-widest">Sponsored</div>
            <div 
                className={`flex items-center justify-center rounded-xl transition-all border-2 border-dashed border-stone-200 bg-stone-50 overflow-hidden relative`}
                style={{ 
                    width: slot === 'banner' ? '100%' : '300px',
                    maxWidth: slot === 'banner' ? '320px' : '300px',
                    height: slot === 'banner' ? '50px' : '250px' 
                }}
            >
                {hasConfig ? (
                    <div className="flex flex-col items-center gap-1 opacity-40">
                         <div className="text-[10px] font-black text-rose-300 animate-pulse">AdSense Active</div>
                         <div className="text-[8px] text-stone-400 font-mono">{config.slots[slot]}</div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1 opacity-20">
                        <div className="w-8 h-8 rounded-full border-2 border-stone-300 flex items-center justify-center text-stone-400">?</div>
                        <span className="text-[8px] font-black uppercase text-stone-400">Waiting for AdSense</span>
                    </div>
                )}
                
                {/* 装飾用ドット */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(black 1px, transparent 1px)', backgroundSize: '8px 8px' }}>
                </div>
            </div>
        </div>
    );
};

/**
 * AdBelt: 
 * Native環境: AdMobバナーが画面最下部に固定されるため、コンテンツが隠れないよう透明なスペーサーを配置します。
 * Web環境: デザインされた広告帯またはWebAdUnitを表示します。
 */
export const AdBelt: React.FC<AdProps> = ({ className = "" }) => {
    const isNative = Capacitor.isNativePlatform();
    
    if (isNative) {
        return <div style={{ width: '100%', height: '80px', backgroundColor: 'transparent', flexShrink: 0 }} aria-hidden="true" />;
    }

    // Web用表示 (下部バナー)
    return (
        <div className={`ad-banner-belt ${className} pb-safe`}>
            <WebAdUnit slot="banner" />
        </div>
    );
};

/**
 * NativeAdCard:
 * Web: WebAdUnit(MREC)を表示
 * Native: Webプレビュー用プレースホルダーを表示
 */
export const NativeAdCard: React.FC<AdProps> = ({ className = "" }) => {
    return (
        <div className={`w-full p-4 rounded-[24px] bg-white border-2 border-rose-50 relative overflow-hidden shadow-sm ${className}`}>
             <div className="absolute top-0 left-0 bg-[#F88D8D] text-white text-[9px] font-black px-2 py-0.5 rounded-br-xl z-10 shadow-sm">
                広告
            </div>
            
            <div className="flex flex-col items-center">
                <WebAdUnit slot="mrec" />
                <div className="flex gap-3 items-center w-full px-2">
                    <div className="w-8 h-8 bg-rose-50 rounded-lg shrink-0 flex items-center justify-center">
                         <div className="w-1/2 h-1/2 bg-rose-200 rounded-sm"></div>
                    </div>
                    <div className="flex-1 space-y-1">
                        <div className="h-2 w-3/4 bg-stone-100 rounded-full"></div>
                        <div className="h-1.5 w-1/2 bg-stone-50 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
