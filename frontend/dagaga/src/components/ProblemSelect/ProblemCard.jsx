import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./ProblemCard.css";

const ProblemCard = ({ 
  problemNumber, 
  problemText, 
  categoryId, // New prop
  words = [], 
  pronunciations = [],
  rotation, 
  isActive, 
  onClick,
  ...props // Capture other props like translations, stages
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Pass translations in navigating state
  const handleExampleClick = (e) => {
    e.stopPropagation(); 
    navigate(`/Problem/${categoryId}/${problemNumber}`, { 
      state: { 
        categoryId, 
        problemText,
        words,
        pronunciations,
        translations: props.translations, // ProblemSelect passes this now? Check usage
        stages: props.stages || [] // We need the list of stages for progress bar!
      } 
    });
  };

  const handleTranslateClick = (e) => {
    e.stopPropagation(); 
    navigate(`/ProblemTranslate/${categoryId}/${problemNumber}`, { 
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
        <span className="problem-number">{t('problem')} {problemNumber}</span>
        <p className="problem-text">{problemText}</p>
        {isActive && (
          <div className="problem-arrows">
            <span onClick={handleExampleClick}>→ {t('example')}</span>
            <span onClick={handleTranslateClick}>→ {t('native_view')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemCard;

