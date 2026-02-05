import React from 'react';
import turtleIcon from '../../../assets/icons/turtle.png';
import './ProblemRepeatSlow.css';
import { useTranslation } from 'react-i18next';

const ProblemRepeatSlow = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button className="repeat-slow-button" onClick={onClick} title={t('listen_slowly')}>
      <img src={turtleIcon} alt={t('slow')} className="repeat-slow-icon" />
    </button>
  );
};

export default ProblemRepeatSlow;
