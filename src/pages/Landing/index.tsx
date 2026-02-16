import { Link } from 'react-router-dom';
import { FileJson, Database, Clock, Hash, Calendar, ArrowRight, Code2 } from 'lucide-react';

const tools = [
  {
    name: 'JSON Formatter',
    path: '/json-formatter',
    description: 'Structure, validate, minify. AI fix and explain.',
    icon: FileJson,
    live: true,
  },
  {
    name: 'SQL Formatter',
    path: '/sql-formatter',
    description: 'Format, validate, minify. AI fix and explain.',
    icon: Database,
    live: true,
  },
  {
    name: 'Time Converter',
    path: '/time-converter',
    description: 'Switch timezones and formats.',
    icon: Clock,
    live: true,
  },
  {
    name: 'Hash Generator',
    path: '/hash-generator',
    description: 'MD5, SHA hashes from text.',
    icon: Hash,
    live: true,
  },
  {
    name: 'Timestamp Converter',
    path: '/timestamp-converter',
    description: 'Epoch ↔ human-readable.',
    icon: Calendar,
    live: true,
  },
];

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md mx-auto text-violet-500/20"
      aria-hidden
    >
      <path
        d="M0 60 Q100 20 200 60 T400 60"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M0 80 Q150 40 250 80 T400 80"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="80" cy="60" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="200" cy="60" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="320" cy="60" r="3" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen w-full">
      {/* Hero */}
      <section className="pt-20 pb-16 px-6 md:pt-28 md:pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-5">
            <Code2 className="size-12 text-violet-400 md:size-14" aria-hidden />
          </div>
          <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase mb-4">
            Built for those who ship.
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
            Simple tools. Work that delivers.
          </h1>
          <p className="mt-3 text-zinc-500 text-sm md:text-base max-w-md mx-auto">
            Open. Use. Done. No signup. AI inside.
          </p>
          <div className="mt-10">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Tools - horizontal flow */}
      <section className="pb-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase mb-6 text-center">
            Tools for the daily hustle
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.name}
                to={tool.path}
                className="group flex items-center gap-4 flex-1 min-w-[280px] max-w-[360px] min-h-[7.5rem] pl-5 pr-5 py-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/50 transition-all duration-300 border border-zinc-800/50 hover:border-violet-500/20 border-l-2 border-l-violet-500/30 hover:border-l-violet-500/60"
              >
                <span className="shrink-0 rounded-xl bg-violet-500/10 p-2.5 text-violet-400/80 group-hover:text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                  <Icon className="size-5" strokeWidth={1.5} />
                </span>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-white group-hover:text-violet-200/90 transition-colors">
                      {tool.name}
                    </span>
                    {!tool.live && (
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Soon</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <span className="shrink-0 text-zinc-500 group-hover:text-violet-400 transition-colors">
                  <ArrowRight className="size-4" strokeWidth={2} />
                </span>
              </Link>
            );
          })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pb-8 flex flex-col items-center gap-2">
        <p className="text-[11px] text-zinc-600">For the sharp.</p>
        <p className="text-[10px] text-zinc-600/80">Powered by AI</p>
      </footer>
    </div>
  );
}
