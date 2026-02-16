import { Label } from '../../components/ui/label';
import type { TimestampConverterOptions } from '../../utils/timestampConverter';

const TIMEZONES = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];

interface OptionsHeaderProps {
  showSettings: boolean;
  options: TimestampConverterOptions;
  updateOption: <K extends keyof TimestampConverterOptions>(
    key: K,
    value: TimestampConverterOptions[K]
  ) => void;
}

export function TimestampConverterOptionsHeader({
  showSettings,
  options,
  updateOption,
}: OptionsHeaderProps) {
  return (
    <div>
      {showSettings && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <Label className="text-xs text-zinc-400 font-normal">Epoch unit</Label>
              <select
                value={options.epochUnit}
                onChange={(e) =>
                  updateOption('epochUnit', e.target.value as TimestampConverterOptions['epochUnit'])
                }
                className="bg-black text-zinc-400 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-zinc-700"
              >
                <option value="seconds">Seconds</option>
                <option value="milliseconds">Milliseconds</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-xs text-zinc-400 font-normal">Output format</Label>
              <select
                value={options.outputFormat}
                onChange={(e) =>
                  updateOption('outputFormat', e.target.value as TimestampConverterOptions['outputFormat'])
                }
                className="bg-black text-zinc-400 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-zinc-700"
              >
                <option value="iso">ISO</option>
                <option value="locale">Locale</option>
                <option value="unix">Unix</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-xs text-zinc-400 font-normal">Timezone</Label>
              <select
                value={options.timezone}
                onChange={(e) => updateOption('timezone', e.target.value)}
                className="bg-black text-zinc-400 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-zinc-700"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
