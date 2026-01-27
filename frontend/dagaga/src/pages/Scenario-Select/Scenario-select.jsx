import { useState } from "react";
import { Container } from "react-bootstrap";
import ScenarioCard from "../../components/scenario-select/ScenarioCard";
import "./Scenario-select.css";
import study_tiger from "../../assets/characters/study_tiger.png";
import book from "../../assets/icons/book.png";
import conversation_bubble from "../../assets/icons/conversation_bubble.png";
import hospital_cross from "../../assets/icons/hospital_cross.png";

const ScenarioSelect = () => {
  const [selectedScenario, setSelectedScenario] = useState("학습");

  const scenarios = [
    {
      id: "학습",
      label: "학습",
      title: "학교에서",
      tag: "학습내용",
      icon: book,
      items: [
        "실생 도입 (분류기 조정 및 집반직인 평가)",
        "정서 및 생활 습관 (특질성 확인)",
        "긍우 관계 (부모님이 파악하는 사회성)",
        "학습 태도 및 환경",
        "매체 사용 및 향후 지도 방향"
      ]
    },
    {
      id: "자기소개",
      label: "자기소개",
      title: "자기소개",
      tag: "자기소개",
      icon: conversation_bubble,
      items: [
        "이름과 나이",
        "좋아하는 것",
        "취미",
        "특기"
      ]
    },
    {
      id: "병원에서",
      label: "병원에서",
      title: "병원에서",
      tag: "병원내용",
      icon: hospital_cross,
      items: [
        "증상 설명하기",
        "의사와 대화하기",
        "약 처방받기",
        "건강 관리하기"
      ]
    }
  ];

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
