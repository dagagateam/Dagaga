import React from 'react';
import './problem-done.css';

const ProblemDone = ({ onRetry, onReturn }) => {
  return (
    <div className="problem-done-container">
      <div className="problem-done-message">
        잘 말하셨어요! 조금씩 느는 것 같아요
      </div>
      <div className="problem-done-buttons">
        <button className="done-button return" onClick={onReturn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          돌아가기
        </button>
        <button className="done-button retry" onClick={onRetry}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4V9H4.5M20 20V15H19.5M20 9C20 9 16.5 4 12 4C7.5 4 4 9 4 9M4 15C4 15 7.5 20 12 20C16.5 20 20 15 20 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          다시 한번 하기
        </button>
      </div>
    </div>
  );
};

export default ProblemDone;
