"use client";

import { useState, useEffect, useCallback } from "react";
import { Message, Session } from "@/types/narrator";
import { supabase } from "@/lib/supabase";

export type SyncStatus = "synced" | "syncing" | "error" | "offline";

export function useNarratorHistory(messages: Message[], setMessages: (m: Message[]) => void) {
    const [history, setHistory] = useState<Session[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>("offline");

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

    const deleteSession = useCallback(async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // 1. Delete from state
        setHistory(prev => {
            const updated = prev.filter(s => s.id !== id);
            localStorage.setItem("lumina_history", JSON.stringify(updated));
            return updated;
        });

        // 2. Delete from Supabase (background)
        try {
            await supabase.from("sessions").delete().eq("id", id);
        } catch (err) {
            console.error("Supabase delete failed:", err);
        }

        if (currentSessionId === id) {
            startNewSession();
        }
    }, [currentSessionId, startNewSession]);

    const syncToCloud = useCallback(async (session: Session) => {
        if (!supabase) return;
        setSyncStatus("syncing");

        try {
            const { error } = await supabase.from("sessions").upsert({
                id: session.id,
                messages: session.messages,
                timestamp: new Date(session.timestamp).toISOString(),
            }, { onConflict: 'id' });

            if (error) throw error;
            setSyncStatus("synced");
        } catch (err) {
            console.error("Cloud sync failed:", err);
            setSyncStatus("error");
        }
    }, []);

    // Load initial history
    useEffect(() => {
        const savedHistory = localStorage.getItem("lumina_history");
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                setHistory(parsed);
                setSyncStatus("synced");
            } catch (e) { }
        }
    }, []);

    // Auto-save session
    useEffect(() => {
        if (messages.length > 0) {
            const sessionId = currentSessionId || Date.now().toString();
            if (!currentSessionId) setCurrentSessionId(sessionId);

            const newSession = { id: sessionId, messages: [...messages], timestamp: Date.now() };

            setHistory(prev => {
                const existingIndex = prev.findIndex(s => s.id === sessionId);
                let updated = existingIndex >= 0 ? [...prev] : [newSession, ...prev];
                if (existingIndex >= 0) updated[existingIndex] = newSession;

                // Keep only last 20
                const limited = updated.slice(0, 20);
                localStorage.setItem("lumina_history", JSON.stringify(limited));
                return updated;
            });

            // Background sync
            syncToCloud(newSession);
        }
    }, [messages, currentSessionId, syncToCloud]);

    return {
        history,
        currentSessionId,
        showHistory,
        setShowHistory,
        startNewSession,
        loadSession,
        deleteSession,
        syncStatus
    };
}
