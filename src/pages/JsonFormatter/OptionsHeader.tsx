import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";


export interface FormatOptions {
    pretty: boolean;
    indent: number;
    sortKeys: boolean;
    validateOnly: boolean;
    minify: boolean;
    asJsObject: boolean;
    jsQuote: "'" | '"';
    indentType: 100 | 200;
}

interface OptionsHeaderProps {
    showSettings: boolean,
    updateOption: <K extends keyof FormatOptions>(key: K, value: FormatOptions[K]) => void;
    options: FormatOptions;
}

export function OptionsHeader({ showSettings, options, updateOption }: OptionsHeaderProps) {
    const updateIndentType = (value: 100 | 200) => {
        updateOption('indentType', value);
        if (value === 200) {
            updateOption('indent', 1);
        }
    };

    return (
        <div>
            {showSettings && (
                <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5">
                    <div className="flex flex-wrap gap-x-8 gap-y-4">

                        {/* Validate Only */}
                        <div className="flex items-center gap-3">
                            <Switch
                                id="validateOnly"
                                checked={options.validateOnly}
                                onCheckedChange={(checked) => updateOption('validateOnly', checked)}
                            />
                            <Label htmlFor="validateOnly" className="text-xs text-zinc-400 cursor-pointer font-normal">
                                Validate Only
                            </Label>
                        </div>

                        {/* Sort Keys */}
                        <div className="flex items-center gap-3">
                            <Switch
                                id="sortKeys"
                                checked={options.sortKeys}
                                onCheckedChange={(checked) => updateOption('sortKeys', checked)}
                            />
                            <Label htmlFor="sortKeys" className="text-xs text-zinc-400 cursor-pointer font-normal">
                                Sort Keys
                            </Label>
                        </div>

                        {/* Minify */}
                        <div className="flex items-center gap-3">
                            <Switch
                                id="minify"
                                checked={options.minify}
                                onCheckedChange={(checked) => updateOption('minify', checked)}
                            />
                            <Label htmlFor="minify" className="text-xs text-zinc-400 cursor-pointer font-normal">
                                Minify
                            </Label>
                        </div>

                        {/* As JS Object */}
                        <div className="flex items-center gap-3">
                            <Switch
                                id="asJsObject"
                                checked={options.asJsObject}
                                onCheckedChange={(checked) => updateOption('asJsObject', checked)}
                            />
                            <Label htmlFor="asJsObject" className="text-xs text-zinc-400 cursor-pointer font-normal">
                                JS Object
                            </Label>
                        </div>

                        {/* Indent Type */}
                        <div className="flex items-center gap-3">
                            <Label htmlFor="indentType" className="text-xs text-zinc-400 font-normal">
                                Indent
                            </Label>
                            <select
                                id="indentType"
                                value={options.indentType}
                                onChange={(e) => updateIndentType(parseInt(e.target.value) as 100 | 200)}
                                className="bg-black text-zinc-400 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-zinc-700"
                            >
                                <option value="100">Spaces</option>
                                <option value="200">Tabs</option>
                            </select>
                        </div>

                        {/* Indent Size */}
                        <div className="flex items-center gap-3">
                            <Label htmlFor="indent" className="text-xs text-zinc-400 font-normal">
                                Size
                            </Label>
                            <select
                                id="indent"
                                value={options.indent}
                                onChange={(e) => updateOption('indent', Number(e.target.value))}
                                disabled={options.indentType === 200}
                                className="bg-black text-zinc-400 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-zinc-700 disabled:opacity-30"
                            >
                                <option value={2}>2</option>
                                <option value={4}>4</option>
                                <option value={8}>8</option>
                            </select>
                        </div>

                        {/* JS Quote */}
                        <div className="flex items-center gap-3">
                            <Label htmlFor="jsQuote" className="text-xs text-zinc-400 font-normal">
                                Quote
                            </Label>
                            <select
                                id="jsQuote"
                                value={options.jsQuote}
                                onChange={(e) => updateOption('jsQuote', e.target.value as "'" | '"')}
                                disabled={!options.asJsObject}
                                className="bg-black text-zinc-400 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-zinc-700 disabled:opacity-30"
                            >
                                <option value="'">Single</option>
                                <option value={'"'}>Double</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
