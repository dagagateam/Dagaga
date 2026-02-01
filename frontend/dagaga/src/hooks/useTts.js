import { useState, useRef, useEffect, useCallback } from "react";
import { fetchTts } from "../api/learningApi";

export const useTts = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    // Cleanup audio URL on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                URL.revokeObjectURL(audioRef.current.src);
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
                URL.revokeObjectURL(audioRef.current.src);
            }

            const blob = await fetchTts(text);
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            
            // Set playback rate
            audio.playbackRate = speed === 'slow' ? 0.7 : 1.0;
            
            audioRef.current = audio;
            setIsPlaying(true);

            audio.onended = () => {
                setIsPlaying(false);
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

    return { playTts, isPlaying };
};
