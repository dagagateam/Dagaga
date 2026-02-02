import "./ScenarioButton.css";

const ScenarioButton = ({ label, isSelected, onClick }) => {
  return (
    <button
      className={`scenario-button ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <span className="scenario-button-text">{label}</span>
    </button>
  );
};

export default ScenarioButton;
