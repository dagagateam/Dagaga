import { useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import CategoryPanel from "../../components/problem-select/CategoryPanel";
import ProblemCard from "../../components/problem-select/ProblemCard";
import { scenarios } from "../../data/scenarios";
import "./Problem-select.css";

const ProblemSelect = () => {
  const { categoryId } = useParams();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Find the scenario based on categoryId
  const scenario = scenarios.find(s => s.id === categoryId);

  // Sample problem data
  const problems = [
    { id: 1, text: "아이가 특별히 어려워하는 과목이 있나요?" },
    { id: 2, text: "아이가 누구랑 친한가요?" },
    { id: 3, text: "아이가 좋아하는 활동은 무엇인가요?" },
    { id: 4, text: "아이의 학습 태도는 어떠한가요?" },
    { id: 5, text: "아이가 매체를 얼마나 사용하나요?" },
  ];

  // Handle wheel scroll
  const handleWheel = (e) => {
    e.preventDefault();
    setScrollOffset(prev => prev + e.deltaY * 0.2);
  };

  // Handle card click
  const handleCardClick = (problemId) => {
    setSelectedCardId(problemId === selectedCardId ? null : problemId);
  };

  const totalCards = problems.length;

  return (
    <Container fluid className="problem-select-container">
      <div className="problem-select-layout">
        <CategoryPanel scenario={scenario} />

        <div className="problem-wheel" onWheel={handleWheel}>
          {problems.map((problem, index) => {
            // Cards spaced 15 degrees apart
            const rotation = index * 15 + scrollOffset;
            const isActive = selectedCardId === problem.id;

            return (
              <ProblemCard
                key={problem.id}
                problemNumber={problem.id}
                problemText={problem.text}
                rotation={rotation}
                isActive={isActive}
                onClick={() => handleCardClick(problem.id)}
              />
            );
          })}
        </div>
      </div>
    </Container>
  );
};

export default ProblemSelect;
