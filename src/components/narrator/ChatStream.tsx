"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, User, Copy, Check, Play, Loader2, Volume2, ChevronLeft, Mic, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Message } from "@/types/narrator";

interface ChatStreamProps {
    messages: Message[];
    input: string;
    setInput: (val: string) => void;
    sendMessage: (textOverride?: string) => void;
    startListening: () => void;
    isListening: boolean;
    showChatMobile: boolean;
    setShowChatMobile: (show: boolean) => void;
    copyToClipboard: (text: string, index: number) => void;
    speak: (text: string, index?: number) => void;
    copiedIndex: number | null;
    playingIndex: number | null;
    loadingVoiceIndex: number | null;
    safetyMode: boolean;
    isStreaming: boolean;
}

export function ChatStream({
    messages,
    input,
    setInput,
    sendMessage,
    startListening,
    isListening,
    showChatMobile,
    setShowChatMobile,
    copyToClipboard,
    speak,
    copiedIndex,
    playingIndex,
    loadingVoiceIndex,
    safetyMode,
    isStreaming,
}: ChatStreamProps) {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className={cn(
            "w-full md:flex-1 flex flex-col relative z-50 bg-zinc-950/60 backdrop-blur-3xl border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out",
            "fixed inset-x-0 bottom-0 top-[80px] md:relative md:inset-auto",
            showChatMobile ? "translate-y-0 opacity-100 visible" : "translate-y-full md:translate-y-0 md:opacity-100 invisible md:visible"
        )}>
            <div className="absolute top-0 inset-x-0 h-10 md:h-24 bg-gradient-to-b from-zinc-950/80 to-transparent pointer-events-none z-10" />

            {/* Mobile Back to Camera Button */}
            <div className="md:hidden flex items-center px-6 py-3 border-b border-white/5 bg-black/20">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChatMobile(false)}
                    className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] gap-2"
                >
                    <ChevronLeft className="w-3 h-3" />
                    Back to Scene
                </Button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-12 flex flex-col gap-6 md:gap-8 no-scrollbar pb-32 md:pb-12">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto p-6 animate-in fade-in zoom-in duration-1000">
                        <div className="h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden mb-8 animate-float shadow-[0_0_50px_rgba(79,70,229,0.3)] ring-2 ring-indigo-500/20">
                            <img src="/neural-link.png" alt="Neural Link" className="w-full h-full object-cover scale-110" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">Neural Link Ready</h3>
                        <p className="text-xs md:text-sm text-zinc-500 leading-relaxed font-medium px-4">Lumina is waiting for visual input. Use the center camera button to begin narrative scene processing.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1" />
                        {messages.map((m, i) => (
                            <div key={i} className={cn("flex w-full animate-in fade-in slide-in-from-bottom-8 duration-700",
                                m.role === 'user' ? "justify-end" : "justify-start"
                            )}>
                                <div className={cn("max-w-[90%] md:max-w-[85%] rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 text-[14px] md:text-[15px] leading-relaxed backdrop-blur-3xl border transition-all shadow-2xl group/message",
                                    m.role === 'user'
                                        ? "bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-br-none border-white/20 shadow-indigo-500/20"
                                        : "bg-white/5 text-zinc-100 rounded-bl-none border-white/5 shadow-black/80 ring-1 ring-white/5",
                                    m.content.includes("⚠️") && "bg-red-600/40 border-red-500/40 text-red-50 shadow-red-900/40"
                                )}>
                                    <div className="flex items-center justify-between mb-2 md:mb-3 gap-4 border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-5 w-5 md:h-6 md:w-6 rounded-full flex items-center justify-center shrink-0 overflow-hidden", m.role === 'user' ? "bg-white/20" : "bg-indigo-600/20 p-0")}>
                                                {m.role === 'user' ? (
                                                    <User className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                                                ) : (
                                                    <img src="/neural-link.png" alt="AI" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.15em] opacity-60">
                                                {m.role === 'user' ? "Presence" : "Lumina Intelligence"}
                                            </span>
                                        </div>

                                        {m.role === 'assistant' && (
                                            <div className="flex gap-1 md:gap-2 items-center opacity-40 md:opacity-0 group-hover/message:opacity-100 transition-opacity">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 md:h-8 md:w-8 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
                                                    onClick={() => copyToClipboard(m.content, i)}
                                                >
                                                    {copiedIndex === i ? <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-400" /> : <Copy className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className={cn("h-7 w-7 md:h-8 md:w-8 rounded-full hover:bg-white/10 transition-all", (playingIndex === i || loadingVoiceIndex === i) ? "text-indigo-400" : "text-zinc-400 hover:text-white")}
                                                    onClick={() => speak(m.content, i)}
                                                >
                                                    {loadingVoiceIndex === i ? (
                                                        <Loader2 className="w-2.5 h-2.5 md:w-3 md:h-3 animate-spin" />
                                                    ) : playingIndex === i ? (
                                                        <Volume2 className="w-2.5 h-2.5 md:w-3 md:h-3 animate-pulse" />
                                                    ) : (
                                                        <Play className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="markdown-content prose prose-invert prose-p:leading-relaxed max-w-none prose-p:text-[14px] md:prose-p:text-[15px]">
                                        {m.role === 'assistant' && m.content === "" && isStreaming ? (
                                            <div className="flex items-center gap-2 py-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        ) : (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {m.content}
                                            </ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </>
                )}
            </div>

            {/* Immersive Input Area */}
            {!safetyMode && (
                <div className="p-4 md:p-8 shrink-0 bg-zinc-950/40 backdrop-blur-3xl border-t border-white/5 relative z-30 pb-10 md:pb-8">
                    <div className="max-w-4xl mx-auto flex gap-2 md:gap-4 items-center bg-white/5 rounded-2xl md:rounded-[2rem] border border-white/5 p-1.5 md:p-2 pr-3 md:pr-4 shadow-2xl focus-within:border-indigo-500/50 transition-all group/input">
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-[1.5rem] bg-indigo-500/10 text-indigo-400 shrink-0", isListening && "bg-red-500/20 text-red-500 animate-pulse")}
                            onClick={startListening}
                        >
                            <Mic className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-white text-sm md:text-base placeholder:text-zinc-600 px-1 md:px-2"
                            value={input}
                            autoComplete="off"
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about the scene..."
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <Button
                            size="icon"
                            className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 shadow-lg shadow-indigo-600/30 transition-all group-hover/input:scale-105"
                            onClick={() => sendMessage()}
                        >
                            <Send className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
