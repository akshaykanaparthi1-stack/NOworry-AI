'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4 text-center">
          <h2 className="text-xl font-bold text-slate-900">Application Error</h2>
          <p className="text-xs text-slate-500">{error?.message || 'A global error occurred.'}</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition"
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}
