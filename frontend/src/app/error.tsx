'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="max-w-md w-full p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4 text-center">
        <h2 className="text-xl font-bold text-slate-900">Something went wrong!</h2>
        <p className="text-xs text-slate-500">{error?.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
