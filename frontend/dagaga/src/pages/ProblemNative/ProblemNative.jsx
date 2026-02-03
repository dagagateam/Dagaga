import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import ProblemProgress from "../../components/Problem/ProblemProgress/ProblemProgress";
import ProblemAnswer from "../../components/Problem/ProblemAnswer/ProblemAnswer";
import ProblemRecordButton from "../../components/Problem/ProblemRecord/ProblemRecordButton";
import ProblemSoundwave from "../../components/Problem/ProblemSoundwave/ProblemSoundwave";
import ProblemMascot from "../../components/Problem/ProblemMascot/ProblemMascot";
import BufferingButton from "../../components/ProblemNative/BufferingButton";
import ProblemDone from "../../components/Problem/ProblemDone/ProblemDone";
import { useSpeechApi } from "../../api/useSpeechApi";
import { useTts } from "../../hooks/useTts";
import { fetchProblemNative } from "../../api/learningApi";
import "./ProblemNative.css";

const MAX_TRIES = 3;

const ProblemNative = () => {
  const { categoryId, problemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [fetchedProblemText, setFetchedProblemText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const problemText = location.state?.problemText || fetchedProblemText || "문제를 불러오는 중...";
  const { translateAudio, checkPronunciation, isUploading } = useSpeechApi();

  // Page state: "pre-translate" | "translating" | "post-translate"
  const [pageState, setPageState] = useState("pre-translate");

  // Audio analyser for visualization
  const [audioAnalyser, setAudioAnalyser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // Translated data from backend (mock for now)
  const [translatedData, setTranslatedData] = useState(null);

  // Post-translate state management (same as Problem page)
  const [currentStep, setCurrentStep] = useState(0);
  const [sentenceHighlightIndex, setSentenceHighlightIndex] = useState(0);

  // Pronunciation feedback state
  const [wordResults, setWordResults] = useState([]); // "correct" | "incorrect" | null for each word
  const [currentTries, setCurrentTries] = useState(0);

  // Fetch problem text if missing
  useEffect(() => {
    if (!location.state?.problemText && categoryId && problemId) {
      setIsLoading(true);
      fetchProblemNative(categoryId, problemId)
        .then((response) => {
          if (response && response.data && response.data.success) {
            setFetchedProblemText(response.data.data);
          } else {
            setFetchedProblemText("문제 정보를 불러올 수 없습니다.");
          }
        })
        .catch((err) => {
          console.error("Error fetching native problem:", err);
          setFetchedProblemText("오류가 발생했습니다.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [categoryId, problemId, location.state]);

  // Handle recording completion in pre-translate state
  const handlePreTranslateRecordingComplete = async ({ audioBlob, audioUrl }) => {
    // DEBUG: Native recording complete
    // console.log("Native recording completed!", { audioBlob, audioUrl });

    // Switch to translating state
    setPageState("translating");

    // Use the hook to translate audio
    const result = await translateAudio(audioBlob, problemId);

    if (result) {
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

  // Animate through words during full sentence step
  useEffect(() => {
    if (pageState === "post-translate" && isFullSentenceStep && !isProblemDone) {
      setSentenceHighlightIndex(0);

      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex++;
        if (currentIndex < words.length) {
          setSentenceHighlightIndex(currentIndex);
        } else {
          setSentenceHighlightIndex(-1);
          clearInterval(interval);
        }
      }, 800);

      return () => clearInterval(interval);
    }
  }, [pageState, isFullSentenceStep, isProblemDone, words.length]);

  // Auto-play TTS when step changes (only in post-translate state)
  useEffect(() => {
    if (pageState !== "post-translate") return;

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
  }, [pageState, currentStep, words, isProblemDone, playTts]);

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
    setSentenceHighlightIndex(0);
  };

  // Post-translate: handle recording completion with pronunciation feedback
  const handlePostTranslateRecordingComplete = async ({ audioBlob, audioUrl }) => {
    const currentWord =
      currentStep < words.length ? words[currentStep] : words.join(" ");

    // DEBUG: Recorded word info
    /*
    console.log(
      `Recorded word: "${currentWord}" (Step ${currentStep + 1}/${totalSteps}, Try ${currentTries + 1}/${MAX_TRIES})`,
    );
    */

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
      <h2 className="problem-question">{problemText}</h2>
      <div className="problem-answer-section">
        <ProblemMascot />
        <div className="problem-answer-content">
          <p className="problem-native-instruction">
            모국어로 해당 질문에 대한 답변을 말해주세요
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
      <h2 className="problem-question">{problemText}</h2>
      <div className="problem-answer-section">
        <ProblemMascot />
        <div className="problem-answer-content">
          <p className="problem-native-instruction">
            번역 중...
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
      <ProblemProgress currentWord={currentStep} totalWords={totalSteps} />
      <h2 className="problem-question">{problemText}</h2>
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
            <ProblemSoundwave analyser={audioAnalyser} isRecording={isRecording} />
          </>
        )}
      </div>
    </Container>
  );

  // Render based on current page state
  return (
    <>
      {pageState === "pre-translate" && renderPreTranslate()}
      {pageState === "translating" && renderTranslating()}
      {pageState === "post-translate" && renderPostTranslate()}
    </>
  );
};

export default ProblemNative;
