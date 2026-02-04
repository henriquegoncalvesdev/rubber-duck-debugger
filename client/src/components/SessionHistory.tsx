import React from 'react';
import { History, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import PersonaAvatar from './PersonaAvatar';

export interface HistoryItem {
    id: string;
    code: string;
    persona: string;
    response: string;
    timestamp: number;
}

interface SessionHistoryProps {
    history: HistoryItem[];
    currentId?: string;
    isOpen: boolean;
    onSelect: (item: HistoryItem) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    onToggle: () => void;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({
    history,
    currentId,
    isOpen,
    onSelect,
    onDelete,
    onToggle
}) => {
    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={cn(
                    "fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden",
                    isOpen ? "block" : "hidden"
                )}
                onClick={onToggle}
            />

            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen bg-card border-r transition-transform duration-300 ease-in-out w-72 flex flex-col pt-16 lg:pt-0 lg:relative lg:h-full lg:w-0 lg:border-none",
                    isOpen ? "translate-x-0 lg:w-72 lg:border-r" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2 font-semibold">
                        <History className="w-4 h-4" />
                        <span>History</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {history.length} sessions
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm text-center p-4">
                            <History className="w-8 h-8 opacity-20 mb-2" />
                            <p>No history yet.<br />Start debugging!</p>
                        </div>
                    ) : (
                        history.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onSelect(item)}
                                className={cn(
                                    "group relative flex flex-col gap-1 p-3 rounded-lg border cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all",
                                    currentId === item.id ? "bg-accent border-primary/20" : "bg-card border-transparent hover:border-border"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <PersonaAvatar persona={item.persona} size="sm" />
                                    <span className="text-xs font-medium capitalize truncate flex-1">
                                        {item.persona.replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground tabular-nums">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-2 pl-8 font-mono opacity-80">
                                    {item.code.slice(0, 100).replace(/\n/g, ' ')}
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                    onClick={(e) => onDelete(item.id, e)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </aside>
        </>
    );
};

export default SessionHistory;
