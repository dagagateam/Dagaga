import React from 'react';
import './SocialButton.css';
import googleIcon from '../../assets/icons/google.png';
import lineIcon from '../../assets/icons/line.png';

const SocialButton = ({ provider, children, onClick, className = '', ...props }) => {
    const getIcon = () => {
        switch (provider) {
            case 'google':
                return googleIcon;
            case 'line':
                return lineIcon;
            default:
                return null;
        }
    };

    const icon = getIcon();

    return (
        <button 
            className={`social-btn ${provider} ${className}`} 
            onClick={onClick}
            {...props}
        >
            {icon && <img src={icon} alt={provider} />}
            {children}
        </button>
    );
};

export default SocialButton;
