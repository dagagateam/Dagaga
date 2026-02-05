import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import ScenarioCard from "../../components/ScenarioSelect/ScenarioCard";
import { scenarios } from "../../data/scenarios";
import "./ScenarioSelect.css";
import tiger_waving_crop from "../../assets/characters/tiger_waving_crop.gif";

const ScenarioSelect = () => {
  const [selectedScenario, setSelectedScenario] = useState(() => {
    return sessionStorage.getItem("selectedScenario") || "학습";
  });

  useEffect(() => {
    sessionStorage.setItem("selectedScenario", selectedScenario);
  }, [selectedScenario]);

  const handleScenarioSelect = (id) => {
    setSelectedScenario(id);
  };

  return (
    <div>
      <Container fluid className="scenario-select-container">
        <div className="scenario-content">
          {/* Tiger mascot - 4 columns */}
          <div className="scenario-mascot">
            <img src={tiger_waving_crop} alt="tiger_waving_crop" className="scenario-mascot-image" />
          </div>

          {/* Scenario cards - 8 columns */}
          <div className="scenario-cards-wrapper">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isSelected={selectedScenario === scenario.id}
                onSelect={handleScenarioSelect}
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ScenarioSelect;
