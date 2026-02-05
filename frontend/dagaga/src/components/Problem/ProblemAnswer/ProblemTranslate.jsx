import React from 'react';
import './ProblemTranslate.css';
import { useTranslation } from 'react-i18next';

const ProblemTranslate = ({ active, onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      className={`problem-translate-btn ${active ? 'active' : ''}`}
      onClick={onClick}
      title={t('view_translation')}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Text bubble 1: 文 */}
        <path d="M4 4h10v10H4z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        <text x="9" y="10" fill="white" fontSize="9" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="middle">文</text>

        {/* Text bubble 2: 한 */}
        <path d="M10 10h10v10H10z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        <text x="15" y="16" fill="white" fontSize="8" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="middle">한</text>
      </svg>
    </button>
  );
};

export default ProblemTranslate;
