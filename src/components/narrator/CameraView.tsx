"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Mic, Camera, Volume2, Send, ShieldAlert, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraViewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    safetyMode: boolean;
    analyzing: boolean;
    isListening: boolean;
    onCapture: () => void;
    onStartListening: () => void;
    onStopSpeaking: () => void;
    onToggleCamera: () => void;
    onOpenChat: () => void;
    showChatMobile: boolean;
}

export function CameraView({
    videoRef,
    canvasRef,
    safetyMode,
    analyzing,
    isListening,
    onCapture,
    onStartListening,
    onStopSpeaking,
    onToggleCamera,
    onOpenChat,
    showChatMobile,
}: CameraViewProps) {
    return (
        <div className={cn("relative flex-1 md:flex-[1.2] flex flex-col bg-black overflow-hidden group transition-all duration-700", showChatMobile && "md:translate-x-0")}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn("absolute inset-0 h-full w-full object-cover transition-all duration-1000", safetyMode ? "opacity-40 scale-110 blur-sm" : "opacity-80 group-hover:scale-105")}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Toggle Button */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-40">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCamera}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-xl"
                    title="Switch Camera"
                >
                    <RefreshCcw className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
            </div>

            {/* Safety Visual FX */}
            {safetyMode && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="absolute inset-0 border-[8px] md:border-[12px] border-red-500/20 animate-pulse pointer-events-none" />
                    <div className="bg-red-600/10 backdrop-blur-xl border border-red-500/50 rounded-full p-10 md:p-16 animate-pulse">
                        <ShieldAlert className="w-16 h-16 md:w-24 md:h-24 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]" />
                    </div>
                </div>
            )}

            {/* Immersive Controls Bar */}
            {!safetyMode && (
                <div className="absolute inset-x-0 bottom-8 md:bottom-12 flex justify-center items-end md:items-center z-30 gap-4 md:gap-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 px-4">
                    {/* Voice Trigger */}
                    <div className="flex flex-col items-center gap-2 md:gap-3 mb-2 md:mb-0">
                        <Button
                            size="icon"
                            onClick={onStartListening}
                            className={cn(
                                "h-12 w-12 md:h-16 md:w-16 rounded-full border border-white/20 bg-black/60 backdrop-blur-3xl text-zinc-400 hover:bg-indigo-600/80 hover:text-white hover:border-indigo-400/50 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-90",
                                isListening && "bg-red-500/80 text-white border-red-400/50 shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-pulse"
                            )}
                        >
                            <Mic className="h-5 w-5 md:h-7 md:w-7" />
                        </Button>
                        <span className="text-[10px] font-bold text-zinc-500/80 uppercase tracking-widest drop-shadow-md">Listen</span>
                    </div>

                    {/* Main Capture Button */}
                    <div className="relative group/main">
                        <div className="absolute -inset-4 bg-indigo-500/25 rounded-full blur-3xl group-hover/main:bg-indigo-500/40 transition-all duration-500 opacity-0 group-hover/main:opacity-100" />
                        <Button
                            size="lg"
                            onClick={onCapture}
                            disabled={analyzing}
                            className="relative h-24 w-24 md:h-28 md:w-28 rounded-full border-[4px] md:border-[6px] border-white/10 bg-white/10 backdrop-blur-3xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-500 shadow-[0_0_60px_rgba(0,0,0,0.6)] group ring-1 ring-white/5"
                        >
                            {analyzing ? (
                                <div className="relative flex items-center justify-center">
                                    <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin text-indigo-400 opacity-80 absolute" />
                                    <Camera className="h-8 w-8 md:h-8 md:w-8 text-white animate-pulse" />
                                </div>
                            ) : (
                                <Camera className="h-12 w-12 md:h-14 md:w-14 text-white group-hover:scale-110 transition-transform duration-500 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            )}
                        </Button>
                        <span className="absolute -bottom-8 md:-bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-200 uppercase tracking-widest whitespace-nowrap drop-shadow-xl text-shadow-sm">Analyze</span>
                    </div>

                    {/* Mute Button - Hidden on mobile */}
                    <div className="hidden md:flex flex-col items-center gap-2 md:gap-3 mb-2 md:mb-0">
                        <Button
                            size="icon"
                            onClick={onStopSpeaking}
                            className="h-12 w-12 md:h-16 md:w-16 rounded-full border border-white/20 bg-black/60 backdrop-blur-3xl text-zinc-400 hover:bg-red-600/80 hover:text-white hover:border-red-400/50 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-90"
                        >
                            <Volume2 className="h-5 w-5 md:h-7 md:w-7" />
                        </Button>
                        <span className="text-[10px] font-bold text-zinc-500/80 uppercase tracking-widest drop-shadow-md">Mute</span>
                    </div>

                    {/* Mobile Chat Toggle */}
                    <div className="md:hidden flex flex-col items-center gap-2 mb-2">
                        <Button
                            size="icon"
                            onClick={onOpenChat}
                            className="h-12 w-12 rounded-full border border-white/20 bg-black/60 backdrop-blur-3xl text-zinc-400 hover:bg-indigo-600/80 hover:text-white active:scale-90 transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                        <span className="text-[10px] font-bold text-zinc-500/80 uppercase tracking-widest drop-shadow-md">Chat</span>
                    </div>
                </div>
            )}
        </div>
    );
}
