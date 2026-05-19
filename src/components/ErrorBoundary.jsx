import { Component } from 'react';
import { AlertCircle } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturou um erro:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="bg-[#12121a] p-8 rounded-2xl shadow-xl border border-red-900/30 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Algo deu errado</h2>
          <p className="text-gray-400 mb-2 text-sm">
            O dashboard encontrou um erro inesperado.
          </p>
          <p className="text-gray-500 mb-6 text-xs font-mono break-all">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-md"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}
