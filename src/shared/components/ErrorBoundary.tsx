import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Kecelakaan Rendering React Terdeteksi:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
          <div className="w-full max-w-md p-8 text-center rounded-2xl glass-panel shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500">
              <AlertOctagon className="w-8 h-8" />
            </div>
            
            <h2 className="mb-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
              Terjadi Kesalahan Render
            </h2>
            
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Aplikasi mengalami masalah rendering komponen visual. Silakan segarkan halaman atau hubungi Administrator jika masalah terus berlanjut.
            </p>

            <div className="p-4 mb-6 text-left rounded-lg bg-slate-100 dark:bg-slate-950/50 overflow-x-auto max-h-32 text-xs font-mono text-rose-600 dark:text-rose-400">
              {this.state.error?.toString() || 'Kesalahan Rendering Tidak Diketahui'}
            </div>

            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center w-full px-5 py-3 font-semibold text-white transition-all duration-200 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-md shadow-sky-500/20"
            >
              <RotateCw className="w-4 h-4 mr-2 animate-spin-hover" />
              Segarkan Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
