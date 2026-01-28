import { useState, useRef, useEffect } from "react";
import "./problem-record-button.css";

const ProblemRecordButton = ({ onRecordingComplete, onAnalyserChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up Web Audio API for visualization
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Share the analyser with parent component for visualization
      if (onAnalyserChange) {
        onAnalyserChange(analyser, true);
      }
      
      // Set up MediaRecorder for actual recording
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Call callback if provided
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, audioUrl);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks to release microphone
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      // Notify parent that recording stopped
      if (onAnalyserChange) {
        onAnalyserChange(null, false);
      }
      
      setIsRecording(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <button 
      className={`record-button ${isRecording ? 'recording' : ''}`} 
      onClick={handleClick} 
      title={isRecording ? "녹음 중지" : "녹음하기"}
    >
      {isRecording ? (
        <div className="record-stop-icon"></div>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="record-icon">
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M12 18v3" strokeLinecap="round" />
          <path d="M8 21h8" strokeLinecap="round" />
          <path d="M5 10a7 7 0 0 0 14 0" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
};

export default ProblemRecordButton;
