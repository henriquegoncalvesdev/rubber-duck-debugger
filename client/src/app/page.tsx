'use client';

import { useState, useEffect } from 'react';
import { PanelLeft, Sparkles, Bug, Split, Eye } from 'lucide-react';
import { nanoid } from 'nanoid';
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
import { cn } from '@/lib/utils';
import CodeEditor from '@/components/CodeEditor';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import PersonaAvatar, { personas, PersonaType } from '@/components/PersonaAvatar';
import SessionHistory, { HistoryItem } from '@/components/SessionHistory';
import DiffViewer from '@/components/DiffViewer';

export default function Home() {
  // State
  const [code, setCode] = useState('// Paste your code here to debug...');
  const [persona, setPersona] = useState<PersonaType>('senior');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [extractedFix, setExtractedFix] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<'code' | 'result'>('code');

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('duck_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history change
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('duck_history', JSON.stringify(newHistory));
  };

  const handleRunDebug = async () => {
    if (!code || code.trim().length === 0) return;

    setIsLoading(true);
    setResponse('');
    setExtractedFix(null);
    setShowDiff(false);

    // Create new session ID if starting fresh or if we want to treat this as a new entry
    // For simplicity, always new entry if code changed significantly? 
    // Let's just create a new entry on completion for now.

    try {
      if (window.innerWidth < 768) {
        setActiveMobileTab('result');
      }

      const res = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, persona }),
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error('You are chatting too fast! Slow down.');
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || res.statusText);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      let fullResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setResponse((prev) => prev + chunk);
      }

      // Analysis complete
      const newItem: HistoryItem = {
        id: nanoid(),
        code,
        persona,
        response: fullResponse,
        timestamp: Date.now(),
      };

      const newHistory = [newItem, ...history];
      saveHistory(newHistory);
      setCurrentSessionId(newItem.id);

      // Attempt to extract code for diff view
      const codeBlockRegex = /```(?:[\w\d]*)\n([\s\S]*?)```/;
      const match = fullResponse.match(codeBlockRegex);
      if (match && match[1]) {
        setExtractedFix(match[1]);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analysis.';
      setResponse(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setCode(item.code);
    setPersona(item.persona as PersonaType);
    setResponse(item.response);
    setCurrentSessionId(item.id);

    // Check for diff capability
    const codeBlockRegex = /```(?:[\w\d]*)\n([\s\S]*?)```/;
    const match = item.response.match(codeBlockRegex);
    if (match && match[1]) {
      setExtractedFix(match[1]);
    } else {
      setExtractedFix(null);
    }

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    saveHistory(newHistory);
    if (currentSessionId === id && newHistory.length > 0) {
      handleSelectHistory(newHistory[0]);
    } else if (newHistory.length === 0) {
      setResponse('');
      setCurrentSessionId(undefined);
    }
  };

  const currentPersona = personas[persona] || personas.senior;

  return (
    <main className="h-screen w-full bg-background text-foreground flex overflow-hidden">

      {/* Session History Sidebar */}
      <SessionHistory
        history={history}
        currentId={currentSessionId}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 transition-all duration-300">

        {/* Header */}
        <header className="px-4 py-3 border-b flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-20 gap-4">
          <div className="flex items-center gap-2 overflow-hidden shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="shrink-0">
              <PanelLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
              <Bug className="w-4 h-4" />
              <span className="font-bold whitespace-nowrap hidden sm:inline">Rubber Duck Debugger</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Persona Selector with Avatars */}
            <Select value={persona} onValueChange={(val) => setPersona(val as PersonaType)}>
              <SelectTrigger className="w-[180px] hidden sm:flex">
                <SelectValue placeholder="Select Persona" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(personas).map(([key, p]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <PersonaAvatar persona={key} size="sm" className="w-5 h-5 border-none" />
                      <span>{p.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Debug Button */}
            <Button
              onClick={handleRunDebug}
              disabled={isLoading}
              className={cn("font-bold shadow-lg transition-all active:scale-95", isLoading && "opacity-80")}
              size="default"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4 mr-2" />
                  Debug
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Mobile Tabs */}
        <div className="md:hidden flex border-b bg-card">
          <button
            onClick={() => setActiveMobileTab('code')}
            className={cn("flex-1 py-2 text-sm font-medium border-b-2", activeMobileTab === 'code' ? "border-primary text-primary" : "border-transparent text-muted-foreground")}
          >
            Code
          </button>
          <button
            onClick={() => setActiveMobileTab('result')}
            className={cn("flex-1 py-2 text-sm font-medium border-b-2", activeMobileTab === 'result' ? "border-primary text-primary" : "border-transparent text-muted-foreground")}
          >
            Result
          </button>
        </div>

        {/* Workspace */}
        <div className="flex-1 overflow-hidden p-2 sm:p-4">
          <ResizablePanelGroup direction="horizontal" className="h-full rounded-xl border bg-card shadow-sm overflow-hidden">

            {/* Left Panel: Code Input */}
            <ResizablePanel
              defaultSize={50}
              minSize={30}
              className={cn(
                "bg-background transition-all duration-300 ease-in-out",
                activeMobileTab !== 'code' && "hidden md:block" // Mobile toggle logic
              )}
            >
              <div className="h-full p-0">
                <CodeEditor
                  onChange={(val) => setCode(val || '')}
                  initialValue={code}
                  onRun={handleRunDebug}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="hidden md:flex" />

            {/* Right Panel: Analysis/Output */}
            <ResizablePanel
              defaultSize={50}
              minSize={30}
              className={cn(
                personas[persona].bgColor, // Dynamic background based on persona
                "bg-opacity-5 transition-colors duration-500",
                activeMobileTab !== 'result' && "hidden md:flex"
              )}
            >
              <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm">

                {/* Result Header */}
                <div className="p-3 border-b flex items-center justify-between shrink-0 h-14 bg-card/40">
                  <div className="flex items-center gap-2">
                    <PersonaAvatar persona={persona} size="sm" />
                    <h2 className={cn("text-sm font-bold tracking-wide", currentPersona.color)}>
                      {persona === 'duck' ? "🦆 Duck says..." :
                        persona === 'senior' ? "Senior's Verdict" :
                          persona === 'academic' ? "Professor's Notes" :
                            "Analysis Result"}
                    </h2>
                  </div>

                  {extractedFix && (
                    <div className="flex items-center gap-1 bg-background rounded-lg border p-1">
                      <Button
                        variant={!showDiff ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowDiff(false)}
                      >
                        <Eye className="w-3 h-3 mr-1" /> View
                      </Button>
                      <Button
                        variant={showDiff ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowDiff(true)}
                      >
                        <Split className="w-3 h-3 mr-1" /> Diff
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto relative">
                  {response ? (
                    showDiff && extractedFix ? (
                      <DiffViewer original={code} modified={extractedFix} />
                    ) : (
                      <div className="p-4 sm:p-6 prose dark:prose-invert max-w-none prose-sm sm:prose-base leading-relaxed">
                        <MarkdownRenderer content={response} />
                      </div>
                    )
                  ) : (
                    // Empty State
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60 space-y-4 select-none animate-in fade-in duration-700">
                      <div className={cn("p-6 rounded-full bg-accent/30 mb-2", currentPersona.color)}>
                        <currentPersona.icon className="w-12 h-12 sm:w-16 sm:h-16 opacity-50" />
                      </div>
                      <p className="text-center max-w-xs text-sm sm:text-base px-4">
                        {persona === 'duck' ? "Quack! Paste code. I will listen." :
                          "Ready to analyze. Paste your snippet to begin."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </main>
  );
}
