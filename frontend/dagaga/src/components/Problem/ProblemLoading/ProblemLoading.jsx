import React from 'react';
import { Container } from 'react-bootstrap';
import loadingGif from '../../../assets/loading/loading 1.gif';
import './ProblemLoading.css';

const ProblemLoading = ({ text = "로딩중..." }) => {
  return (
    <Container fluid className="problem-loading-container">
      <div className="problem-loading-card">
        <img src={loadingGif} alt="Loading" className="loading-gif" />
        <div className="problem-loading-text">{text}</div>
      </div>
    </Container>
  );
};

export default ProblemLoading;
