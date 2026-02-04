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
import logo from '../../assets/icons/logo2.png';

import './Homepage.css';

const Homepage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  // Text rotation items for top left
  const textItems = [
    t('lang_ko'),
    t('communication_rotation'),
    t('info_rotation'),
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

      {/* Hero Section */}
      <div className="homepage-hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-static-text">
              <Trans i18nKey="with_dgg">
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
          title={t('nav_community')}
          body={t('community_comment_navcard')}
          onClick={() => handleNavClick('/Community/Chat')}
          image={chatImg}
        />
        <RouteCard
          title={t('info_navcard')}
          body={t('info_comment_navcard')}
          onClick={() => handleNavClick('/Community/Info')}
          image={infoImg}
        />
      </div>
    </div>
  );
};

export default Homepage;
