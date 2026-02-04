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
        if (res.status === 429) throw new Error('You are chatting too fast! Slow down, duckie. 🦆');
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

  const handleGenerateDocs = async () => {
    setIsLoading(true);
    setResponse('');

    try {
      const res = await fetch('http://localhost:3001/generate-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error('You are chatting too fast! Slow down, duckie. 🦆');
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
      setResponse('Error: Failed to generate docs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden">
      <header className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-bold">Rubber Duck Debugger 🦆</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGenerateDocs} disabled={isLoading}>
            Generate Docs
          </Button>
          <Select value={persona} onValueChange={setPersona}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Persona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="senior">Senior Developer</SelectItem>
              <SelectItem value="academic">Academic Professor</SelectItem>
              <SelectItem value="duck">Rubber Duck</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? 'Thinking...' : 'Debug'}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-4">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-2">
              <CodeEditor onChange={(val) => setCode(val || '')} initialValue={code} />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4 overflow-auto bg-muted/20">
              <h2 className="text-lg font-semibold mb-2">Analysis</h2>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}
