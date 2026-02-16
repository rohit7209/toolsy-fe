export type TimestampConverterOptions = {
  epochUnit: 'seconds' | 'milliseconds';
  outputFormat: 'iso' | 'locale' | 'unix';
  timezone: string;
};

export function parseDateOrNow(input: string): Date | null {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === '' || trimmed === 'now') {
    return new Date();
  }
  const num = Number(trimmed);
  if (!Number.isNaN(num)) {
    if (num > 1e12) return new Date(num);
    return new Date(num * 1000);
  }
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatInZone(date: Date, tz: string, kind: 'iso' | 'locale' | 'unix'): string {
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
      return `${y}-${m}-${d} ${h}:${min}:${s}`;
    }
    if (kind === 'unix') {
      return String(Math.floor(date.getTime() / 1000));
    }
    return new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date);
  } catch {
    return '';
  }
}

export function timestampToHuman(
  epochInput: string,
  options: TimestampConverterOptions
): string {
  const parsed = parseDateOrNow(epochInput);
  if (!parsed) return '';

  const tz = options.timezone || 'UTC';
  if (options.outputFormat === 'unix') {
    return options.epochUnit === 'milliseconds'
      ? String(parsed.getTime())
      : String(Math.floor(parsed.getTime() / 1000));
  }
  return formatInZone(parsed, tz, options.outputFormat);
}

export function humanToTimestamp(
  dateInput: string,
  options: TimestampConverterOptions
): string {
  const parsed = parseDateOrNow(dateInput);
  if (!parsed) return '';

  if (options.epochUnit === 'milliseconds') {
    return String(parsed.getTime());
  }
  return String(Math.floor(parsed.getTime() / 1000));
}
