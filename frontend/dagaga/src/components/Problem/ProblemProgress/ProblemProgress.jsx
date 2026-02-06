import { useNavigate } from "react-router-dom";
import "./ProblemProgress.css";

const ProblemProgress = ({ currentWord, totalWords, onExit }) => {
  const navigate = useNavigate();
  const progressPercentage = totalWords > 0 ? (currentWord / totalWords) * 100 : 0;


  const handleClose = () => {
    if (onExit) {
      onExit();
    } else {
      navigate(-1); // Go back to previous page
    }
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
