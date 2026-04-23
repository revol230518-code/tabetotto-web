import React from 'react';
import { X, LayoutGrid, Utensils, History, Camera, Settings, BookOpen, Activity, Info, Shield, HelpCircle, AlertTriangle } from 'lucide-react';
import { THEME } from '../theme';
import { AppView } from '../types';
import { motion } from 'motion/react';
import { triggerHaptic, ImpactStyle } from '../services/haptics';
import { scrollToTop } from '../utils/scrollToTop';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  setView: (view: AppView) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, currentView, setView }) => {
  // メニュー構造：親項目(H2)の下に子項目(H3)を配置できるように拡張
  const menuItems = [
    { id: AppView.DASHBOARD, icon: LayoutGrid, label: 'ホーム' },
    { id: AppView.HISTORY, icon: History, label: '記録・グラフ' },
    { 
      id: AppView.MEAL, 
      icon: Utensils, 
      label: 'ごはん記録',
      children: [
        { id: AppView.NUTRITION_GUIDE, icon: BookOpen, label: '栄養素ガイド' }
      ]
    },
    { 
      id: AppView.POSTURE, 
      icon: Camera, 
      label: '姿勢チェック',
      children: [
        { id: AppView.MOVE_GUIDE, icon: Activity, label: 'うごきの目安' }
      ]
    },
    { id: AppView.SETTINGS, icon: Settings, label: '設定' },
    { 
      id: 'INFO_SECTION', 
      icon: Info, 
      label: '情報・規約',
      children: [
        { id: AppView.USAGE, icon: BookOpen, label: '使い方' },
        { id: AppView.FAQ, icon: HelpCircle, label: 'よくある質問' },
        { id: AppView.PRIVACY, icon: Shield, label: 'プライバシー' },
        { id: AppView.TERMS, icon: AlertTriangle, label: '注意事項' },
        { id: AppView.INFO, icon: Info, label: '運営情報' },
      ]
    },
  ];

  const handleSelect = (view: AppView) => {
    triggerHaptic(ImpactStyle.Light);
    scrollToTop();
    setView(view);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[140] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] bg-[#fdfbf7] shadow-2xl z-[150] transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ borderLeft: `1px solid ${THEME.colors.border}` }}
      >
        <div className="p-6 pt-safe flex items-center justify-between border-b border-dashed" style={{ borderColor: THEME.colors.border }}>
             <div className="flex flex-col">
                <span className="font-zen-maru font-black text-xl tracking-widest" style={{ color: THEME.colors.mealPrimary }}>MENU</span>
             </div>
             <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => { triggerHaptic(); onClose(); }} 
                className="p-2 rounded-full bg-stone-100 transition-colors" 
                style={{ color: THEME.colors.textLight }}
             >
                <X size={20} strokeWidth={3} />
             </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-3">
            {menuItems.map((item) => {
                const isActive = currentView === item.id;
                
                return (
                    <div key={item.id} className="flex flex-col gap-1">
                        {/* Parent Item (H2) */}
                        <button
                            onClick={() => {
                                if (Object.values(AppView).includes(item.id as AppView)) {
                                    handleSelect(item.id as AppView);
                                }
                            }}
                            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all active:scale-[0.98] ${isActive ? 'bg-white shadow-md ring-2' : 'hover:bg-white/50'} ${!Object.values(AppView).includes(item.id as AppView) ? 'cursor-default' : ''}`}
                            style={isActive ? { boxShadow: `0 0 0 2px ${THEME.colors.mealPrimary}33` } : {}}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-transform ${isActive ? 'scale-110' : ''}`} 
                                 style={{ backgroundColor: THEME.colors.mealPrimary, color: 'white' }}>
                                <item.icon size={18} strokeWidth={2.5} />
                            </div>
                            <span className="font-black text-sm" style={{ color: isActive ? THEME.colors.mealPrimary : '#5D5745' }}>{item.label}</span>
                        </button>

                        {/* Children Items (H3) */}
                        {item.children?.map(child => {
                            const isChildActive = currentView === child.id;
                            return (
                                <button
                                    key={child.id}
                                    onClick={() => handleSelect(child.id as AppView)}
                                    className={`ml-6 w-[calc(100%-24px)] flex items-center gap-3 p-2 rounded-xl transition-all relative active:scale-[0.98] ${isChildActive ? 'shadow-sm' : 'hover:bg-white/50'}`}
                                    style={isChildActive ? { backgroundColor: THEME.colors.readSoft } : {}}
                                >
                                    {/* Connector Line */}
                                    <div className="absolute -left-3 top-1/2 w-3 h-[2px] bg-stone-200" />
                                    <div className="absolute -left-3 top-0 h-1/2 w-[2px] bg-stone-200" />

                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${isChildActive ? 'text-white' : 'bg-white text-stone-400 border border-stone-100'}`}
                                         style={isChildActive ? { backgroundColor: THEME.colors.readPrimary } : {}}>
                                        <child.icon size={14} strokeWidth={2.5} />
                                    </div>
                                    <span className="font-black text-xs" style={{ color: isChildActive ? THEME.colors.readPrimary : '#78716c' }}>{child.label}</span>
                                    
                                    {!isChildActive && (
                                        <span className="text-[9px] font-bold text-white bg-stone-300 px-1.5 py-0.5 rounded ml-auto tracking-wide">
                                            GUIDE
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                );
            })}
        </div>
        
        <div className="p-6 border-t border-dashed bg-[#FFF8F0] relative overflow-hidden" style={{ borderColor: THEME.colors.border }}>
            <div className="absolute -bottom-4 -right-4 pointer-events-none opacity-50 z-0 motion-safe:animate-breathe-subtle">
                <img src="/tabetotto.mascot.svg" alt="" className="w-16 h-16 object-contain transform rotate-12" />
            </div>
            <p className="text-[10px] font-bold text-center opacity-40 relative z-10">たべとっと。</p>
        </div>
      </div>
    </>
  );
};


export default SideMenu;