import "./problem-answer.css";

const ProblemAnswer = ({ words, pronunciations, currentStep }) => {
  // Check if we're on the full sentence step (last step)
  const isFullSentenceStep = currentStep >= words.length;
  
  return (
    <div className="problem-answer-words">
      {words.map((word, index) => {
        const isCurrentWord = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <div key={index} className="word-group">
            <span
              className={`word ${isCurrentWord ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isFullSentenceStep ? 'full-sentence' : ''}`}
            >
              {word}
            </span>
            <span
              className={`pronunciation ${isCurrentWord ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              [ {pronunciations[index] || word.split('').join(' ')} ]
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ProblemAnswer;
