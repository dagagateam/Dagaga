import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import ProblemProgress from "../../components/problem/problem-progress/problem-progress";
import ProblemAnswer from "../../components/problem/problem-answer/problem-answer";
import ProblemRecordButton from "../../components/problem/problem-record/problem-record-button";
import ProblemSoundwave from "../../components/problem/problem-soundwave/problem-soundwave";
import ProblemRepeat from "../../components/problem/problem-repeat/problem-repeat";
import ProblemRepeatSlow from "../../components/problem/problem-repeat/problem-repeat-slow";
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

  // Function to move to next step (will be called when user reads a word or full sentence)
  const handleStepComplete = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
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
          <ProblemAnswer words={words} pronunciations={pronunciations} currentStep={currentStep} />
        </div>
      </div>
      <ProblemRepeat />
      <ProblemRepeatSlow />
      <ProblemRecordButton />
      <ProblemSoundwave />
    </Container>
  );
};

export default Problem;
