import { useRef, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import IntroRotateText from '../../components/Homepage/IntroRotateText/IntroRotateText';
import CardSwap, { Card } from '../../components/Homepage/CardSwawp/CardSwap';
import RouteCard from '../../components/Homepage/RouteCard/RouteCard';

import learningImg from '../../assets/screenshots/scenario_select_screenshot_1.png';
import chatImg from '../../assets/screenshots/chat_screenshot_1.png';
import infoImg from '../../assets/screenshots/Info_screen_screenshot_1.png';
import logo from '../../assets/icons/logo.png';

import './Homepage.css';

const Homepage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  // Text rotation items for top left
  const textItems = [
    t('lang_ko'),
    t('communication_rotation'),
    t('info_rotation'),
  ];

  // 동기화 효과 - 단일 진실 공급원 (Single source of truth)
  useEffect(() => {
    let interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % textItems.length);
    }, 3500);

    // 탭 가시성 변경 감지 - 브라우저 타이머 스로틀링 문제 해결
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 탭이 숨겨지면 인터벌 정리
        clearInterval(interval);
      } else {
        // 탭이 다시 보이면 인터벌 재시작하여 동기화 유지
        clearInterval(interval);
        interval = setInterval(() => {
          setActiveIndex((prev) => (prev + 1) % textItems.length);
        }, 3500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [textItems.length]);

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <div className="homepage-container">

      {/* Hero Section */}
      <div className="homepage-hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-static-text">
              <Trans i18nKey="with_dgg" key={i18n.language}>
                <img src={logo} className="hero-logo-img" alt="Dagaga" />
              </Trans>
            </h1>
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
                <h3>📚 {t('nav_learning')}</h3>
                <p>{t('learning_swapcard')}</p>
              </Card>
              <Card style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7AF 100%)' }}>
                <h3>💬 {t('communication_rotation')}</h3>
                <p>{t('community_swapcard')}</p>
              </Card>
              <Card style={{ background: 'linear-gradient(135deg, #45B7D1 0%, #3CA5BD 100%)' }}>
                <h3>📰 {t('info_rotation')}</h3>
                <p>{t('info_swapcard')}</p>
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>

      {/* Bottom Section: Navigation Cards */}
      <div className="homepage-navigation">
        <RouteCard
          title={t('learning_navcard')}
          body={t('learning_comment_navcard')}
          onClick={() => handleNavClick('/ScenarioSelect')}
          image={learningImg}
        />
        <RouteCard
          title={t('info_navcard')}
          body={t('info_comment_navcard')}
          onClick={() => handleNavClick('/Community/Info')}
          image={infoImg}
        />
        <RouteCard
          title={t('nav_community')}
          body={t('community_comment_navcard')}
          onClick={() => handleNavClick('/Community/Chat')}
          image={chatImg}
        />
      </div>
    </div>
  );
};

export default Homepage;
