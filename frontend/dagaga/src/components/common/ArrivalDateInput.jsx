import React from 'react';
import Input from './Input';

const ArrivalDateInput = ({ value, onChange, name = 'arrivalDate', className = '', ...props }) => {
    return (
        <div className={`arrival-date-input ${className}`}>
            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#333', marginBottom: '5px', display: 'block' }}>
                한국에 온 날짜
            </label>
            <Input
                type="date"
                name={name}
                value={value}
                onChange={onChange}
                max={new Date().toISOString().split('T')[0]}
                {...props}
            />
        </div>
    );
};

export default ArrivalDateInput;
