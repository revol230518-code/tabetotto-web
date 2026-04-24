import React from "react";
import { motion } from "motion/react";
import { THEME } from "../theme";

interface MascotProps {
  message?: string;
  size?: number;
  className?: string;
  position?: "left" | "right" | "center";
}

const Mascot: React.FC<MascotProps> = ({ 
  message, 
  size = 64, 
  className = "", 
  position = "left" 
}) => {
  return (
    <div className={`flex flex-col ${position === "center" ? "items-center" : position === "right" ? "items-end" : "items-start"} gap-3 ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative"
      >
        <img 
          src="/tabetotto.mascot.svg" 
          alt="たべとっと。マスコット" 
          width={size} 
          height={size} 
          className="drop-shadow-sm"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      
      {message && (
        <motion.div
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative px-4 py-2 bg-white rounded-2xl border-2 shadow-sm text-[11px] font-bold text-stone-600 after:content-[''] after:absolute after:-top-[8px] after:left-6 after:border-l-[8px] after:border-l-transparent after:border-r-[8px] after:border-r-transparent after:border-b-[8px] after:border-b-white before:content-[''] before:absolute before:-top-[11px] before:left-[23px] before:border-l-[9px] before:border-l-transparent before:border-r-[9px] before:border-r-transparent before:border-b-[9px] before:border-b-stone-100"
          style={{ borderColor: THEME.colors.border }}
        >
          {message}
        </motion.div>
      )}
    </div>
  );
};

export default Mascot;
