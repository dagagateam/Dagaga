import { useState, useRef, useEffect, useCallback } from "react";
import { fetchTts } from "../api/learningApi";

export const useTts = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    // Cleanup audio URL on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                // We don't revoke cache URLs here to keep them valid across reused Hooks
                // Only revoke if we created a specific one-off URL not in cache
                // But for simplicity, we rely on browser GC or manual cache clearing if needed
                audioRef.current = null;
            }
        };
    }, []);

    const playTts = useCallback(async (text, speed = 'normal') => {
        if (!text) return;

        try {
            // Stop any currently playing audio
            if (audioRef.current) {
                audioRef.current.pause();
                // Do not revoke object URL if it's cached
            }

            let blob = ttsCache.get(text);
            if (!blob) {
                blob = await fetchTts(text);
                ttsCache.set(text, blob);
            }

            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            
            // Set playback rate
            audio.playbackRate = speed === 'slow' ? 0.7 : 1.0;
            
            audioRef.current = audio;
            setIsPlaying(true);

            audio.onended = () => {
                setIsPlaying(false);
                // Don't revoke URL immediately if we want to reuse it, 
                // but usually createObjectURL is cheap enough if blob is cached.
                // To be safe against memory leaks, we can revoke.
                URL.revokeObjectURL(url);
            };

            audio.onerror = (e) => {
                console.error("Audio playback error", e);
                setIsPlaying(false);
                URL.revokeObjectURL(url);
            };

            await audio.play();
        } catch (error) {
            console.error("Failed to play TTS:", error);
            setIsPlaying(false);
        }
    }, []);

    const preloadTts = useCallback(async (text) => {
        if (!text || ttsCache.has(text)) return;
        try {
            const blob = await fetchTts(text);
            ttsCache.set(text, blob);
            console.log(`Preloaded TTS for: "${text}"`);
        } catch (err) {
            console.warn(`Failed to preload TTS for "${text}"`, err);
        }
    }, []);

    return { playTts, isPlaying, preloadTts };
};

// Module-level cache
const ttsCache = new Map();
