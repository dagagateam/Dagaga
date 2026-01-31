import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import ProblemProgress from "../../components/problem/problem-progress/ProblemProgress";
import ProblemAnswer from "../../components/problem/problem-answer/ProblemAnswer";
import ProblemRecordButton from "../../components/problem/problem-record/ProblemRecordButton";
import ProblemSoundwave from "../../components/problem/problem-soundwave/ProblemSoundwave";
import ProblemMascot from "../../components/problem/problem-mascot/ProblemMascot";
import ProblemDone from "../../components/problem/problem-done/ProblemDone";
import { useSpeechApi } from "../../api/useSpeechApi";
import { useTts } from "../../hooks/useTts";
import { fetchProblemDetail } from "../../api/learningApi"; // Import API
import "./Problem.css";

const MAX_TRIES = 3;

const Problem = () => {
  const { problemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { checkPronunciation } = useSpeechApi();
  
  // Initialize state from navigation, or defaults
  const [navState, setNavState] = useState(location.state || {});
  
  // Fetch data if missing from navigation state
  useEffect(() => {
    const fetchData = async () => {
      // If we have words already, no need to fetch
      if (navState.words && navState.words.length > 0) return;

      // We need categoryId to fetch. If missing (e.g. reload), we might be stuck unless we update route.
      // For now, check if we passed it.
      const categoryId = navState.categoryId;
      if (categoryId && problemId) {
        try {
            console.log(`Fetching details for ${categoryId} problem ${problemId}...`);
            const response = await fetchProblemDetail(categoryId, problemId);
            if (response.data && response.data.success) {
                const data = response.data.data;
                setNavState(prev => ({
                    ...prev,
                    problemText: data.questionText,
                    words: data.words,
                    // Handle API field names
                    pronunciations: data.pronunciation_guide || data.pronunciationGuide || []
                }));
            }
        } catch (err) {
            console.error("Failed to fetch problem details", err);
        }
      } else {
         console.warn("Cannot fetch details: Missing categoryId or problemId");
      }
    };
    fetchData();
  }, [navState.words, navState.categoryId, problemId]);

  const problemText = navState.problemText || "문제를 불러오는 중...";
  
  // Memoize words and pronunciations
  const words = useMemo(() => navState.words || [], [navState.words]);
  const pronunciations = useMemo(() => navState.pronunciations || [], [navState.pronunciations]);
  
  // Total steps = individual words + 1 for reading the full sentence
  const totalSteps = words.length + 1;
  
  // Track which step the user is currently on (0-indexed, completed steps)
  const [currentStep, setCurrentStep] = useState(0);
  
  // Audio analyser for visualization
  const [audioAnalyser, setAudioAnalyser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // For full sentence mode: track which word is currently highlighted (-1 = all words)
  const [sentenceHighlightIndex, setSentenceHighlightIndex] = useState(0);
  
  // Pronunciation feedback state
  const [wordResults, setWordResults] = useState(new Array(words.length).fill(null));
  const [currentTries, setCurrentTries] = useState(0);
  
  // Check if we're on the full sentence step
  const isFullSentenceStep = currentStep >= words.length;
  const isProblemDone = currentStep >= totalSteps;

  // Animate through words during full sentence step, then select all
  useEffect(() => {
    if (isFullSentenceStep && !isProblemDone) {
      // Reset to first word
      setSentenceHighlightIndex(0);
      
      let currentIndex = 0;
      
      // Animate through words every 500ms
      const interval = setInterval(() => {
        currentIndex++;
        if (currentIndex < words.length) {
          setSentenceHighlightIndex(currentIndex);
        } else {
          // After all words, highlight entire sentence (-1 = all)
          setSentenceHighlightIndex(-1);
          clearInterval(interval);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isFullSentenceStep, isProblemDone, words.length]);

  // Function to move to next step with result
  const handleStepComplete = (result) => {
    // Update the result for the current word
    if (currentStep < words.length && result) {
      setWordResults(prev => {
        const newResults = [...prev];
        newResults[currentStep] = result;
        return newResults;
      });
    }
    
    // Move to next step and reset tries
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setCurrentTries(0);
    }
  };

  // Handle return to list
  const handleReturn = () => {
    navigate(-1); // Go back to problem select
  };

  // Handle retry problem
  const handleRetry = () => {
    setCurrentStep(0);
    setWordResults(new Array(words.length).fill(null));
    setCurrentTries(0);
    setSentenceHighlightIndex(0);
  };

  // Tts Hook
  const { playTts } = useTts();

  // Handle Recording Complete ...

  // Auto-play TTS when step changes
  useEffect(() => {
    // Determine the text to play
    let textToPlay = null;
    if (currentStep < words.length) {
      textToPlay = words[currentStep];
    } else if (currentStep === words.length && !isProblemDone) {
      // Full sentence step
      textToPlay = words.join(" ");
    }

    if (textToPlay) {
      playTts(textToPlay);
    }
  }, [currentStep, words, isProblemDone, playTts]);

  // Handle replay at normal speed
  const handleReplay = () => {
    let textToPlay = null;
    if (currentStep < words.length) {
      textToPlay = words[currentStep];
    } else if (currentStep === words.length) {
      textToPlay = words.join(" ");
    }

    if (textToPlay) {
      playTts(textToPlay, 'normal');
    }
  };

  // Handle replay at slow speed
  const handleSlowReplay = () => {
     let textToPlay = null;
    if (currentStep < words.length) {
      textToPlay = words[currentStep];
    } else if (currentStep === words.length) {
      textToPlay = words.join(" ");
    }

    if (textToPlay) {
      playTts(textToPlay, 'slow');
    }
  };

  // Handle recording completion with pronunciation feedback
  const handleRecordingComplete = async ({ audioBlob, audioUrl }) => {
    // Get the current word being practiced
    const currentWord = currentStep < words.length 
      ? words[currentStep] 
      : words.join(" "); // Full sentence for last step
    
    console.log(
      `Recorded word: "${currentWord}" (Step ${currentStep + 1}/${totalSteps}, Try ${currentTries + 1}/${MAX_TRIES})`,
    );

    // Use the hook to check pronunciation
    // Internally it mocks the response for now, but has the real API call commented out
    const result = await checkPronunciation(audioBlob, problemId, currentWord, currentStep);
    const isCorrect = result.isCorrect;
    
    if (isCorrect) {
      console.log("✓ Pronunciation correct!");
      handleStepComplete("correct");
    } else {
      console.log("✗ Pronunciation incorrect");
      const newTries = currentTries + 1;
      setCurrentTries(newTries);
      
      if (newTries >= MAX_TRIES) {
        console.log(`Max tries (${MAX_TRIES}) reached, moving to next word`);
        handleStepComplete("incorrect");
      } else {
        console.log(`Try again (${newTries}/${MAX_TRIES})`);
        // Update result to show current attempt was wrong, but don't advance
        if (currentStep < words.length) {
          setWordResults(prev => {
            const newResults = [...prev];
            newResults[currentStep] = "incorrect";
            return newResults;
          });
        }
      }
    }
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
            wordResults={wordResults}
            onReplay={handleReplay}
            onSlowReplay={handleSlowReplay}
          />
        </div>
      </div>
      <div className="problem-spacer"></div>
      <div className="problem-bottom-controls">
        {isProblemDone ? (
          <ProblemDone onRetry={handleRetry} onReturn={handleReturn} />
        ) : (
          <>
            <ProblemRecordButton 
              onRecordingComplete={handleRecordingComplete}
              onAnalyserChange={handleAnalyserChange}
            />
            <ProblemSoundwave analyser={audioAnalyser} isRecording={isRecording} />
          </>
        )}
      </div>
    </Container>
  );
};

export default Problem;
