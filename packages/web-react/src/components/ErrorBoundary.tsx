import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-md border border-red-300 bg-red-50 p-6">
          <h1 className="mb-2 text-lg font-bold text-red-800">Something went wrong</h1>
          <p className="mb-4 text-sm text-red-700">{error.message}</p>
          {error.stack && (
            <pre className="mb-4 max-h-64 overflow-auto rounded bg-red-100 p-3 text-xs text-red-900">
              {error.stack}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
