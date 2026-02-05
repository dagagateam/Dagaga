import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import ProblemProgress from "../../components/Problem/ProblemProgress/ProblemProgress";
import ProblemAnswer from "../../components/Problem/ProblemAnswer/ProblemAnswer";
import ProblemRecordButton from "../../components/Problem/ProblemRecord/ProblemRecordButton";
import ProblemSoundwave from "../../components/Problem/ProblemSoundwave/ProblemSoundwave";
import ProblemMascot from "../../components/Problem/ProblemMascot/ProblemMascot";
import ProblemDone from "../../components/Problem/ProblemDone/ProblemDone";
import ProblemRepeat from "../../components/Problem/ProblemRepeat/ProblemRepeatButton.jsx";
import ProblemTranslate from "../../components/Problem/ProblemAnswer/ProblemTranslate"; // Use existing component
import ProblemLoading from "../../components/Problem/ProblemLoading/ProblemLoading";
import { fetchProblemDetail, fetchProblemNative, evaluatePronunciation } from "../../api/learningApi"; // Import API
import { useTts } from "../../hooks/useTts";
import { useUserStore } from "../../store/userStore"; // Import User Store
import "./Problem.css";

const MAX_TRIES = 3;

const Problem = () => {
  const { categoryId, questionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userLanguage = useUserStore((state) => state.user?.nativeLangCode); // Get user's native language

  // Navigation state passed from ScenarioSelect
  const navState = location.state || {};
  const scenarionStages = navState.stages || [];
  const currentStageIndex = scenarionStages.findIndex(s => s.questionId === parseInt(questionId));

  // Audio hooks
  /* Audio hooks: expose stopTts for cleanup */
  const { playTts, isPlaying: isTtsPlaying, stopTts } = useTts();

  // State initialization
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [wordResults, setWordResults] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [showNative, setShowNative] = useState(false); // Default to NOT showing native (translated) text
  const [sentenceHighlightIndex, setSentenceHighlightIndex] = useState(-1);
  const [currentTries, setCurrentTries] = useState(0);

  // Audio analyser for visualization
  const [audioAnalyser, setAudioAnalyser] = useState(null);

  // Track if initial audio has played to prevent re-playing on re-renders
  const initialAudioPlayedRef = useRef(false);

  // Fetch data if missing from navigation state
  useEffect(() => {
    const fetchData = async () => {
      // If we have full data in state (from ScenarioSelect), use it
      // DEBUG: NavState
      // console.log("NavState:", navState);
      if (navState.words && navState.words.length > 0) {
        // DEBUG: NavState Translations
        // console.log("Using NavState Translations:", navState.translations);

        // DEBUG: Full Nav State Data Object (User Requested)
        console.log("[Problem Debug] Full Nav State Object:", navState);
        console.log("[Problem Debug] User Language:", userLanguage);

        let nativeQ = navState.nativeQuestion;
        // Handle case where nativeQuestion might be an object
        if (nativeQ && typeof nativeQ === 'object') {
          nativeQ = nativeQ.nativeQuestion || nativeQ.koreanQuestion || null;
        }

        // If nativeQuestion is missing, try to fetch it separately
        if (!nativeQ && categoryId && questionId) {
          try {
            const nativeRes = await fetchProblemNative(categoryId, questionId);
            if (nativeRes.data && nativeRes.data.success) {
              const nativeData = nativeRes.data.data;
              nativeQ = typeof nativeData === 'string'
                ? nativeData
                : (nativeData?.nativeQuestion || nativeData?.koreanQuestion || null);
            }
          } catch (e) {
            console.warn("Failed to fetch native question", e);
          }
        }

        setData({
          problemText: navState.problemText,
          words: navState.words,
          pronunciations: navState.pronunciations,
          translations: navState.translations,
          nativeQuestion: nativeQ || navState.problemText, // Fallback to problem text if fetch fails
          nativeAnswer: null, // NavState might not have full details, default null
          exampleAnswer: navState.exampleAnswer,
        });
        setLoading(false);
        return;
      }

      // We need categoryId to fetch.
      if (categoryId && questionId) {
        try {
          // DEBUG: Fetch Detail
          // console.log(`Fetching details for ${categoryId} problem ${questionId}...`);
          const [detailRes, nativeRes] = await Promise.all([
            fetchProblemDetail(categoryId, questionId),
            fetchProblemNative(categoryId, questionId)
          ]);

          if (detailRes.data && detailRes.data.success) {
              const apiData = detailRes.data.data;
              // DEBUG: Full API Data Object
              console.log("[Problem Debug] Full API Data Object:", apiData); // LOG FULL OBJECT
              
              // Determine native question/answer based on user language or fallback to available translation
              let nativeQ = null;
              let nativeA = null;

              // Priority: User's View Language -> Vietnamese (Mock Support) -> Chinese (Future)
              if (userLanguage === 'vi' || apiData.viQuestions) {
                  nativeQ = apiData.viQuestions;
                  nativeA = apiData.viAnswers;
              } else if (userLanguage === 'zh' || apiData.zhQuestions) {
                  nativeQ = apiData.zhQuestions;
                  nativeA = apiData.zhAnswers;
              }

              // If translation exists, set showNative to true by default (if not already handled)
              // Note: We initialized state to false, but we can update it here if meaningful
              
              // Fallback for question if translation is missing -> Use Original
              if (!nativeQ) {
                if (nativeRes.data && nativeRes.data.success) {
                  // Extract native question string from response (might be object)
                  const nativeData = nativeRes.data.data;
                  nativeQ = typeof nativeData === 'string' 
                    ? nativeData 
                    : (nativeData?.nativeQuestion || nativeData?.koreanQuestion || apiData.questionText);
                } else {
                  nativeQ = apiData.questionText;
                }
              }
              
              // DEBUG: Language info
              console.log("[Problem] User Language:", userLanguage);
              console.log("[Problem] Native Question (Translated):", nativeQ);
              console.log("[Problem] Native Answer (Translated):", nativeA);

              setData({
                  problemText: apiData.questionText,
                  words: apiData.words,
                  pronunciations: apiData.pronunciation_guide || apiData.pronunciationGuide || [],
                  translations: apiData.wordTranslations || [],
                  nativeQuestion: nativeQ,
                  nativeAnswer: nativeA,
                  exampleAnswer: apiData.exampleAnswer,
              });
            }
        } catch (err) {
          console.error("Failed to fetch problem details", err);
        } finally {
          setLoading(false);
        }
      } else {
        console.warn("Cannot fetch details: Missing categoryId or questionId");
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId, questionId, navState, userLanguage]);


  const problemText = data?.problemText || "문제를 불러오는 중...";
  const exampleAnswer = data?.exampleAnswer;
  const nativeAnswer = data?.nativeAnswer; // Get native answer

  // Memoize words and pronunciations
  const words = data?.words || [];
  const pronunciations = data?.pronunciations || [];
  const translations = data?.translations || [];

  // Total steps = individual words + 1 for reading the full sentence
  const totalSteps = words.length + 1;
  const isProblemDone = currentStep >= totalSteps;
  const isFullSentenceStep = currentStep >= words.length;

  // Auto-play TTS when data loads: Question then Word (once per page load)
  useEffect(() => {
    const playSeq = async () => {
      if (!data) return;

      if (!initialAudioPlayedRef.current) {
        initialAudioPlayedRef.current = true;

        // Play question first
        if (data.problemText) {
          await playTts(data.problemText);
        }
      }
    };
    playSeq();
  }, [data, playTts]); // Only depend on data and playTts to run once when data is ready

  // Track the last played step index to prevent double playback in StrictMode
  const lastPlayedStepRef = useRef(-1);

  // Auto-play TTS when moving to next word (skip step 0 as it's handled above)
  useEffect(() => {
    if (currentStep > 0 && lastPlayedStepRef.current !== currentStep) {
      if (currentStep < words.length) {
        lastPlayedStepRef.current = currentStep;
        playTts(words[currentStep]);
      } else if (currentStep === words.length) {
        // Play full sentence (Answer)
        const sentenceToPlay = exampleAnswer || words.join(" ");
        lastPlayedStepRef.current = currentStep;
        playTts(sentenceToPlay);
      }
    }
  }, [currentStep, words, playTts, exampleAnswer]);




  // Handle step completion
  const handleStepComplete = (result) => {
    // Update result
    if (currentStep < words.length && result) {
      setWordResults(prev => ({
        ...prev,
        [currentStep]: result
      }));
    }

    // Move to next
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setCurrentTries(0);
    }
  };

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      stopTts();
    };
  }, [stopTts]);

  const handleReturn = () => navigate(-1);

  const handleRetry = () => {
    stopTts();
    setCurrentStep(0);
    setWordResults({});
    setCurrentTries(0);
    setSentenceHighlightIndex(-1); // Ensure it's reset to -1 (default)
    setSentenceHighlightIndex(-1); // Ensure it's reset to -1 (default)
    initialAudioPlayedRef.current = true; // Mark as played since we manual play below
    lastPlayedStepRef.current = -1; // Reset last played tracking
    
    // Manually replay the header question
    if (data && data.problemText) {
      setTimeout(() => {
        playTts(data.problemText);
      }, 100); // Small delay to ensure state settles
    }
  };

  // Mock checkPronunciation since useSpeechApi usage was inconsistent in snippets
  const checkPronunciation = async (blob, pid, word, step) => {
    // Logic from API/mock
    return await evaluatePronunciation(blob, word);
  };

  // Lock to prevent double submission
  const isProcessingRef = useRef(false);

  const handleRecordingComplete = async ({ audioBlob }) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const currentWord = currentStep < words.length ? words[currentStep] : words.join(" ");
    // DEBUG: Recorded word info
    // console.log(`[Problem] Recorded: "${currentWord}" (Step ${currentStep + 1}/${totalSteps}, Try ${currentTries + 1}/${MAX_TRIES})`);

    try {
      const result = await checkPronunciation(audioBlob, questionId, currentWord, currentStep);

      // Check if pronunciation was correct based on API response structure
      // 'data' property holds the boolean correctness in our mock/API
      const isCorrect = result.data === true;

      if (isCorrect) {
        // DEBUG: Pronunciation correct
        console.log("✓ Pronunciation correct!");
        handleStepComplete("correct");
      } else {
        // DEBUG: Pronunciation incorrect
        console.log("✗ Pronunciation incorrect");
        const newTries = currentTries + 1;
        setCurrentTries(newTries);

        if (newTries >= MAX_TRIES) {
          // DEBUG: Max tries reached
          // console.log(`Max tries (${MAX_TRIES}) reached, marking as incorrect and moving on.`);
          handleStepComplete("incorrect");
        } else {
          // DEBUG: Try again
          // console.log(`Try again (${newTries}/${MAX_TRIES})`);
          if (currentStep < words.length) {
            setWordResults(prev => ({ ...prev, [currentStep]: "incorrect" }));
          }
        }
      }
    } catch (e) {
      console.error("Eval error", e);
      // Fallback or just count as try? For now, fallback to incorrect to avoid stuck state
      handleStepComplete("incorrect");
    } finally {
      // Small delay to allow state updates to settle before unlocking
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 500);
    }
  };

  const handleAnalyserChange = (analyser, recording) => {
    setAudioAnalyser(analyser);
    setIsRecording(recording);
  };

  const handleReplay = useCallback(() => {
    let text = null;
    if (currentStep < words.length) text = words[currentStep];
    else if (currentStep === words.length) text = words.join(" ");
    if (text) playTts(text, 'normal');
  }, [currentStep, words, playTts]);

  const handleSlowReplay = useCallback(() => {
    let text = null;
    if (currentStep < words.length) text = words[currentStep];
    else if (currentStep === words.length) text = words.join(" ");
    if (text) playTts(text, 'slow');
  }, [currentStep, words, playTts]);

  const handlePlayWord = useCallback((text) => {
    if (text) playTts(text, 'normal');
  }, [playTts]);

  const handleQuestionReplay = useCallback(() => {
    if (data && data.problemText) {
      playTts(data.problemText);
    }
  }, [data, playTts]);

  // DEBUG: Show native state
  // console.log("[Problem Render] showNative:", showNative, "nativeAnswer:", nativeAnswer);

  return (
    <Container fluid className="problem-container">
      {/* ... (progress bar, etc) ... */}
      <ProblemProgress
        current={currentStageIndex + 1}
        total={scenarionStages.length}
        onExit={() => navigate('/ScenarioSelect')}
      />
      
      {loading ? (
        <ProblemLoading text="문제를 불러오는 중..." />
      ) : (
        <>
      <div className="problem-question">
        <div className="problem-header">
          <h2>
            {showNative ? data?.nativeQuestion : problemText}
          </h2>
          {userLanguage !== 'ko' && <ProblemTranslate onClick={() => setShowNative(!showNative)} active={showNative} />}
          <ProblemRepeat onClick={handleQuestionReplay} />
        </div>
      </div>

      <div className="problem-answer-section">
        <ProblemMascot />
        <div className="problem-answer-content">
          <ProblemAnswer
            words={words}
            pronunciations={pronunciations}
            translations={translations}
            currentStep={currentStep}
            sentenceHighlightIndex={isFullSentenceStep ? sentenceHighlightIndex : null}
            wordResults={wordResults}
            onReplay={handleReplay}
            onSlowReplay={handleSlowReplay}
            onPlayWord={handlePlayWord}
            showTranslations={showNative}
            nativeAnswer={nativeAnswer}
          />
        </div>
      </div>
      {/* ... (rest of the component) ... */}
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
      </>
      )}
    </Container>
  );
};

export default Problem;
