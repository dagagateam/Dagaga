import { useState, useRef, useEffect, useCallback } from "react";
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
  const wheelRef = useRef(null);

  // Find the scenario based on categoryId
  const scenario = scenarios.find(s => s.id === categoryId);

  // Get problems from the scenario data
  const problems = scenario?.problems || [];

  // Handle wheel scroll with limits
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const cardSpacing = 15; // degrees between cards
    const maxOffset = 0; // First card can't go past its starting position
    const minOffset = -((problems.length - 1) * cardSpacing); // Last card limit

    setScrollOffset(prev => {
      const newOffset = prev - e.deltaY * 0.2;
      return Math.max(minOffset, Math.min(maxOffset, newOffset));
    });
  }, [problems.length]);

  // Attach non-passive wheel event listener to prevent default scroll
  useEffect(() => {
    const wheelElement = wheelRef.current;
    if (wheelElement) {
      wheelElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        wheelElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  // Handle card click
  const handleCardClick = (problemId) => {
    setSelectedCardId(problemId === selectedCardId ? null : problemId);
  };

  const totalCards = problems.length;

  return (
    <Container fluid className="problem-select-container">
      <div className="problem-select-layout">
        <CategoryPanel scenario={scenario} />

        <div className="problem-wheel" ref={wheelRef}>
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
