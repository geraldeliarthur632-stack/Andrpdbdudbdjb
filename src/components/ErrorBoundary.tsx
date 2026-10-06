import React from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('estudahud_journey_initial_subject');
      } catch {}
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-900 rounded-3xl border border-slate-200 shadow-sm m-4 select-none">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center text-3xl shadow-xs mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>

          <h2 className="text-lg font-black text-slate-900 mb-1">
            {this.props.fallbackTitle || 'Tudo bem! Vamos continuar estudando'}
          </h2>

          <p className="text-xs text-slate-600 max-w-sm mb-6 leading-relaxed">
            Ocorreu uma pequena pausa na tela. Seus pontos, conquistas e progresso estão salvos com segurança.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>

            <button
              onClick={this.handleGoHome}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-2xs active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Voltar ao Início</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
