'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { Copy, Check, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MarkdownRendererProps {
    content: string;
}

const PreBlock = ({ children, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>) => {
    const [copied, setCopied] = useState(false);

    // Extract code content safely
    let codeContent = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childProps = (children as any)?.props;
    if (childProps && childProps.children) {
        codeContent = String(childProps.children).replace(/\n$/, '');
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(codeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-4 rounded-lg border bg-muted/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">Code Snippet</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={handleCopy}
                >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </Button>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre {...props} className="bg-transparent p-0 m-0">
                    {children}
                </pre>
            </div>
        </div>
    );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            components={{
                pre: PreBlock,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                code: ({ node, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;

                    if (isInline) {
                        return (
                            <code className={cn("bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary", className)} {...props}>
                                {children}
                            </code>
                        )
                    }

                    return (
                        <code className={cn(className, "text-sm")} {...props}>
                            {children}
                        </code>
                    );
                }
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;
