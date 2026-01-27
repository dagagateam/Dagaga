import "./ProblemCard.css";

const ProblemCard = ({ problemNumber, problemText, rotation, isActive, onClick }) => {
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
            <span>→ 예시</span>
            <span>→ 모국어</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemCard;
