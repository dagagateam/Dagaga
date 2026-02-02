import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import CategoryPanel from "../../components/ProblemSelect/CategoryPanel";
import ProblemCard from "../../components/ProblemSelect/ProblemCard";
import { scenarios } from "../../data/scenarios";
import { fetchCategoryStages } from "../../api/learningApi";
import "./ProblemSelect.css";

const ProblemSelect = () => {
  const { categoryId } = useParams();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const wheelRef = useRef(null);

  // Find the scenario based on categoryId
  const scenario = scenarios.find(s => s.id === categoryId);

  // Fetch problems from API
  useEffect(() => {
    const loadProblems = async () => {
      if (!categoryId) return;
      
      setIsLoading(true);
      try {
        const response = await fetchCategoryStages(categoryId);
        console.log("API Full Response:", response);
        if (response.data && response.data.success) {
          // Map API data to component format if necessary
          // API returns: { questionId, category, questionText, exampleAnswer, orderIndex }
          // Component expects: { id, text }
          setProblems(response.data.data.map(item => ({
            id: item.questionId,
            text: item.questionText,
            // Map pronunciation_guide (docs) or pronunciationGuide (camelCase) to pronunciations
            pronunciations: item.pronunciation_guide || item.pronunciationGuide || [],
            ...item
          })));
        } else {
          // Fallback to static data if API fails or returns empty
          console.warn("Failed to fetch problems, response unsuccessful:", response.data);
          setProblems(scenario?.problems || []);
        }
      } catch (error) {
        console.error("Error fetching problems:", error);
        setProblems(scenario?.problems || []);
      } finally {
        setIsLoading(false);
      }
    };

    loadProblems();
  }, [categoryId, scenario]);

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

  if (!scenario) {
    return <div>존재하지 않는 카테고리입니다.</div>;
  }

  return (
    <Container fluid className="problem-select-container">
      <div className="problem-select-layout">
        <CategoryPanel scenario={scenario} />

        <div className="problem-wheel" ref={wheelRef}>
          {isLoading ? (
            <div className="loading-message">로딩 중...</div>
          ) : (
            problems.map((problem, index) => {
              // Cards spaced 15 degrees apart
              const rotation = index * 15 + scrollOffset;
              const isActive = selectedCardId === problem.id;

              return (
                <ProblemCard
                  key={problem.id}
                  problemNumber={index + 1}
                  problemText={problem.text}
                  categoryId={categoryId} // Pass categoryId for navigation
                  words={problem.words}
                  pronunciations={problem.pronunciations}
                  rotation={rotation}
                  isActive={isActive}
                  onClick={() => handleCardClick(problem.id)}
                  translations={problem.wordTranslations} // from API response map
                  stages={problems} // Pass full list for progress bar
                />
              );
            })
          )}
        </div>
      </div>
    </Container>
  );
};

export default ProblemSelect;
