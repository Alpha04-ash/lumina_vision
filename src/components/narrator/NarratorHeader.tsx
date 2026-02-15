"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, Keyboard, Volume2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NarratorHeaderProps {
    showHistory: boolean;
    setShowHistory: (show: boolean) => void;
    autoSpeak: boolean;
    setAutoSpeak: (auto: boolean) => void;
    safetyMode: boolean;
    setSafetyMode: (safety: boolean) => void;
    voice: "shimmer" | "nova";
    setVoice: (v: "shimmer" | "nova") => void;
}

export function NarratorHeader({
    showHistory,
    setShowHistory,
    autoSpeak,
    setAutoSpeak,
    safetyMode,
    setSafetyMode,
    voice,
    setVoice,
}: NarratorHeaderProps) {
    return (
        <header className="flex items-center justify-between px-4 md:px-10 py-3 md:py-5 shrink-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5">
            <div className="flex items-center gap-3 md:gap-6">
                <Link href="/" className="group flex items-center justify-center h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 transition-all">
                    <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                </Link>

                <div className="flex flex-col">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                        <div className="h-6 w-6 md:h-7 md:w-7 rounded-full overflow-hidden shadow-[0_0_15px_rgba(79,70,229,0.5)] ring-1 ring-white/20">
                            <img src="/neural-link.png" alt="Lumina Core" className="w-full h-full object-cover" />
                        </div>
                        <span className="hidden xs:inline">Lumina Vision</span>
                        <span className="xs:hidden">Lumina</span>
                    </h1>
                    <span className="text-[8px] md:text-[10px] font-medium text-zinc-500 uppercase tracking-[0.1em] md:tracking-[0.2em]">Neural Center</span>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-9 md:h-10 px-3 md:px-4 rounded-xl gap-2 transition-all border border-white/5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10")}
                    onClick={() => setShowHistory(!showHistory)}
                >
                    <Keyboard className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-bold">HISTORY</span>
                </Button>

                <div className="hidden xs:block h-6 w-px bg-white/10 mx-1 md:mx-2" />

                <div className="flex bg-white/5 rounded-xl border border-white/5 p-1 gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7 md:h-8 md:w-8 rounded-lg transition-all", autoSpeak ? "text-indigo-400" : "text-zinc-600")}
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        title={autoSpeak ? "Auto-speak ON" : "Auto-speak OFF"}
                    >
                        <Volume2 className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-white/10 self-center" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn("h-7 md:h-8 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all", voice === "shimmer" ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-600")}
                        onClick={() => setVoice(voice === "shimmer" ? "nova" : "shimmer")}
                    >
                        {voice === "shimmer" ? "Pro" : "Soft"}
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-9 md:h-10 px-3 md:px-4 md:pl-4 md:pr-5 rounded-xl gap-2 transition-all border shadow-lg relative overflow-hidden", safetyMode ? "bg-red-500 text-white border-red-400 hover:bg-red-600" : "bg-zinc-800/80 text-zinc-300 border-white/10 hover:bg-zinc-700")}
                    onClick={() => setSafetyMode(!safetyMode)}
                >
                    {safetyMode && (
                        <span className="absolute inset-0 bg-red-400/20 animate-pulse pointer-events-none" />
                    )}
                    <ShieldAlert className={cn("w-4 h-4 z-10", safetyMode && "animate-pulse")} />
                    <span className="hidden xs:inline text-xs font-bold tracking-wider z-10">{safetyMode ? "ACTIVE" : "SAFETY"}</span>
                </Button>
            </div>
        </header>
    );
}
