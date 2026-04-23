
import React from 'react';
import { Download, X, Smartphone, PlusSquare, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerInstall, isStandalone, isIOS } from '../services/pwaService';
import { THEME } from '../theme';

const STORAGE_KEY_HIDE_PROMPT = 'pwa_prompt_hidden_v1';

export const PWAInstallPrompt: React.FC = () => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [isIOSDevice, setIsIOSDevice] = React.useState(false);
    const [showInstructions, setShowInstructions] = React.useState(false);

    React.useEffect(() => {
        // すでに隠すフラグがある場合や、スタンドアロン起動時は表示しない
        const isHidden = localStorage.getItem(STORAGE_KEY_HIDE_PROMPT);
        if (isHidden === 'true' || isStandalone()) return;

        // iOS判定
        if (isIOS()) {
            setIsIOSDevice(true);
            // Safariで、かつスタンドアロンでない場合に表示
            // iOSは beforeinstallprompt がないので、少し遅れて出す
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000);
            return () => clearTimeout(timer);
        }

        // Android / Chrome 等
        const handleInstallable = () => {
            setIsVisible(true);
        };

        window.addEventListener('pwa-installable', handleInstallable);
        return () => window.removeEventListener('pwa-installable', handleInstallable);
    }, []);

    const handleHide = () => {
        setIsVisible(false);
        // 1回閉じたら暫く出さない（必要なら有効期限を設けるが、今回はシンプルにlocalStorageに保存）
        localStorage.setItem(STORAGE_KEY_HIDE_PROMPT, 'true');
    };

    const handleInstallClick = async () => {
        if (isIOSDevice) {
            setShowInstructions(true);
        } else {
            const success = await triggerInstall();
            if (success) {
                setIsVisible(false);
            }
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-24 left-4 right-4 z-[150] md:max-w-md md:mx-auto"
            >
                <div 
                    className="bg-white rounded-3xl p-5 shadow-2xl border-2 flex flex-col gap-4"
                    style={{ borderColor: THEME.colors.border }}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                            <div 
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md animate-sway"
                                style={{ backgroundColor: THEME.colors.mealPrimary }}
                            >
                                <Smartphone size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-sm font-black text-stone-700">ホーム画面に追加しませんか？</h3>
                                <p className="text-[10px] font-bold text-stone-500 leading-relaxed">
                                    「たべとっと。」をアプリのように使えます。<br/>
                                    アイコンからすぐに起動できて便利です。
                                </p>
                            </div>
                        </div>
                        <button onClick={handleHide} className="p-1 text-stone-300 hover:text-stone-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {!showInstructions ? (
                        <button
                            onClick={handleInstallClick}
                            className="bg-stone-50 hover:bg-stone-100 border-2 border-stone-100 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Download size={18} className="text-stone-600" />
                            <span className="text-xs font-black text-stone-700">ホーム画面に追加する</span>
                        </button>
                    ) : (
                        <div className="bg-stone-50 rounded-2xl p-4 flex flex-col gap-3 border border-dashed border-stone-200">
                           <p className="text-[11px] font-black text-stone-600 flex items-center gap-2">
                               <PlusSquare size={14} className="text-stone-400" /> 追加の手順
                           </p>
                           <ul className="text-[10px] font-bold text-stone-500 space-y-2 list-none p-0">
                               <li className="flex items-center gap-2">
                                   <div className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[9px]">1</div>
                                   ブラウザ下の <Share size={12} className="text-blue-500" /> <strong>「共有」</strong>をタップ
                               </li>
                               <li className="flex items-center gap-2">
                                   <div className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[9px]">2</div>
                                   メニューから <strong>「ホーム画面に追加」</strong>をタップ
                               </li>
                           </ul>
                           <button onClick={() => setShowInstructions(false)} className="text-[10px] font-bold text-blue-500 self-center">
                               閉じる
                           </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
