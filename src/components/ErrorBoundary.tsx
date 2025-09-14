import React from 'react';

console.log('[Debug] ErrorBoundary module loaded');
;(window as any).__errorBoundaryLoaded = true;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  private handleGlobalError = (event: ErrorEvent) => {
    console.error('[GlobalError] window error:', event.message, event.error);
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('[GlobalError] unhandledrejection:', event.reason);
  };

  componentDidMount() {
    const rootEl = document.getElementById('root');
    console.log('[Debug] ErrorBoundary mounted', {
      readyState: document.readyState,
      rootElExists: !!rootEl,
      rootChildCount: rootEl?.childElementCount,
    });
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection as any);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection as any);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for diagnostics
    console.error('Render error captured by ErrorBoundary:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', maxWidth: 800, margin: '40px auto', fontFamily: 'ui-sans-serif, system-ui' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>We hit a snag while loading this page</h1>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            A rendering error occurred. Our team will look into it. You can try refreshing the page.
          </p>
          {this.state.error && (
            <pre style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: 12, borderRadius: 8, overflow: 'auto' }}>
              {this.state.error.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
