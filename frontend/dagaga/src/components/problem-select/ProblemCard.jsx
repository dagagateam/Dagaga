import { useNavigate } from "react-router-dom";
import "./ProblemCard.css";

const ProblemCard = ({ 
  problemNumber, 
  problemText, 
  categoryId, // New prop
  words = [], 
  pronunciations = [],
  rotation, 
  isActive, 
  onClick 
}) => {
  const navigate = useNavigate();

  const handleExampleClick = (e) => {
    e.stopPropagation(); // Prevent card click from triggering
    navigate(`/problem/${problemNumber}`, { 
      state: { 
        categoryId, // Pass for API calls if needed
        problemText,
        words,
        pronunciations
      } 
    });
  };

  const handleTranslateClick = (e) => {
    e.stopPropagation(); // Prevent card click from triggering
    navigate(`/problem-translate/${categoryId}/${problemNumber}`, { 
      state: { 
        problemText,
        words,
        pronunciations
      } 
    });
  };

  return (
    <div
      className={`problem-card ${isActive ? "active" : ""}`}
      style={{
        transform: `translateY(-50%) rotate(${rotation}deg)`,
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

