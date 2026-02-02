import "./ProblemAnswerPronunciation.css";

const ProblemAnswerPronunciation = ({ words, pronunciations }) => {
  return (
    <div className="pronunciation-container">
      {words.map((word, index) => (
        <span key={index} className="pronunciation-word">
          [ {pronunciations[index] || word.split('').join(' ')} ]
        </span>
      ))}
    </div>
  );
};

export default ProblemAnswerPronunciation;
