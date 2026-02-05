import React from 'react';
import './ProblemLoading.css';
import loadingGif from '../../../assets/loading/loading 1.gif';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const ProblemLoading = ({ text }) => {
  const { t } = useTranslation();
  const displayText = text || t('problem_loading');

  return (
    <Container fluid className="problem-loading-container">
      <div className="problem-loading-card">
        <img src={loadingGif} alt="Loading" className="loading-gif" />
        <div className="problem-loading-text">{displayText}</div>
      </div>
    </Container>
  );
};

export default ProblemLoading;
