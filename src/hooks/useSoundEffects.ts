"use client";

import { useCallback, useRef } from "react";

/**
 * Custom hook to provide professional audio feedback for user interactions.
 * Essential for accessibility in a visually impaired assistant app.
 */
export function useSoundEffects() {
    const audioContext = useRef<AudioContext | null>(null);

    const initAudio = useCallback(() => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }, []);

    const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, volume: number) => {
        initAudio();
        if (!audioContext.current) return;

        const ctx = audioContext.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    }, [initAudio]);

    const playCaptureSound = useCallback(() => {
        // High-end shutter-like synth sound
        playTone(880, "sine", 0.1, 0.2);
        setTimeout(() => playTone(440, "sine", 0.05, 0.1), 50);

        // Subtle haptic tap
        if ("vibrate" in navigator) navigator.vibrate(10);
    }, [playTone]);

    const playAlertSound = useCallback(() => {
        // Urgent warning sound
        playTone(220, "sawtooth", 0.2, 0.15);
        setTimeout(() => playTone(220, "sawtooth", 0.2, 0.15), 250);

        // Urgent vibration pattern
        if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
    }, [playTone]);

    const playMessageSound = useCallback(() => {
        // Soft bubble-like notification
        playTone(1320, "sine", 0.15, 0.1);
    }, [playTone]);

    const playSuccessSound = useCallback(() => {
        // Uplifting ascending chime
        playTone(523.25, "sine", 0.2, 0.1); // C5
        setTimeout(() => playTone(659.25, "sine", 0.2, 0.1), 100); // E5
        setTimeout(() => playTone(783.99, "sine", 0.3, 0.1), 200); // G5
    }, [playTone]);

    return {
        playCaptureSound,
        playAlertSound,
        playMessageSound,
        playSuccessSound
    };
}
