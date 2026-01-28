import { useState } from 'react';
import { Copy, Check, Trash2, Download, Upload, Settings2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { OptionsHeader, type FormatOptions } from './OptionsHeader';
import { formatJson as formatJsonApi } from '../../api/jsonFormatter';


export function JsonFormatter() {
  const [data, setData] = useState<[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
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
                className="text-zinc-500 hover:text-zinc-300 h-7 text-xs"
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
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"name":"John","age":30,"city":"New York"}'
            className="flex-1 bg-zinc-950 text-zinc-200 border border-zinc-900 rounded-lg p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-zinc-700"
          />
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
                className="text-zinc-500 hover:text-zinc-300 h-7 text-xs"
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
                className="text-zinc-500 hover:text-zinc-300 h-7 text-xs"
              >
                <Download className="size-3 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted output..."
            className="flex-1 bg-zinc-950 text-purple-300 border border-zinc-900 rounded-lg p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={formatJson}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 h-9 text-sm font-medium"
        >
          Format
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