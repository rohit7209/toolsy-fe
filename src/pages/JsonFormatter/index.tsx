import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Trash2, Download, Upload, Settings2, Sparkles, Loader2, Lightbulb, FileText, Wrench, MessageSquarePlus, Send, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { OptionsHeader, type FormatOptions } from './OptionsHeader';
import { formatJson as formatJsonApi } from '../../api/jsonFormatter';
import { fixJson, suggestJson, explainJson } from '../../api/jsonFormatter/ai';


export function JsonFormatter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [aiSuggest, setAiSuggest] = useState<string | null>(null);
  const [aiExplain, setAiExplain] = useState<string | null>(null);
  const [lastAiResultType, setLastAiResultType] = useState<'suggest' | 'explain' | null>(null);
  const [loadingFix, setLoadingFix] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [suggestInstruction, setSuggestInstruction] = useState('');
  const [explainInstruction, setExplainInstruction] = useState('');
  const [loadingSuggestRefine, setLoadingSuggestRefine] = useState(false);
  const [loadingExplainRefine, setLoadingExplainRefine] = useState(false);
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

  // const formatJson = () => {
  //   try {
  //     if (!input.trim()) {
  //       toast.error('Please enter JSON to format');
  //       return;
  //     }

  //     let parsed = JSON.parse(input);

  //     // Validate only mode
  //     if (options.validateOnly) {
  //       setOutput('✓ Valid JSON');
  //       toast.success('JSON is valid!');
  //       return;
  //     }

  //     // Sort keys
  //     if (options.sortKeys) {
  //       const sortObject = (obj: any): any => {
  //         if (Array.isArray(obj)) {
  //           return obj.map(sortObject);
  //         } else if (obj !== null && typeof obj === 'object') {
  //           return Object.keys(obj)
  //             .sort()
  //             .reduce((result: any, key) => {
  //               result[key] = sortObject(obj[key]);
  //               return result;
  //             }, {});
  //         }
  //         return obj;
  //       };
  //       parsed = sortObject(parsed);
  //     }

  //     // Minify
  //     if (options.minify) {
  //       const minified = JSON.stringify(parsed);
  //       setOutput(minified);
  //       toast.success('JSON minified successfully!');
  //       return;
  //     }

  //     // Format as JS Object
  //     if (options.asJsObject) {
  //       const indentStr = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indent);
  //       let formatted = JSON.stringify(parsed, null, indentStr);
        
  //       // Convert to JS object syntax
  //       formatted = formatted
  //         .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
  //         .replace(/: "([^"]*)"/g, `: ${options.jsQuote}$1${options.jsQuote}`); // Change string quotes
        
  //       setOutput(formatted);
  //       toast.success('Converted to JS object!');
  //       return;
  //     }

  //     // Pretty print
  //     if (options.pretty) {
  //       const indentStr = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indent);
  //       const formatted = JSON.stringify(parsed, null, indentStr);
  //       setOutput(formatted);
  //       toast.success('JSON formatted successfully!');
  //     } else {
  //       setOutput(JSON.stringify(parsed));
  //       toast.success('JSON processed!');
  //     }
  //   } catch (error) {
  //     toast.error('Invalid JSON: ' + (error as Error).message);
  //   }
  // };

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
    setAiSuggest(null);
    setAiExplain(null);
    setLastAiResultType(null);
    setSuggestInstruction('');
    setExplainInstruction('');
    setShowSuggestRefineInput(false);
    setShowExplainRefineInput(false);
    toast.success('Cleared');
  };

  const downloadJson = () => {
    if (!output) {
      toast.error('Nothing to download');
      return;
    }
    const blob = new Blob([output], { type: 'application/json' });
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

  const formatJson = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: any = await formatJsonApi(input, options);

      if(options.validateOnly) {
        setOutput('✓ Valid JSON');
        toast.success('JSON is valid!');
      } else {
        setOutput(data);
        toast.success('JSON formatted successfully!');
      }
    } catch (e: any) {
      setError("Error: " + e.message);
      toast.error("Failed to format JSON");
    } finally {
      setLoading(false);
    }
  };

  const handleAiFix = async () => {
    const raw = input.trim();
    if (!raw) {
      toast.error('Enter JSON in the input section to fix');
      return;
    }
    try {
      setLoadingFix(true);
      const fixed = await fixJson(raw);
      setOutput(fixed);
      toast.success('AI fixed JSON');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to fix');
    } finally {
      setLoadingFix(false);
    }
  };

  const handleAiSuggest = async () => {
    const raw = output.trim();
    if (!raw) {
      toast.error('JSON not found. Format or paste JSON in the output section first.');
      return;
    }
    try {
      setLoadingSuggest(true);
      setAiSuggest(null);
      const text = await suggestJson(raw);
      setAiSuggest(text);
      setLastAiResultType('suggest');
      toast.success('Suggestions ready');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to get suggestions');
    } finally {
      setLoadingSuggest(false);
    }
  };

  const handleAiExplain = async () => {
    const raw = output.trim();
    if (!raw) {
      toast.error('JSON not found. Format or paste JSON in the output section first.');
      return;
    }
    try {
      setLoadingExplain(true);
      setAiExplain(null);
      const text = await explainJson(raw);
      setAiExplain(text);
      setLastAiResultType('explain');
      toast.success('Explanation ready');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to explain');
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleSuggestWithInstruction = async () => {
    const raw = output.trim();
    if (!raw) {
      toast.error('JSON not found. Format or paste JSON in the output section first.');
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
      setLastAiResultType('suggest');
      toast.success('Suggestions updated');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to refine');
    } finally {
      setLoadingSuggestRefine(false);
    }
  };

  const handleExplainWithInstruction = async () => {
    const raw = output.trim();
    if (!raw) {
      toast.error('JSON not found. Format or paste JSON in the output section first.');
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
      setLastAiResultType('explain');
      toast.success('Explanation updated');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to refine');
    } finally {
      setLoadingExplainRefine(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">
      {/* Header */}
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

      {/* Settings Panel */}
      <OptionsHeader showSettings={showSettings} options={options} updateOption={updateOption} />

      {/* Editor Grid */}
      <div className="grid md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Input Panel */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Input</span>
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
          </div>
          <div className="relative flex-1 min-h-0 flex flex-col">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"name":"John","age":30,"city":"New York"}'
              className="flex-1 min-h-0 w-full bg-zinc-950 text-zinc-200 border border-zinc-900 rounded-lg p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-zinc-700"
            />
            <div className="absolute top-2 right-2 flex items-center justify-end gap-1.5 group">
              <div className="flex items-center gap-1.5 overflow-hidden max-w-0 group-hover:max-w-[4rem] transition-[max-width] duration-200 ease-out justify-end">
                <button
                  type="button"
                  onClick={handleAiFix}
                  disabled={loadingFix}
                  className="size-7 rounded-full flex items-center justify-center text-violet-100 bg-violet-600/60 border border-violet-400/40 hover:bg-violet-500/80 hover:text-white shrink-0 transition-colors disabled:opacity-50"
                  title="Fix JSON with AI"
                >
                  {loadingFix ? <Loader2 className="size-3.5 animate-spin" /> : <Wrench className="size-3.5" />}
                </button>
              </div>
              <div
                className="size-8 rounded-full flex items-center justify-center text-violet-400/90 shrink-0 cursor-default transition-colors group-hover:bg-violet-500/15 group-hover:border group-hover:border-violet-500/30"
                title="AI actions — hover to see options"
              >
                <Sparkles className="size-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Output Panel */}
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
                onClick={downloadJson}
                className="text-zinc-500 hover:text-white hover:bg-purple-600 h-7 text-xs"
              >
                <Download className="size-3 mr-1.5" />
                Download
              </Button>
            </div>
          </div>

          <div className="relative flex-1 min-h-0 flex flex-col">
            <textarea
              value={output}
              readOnly
              placeholder="Formatted output..."
              className="flex-1 min-h-0 w-full bg-zinc-950 text-purple-300 border border-zinc-900 rounded-lg p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700"
            />
            <div className="absolute top-2 right-2 flex items-center justify-end gap-1.5 group">
              <div className="flex items-center gap-1.5 overflow-hidden max-w-0 group-hover:max-w-[5rem] transition-[max-width] duration-200 ease-out justify-end">
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={loadingSuggest}
                  className="size-7 rounded-full flex items-center justify-center text-violet-100 bg-violet-600/60 border border-violet-400/40 hover:bg-violet-500/80 hover:text-white shrink-0 transition-colors disabled:opacity-50"
                  title="Suggest improvements"
                >
                  {loadingSuggest ? <Loader2 className="size-3.5 animate-spin" /> : <Lightbulb className="size-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleAiExplain}
                  disabled={loadingExplain}
                  className="size-7 rounded-full flex items-center justify-center text-violet-100 bg-violet-600/60 border border-violet-400/40 hover:bg-violet-500/80 hover:text-white shrink-0 transition-colors disabled:opacity-50"
                  title="Explain JSON"
                >
                  {loadingExplain ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
                </button>
              </div>
              <div
                className="size-8 rounded-full flex items-center justify-center text-violet-400/90 shrink-0 cursor-default transition-colors group-hover:bg-violet-500/15 group-hover:border group-hover:border-violet-500/30"
                title="AI actions — hover to see options"
              >
                <Sparkles className="size-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI result — one at a time; refine at top-right; minimal icon + input on click; Send when text */}
      {lastAiResultType === 'suggest' && aiSuggest !== null && (
        <div className="flex flex-col gap-2 rounded-lg overflow-hidden">
          <div className="pl-3 border-l-2 border-violet-500/30 py-1">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-medium text-violet-500/80 uppercase tracking-wider shrink-0">Suggest</span>
              <div className="flex items-center gap-1 shrink-0">
                {!showSuggestRefineInput ? (
                  <button
                    type="button"
                    onClick={() => setShowSuggestRefineInput(true)}
                    className="size-8 rounded-md flex items-center justify-center text-violet-400 bg-violet-500/15 border border-violet-500/40 hover:bg-violet-500/25 hover:border-violet-400/50 hover:text-violet-300 transition-colors shadow-sm"
                    title="Add instruction"
                  >
                    <MessageSquarePlus className="size-4" />
                  </button>
                ) : (
                  <>
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
                      placeholder="Instruction..."
                      className="min-w-[20rem] w-96 rounded border border-zinc-700 bg-zinc-900/80 px-2 py-1 text-[11px] text-zinc-400 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (suggestInstruction.trim()) handleSuggestWithInstruction();
                        else setShowSuggestRefineInput(false);
                      }}
                      disabled={loadingSuggestRefine}
                      className="size-7 rounded flex items-center justify-center text-zinc-500 hover:text-violet-400/90 hover:bg-zinc-800/50 disabled:opacity-50 transition-colors"
                      title={suggestInstruction.trim() ? 'Send' : 'Close'}
                    >
                      {loadingSuggestRefine ? <Loader2 className="size-3.5 animate-spin" /> : suggestInstruction.trim() ? <Send className="size-3.5" /> : <X className="size-3.5" />}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-1 text-sm text-zinc-500 leading-relaxed [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_code]:bg-zinc-800/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-violet-400/90 [&_code]:text-xs [&_pre]:bg-zinc-800/80 [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_strong]:text-zinc-400">
              <ReactMarkdown>{aiSuggest}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
      {lastAiResultType === 'explain' && aiExplain !== null && (
        <div className="flex flex-col gap-2 rounded-lg overflow-hidden">
          <div className="pl-3 border-l-2 border-violet-500/30 py-1">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-medium text-violet-500/80 uppercase tracking-wider shrink-0">Explain</span>
              <div className="flex items-center gap-1 shrink-0">
                {!showExplainRefineInput ? (
                  <button
                    type="button"
                    onClick={() => setShowExplainRefineInput(true)}
                    className="size-8 rounded-md flex items-center justify-center text-violet-400 bg-violet-500/15 border border-violet-500/40 hover:bg-violet-500/25 hover:border-violet-400/50 hover:text-violet-300 transition-colors shadow-sm"
                    title="Add instruction"
                  >
                    <MessageSquarePlus className="size-4" />
                  </button>
                ) : (
                  <>
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
                      placeholder="Instruction..."
                      className="min-w-[20rem] w-96 rounded border border-zinc-700 bg-zinc-900/80 px-2 py-1 text-[11px] text-zinc-400 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (explainInstruction.trim()) handleExplainWithInstruction();
                        else setShowExplainRefineInput(false);
                      }}
                      disabled={loadingExplainRefine}
                      className="size-7 rounded flex items-center justify-center text-zinc-500 hover:text-violet-400/90 hover:bg-zinc-800/50 disabled:opacity-50 transition-colors"
                      title={explainInstruction.trim() ? 'Send' : 'Close'}
                    >
                      {loadingExplainRefine ? <Loader2 className="size-3.5 animate-spin" /> : explainInstruction.trim() ? <Send className="size-3.5" /> : <X className="size-3.5" />}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-1 text-sm text-zinc-500 leading-relaxed [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_code]:bg-zinc-800/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-violet-400/90 [&_code]:text-xs [&_pre]:bg-zinc-800/80 [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_strong]:text-zinc-400">
              <ReactMarkdown>{aiExplain}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={formatJson}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 h-9 text-sm font-medium"
        >
          Format
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
        <span>{error}</span>
      </div>

      <span>version: v02022026-1</span>
      </div>
  );
}