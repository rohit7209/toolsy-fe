import { NavLink, Link } from 'react-router-dom';
import { Code2, Clock, FileJson, Database, Hash, Calendar } from 'lucide-react';

const tools = [
  { name: 'JSON Formatter', icon: FileJson, path: '/json-formatter' },
  { name: 'SQL Formatter', icon: Database, path: '/sql-formatter' },
  { name: 'Time Converter', icon: Clock, path: '/time-converter' },
  { name: 'Hash Generator', icon: Hash, path: '/hash-generator' },
  { name: 'Timestamp Converter', icon: Calendar, path: '/timestamp-converter' },
];

export function Navigation() {
  return (
    <nav className="border-b border-zinc-900 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-2">
              <Code2 className="size-5 text-purple-400" />
              <span className="text-lg font-medium text-white tracking-tight">toolsy</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <NavLink
                    key={tool.name}
                    to={tool.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        isActive ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
                      }`
                    }
                  >
                    <Icon className="size-3.5" />
                    {tool.name}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}