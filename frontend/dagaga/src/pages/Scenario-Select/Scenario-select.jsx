import { useState } from "react";
import { Container } from "react-bootstrap";
import ScenarioCard from "../../components/scenario-select/ScenarioCard";
import { scenarios } from "../../data/scenarios";
import "./Scenario-select.css";
import study_tiger from "../../assets/characters/study_tiger.png";

const ScenarioSelect = () => {
  const [selectedScenario, setSelectedScenario] = useState("학습");

  return (
    <Container fluid className="scenario-select-container">
      <div className="scenario-content">
        {/* Tiger mascot - 4 columns */}
        <div className="scenario-mascot">
          <img src={study_tiger} alt="study_tiger" className="mascot-image" />
        </div>

        {/* Scenario cards - 8 columns */}
        <div className="scenario-cards-wrapper">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              isSelected={selectedScenario === scenario.id}
              onClick={() => setSelectedScenario(scenario.id)}
            />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default ScenarioSelect;
