import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-400/40 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <span className="text-4xl">📔</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-amber-300">
            રોજિંદી ડાયરી અને સ્માર્ટ આસિસ્ટન્ટ
          </h1>
          <p className="text-slate-300 text-sm max-w-sm mb-6 leading-relaxed">
            એપ લોડ થવામાં સહેજ મુશ્કેલી આવી છે. કૃપા કરીને નીચે આપેલા બટન પર ક્લિક કરીને ફરી શરૂ કરો.
          </p>
          <button
            onClick={this.handleReload}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg transition active:scale-95 text-base"
          >
            🔄 ફરી શરૂ કરો (Reload App)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
