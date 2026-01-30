import { useState, useRef, useEffect } from "react";
import lamejs from "@breezystack/lamejs";
import "./ProblemRecordButton.css";

const ProblemRecordButton = ({ onRecordingComplete, onAnalyserChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const audioBufferRef = useRef([]);

  // Convert audio buffer to MP3
  const encodeToMp3 = (audioBuffer, sampleRate) => {
    const samples = audioBuffer;
    const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // mono, sampleRate, 128kbps
    const mp3Data = [];

    const sampleBlockSize = 1152;
    for (let i = 0; i < samples.length; i += sampleBlockSize) {
      const sampleChunk = samples.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }

    // Convert to Blob
    const blob = new Blob(mp3Data, { type: 'audio/mp3' });
    return blob;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up Web Audio API for visualization and recording
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create analyser for visualization
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Share the analyser with parent component for visualization
      if (onAnalyserChange) {
        onAnalyserChange(analyser, true);
      }
      
      // Create ScriptProcessor for capturing raw audio data
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;
      audioBufferRef.current = [];
      
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 for MP3 encoding
        const samples = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        audioBufferRef.current.push(samples);
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    
    // Stop processor
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    
    // Stop all tracks to release microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Combine all audio buffers
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const totalLength = audioBufferRef.current.reduce((acc, buf) => acc + buf.length, 0);
    const combined = new Int16Array(totalLength);
    let offset = 0;
    for (const buffer of audioBufferRef.current) {
      combined.set(buffer, offset);
      offset += buffer.length;
    }
    
    // Encode to MP3
    const mp3Blob = encodeToMp3(combined, sampleRate);
    const audioUrl = URL.createObjectURL(mp3Blob);
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    // Notify parent that recording stopped
    if (onAnalyserChange) {
      onAnalyserChange(null, false);
    }
    
    // Call callback with MP3 blob
    if (onRecordingComplete) {
      onRecordingComplete(mp3Blob, audioUrl);
    }
    
    setIsRecording(false);
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
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
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
