import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * ErrorBoundary — catches render/runtime errors in child components so a single
 * failing page doesn't blank out the entire app. Used to wrap critical
 * route-level components in App.jsx.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Hook point for a logging service (e.g. Sentry) in production.
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8 text-center"
        >
          <AlertTriangle size={48} className="text-amber-500" aria-hidden="true" />
          <h2 className="text-xl font-serif font-bold">
            {this.props.label ? `Something went wrong in ${this.props.label}` : 'Something went wrong'}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            An unexpected error occurred while rendering this section. Your data is safe — try
            reloading, or head back to the homepage.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-surface transition-colors"
            >
              <RotateCcw size={14} aria-hidden="true" /> Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm text-white hover:opacity-90 transition-opacity"
            >
              Go home
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
