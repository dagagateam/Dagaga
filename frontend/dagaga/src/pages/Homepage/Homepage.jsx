import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import IntroRotateText from '../../components/Homepage/IntroRotateText/IntroRotateText';
import CardSwap, { Card } from '../../components/Homepage/CardSwawp/CardSwap';
import TargetCursor from '../../components/Homepage/TargetCursorCard/TargetCursorCard';
import './Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  // Text rotation items for top left
  const textItems = [
    "한국어",
    "소통",
    "정보 확인",
  ];

  // Synchronization effect - Single source of truth
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % textItems.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [textItems.length]);

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <div className="homepage-container">
      <TargetCursor 
        spinDuration={5}
        hideDefaultCursor={true}
        parallaxOn={true}
        hoverDuration={0.2}
      />
      {/* Hero Section */}
      <div className="homepage-hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-static-text">다가가와 함께</h1>
            <IntroRotateText
              texts={textItems}
              activeIndex={activeIndex}
              mainClassName="hero-rotating-box"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitBy="words"
              splitLevelClassName="overflow-hidden"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            />
          </div>
          
          <div 
            className="hero-right" 
            style={{ height: '350px', width: '100%', position: 'relative', display: 'flex', justifyContent: 'center' }}
          >
            <CardSwap
              triggerIndex={activeIndex}
              cardDistance={40}
              verticalDistance={40}
              pauseOnHover={false}
              width={480}
              height={270}
            >
              <Card style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5D5D 100%)' }}>
                <h3>📚 학습</h3>
                <p>재미있는 시나리오를 통해<br/>한국어를 배워보세요</p>
              </Card>
              <Card style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7AF 100%)' }}>
                <h3>💬 소통</h3>
                <p>다른 학습자들과<br/>자유롭게 대화하세요</p>
              </Card>
              <Card style={{ background: 'linear-gradient(135deg, #45B7D1 0%, #3CA5BD 100%)' }}>
                <h3>📰 정보</h3>
                <p>한국 생활에 필요한<br/>다양한 정보를 얻으세요</p>
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>

      {/* Bottom Section: Navigation Cards */}
      <div className="homepage-navigation">
        <div className="nav-card cursor-target" onClick={() => handleNavClick('/ScenarioSelect')}>
          <div className="nav-card-icon">📚</div>
          <h3>학습하기</h3>
          <p>다양한 시나리오로<br/>한국어를 연습하세요</p>
        </div>
        <div className="nav-card cursor-target" onClick={() => handleNavClick('/Community/Chat')}>
          <div className="nav-card-icon">💬</div>
          <h3>커뮤니티</h3>
          <p>다른 학습자들과<br/>이야기를 나누세요</p>
        </div>
        <div className="nav-card cursor-target" onClick={() => handleNavClick('/Community/Info')}>
          <div className="nav-card-icon">📰</div>
          <h3>정보공유</h3>
          <p>유용한 한국 생활 정보를<br/>확인하세요</p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
