import { motion } from "framer-motion";
import "./CategoryPanel.css";

const CategoryPanel = ({ scenario }) => {
  if (!scenario) return null;

  return (
    <motion.div 
      className="category-panel"
      layoutId={`scenario-card-${scenario.id}`}
    >
      <div className="category-icon">
        <img src={scenario.icon} alt={scenario.title} />
      </div>
      <h2 className="category-title">{scenario.title}</h2>
      <span className="category-tag">{scenario.tag}</span>
      <ul className="category-items">
        {scenario.items.map((item, index) => (
          <li key={index}>-{item}</li>
        ))}
      </ul>
    </motion.div>
  );
};

export default CategoryPanel;
