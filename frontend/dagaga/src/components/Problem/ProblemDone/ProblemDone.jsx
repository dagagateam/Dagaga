import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import './ProblemDone.css';

const ProblemDone = ({ onRetry, onReturn }) => {
  const { t } = useTranslation();

  useEffect(() => {
    // Trigger confetti when component mounts
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    // Frame loops to fire random confetti
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6CC551', '#ffffff', '#FFD700'] // Custom colors causing celebration
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6CC551', '#ffffff', '#FFD700']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Also a big burst at center
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="problem-done-container">
      <div className="problem-done-message">
        {t('problem_done_msg')}
      </div>
      <div className="problem-done-buttons">
        <button className="done-button return" onClick={onReturn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('return')}
        </button>
        <button className="done-button retry" onClick={onRetry}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4V9H4.5M20 20V15H19.5M20 9C20 9 16.5 4 12 4C7.5 4 4 9 4 9M4 15C4 15 7.5 20 12 20C16.5 20 20 15 20 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('try_again')}
        </button>
      </div>
    </div>
  );
};

export default ProblemDone;
