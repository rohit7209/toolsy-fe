import { Label } from '../../components/ui/label';

export type TimeConverterOptions = {
  toZones: string[];
  outputFormat: 'iso' | 'locale' | 'unix';
};

const COMMON_ZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

interface OptionsHeaderProps {
  showSettings: boolean;
  options: TimeConverterOptions;
  updateOption: <K extends keyof TimeConverterOptions>(
    key: K,
    value: TimeConverterOptions[K]
  ) => void;
}

export function TimeConverterOptionsHeader({
  showSettings,
  options,
  updateOption,
}: OptionsHeaderProps) {
  const toggleZone = (zone: string) => {
    const next = options.toZones.includes(zone)
      ? options.toZones.filter((z) => z !== zone)
      : [...options.toZones, zone];
    updateOption('toZones', next.length ? next : ['UTC']);
  };

  return (
    <div>
      {showSettings && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <Label className="text-xs text-zinc-400 font-normal">Output format</Label>
              <select
                value={options.outputFormat}
                onChange={(e) =>
                  updateOption('outputFormat', e.target.value as TimeConverterOptions['outputFormat'])
                }
                className="bg-black text-zinc-400 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-zinc-700"
              >
                <option value="iso">ISO (yyyy-MM-dd HH:mm:ss XXX)</option>
                <option value="locale">Locale (date + time)</option>
                <option value="unix">Unix timestamp</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-xs text-zinc-400 font-normal w-full">Target timezones</Label>
              {COMMON_ZONES.map((zone) => (
                <label key={zone} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.toZones.includes(zone)}
                    onChange={() => toggleZone(zone)}
                    className="rounded border-zinc-600 bg-black text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-xs text-zinc-400">{zone.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
