'use client';

import React, { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
    initialValue?: string;
    language?: string;
    onChange?: (value: string | undefined) => void;
    onRun?: () => void;
}

const MAX_CHARS = 5000;

const CodeEditor: React.FC<CodeEditorProps> = ({
    initialValue = '// Paste your code here...',
    language = 'javascript',
    onChange,
    onRun,
}) => {
    const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
    const [charCount, setCharCount] = useState(initialValue.length);

    const handleEditorChange = (value: string | undefined) => {
        const currentLength = value?.length || 0;
        setCharCount(currentLength);

        if (onChange) {
            onChange(value);
        }
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;

        // Configure editor options
        editor.updateOptions({
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
        });

        // Add keyboard shortcut: Cmd/Ctrl + Enter to run
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            if (onRun) {
                onRun();
            }
        });
    };

    const isOverLimit = charCount > MAX_CHARS;

    return (
        <div className="flex flex-col h-full w-full rounded-md border border-input bg-background overflow-hidden relative group">
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    defaultLanguage={language}
                    defaultValue={initialValue}
                    theme="vs-dark"
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    options={{
                        padding: { top: 16, bottom: 16 },
                    }}
                />
            </div>

            {/* Footer with Char Count and Hint */}
            <div className="absolute bottom-2 right-4 flex items-center gap-2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="bg-background/80 backdrop-blur px-2 py-1 rounded text-xs border shadow-sm">
                    <span className="text-xs text-muted-foreground mr-2">
                        ⌘ + Enter to run
                    </span>
                    <span className={cn(
                        "font-mono transition-colors",
                        isOverLimit ? "text-destructive font-bold" : "text-muted-foreground"
                    )}>
                        {charCount}/{MAX_CHARS}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
