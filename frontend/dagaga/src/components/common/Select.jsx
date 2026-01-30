import React from 'react';
import { Dropdown } from 'react-bootstrap';
import './Select.css';

const Select = ({ value, options, onChange, placeholder = '선택해주세요', className = '' }) => {
    return (
        <Dropdown className={`common-select ${className}`} onSelect={onChange}>
            <Dropdown.Toggle variant="light" className="common-select-toggle">
                {value || placeholder}
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
