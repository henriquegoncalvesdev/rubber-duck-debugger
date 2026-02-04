'use client';

import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
    initialValue?: string;
    language?: string;
    onChange?: (value: string | undefined) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    initialValue = '// Paste your code here...',
    language = 'javascript',
    onChange,
}) => {
    const handleEditorChange = (value: string | undefined) => {
        if (onChange) {
            onChange(value);
        }
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        // Configure editor options here if needed
        editor.updateOptions({
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
        });
    };

    return (
        <div className="h-full w-full rounded-md border border-input bg-background overflow-hidden">
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
    );
};

export default CodeEditor;
