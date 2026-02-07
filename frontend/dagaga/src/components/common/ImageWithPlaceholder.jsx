import React, { useState } from 'react';
import './ImageWithPlaceholder.css';

const ImageWithPlaceholder = ({ src, alt, className, style, ...props }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`image-placeholder-wrapper ${className}`} style={style}>
            {!loaded && (
                <div className="skeleton-loader" />
            )}
            <img
                src={src}
                alt={alt}
                className={`real-image ${loaded ? 'loaded' : ''}`}
                onLoad={() => setLoaded(true)}
                onError={() => {
                    setLoaded(true);
                    setError(true);
                }}
                loading="lazy"
                {...props}
            />
        </div>
    );
};

export default ImageWithPlaceholder;
