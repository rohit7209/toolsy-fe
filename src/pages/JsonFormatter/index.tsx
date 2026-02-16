import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Copy,
  Check,
  Trash2,
  Download,
  Upload,
  Settings2,
  Sparkles,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Send,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { OptionsHeader, type FormatOptions } from './OptionsHeader';
import { formatJson as formatJsonApi } from '../../api/jsonFormatter';
import { fixJson, suggestJson, explainJson } from '../../api/jsonFormatter/ai';

const markdownClass =
  'text-[12px] text-zinc-500 leading-relaxed [&_p]:my-0.5 [&_ul]:my-0.5 [&_ol]:my-0.5 [&_li]:my-0 [&_code]:bg-zinc-800/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-violet-400/90 [&_code]:text-[11px] [&_pre]:bg-zinc-800/80 [&_pre]:p-1.5 [&_pre]:rounded [&_pre]:text-[11px] [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_strong]:text-zinc-400';

export function JsonFormatter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [aiSuggest, setAiSuggest] = useState<string | null>(null);
  const [aiExplain, setAiExplain] = useState<string | null>(null);
  const [suggestInstruction, setSuggestInstruction] = useState('');
  const [explainInstruction, setExplainInstruction] = useState('');
  const [loadingSuggestRefine, setLoadingSuggestRefine] = useState(false);
  const [loadingExplainRefine, setLoadingExplainRefine] = useState(false);
  const [loadingRefreshExplain, setLoadingRefreshExplain] = useState(false);
  const [loadingRefreshSuggest, setLoadingRefreshSuggest] = useState(false);
  const [showSuggestRefineInput, setShowSuggestRefineInput] = useState(false);
  const [showExplainRefineInput, setShowExplainRefineInput] = useState(false);

  const [options, setOptions] = useState<FormatOptions>({
    pretty: true,
    indent: 2,
    sortKeys: false,
    validateOnly: false,
    minify: false,
    asJsObject: false,
    jsQuote: "'",
    indentType: 100,
  });

  const updateOption = <K extends keyof FormatOptions>(
    key: K,
    value: FormatOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = () => {
    if (!input) {
      toast.error('Nothing to copy');
      return;
    }
    navigator.clipboard.writeText(input);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setAiSuggest(null);
    setAiExplain(null);
    setSuggestInstruction('');
    setExplainInstruction('');
    setShowSuggestRefineInput(false);
    setShowExplainRefineInput(false);
    toast.success('Cleared');
  };

  const downloadJson = () => {
    if (!input) {
      toast.error('Nothing to download');
      return;
    }
    const blob = new Blob([input], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = options.asJsObject ? 'formatted.js' : 'formatted.json';
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

  /** Single flow: fix → format → update input → explain + suggest in parallel */
  const handleFixFormatAndExplain = async () => {
    const raw = input.trim();
    if (!raw) {
      toast.error('Enter or paste JSON first');
      return;
    }
    setError(null);
    setLoading(true);
    setAiExplain(null);
    setAiSuggest(null);
    try {
      const fixed = await fixJson(raw);
      const formatted = await formatJsonApi(fixed, options);
      const result =
        typeof formatted === 'string'
          ? formatted
          : (formatted as { data?: string })?.data ?? fixed;
      setInput(result);

      const [explainText, suggestText] = await Promise.all([
        explainJson(result),
        suggestJson(result),
      ]);
      setAiExplain(explainText);
      setAiSuggest(suggestText);
      toast.success('Fixed, formatted, and explained');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      setError('Error: ' + msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestWithInstruction = async () => {
    const raw = input.trim();
    if (!raw) {
      toast.error('No JSON in the editor.');
      return;
    }
    if (!suggestInstruction.trim()) {
      toast.error('Enter an instruction');
      return;
    }
    try {
      setLoadingSuggestRefine(true);
      const text = await suggestJson(raw, suggestInstruction.trim());
      setAiSuggest(text);
      toast.success('Suggestions updated');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to refine');
    } finally {
      setLoadingSuggestRefine(false);
    }
  };

  const handleExplainWithInstruction = async () => {
    const raw = input.trim();
    if (!raw) {
      toast.error('No JSON in the editor.');
      return;
    }
    if (!explainInstruction.trim()) {
      toast.error('Enter an instruction');
      return;
    }
    try {
      setLoadingExplainRefine(true);
      const text = await explainJson(raw, explainInstruction.trim());
      setAiExplain(text);
      toast.success('Explanation updated');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to refine');
    } finally {
      setLoadingExplainRefine(false);
    }
  };

  const handleRefreshExplain = async () => {
    const raw = input.trim();
    if (!raw) {
      toast.error('No JSON in the editor.');
      return;
    }
    try {
      setLoadingRefreshExplain(true);
      const text = await explainJson(raw);
      setAiExplain(text);
      toast.success('Explanation refreshed');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to refresh');
    } finally {
      setLoadingRefreshExplain(false);
    }
  };

  const handleRefreshSuggest = async () => {
    const raw = input.trim();
    if (!raw) {
      toast.error('No JSON in the editor.');
      return;
    }
    try {
      setLoadingRefreshSuggest(true);
      const text = await suggestJson(raw);
      setAiSuggest(text);
      toast.success('Suggestions refreshed');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to refresh');
    } finally {
      setLoadingRefreshSuggest(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">JSON Formatter</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Format, validate & transform JSON</p>
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

      <OptionsHeader showSettings={showSettings} options={options} updateOption={updateOption} />

      {/* 70 : 30 — input left, explain (top) + suggest (bottom) right */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-4 flex-1 min-h-0">
        {/* Left 70%: single input (output overwrites same area after fix+format); max height = screen */}
        <div className="flex flex-col gap-2 min-h-0 max-h-[calc(100dvh-10rem)]">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              JSON
            </span>
            <div className="flex items-center gap-1">
              <label htmlFor="file-upload" className="cursor-pointer">
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
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="text-zinc-500 hover:text-white hover:bg-purple-600 h-7 text-xs"
              >
                {copied ? <Check className="size-3 mr-1.5" /> : <Copy className="size-3 mr-1.5" />}
                {copied ? ' Copied' : ' Copy'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadJson}
                className="text-zinc-500 hover:text-white hover:bg-purple-600 h-7 text-xs"
              >
                <Download className="size-3 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-[20rem] min-h-0 flex flex-col overflow-hidden">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"name":"John","age":30,"city":"New York"}'
              className="flex-1 min-h-[20rem] w-full bg-zinc-950 text-zinc-200 border border-zinc-900 rounded-lg p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-zinc-700"
            />
          </div>
        </div>

        {/* Right 30%: spacer so Explain starts at textarea level, then Explain + Suggest */}
        <div className="flex flex-col gap-0 min-h-0 max-h-[calc(100dvh-10rem)]">
          {/* Spacer: same height as left "JSON" label row + gap so Explain aligns with textarea */}
          <div className="h-10 shrink-0" aria-hidden />
          {/* Explain — top */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-2 pl-2 pr-1 py-1 shrink-0 border-l-2 border-violet-500/50 bg-zinc-900/30">
              <span className="text-[11px] font-medium text-violet-400/90">Explain</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleRefreshExplain}
                  disabled={loadingRefreshExplain}
                  className="size-6 rounded text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800/50 flex items-center justify-center disabled:opacity-50"
                  title="Refresh explanation"
                >
                  {loadingRefreshExplain ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
                </button>
                {!showExplainRefineInput ? (
                  <button
                    type="button"
                    onClick={() => setShowExplainRefineInput(true)}
                    className="size-6 rounded text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800/50 flex items-center justify-center"
                    title="Refine"
                  >
                    <MessageSquarePlus className="size-3" />
                  </button>
                ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={explainInstruction}
                    onChange={(e) => setExplainInstruction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (explainInstruction.trim()) handleExplainWithInstruction();
                        else setShowExplainRefineInput(false);
                      }
                    }}
                    placeholder="Refine..."
                    className="w-20 min-w-0 rounded bg-transparent border-0 px-1 py-0.5 text-[11px] text-zinc-400 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (explainInstruction.trim()) handleExplainWithInstruction();
                      else setShowExplainRefineInput(false);
                    }}
                    disabled={loadingExplainRefine}
                    className="size-6 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-400 disabled:opacity-50"
                  >
                    {loadingExplainRefine ? <Loader2 className="size-3 animate-spin" /> : explainInstruction.trim() ? <Send className="size-3" /> : <X className="size-3" />}
                  </button>
                </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-auto px-3 py-2">
              {aiExplain === null ? (
                <p className="text-[11px] text-zinc-600">Run Fix & Explain.</p>
              ) : (
                <div className={markdownClass}>
                  <ReactMarkdown>{aiExplain}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          {/* Suggest — bottom */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden mt-4">
            <div className="flex items-center justify-between gap-2 pl-2 pr-1 py-1 shrink-0 border-l-2 border-amber-500/50 bg-zinc-900/30">
              <span className="text-[11px] font-medium text-amber-400/90">Suggest</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleRefreshSuggest}
                  disabled={loadingRefreshSuggest}
                  className="size-6 rounded text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800/50 flex items-center justify-center disabled:opacity-50"
                  title="Refresh suggestions"
                >
                  {loadingRefreshSuggest ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
                </button>
                {!showSuggestRefineInput ? (
                  <button
                    type="button"
                    onClick={() => setShowSuggestRefineInput(true)}
                    className="size-6 rounded text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800/50 flex items-center justify-center"
                    title="Refine"
                  >
                    <MessageSquarePlus className="size-3" />
                  </button>
                ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={suggestInstruction}
                    onChange={(e) => setSuggestInstruction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (suggestInstruction.trim()) handleSuggestWithInstruction();
                        else setShowSuggestRefineInput(false);
                      }
                    }}
                    placeholder="Refine..."
                    className="w-20 min-w-0 rounded bg-transparent border-0 px-1 py-0.5 text-[11px] text-zinc-400 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (suggestInstruction.trim()) handleSuggestWithInstruction();
                      else setShowSuggestRefineInput(false);
                    }}
                    disabled={loadingSuggestRefine}
                    className="size-6 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-400 disabled:opacity-50"
                  >
                    {loadingSuggestRefine ? <Loader2 className="size-3 animate-spin" /> : suggestInstruction.trim() ? <Send className="size-3" /> : <X className="size-3" />}
                  </button>
                </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-auto px-3 py-2">
              {aiSuggest === null ? (
                <p className="text-[11px] text-zinc-600">Run Fix & Explain.</p>
              ) : (
                <div className={markdownClass}>
                  <ReactMarkdown>{aiSuggest}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={handleFixFormatAndExplain}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 h-9 text-sm font-medium flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Fix, Format & Explain
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
        {error && <span className="text-red-400 text-sm">{error}</span>}
      </div>

      <span className="text-zinc-600 text-xs">version: v02022026-1</span>
    </div>
  );
}
