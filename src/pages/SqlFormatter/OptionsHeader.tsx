import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';

export interface SqlFormatOptions {
  indent: number;
  indentType: 'spaces' | 'tabs';
  keywordCase: 'upper' | 'lower' | 'none';
  minify: boolean;
}

interface OptionsHeaderProps {
  showSettings: boolean;
  options: SqlFormatOptions;
  updateOption: <K extends keyof SqlFormatOptions>(key: K, value: SqlFormatOptions[K]) => void;
}

export function SqlOptionsHeader({ showSettings, options, updateOption }: OptionsHeaderProps) {
  const updateIndentType = (value: 'spaces' | 'tabs') => {
    updateOption('indentType', value);
    if (value === 'tabs') {
      updateOption('indent', 1);
    }
  };

  return (
    <div>
      {showSettings && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <Switch
                id="minify"
                checked={options.minify}
                onCheckedChange={(checked) => updateOption('minify', checked)}
              />
              <Label htmlFor="minify" className="text-xs text-zinc-400 cursor-pointer font-normal">
                Minify
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Label className="text-xs text-zinc-400 font-normal">Indent</Label>
              <select
                value={options.indentType}
                onChange={(e) => updateIndentType(e.target.value as 'spaces' | 'tabs')}
                className="bg-black text-zinc-400 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-zinc-700"
              >
                <option value="spaces">Spaces</option>
                <option value="tabs">Tabs</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Label className="text-xs text-zinc-400 font-normal">Size</Label>
              <select
                value={options.indent}
                onChange={(e) => updateOption('indent', Number(e.target.value))}
                disabled={options.indentType === 'tabs' || options.minify}
                className="bg-black text-zinc-400 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-zinc-700 disabled:opacity-30"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Label className="text-xs text-zinc-400 font-normal">Keywords</Label>
              <select
                value={options.keywordCase}
                onChange={(e) => updateOption('keywordCase', e.target.value as SqlFormatOptions['keywordCase'])}
                disabled={options.minify}
                className="bg-black text-zinc-400 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-zinc-700 disabled:opacity-30"
              >
                <option value="none">As-is</option>
                <option value="upper">UPPER</option>
                <option value="lower">lower</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
