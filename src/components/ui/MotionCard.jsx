import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const MotionCard = ({ children, className, delay = 0, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.23, 1, 0.32, 1], // Custom cinematic ease-out
        delay 
      }}
      whileHover={{ y: -5, scale: 1.01 }}
      className={cn(
        "bg-obsidian-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden relative group",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
      {/* Animated glow on hover */}
      <div className="absolute -bottom-px inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </motion.div>
  );
};
