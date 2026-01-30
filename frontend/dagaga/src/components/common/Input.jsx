import React from 'react';
import './Input.css';

const Input = ({ type = 'text', className = '', ...props }) => {
    return (
        <input
            type={type}
            className={`common-input ${className}`}
            {...props}
        />
    );
};

export default Input;
