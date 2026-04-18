/**
 * Error Boundary Component
 * Catches errors in React components and displays a fallback UI
 */
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (err) => {
    setHasError(true);
    setError(err);
    console.error('Error caught by boundary:', err);
  };

  if (hasError) {
    return (
      <div className="md:ml-64 p-8">
        <div className="max-w-md mx-auto">
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
            <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
            <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-red-700 mb-4">{error?.message}</p>
            <Button
              variant="accent"
              onClick={() => {
                setHasError(false);
                setError(null);
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  try {
    return children;
  } catch (err) {
    handleError(err);
    return null;
  }
}
