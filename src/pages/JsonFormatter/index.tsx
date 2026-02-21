import { useState, useRef, useEffect } from 'react';
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
  X,
  AlignLeft,
  Wrench,
  Lightbulb,
  BookOpen,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { OptionsHeader, type FormatOptions } from './OptionsHeader';
import { formatJson as formatJsonApi } from '../../api/jsonFormatter';
import { formatJsonInBrowser } from '../../api/jsonFormatter/formatInBrowser';
import { fixJson, suggestJson, explainJson } from '../../api/jsonFormatter/ai';

const markdownClass =
  'text-[12px] text-zinc-500 leading-relaxed break-words [&_p]:my-0.5 [&_ul]:my-0.5 [&_ol]:my-0.5 [&_li]:my-0 [&_code]:bg-zinc-800/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-violet-400/90 [&_code]:text-[11px] [&_code]:break-words [&_pre]:bg-zinc-800/80 [&_pre]:p-1.5 [&_pre]:rounded [&_pre]:text-[11px] [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_strong]:text-zinc-400';

export function JsonFormatter() {
  const [loading, setLoading] = useState(false);
  const [loadingFix, setLoadingFix] = useState(false);
  const [isInputFullscreen, setIsInputFullscreen] = useState(false);
  const [isExplainFullscreen, setIsExplainFullscreen] = useState(false);
  const [isSuggestFullscreen, setIsSuggestFullscreen] = useState(false);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const explainSectionRef = useRef<HTMLDivElement>(null);
  const suggestSectionRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onFullscreenChange = () => {
      const el = document.fullscreenElement;
      setIsInputFullscreen(!!el && el === inputSectionRef.current);
      setIsExplainFullscreen(!!el && el === explainSectionRef.current);
      setIsSuggestFullscreen(!!el && el === suggestSectionRef.current);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);
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

  const toggleInputFullscreen = async () => {
    if (!inputSectionRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await inputSectionRef.current.requestFullscreen();
      }
    } catch {
      toast.error('Fullscreen not supported');
    }
  };

  const toggleExplainFullscreen = async () => {
    if (!explainSectionRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await explainSectionRef.current.requestFullscreen();
      }
    } catch {
      toast.error('Fullscreen not supported');
    }
  };

  const toggleSuggestFullscreen = async () => {
    if (!suggestSectionRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await suggestSectionRef.current.requestFullscreen();
      }
    } catch {
      toast.error('Fullscreen not supported');
    }
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

  /** Fix only: fix invalid JSON and update input (no format, no AI). */
  const handleFixOnly = async () => {
    const raw = input.trim();
    if (!raw) {
      toast.error('Enter or paste JSON first');
      return;
    }
    setError(null);
    setLoadingFix(true);
    try {
      const fixed = await fixJson(raw);
      setInput(fixed);
      toast.success('Fixed');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      setError('Error: ' + msg);
      toast.error(msg);
    } finally {
      setLoadingFix(false);
    }
  };

  /** Format only: apply current options in the browser (no API, instant). */
  const handleFormatOnly = () => {
    const raw = input.trim();
    if (!raw) {
      toast.error('Enter or paste JSON first');
      return;
    }
    setError(null);
    try {
      const result = formatJsonInBrowser(raw, options);
      setInput(result);
      toast.success('Formatted');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      setError('Error: ' + msg);
      toast.error(msg);
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

      {/* Full width input when right pane empty; 70/30 split when Explain/Suggest have content */}
      {(() => {
        const hasRightPane = aiExplain !== null || loadingRefreshExplain || aiSuggest !== null || loadingRefreshSuggest;
        return (
      <div className={`grid grid-cols-1 flex-1 min-h-0 gap-4 ${hasRightPane ? 'lg:grid-cols-[7fr_3fr]' : ''}`}>
        {/* Input: 100% when no right pane, 70% when right pane visible */}
        <div
          ref={inputSectionRef}
          className={`flex flex-col gap-2 min-h-0 ${isInputFullscreen ? 'max-h-none' : 'max-h-[calc(100dvh-10rem)]'}`}
        >
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
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleInputFullscreen}
                className="text-zinc-500 hover:text-white hover:bg-purple-600 h-7 w-7 p-0"
                title={isInputFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                aria-label={isInputFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isInputFullscreen ? (
                  <Minimize2 className="size-3.5" />
                ) : (
                  <Maximize2 className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-[20rem] min-h-0 flex flex-col overflow-hidden relative">
            {/* Floating AI button: main at top, hover reveals Fix / Suggest / Explain below */}
            <div
              className="absolute top-3 right-3 z-10 flex flex-col items-center gap-1.5 group"
              aria-label="AI actions"
            >
              <button
                type="button"
                onClick={handleFixFormatAndExplain}
                disabled={loading || loadingFix}
                className="rounded-full w-9 h-9 flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white shadow-md border border-purple-500/30 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                title="Fix, Format & Explain"
                aria-label="AI: Fix, Format & Explain"
              >
                <Sparkles className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => handleFixOnly()}
                disabled={loadingFix || loading}
                className="rounded-full w-7 h-7 flex items-center justify-center bg-zinc-900 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-500 opacity-0 translate-y-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 shadow-sm"
                title="Fix"
                aria-label="Fix"
              >
                <Wrench className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleRefreshSuggest()}
                disabled={loadingRefreshSuggest || loading}
                className="rounded-full w-7 h-7 flex items-center justify-center bg-zinc-900 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-500 opacity-0 translate-y-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 shadow-sm"
                title="Suggest"
                aria-label="Suggest"
              >
                <Lightbulb className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleRefreshExplain()}
                disabled={loadingRefreshExplain || loading}
                className="rounded-full w-7 h-7 flex items-center justify-center bg-zinc-900 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-500 opacity-0 translate-y-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 shadow-sm"
                title="Explain"
                aria-label="Explain"
              >
                <BookOpen className="size-3.5" />
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"name":"John","age":30,"city":"New York"}'
              className="flex-1 min-h-[20rem] w-full bg-zinc-950 text-zinc-200 border border-zinc-900 rounded-lg p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-zinc-700"
            />
          </div>
        </div>

        {hasRightPane && (
        <div className="flex flex-col gap-0 min-h-0 max-h-[calc(100dvh-10rem)] w-full max-w-full min-w-0">
          {/* Spacer: same height as left "JSON" label row + gap so Explain aligns with textarea */}
          <div className="h-10 shrink-0" aria-hidden />
          {/* Explain — top: only when there is content or loading */}
          {(aiExplain !== null || loadingRefreshExplain) && (
            <div
              ref={explainSectionRef}
              className="relative flex-1 min-h-0 flex flex-col overflow-hidden min-h-[8rem] bg-zinc-900/50 rounded"
            >
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
                  <button
                    type="button"
                    onClick={toggleExplainFullscreen}
                    className="size-6 rounded text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800/50 flex items-center justify-center"
                    title={isExplainFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    aria-label={isExplainFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {isExplainFullscreen ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExplainRefineInput((v) => !v)}
                    className="size-6 rounded text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800/50 flex items-center justify-center"
                    title="Refine"
                  >
                    <MessageSquarePlus className="size-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-w-0 overflow-auto px-3 py-2">
                {loadingRefreshExplain && aiExplain === null ? (
                  <p className="text-[11px] text-zinc-500 flex items-center gap-2"><Loader2 className="size-3 animate-spin" /> Loading…</p>
                ) : aiExplain === null ? null : (
                  <div className={markdownClass}>
                    <ReactMarkdown>{aiExplain}</ReactMarkdown>
                  </div>
                )}
              </div>
              {showExplainRefineInput && (
                <div className="absolute bottom-[15px] left-[15px] right-[15px] flex items-center rounded-md bg-zinc-800/90 border-b-2 border-purple-500/70 px-2 py-0.5">
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
                    className="min-w-0 flex-1 bg-transparent border-0 pl-0 pr-2 py-1 text-[11px] text-zinc-400 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
                    autoFocus
                    disabled={loadingExplainRefine}
                  />
                  <button
                    type="button"
                    onClick={() => setShowExplainRefineInput(false)}
                    className="size-6 flex items-center justify-center text-zinc-600 hover:text-zinc-400 shrink-0"
                    aria-label="Close"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Suggest — only when there is content or loading */}
          {(aiSuggest !== null || loadingRefreshSuggest) && (
            <div
              ref={suggestSectionRef}
              className="relative flex-1 min-h-0 flex flex-col overflow-hidden mt-4 min-h-[8rem] bg-zinc-900/50 rounded"
            >
              <div className="flex items-center justify-between gap-2 pl-2 pr-1 py-1 shrink-0 border-l-2 border-violet-500/50 bg-zinc-900/30">
                <span className="text-[11px] font-medium text-violet-400/90">Suggest</span>
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
                  <button
                    type="button"
                    onClick={toggleSuggestFullscreen}
                    className="size-6 rounded text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800/50 flex items-center justify-center"
                    title={isSuggestFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    aria-label={isSuggestFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {isSuggestFullscreen ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSuggestRefineInput((v) => !v)}
                    className="size-6 rounded text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800/50 flex items-center justify-center"
                    title="Refine"
                  >
                    <MessageSquarePlus className="size-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-w-0 overflow-auto px-3 py-2">
                {loadingRefreshSuggest && aiSuggest === null ? (
                  <p className="text-[11px] text-zinc-500 flex items-center gap-2"><Loader2 className="size-3 animate-spin" /> Loading…</p>
                ) : aiSuggest === null ? null : (
                  <div className={markdownClass}>
                    <ReactMarkdown>{aiSuggest}</ReactMarkdown>
                  </div>
                )}
              </div>
              {showSuggestRefineInput && (
                <div className="absolute bottom-[15px] left-[15px] right-[15px] flex items-center rounded-md bg-zinc-800/90 border-b-2 border-purple-500/70 px-2 py-0.5">
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
                    className="min-w-0 flex-1 bg-transparent border-0 pl-0 pr-2 py-1 text-[11px] text-zinc-400 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
                    autoFocus
                    disabled={loadingSuggestRefine}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSuggestRefineInput(false)}
                    className="size-6 flex items-center justify-center text-zinc-600 hover:text-zinc-400 shrink-0"
                    aria-label="Close"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>
        );
      })()}

      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={handleFormatOnly}
          disabled={loading || loadingFix}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 h-9 text-sm font-medium flex items-center gap-2"
        >
          <AlignLeft className="size-4" />
          Format JSON
        </Button>
        <Button
          onClick={handleFixFormatAndExplain}
          disabled={loading || loadingFix}
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
          disabled={loading || loadingFix}
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
