import { useState } from 'react';
import { Copy, Check, Trash2, Download, Settings2, ArrowRightLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { TimestampConverterOptionsHeader } from './OptionsHeader';
import {
  timestampToHuman,
  humanToTimestamp,
  type TimestampConverterOptions,
} from '../../utils/timestampConverter';

type Mode = 'toHuman' | 'toEpoch';

export function TimestampConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<Mode>('toHuman');
  const [options, setOptions] = useState<TimestampConverterOptions>({
    epochUnit: 'seconds',
    outputFormat: 'iso',
    timezone: 'UTC',
  });

  const updateOption = <K extends keyof TimestampConverterOptions>(
    key: K,
    value: TimestampConverterOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = () => {
    if (!output) {
      toast.error('Nothing to copy');
      return;
    }
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    toast.success('Cleared');
  };

  const downloadOutput = () => {
    if (!output) {
      toast.error('Nothing to download');
      return;
    }
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timestamp-converted.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded');
  };

  const handleConvert = () => {
    if (!input.trim()) {
      toast.error('Enter a timestamp or date/time');
      return;
    }
    try {
      if (mode === 'toHuman') {
        const result = timestampToHuman(input, options);
        setOutput(result || 'Invalid input');
        if (!result) toast.error('Could not parse input');
        else toast.success('Converted');
      } else {
        const result = humanToTimestamp(input, options);
        setOutput(result);
        toast.success('Converted');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Conversion failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">Timestamp Converter</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Epoch ↔ human-readable</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-zinc-400 hover:text-white hover:bg-zinc-900"
        >
          <Settings2 className="size-4 mr-2" />
          Options
        </Button>
      </div>

      <TimestampConverterOptionsHeader
        showSettings={showSettings}
        options={options}
        updateOption={updateOption}
      />

      <div className="flex items-center justify-center gap-2">
        <Button
          variant={mode === 'toHuman' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('toHuman')}
          className={mode === 'toHuman' ? 'bg-purple-600' : 'text-zinc-500'}
        >
          Epoch → Date
        </Button>
        <ArrowRightLeft className="size-4 text-zinc-600" />
        <Button
          variant={mode === 'toEpoch' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('toEpoch')}
          className={mode === 'toEpoch' ? 'bg-purple-600' : 'text-zinc-500'}
        >
          Date → Epoch
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="px-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Input ({mode === 'toHuman' ? 'epoch' : 'date/time'})
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'toHuman'
                ? 'e.g. 1739184600 or 1739184600000'
                : 'e.g. 2025-02-10 14:30 or now'
            }
            className="flex-1 min-h-[20rem] w-full bg-zinc-950 text-zinc-200 border border-zinc-900 rounded-lg p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-zinc-700"
          />
        </div>
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Output</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="text-zinc-500 hover:text-white hover:bg-purple-600 h-7 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="size-3 mr-1.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3 mr-1.5" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadOutput}
                className="text-zinc-500 hover:text-white hover:bg-purple-600 h-7 text-xs"
              >
                <Download className="size-3 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Converted value..."
            className="flex-1 min-h-[20rem] w-full bg-zinc-950 text-purple-300 border border-zinc-900 rounded-lg p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700"
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={handleConvert}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 h-9 text-sm font-medium"
        >
          Convert
        </Button>
        <Button
          onClick={clearAll}
          variant="ghost"
          className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 h-9 text-sm"
        >
          <Trash2 className="size-3.5 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
}
