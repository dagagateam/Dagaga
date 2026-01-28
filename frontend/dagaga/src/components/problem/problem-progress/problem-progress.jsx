import { useNavigate } from "react-router-dom";
import "./problem-progress.css";

const ProblemProgress = ({ currentWord, totalWords }) => {
  const navigate = useNavigate();
  const progressPercentage = totalWords > 0 ? (currentWord / totalWords) * 100 : 0;

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="problem-progress-container">
      <div className="progress-bar-wrapper">
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <button className="progress-close-btn" onClick={handleClose}>
        ×
      </button>
    </div>
  );
};

export default ProblemProgress;
