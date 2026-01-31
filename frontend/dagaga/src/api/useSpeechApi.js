import { useState } from "react";
import * as learningApi from "./learningApi";

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

    try {
      const responseData = await learningApi.translateAudio(audioBlob);
      
      if (responseData.success) {
        setIsUploading(false);
        return {
           words: responseData.data.words,
           pronunciations: responseData.data.pronunciation_guide // Backend returns 'pronunciation_guide'
        };
      } else {
        throw new Error(responseData.message || "Translation failed");
      }
    } catch (err) {
      console.error("Translation error:", err);
      setError(err);
      setIsUploading(false);
      return null;
    }
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

    try {
      const responseData = await learningApi.evaluatePronunciation(audioBlob, word); // word corresponds to 'expectedText'
      
      if (responseData.success) {
        setIsUploading(false);
        return { isCorrect: responseData.data };
      } else {
        throw new Error(responseData.message || "Pronunciation check failed");
      }
    } catch (err) {
      console.error("Pronunciation check error:", err);
      setError(err);
      setIsUploading(false);
      // Return false on error so the user can try again or see failure
      return { isCorrect: false };
    }
  };

  return {
    translateAudio,
    checkPronunciation,
    isUploading,
    error,
  };
};
