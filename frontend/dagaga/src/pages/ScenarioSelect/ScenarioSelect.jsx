import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import ScenarioCard from "../../components/ScenarioSelect/ScenarioCard";
import { scenarios } from "../../data/scenarios";
import "./ScenarioSelect.css";
import study_tiger from "../../assets/characters/study_tiger2.png";

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
            <img src={study_tiger} alt="study_tiger" className="scenario-mascot-image" />
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
