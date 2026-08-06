import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'indigo' | 'violet';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-200';

  const variants = {
    success: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/40 text-emerald-700 dark:text-emerald-400',
    warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/40 text-amber-700 dark:text-amber-400',
    danger: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200/40 text-rose-700 dark:text-rose-400',
    info: 'bg-sky-50 dark:bg-sky-950/20 border-sky-200/40 text-sky-700 dark:text-sky-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200/40 text-indigo-700 dark:text-indigo-400',
    violet: 'bg-violet-50 dark:bg-violet-950/20 border-violet-200/40 text-violet-700 dark:text-violet-400',
    neutral: 'bg-slate-100 dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300',
  };

  // Status mapping mapper helper
  const getBadgeVariant = (val: string): string => {
    const v = val.toLowerCase();
    if (['baik', 'aktif', 'online', 'success', 'success_status', 'up'].includes(v)) return variants.success;
    if (['maintenance', 'warning', 'in review', 'investigating', 'workaround', 'pending'].includes(v)) return variants.warning;
    if (['rusak ringan', 'rusak berat', 'nonaktif', 'offline', 'error', 'failed', 'down', 'danger'].includes(v)) return variants.danger;
    if (['cadangan', 'neutral', 'closed', 'none'].includes(v)) return variants.neutral;
    if (['admin', 'info', 'active'].includes(v)) return variants.info;
    if (['laboran', 'operator'].includes(v)) return variants.indigo;
    if (['teknisi'].includes(v)) return variants.violet;
    return variants[variant];
  };

  const selectedVariant = typeof children === 'string' ? getBadgeVariant(children) : variants[variant];

  return (
    <span className={`${base} ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
};
export default Badge;
