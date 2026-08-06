import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverEffect = false, className = '', ...props }) => {
  const baseStyle = 'p-6 rounded-2xl glass-panel shadow-sm border border-slate-200/50 dark:border-slate-800/50 transition-all duration-300';
  const hoverStyle = hoverEffect ? 'glass-panel-hover shadow-slate-100/50 dark:shadow-slate-950/50 hover:-translate-y-0.5 hover:shadow-md' : '';

  return (
    <div className={`${baseStyle} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};
export default Card;
