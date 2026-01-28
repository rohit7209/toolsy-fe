import { Code2, Clock, FileJson, Database, Hash, Calendar } from 'lucide-react';

const tools = [
  { name: 'JSON Formatter', icon: FileJson, path: '/json-formatter', active: true },
  { name: 'SQL Formatter', icon: Database, path: '/sql-formatter', active: false },
  { name: 'Time Converter', icon: Clock, path: '/time-converter', active: false },
  { name: 'Hash Generator', icon: Hash, path: '/hash-generator', active: false },
  { name: 'Timestamp Converter', icon: Calendar, path: '/timestamp-converter', active: false },
];

export function Navigation() {
  return (
    <nav className="border-b border-zinc-900 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
              <Code2 className="size-5 text-purple-400" />
              <span className="text-lg font-medium text-white tracking-tight">toolsy</span>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.name}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      tool.active
                        ? 'text-purple-400'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {tool.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}