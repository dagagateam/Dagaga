import React from 'react';
import { Card } from 'react-bootstrap';
import heartIcon from '../../assets/icons/heart.png';
import unheartIcon from '../../assets/icons/unheart.png';
import bookmarkedIcon from '../../assets/icons/bookmark.png';
import unbookmarkIcon from '../../assets/icons/unbookmark.png';
import './saved-news-card.css';

const SavedNewsCard = ({ 
  title, 
  orgName, 
  applicationPeriod, 
  progressPeriod, 
  isExpired, 
  isLiked, 
  isBookmarked,
  onToggleLike,
  onToggleBookmark 
}) => {
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
              <button className="saved-news-icon-btn" onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(); }}>
                <img
                  src={isLiked ? heartIcon : unheartIcon}
                  alt="Like"
                  className="saved-news-icon-img"
                />
              </button>
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
              <span className="saved-news-period-label">접수</span>
              <span className="saved-news-period-date">| {applicationPeriod}</span>
            </div>
            <div className="saved-news-period-row">
              <span className="saved-news-period-label">진행</span>
              <span className="saved-news-period-date">| {progressPeriod}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SavedNewsCard;
