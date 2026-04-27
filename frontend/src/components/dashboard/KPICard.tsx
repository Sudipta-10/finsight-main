'use client';
import { motion } from 'framer-motion';

export interface KPICardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  variant: 'income' | 'expense' | 'neutral';
  isLoading?: boolean;
  delay?: number;
}

export function KPICard({ label, value, change, changeLabel, variant, isLoading, delay = 0 }: KPICardProps) {
  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4 animate-pulse shadow-sm">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const isPositive = change !== undefined && change >= 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.7, 
        delay, 
        type: "spring", 
        stiffness: 80, 
        damping: 15 
      }}
      whileHover={{ 
        y: -6, 
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" } 
      }}
      className="relative glass-panel rounded-3xl p-8 flex flex-col justify-between transition-all overflow-hidden group hover:border-accent/40 hover:shadow-glow"
    >
      {}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      {}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out pointer-events-none" />
      
      <div className="relative z-10 flex justify-between items-center mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
        <span className={`w-2.5 h-2.5 rounded-full shadow-sm animate-pulseGlow ${variant === 'income' ? 'bg-income' : variant === 'expense' ? 'bg-expense' : 'bg-accent'}`} />
      </div>
      
      <h3 className={`relative z-10 font-display text-4xl lg:text-5xl mb-5 tracking-tight truncate drop-shadow-sm ${variant === 'income' ? 'text-income' : variant === 'expense' ? 'text-expense' : 'text-gray-900'}`}>
        {value}
      </h3>

      {change !== undefined && (
        <p className="relative z-10 text-xs flex items-center gap-2 font-medium text-gray-500">
          <span className={`px-2 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-sm backdrop-blur-md ${isPositive ? (variant === 'expense' ? 'bg-expense/10 text-expense border border-expense/20' : 'bg-income/10 text-income border border-income/20') : (variant === 'expense' ? 'bg-income/10 text-income border border-income/20' : 'bg-expense/10 text-expense border border-expense/20')}`}>
            {isPositive ? '↗' : '↘'} {Math.abs(change)}%
          </span>
          <span className="font-medium text-gray-400">{changeLabel || 'vs last month'}</span>
        </p>
      )}
    </motion.div>
  );
}
