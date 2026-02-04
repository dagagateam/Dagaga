import React from 'react';
import './LocationBadge.css';

const LocationBadge = ({ region, className = '' }) => {
    return (
        <div className={`location-badge ${className}`}>
            <span className="pin-icon">📍</span> {region}
        </div>
    );
};

export default LocationBadge;
