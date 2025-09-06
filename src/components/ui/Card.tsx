import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const Component = onClick ? motion.button : motion.div;
  
  return (
    <Component
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        bg-slate-800/60 backdrop-blur-lg rounded-2xl border border-slate-700/50 
        shadow-xl hover:shadow-2xl transition-all duration-300
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}