
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// React Error Boundaries require class components.
// React 19 does not bundle .d.ts type definitions, so `React.Component` is not
// recognized as a class by TypeScript. The cast below provides the correct
// generic type parameters while preserving runtime behavior.
const BaseComponent = React.Component as unknown as new (props: ErrorBoundaryProps) => React.Component<ErrorBoundaryProps, ErrorBoundaryState>;

class ErrorBoundary extends BaseComponent {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('GUI.A_DIGITAL_ERROR:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 bg-red-500 rounded-[32px] mb-8 flex items-center justify-center text-5xl font-black text-white shadow-2xl">
            !
          </div>
          <h1 className="text-4xl md:text-6xl font-brand italic uppercase tracking-tighter text-white mb-4 leading-none">
            ERRO NO <span className="text-red-500">SISTEMA _</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 italic mb-8 max-w-md">
            Algo deu errado, mas calma — seu progresso está salvo no dispositivo.
          </p>
          <p className="text-sm text-slate-600 font-mono mb-8 max-w-lg break-all">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-12 h-16 bg-indigo-600 text-white rounded-2xl font-black uppercase text-lg shadow-xl hover:bg-indigo-500 transition-all"
          >
            REINICIAR APP
          </button>
        </div>
      );
    }

    return (this as unknown as React.Component<ErrorBoundaryProps, ErrorBoundaryState>).props.children;
  }
}

export default ErrorBoundary;
