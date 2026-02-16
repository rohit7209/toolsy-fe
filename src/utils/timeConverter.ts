import { parseDateOrNow } from './timestampConverter';

export type TimeConverterOptions = {
  toZones: string[];
  outputFormat: 'iso' | 'locale' | 'unix';
};

function formatInZone(date: Date, tz: string, kind: 'iso' | 'locale' | 'unix'): string {
  if (kind === 'unix') {
    return String(Math.floor(date.getTime() / 1000));
  }
  try {
    if (kind === 'iso') {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const parts = formatter.formatToParts(date);
      const y = parts.find((p) => p.type === 'year')?.value ?? '';
      const m = parts.find((p) => p.type === 'month')?.value ?? '';
      const d = parts.find((p) => p.type === 'day')?.value ?? '';
      const h = parts.find((p) => p.type === 'hour')?.value ?? '';
      const min = parts.find((p) => p.type === 'minute')?.value ?? '';
      const s = parts.find((p) => p.type === 'second')?.value ?? '';
      const offset = getOffset(date, tz);
      return `${y}-${m}-${d} ${h}:${min}:${s} ${offset}`;
    }
    return new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date);
  } catch {
    return '(invalid timezone)';
  }
}

function getOffset(date: Date, tz: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      timeZoneName: 'longOffset',
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
    const match = tzPart.match(/([+-])(\d{2}):?(\d{2})?/);
    if (match) return `${match[1]}${match[2]}:${(match[3] ?? '00')}`;
    return '';
  } catch {
    return '';
  }
}

export function convertTime(
  input: string,
  options: TimeConverterOptions
): string {
  const parsed = parseDateOrNow(input.trim());
  if (!parsed) return '';

  const lines: string[] = [];
  for (const tz of options.toZones) {
    const line = formatInZone(parsed, tz, options.outputFormat);
    lines.push(`${tz}\t${line}`);
  }
  return lines.join('\n');
}
