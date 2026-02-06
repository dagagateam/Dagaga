import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import ProblemProgress from "../../components/Problem/ProblemProgress/ProblemProgress";
import ProblemAnswer from "../../components/Problem/ProblemAnswer/ProblemAnswer";
import ProblemRecordButton from "../../components/Problem/ProblemRecord/ProblemRecordButton";
import ProblemSoundwave from "../../components/Problem/ProblemSoundwave/ProblemSoundwave";
import ProblemMascot from "../../components/Problem/ProblemMascot/ProblemMascot";
import BufferingButton from "../../components/ProblemNative/BufferingButton";
import ProblemDone from "../../components/Problem/ProblemDone/ProblemDone";
import ProblemRepeat from "../../components/Problem/ProblemRepeat/ProblemRepeatButton";
import ProblemTranslate from "../../components/Problem/ProblemAnswer/ProblemTranslate";
import { useSpeechApi } from "../../api/useSpeechApi";
import { useTts } from "../../hooks/useTts";
import { fetchProblemNative } from "../../api/learningApi";
import ProblemLoading from "../../components/Problem/ProblemLoading/ProblemLoading";
import { useUserStore } from "../../store/userStore";
import "./ProblemNative.css";

const MAX_TRIES = 3;

import { useTranslation } from 'react-i18next';

const ProblemNative = () => {
  const { t } = useTranslation();
  const { categoryId, problemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userLanguage = useUserStore((state) => state.user?.nativeLangCode);

  // Navigation state passed from ScenarioSelect (consistent with Problem.jsx)
  const navState = location.state || {};
  const scenarionStages = navState.stages || [];
  // Note: problemId from params is string, store might have numbers
  const currentStageIndex = scenarionStages.findIndex(s => s.questionId === parseInt(problemId));

  const [fetchedProblemText, setFetchedProblemText] = useState(null);
  const [koreanProblemText, setKoreanProblemText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Prioritize fetched text (native) over passed state (view lang)
  // We strictly wait for fetched text to ensure we don't show/play the wrong language from the card
  const problemText = fetchedProblemText || t("loading_problem");
  const { translateAudio, checkPronunciation, isUploading } = useSpeechApi();

  // Page state: "pre-translate" | "translating" | "post-translate"
  const [pageState, setPageState] = useState("pre-translate");
  const [showNative, setShowNative] = useState(false); // Default to showing native language

  // Audio analyser for visualization
  const [audioAnalyser, setAudioAnalyser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // Translated data from backend (mock for now)
  const [translatedData, setTranslatedData] = useState(null);

  // Post-translate state management (same as Problem page)
  const [currentStep, setCurrentStep] = useState(0);
  const [sentenceHighlightIndex, setSentenceHighlightIndex] = useState(-1);

  // Pronunciation feedback state
  const [wordResults, setWordResults] = useState([]); // "correct" | "incorrect" | null for each word
  const [currentTries, setCurrentTries] = useState(0);

  // DEBUG: Log initial navigation state (User Requested)
  useEffect(() => {
    if (location.state) {
      console.log("[ProblemNative Debug] Navigation State:", location.state);
    }
  }, [location.state]);

  // Fetch problem text ALWAYS to ensure native language (ignoring state for text)
  useEffect(() => {
    if (categoryId && problemId) {
      setIsLoading(true);
      // Pass nativeLangCode to API
      fetchProblemNative(categoryId, problemId)
        .then((response) => {
          if (response && response.data && response.data.success) {
            console.log("[ProblemNative] Fetched Problem:", response.data.data); // DEBUG
            console.log("[ProblemNative] Full Response Data:", response.data); // DEBUG
            // Extract both Korean and native questions
            const nativeText = response.data.data?.nativeQuestion || response.data.data;
            const koreanText = response.data.data?.koreanQuestion || "";
            setFetchedProblemText(nativeText);
            setKoreanProblemText(koreanText);
          } else {
            setFetchedProblemText(t("error_fetching_problem_info"));
          }
        })
        .catch((err) => {
          console.error("Error fetching native problem:", err);
          setFetchedProblemText(t("error_occurred"));
        })
        .finally(() => setIsLoading(false));
    }
  }, [categoryId, problemId]);

  // Handle recording completion in pre-translate state
  const handlePreTranslateRecordingComplete = async ({ audioBlob, audioUrl }) => {
    // DEBUG: Native recording complete
    // console.log("Native recording completed!", { audioBlob, audioUrl });

    // Switch to translating state
    setPageState("translating");

    // Use the hook to translate audio
    const result = await translateAudio(audioBlob, problemId);

    if (result) {
      console.log("[ProblemNative] Translation Result:", result); // DEBUG
      setTranslatedData({
        words: result.words,
        pronunciations: result.pronunciations
      });
      setWordResults(new Array(result.words.length).fill(null));
      setPageState("post-translate");
    } else {
      // Handle error (hook handles logging, just reset state here)
      setPageState("pre-translate");
    }

  };

  // Handle analyser changes from record button (pre-translate)
  const handlePreTranslateAnalyserChange = (analyser, recording) => {
    setAudioAnalyser(analyser);
    setIsRecording(recording);
  };

  // Tts Hook
  const { playTts } = useTts();

  // Post-translate: derived values
  const words = translatedData?.words || [];
  const pronunciations = translatedData?.pronunciations || [];
  const totalSteps = words.length + 1;
  const isFullSentenceStep = currentStep >= words.length;
  // Check if done
  const isProblemDone = currentStep >= totalSteps;

  // Track audio state
  const lastPlayedStepRef = useRef(-1);
  const initialHeaderPlayedRef = useRef(false);

  // Remove Karaoke effect (deleted)

  // Play header when entering pre-translate (Initial Load)
  useEffect(() => {
    if (pageState === "pre-translate" && !initialHeaderPlayedRef.current) {
      if (problemText && problemText !== t("loading_problem")) {
        // Only play if we have the text for the current mode
        const textToPlay = showNative ? problemText : koreanProblemText;
        if (textToPlay) {
          initialHeaderPlayedRef.current = true;
          playTts(textToPlay);
        }
      }
    }
  }, [pageState, problemText, koreanProblemText, showNative, playTts]);

  // Auto-play TTS when step changes (only in post-translate state)
  useEffect(() => {
    if (pageState !== "post-translate") return;

    // Skip step 0 (first word) auto-playing
    if (currentStep > 0 && lastPlayedStepRef.current !== currentStep) {
      let textToPlay = null;
      if (currentStep < words.length) {
        textToPlay = words[currentStep];
      } else if (currentStep === words.length && !isProblemDone) {
        // Full sentence step
        textToPlay = words.join(" ");
      }

      if (textToPlay) {
        lastPlayedStepRef.current = currentStep;
        playTts(textToPlay);
      }
    }
  }, [pageState, currentStep, words, isProblemDone, playTts, t]);

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

  const handlePlayWord = useCallback((text) => {
    if (text) playTts(text, 'normal');
  }, [playTts]);

  // Post-translate: move to next step
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
      setCurrentStep((prev) => prev + 1);
      setCurrentTries(0);
    }
  };

  // Handle return to list
  const handleReturn = () => {
    navigate(-1); // Go back to problem select
  };

  // Handle retry problem (reset post-translate steps)
  const handleRetry = () => {
    setCurrentStep(0);
    setWordResults(new Array(words.length).fill(null));
    setCurrentTries(0);
    setSentenceHighlightIndex(-1); // Ensure it's -1
    lastPlayedStepRef.current = -1; // Reset last played
    initialHeaderPlayedRef.current = true; // Mark as played manually below

    // Play header again
    playTts(problemText);
  };

  // Post-translate: handle recording completion with pronunciation feedback
  const handlePostTranslateRecordingComplete = async ({ audioBlob, audioUrl }) => {
    const currentWord =
      currentStep < words.length ? words[currentStep] : words.join(" ");

    // Use the hook to check pronunciation
    const result = await checkPronunciation(audioBlob, problemId, currentWord, currentStep);
    const isCorrect = result.isCorrect;

    if (isCorrect) {
      // DEBUG: Pronunciation correct
      // console.log("✓ Pronunciation correct!");
      handleStepComplete("correct");
    } else {
      // DEBUG: Pronunciation incorrect
      // console.log("✗ Pronunciation incorrect");
      const newTries = currentTries + 1;
      setCurrentTries(newTries);

      if (newTries >= MAX_TRIES) {
        // DEBUG: Max tries reached
        // console.log(`Max tries (${MAX_TRIES}) reached, moving to next word`);
        handleStepComplete("incorrect");
      } else {
        // DEBUG: Try again
        // console.log(`Try again (${newTries}/${MAX_TRIES})`);
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

  // Render pre-translate state
  const renderPreTranslate = () => (
    <Container fluid className="problem-native-container pre-translate">
      <ProblemProgress
        current={currentStageIndex}
        total={scenarionStages.length}
        onExit={() => navigate(`/ProblemSelect/${categoryId}`)}
      />
      <div className="problem-question-header-centered">
        <div className="problem-native-header-row">
          <h2 className="problem-native-header-text">
            {koreanProblemText || problemText}
          </h2>
          <ProblemTranslate onClick={() => setShowNative(!showNative)} active={showNative} />
          <ProblemRepeat onClick={() => playTts(koreanProblemText || problemText)} />
        </div>
        {showNative && (
          <div className="problem-translation-text">
            {problemText}
          </div>
        )}
      </div>
      <div className="problem-answer-section">
        <ProblemMascot />
        <div className="problem-answer-content">
          <p className="problem-native-instruction">
            {t('native_answer_instruction')}
          </p>
        </div>
      </div>
      <div className="problem-spacer"></div>
      <div className="problem-bottom-controls">
        <ProblemRecordButton
          onRecordingComplete={handlePreTranslateRecordingComplete}
          onAnalyserChange={handlePreTranslateAnalyserChange}
        />
        <ProblemSoundwave analyser={audioAnalyser} isRecording={isRecording} />
      </div>
    </Container>
  );

  // Render translating state
  const renderTranslating = () => (
    <Container fluid className="problem-native-container translating">
      <div className="problem-question-header-centered">
        <div className="problem-native-header-row">
          <h2 className="problem-native-header-text">
            {koreanProblemText || problemText}
          </h2>
          <ProblemTranslate onClick={() => setShowNative(!showNative)} active={showNative} />
        </div>
        {showNative && (
          <div className="problem-translation-text">
            {problemText}
          </div>
        )}
      </div>
      <div className="problem-answer-section">
        <ProblemMascot />
        <div className="problem-answer-content">
          <p className="problem-native-instruction">
            {t('translating')}
          </p>
        </div>
      </div>
      <div className="problem-spacer"></div>
      <div className="problem-bottom-controls">
        <BufferingButton />
        <ProblemSoundwave analyser={null} isRecording={false} />
      </div>
    </Container>
  );

  // Render post-translate state (same as Problem page)
  const renderPostTranslate = () => (
    <Container fluid className="problem-native-container post-translate">
      <ProblemProgress
        current={currentStageIndex + 1}
        total={scenarionStages.length}
        onExit={() => navigate(`/ProblemSelect/${categoryId}`)}
      />
      <div className="problem-question-header-centered">
        <div className="problem-native-header-row">
          <h2 className="problem-native-header-text">
            {koreanProblemText || problemText}
          </h2>
          <ProblemTranslate onClick={() => setShowNative(!showNative)} active={showNative} />
          <ProblemRepeat onClick={() => playTts(koreanProblemText || problemText)} />
        </div>
        {showNative && (
          <div className="problem-translation-text">
            {problemText}
          </div>
        )}
      </div>
      <div className="problem-answer-section">
        <ProblemMascot />
        <div className="problem-answer-content">
          <ProblemAnswer
            words={words}
            pronunciations={pronunciations}
            currentStep={currentStep}
            sentenceHighlightIndex={
              isFullSentenceStep ? sentenceHighlightIndex : null
            }
            wordResults={wordResults}
            onReplay={handleReplay}
            onSlowReplay={handleSlowReplay}
            onPlayWord={handlePlayWord}
          />
        </div>
      </div>
      <div className="problem-spacer"></div>
      <div className="problem-bottom-controls">
        {currentStep >= totalSteps ? (
          <ProblemDone onRetry={handleRetry} onReturn={handleReturn} />
        ) : (
          <>
            {isUploading ? (
              <BufferingButton />
            ) : (
              <ProblemRecordButton
                onRecordingComplete={handlePostTranslateRecordingComplete}
                onAnalyserChange={handlePreTranslateAnalyserChange}
              />
            )}
          </>
        )}
        <ProblemSoundwave analyser={audioAnalyser} isRecording={isRecording} />
      </div>
    </Container>
  );

  // Render based on current page state
  if (isLoading) {
    return <ProblemLoading text={t('loading_problem')} />;
  }

  if (pageState === "translating") {
    return <ProblemLoading text={t('translating')} />;
  }

  return (
    <>
      {pageState === "pre-translate" && renderPreTranslate()}
      {pageState === "translating" && renderTranslating()}
      {pageState === "post-translate" && renderPostTranslate()}
    </>
  );
};

export default ProblemNative;
