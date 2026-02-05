import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';
import errorTiger from '../../assets/characters/error_tiger.png';

import { useTranslation } from 'react-i18next';

const NotFound = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-inner">
                <div className="not-found-image">
                    <img src={errorTiger} alt="Page not found" />
                </div>

                <div className="not-found-text-content">
                    <h1 className="not-found-title">Not Found</h1>

                    <div className="not-found-desc">
                        <p className="desc-main">{t('not_found_title')}</p>
                        <p className="desc-sub">
                            {t('not_found_desc')}
                        </p>
                    </div>

                    <button className="go-home-link" onClick={() => navigate('/')}>
                        {t('go_home')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
