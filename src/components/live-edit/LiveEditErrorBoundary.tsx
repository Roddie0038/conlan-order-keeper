import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class LiveEditErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 LiveEdit Error Boundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 LiveEdit Error Boundary - Full error details:', {
      error,
      errorInfo,
      stack: error.stack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50">
          <h3 className="font-bold">Live Edit Error</h3>
          <p className="text-sm">
            {this.state.error?.message || 'An error occurred in Live Edit'}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
          >
            Reset
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}