import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { area0, allAreas } from '../../data/regionData';
import './RegionSelect.css'; // Optional styling

const RegionSelect = ({ sido, gugun, onSidoChange, onGugunChange }) => {
    const [gugunList, setGugunList] = useState([]);

    useEffect(() => {
        if (sido && sido !== '시/도 선택') {
            const index = area0.indexOf(sido);
            if (index > 0 && allAreas[index]) {
                setGugunList(allAreas[index]);
            } else {
                setGugunList([]);
            }
        } else {
            setGugunList([]);
        }
    }, [sido]);

    const handleSidoSelect = (eventKey) => {
        onSidoChange(eventKey);
        // onGugunChange will be handled by parent resetting it or us calling it?
        // Usually parent resets gugun when sido changes.
    };

    const handleGugunSelect = (eventKey) => {
        onGugunChange(eventKey);
    };

    return (
        <div className="region-selects">
            <Dropdown className="region-dropdown" onSelect={handleSidoSelect}>
                <Dropdown.Toggle variant="light" className="region-toggle">
                    {sido || '시/도 선택'}
                </Dropdown.Toggle>
                <Dropdown.Menu className="region-menu">
                    {area0.map((area) => (
                        <Dropdown.Item eventKey={area} key={area}>{area}</Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>

            <Dropdown className="region-dropdown" onSelect={handleGugunSelect}>
                <Dropdown.Toggle variant="light" className="region-toggle">
                    {gugun || '구/군 선택'}
                </Dropdown.Toggle>
                <Dropdown.Menu className="region-menu">
                    {gugunList.length > 0 ? (
                        gugunList.map((area) => (
                            area !== '구/군 선택' && <Dropdown.Item eventKey={area} key={area}>{area}</Dropdown.Item>
                        ))
                    ) : (
                        <Dropdown.Item disabled>구/군 선택</Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};

export default RegionSelect;
