import React from 'react';
import Input from './Input';
import { useTranslation } from 'react-i18next';

const ArrivalDateInput = ({ value, onChange, name = 'arrivalDate', className = '', ...props }) => {
    const { t } = useTranslation();
    return (
        <div className={`arrival-date-input ${className}`}>
            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#333', marginBottom: '5px', display: 'block' }}>
                {t('entry_date')}
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
