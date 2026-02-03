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

        // Return a promise that resolves when audio ends
        return new Promise(async (resolve, reject) => {
            try {
                // Stop any currently playing audio
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0; // Reset
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
                    URL.revokeObjectURL(url);
                    resolve(); // Resolve promise when done
                };

                audio.onerror = (e) => {
                    console.error("Audio playback error", e);
                    setIsPlaying(false);
                    URL.revokeObjectURL(url);
                    // Decide if we want to reject or just resolve to continue flow
                    resolve();
                };

                await audio.play();
            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    console.warn("TTS Autoplay blocked by browser. User interaction required.");
                } else {
                    console.error("Failed to play TTS:", error);
                }
                setIsPlaying(false);
                resolve(); // Resolve to not break the chain
            }
        });
    }, []);

    const preloadTts = useCallback(async (text) => {
        if (!text || ttsCache.has(text)) return;
        try {
            const blob = await fetchTts(text);
            ttsCache.set(text, blob);
            // DEBUG: Preloaded TTS info
            // console.log(`Preloaded TTS for: "${text}"`);
        } catch (err) {
            console.warn(`Failed to preload TTS for "${text}"`, err);
        }
    }, []);

    return { playTts, isPlaying, preloadTts };
};

// Module-level cache
const ttsCache = new Map();
