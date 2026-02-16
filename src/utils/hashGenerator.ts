import md5 from 'blueimp-md5';

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha(algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest(algorithm, data);
  return bufferToHex(buffer);
}

export type HashAlgorithms = ('md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512')[];

export async function computeHashes(text: string, algorithms: HashAlgorithms): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  if (algorithms.includes('md5')) {
    result['MD5'] = md5(text);
  }
  if (algorithms.includes('sha1')) {
    result['SHA-1'] = await sha('SHA-1', text);
  }
  if (algorithms.includes('sha256')) {
    result['SHA-256'] = await sha('SHA-256', text);
  }
  if (algorithms.includes('sha384')) {
    result['SHA-384'] = await sha('SHA-384', text);
  }
  if (algorithms.includes('sha512')) {
    result['SHA-512'] = await sha('SHA-512', text);
  }
  return result;
}

export function formatHashesOutput(hashes: Record<string, string>): string {
  return Object.entries(hashes)
    .map(([name, value]) => `${name}: ${value}`)
    .join('\n');
}
