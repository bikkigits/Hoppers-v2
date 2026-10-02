import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Hoppers ErrorBoundary] Uncaught render exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCacheAndReload = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.clear();
      }
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#080B11] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          {/* Glowing Crimson Aura */}
          <div className="absolute top-1/3 w-72 h-72 rounded-full bg-red-600/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-md w-full bg-slate-900/90 border border-red-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-red-950/40">
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5 text-red-400">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-serif text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-sm font-medium text-amber-400/90 mb-4">
              একটি সমস্যা হয়েছে · অনুগ্রহ করে অ্যাপটি পুনরায় লোড করুন
            </p>

            {/* Explanation */}
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Hoppers encountered an unexpected rendering condition. Your offline pandal data and visited passport stamps remain safe.
            </p>

            {/* Error Message Snippet (Compact) */}
            {this.state.error?.message && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-6 text-left max-h-24 overflow-y-auto">
                <p className="text-[11px] font-mono text-slate-400 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 transition-all active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Application (পুনরায় লোড)
              </button>

              <button
                type="button"
                onClick={this.handleResetCacheAndReload}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                Clear Local Cache & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
