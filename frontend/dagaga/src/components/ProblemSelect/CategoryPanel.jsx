import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "./CategoryPanel.css";

const CategoryPanel = ({ scenario }) => {
  const { t } = useTranslation();

  if (!scenario) return null;

  return (
    <motion.div 
      className="category-panel"
      layoutId={`scenario-card-${scenario.id}`}
    >
      <div className="category-content">
        <div className="category-icon">
          <img src={scenario.icon} alt={scenario.title} />
        </div>
        <h2 className="category-title">{t(scenario.id)}</h2>
        <span className="category-tag">{t('scenario_tag')}</span>
        <ul className="category-items">
          {(t(`scenario_items.${scenario.id}`, { returnObjects: true }) || scenario.items).map((item, index) => (
            <li key={index} className="category-item-li">{item}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default CategoryPanel;
