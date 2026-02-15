"use client";

import { useState, useCallback } from "react";

export function useVoiceRecognition(onResult: (transcript: string) => void) {
    const [isListening, setIsListening] = useState(false);
    const [error, setVoiceError] = useState<string | null>(null);

    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Voice input not supported in this browser.");
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech') {
                setVoiceError("Voice input error: " + event.error);
            }
            setIsListening(false);
        };

        recognition.start();
    }, [onResult]);

    return {
        isListening,
        voiceError: error,
        startListening
    };
}
