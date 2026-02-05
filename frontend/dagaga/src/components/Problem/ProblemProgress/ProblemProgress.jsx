import { useNavigate } from "react-router-dom";
import "./ProblemProgress.css";

const ProblemProgress = ({ current, total, currentWord, totalWords, onExit }) => {
  const navigate = useNavigate();
  // Support both generic 'current/total' and specific 'currentWord/totalWords'
  const cur = current !== undefined ? current : currentWord;
  const tot = total !== undefined ? total : totalWords;
  
  const progressPercentage = tot > 0 ? (cur / tot) * 100 : 0;

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
