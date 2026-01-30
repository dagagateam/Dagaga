import React from 'react';
import './Button.css';

const Button = ({ children, onClick, type = 'button', className = '', ...props }) => {
    return (
        <button
            type={type}
            className={`common-btn ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
