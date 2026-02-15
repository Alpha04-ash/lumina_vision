"use client";

import { useState, useRef, useCallback } from "react";

export function useSpeech(autoSpeak: boolean) {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    const [loadingVoiceIndex, setLoadingVoiceIndex] = useState<number | null>(null);
    const [voice, setVoice] = useState<"shimmer" | "nova">("shimmer");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const stopSpeaking = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (typeof window !== 'undefined') {
            window.speechSynthesis.cancel();
        }
        setPlayingIndex(null);
        setLoadingVoiceIndex(null);
    }, []);

    const speak = useCallback(async (text: string, index?: number) => {
        // If it's an automatic speak (not triggered by button) and autoSpeak is off, skip
        // Unless it's a safety warning (contains ⚠️)
        if (index === undefined && !autoSpeak && !text.includes("⚠️")) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        if (index !== undefined) {
            setLoadingVoiceIndex(index);
            setPlayingIndex(null);
        }

        try {
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, voice }),
            });

            if (!res.ok) throw new Error("TTS failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

            const audio = new Audio(url);
            audioRef.current = audio;
            audio.oncanplaythrough = () => {
                if (index !== undefined) {
                    setLoadingVoiceIndex(null);
                    setPlayingIndex(index);
                }
            };
            audio.onended = () => { if (index !== undefined) setPlayingIndex(null); };
            await audio.play();
        } catch (err) {
            console.error("TTS Error:", err);
            if (index !== undefined) setLoadingVoiceIndex(null);

            if (typeof window !== 'undefined') {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.onend = () => { if (index !== undefined) setPlayingIndex(null); };
                window.speechSynthesis.speak(utterance);
            }
        }
    }, [autoSpeak]);

    return {
        speak,
        stopSpeaking,
        playingIndex,
        loadingVoiceIndex,
        audioUrl,
        voice,
        setVoice
    };
}
