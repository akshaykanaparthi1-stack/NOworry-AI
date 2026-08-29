import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="max-w-md w-full p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900">404 - Page Not Found</h2>
        <p className="text-xs text-slate-500">The requested page or resource could not be found.</p>
        <Link
          href="/dashboard"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
