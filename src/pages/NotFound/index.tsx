import { Link } from 'react-router-dom';
import { Home, FileQuestion } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh]">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-zinc-800/80 border border-zinc-700 mb-6">
          <FileQuestion className="size-10 text-zinc-500" />
        </div>
        <p className="text-6xl font-semibold text-zinc-700 tracking-tight">404</p>
        <h1 className="mt-2 text-xl font-medium text-white tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-zinc-500 text-sm leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 px-4 py-2.5 rounded-lg text-sm font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 border border-violet-500/30 transition-colors"
        >
          <Home className="size-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
