
import React from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X, Delete, ImageIcon, Trash2 } from 'lucide-react';
import { THEME } from '../theme';
import { motion } from 'motion/react';
import { triggerHaptic, ImpactStyle } from '../services/haptics';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'album' | 'danger' | 'outline' | 'guide' | 'cancel' | 'neutral';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, className = '', disabled, onClick, ...props }) => {
  const baseStyles = "btn-paper min-h-[56px] h-auto py-3.5 text-base px-4 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center break-keep break-words whitespace-pre-wrap text-center leading-snug";
  
  let dynamicStyles: React.CSSProperties = {};
  let hapticStyle = ImpactStyle.Light;
  
  if (variant === 'primary') {
    dynamicStyles = {
      backgroundColor: THEME.colors.mealPrimary,
      color: 'white',
      borderRadius: THEME.shapes.paperPrimary,
    };
    hapticStyle = ImpactStyle.Medium;
  } else if (variant === 'secondary') {
    dynamicStyles = {
      backgroundColor: THEME.colors.posturePrimary,
      color: 'white',
      borderRadius: THEME.shapes.paperSecondary,
    };
  } else if (variant === 'tertiary' || variant === 'guide') {
    dynamicStyles = {
      backgroundColor: THEME.colors.readPrimary,
      color: 'white',
      borderRadius: THEME.shapes.paperPrimary,
    };
  } else if (variant === 'album') {
    dynamicStyles = {
      backgroundColor: THEME.colors.posturePrimary,
      color: 'white',
      borderRadius: THEME.shapes.paperSecondary,
    };
  } else if (variant === 'cancel') {
    dynamicStyles = {
      backgroundColor: THEME.colors.dangerSoft,
      color: THEME.colors.danger,
      borderRadius: THEME.shapes.paperAlbum,
      border: `2px solid ${THEME.colors.danger}22`,
    };
  } else if (variant === 'neutral') {
    dynamicStyles = {
      backgroundColor: THEME.colors.cardBg,
      color: THEME.colors.textPrimary,
      borderRadius: THEME.shapes.paperSecondary,
      border: `2px solid ${THEME.colors.border}`,
    };
  } else if (variant === 'outline') {
    dynamicStyles = {
      backgroundColor: 'transparent',
      color: THEME.colors.textPrimary,
      borderRadius: THEME.shapes.card,
      border: `2px solid ${THEME.colors.border}`,
    };
  } else if (variant === 'danger') {
    dynamicStyles = {
      backgroundColor: THEME.colors.dangerSoft,
      color: THEME.colors.danger,
      borderRadius: THEME.shapes.card,
      border: `2px solid ${THEME.colors.danger}22`,
    };
    hapticStyle = ImpactStyle.Medium;
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic(hapticStyle);
    if (onClick) onClick(e);
  };

  return (
    <button 
      className={`${baseStyles} ${className} ${isLoading ? 'opacity-80' : ''}`} 
      style={dynamicStyles}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props as any}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin shrink-0" />
          <span>処理中...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; onClick?: () => void; style?: React.CSSProperties }> = ({ children, className = '', title, onClick, style }) => (
  <div 
    onClick={() => {
      if (onClick) {
        triggerHaptic(ImpactStyle.Light);
        onClick();
      }
    }} 
    className={`organic-card p-6 relative ${onClick ? 'cursor-pointer hover:shadow-lg active:scale-[0.99] transition-transform duration-150' : ''} ${className}`}
    style={{ borderRadius: THEME.shapes.card, ...style }}
  >
    {title && (
      <div className="mb-6 flex items-center justify-center">
        <h3 className="text-[10px] font-black px-4 py-1.5 rounded-full border-2 tracking-widest shadow-sm uppercase" style={{ color: THEME.colors.textLight, borderColor: THEME.colors.border, backgroundColor: THEME.colors.appBg }}>
          {title}
        </h3>
      </div>
    )}
    <div className="relative z-10">{children}</div>
  </div>
);

export const FileInput: React.FC<{ label: string; onFileSelect: (file: File) => void; className?: string }> = ({ label, onFileSelect, className = "" }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
    e.target.value = '';
  };

  return (
    <div className={className}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <Button variant="album" onClick={() => fileInputRef.current?.click()} className="w-full h-full min-h-[64px] py-3">
        <ImageIcon size={20} className="mr-2 shrink-0" style={{ color: 'white' }} />
        <span className="leading-snug">{label}</span>
      </Button>
    </div>
  );
};

export const CuteKeypad: React.FC<{ initialValue: string; unit: string; onConfirm: (val: string) => void; onCancel: () => void; }> = ({ initialValue, unit, onConfirm, onCancel }) => {
  const [value, setValue] = React.useState(initialValue || '0');
  const handlePress = (num: string) => {
    triggerHaptic(ImpactStyle.Light);
    if (num === '.' && value.includes('.')) return;
    setValue(prev => (prev === '0' && num !== '.') ? num : prev + num);
  };
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 pb-28 animate-in fade-in">
      <div className="w-full max-w-md rounded-[40px] p-8 border-4 shadow-2xl animate-in slide-in-from-bottom duration-300" style={{ backgroundColor: THEME.colors.appBg, borderColor: THEME.colors.border }}>
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-widest block mb-1" style={{ color: THEME.colors.textLight }}>数値入力</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tighter" style={{ color: THEME.colors.textPrimary }}>{value}</span>
              <span className="text-xs font-black" style={{ color: THEME.colors.textLight }}>{unit}</span>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => { triggerHaptic(); onCancel(); }} 
            className="p-2 rounded-full transition-colors" 
            style={{ color: THEME.colors.textLight }}
          >
            <X size={28} />
          </motion.button>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button 
              key={num} 
              onClick={() => handlePress(num.toString())} 
              className="h-16 rounded-2xl bg-white border-2 text-2xl font-black transition-all shadow-sm active:scale-95" 
              style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
            >
              {num}
            </button>
          ))}
          <button 
            onClick={() => { triggerHaptic(ImpactStyle.Medium); setValue('0'); }} 
            className="h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all shadow-sm leading-tight group active:scale-95"
            style={{ backgroundColor: THEME.colors.dangerSoft, borderColor: '#FFD6D6', color: THEME.colors.danger }}
          >
            <Trash2 size={20} className="mb-0.5 group-active:scale-110 transition-transform" />
            <span className="text-[10px] font-black">クリア</span>
          </button>
          <button 
            onClick={() => handlePress('0')} 
            className="h-16 rounded-2xl bg-white border-2 text-2xl font-black transition-all shadow-sm active:scale-95" 
            style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
          >
            0
          </button>
          <button 
            onClick={() => { triggerHaptic(ImpactStyle.Light); setValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0'); }} 
            className="h-16 rounded-2xl bg-white border-2 flex items-center justify-center transition-all shadow-sm active:scale-95" 
            style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
          >
            <Delete size={28} />
          </button>
        </div>
        <Button onClick={() => onConfirm(value)} className="w-full text-lg">確定する</Button>
      </div>
    </div>, document.body
  );
};

export const CuteCalendar: React.FC<{ initialDate: string; onConfirm: (date: string) => void; onCancel: () => void; }> = ({ initialDate, onConfirm, onCancel }) => {
  const [date, setDate] = React.useState(initialDate);
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-[40px] p-8 border-4 shadow-2xl animate-in zoom-in-95 duration-300" style={{ backgroundColor: THEME.colors.appBg, borderColor: THEME.colors.border }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest block mb-1" style={{ color: THEME.colors.textLight }}>日付を選択</span>
            <span className="text-2xl font-black" style={{ color: THEME.colors.textPrimary }}>{date}</span>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => { triggerHaptic(); onCancel(); }} 
            className="p-2" 
            style={{ color: THEME.colors.textLight }}
          >
            <X size={28} />
          </motion.button>
        </div>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-4 bg-white border-2 rounded-2xl mb-8 font-black outline-none focus:border-[#F88D8D]"
          style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
        />
        <Button onClick={() => onConfirm(date)} className="w-full">決定する</Button>
      </div>
    </div>, document.body
  );
};

export const NumberInputDisplay: React.FC<{ label: string; value: number | string; unit?: string; onClick: () => void; }> = ({ label, value, unit, onClick }) => (
  <div 
    onClick={() => { triggerHaptic(); onClick(); }} 
    className="cursor-pointer group active:scale-[0.99] transition-transform duration-150"
  >
    <label className="text-[10px] font-black ml-2 mb-1.5 block uppercase tracking-wider" style={{ color: THEME.colors.textLight }}>{label}</label>
    <div className="w-full min-h-[48px] p-3 rounded-[18px] font-black border-2 flex items-center justify-between transition-all shadow-inner" style={{ backgroundColor: THEME.colors.appBg, borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}>
      <span className="text-lg">{value || '--'}</span>
      {unit && <span className="text-[10px] font-black" style={{ color: THEME.colors.textLight }}>{unit}</span>}
    </div>
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title?: string; }> = ({ isOpen, onClose, children, title }) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border-1.5 rounded-[32px] animate-in zoom-in-95 duration-300" style={{ backgroundColor: THEME.colors.appBg, borderColor: THEME.colors.border }}>
        <div className="p-5 border-b border-dashed flex items-center justify-between bg-white/80 backdrop-blur-sm" style={{ borderColor: THEME.colors.border }}>
          <h3 className="font-black text-base tracking-widest uppercase" style={{ color: THEME.colors.textPrimary }}>{title}</h3>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => { triggerHaptic(); onClose(); }} 
            className="p-2 rounded-full hover:bg-black/5 transition-colors" 
            style={{ color: THEME.colors.textPrimary }}
          >
            <X size={20} strokeWidth={2.5} />
          </motion.button>
        </div>
        <div ref={contentRef} className="overflow-y-auto p-6 no-scrollbar flex-1">{children}</div>
      </div>
    </div>, document.body
  );
};
