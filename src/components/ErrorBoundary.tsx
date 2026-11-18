import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Unexpected application error.',
    };
  }

  render() {
    if (this.state.hasError) {
      let readableMessage = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message) as { error?: string; path?: string };
        if (parsed.error) {
          readableMessage = `${parsed.error}${parsed.path ? ` (${parsed.path})` : ''}`;
        }
      } catch {
        // plain error string
      }

      return (
        <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 space-y-4 text-center">
            <h1 className="text-lg font-bold text-slate-900">तांत्रिक अडचण आली / Something went wrong</h1>
            <p className="text-xs sm:text-sm text-red-800 break-words">{readableMessage}</p>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-900 text-white text-sm font-semibold cursor-pointer"
            >
              मुख्यपृष्ठावर जा / Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
