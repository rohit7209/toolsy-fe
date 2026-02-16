import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh]">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-violet-500/15 border border-violet-500/30 mb-6">
          <FileQuestion className="size-8 text-violet-400" />
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-zinc-500 text-sm leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="mt-1 text-zinc-600 text-xs">
          404
        </p>
        <Link
          to="/json-formatter"
          className="inline-flex items-center gap-2 mt-8 px-4 py-2.5 rounded-lg text-sm font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 border border-violet-500/30 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to JSON Formatter
        </Link>
      </div>
    </div>
  );
}
