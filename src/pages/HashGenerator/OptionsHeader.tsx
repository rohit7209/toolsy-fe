import { Label } from '../../components/ui/label';
import type { HashAlgorithms } from '../../utils/hashGenerator';

const ALGORITHMS: { id: HashAlgorithms[number]; label: string }[] = [
  { id: 'md5', label: 'MD5' },
  { id: 'sha1', label: 'SHA-1' },
  { id: 'sha256', label: 'SHA-256' },
  { id: 'sha384', label: 'SHA-384' },
  { id: 'sha512', label: 'SHA-512' },
];

interface OptionsHeaderProps {
  showSettings: boolean;
  algorithms: HashAlgorithms;
  updateAlgorithms: (algorithms: HashAlgorithms) => void;
}

export function HashGeneratorOptionsHeader({
  showSettings,
  algorithms,
  updateAlgorithms,
}: OptionsHeaderProps) {
  const toggle = (id: HashAlgorithms[number]) => {
    if (algorithms.includes(id)) {
      const next = algorithms.filter((a) => a !== id);
      updateAlgorithms(next.length ? next : ['sha256']);
    } else {
      updateAlgorithms([...algorithms, id]);
    }
  };

  return (
    <div>
      {showSettings && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5">
          <Label className="text-xs text-zinc-400 font-normal block mb-2">Algorithms</Label>
          <div className="flex flex-wrap gap-4">
            {ALGORITHMS.map(({ id, label }) => (
              <label key={id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={algorithms.includes(id)}
                  onChange={() => toggle(id)}
                  className="rounded border-zinc-600 bg-black text-purple-500 focus:ring-purple-500"
                />
                <span className="text-xs text-zinc-400">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
