import ProblemRepeat from "../problem-repeat/problem-repeat";
import ProblemRepeatSlow from "../problem-repeat/problem-repeat-slow";
import "./problem-answer.css";

const ProblemAnswer = ({ words, pronunciations, currentStep, sentenceHighlightIndex }) => {
  // Check if we're on the full sentence step (last step)
  const isFullSentenceStep = currentStep >= words.length;
  
  // Check if all words should be highlighted (-1 = select all)
  const isAllSelected = isFullSentenceStep && sentenceHighlightIndex === -1;
  
  return (
    <div className="problem-answer-words">
      {words.map((word, index) => {
        const isCurrentWord = index === currentStep;
        const isCompleted = index < currentStep;
        
        // During full sentence mode, highlight based on sentenceHighlightIndex
        // If sentenceHighlightIndex is -1, highlight all words
        const isSentenceHighlight = isFullSentenceStep && (sentenceHighlightIndex === index || isAllSelected);
        
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
      {/* Show repeat buttons for entire sentence during full sentence mode - visible only when all selected */}
      {isFullSentenceStep && (
        <div className={`sentence-buttons ${isAllSelected ? 'visible' : ''}`}>
          <ProblemRepeat />
          <ProblemRepeatSlow />
        </div>
      )}
    </div>
  );
};

export default ProblemAnswer;
