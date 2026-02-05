import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import lamejs from "@breezystack/lamejs";
import "./ProblemRecordButton.css";

const ProblemRecordButton = ({ onRecordingComplete, onAnalyserChange }) => {
  const { t } = useTranslation();
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

  // AudioWorkletProcessor code as a string
  const workletCode = `
    class RecorderProcessor extends AudioWorkletProcessor {
      process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input && input.length > 0) {
          // Send the first channel's data to the main thread
          this.port.postMessage(input[0]);
        }
        return true;
      }
    }
    registerProcessor('recorder-processor', RecorderProcessor);
  `;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up Web Audio API
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

      // Initialize AudioWorklet
      const blob = new Blob([workletCode], { type: "application/javascript" });
      const workletUrl = URL.createObjectURL(blob);

      await audioContext.audioWorklet.addModule(workletUrl);

      const workletNode = new AudioWorkletNode(audioContext, 'recorder-processor');
      processorRef.current = workletNode; // Store worklet node in ref instead of ScriptProcessor
      audioBufferRef.current = [];

      workletNode.port.onmessage = (e) => {
        const inputData = e.data; // Float32Array from worklet

        // Convert Float32 to Int16 for MP3 encoding
        const samples = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        audioBufferRef.current.push(samples);
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;

    // Stop worklet/processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.port.close(); // Close port if it's a WorkletNode
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
    // DEBUG: Recorded Audio URL
    // console.log("Recorded Audio URL:", audioUrl);

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Notify parent that recording stopped
    if (onAnalyserChange) {
      onAnalyserChange(null, false);
    }

    // Create output object
    const recordingData = { audioBlob: mp3Blob, audioUrl };

    // DEBUG: Recording Complete
    // console.log("Recording Complete:", recordingData);

    // Call callback with object
    if (onRecordingComplete) {
      onRecordingComplete(recordingData);
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
      title={isRecording ? t('stop_recording') : t('start_recording')}
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