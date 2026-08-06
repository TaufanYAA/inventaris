import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast List Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(item => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border pointer-events-auto transition-all duration-300 animate-slide-in ${
              item.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300'
                : item.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-800/50 text-rose-800 dark:text-rose-300'
                : item.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/50 text-amber-800 dark:text-amber-300'
                : 'bg-sky-50 dark:bg-sky-950/30 border-sky-200/50 dark:border-sky-800/50 text-sky-800 dark:text-sky-300'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {item.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {item.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {item.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {item.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            
            <div className="flex-grow text-sm font-medium">
              {item.message}
            </div>
            
            <button
              onClick={() => removeToast(item.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast harus digunakan di dalam ToastProvider');
  }
  return context;
};
