import type { FormatOptions } from "../../pages/JsonFormatter/OptionsHeader";

/** Recursively sort object keys; arrays and primitives unchanged */
function sortKeysDeep(value: unknown): unknown {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[k] = sortKeysDeep((value as Record<string, unknown>)[k]);
    }
    return sorted;
  }
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  return value;
}

/**
 * Format JSON in the browser using current options. No network call.
 * Throws on invalid JSON.
 */
export function formatJsonInBrowser(jsonString: string, options: FormatOptions): string {
  const trimmed = jsonString.trim();
  if (!trimmed) return trimmed;

  let value: unknown;
  try {
    value = JSON.parse(trimmed);
  } catch {
    throw new Error("Invalid JSON");
  }

  if (options.sortKeys) {
    value = sortKeysDeep(value);
  }

  const usePretty = options.pretty && !options.minify;
  const space: string | undefined = usePretty
    ? options.indentType === 200
      ? "\t"
      : " ".repeat(options.indent)
    : undefined;

  let result = JSON.stringify(value, null, space);

  if (options.asJsObject && options.jsQuote === "'") {
    result = result.replace(/"/g, "'");
  }

  return result;
}
