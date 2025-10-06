'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  framework?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component specifically for chart rendering
 * Catches errors in D3, Chart.js, Mermaid, and other chart renderers
 */
class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('[ChartErrorBoundary] Chart rendering error:', error);
    console.error('[ChartErrorBoundary] Error info:', errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI or use provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { framework } = this.props;
      const { error } = this.state;

      return (
        <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-red-500/20 p-3 rounded-lg">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-red-200 font-semibold text-lg mb-2">
                Chart Rendering Error
              </h4>

              <p className="text-red-300/80 text-sm mb-3">
                {framework ? `Failed to render ${framework} chart` : 'Failed to render chart'}
              </p>

              {error && (
                <div className="bg-black/30 rounded-lg p-3 mb-3">
                  <p className="text-red-200 text-xs font-mono break-words">
                    {error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 text-sm">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg border border-red-400/50 transition-colors"
                >
                  Try Again
                </button>

                <div className="text-red-300/60 text-xs flex items-center">
                  Check browser console for details
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-red-500/30">
                <p className="text-red-300/70 text-xs mb-2">Common issues:</p>
                <ul className="text-red-300/60 text-xs space-y-1 list-disc list-inside">
                  <li>Syntax errors in chart code</li>
                  <li>Missing or incorrect data format</li>
                  <li>Framework-specific API misuse</li>
                  <li>Container size constraints</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
