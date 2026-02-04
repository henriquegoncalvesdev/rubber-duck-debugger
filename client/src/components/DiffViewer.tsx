'use client';

import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

interface DiffViewerProps {
    original: string;
    modified: string;
    language?: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({
    original,
    modified,
    language = 'javascript'
}) => {
    return (
        <div className="h-full w-full rounded-md border overflow-hidden">
            <DiffEditor
                height="100%"
                language={language}
                original={original}
                modified={modified}
                theme="vs-dark"
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    renderSideBySide: true,
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', monospace",
                }}
            />
        </div>
    );
};

export default DiffViewer;
