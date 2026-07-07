import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Something went wrong</h2>
          <p className="mb-6 max-w-md text-slate-600">
            An unexpected error occurred in this component. We've logged the issue and are looking into it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-all hover:bg-slate-800"
          >
            <RefreshCcw className="h-4 w-4" />
            Reload Application
          </button>
          
          {import.meta.env.DEV && this.state.error && (
            <div className="mt-8 w-full max-w-2xl overflow-auto rounded-lg bg-white p-4 text-left shadow-inner">
              <pre className="text-xs text-rose-600 font-mono">
                {this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
