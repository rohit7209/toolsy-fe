import { useState } from 'react';
import { Copy, Check, Trash2, Download, Upload, Settings2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { HashGeneratorOptionsHeader } from './OptionsHeader';
import {
  computeHashes,
  formatHashesOutput,
  type HashAlgorithms,
} from '../../utils/hashGenerator';

export function HashGenerator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [algorithms, setAlgorithms] = useState<HashAlgorithms>(['md5', 'sha1', 'sha256']);

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
    a.download = 'hashes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInput(content);
        toast.success('File loaded');
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (!input) {
      toast.error('Enter text or upload a file');
      return;
    }
    if (algorithms.length === 0) {
      toast.error('Select at least one algorithm');
      return;
    }
    setLoading(true);
    try {
      const hashes = await computeHashes(input, algorithms);
      const formatted = formatHashesOutput(hashes);
      setOutput(formatted);
      toast.success('Hashes generated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate hashes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">Hash Generator</h1>
          <p className="text-zinc-500 text-sm mt-0.5">MD5, SHA hashes from text</p>
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

      <HashGeneratorOptionsHeader
        showSettings={showSettings}
        algorithms={algorithms}
        updateAlgorithms={setAlgorithms}
      />

      <div className="grid md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Input</span>
            <label htmlFor="hash-file-upload" className="cursor-pointer">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-500 hover:text-white hover:bg-purple-600 h-7 text-xs"
                asChild
              >
                <div>
                  <Upload className="size-3 mr-1.5" />
                  Upload
                </div>
              </Button>
            </label>
            <input
              id="hash-file-upload"
              type="file"
              accept=".txt,*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
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
            placeholder="Hashes will appear here..."
            className="flex-1 min-h-[20rem] w-full bg-zinc-950 text-purple-300 border border-zinc-900 rounded-lg p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700"
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 h-9 text-sm font-medium"
        >
          Generate
        </Button>
        <Button
          onClick={clearAll}
          variant="ghost"
          disabled={loading}
          className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 h-9 text-sm"
        >
          <Trash2 className="size-3.5 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
}
