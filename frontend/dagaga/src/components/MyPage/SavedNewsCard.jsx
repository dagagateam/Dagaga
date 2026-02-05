import React from 'react';
import { Card } from 'react-bootstrap';
import bookmarkedIcon from '../../assets/icons/bookmark.png';
import unbookmarkIcon from '../../assets/icons/unbookmark.png';
import './SavedNewsCard.css';
import { useTranslation } from 'react-i18next';

const SavedNewsCard = ({
  title,
  orgName,
  applicationPeriod,
  progressPeriod,
  isExpired,
  isBookmarked,
  onToggleBookmark
}) => {
  const { t } = useTranslation();
  return (
    <Card className="saved-news-card">
      <div className="saved-news-inner">
        {/* Content Only - Mini Version */}
        <div className="saved-news-content">
          <div className="saved-news-meta-top">
            <div className="saved-news-org">
              <span className="saved-news-org-logo">Dagaga</span>
              <span className="saved-news-org-name">{orgName}</span>
            </div>
            <div className="saved-news-actions">
              <button className="saved-news-icon-btn" onClick={(e) => { e.stopPropagation(); onToggleBookmark && onToggleBookmark(); }}>
                <img
                  src={isBookmarked ? bookmarkedIcon : unbookmarkIcon}
                  alt="Bookmark"
                  className="saved-news-icon-img"
                />
              </button>
            </div>
          </div>

          <h3 className="saved-news-title">{title}</h3>

          <div className="saved-news-periods">
            <div className="saved-news-period-row">
              <span className="saved-news-period-label">{t('status_application')}</span>
              <span className="saved-news-period-date">| {applicationPeriod}</span>
            </div>
            <div className="saved-news-period-row">
              <span className="saved-news-period-label">{t('status_progress')}</span>
              <span className="saved-news-period-date">| {progressPeriod}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SavedNewsCard;
