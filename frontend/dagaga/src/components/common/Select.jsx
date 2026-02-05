import React from 'react';
import { Dropdown } from 'react-bootstrap';
import './Select.css';
import { useTranslation } from 'react-i18next';

const Select = ({ value, options, onChange, placeholder, className = '' }) => {
    const { t } = useTranslation();
    const effectivePlaceholder = placeholder || t('select_placeholder');

    return (
        <Dropdown className={`common-select ${className}`} onSelect={onChange}>
            <Dropdown.Toggle variant="light" className="common-select-toggle">
                {value || effectivePlaceholder}
            </Dropdown.Toggle>
            <Dropdown.Menu className="common-select-menu">
                {options.map((option) => (
                    <Dropdown.Item eventKey={option} key={option}>
                        {option}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default Select;
