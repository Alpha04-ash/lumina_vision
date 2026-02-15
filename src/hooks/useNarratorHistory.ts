"use client";

import { useState, useEffect, useCallback } from "react";
import { Message, Session } from "@/types/narrator";

export function useNarratorHistory(messages: Message[], setMessages: (m: Message[]) => void) {
    const [history, setHistory] = useState<Session[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    const startNewSession = useCallback(() => {
        setMessages([]);
        setCurrentSessionId(null);
        setShowHistory(false);
    }, [setMessages]);

    const loadSession = useCallback((session: Session) => {
        setMessages(session.messages);
        setCurrentSessionId(session.id);
        setShowHistory(false);
    }, [setMessages]);

    const deleteSession = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setHistory(prev => {
            const updated = prev.filter(s => s.id !== id);
            localStorage.setItem("lumina_history", JSON.stringify(updated));
            return updated;
        });
        if (currentSessionId === id) {
            startNewSession();
        }
    }, [currentSessionId, startNewSession]);

    // Load initial history
    useEffect(() => {
        const savedHistory = localStorage.getItem("lumina_history");
        if (savedHistory) {
            try { setHistory(JSON.parse(savedHistory)); } catch (e) { }
        }
    }, []);

    // Auto-save session
    useEffect(() => {
        if (messages.length > 0) {
            const sessionId = currentSessionId || Date.now().toString();
            if (!currentSessionId) setCurrentSessionId(sessionId);

            setHistory(prev => {
                const existingIndex = prev.findIndex(s => s.id === sessionId);
                const newSession = { id: sessionId, messages: [...messages], timestamp: Date.now() };
                let updated = existingIndex >= 0 ? [...prev] : [newSession, ...prev];
                if (existingIndex >= 0) updated[existingIndex] = newSession;

                // Keep only last 20
                const limited = updated.slice(0, 20);
                localStorage.setItem("lumina_history", JSON.stringify(limited));
                return updated;
            });
        }
    }, [messages, currentSessionId]);

    return {
        history,
        currentSessionId,
        showHistory,
        setShowHistory,
        startNewSession,
        loadSession,
        deleteSession
    };
}
