import { useNavigate } from "react-router-dom";
import "./ProblemCard.css";

const ProblemCard = ({ problemNumber, problemText, rotation, isActive, onClick }) => {
  const navigate = useNavigate();

  const handleExampleClick = (e) => {
    e.stopPropagation(); // Prevent card click from triggering
    navigate(`/problem/${problemNumber}`, { state: { problemText } });
  };

  const handleTranslateClick = (e) => {
    e.stopPropagation(); // Prevent card click from triggering
    navigate(`/problem-translate/${problemNumber}`, { state: { problemText } });
  };

  return (
    <div
      className={`problem-card ${isActive ? "active" : ""}`}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
      onClick={onClick}
    >
      <div className="problem-card-content">
        <span className="problem-number">문제 {problemNumber}</span>
        <p className="problem-text">{problemText}</p>
        {isActive && (
          <div className="problem-arrows">
            <span onClick={handleExampleClick}>→ 예시</span>
            <span onClick={handleTranslateClick}>→ 모국어</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemCard;

