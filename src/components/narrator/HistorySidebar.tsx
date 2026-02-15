"use client";

import { Button } from "@/components/ui/button";
import { Plus, Bot, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Session } from "@/types/narrator";

interface HistorySidebarProps {
    history: Session[];
    currentSessionId: string | null;
    loadSession: (session: Session) => void;
    deleteSession: (id: string, e: React.MouseEvent) => void;
    startNewSession: () => void;
    onClose: () => void;
}

export function HistorySidebar({
    history,
    currentSessionId,
    loadSession,
    deleteSession,
    startNewSession,
    onClose,
}: HistorySidebarProps) {
    return (
        <div className="absolute inset-y-0 left-0 w-80 z-50 bg-zinc-950/95 backdrop-blur-3xl border-r border-white/10 p-6 animate-in slide-in-from-left duration-300 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-white tracking-tight">Session History</h2>
                <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-white" onClick={onClose}>Close</Button>
            </div>

            <Button
                className="w-full mb-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl py-6 gap-2"
                onClick={startNewSession}
            >
                <Plus className="w-4 h-4" />
                Start New Session
            </Button>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 no-scrollbar">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 animate-pulse">
                            <Bot className="w-8 h-8 text-zinc-600" />
                        </div>
                        <div className="space-y-1 px-8">
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Neural Void</p>
                            <p className="text-[10px] text-zinc-600 font-medium">No previous sessions have been archived in this neural link.</p>
                        </div>
                    </div>
                ) : (
                    history.map((h) => (
                        <div
                            key={h.id}
                            onClick={() => loadSession(h)}
                            className={cn(
                                "w-full text-left p-4 rounded-xl border transition-all group cursor-pointer relative",
                                currentSessionId === h.id
                                    ? "bg-indigo-600/20 border-indigo-500/50"
                                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-[10px] font-bold text-zinc-500 group-hover:text-indigo-400 uppercase tracking-widest">
                                    {new Date(h.timestamp).toLocaleDateString()} • {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <button
                                    onClick={(e) => deleteSession(h.id, e)}
                                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-1 rounded-md hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-all"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-semibold text-zinc-200 line-clamp-1">
                                    {h.messages.find(m => m.role === 'assistant')?.content.substring(0, 40) || "Empty Analysis"}
                                </p>
                                <p className="text-[10px] text-zinc-500">{h.messages.length} messages in session</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
