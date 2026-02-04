'use client';

import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export default function Home() {
  const [code, setCode] = useState('// Paste your code here to debug...');
  const [persona, setPersona] = useState('senior');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResponse(''); // Clear previous response

    try {
      const res = await fetch('http://localhost:3001/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, persona }),
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error('You are chatting too fast! Slow down.');
        throw new Error(res.statusText);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setResponse((prev) => prev + chunk);
      }
    } catch (error) {
      setResponse('Error: Failed to fetch analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden">
      <header className="px-6 py-4 border-b flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">Code Debugger</h1>
        </div>
        <div className="flex items-center gap-4">
          <Select value={persona} onValueChange={setPersona}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Persona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="senior">Senior Developer</SelectItem>
              <SelectItem value="academic">Academic Professor</SelectItem>
              <SelectItem value="duck">Rubber Duck</SelectItem>
              <SelectItem value="doc_writer">Technical Writer</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAnalyze} disabled={isLoading} size="default">
            {isLoading ? 'Analyzing...' : 'Debug'}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-4">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-xl border bg-card shadow-sm">
          <ResizablePanel defaultSize={50} minSize={30} className="bg-background">
            <div className="h-full p-0">
              <CodeEditor onChange={(val) => setCode(val || '')} initialValue={code} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={30} className="bg-muted/5">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Analysis Result</h2>
              </div>
              <div className="flex-1 p-6 overflow-auto">
                <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
                  {response ? (
                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                      {response}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-4">
                      <p>Run debug to see analysis here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}
