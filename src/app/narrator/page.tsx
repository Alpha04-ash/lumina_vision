"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Hooks
import { useCamera } from "@/hooks/useCamera";
import { useSpeech } from "@/hooks/useSpeech";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useNarratorHistory } from "@/hooks/useNarratorHistory";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// Utilities
import { logger } from "@/lib/logger";

// Components
import { NarratorHeader } from "@/components/narrator/NarratorHeader";
import { HistorySidebar } from "@/components/narrator/HistorySidebar";
import { CameraView } from "@/components/narrator/CameraView";
import { ChatStream } from "@/components/narrator/ChatStream";

// Types
import { Message } from "@/types/narrator";

export default function NarratorPage() {
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [safetyMode, setSafetyMode] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(false);
    const [showChatMobile, setShowChatMobile] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const lastAction = useRef<(() => void) | null>(null);

    // Initial hydration fix
    useEffect(() => { setMounted(true); }, []);

    // 1. Logic Hooks
    const { videoRef, canvasRef, facingMode, toggleCamera, cameraError, takeCompressedPicture } = useCamera();
    const { speak, stopSpeaking, playingIndex, loadingVoiceIndex, voice, setVoice } = useSpeech(autoSpeak);
    const { history, currentSessionId, showHistory, setShowHistory, startNewSession, loadSession, deleteSession } = useNarratorHistory(messages, setMessages);
    const { playCaptureSound, playAlertSound, playMessageSound, playSuccessSound } = useSoundEffects();

    // 2. Action Logic
    const captureAndAnalyze = useCallback(async (mode: "narrator" | "safety" = "narrator") => {
        const imageData = takeCompressedPicture();
        if (!imageData) return;

        if (mode === "narrator") {
            setAnalyzing(true);
            playCaptureSound();
            logger.info("Initiating scene analysis...");
            lastAction.current = () => captureAndAnalyze("narrator");
        }
        setError(null);

        try {
            const res = await fetch("/api/vision", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imageData, mode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Analysis failed");

            if (data.description) {
                if (mode === "safety") {
                    if (data.description.toLowerCase() !== "safe") {
                        playAlertSound();
                        logger.warn("Safety hazard detected", { description: data.description });
                        speak(data.description);
                        setMessages(prev => [...prev, { role: "assistant", content: "⚠️ " + data.description }]);
                    }
                } else {
                    playSuccessSound();
                    logger.info("Analysis complete", { length: data.description.length });
                    speak(data.description);
                    setMessages(prev => [...prev, { role: "assistant", content: data.description }]);
                }
            }
        } catch (err: any) {
            logger.error("Vision Analysis Error", { error: err.message });
            setError(err.message || "Failed to connect to AI.");
            if (mode === "narrator") speak("System error. Check connection.");
        } finally {
            if (mode === "narrator") {
                setAnalyzing(false);
                if (window.innerWidth < 768) setShowChatMobile(true);
            }
        }
    }, [takeCompressedPicture, speak, playCaptureSound, playAlertSound, playSuccessSound]);

    const sendMessage = useCallback(async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || isStreaming) return;

        playMessageSound();
        const userMessage: Message = { role: "user", content: textToSend };
        const newMessages: Message[] = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setError(null);
        setIsStreaming(true);

        const currentImage = takeCompressedPicture();
        logger.info("Sending message with context", { hasImage: !!currentImage });
        lastAction.current = () => sendMessage(textOverride);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages, image: currentImage }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Chat failed");
            }

            // Handle Streaming Response
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error("Stream not available");

            let fullReply = "";
            let chunkCount = 0;

            // Pre-create the assistant message to stream into it
            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullReply += chunk;
                chunkCount++;

                // Efficiently update the last message
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = fullReply;
                    return updated;
                });
            }

            logger.info("Stream complete", { chunks: chunkCount, totalLength: fullReply.length });
            speak(fullReply);

        } catch (err: any) {
            logger.error("Chat Error", { error: err.message });
            setError(err.message || "Failed to connect to AI.");
        } finally {
            setIsStreaming(false);
        }
    }, [messages, input, takeCompressedPicture, speak, playMessageSound, isStreaming]);

    const onVoiceResult = useCallback((transcript: string) => {
        setInput(transcript);
        sendMessage(transcript);
        if (window.innerWidth < 768) setShowChatMobile(true);
    }, [sendMessage]);

    const { isListening, startListening, voiceError } = useVoiceRecognition(onVoiceResult);

    // 3. Effects
    useEffect(() => {
        if (safetyMode) {
            const interval = setInterval(() => { if (!analyzing) captureAndAnalyze("safety"); }, 4000);
            return () => clearInterval(interval);
        }
    }, [safetyMode, analyzing, captureAndAnalyze]);

    useEffect(() => {
        if (cameraError) setError(cameraError);
    }, [cameraError]);

    useEffect(() => {
        if (voiceError) setError(voiceError);
    }, [voiceError]);

    if (!mounted) return <div className="min-h-screen bg-black" suppressHydrationWarning />;

    return (
        <main className={cn("flex min-h-screen flex-col items-center bg-black overflow-hidden relative transition-colors duration-700 font-sans", safetyMode ? "bg-red-950/20" : "bg-black")} suppressHydrationWarning>
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 inset-x-0 h-screen bg-gradient-to-b from-indigo-900/10 via-transparent to-black/40 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(79,70,229,0.05),transparent_50%)]" />
            </div>

            <div className="w-full h-screen flex flex-col relative z-10 overflow-hidden">
                <NarratorHeader
                    showHistory={showHistory}
                    setShowHistory={setShowHistory}
                    autoSpeak={autoSpeak}
                    setAutoSpeak={setAutoSpeak}
                    safetyMode={safetyMode}
                    setSafetyMode={setSafetyMode}
                    voice={voice}
                    setVoice={setVoice}
                />

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                    {showHistory && (
                        <HistorySidebar
                            history={history}
                            currentSessionId={currentSessionId}
                            loadSession={loadSession}
                            deleteSession={deleteSession}
                            startNewSession={startNewSession}
                            onClose={() => setShowHistory(false)}
                        />
                    )}

                    <CameraView
                        videoRef={videoRef}
                        canvasRef={canvasRef}
                        safetyMode={safetyMode}
                        analyzing={analyzing}
                        isListening={isListening}
                        onCapture={() => captureAndAnalyze("narrator")}
                        onStartListening={startListening}
                        onStopSpeaking={stopSpeaking}
                        onToggleCamera={toggleCamera}
                        onOpenChat={() => setShowChatMobile(true)}
                        showChatMobile={showChatMobile}
                    />

                    <ChatStream
                        messages={messages}
                        input={input}
                        setInput={setInput}
                        sendMessage={sendMessage}
                        startListening={startListening}
                        isListening={isListening}
                        showChatMobile={showChatMobile}
                        setShowChatMobile={setShowChatMobile}
                        copyToClipboard={(text, index) => { navigator.clipboard.writeText(text); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 2000); }}
                        speak={speak}
                        copiedIndex={copiedIndex}
                        playingIndex={playingIndex}
                        loadingVoiceIndex={loadingVoiceIndex}
                        safetyMode={safetyMode}
                        isStreaming={isStreaming}
                    />
                </div>

                {error && (
                    <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[90%] md:w-auto z-[100] animate-in zoom-in duration-300">
                        <div className="bg-red-500/20 text-red-100 px-6 md:px-8 py-4 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 md:gap-5 shadow-[0_0_50px_rgba(239,68,68,0.3)] border border-red-500/40 backdrop-blur-3xl">
                            <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Protocol Error</span>
                                <p className="text-sm font-semibold">{error}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4 md:ml-6">
                                {lastAction.current && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-4 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-full border border-white/10"
                                        onClick={() => { setError(null); lastAction.current?.(); }}
                                    >
                                        RETRY
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-500/40 rounded-full" onClick={() => setError(null)}>×</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
