import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./ScenarioCard.css";

const ScenarioCard = ({ scenario, isSelected, onClick }) => {
  const navigate = useNavigate();

  const handleArrowClick = (e) => {
    e.stopPropagation();
    navigate(`/problem-select/${scenario.id}`);
  };

  return (
    <motion.div 
      className={`scenario-card ${isSelected ? "expanded" : "collapsed"}`} 
      onClick={onClick}
      layout
      layoutId={isSelected ? `scenario-card-${scenario.id}` : undefined}
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
          <h2 className="scenario-card-title">{scenario.title}</h2>
          <span className="scenario-card-tag">{scenario.tag}</span>

          <ul className="scenario-card-list">
            {scenario.items.map((item, index) => (
              <li key={index}>-{item}</li>
            ))}
          </ul>

          <button className="scenario-card-arrow" onClick={handleArrowClick}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </>
      ) : (
        <span className="scenario-card-text">{scenario.label}</span>
      )}
    </motion.div>
  );
};

export default ScenarioCard;
