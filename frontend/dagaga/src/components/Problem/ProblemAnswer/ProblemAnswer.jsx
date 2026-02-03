import ProblemRepeat from "../ProblemRepeat/ProblemRepeatButton";
import ProblemRepeatSlow from "../ProblemRepeat/ProblemRepeatSlow";
import "./ProblemAnswer.css";

const ProblemAnswer = ({ words, pronunciations, currentStep, sentenceHighlightIndex, wordResults, onReplay, onSlowReplay, showTranslations, nativeAnswer }) => {
  // Check if we're on the full sentence step (last step)
  const isFullSentenceStep = currentStep >= words.length;
  
  // Check if all words should be highlighted (-1 = select all)
  const isAllSelected = isFullSentenceStep && sentenceHighlightIndex === -1;

  return (
    <>
      {/* Show full native answer above the words if toggle is active */}
     <div className={`problem-native-answer ${showTranslations ? 'visible' : ''}`}>
        {nativeAnswer || "\u00A0"}
     </div>

    <div className="problem-answer-words">
      {words.map((word, index) => {
        const isCurrentWord = index === currentStep;
        const isCompleted = index < currentStep;
        
        // Get result for this word (correct/incorrect/null)
        const result = wordResults?.[index] || null;
        
        // During full sentence mode, highlight based on sentenceHighlightIndex
        // If sentenceHighlightIndex is -1, highlight all words
        const isSentenceHighlight = isFullSentenceStep && (sentenceHighlightIndex === index || isAllSelected);
        
        // Build class names
        const wordClasses = [
          'word',
          isCurrentWord ? 'current' : '',
          isCompleted ? 'completed' : '',
          isFullSentenceStep ? 'full-sentence' : '',
          isSentenceHighlight ? 'sentence-highlight' : '',
          result === 'correct' ? 'correct' : '',
          result === 'incorrect' ? 'incorrect' : ''
        ].filter(Boolean).join(' ');
        
        const pronunciationClasses = [
          'pronunciation',
          isCurrentWord ? 'current' : '',
          isCompleted ? 'completed' : '',
          isSentenceHighlight ? 'sentence-highlight' : '',
          result === 'correct' ? 'correct' : '',
          result === 'incorrect' ? 'incorrect' : ''
        ].filter(Boolean).join(' ');
        
        return (
          <div key={index} className="word-group">
            <span className={wordClasses}>
              {word}
            </span>
            <span className={pronunciationClasses}>
              [ {pronunciations[index] || word.split('').join(' ')} ]
            </span>
            {isCurrentWord && (
              <div className="word-buttons">
                <ProblemRepeat onClick={onReplay} />
                <ProblemRepeatSlow onClick={onSlowReplay} />
              </div>
            )}
          </div>
        );
      })}
      {/* Show repeat buttons for entire sentence during full sentence mode - visible only when all selected */}
      {isFullSentenceStep && (
        <div className={`sentence-buttons ${isAllSelected ? 'visible' : ''}`}>
          <ProblemRepeat onClick={onReplay} />
          <ProblemRepeatSlow onClick={onSlowReplay} />
        </div>
      )}
    </div>
    </>
  );
};

export default ProblemAnswer;
