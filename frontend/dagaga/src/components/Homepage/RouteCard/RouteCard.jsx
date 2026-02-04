import React from 'react';
import './RouteCard.css';

const RouteCard = ({ title, body, onClick, image }) => {
  return (
    <div className="route-card" onClick={onClick}>
      <div className="route-card-bg" style={{ backgroundImage: `url(${image})` }}></div>
      <div className="route-card-content">
        <h3 className="route-card-title">{title}</h3>
        <p className="route-card-body">{body}</p>
      </div>
    </div>
  );
};

export default RouteCard;
