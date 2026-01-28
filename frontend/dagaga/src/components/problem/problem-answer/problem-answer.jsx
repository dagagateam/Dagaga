import ProblemRepeat from "../problem-repeat/problem-repeat";
import ProblemRepeatSlow from "../problem-repeat/problem-repeat-slow";
import "./problem-answer.css";

const ProblemAnswer = ({ words, pronunciations, currentStep, sentenceHighlightIndex }) => {
  // Check if we're on the full sentence step (last step)
  const isFullSentenceStep = currentStep >= words.length;
  
  return (
    <div className="problem-answer-words">
      {words.map((word, index) => {
        const isCurrentWord = index === currentStep;
        const isCompleted = index < currentStep;
        
        // During full sentence mode, highlight based on sentenceHighlightIndex
        const isSentenceHighlight = isFullSentenceStep && sentenceHighlightIndex === index;
        
        return (
          <div key={index} className="word-group">
            <span
              className={`word ${isCurrentWord ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isFullSentenceStep ? 'full-sentence' : ''} ${isSentenceHighlight ? 'sentence-highlight' : ''}`}
            >
              {word}
            </span>
            <span
              className={`pronunciation ${isCurrentWord ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isSentenceHighlight ? 'sentence-highlight' : ''}`}
            >
              [ {pronunciations[index] || word.split('').join(' ')} ]
            </span>
            {isCurrentWord && (
              <div className="word-buttons">
                <ProblemRepeat />
                <ProblemRepeatSlow />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProblemAnswer;
