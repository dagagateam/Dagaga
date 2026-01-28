import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import ProblemProgress from "../../components/problem/problem-progress/problem-progress";
import ProblemAnswer from "../../components/problem/problem-answer/problem-answer";
import ProblemRecordButton from "../../components/problem/problem-record/problem-record-button";
import ProblemSoundwave from "../../components/problem/problem-soundwave/problem-soundwave";
import ProblemMascot from "../../components/problem/problem-mascot/problem-mascot";
import "./Problem.css";

const Problem = () => {
  const { problemId } = useParams();
  const location = useLocation();
  const problemText = location.state?.problemText || "문제를 불러오는 중...";
  
  // Sample sentence broken into words
  const words = ["저희", "아이는", "수학을", "어려워해요"];
  
  // Pronunciation breakdown for each word
  const pronunciations = ["저 히", "아 이 는", "수 하 글", "어 려 워 해 요"];
  
  // Total steps = individual words + 1 for reading the full sentence
  const totalSteps = words.length + 1;
  
  // Track which step the user is currently on (0-indexed, completed steps)
  const [currentStep, setCurrentStep] = useState(0);
  
  // Store the latest recording
  const [lastRecording, setLastRecording] = useState(null);
  
  // Audio analyser for visualization
  const [audioAnalyser, setAudioAnalyser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // For full sentence mode: track which word is currently highlighted
  const [sentenceHighlightIndex, setSentenceHighlightIndex] = useState(0);
  
  // Check if we're on the full sentence step
  const isFullSentenceStep = currentStep >= words.length;

  // Animate through words during full sentence step
  useEffect(() => {
    if (isFullSentenceStep) {
      // Reset to first word
      setSentenceHighlightIndex(0);
      
      // Animate through words every 800ms
      const interval = setInterval(() => {
        setSentenceHighlightIndex(prev => {
          if (prev < words.length - 1) {
            return prev + 1;
          }
          return prev; // Stay on last word
        });
      }, 800);
      
      return () => clearInterval(interval);
    }
  }, [isFullSentenceStep, words.length]);

  // Function to move to next step
  const handleStepComplete = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle recording completion
  const handleRecordingComplete = async (audioBlob, audioUrl) => {
    console.log("Recording completed!", { audioBlob, audioUrl });
    
    // Store the recording in state
    setLastRecording({ blob: audioBlob, url: audioUrl });
    
    // Get the current word being practiced
    const currentWord = currentStep < words.length 
      ? words[currentStep] 
      : words.join(" "); // Full sentence for last step
    
    // TODO: Send to backend when ready
    // Example API call (uncomment when backend is available):
    /*
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("problemId", problemId);
      formData.append("currentWord", currentWord);
      formData.append("step", currentStep.toString());
      
      const response = await fetch("/api/speech/analyze", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      console.log("Speech analysis result:", result);
      
      // If pronunciation is correct, move to next step
      if (result.isCorrect) {
        handleStepComplete();
      }
    } catch (error) {
      console.error("Failed to send recording:", error);
    }
    */
    
    // For now, just log the recording info and auto-advance
    console.log(`Recorded word: "${currentWord}" (Step ${currentStep + 1}/${totalSteps})`);
    
    // Auto-advance to next step after recording
    handleStepComplete();
  };

  // Handle analyser changes from record button
  const handleAnalyserChange = (analyser, recording) => {
    setAudioAnalyser(analyser);
    setIsRecording(recording);
  };

  return (
    <Container fluid className="problem-container">
      <ProblemProgress 
        currentWord={currentStep} 
        totalWords={totalSteps} 
      />
      <h2 className="problem-question">{problemText}</h2>
      <div className="problem-answer-section">
        <ProblemMascot />
        <div className="problem-answer-content">
          <ProblemAnswer 
            words={words} 
            pronunciations={pronunciations} 
            currentStep={currentStep}
            sentenceHighlightIndex={isFullSentenceStep ? sentenceHighlightIndex : null}
          />
        </div>
      </div>
      <div className="problem-spacer"></div>
      <div className="problem-bottom-controls">
        <ProblemRecordButton 
          onRecordingComplete={handleRecordingComplete}
          onAnalyserChange={handleAnalyserChange}
        />
        <ProblemSoundwave analyser={audioAnalyser} isRecording={isRecording} />
      </div>
    </Container>
  );
};

export default Problem;
