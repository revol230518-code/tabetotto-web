
import React from 'react';
import { AlertCircle, CalendarPlus, Share2, Trash2, Check, Download, Loader2, Scan, Link as LinkIcon, Utensils, ArrowLeftRight, Columns, Maximize, FileText, Smile, Meh, Frown, Info } from 'lucide-react';
import { PostureAnalysis, MealAnalysis, DailyRecord, PostureComparison } from '../types';
import { Modal, Button } from './UIComponents';
import { MEAL_TYPE_LABELS, generateShareImageBlob, addToCalendar, resolveMealImageSrc, PFC_COLORS } from '../utils';
import { detectPose, drawPoseOnCanvas } from '../services/poseService';
import { THEME } from '../theme';
import { OFFICIAL_MASCOT_SRC } from '../constants/mascot';
import { Capacitor } from '@capacitor/core';
import { executeShare, executeDownload } from '../utils/share';
import { isIOS } from '../utils/platform';
import { hideBanner, showBanner, hideMrec } from '../services/admobService';

// --- Micro Components for Meal Detail ---
const PfcDonutChart = ({ pfcRatio }: { pfcRatio: { p: number, f: number, c: number } }) => {
  const total = pfcRatio.p + pfcRatio.f + pfcRatio.c;
  if (total === 0) return null;

  const pPct = pfcRatio.p / total;
  const fPct = pfcRatio.f / total;
  const cPct = pfcRatio.c / total;

  const size = 110;
  const stokeWidth = 14;
  const radius = (size - stokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const fOffset = pPct * circumference;
  const cOffset = (pPct + fPct) * circumference;

  return (
    <div className="p-4 rounded-2xl border-2 bg-transparent shadow-none flex flex-col items-center justify-center gap-3 shrink-0 min-w-[200px]" style={{ borderColor: 'transparent' }}>
        <div className="flex items-center gap-1.5 text-[12px] font-black text-stone-500 w-full justify-center">
            <Utensils size={14} />
            <span>PFCバランス傾向</span>
        </div>
      <div className="flex flex-row items-center justify-center gap-6 mt-1 w-full">
        {/* 円グラフ */}
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 drop-shadow-sm">
            <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="#EAE6DF" strokeWidth={stokeWidth} />
            {pPct > 0 && <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke={PFC_COLORS.p} strokeWidth={stokeWidth} strokeDasharray={`${Math.max(0, pPct * circumference - 2.5)} ${circumference}`} strokeDashoffset={0} strokeLinecap="butt" />}
            {fPct > 0 && <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke={PFC_COLORS.f} strokeWidth={stokeWidth} strokeDasharray={`${Math.max(0, fPct * circumference - 2.5)} ${circumference}`} strokeDashoffset={-fOffset} strokeLinecap="butt" />}
            {cPct > 0 && <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke={PFC_COLORS.c} strokeWidth={stokeWidth} strokeDasharray={`${Math.max(0, cPct * circumference - 2.5)} ${circumference}`} strokeDashoffset={-cOffset} strokeLinecap="butt" />}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[12px] font-black text-stone-400 tracking-wider">PFC</span>
            </div>
        </div>
        
        {/* 縦並びのPFC数値 */}
        <div className="flex flex-col gap-2 text-[12px] font-black">
            <div className="flex items-center gap-3">
                <span style={{color: PFC_COLORS.p}}>P</span><span className="text-stone-600">{Math.round(pPct * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
                <span style={{color: PFC_COLORS.f}}>F</span><span className="text-stone-600">{Math.round(fPct * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
                <span style={{color: PFC_COLORS.c}}>C</span><span className="text-stone-600">{Math.round(cPct * 100)}%</span>
            </div>
        </div>
      </div>
    </div>
  );
};

const MicroBalanceGauge = ({ microBalance }: { microBalance: { vitamin: number, mineral: number, fiber: number } }) => {
    const items = [
        { label: "ビタミン", val: microBalance.vitamin, color: "#F59E0B" },
        { label: "ミネラル", val: microBalance.mineral, color: "#14B8A6" },
        { label: "食物繊維", val: microBalance.fiber, color: "#84CC16" }
    ];

    const getEvalText = (val: number) => val === 2 ? 'しっかり' : val === 1 ? 'ほどほど' : 'ひかえめ';
    const boxes = [1, 2, 3];

    return (
        <div className="p-4 rounded-2xl border-2 bg-transparent shadow-none space-y-3 shrink-0 min-w-[200px]" style={{ borderColor: 'transparent' }}>
            <div className="flex items-center gap-1.5 text-[12px] font-black text-stone-500 justify-center mb-1">
                <Info size={14} />
                <span>栄養の傾向</span>
            </div>
            {items.map((item, i) => {
                return (
                    <div key={i} className="flex items-center justify-between w-full gap-2">
                        <span className="text-[11px] font-bold text-stone-500 w-[55px] shrink-0 text-left">{item.label}</span>
                        <div className="flex gap-[4px] flex-1">
                            {boxes.map(b => {
                                let isLightOn = false;
                                let alpha = 1.0;

                                if (item.val === 0) {
                                    if (b === 1) { isLightOn = true; alpha = 0.25; }
                                } else if (item.val === 1) {
                                    if (b <= 2) { 
                                        isLightOn = true; 
                                        alpha = b === 1 ? 0.35 : 0.7; 
                                    }
                                } else if (item.val === 2) {
                                    isLightOn = true;
                                    alpha = b === 1 ? 0.35 : (b === 2 ? 0.7 : 1.0);
                                }

                                return (
                                    <div key={b} className="h-2 flex-1 rounded transition-colors" style={{ 
                                        backgroundColor: isLightOn ? item.color : '#EAE6DF',
                                        opacity: alpha 
                                    }}></div>
                                );
                            })}
                        </div>
                        <span className="text-[11px] font-black w-[50px] shrink-0 text-right" style={{ color: item.val > 0 ? item.color : '#a8a29e' }}>{getEvalText(item.val)}</span>
                    </div>
                );
            })}
        </div>
    );
};

// --- Posture Carousel ---
export const PostureResultCarousel: React.FC<{
    frontPhoto: string;
    sidePhoto?: string | null;
    analysis: PostureAnalysis;
}> = ({ frontPhoto, sidePhoto, analysis }) => {
    const [page, setPage] = React.useState(0);
    const maxPages = sidePhoto ? 3 : 2;
    const [showSkeleton, setShowSkeleton] = React.useState(false);
    const [isDetecting, setIsDetecting] = React.useState(false);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        let active = true;
        if (showSkeleton && (page === 1 || page === 2)) {
            const currentPhoto = page === 1 ? frontPhoto : (sidePhoto || '');
            if (!currentPhoto || !canvasRef.current) return;

            const img = new Image();
            img.src = `data:image/jpeg;base64,${currentPhoto}`;
            img.onload = async () => {
                if (!active) return;
                const canvas = canvasRef.current;
                if (!canvas) return;
                const container = canvas.parentElement;
                if (container) {
                    canvas.width = container.clientWidth;
                    canvas.height = container.clientHeight;
                }
                setIsDetecting(true);
                try {
                   const result = await detectPose(img);
                   if (active && result && result.landmarks && canvasRef.current) {
                       drawPoseOnCanvas(canvasRef.current.getContext('2d')!, result.landmarks, canvasRef.current.width, canvasRef.current.height);
                   }
                } catch(e) {
                    console.error("Pose detection error", e);
                } finally {
                   if (active) setIsDetecting(false);
                }
            };
        }
        return () => { active = false; };
    }, [showSkeleton, page, frontPhoto, sidePhoto]);

    return (
        <div className="relative group no-swipe">
             <div className="w-full aspect-[3/4] rounded-[30px] overflow-hidden relative border-4 border-white shadow-lg" style={{ backgroundColor: THEME.colors.appBg }}>
                {page === 0 && (
                    <div className="w-full h-full p-4 flex flex-col items-center justify-center relative animate-in fade-in" style={{ backgroundColor: THEME.colors.appBg }}>
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${THEME.colors.textLight} 1px, transparent 1px)`, backgroundSize: '16px 16px' }}></div>
                        <div className="w-full flex-1 flex gap-2 mb-4">
                            {sidePhoto ? (
                                <>
                                    <div className="flex-1 bg-white p-2 shadow-sm rounded-xl transform -rotate-2 border" style={{ borderColor: THEME.colors.border }}>
                                        <div className="w-full h-full bg-stone-100 rounded-lg overflow-hidden">
                                            <img src={`data:image/jpeg;base64,${frontPhoto}`} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white p-2 shadow-sm rounded-xl transform rotate-2 border mt-8" style={{ borderColor: THEME.colors.border }}>
                                        <div className="w-full h-full bg-stone-100 rounded-lg overflow-hidden">
                                            <img src={`data:image/jpeg;base64,${sidePhoto}`} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="w-3/4 mx-auto bg-white p-2 shadow-md rounded-xl transform rotate-1 border" style={{ borderColor: THEME.colors.border }}>
                                    <div className="w-full h-full bg-stone-100 rounded-lg overflow-hidden">
                                        <img src={`data:image/jpeg;base64,${frontPhoto}`} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-white/95 backdrop-blur-md rounded-full px-8 py-6 shadow-xl border-4 flex flex-col items-center justify-center relative z-10 transform -rotate-3" style={{ borderColor: analysis.level === 'OK' ? THEME.colors.posturePrimary : analysis.level === 'CAUTION' ? THEME.colors.readPrimary : THEME.colors.mealPrimary }}>
                            <span className="text-[10px] font-bold tracking-widest absolute top-2 uppercase" style={{ color: THEME.colors.mealPrimary }}>Posture Level</span>
                            <div className="flex items-baseline justify-center mt-2">
                                <span className="text-3xl font-black leading-none" style={{ color: THEME.colors.textPrimary }}>{analysis.level}</span>
                            </div>
                        </div>
                    </div>
                )}
                {page === 1 && (
                    <div className="w-full h-full relative animate-in fade-in">
                         <img src={`data:image/jpeg;base64,${frontPhoto}`} className="w-full h-full object-cover" />
                         {/* Mascot Overlay */}
                         <div className="absolute -top-2 -left-2 w-24 h-24 z-20 pointer-events-none motion-safe:animate-breathe-subtle">
                             <img src={OFFICIAL_MASCOT_SRC} className="w-full h-full object-contain drop-shadow-md" alt="Mascot" />
                         </div>
                         {showSkeleton && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />}
                         {isDetecting && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
                                 <Loader2 className="animate-spin text-white" />
                             </div>
                         )}
                    </div>
                )}
                {page === 2 && sidePhoto && (
                    <div className="w-full h-full relative animate-in fade-in">
                         <img src={`data:image/jpeg;base64,${sidePhoto}`} className="w-full h-full object-cover" />
                         {/* Mascot Overlay */}
                         <div className="absolute -top-2 -left-2 w-24 h-24 z-20 pointer-events-none motion-safe:animate-breathe-subtle">
                             <img src={OFFICIAL_MASCOT_SRC} className="w-full h-full object-contain drop-shadow-md" alt="Mascot" />
                         </div>
                         {showSkeleton && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />}
                         {isDetecting && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
                                 <Loader2 className="animate-spin text-white" />
                             </div>
                         )}
                    </div>
                )}
                {(page === 1 || page === 2) && (
                    <button onClick={() => setShowSkeleton(!showSkeleton)} className={`absolute top-4 right-4 z-30 p-2 rounded-full backdrop-blur-md shadow-sm border transition-all ${showSkeleton ? 'text-white' : 'bg-white/50 border-white/50'}`} style={showSkeleton ? { backgroundColor: THEME.colors.mealPrimary, borderColor: THEME.colors.mealPrimary } : { color: THEME.colors.textPrimary }} title="骨格表示切り替え">
                        <Scan size={20} />
                    </button>
                )}
             </div>
             <div className="flex justify-center gap-2 mt-4">
                 {[...Array(maxPages)].map((_, i) => (
                     <button key={i} onClick={() => setPage(i)} className={`w-2 h-2 rounded-full transition-all ${page === i ? 'w-4' : ''}`} style={{ backgroundColor: page === i ? THEME.colors.mealPrimary : THEME.colors.border }} />
                 ))}
             </div>
        </div>
    );
}

// --- Compare Modal ---
export const CompareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentRecord: DailyRecord;
  records: Record<string, DailyRecord>;
  onSaveNote: (comparison: PostureComparison) => void;
}> = ({ isOpen, onClose, currentRecord, records, onSaveNote }) => {
  // モーダルが開いている間は全広告(バナー・MREC)を非表示にする
  React.useEffect(() => {
    if (isOpen) {
        hideBanner();
        hideMrec();
    } else if (Capacitor.isNativePlatform()) {
        showBanner();
    }
  }, [isOpen]);

  const [targetDate, setTargetDate] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'split' | 'before' | 'after'>('split');
  const [imageType, setImageType] = React.useState<'front' | 'side'>('front');
  
  // Note states
  const [feeling, setFeeling] = React.useState<'positive' | 'neutral' | 'negative' | 'none'>(currentRecord.postureComparison?.feeling || 'none');
  const [note, setNote] = React.useState(currentRecord.postureComparison?.note || '');
  const [isSaved, setIsSaved] = React.useState(false);

  // Initialize targets logic
  const candidates = React.useMemo(() => {
    const sorted = Object.keys(records).sort().reverse(); // Newest first
    const currentIndex = sorted.indexOf(currentRecord.date);
    
    // Anchor: 比較基準として設定されたデータ
    const anchorDate = sorted.find(d => records[d].isPostureComparisonAnchor && d !== currentRecord.date);

    // Previous: 直近の過去データ
    const prevDate = sorted.slice(currentIndex + 1).find(d => records[d].posturePhotoUrl);
    
    // First: 最古のデータ
    const reversed = [...sorted].reverse();
    const firstDate = reversed.find(d => records[d].posturePhotoUrl && d < currentRecord.date);

    // 3 Months Ago: 約90日前
    const targetTime = new Date(currentRecord.date).getTime() - (90 * 24 * 60 * 60 * 1000);
    const threeMonthDate = sorted.find(d => {
        const time = new Date(d).getTime();
        return time <= targetTime && records[d].posturePhotoUrl;
    }) || sorted.slice(currentIndex + 1).pop(); // なければ一番古いもの

    return { anchor: anchorDate, prev: prevDate, first: firstDate, threeMonth: threeMonthDate };
  }, [currentRecord, records]);

  React.useEffect(() => {
      if (isOpen) {
          if (candidates.anchor) setTargetDate(candidates.anchor);
          else if (candidates.prev) setTargetDate(candidates.prev);
          else if (candidates.first) setTargetDate(candidates.first);
          
          // Reset states
          setFeeling(currentRecord.postureComparison?.feeling || 'none');
          setNote(currentRecord.postureComparison?.note || '');
          setIsSaved(false);
          setViewMode('split');
          setImageType('front');
      }
  }, [isOpen, currentRecord, candidates]);

  if (!isOpen) return null;

  const targetRecord = targetDate ? records[targetDate] : null;
  const targetImage = imageType === 'front' ? targetRecord?.posturePhotoUrl : targetRecord?.postureSidePhotoUrl;
  const currentImage = imageType === 'front' ? currentRecord.posturePhotoUrl : currentRecord.postureSidePhotoUrl;
  const hasSideImages = !!(targetRecord?.postureSidePhotoUrl && currentRecord.postureSidePhotoUrl);

  // Calculate days diff
  const daysDiff = targetDate 
    ? Math.floor((new Date(currentRecord.date).getTime() - new Date(targetDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleToggleView = () => {
      if (viewMode === 'split') setViewMode('before');
      else if (viewMode === 'before') setViewMode('after');
      else setViewMode('split');
  };

  const handleSave = () => {
      if (!targetDate) return;
      onSaveNote({
          targetDate,
          feeling,
          note,
          createdAt: Date.now()
      });
      setIsSaved(true);
      setTimeout(() => onClose(), 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="姿勢を見比べる">
      <div className="space-y-6">
        {/* Presets */}
        <div className="flex bg-stone-100 p-1 rounded-xl">
             {candidates.anchor && (
                 <button 
                    onClick={() => candidates.anchor && setTargetDate(candidates.anchor)} 
                    disabled={!candidates.anchor}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${targetDate === candidates.anchor ? 'bg-white shadow-sm text-readPrimary' : 'text-stone-400'}`}
                    style={targetDate === candidates.anchor ? { color: THEME.colors.readPrimary } : {}}
                 >
                    基準
                 </button>
             )}
             <button 
                onClick={() => candidates.prev && setTargetDate(candidates.prev)} 
                disabled={!candidates.prev}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${targetDate === candidates.prev ? 'bg-white shadow-sm' : 'text-stone-400'}`}
                style={targetDate === candidates.prev ? { color: THEME.colors.readPrimary } : {}}
             >
                前回
             </button>
             <button 
                onClick={() => candidates.threeMonth && setTargetDate(candidates.threeMonth)} 
                disabled={!candidates.threeMonth}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${targetDate === candidates.threeMonth ? 'bg-white shadow-sm' : 'text-stone-400'}`}
                style={targetDate === candidates.threeMonth ? { color: THEME.colors.readPrimary } : {}}
             >
                3ヶ月前
             </button>
             <button 
                onClick={() => candidates.first && setTargetDate(candidates.first)} 
                disabled={!candidates.first}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${targetDate === candidates.first ? 'bg-white shadow-sm' : 'text-stone-400'}`}
                style={targetDate === candidates.first ? { color: THEME.colors.readPrimary } : {}}
             >
                初回
             </button>
        </div>

        {/* Comparison Viewer */}
        {targetRecord ? (
            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                     <div className="text-[10px] font-bold text-stone-500">
                        {targetDate?.replace(/-/g, '/')} <span className="mx-1">→</span> {currentRecord.date.replace(/-/g, '/')}
                     </div>
                     <div className="text-xs font-black bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                        経過: {daysDiff}日
                     </div>
                </div>

                {hasSideImages && (
                    <div className="flex justify-center gap-2 mb-2">
                        <button onClick={() => setImageType('front')} className={`text-[10px] px-3 py-1 rounded-full border ${imageType === 'front' ? 'bg-primary text-white border-primary' : 'bg-white text-stone-400 border-stone-200'}`}>正面</button>
                        <button onClick={() => setImageType('side')} className={`text-[10px] px-3 py-1 rounded-full border ${imageType === 'side' ? 'bg-primary text-white border-primary' : 'bg-white text-stone-400 border-stone-200'}`}>側面</button>
                    </div>
                )}

                <div className="relative w-full aspect-[4/3] bg-stone-50 rounded-2xl overflow-hidden border-2 border-stone-100 shadow-inner no-swipe">
                    {viewMode === 'split' && (
                        <div className="flex h-full w-full">
                            <div className="w-1/2 h-full border-r border-white relative">
                                <div className="absolute top-2 left-2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur-sm z-10">前回</div>
                                {targetImage ? (
                                    <img src={resolveMealImageSrc(targetImage)} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-300">画像なし</div>
                                )}
                            </div>
                            <div className="w-1/2 h-full relative">
                                <div className="absolute top-2 right-2 bg-primary/80 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur-sm z-10">今回</div>
                                {currentImage ? (
                                    <img src={resolveMealImageSrc(currentImage)} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-300">画像なし</div>
                                )}
                            </div>
                        </div>
                    )}
                    {viewMode === 'before' && (
                        <div className="w-full h-full relative animate-in fade-in">
                            <div className="absolute top-2 left-2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur-sm z-10">前回 (全画面)</div>
                            {targetImage ? (
                                <img src={resolveMealImageSrc(targetImage)} className="w-full h-full object-contain bg-stone-100" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-300">画像なし</div>
                            )}
                        </div>
                    )}
                    {viewMode === 'after' && (
                        <div className="w-full h-full relative animate-in fade-in">
                            <div className="absolute top-2 right-2 bg-primary/80 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur-sm z-10">今回 (全画面)</div>
                            {currentImage ? (
                                <img src={resolveMealImageSrc(currentImage)} className="w-full h-full object-contain bg-stone-100" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-300">画像なし</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <button 
                        onClick={handleToggleView}
                        className="btn-3d flex items-center gap-2 px-4 py-2 bg-white border-2 rounded-full shadow-sm transition-all"
                        style={{ borderColor: THEME.colors.border }}
                    >
                         {viewMode === 'split' ? <Columns size={16} className="text-stone-500" /> : <Maximize size={16} className="text-stone-500" />}
                         <span className="text-xs font-black text-stone-600">
                             表示切替: {viewMode === 'split' ? '左右' : viewMode === 'before' ? '前回' : '今回'}
                         </span>
                    </button>
                </div>
            </div>
        ) : (
            <div className="p-8 text-center text-stone-400 bg-stone-50 rounded-2xl border-2 border-dashed">
                比較できる過去の記録がありません
            </div>
        )}

        {/* Helper Message */}
        <div className="bg-[#FFF8F0] p-4 rounded-xl border border-[#FFE0B2] text-center">
            <p className="text-[10px] font-bold text-[#7D6E5D] leading-relaxed">
                変化の感じ方は人それぞれです。<br/>あなたのペースで、自分の目で見比べてみてください。
            </p>
        </div>

        {/* User Note */}
        {targetRecord && (
            <div className="space-y-4 pt-2 border-t border-dashed border-stone-200">
                <div>
                    <p className="text-xs font-black mb-3 text-stone-600 flex items-center gap-1.5">
                        <FileText size={14} /> 比較メモ <span className="text-[9px] font-normal text-stone-400">(任意)</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <button onClick={() => setFeeling('positive')} className={`btn-3d py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${feeling === 'positive' ? 'bg-[#F0FAF5] border-[#6BC99D] text-[#6BC99D]' : 'bg-white border-stone-100 text-stone-400'}`}>
                            <Smile size={20} /> <span className="text-[9px] font-bold">良い感じ</span>
                        </button>
                        <button onClick={() => setFeeling('neutral')} className={`btn-3d py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${feeling === 'neutral' ? 'bg-stone-100 border-stone-300 text-stone-600' : 'bg-white border-stone-100 text-stone-400'}`}>
                            <Meh size={20} /> <span className="text-[9px] font-bold">変わらない</span>
                        </button>
                        <button onClick={() => setFeeling('negative')} className={`btn-3d py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${feeling === 'negative' ? 'bg-[#FFF0F0] border-[#F88D8D] text-[#F88D8D]' : 'bg-white border-stone-100 text-stone-400'}`}>
                            <Frown size={20} /> <span className="text-[9px] font-bold">気になる</span>
                        </button>
                    </div>
                    <textarea 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="気づいたことをメモ（例：少し背筋が伸びたかも？）"
                        className="w-full p-3 bg-stone-50 rounded-xl border outline-none text-xs font-bold min-h-[80px]"
                    />
                </div>
                <Button onClick={handleSave} className="w-full min-h-[48px] h-auto shadow-md py-3">
                    {isSaved ? "保存しました ✨" : "メモを保存して閉じる"}
                </Button>
            </div>
        )}
      </div>
    </Modal>
  );
};

// --- Modals ---
export const PostureDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  analysis: PostureAnalysis | null;
  photoBase64: string | null;
  sidePhotoBase64?: string | null;
  onCompare?: () => void; // Added callback
  isAnchor?: boolean;
  onToggleAnchor?: (isAnchor: boolean) => void;
}> = ({ isOpen, onClose, analysis, photoBase64, sidePhotoBase64, onCompare, isAnchor, onToggleAnchor }) => {
  // モーダルが開いている間は全広告を非表示にする
  React.useEffect(() => {
    if (isOpen) {
        hideBanner();
        hideMrec(); // Ensure MREC is hidden
    } else if (Capacitor.isNativePlatform()) {
        showBanner();
    }
  }, [isOpen]);

  if (!analysis || !photoBase64) return null;
  const levelColor = analysis.level === 'OK' ? THEME.colors.posturePrimary : analysis.level === 'CAUTION' ? THEME.colors.readPrimary : THEME.colors.mealPrimary;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="姿勢チェック結果">
      <div className="space-y-6">
        <header className="flex items-center gap-2 mb-4">
             <div className="w-7 h-7 rounded flex items-center justify-center shadow-sm" style={{ backgroundColor: THEME.colors.mealPrimary }}>
                <Utensils size={14} className="text-white" strokeWidth={3} />
             </div>
             <h2 className="font-zen-maru font-black text-sm tracking-widest" style={{ color: THEME.colors.mealPrimary }}>たべとっと。</h2>
        </header>
        <PostureResultCarousel frontPhoto={photoBase64} sidePhoto={sidePhotoBase64} analysis={analysis} />
        {analysis.isAnalyzable ? (
           <div className="space-y-4">
              <div className="p-5 rounded-2xl border-2 relative" style={{ backgroundColor: THEME.colors.cardBg, borderColor: levelColor }}>
                 <span className="absolute -top-3 left-4 text-white text-[10px] px-3 py-0.5 rounded-full font-bold flex items-center w-fit shadow-sm" style={{ backgroundColor: levelColor }}>
                     判定: {analysis.level}
                 </span>
                 <p className="text-sm font-bold leading-relaxed mt-2" style={{ color: THEME.colors.textPrimary }}>{analysis.point}</p>
              </div>
              
              {/* Compare Button */}
              {onCompare && (
                  <div className="flex flex-col items-end">
                      <div className="mb-2 text-[10px] font-bold text-primary animate-pulse">
                          前回と比べて、どう感じますか？
                      </div>
                      <Button onClick={onCompare} variant="outline" className="min-h-[40px] h-auto py-2 text-xs px-4 bg-white border-primary text-primary">
                          <ArrowLeftRight size={14} className="mr-2" /> 前回と見比べる
                      </Button>
                  </div>
              )}

              {onToggleAnchor && (
                  <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 cursor-pointer active:bg-stone-100 transition-colors mt-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isAnchor ? 'bg-primary border-primary text-white' : 'bg-white border-stone-300'}`}>
                          {isAnchor && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                          <p className="text-xs font-black text-stone-700">比較用として残す</p>
                          <p className="text-[9px] font-bold text-stone-400 mt-0.5">基準写真は1件まで保存されます</p>
                      </div>
                      <input type="checkbox" className="hidden" checked={isAnchor} onChange={(e) => onToggleAnchor(e.target.checked)} />
                  </label>
              )}
           </div>
        ) : (
            <div className="p-6 rounded-2xl border-2 text-center" style={{ backgroundColor: THEME.colors.dangerSoft, borderColor: '#FFD6D6' }}>
                 <AlertCircle size={32} className="mx-auto mb-3" style={{ color: THEME.colors.danger }} />
                 <h4 className="font-bold mb-2" style={{ color: THEME.colors.textPrimary }}>解析できませんでした</h4>
                 <p className="text-sm font-bold" style={{ color: THEME.colors.danger }}>{analysis.errorReason || "全身を写して再撮影してください"}</p>
            </div>
        )}
      </div>
    </Modal>
  );
};

export const MealDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  recordDate: string;
  meal: MealAnalysis | null;
  photoBase64: string | null;
  onDelete: () => void;
  onShare: () => void;
  onUpdateExternalUrl?: (url: string) => void;
}> = ({ isOpen, onClose, recordDate, meal, photoBase64, onDelete, onShare, onUpdateExternalUrl }) => {
  // モーダルが開いている間は全広告を非表示にする
  React.useEffect(() => {
    if (isOpen) {
        hideBanner();
        hideMrec(); // Ensure MREC is hidden
    } else if (Capacitor.isNativePlatform()) {
        showBanner();
    }
  }, [isOpen]);

  const [urlInput, setUrlInput] = React.useState(meal?.externalUrl || '');
  if (!meal) return null;
  const typeInfo = meal.mealType ? MEAL_TYPE_LABELS[meal.mealType] : null;
  const imageSrc = resolveMealImageSrc(photoBase64);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="食事の詳細">
      <div className="space-y-6">
        <header className="flex items-center gap-2 mb-2">
             <div className="w-7 h-7 rounded flex items-center justify-center shadow-sm" style={{ backgroundColor: THEME.colors.mealPrimary }}>
                <Utensils size={14} className="text-white" strokeWidth={3} />
             </div>
             <h2 className="font-zen-maru font-black text-sm tracking-widest" style={{ color: THEME.colors.mealPrimary }}>たべとっと。</h2>
        </header>
        <div className="space-y-4">
            {photoBase64 && (
            // 画像コンテナを 3:4 (縦長) に固定。結果カードがそのまま入る。
            <div className="w-full aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden shadow-md border-4 border-white transform -rotate-1 relative">
                <img src={imageSrc} className="w-full h-full object-contain" style={{ backgroundColor: '#FFFDF5' }} />
                {/* Mascot Overlay */}
                <div className="absolute top-3 left-3 w-14 h-14 z-10 pointer-events-none motion-safe:animate-breathe-subtle">
                    <img src={OFFICIAL_MASCOT_SRC} className="w-full h-full object-contain drop-shadow-md" alt="Mascot" />
                </div>
            </div>
            )}
            <div className="flex gap-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                        {typeInfo && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-2 flex items-center gap-1 ${typeInfo.color}`}><typeInfo.icon size={12}/> {typeInfo.label}</span>}
                        <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border-2 shadow-sm" style={{ color: THEME.colors.textLight, borderColor: THEME.colors.border }}>{recordDate}</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight" style={{ color: THEME.colors.textPrimary }}>{meal.menuName}</h2>
                    <div className="flex items-baseline mt-1">
                        <span className="text-2xl font-black" style={{ color: THEME.colors.posturePrimary }}>
                          {meal.category === 'food' || (meal.isFood !== false && meal.category !== 'non_food' && meal.category !== 'blocked') 
                            ? meal.numericCalories 
                            : '——'}
                          { (meal.category === 'food' || (meal.isFood !== false && meal.category !== 'non_food' && meal.category !== 'blocked')) && (
                            <span className="text-xs ml-1 font-bold" style={{ color: THEME.colors.textLight }}>kcal</span>
                          )}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-3">
                    <div className="p-4 rounded-2xl border-2 text-sm relative shadow-sm h-full" style={{ backgroundColor: THEME.colors.postureSoft, borderColor: THEME.colors.posturePrimary, color: THEME.colors.textPrimary }}>
                        <span className="absolute -top-3 left-4 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center w-fit shadow-sm" style={{ backgroundColor: THEME.colors.posturePrimary }}>アドバイス</span>
                        <p className="font-bold leading-relaxed whitespace-pre-wrap">{meal.comment}</p>
                    </div>
                    {meal.memo && (
                    <div className="p-4 rounded-2xl border-2 bg-white shadow-sm relative" style={{ borderColor: THEME.colors.border }}>
                        <span className="absolute -top-3 left-4 bg-white text-stone-400 text-[10px] px-2 py-0.5 rounded-full font-bold border-2 flex items-center w-fit" style={{ borderColor: THEME.colors.border }}>メモ</span>
                        <p className="text-xs font-bold leading-relaxed text-stone-600 whitespace-pre-wrap">{meal.memo}</p>
                    </div>
                    )}
                </div>

                {meal.isFood !== false && meal.category !== 'non_food' && meal.category !== 'blocked' && (meal.pfcRatio || meal.microBalance) && (
                    <div className="w-full sm:w-[220px] shrink-0 flex flex-col gap-3">
                        {meal.pfcRatio && <PfcDonutChart pfcRatio={meal.pfcRatio} />}
                        {meal.microBalance && <MicroBalanceGauge microBalance={meal.microBalance} />}
                    </div>
                )}
            </div>

            <div className="p-4 rounded-2xl border-2 bg-white" style={{ borderColor: THEME.colors.border }}>
                <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: THEME.colors.textLight }}>
                   <LinkIcon size={12} /> SNSやカレンダーの投稿URL
                </label>
                <div className="flex gap-2">
                    <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="投稿したリンクをここにペースト" className="flex-1 text-xs bg-stone-50 p-2 rounded-lg border outline-none font-bold" />
                    {onUpdateExternalUrl && <button onClick={() => onUpdateExternalUrl(urlInput)} className="btn-3d bg-stone-800 text-white text-[10px] px-3 rounded-lg font-black transition-all">保存</button>}
                </div>
            </div>
        </div>
        <div className="space-y-3 pt-4 border-t-2 border-dashed" style={{ borderColor: THEME.colors.border }}>
            <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => addToCalendar('meal', recordDate, meal)} variant="outline" className="text-xs !py-3 flex items-center justify-center bg-white shadow-sm min-h-[48px] h-auto">
                    <CalendarPlus size={16} className="mr-2" style={{ color: THEME.colors.posturePrimary }} />カレンダーへ
                </Button>
                {photoBase64 ? (
                    <Button onClick={onShare} variant="secondary" className="text-xs !py-3 flex items-center justify-center shadow-md min-h-[48px] h-auto">
                        <Share2 size={16} className="mr-2" /> SNSでシェア
                    </Button>
                ) : (
                    <Button disabled variant="outline" className="text-xs !py-3 flex items-center justify-center opacity-50 bg-white min-h-[48px] h-auto">画像なし</Button>
                )}
            </div>
            <button onClick={onDelete} className="w-full text-center text-[10px] font-black py-2 opacity-30 hover:opacity-100 transition-opacity" style={{ color: THEME.colors.danger }}>
               <Trash2 size={12} className="inline mr-1" /> この記録を完全に削除する
            </button>
        </div>
      </div>
    </Modal>
  );
};

export const SharePreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  mealAnalysis: MealAnalysis;
  photoBase64: string;
  dateStr: string;
  initialBlob?: Blob | null;
}> = ({ isOpen, onClose, mealAnalysis, photoBase64, dateStr, initialBlob }) => {
  // モーダルが開いている間は全広告を非表示にする
  React.useEffect(() => {
    if (isOpen) {
        hideBanner();
        hideMrec(); // Ensure MREC is hidden
    } else if (Capacitor.isNativePlatform()) {
        showBanner();
    }
  }, [isOpen]);

  const [blob, setBlob] = React.useState<Blob | null>(initialBlob || null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isSharing, setIsSharing] = React.useState(false);
  const [hasSaved, setHasSaved] = React.useState(false);
  const [showLongPressGuide, setShowLongPressGuide] = React.useState(false);
  const [shareError, setShareError] = React.useState<string | null>(null);

  // blobが提供されていない場合に生成する処理
  React.useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;
    const generateImage = async () => {
        // Blobが提供されている場合はそれを使う
        if (initialBlob) {
            setBlob(initialBlob);
            const url = URL.createObjectURL(initialBlob);
            if (isMounted) setPreviewUrl(url);
            return;
        }

        const isUriSource = photoBase64 && (photoBase64.startsWith('file:') || photoBase64.startsWith('content:') || photoBase64.startsWith('http'));
        if (isUriSource) {
            setPreviewUrl(Capacitor.convertFileSrc(photoBase64));
            // 本来は Blob が必要。
            // しかし歴史的な経緯で photoBase64 が URI の場合、renderMealResultToBlob はそれを fetch するなりして処理するはず。
        }

        // レンダリングする
        try {
            const generatedBlob = await generateShareImageBlob(photoBase64, mealAnalysis, dateStr);
            if (isMounted && generatedBlob) {
                setBlob(generatedBlob);
                const url = URL.createObjectURL(generatedBlob);
                setPreviewUrl(url);
            }
        } catch (err) {
            console.error("Share image generation failed:", err);
            if (isMounted) setShareError("画像の作成に失敗しました");
        }
    };

    generateImage();

    return () => {
        isMounted = false;
    };
  }, [isOpen, initialBlob, photoBase64, mealAnalysis, dateStr]);

  // Clean up object URL on unmount or refresh
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleShare = async () => {
    if (!blob || isSharing) return;
    
    setIsSharing(true);
    setShareError(null);
    
    try {
        const result = await executeShare({
            title: 'たべとっと。で食事を記録しました',
            text: '今日の食事記録です✨ #たべとっと',
            blob: blob,
            filename: `tabetotto_${dateStr.replace(/-/g, '')}.jpg`
        });

        if (result === 'success') {
            // Success
        } else if (result === 'fallback') {
            setShowLongPressGuide(true);
            if (!isIOS()) {
                handleDownload();
            }
        } else if (result === 'error') {
            setShareError("共有に失敗しました");
            setShowLongPressGuide(true);
        }
    } catch (e: any) {
        if (e.name !== 'AbortError') {
            console.error('Share failed:', e);
            setShowLongPressGuide(true);
        }
    } finally {
        setIsSharing(false);
    }
  };

  const handleDownload = () => {
    if (!blob) return;
    try {
      executeDownload(blob, `tabetotto_${dateStr.replace(/-/g, '')}.jpg`);
      setHasSaved(true);
    } catch (e) {
      console.error("Download failed:", e);
      setShowLongPressGuide(true);
    }
  };

  const handleClose = async () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="シェアして保存">
       <div className="flex flex-col items-center space-y-4 relative">
           <header className="w-full flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded flex items-center justify-center shadow-sm" style={{ backgroundColor: THEME.colors.mealPrimary }}>
                        <Utensils size={14} className="text-white" strokeWidth={3} />
                    </div>
                    <h2 className="font-zen-maru font-black text-sm tracking-widest" style={{ color: THEME.colors.mealPrimary }}>たべとっと。</h2>
                </div>
           </header>

           {previewUrl ? (
               <div className="w-full relative">
                   <div className="w-full aspect-[3/4] shadow-2xl rounded-2xl overflow-hidden border-4 border-white animate-in zoom-in-95 bg-white relative">
                       <img 
                          src={previewUrl} 
                          className="w-full h-full object-contain bg-[#FFFDF5] cursor-pointer" 
                          alt="Share Preview"
                          referrerPolicy="no-referrer"
                       />
                       
                       {showLongPressGuide && (
                         <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 text-center animate-in fade-in duration-300 z-10">
                            <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-[#F08D8D] space-y-3">
                                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-[#F08D8D]">
                                    <Info size={24} />
                                </div>
                                <p className="text-sm font-black text-stone-700 leading-relaxed">
                                  画像を長押しして<br/>
                                  「"写真"に保存」を選んでください
                                </p>
                                <button 
                                  onClick={() => setShowLongPressGuide(false)}
                                  className="text-xs font-bold text-stone-400 underline"
                                >
                                  とじる
                                </button>
                            </div>
                         </div>
                       )}
                   </div>
                   
                   {isIOS() && !showLongPressGuide && (
                     <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-stone-800/80 text-white text-[10px] font-black px-4 py-1.5 rounded-full backdrop-blur-sm shadow-lg pointer-events-none whitespace-nowrap">
                       長押しでも保存できます 👆
                     </div>
                   )}
               </div>
           ) : (
               <div className="w-full aspect-[3/4] flex flex-col items-center justify-center bg-stone-100 rounded-2xl border" style={{ borderColor: THEME.colors.border }}>
                   <Loader2 className="animate-spin w-10 h-10 mb-2" style={{ color: THEME.colors.mealPrimary }} />
                   <p className="text-xs font-bold" style={{ color: THEME.colors.textLight }}>画像を生成中...</p>
               </div>
           )}

          {shareError && (
             <div className="w-full p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-500">
               <Info size={14} className="shrink-0" />
               <p className="text-[10px] font-bold">{shareError}</p>
             </div>
          )}

          <div className="grid grid-cols-2 gap-3 w-full pt-2">
               <Button onClick={handleShare} variant="secondary" isLoading={isSharing} disabled={!blob} className="min-h-[56px] h-auto shadow-md !rounded-3xl py-3">
                   <Share2 size={18} className="mr-2" /> シェア
               </Button>
               <button 
                  onClick={handleDownload} 
                  disabled={!previewUrl}
                  className={`btn-3d min-h-[56px] h-auto py-3 border-2 font-black text-sm rounded-3xl transition-all flex items-center justify-center shadow-sm ${hasSaved ? 'bg-secondary text-white border-secondary' : 'bg-white text-stone-600 border-stone-200'}`}
                  style={hasSaved ? { backgroundColor: THEME.colors.posturePrimary, borderColor: THEME.colors.posturePrimary } : {}}
               >
                   {hasSaved ? (
                       <><Check size={18} className="mr-2" /> 保存済み</>
                   ) : (
                       <><Download size={18} className="mr-2" /> 画像を保存</>
                   )}
               </button>
           </div>
           
           {!Capacitor.isNativePlatform() && (
             <p className="text-[10px] font-bold text-stone-500 bg-stone-50 p-3 rounded-xl border border-dashed text-center leading-relaxed">
               ブラウザ版では「保存」または「画像を長押し」で<br/>端末に画像を保存できます。
             </p>
           )}
           
           <div className="w-full pt-2">
              <Button onClick={onClose} variant="cancel" className="w-full min-h-[48px] h-auto py-3 !border-dashed !rounded-2xl text-xs opacity-60">
                  完了してとじる
              </Button>
           </div>
           
           <p className="text-[9px] font-bold text-stone-400">※保存ボタンを押しても反応がない場合は、画像を長押しして保存してください</p>
       </div>
    </Modal>
  );
};
