import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import "./ScenarioCard.css";

const ScenarioCard = ({ scenario, isSelected, onSelect }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleArrowClick = (e) => {
    e.stopPropagation();
    navigate(`/ProblemSelect/${scenario.id}`);
  };

  return (
    <motion.div 
      className={`scenario-card ${isSelected ? "expanded" : "collapsed"}`} 
      onClick={() => onSelect(scenario.id)}

      layout
      initial={false} // Prevent animation on mount/back navigation
      whileHover={!isSelected ? { scale: 1.02, y: -4 } : {}}
    >
      <div className="scenario-card-icon">
        <img
          src={scenario.icon}
          alt={scenario.title}
          style={{ width: isSelected ? "48px" : "32px", height: isSelected ? "48px" : "32px" }}
        />
      </div>

      {isSelected ? (
        <>
          <h2 className="scenario-card-title">{t(scenario.id)}</h2>
          <span className="scenario-card-tag">{t('scenario_tag')}</span>

          <ul className="scenario-card-list">
            {(t(`scenario_items.${scenario.id}`, { returnObjects: true }) || scenario.items).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <button className="scenario-card-arrow" onClick={handleArrowClick}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </>
      ) : (

        <span className="scenario-card-text">{t(scenario.id)}</span>
      )}
    </motion.div>
  );
};

export default ScenarioCard;
