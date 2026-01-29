import { useState } from "react";
import axiosInstance from "./axios";

/**
 * Hook to handle speech-related API calls (translation, pronunciation check)
 */
export const useSpeechApi = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Upload audio for translation (Speech-to-Text + Translation)
   * @param {Blob} audioBlob - The recorded audio blob (mp3)
   * @param {string} problemId - The problem ID
   * @returns {Promise<Object>} - The translated words and pronunciations
   */
  const translateAudio = async (audioBlob, problemId) => {
    setIsUploading(true);
    setError(null);

    // Mock response for now (simulated delay)
    // When backend is ready, uncomment the axios block below and remove the mock
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsUploading(false);
        resolve({
          words: ["저희", "아이는", "수학을", "어려워해요"],
          pronunciations: ["저 히", "아 이 는", "수 하 글", "어 려 워 해 요"],
        });
      }, 2000);
    });

    /* 
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.mp3");
      formData.append("problemId", problemId);

      const response = await axiosInstance.post("/api/translate", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsUploading(false);
      return response.data;
    } catch (err) {
      console.error("Translation error:", err);
      setError(err);
      setIsUploading(false);
      throw err;
    }
    */
  };

  /**
   * Check pronunciation for a specific word
   * @param {Blob} audioBlob - The recorded audio blob (mp3)
   * @param {string} problemId - The problem ID
   * @param {string} word - The word being spoken
   * @param {number} step - Current step index
   * @returns {Promise<Object>} - Analysis result { isCorrect: boolean }
   */
  const checkPronunciation = async (audioBlob, problemId, word, step) => {
    setIsUploading(true);
    setError(null);

    // Mock response for now
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsUploading(false);
        const isCorrect = Math.random() > 0.3; // 70% chance correct
        resolve({ isCorrect });
      }, 500); // Small delay for effect
    });

    /*
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.mp3");
      formData.append("problemId", problemId);
      formData.append("currentWord", word);
      formData.append("step", step.toString());

      const response = await axiosInstance.post("/api/speech/analyze", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsUploading(false);
      return response.data;
    } catch (err) {
      console.error("Pronunciation check error:", err);
      setError(err);
      setIsUploading(false);
      throw err;
    }
    */
  };

  return {
    translateAudio,
    checkPronunciation,
    isUploading,
    error,
  };
};
