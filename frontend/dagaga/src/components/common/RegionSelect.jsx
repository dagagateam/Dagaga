import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { area0, allAreas } from '../../data/regionData';
import './RegionSelect.css'; // Optional styling
import { useTranslation } from 'react-i18next';

const RegionSelect = ({ sido, gugun, onSidoChange, onGugunChange }) => {
    const [gugunList, setGugunList] = useState([]);

    const { t } = useTranslation();

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
                    {(sido && sido !== '시/도 선택') ? sido : t('select_sido')}
                </Dropdown.Toggle>
                <Dropdown.Menu className="region-menu">
                    {area0.map((area) => (
                        <Dropdown.Item eventKey={area} key={area}>
                            {area === '시/도 선택' ? t('select_sido') : area}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>

            <Dropdown className="region-dropdown" onSelect={handleGugunSelect}>
                <Dropdown.Toggle variant="light" className="region-toggle">
                    {(gugun && gugun !== '구/군 선택') ? gugun : t('select_gugun')}
                </Dropdown.Toggle>
                <Dropdown.Menu className="region-menu">
                    {gugunList.length > 0 ? (
                        gugunList.map((area) => (
                            <Dropdown.Item eventKey={area} key={area}>
                                {area === '구/군 선택' ? t('select_gugun') : area}
                            </Dropdown.Item>
                        ))
                    ) : (
                        <Dropdown.Item disabled>{t('select_gugun')}</Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};

export default RegionSelect;
