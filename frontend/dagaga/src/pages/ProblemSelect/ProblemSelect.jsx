import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "react-bootstrap";
import CategoryPanel from "../../components/ProblemSelect/CategoryPanel";
import ProblemCard from "../../components/ProblemSelect/ProblemCard";
import { scenarios } from "../../data/scenarios";
import { fetchCategoryStages } from "../../api/learningApi";
import { useUserStore } from "../../store/userStore";
import "./ProblemSelect.css";

const ProblemSelect = () => {
  const { categoryId } = useParams();
  const { t } = useTranslation();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const wheelRef = useRef(null);

  // Get user language preference
  const userLang = useUserStore((state) => state.user?.viewLangCode || state.language);

  // Find the scenario based on categoryId
  const scenario = scenarios.find(s => s.id === categoryId);

  // Fetch problems from API
  useEffect(() => {
    const loadProblems = async () => {
      if (!categoryId) return;

      setIsLoading(true);
      try {
        const response = await fetchCategoryStages(categoryId);
        // DEBUG: API Full Response
        // console.log("API Full Response:", response);
        if (response.data && response.data.success) {
          const basicProblems = response.data.data;
          
          const formattedProblems = basicProblems.map((item) => ({
            id: item.questionId,
            ...item,
            // Assuming viQuestion and zhQuestion now come directly from fetchCategoryStages
            viQuestion: item.viQuestion || item.viQuestions, 
            zhQuestion: item.zhQuestion || item.zhQuestions,
            pronunciations: item.pronunciation_guide || item.pronunciationGuide || [],
          }));

          setProblems(formattedProblems);
        } else {
          // Fallback
          console.warn("Failed to fetch problems, response unsuccessful:", response.data);
          const translatedProblems = t(`scenario_problems.${scenario.id}`, { returnObjects: true });
          const fallbackProblems = Array.isArray(translatedProblems)
            ? translatedProblems.map((text, idx) => ({ id: idx + 1, text, wordTranslations: [] }))
            : (scenario?.problems || []);
          setProblems(fallbackProblems);
        }
      } catch (error) {
        console.error("Error fetching problems:", error);
        const translatedProblems = t(`scenario_problems.${scenario.id}`, { returnObjects: true });
        const fallbackProblems = Array.isArray(translatedProblems)
          ? translatedProblems.map((text, idx) => ({ id: idx + 1, text, wordTranslations: [] }))
          : (scenario?.problems || []);
        setProblems(fallbackProblems);
      } finally {
        setIsLoading(false);
      }
    };

    loadProblems();
  }, [categoryId, scenario, t]);

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
    return <div>{t('category_not_found')}</div>;
  }

  return (
    <Container fluid className="problem-select-container">
      <div className="problem-select-layout">
        <CategoryPanel scenario={scenario} />

        <div className="problem-wheel" ref={wheelRef}>
          {isLoading ? (
            <div className="loading-message">{t('loading')}</div>
          ) : (
            problems.map((problem, index) => {
              // Cards spaced 15 degrees apart
              const rotation = index * 15 + scrollOffset;
              const isActive = selectedCardId === problem.id;
              
              // Determine display text based on API's viewQuestions field
              // viewQuestions contains the question in the user's native language
              let displayText = problem.viewQuestions || problem.questionText || problem.text;

              return (
                <ProblemCard
                  key={problem.id}
                  problemNumber={index + 1}
                  problemText={displayText}
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
